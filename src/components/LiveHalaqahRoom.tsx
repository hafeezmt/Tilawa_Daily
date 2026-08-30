import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Volume2, 
  VolumeX, 
  Shield, 
  Clock, 
  Sparkles, 
  Radio, 
  UserCheck, 
  UserX,
  MessageSquare,
  Send,
  Sliders,
  CheckCircle,
  AlertCircle,
  LogIn,
  Users
} from 'lucide-react';
import { QueueMember, ChatMessage, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { voiceRoomService, RoomParticipant } from '../services/voiceRoomService';
import { ParticipantsModal } from './ParticipantsModal';

interface LiveHalaqahRoomProps {
  currentHizb: number;
  onNavigateToHizb: (hizb: number) => void;
  listenerCount: number;
}

export const LiveHalaqahRoom: React.FC<LiveHalaqahRoomProps> = ({
  currentHizb,
  onNavigateToHizb,
}) => {
  const { user, isAuthenticated, openAuthModal, incrementHizbCount } = useAuth();

  // Real-Time Room & Participants State
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  // Voice Call States
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(15));
  
  // Real Mic Web Audio Analyzer
  const [isRealMicActive, setIsRealMicActive] = useState(false);
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
    name: user?.name ? `${user.name} (Live)` : 'Tilawa Daily Halaqah',
    title: user?.role === 'ustadh' ? 'Ustadh / Moderator' : 'Session Ready',
    hizb: currentHizb,
    surah: `Hizb ${currentHizb} Recitation`,
    ayahRange: 'Session Ready',
    duration: 0,
  });

  const [queue, setQueue] = useState<QueueMember[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [selectedHizbForQueue, setSelectedHizbForQueue] = useState(currentHizb);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Chat & Notes State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Real-time WebRTC Voice Room
  useEffect(() => {
    if (!user) return;

    voiceRoomService.init(user, {
      onParticipantsUpdate: (list) => {
        setParticipants(list);
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
      }
    }).catch(err => {
      console.warn('WebRTC notice:', err);
    });

    return () => {
      voiceRoomService.disconnect();
    };
  }, [user]);

  // Automatically enable admin mode if user is ustadh/admin
  useEffect(() => {
    if (user?.role === 'ustadh' || user?.role === 'admin') {
      setIsAdminMode(true);
    }
  }, [user]);

  // Timer for active recitation
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
        setIsRealMicActive(true);
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
            const bars = Array.from(dataArray.slice(0, 16)).map(val => Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
            setAudioLevel(bars);
          }
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };
        updateBars();
      } catch (err) {
        console.warn('Microphone notice:', err);
        setIsMuted(false);
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      voiceRoomService.setLocalStream(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsRealMicActive(false);
      setIsMuted(true);
      setAudioLevel(new Array(16).fill(15));
    }
  };

  const handleRaiseHand = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

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

  const handleMakeReciter = (targetUser: UserProfile) => {
    const newReciter = {
      name: targetUser.name,
      hizb: currentHizb,
      surah: `Hizb ${currentHizb} Recitation`,
    };
    setActiveReciter(prev => ({
      ...prev,
      ...newReciter,
      title: 'Current Reciter',
      ayahRange: 'Assigned by Ustadh',
      duration: 0,
    }));
    voiceRoomService.broadcastData({ type: 'RECITER_CHANGE', reciter: newReciter });
    setIsParticipantsModalOpen(false);
  };

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

  return (
    <div className="w-full flex flex-col gap-6">
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Reciter Spotlight Card (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="relative rounded-3xl glass-panel p-5 sm:p-8 overflow-hidden border border-white/15 shadow-glass-lg">
            
            {/* Top Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-celestial-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header Row: Room Status, Duration, Online Counter */}
            <div className="relative flex items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                  !isMuted 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                    : 'bg-gold-500/20 border-gold-500/30 text-gold-300'
                }`}>
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {!isMuted ? 'RECITING LIVE' : 'ROOM READY'}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  {formatTime(activeReciter.duration)}
                </span>
              </div>

              {/* Online Participants Trigger & Mushaf Shortcut */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsParticipantsModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl glass-card text-gold-300 font-bold text-xs border border-white/10 hover:border-gold-500/40"
                  title="View online members"
                >
                  <Users className="w-3.5 h-3.5 text-gold-400" />
                  <span>{Math.max(1, participants.length)} Online</span>
                </button>

                <button
                  onClick={() => onNavigateToHizb(activeReciter.hizb)}
                  className="text-xs px-2.5 py-1 rounded-xl glass-card text-gold-300 font-bold border border-gold-500/30 hover:bg-gold-500/10 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>Hizb {activeReciter.hizb}</span>
                </button>
              </div>
            </div>

            {/* Reciter Avatar & Live Waveform */}
            <div className="relative flex flex-col items-center justify-center my-2 sm:my-4">
              <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-500/30 via-celestial-500/20 to-gold-400/30 animate-spin-slow blur-md" />
                <div className="absolute inset-2 rounded-full border border-gold-500/40 animate-pulse-slow" />
                <div className="absolute inset-4 rounded-full border border-white/15" />
                
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full glass-card border-2 border-gold-400/60 flex flex-col items-center justify-center shadow-gold-glow bg-midnight-900/90">
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mb-1">
                    <Mic className="w-6 h-6 text-gold-300 animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                    {!isMuted ? 'Reciting' : 'Microphone'}
                  </span>
                </div>
              </div>

              <div className="text-center mt-5 sm:mt-6">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeReciter.name}
                </h3>
                <p className="text-sm font-arabic text-gold-300 font-semibold mt-1">
                  {activeReciter.surah} • {activeReciter.ayahRange}
                </p>
              </div>

              {/* Dynamic Waveform */}
              <div className="w-full max-w-md flex items-center justify-center gap-1.5 sm:gap-2 h-14 sm:h-16 mt-5 sm:mt-6 px-4 py-2 rounded-2xl glass-card border border-white/10">
                {audioLevel.map((level, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full transition-all duration-100 ease-out bg-gradient-to-t from-gold-600 via-gold-400 to-celestial-400 shadow-sm"
                    style={{
                      height: `${level}%`,
                      opacity: level > 25 ? 1 : 0.4
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="relative mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                  className={`p-3 rounded-2xl glass-card border transition-all ${
                    isSpeakerMuted ? 'border-rose-500/40 text-rose-400 bg-rose-500/10' : 'border-white/15 text-slate-300 hover:border-gold-500/40'
                  }`}
                  title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                >
                  {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-gold-400" />}
                </button>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Halaqah Audio</span>
                  <span className="text-xs font-bold text-slate-200">{isSpeakerMuted ? 'Muted' : 'HD Voice'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleToggleMic}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg ${
                    isMuted
                      ? 'glass-card border border-white/20 text-slate-300 hover:border-gold-500/50 hover:bg-white/10'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border border-emerald-400 shadow-emerald-glow scale-105'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 sm:w-5 h-4 sm:h-5 text-rose-400" /> : <Mic className="w-4 sm:w-5 h-4 sm:h-5 text-white animate-pulse" />}
                  <span>{isMuted ? 'Unmute to Recite' : 'Mic Active'}</span>
                </button>

                <button
                  onClick={handleRaiseHand}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg ${
                    hasRaisedHand
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-midnight-950 font-extrabold border border-gold-300 shadow-gold-glow scale-105'
                      : 'glass-glow-gold text-gold-200 hover:bg-gold-500/20'
                  }`}
                >
                  <Hand className={`w-4 sm:w-5 h-4 sm:h-5 ${hasRaisedHand ? 'animate-bounce text-midnight-950' : 'text-gold-400'}`} />
                  <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}</span>
                </button>
              </div>

              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`p-3 rounded-2xl glass-card border transition-all ${
                  isAdminMode ? 'border-celestial-400 text-celestial-300 bg-celestial-500/15' : 'border-white/15 text-slate-400 hover:text-slate-200'
                }`}
                title="Admin / Ustadh Controls"
              >
                <Shield className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ustadh Moderation Panel */}
          {isAdminMode && (
            <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-celestial-500/30 shadow-glass-md animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-celestial-300 font-bold text-sm">
                  <Sliders className="w-4 h-4" />
                  <span>Ustadh / Moderator Panel</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-celestial-500/20 text-celestial-300 border border-celestial-500/40 font-semibold">
                  Leader Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => queue.length > 0 && handleCallNext(queue[0].id)}
                  disabled={queue.length === 0}
                  className="p-3 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gold-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <UserCheck className="w-4 h-4 text-gold-400" />
                  <span>Pass Mic ({queue[0]?.name || 'None'})</span>
                </button>

                <button 
                  onClick={() => {
                    const resetRec = { name: 'Session Waiting', hizb: currentHizb, surah: `Hizb ${currentHizb}` };
                    setActiveReciter(prev => ({ ...prev, name: 'Session Waiting', duration: 0 }));
                    voiceRoomService.broadcastData({ type: 'RECITER_CHANGE', reciter: resetRec });
                  }}
                  className="p-3 rounded-xl glass-card border border-white/15 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 hover:border-white/30 transition-all"
                >
                  <UserX className="w-4 h-4 text-rose-400" />
                  <span>Reset Reciter</span>
                </button>

                <button 
                  onClick={() => {
                    setQueue([]);
                    voiceRoomService.broadcastData({ type: 'QUEUE_UPDATE', queue: [] });
                  }}
                  className="p-3 rounded-xl glass-card border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-all"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Clear Queue</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recitation Queue & Chat (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Recitation Queue Card */}
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/15 shadow-glass-md flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hand className="w-5 h-5 text-gold-400" />
                <h4 className="font-bold text-white text-base">Recitation Queue</h4>
                <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-500/30">
                  {queue.length} waiting
                </span>
              </div>
              
              <span className="text-xs text-slate-400 font-medium">5 Hizb Cycle</span>
            </div>

            {!hasRaisedHand && (
              <div className="mb-4 p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-gold-300">Target:</span>
                  <select
                    value={selectedHizbForQueue}
                    onChange={(e) => setSelectedHizbForQueue(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-xl glass-input text-xs font-bold text-gold-300"
                  >
                    <option value={1}>Hizb 1</option>
                    <option value={2}>Hizb 2</option>
                    <option value={3}>Hizb 3</option>
                    <option value={4}>Hizb 4</option>
                    <option value={5}>Hizb 5</option>
                  </select>
                </div>

                {!isAuthenticated && (
                  <button
                    onClick={openAuthModal}
                    className="text-xs font-bold text-gold-400 hover:underline flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Real Queue List */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <div className="py-8 text-center glass-card rounded-2xl border border-white/5">
                  <CheckCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Queue is currently empty</p>
                  <p className="text-[11px] text-gold-400/80 mt-0.5">Click "Raise Hand" to take your turn reciting</p>
                </div>
              ) : (
                queue.map((item, idx) => {
                  const isMe = item.id === user?.id;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-2xl glass-card border transition-all ${
                        isMe 
                          ? 'border-gold-500/50 bg-gold-500/10 shadow-sm shadow-gold-500/20' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-300 font-bold text-xs flex items-center justify-center border border-gold-500/40">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {item.name}
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-500/30 text-gold-200 uppercase font-extrabold">You</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">Target: Hizb {item.hizbTarget || currentHizb} • {item.joinedAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdminMode && (
                          <button
                            onClick={() => handleCallNext(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                          >
                            Call Now
                          </button>
                        )}
                        {isMe && (
                          <button
                            onClick={handleRaiseHand}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold"
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes & Chat */}
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/15 shadow-glass-md flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-celestial-400" />
                <h4 className="font-bold text-white text-sm">Halaqah Notes & Chat</h4>
              </div>
              <span className="text-[10px] text-slate-400">Real-time</span>
            </div>

            <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5 pr-1 mb-3">
              {chatMessages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                  No notes posted yet. Share verse citations or Tafseer notes below.
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-2.5 rounded-2xl text-xs glass-card border ${
                      msg.role === 'admin' 
                        ? 'border-gold-500/30 bg-gold-500/10' 
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-[11px] ${
                        msg.role === 'admin' ? 'text-gold-300' : 'text-slate-300'
                      }`}>
                        {msg.sender}
                      </span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={isAuthenticated ? "Send a note (e.g. Ayah number, Tafseer)..." : "Sign in to send notes..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-medium"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={participants}
        currentUser={user}
        onMakeReciter={handleMakeReciter}
      />

    </div>
  );
};
