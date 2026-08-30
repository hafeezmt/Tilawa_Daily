import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Volume2, 
  VolumeX, 
  Shield, 
  Clock, 
  Radio, 
  UserCheck, 
  UserX,
  MessageSquare,
  Send,
  Sliders,
  CheckCircle,
  AlertCircle,
  Users,
  Copy,
  Check,
  PhoneOff,
  Square,
  Sparkles,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import { QueueMember, ChatMessage, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { voiceRoomService, RoomParticipant, KnockRequest, DEFAULT_ROOM_CODE } from '../services/voiceRoomService';

interface LiveHalaqahRoomProps {
  currentHizb: number;
  onNavigateToHizb: (hizb: number) => void;
  listenerCount: number;
}

export const LiveHalaqahRoom: React.FC<LiveHalaqahRoomProps> = ({
  currentHizb,
  onNavigateToHizb,
}) => {
  const { user, isAuthenticated, incrementHizbCount } = useAuth();

  // View Mode: Google Meet Grid vs Spotlight Stage
  const [viewMode, setViewMode] = useState<'grid' | 'spotlight'>('grid');

  // Real-Time Room & Participants State
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [incomingKnocks, setIncomingKnocks] = useState<KnockRequest[]>([]);
  const [isAdmitted, setIsAdmitted] = useState<boolean>(true);
  const [roomCode] = useState<string>(DEFAULT_ROOM_CODE);
  const [copiedLink, setCopiedLink] = useState(false);

  // Voice Call States
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  
  // Real Mic Web Audio Analyzer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Reciter & Queue States
  const [activeReciter, setActiveReciter] = useState<{
    name: string;
    title: string;
    hizb: number;
    surah: string;
    ayahRange: string;
    duration: number;
  }>({
    name: user?.name || 'Halaqah Session',
    title: user?.role === 'ustadh' || user?.role === 'admin' ? 'Ustadh / Host' : 'Session Ready',
    hizb: currentHizb,
    surah: `Hizb ${currentHizb} Recitation`,
    ayahRange: 'Session Ready',
    duration: 0,
  });

  const [queue, setQueue] = useState<QueueMember[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [selectedHizbForQueue, setSelectedHizbForQueue] = useState(currentHizb);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState<'queue' | 'chat' | 'people' | null>('queue');

  // In-Call Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isHost = user?.role === 'admin' || user?.role === 'ustadh';

  // Initialize Real-time WebRTC Voice Room with Knocking / Google Meet flow
  useEffect(() => {
    if (!user) return;

    voiceRoomService.init(user, roomCode, isHost, {
      onParticipantsUpdate: (list) => {
        setParticipants(list);
      },
      onKnockRequest: (knock) => {
        if (isHost) {
          setIncomingKnocks(prev => [...prev.filter(k => k.peerId !== knock.peerId), knock]);
        }
      },
      onKnockResponse: (admitted) => {
        setIsAdmitted(admitted);
      },
      onQueueUpdate: (newQueue) => {
        setQueue(newQueue);
      },
      onChatMessage: (msg) => {
        setChatMessages(prev => [...prev, msg]);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      onActiveReciterChange: (rec) => {
        setActiveReciter(prev => ({
          ...prev,
          name: rec.name,
          hizb: rec.hizb,
          surah: rec.surah,
          duration: 0,
        }));
      },
      onRemoteMute: () => {
        handleMuteSelf();
      },
      onStopRecitation: () => {
        handleMuteSelf();
        setActiveReciter(prev => ({
          ...prev,
          name: 'Open Halaqah',
          ayahRange: 'Recitation Paused by Ustadh',
          duration: 0
        }));
      }
    }).then(() => {
      setIsAdmitted(voiceRoomService.isAdmitted);
    }).catch(err => {
      console.warn('Voice Room Init:', err);
    });

    return () => {
      voiceRoomService.disconnect();
    };
  }, [user, roomCode, isHost]);

  useEffect(() => {
    if (user?.role === 'ustadh' || user?.role === 'admin') {
      setIsAdminMode(true);
    }
  }, [user]);

  // Recitation Duration Timer
  useEffect(() => {
    if (!isMuted || activeReciter.duration > 0) {
      const timer = setInterval(() => {
        setActiveReciter(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isMuted, activeReciter.duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mute Self
  const handleMuteSelf = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    voiceRoomService.setLocalStream(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsMuted(true);
    setAudioLevel(0);
    voiceRoomService.broadcastSpeaking(false, 0);
  };

  // Toggle Live Microphone
  const handleToggleMic = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamRef.current = stream;
        voiceRoomService.setLocalStream(stream);

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        setIsMuted(false);

        if (user) {
          const myReciter = {
            name: user.name,
            hizb: currentHizb,
            surah: `Hizb ${currentHizb} Recitation`,
          };
          setActiveReciter(prev => ({
            ...prev,
            ...myReciter,
            title: user.role === 'ustadh' ? 'Ustadh / Moderator' : 'Active Reciter',
            ayahRange: 'Reciting Live',
          }));
          voiceRoomService.broadcastData({ type: 'RECITER_CHANGE', reciter: myReciter });
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateBars = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const sum = dataArray.slice(0, 16).reduce((a, b) => a + b, 0);
            const avg = Math.round(sum / 16);
            const isSpeaking = avg > 25;
            setAudioLevel(avg);
            voiceRoomService.broadcastSpeaking(isSpeaking, avg);
          }
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };
        updateBars();
      } catch (err) {
        console.warn('Microphone access notice:', err);
        setIsMuted(false);
      }
    } else {
      handleMuteSelf();
    }
  };

  // Ustadh Action: Stop Active Recitation (Remotely stops reciter turn)
  const handleStopActiveReciter = () => {
    voiceRoomService.stopRecitation();
    setActiveReciter(prev => ({
      ...prev,
      name: 'Halaqah Paused',
      ayahRange: 'Turn Stopped by Ustadh',
      duration: 0
    }));
  };

  // Ustadh Action: Admit Knocker
  const handleAdmit = (peerId: string) => {
    voiceRoomService.admitMember(peerId);
    setIncomingKnocks(prev => prev.filter(k => k.peerId !== peerId));
  };

  // Ustadh Action: Deny Knocker
  const handleDeny = (peerId: string) => {
    voiceRoomService.denyMember(peerId);
    setIncomingKnocks(prev => prev.filter(k => k.peerId !== peerId));
  };

  // Handle Raise Hand
  const handleRaiseHand = () => {
    if (hasRaisedHand) {
      const nextQueue = queue.filter(item => item.id !== user?.id);
      setQueue(nextQueue);
      voiceRoomService.broadcastData({ type: 'QUEUE_UPDATE', queue: nextQueue });
      setHasRaisedHand(false);
    } else {
      const newMember: QueueMember = {
        id: user?.id || `usr_${Date.now()}`,
        name: user?.name || 'Member',
        hizbTarget: selectedHizbForQueue,
        joinedAt: 'Just now'
      };
      const nextQueue = [...queue, newMember];
      setQueue(nextQueue);
      voiceRoomService.broadcastData({ type: 'QUEUE_UPDATE', queue: nextQueue });
      setHasRaisedHand(true);
    }
  };

  // Admin: Call Next Reciter
  const handleCallNext = (queueId: string) => {
    const member = queue.find(q => q.id === queueId);
    if (member) {
      const newReciter = {
        name: member.name,
        hizb: member.hizbTarget || currentHizb,
        surah: `Hizb ${member.hizbTarget || currentHizb} Recitation`,
      };
      setActiveReciter(prev => ({
        ...prev,
        ...newReciter,
        title: 'Current Reciter',
        ayahRange: 'Starting recitation',
        duration: 0,
      }));

      const nextQueue = queue.filter(q => q.id !== queueId);
      setQueue(nextQueue);

      voiceRoomService.broadcastData({ type: 'RECITER_CHANGE', reciter: newReciter });
      voiceRoomService.broadcastData({ type: 'QUEUE_UPDATE', queue: nextQueue });

      if (member.id === user?.id) {
        setHasRaisedHand(false);
        setIsMuted(false);
        incrementHizbCount();
      }
    }
  };

  // Copy Meeting Room Link
  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send in-session message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: user?.name || 'Member',
      role: user?.role === 'ustadh' || user?.role === 'admin' ? 'admin' : 'member',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    voiceRoomService.broadcastData({ type: 'CHAT_MESSAGE', message: newMsg });
    setChatInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Active call participants (Include self if not yet registered in list)
  const displayParticipants: RoomParticipant[] = participants.length > 0 ? participants : (
    user ? [{
      peerId: 'self',
      user: user,
      isMuted: isMuted,
      isSpeaking: !isMuted && audioLevel > 25,
      isHandRaised: hasRaisedHand,
      isAdmitted: true
    }] : []
  );

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* GOOGLE MEET WAITING ROOM PROMPT (If knocking & not admitted yet) */}
      {!isAdmitted && (
        <div className="w-full p-8 rounded-3xl glass-panel border border-amber-500/40 bg-midnight-950/90 text-center animate-fadeIn my-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-500/40">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Asking to Join Halaqah...</h3>
          <p className="text-sm text-slate-300 mt-2">
            Meeting Code: <span className="font-mono text-gold-300 font-bold">{roomCode}</span>
          </p>
          <p className="text-xs text-amber-300 font-medium mt-1">
            An Ustadh / Host has been notified to let you into the live room.
          </p>
        </div>
      )}

      {/* INCOMING KNOCK REQUESTS ALERT (Floating for Ustadh / Host) */}
      {isHost && incomingKnocks.length > 0 && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 w-[95%] max-w-sm p-4 rounded-3xl glass-panel border border-gold-400 shadow-gold-glow animate-bounce bg-midnight-950/95">
          <div className="flex items-center gap-2 text-gold-300 text-xs font-bold mb-2">
            <Users className="w-4 h-4 text-gold-400" />
            <span>{incomingKnocks.length} Member(s) Asking to Join:</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {incomingKnocks.map(knock => (
              <div key={knock.peerId} className="p-2.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white">{knock.user.name}</p>
                  <p className="text-[10px] text-slate-400">{knock.user.location || 'Nigeria'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeny(knock.peerId)}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-[10px] font-bold"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleAdmit(knock.peerId)}
                    className="px-3 py-1 rounded-xl bg-emerald-500 text-midnight-950 text-[10px] font-extrabold shadow-sm"
                  >
                    Admit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP MEETING STATUS BAR */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-midnight-900 border border-white/10 font-mono text-gold-300 font-bold">
            <span>{roomCode}</span>
            <button onClick={handleCopyMeetingLink} title="Copy Meeting Link" className="text-slate-400 hover:text-white">
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <span className="flex items-center gap-1.5 text-slate-300 font-semibold hidden sm:flex">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Halaqah Live Call</span>
          </span>
        </div>

        {/* View Mode Toggle & Hizb Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'spotlight' : 'grid')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl glass-card border border-white/10 text-slate-200 text-xs font-bold hover:border-gold-500/40"
          >
            {viewMode === 'grid' ? <Maximize2 className="w-3.5 h-3.5 text-gold-400" /> : <LayoutGrid className="w-3.5 h-3.5 text-gold-400" />}
            <span>{viewMode === 'grid' ? 'Spotlight' : 'Grid View'}</span>
          </button>

          <button
            onClick={() => onNavigateToHizb(activeReciter.hizb)}
            className="px-3 py-1 rounded-xl glass-card border border-gold-500/40 text-gold-300 font-bold text-xs flex items-center gap-1 hover:bg-gold-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Hizb {activeReciter.hizb}</span>
          </button>
        </div>
      </div>

      {/* MAIN MEETING ROOM STAGE */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        
        {/* LEFT / CENTER: GOOGLE MEET PARTICIPANT GRID OR SPOTLIGHT (8 or 12 Cols) */}
        <div className={`${showSidePanel ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-4 transition-all`}>
          
          {/* GRID VIEW: Interactive Member Video/Audio Tiles */}
          {viewMode === 'grid' ? (
            <div className={`grid gap-3.5 p-4 rounded-3xl glass-panel border border-white/15 min-h-[420px] flex-1 ${
              displayParticipants.length <= 1 ? 'grid-cols-1' :
              displayParticipants.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
              displayParticipants.length <= 4 ? 'grid-cols-2' :
              displayParticipants.length <= 9 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
            }`}>
              {displayParticipants.map((participant, idx) => {
                const isMe = participant.user.id === user?.id || participant.peerId === 'self';
                const isSpeaking = participant.isSpeaking || (isMe && !isMuted && audioLevel > 25);
                const isReciter = participant.user.name === activeReciter.name;

                return (
                  <div
                    key={participant.peerId || idx}
                    className={`relative rounded-2xl glass-card border p-4 flex flex-col items-center justify-between min-h-[160px] sm:min-h-[190px] transition-all overflow-hidden ${
                      isSpeaking
                        ? 'border-emerald-400 shadow-emerald-glow bg-emerald-950/20'
                        : isReciter
                        ? 'border-gold-400 shadow-gold-glow bg-gold-950/20'
                        : 'border-white/10 hover:border-white/25 bg-midnight-900/80'
                    }`}
                  >
                    {/* Top Status Tags */}
                    <div className="w-full flex items-center justify-between gap-1 z-10">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        participant.user.role === 'ustadh' || participant.user.role === 'admin'
                          ? 'bg-gold-500/30 text-gold-300 border border-gold-500/40'
                          : isReciter
                          ? 'bg-emerald-500/30 text-emerald-300'
                          : 'bg-slate-800/70 text-slate-300'
                      }`}>
                        {participant.user.role === 'admin' ? 'Admin' : participant.user.role === 'ustadh' ? 'Ustadh' : isReciter ? 'Reciting' : 'Member'}
                      </span>

                      {/* Mic Status */}
                      <span className={`p-1 rounded-lg border ${
                        participant.isMuted 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {participant.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 animate-pulse" />}
                      </span>
                    </div>

                    {/* Center Avatar & Speaking Halo Wave */}
                    <div className="relative my-auto flex items-center justify-center">
                      {isSpeaking && (
                        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-500 to-gold-400 blur-md animate-ping opacity-60" />
                      )}
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-lg border-2 ${
                        isSpeaking
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                          : 'bg-midnight-950 border-gold-500/50 text-gold-300'
                      }`}>
                        {participant.user.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Raised Hand Badge */}
                      {participant.isHandRaised && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gold-500 text-midnight-950 shadow-md animate-bounce" title="Hand Raised">
                          <Hand className="w-3.5 h-3.5 font-bold" />
                        </span>
                      )}
                    </div>

                    {/* Bottom Name & Ustadh Actions */}
                    <div className="w-full flex items-center justify-between gap-1 z-10 mt-2">
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">
                        {participant.user.name} {isMe && '(You)'}
                      </p>

                      {/* Ustadh remote mute / pass mic button */}
                      {isHost && !isMe && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => voiceRoomService.remoteMute(participant.peerId)}
                            className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                            title="Remote Mute Member"
                          >
                            <MicOff className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SPOTLIGHT VIEW (Focused Active Reciter) */
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 flex flex-col items-center justify-center text-center min-h-[420px] relative">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-500/30 via-celestial-500/20 to-gold-400/30 animate-spin-slow blur-md" />
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full glass-card border-2 border-gold-400/60 flex flex-col items-center justify-center bg-midnight-900">
                  <Mic className="w-8 h-8 text-gold-300 animate-pulse mb-1" />
                  <span className="text-[10px] uppercase font-bold text-gold-400">Spotlight</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{activeReciter.name}</h3>
              <p className="text-sm font-arabic text-gold-300 font-bold mt-1">
                {activeReciter.surah} • {activeReciter.ayahRange} ({formatTime(activeReciter.duration)})
              </p>
            </div>
          )}

          {/* GOOGLE MEET BOTTOM FLOATING CALL CONTROL BAR */}
          <div className="p-3 sm:p-4 rounded-3xl glass-panel border border-white/20 shadow-glass-lg flex flex-wrap items-center justify-between gap-3 bg-midnight-950/90">
            
            {/* Left: Audio Status & Duration */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`p-2.5 rounded-2xl glass-card border ${
                  isSpeakerMuted ? 'border-rose-500/40 text-rose-400' : 'border-white/10 text-gold-400'
                }`}
                title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
              >
                {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span>{formatTime(activeReciter.duration)}</span>
              </div>
            </div>

            {/* Center: Core Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-md ${
                  isMuted
                    ? 'glass-card border border-white/20 text-slate-300 hover:border-gold-500/40'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-glow scale-105'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 animate-pulse" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* Raise Hand Button */}
              <button
                onClick={handleRaiseHand}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-md ${
                  hasRaisedHand
                    ? 'bg-gold-500 text-midnight-950 shadow-gold-glow scale-105'
                    : 'glass-glow-gold text-gold-200'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>

              {/* STOP RECITATION BUTTON (Prominent Red for Ustadh / Reciter) */}
              {(isHost || activeReciter.name === user?.name) && (
                <button
                  onClick={handleStopActiveReciter}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 font-extrabold text-xs transition-all shadow-sm"
                  title="Stop Recitation Turn"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>Stop Recitation</span>
                </button>
              )}
            </div>

            {/* Right: Side Panel Switchers & Leave Call */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidePanel(showSidePanel === 'queue' ? null : 'queue')}
                className={`p-2.5 rounded-2xl border transition-all ${
                  showSidePanel === 'queue' ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' : 'glass-card border-white/10 text-slate-300'
                }`}
                title="Recitation Queue"
              >
                <Hand className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSidePanel(showSidePanel === 'chat' ? null : 'chat')}
                className={`p-2.5 rounded-2xl border transition-all ${
                  showSidePanel === 'chat' ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' : 'glass-card border-white/10 text-slate-300'
                }`}
                title="In-Call Chat & Notes"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Leave Call */}
              <button
                onClick={handleMuteSelf}
                className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
                title="Leave Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE PANEL (Queue, Chat, Members) */}
        {showSidePanel && (
          <div className="lg:col-span-4 rounded-3xl glass-panel p-5 border border-white/15 shadow-glass-md flex flex-col min-h-[480px]">
            
            {/* Panel Tabs */}
            <div className="flex items-center p-1 rounded-2xl glass-card border border-white/10 mb-4 text-xs font-bold">
              <button
                onClick={() => setShowSidePanel('queue')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  showSidePanel === 'queue' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40' : 'text-slate-400'
                }`}
              >
                Queue ({queue.length})
              </button>
              <button
                onClick={() => setShowSidePanel('chat')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  showSidePanel === 'chat' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40' : 'text-slate-400'
                }`}
              >
                Chat ({chatMessages.length})
              </button>
            </div>

            {/* QUEUE TAB */}
            {showSidePanel === 'queue' && (
              <div className="flex-1 flex flex-col">
                <div className="mb-3 p-2.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Target Hizb:</span>
                  <select
                    value={selectedHizbForQueue}
                    onChange={(e) => setSelectedHizbForQueue(Number(e.target.value))}
                    className="px-2 py-0.5 rounded-xl glass-input text-xs font-bold text-gold-300"
                  >
                    {[1, 2, 3, 4, 5].map(h => (
                      <option key={h} value={h}>Hizb {h}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
                  {queue.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 glass-card rounded-2xl border border-white/5">
                      <CheckCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p>Queue is empty</p>
                      <p className="text-[10px] text-gold-400 mt-0.5">Click "Raise Hand" to recite</p>
                    </div>
                  ) : (
                    queue.map((item, idx) => (
                      <div key={item.id} className="p-2.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-300 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-400">Target: Hizb {item.hizbTarget || currentHizb}</p>
                          </div>
                        </div>

                        {isAdminMode && (
                          <button
                            onClick={() => handleCallNext(item.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500 text-midnight-950 text-[10px] font-extrabold"
                          >
                            Call Next
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CHAT TAB */}
            {showSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px] mb-3">
                  {chatMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No messages yet. Send notes or Ayah citations below.
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="p-2.5 rounded-2xl glass-card border border-white/5 text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-gold-300 text-[11px]">{msg.sender}</span>
                          <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-slate-200 text-xs">{msg.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send in-call note..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-medium"
                  />
                  <button type="submit" className="p-2.5 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/40">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
