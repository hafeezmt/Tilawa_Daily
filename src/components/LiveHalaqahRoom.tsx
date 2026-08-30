import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Volume2, 
  VolumeX, 
  Shield, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  UserCheck, 
  UserX,
  MessageSquare,
  Send,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { QueueMember, ChatMessage } from '../types';

interface LiveHalaqahRoomProps {
  currentHizb: number;
  onNavigateToHizb: (hizb: number) => void;
  listenerCount: number;
}

export const LiveHalaqahRoom: React.FC<LiveHalaqahRoomProps> = ({
  currentHizb,
  onNavigateToHizb,
}) => {
  // Voice Call States
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(20));
  
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
    name: 'Ustadh Mansur Al-Hassan',
    title: 'Reciter / Lead',
    hizb: currentHizb,
    surah: 'Surah Al-Baqarah',
    ayahRange: 'Ayah 142 - 176',
    duration: 342,
  });

  const [queue, setQueue] = useState<QueueMember[]>([
    { id: 'q-1', name: 'Abubakar Sani', hizbTarget: 3, joinedAt: '2 mins ago' },
    { id: 'q-2', name: 'Muhammad Al-Amin', hizbTarget: 4, joinedAt: '4 mins ago' },
    { id: 'q-3', name: 'Mustapha Kabir', hizbTarget: 5, joinedAt: '6 mins ago' },
  ]);

  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [myUserName, setMyUserName] = useState('');
  const [selectedHizbForQueue, setSelectedHizbForQueue] = useState(currentHizb);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Chat & Notes State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Admin', role: 'admin', text: 'Barka da zuwa Halaqah ta yau. Muna karanta Hizb 1 zuwa 5.', timestamp: '08:00' },
    { id: '2', sender: 'Ibrahim K.', role: 'member', text: 'Masha\'Allah, kyakkyawar tilawa!', timestamp: '08:05' },
    { id: '3', sender: 'Ustadh Mansur', role: 'reciter', text: 'Muna kan Hizb 3, shafi na 22.', timestamp: '08:08' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Simulated Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReciter(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Duration seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Live Microphone with Web Audio API
  const handleToggleMic = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
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
        console.warn('Microphone permission not granted or available, using synthetic visualizer', err);
        setIsMuted(false);
      }
    } else {
      // Mute & Stop Stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
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

  // Synthetic Audio Visualizer for active reciter when listening
  useEffect(() => {
    if (!isRealMicActive && !isSpeakerMuted) {
      const interval = setInterval(() => {
        setAudioLevel(
          Array.from({ length: 16 }, () => Math.floor(Math.random() * 65) + 25)
        );
      }, 140);
      return () => clearInterval(interval);
    }
  }, [isRealMicActive, isSpeakerMuted]);

  // Handle Raise Hand
  const handleRaiseHand = () => {
    if (hasRaisedHand) {
      setQueue(prev => prev.filter(item => item.id !== 'my-queue-id'));
      setHasRaisedHand(false);
    } else {
      const name = myUserName.trim() || 'Dan Uwa / Member';
      const newMember: QueueMember = {
        id: 'my-queue-id',
        name,
        hizbTarget: selectedHizbForQueue,
        joinedAt: 'Just now'
      };
      setQueue(prev => [...prev, newMember]);
      setHasRaisedHand(true);
    }
  };

  // Admin: Call Next Reciter
  const handleCallNext = (queueId: string) => {
    const member = queue.find(q => q.id === queueId);
    if (member) {
      setActiveReciter({
        name: member.name,
        title: 'Current Reciter',
        hizb: member.hizbTarget || currentHizb,
        surah: `Hizb ${member.hizbTarget || currentHizb} Recitation`,
        ayahRange: 'Starting recitation',
        duration: 0,
      });
      setQueue(prev => prev.filter(q => q.id !== queueId));
      if (member.id === 'my-queue-id') {
        setHasRaisedHand(false);
        setIsMuted(false);
      }
    }
  };

  // Send in-session message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: myUserName.trim() || 'Member',
      role: isAdminMode ? 'admin' : 'member',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Main Reciter Spotlight Card (7 Columns on large screens) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Active Reciter Stage (Deep Glassmorphism) */}
        <div className="relative rounded-3xl glass-panel p-6 sm:p-8 overflow-hidden border border-white/15 shadow-glass-lg">
          
          {/* Top Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-celestial-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row: Room Status, Duration, Hizb Tag */}
          <div className="relative flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                ON AIR
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                {formatTime(activeReciter.duration)}
              </span>
            </div>

            <button 
              onClick={() => onNavigateToHizb(activeReciter.hizb)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-gold-500/30 text-xs font-bold text-gold-300 hover:bg-gold-500/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Hizb {activeReciter.hizb} in Mushaf</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reciter Avatar & Live Waveform Circle */}
          <div className="relative flex flex-col items-center justify-center my-4">
            
            {/* Outer Glowing Concentric Rings */}
            <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-500/30 via-celestial-500/20 to-gold-400/30 animate-spin-slow blur-md" />
              <div className="absolute inset-2 rounded-full border border-gold-500/40 animate-pulse-slow" />
              <div className="absolute inset-4 rounded-full border border-white/15" />
              
              {/* Center Reciter Avatar */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full glass-card border-2 border-gold-400/60 flex flex-col items-center justify-center shadow-gold-glow bg-midnight-900/90">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mb-1">
                  <Mic className="w-6 h-6 text-gold-300 animate-pulse" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">Reciter</span>
              </div>
            </div>

            {/* Reciter Details */}
            <div className="text-center mt-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {activeReciter.name}
              </h3>
              <p className="text-sm font-arabic text-gold-300 font-semibold mt-1">
                {activeReciter.surah} • {activeReciter.ayahRange}
              </p>
            </div>

            {/* Dynamic Glass Audio Spectrum Visualizer Bars */}
            <div className="w-full max-w-md flex items-center justify-center gap-1.5 sm:gap-2 h-16 mt-6 px-4 py-2 rounded-2xl glass-card border border-white/10">
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

          {/* User Call Controls Bar */}
          <div className="relative mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            {/* Left: Speaker Mute / Level */}
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
                <span className="text-xs font-bold text-slate-200">{isSpeakerMuted ? 'Muted' : 'High Definition (600+)'}</span>
              </div>
            </div>

            {/* Center: Main Microphone & Raise Hand Actions */}
            <div className="flex items-center gap-3">
              {/* Mic Toggle Button */}
              <button
                onClick={handleToggleMic}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg ${
                  isMuted
                    ? 'glass-card border border-white/20 text-slate-300 hover:border-gold-500/50 hover:bg-white/10'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border border-emerald-400 shadow-emerald-glow scale-105'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-white animate-pulse" />}
                <span>{isMuted ? 'My Mic: Muted' : 'Mic Active'}</span>
              </button>

              {/* Raise Hand Toggle Button */}
              <button
                onClick={handleRaiseHand}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg ${
                  hasRaisedHand
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-midnight-950 font-extrabold border border-gold-300 shadow-gold-glow scale-105'
                    : 'glass-glow-gold text-gold-200 hover:bg-gold-500/20'
                }`}
              >
                <Hand className={`w-5 h-5 ${hasRaisedHand ? 'animate-bounce text-midnight-950' : 'text-gold-400'}`} />
                <span>{hasRaisedHand ? 'Hand Raised (#In Queue)' : 'Raise Hand to Recite'}</span>
              </button>
            </div>

            {/* Right: Admin Mode Switch */}
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

        {/* Ustadh / Moderator Panel (Visible when Admin Mode is toggled) */}
        {isAdminMode && (
          <div className="rounded-3xl glass-panel p-6 border border-celestial-500/30 shadow-glass-md animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-celestial-300 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>Ustadh / Admin Moderation Panel</span>
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
                <span>Pass Mic to Next ({queue[0]?.name || 'None'})</span>
              </button>

              <button 
                onClick={() => {
                  setActiveReciter(prev => ({ ...prev, name: 'Open Recitation', duration: 0 }));
                }}
                className="p-3 rounded-xl glass-card border border-white/15 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 hover:border-white/30 transition-all"
              >
                <UserX className="w-4 h-4 text-rose-400" />
                <span>Reset Current Reciter</span>
              </button>

              <button 
                onClick={() => setQueue([])}
                className="p-3 rounded-xl glass-card border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-all"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Clear All Queue</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recitation Queue & In-Session Chat (5 Columns on large screens) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Recitation Turn Queue Card */}
        <div className="rounded-3xl glass-panel p-6 border border-white/15 shadow-glass-md flex flex-col">
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

          {/* Name input for Raising Hand */}
          {!hasRaisedHand && (
            <div className="mb-4 p-3 rounded-2xl glass-card border border-white/10 flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase text-slate-400">Join Recitation Queue</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={myUserName}
                  onChange={(e) => setMyUserName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-medium focus:ring-1 focus:ring-gold-400"
                />
                <select
                  value={selectedHizbForQueue}
                  onChange={(e) => setSelectedHizbForQueue(Number(e.target.value))}
                  className="px-2.5 py-2 rounded-xl glass-input text-xs font-bold text-gold-300"
                >
                  <option value={1}>Hizb 1</option>
                  <option value={2}>Hizb 2</option>
                  <option value={3}>Hizb 3</option>
                  <option value={4}>Hizb 4</option>
                  <option value={5}>Hizb 5</option>
                </select>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {queue.length === 0 ? (
              <div className="py-8 text-center glass-card rounded-2xl border border-white/5">
                <CheckCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Queue is currently empty</p>
                <p className="text-[11px] text-gold-400/80 mt-0.5">Click "Raise Hand" above to take your turn reciting</p>
              </div>
            ) : (
              queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl glass-card border transition-all ${
                    item.id === 'my-queue-id' 
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
                        {item.id === 'my-queue-id' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-500/30 text-gold-200 uppercase font-extrabold">You</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">Target: Hizb {item.hizbTarget || currentHizb} • {item.joinedAt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isAdminMode && (
                      <button
                        onClick={() => handleCallNext(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                      >
                        Call Now
                      </button>
                    )}
                    {item.id === 'my-queue-id' && (
                      <button
                        onClick={handleRaiseHand}
                        className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Session Notes & Chat (Silent text updates during recitation) */}
        <div className="rounded-3xl glass-panel p-6 border border-white/15 shadow-glass-md flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-celestial-400" />
              <h4 className="font-bold text-white text-sm">Halaqah Notes & Chat</h4>
            </div>
            <span className="text-[10px] text-slate-400">Silent chat</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5 pr-1 mb-3">
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-2.5 rounded-2xl text-xs glass-card border ${
                  msg.role === 'admin' 
                    ? 'border-gold-500/30 bg-gold-500/10' 
                    : msg.role === 'reciter'
                    ? 'border-celestial-500/30 bg-celestial-500/10'
                    : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-[11px] ${
                    msg.role === 'admin' ? 'text-gold-300' : msg.role === 'reciter' ? 'text-celestial-300' : 'text-slate-300'
                  }`}>
                    {msg.sender}
                  </span>
                  <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">{msg.text}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Send a note (e.g. Ayah number, Tafseer)..."
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
  );
};
