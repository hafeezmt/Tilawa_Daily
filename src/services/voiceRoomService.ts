import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { UserProfile, QueueMember, ChatMessage } from '../types';

export interface RoomParticipant {
  peerId: string;
  user: UserProfile;
  isSpeaking: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isAdmitted: boolean;
  audioLevel?: number;
}

export interface KnockRequest {
  peerId: string;
  user: UserProfile;
  timestamp: string;
}

export type RoomEventCallback = {
  onParticipantJoin?: (participant: RoomParticipant) => void;
  onParticipantLeave?: (peerId: string) => void;
  onParticipantsUpdate?: (participants: RoomParticipant[]) => void;
  onKnockRequest?: (knock: KnockRequest) => void;
  onKnockResponse?: (admitted: boolean) => void;
  onQueueUpdate?: (queue: QueueMember[]) => void;
  onChatMessage?: (msg: ChatMessage) => void;
  onActiveReciterChange?: (reciter: { name: string; hizb: number; surah: string; ayahRange?: string }) => void;
  onRemoteMute?: () => void;
  onStopRecitation?: () => void;
  onAudioStream?: (peerId: string, stream: MediaStream) => void;
};

export const DEFAULT_ROOM_CODE = 'TIL-5HIZB-DAILY';

class VoiceRoomManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private calls: Map<string, MediaConnection> = new Map();
  private dataConnections: Map<string, DataConnection> = new Map();
  private participants: Map<string, RoomParticipant> = new Map();
  private pendingKnocks: Map<string, KnockRequest> = new Map();
  private callbacks: RoomEventCallback = {};
  public myPeerId: string = '';
  public roomCode: string = DEFAULT_ROOM_CODE;
  public isConnected: boolean = false;
  public isAdmitted: boolean = false;

  public init(user: UserProfile, roomCode: string, isHost: boolean, callbacks: RoomEventCallback): Promise<string> {
    this.callbacks = callbacks;
    this.roomCode = roomCode || DEFAULT_ROOM_CODE;
    this.isAdmitted = isHost || user.role === 'admin' || user.role === 'ustadh';

    return new Promise((resolve) => {
      const sanitizedName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
      const uniqueSuffix = Math.random().toString(36).substring(2, 6);
      const peerId = `tilawa-${sanitizedName}-${uniqueSuffix}`;

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

        const selfParticipant: RoomParticipant = {
          peerId: id,
          user: user,
          isSpeaking: false,
          isMuted: true,
          isHandRaised: false,
          isAdmitted: this.isAdmitted,
        };
        this.participants.set(id, selfParticipant);
        this.broadcastParticipants();

        this.setupIncomingListeners(user);
        resolve(id);
      });

      newPeer.on('error', (err) => {
        console.warn('Peer notice:', err);
        this.isConnected = true;
        resolve(peerId);
      });
    });
  }

  private setupIncomingListeners(currentUser: UserProfile) {
    if (!this.peer) return;

    this.peer.on('call', (call) => {
      if (this.localStream) {
        call.answer(this.localStream);
      } else {
        const silentAudioStream = this.createSilentAudioStream();
        call.answer(silentAudioStream);
      }
      this.handleMediaCall(call);
    });

    this.peer.on('connection', (conn) => {
      this.setupDataConnection(conn, currentUser);
    });
  }

  public connectToPeer(remotePeerId: string, currentUser: UserProfile) {
    if (!this.peer || remotePeerId === this.myPeerId || this.dataConnections.has(remotePeerId)) return;

    const conn = this.peer.connect(remotePeerId, {
      metadata: { user: currentUser }
    });
    this.setupDataConnection(conn, currentUser);

    if (this.localStream) {
      const call = this.peer.call(remotePeerId, this.localStream);
      this.handleMediaCall(call);
    }
  }

  private setupDataConnection(conn: DataConnection, currentUser: UserProfile) {
    conn.on('open', () => {
      this.dataConnections.set(conn.peer, conn);

      // Send self info or knock request
      if (!this.isAdmitted) {
        conn.send({
          type: 'KNOCK_REQUEST',
          knock: {
            peerId: this.myPeerId,
            user: currentUser,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        });
      } else {
        conn.send({
          type: 'PARTICIPANT_INFO',
          participant: {
            peerId: this.myPeerId,
            user: currentUser,
            isMuted: !this.localStream,
            isSpeaking: false,
            isHandRaised: false,
            isAdmitted: true,
          }
        });
      }
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(data, conn.peer);
    });

    conn.on('close', () => {
      this.dataConnections.delete(conn.peer);
      this.participants.delete(conn.peer);
      this.pendingKnocks.delete(conn.peer);
      this.broadcastParticipants();
      if (this.callbacks.onParticipantLeave) {
        this.callbacks.onParticipantLeave(conn.peer);
      }
    });
  }

  private handleIncomingData(data: any, senderPeerId: string) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'KNOCK_REQUEST':
        if (data.knock) {
          this.pendingKnocks.set(senderPeerId, data.knock);
          if (this.callbacks.onKnockRequest) {
            this.callbacks.onKnockRequest(data.knock);
          }
        }
        break;

      case 'ADMIT_USER':
        if (data.targetPeerId === this.myPeerId) {
          this.isAdmitted = true;
          const self = this.participants.get(this.myPeerId);
          if (self) self.isAdmitted = true;
          this.broadcastParticipants();
          if (this.callbacks.onKnockResponse) {
            this.callbacks.onKnockResponse(true);
          }
        } else {
          const part = this.participants.get(data.targetPeerId);
          if (part) {
            part.isAdmitted = true;
            this.broadcastParticipants();
          }
        }
        break;

      case 'DENY_USER':
        if (data.targetPeerId === this.myPeerId) {
          this.isAdmitted = false;
          if (this.callbacks.onKnockResponse) {
            this.callbacks.onKnockResponse(false);
          }
        }
        break;

      case 'PARTICIPANT_INFO':
        if (data.participant) {
          this.participants.set(senderPeerId, data.participant);
          this.broadcastParticipants();
        }
        break;

      case 'SPEAKING_STATUS':
        const spk = this.participants.get(senderPeerId);
        if (spk) {
          spk.isSpeaking = data.isSpeaking;
          spk.audioLevel = data.audioLevel;
          this.broadcastParticipants();
        }
        break;

      case 'REMOTE_MUTE':
        if (data.targetPeerId === this.myPeerId || data.all) {
          this.setLocalStream(null);
          if (this.callbacks.onRemoteMute) {
            this.callbacks.onRemoteMute();
          }
        }
        break;

      case 'STOP_RECITATION':
        if (this.callbacks.onStopRecitation) {
          this.callbacks.onStopRecitation();
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
    }
  }

  // Host Action: Admit Knocker
  public admitMember(targetPeerId: string) {
    this.pendingKnocks.delete(targetPeerId);
    const part = this.participants.get(targetPeerId);
    if (part) part.isAdmitted = true;
    this.broadcastData({
      type: 'ADMIT_USER',
      targetPeerId
    });
    this.broadcastParticipants();
  }

  // Host Action: Deny Knocker
  public denyMember(targetPeerId: string) {
    this.pendingKnocks.delete(targetPeerId);
    this.broadcastData({
      type: 'DENY_USER',
      targetPeerId
    });
  }

  // Host Action: Remote Mute Specific Peer or All
  public remoteMute(targetPeerId?: string) {
    this.broadcastData({
      type: 'REMOTE_MUTE',
      targetPeerId,
      all: !targetPeerId
    });
  }

  // Host Action: Stop Active Recitation
  public stopRecitation() {
    this.broadcastData({
      type: 'STOP_RECITATION'
    });
  }

  // Broadcast Speaking Status & Amplitude
  public broadcastSpeaking(isSpeaking: boolean, audioLevel: number) {
    const self = this.participants.get(this.myPeerId);
    if (self) {
      self.isSpeaking = isSpeaking;
      self.audioLevel = audioLevel;
    }
    this.broadcastData({
      type: 'SPEAKING_STATUS',
      isSpeaking,
      audioLevel
    });
  }

  private handleMediaCall(call: MediaConnection) {
    this.calls.set(call.peer, call);

    call.on('stream', (remoteStream) => {
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

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    const self = this.participants.get(this.myPeerId);
    if (self) {
      self.isMuted = !stream;
      self.isSpeaking = false;
      this.broadcastParticipants();
    }

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

  public broadcastData(payload: any) {
    this.dataConnections.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  private broadcastParticipants() {
    const list = Array.from(this.participants.values());
    if (this.callbacks.onParticipantsUpdate) {
      this.callbacks.onParticipantsUpdate(list);
    }
  }

  private createSilentAudioStream(): MediaStream {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return dst.stream;
  }

  public disconnect() {
    this.calls.forEach(call => call.close());
    this.dataConnections.forEach(conn => conn.close());
    if (this.peer) {
      this.peer.destroy();
    }
    this.calls.clear();
    this.dataConnections.clear();
    this.participants.clear();
    this.pendingKnocks.clear();
    this.isConnected = false;
    this.isAdmitted = false;
  }
}

export const voiceRoomService = new VoiceRoomManager();
