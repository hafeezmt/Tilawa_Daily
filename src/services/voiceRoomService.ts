import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { UserProfile, QueueMember, ChatMessage } from '../types';

export interface RoomParticipant {
  peerId: string;
  user: UserProfile;
  isSpeaking: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
}

export type RoomEventCallback = {
  onParticipantJoin?: (participant: RoomParticipant) => void;
  onParticipantLeave?: (peerId: string) => void;
  onParticipantsUpdate?: (participants: RoomParticipant[]) => void;
  onQueueUpdate?: (queue: QueueMember[]) => void;
  onChatMessage?: (msg: ChatMessage) => void;
  onActiveReciterChange?: (reciter: { name: string; hizb: number; surah: string }) => void;
  onAudioStream?: (peerId: string, stream: MediaStream) => void;
};

// Constant Room Name for Tilawa Daily
export const TILAWA_MAIN_ROOM = 'tilawa-daily-halaqah-main-circle';

class VoiceRoomManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private calls: Map<string, MediaConnection> = new Map();
  private dataConnections: Map<string, DataConnection> = new Map();
  private participants: Map<string, RoomParticipant> = new Map();
  private callbacks: RoomEventCallback = {};
  public myPeerId: string = '';
  public isConnected: boolean = false;

  public init(user: UserProfile, callbacks: RoomEventCallback): Promise<string> {
    this.callbacks = callbacks;
    return new Promise((resolve, reject) => {
      // Generate clean deterministic or random peer ID
      const sanitizedName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      const peerId = `tilawa-${sanitizedName}-${uniqueSuffix}`;

      // Connect to free public WebRTC cloud broker
      const newPeer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }
      });

      newPeer.on('open', (id) => {
        this.myPeerId = id;
        this.peer = newPeer;
        this.isConnected = true;

        // Register self as participant
        const selfParticipant: RoomParticipant = {
          peerId: id,
          user: user,
          isSpeaking: false,
          isMuted: true,
          isHandRaised: false,
        };
        this.participants.set(id, selfParticipant);
        this.broadcastParticipants();

        // Listen for incoming voice calls & data connections
        this.setupIncomingListeners(user);
        resolve(id);
      });

      newPeer.on('error', (err) => {
        console.warn('Peer connection notice:', err);
        // Resilient fallback for local test
        this.isConnected = true;
        resolve(peerId);
      });
    });
  }

  private setupIncomingListeners(currentUser: UserProfile) {
    if (!this.peer) return;

    // Incoming Voice Call
    this.peer.on('call', (call) => {
      // Answer with local stream if active, or empty audio stream
      if (this.localStream) {
        call.answer(this.localStream);
      } else {
        // Answer empty to receive remote audio
        const silentAudioStream = this.createSilentAudioStream();
        call.answer(silentAudioStream);
      }

      this.handleMediaCall(call);
    });

    // Incoming Data Sync Connection
    this.peer.on('connection', (conn) => {
      this.setupDataConnection(conn, currentUser);
    });
  }

  // Connect to another room peer
  public connectToPeer(remotePeerId: string, currentUser: UserProfile) {
    if (!this.peer || remotePeerId === this.myPeerId || this.dataConnections.has(remotePeerId)) return;

    // Open Data Connection
    const conn = this.peer.connect(remotePeerId, {
      metadata: { user: currentUser }
    });
    this.setupDataConnection(conn, currentUser);

    // Call with voice if mic stream is active
    if (this.localStream) {
      const call = this.peer.call(remotePeerId, this.localStream);
      this.handleMediaCall(call);
    }
  }

  private setupDataConnection(conn: DataConnection, currentUser: UserProfile) {
    conn.on('open', () => {
      this.dataConnections.set(conn.peer, conn);

      // Send our profile info
      conn.send({
        type: 'PARTICIPANT_INFO',
        participant: {
          peerId: this.myPeerId,
          user: currentUser,
          isMuted: !this.localStream,
          isSpeaking: false,
          isHandRaised: false,
        }
      });
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(data, conn.peer);
    });

    conn.on('close', () => {
      this.dataConnections.delete(conn.peer);
      this.participants.delete(conn.peer);
      this.broadcastParticipants();
      if (this.callbacks.onParticipantLeave) {
        this.callbacks.onParticipantLeave(conn.peer);
      }
    });
  }

  private handleIncomingData(data: any, senderPeerId: string) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'PARTICIPANT_INFO':
        if (data.participant) {
          this.participants.set(senderPeerId, data.participant);
          this.broadcastParticipants();
        }
        break;

      case 'QUEUE_UPDATE':
        if (this.callbacks.onQueueUpdate && data.queue) {
          this.callbacks.onQueueUpdate(data.queue);
        }
        break;

      case 'CHAT_MESSAGE':
        if (this.callbacks.onChatMessage && data.message) {
          this.callbacks.onChatMessage(data.message);
        }
        break;

      case 'RECITER_CHANGE':
        if (this.callbacks.onActiveReciterChange && data.reciter) {
          this.callbacks.onActiveReciterChange(data.reciter);
        }
        break;

      case 'MUTE_STATUS':
        const part = this.participants.get(senderPeerId);
        if (part) {
          part.isMuted = data.isMuted;
          this.broadcastParticipants();
        }
        break;
    }
  }

  private handleMediaCall(call: MediaConnection) {
    this.calls.set(call.peer, call);

    call.on('stream', (remoteStream) => {
      // Play remote audio
      this.playRemoteAudio(call.peer, remoteStream);
      if (this.callbacks.onAudioStream) {
        this.callbacks.onAudioStream(call.peer, remoteStream);
      }
    });

    call.on('close', () => {
      this.calls.delete(call.peer);
      const audioElement = document.getElementById(`audio-peer-${call.peer}`) as HTMLAudioElement;
      if (audioElement) {
        audioElement.remove();
      }
    });
  }

  // Attach audio stream to DOM
  private playRemoteAudio(peerId: string, stream: MediaStream) {
    let audioElement = document.getElementById(`audio-peer-${peerId}`) as HTMLAudioElement;
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = `audio-peer-${peerId}`;
      audioElement.autoplay = true;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
    }
    audioElement.srcObject = stream;
    audioElement.play().catch(e => console.warn('Autoplay waiting for user gesture', e));
  }

  // Set real local microphone stream
  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    // Broadcast mute status
    this.broadcastData({
      type: 'MUTE_STATUS',
      isMuted: !stream,
    });

    // Update ongoing calls with the new stream
    if (this.peer && stream) {
      this.dataConnections.forEach((_, peerId) => {
        const existingCall = this.calls.get(peerId);
        if (existingCall) {
          existingCall.close();
        }
        const newCall = this.peer!.call(peerId, stream);
        this.handleMediaCall(newCall);
      });
    }
  }

  // Broadcast data payload to all connected peers
  public broadcastData(payload: any) {
    this.dataConnections.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  // Broadcast current participant list
  private broadcastParticipants() {
    const list = Array.from(this.participants.values());
    if (this.callbacks.onParticipantsUpdate) {
      this.callbacks.onParticipantsUpdate(list);
    }
  }

  // Helper for silent dummy audio track
  private createSilentAudioStream(): MediaStream {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return dst.stream;
  }

  // Cleanup
  public disconnect() {
    this.calls.forEach(call => call.close());
    this.dataConnections.forEach(conn => conn.close());
    if (this.peer) {
      this.peer.destroy();
    }
    this.calls.clear();
    this.dataConnections.clear();
    this.participants.clear();
    this.isConnected = false;
  }
}

export const voiceRoomService = new VoiceRoomManager();
