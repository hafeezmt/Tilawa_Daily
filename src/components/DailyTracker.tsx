import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Plus, 
  Flame,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HIZB_LIST } from '../data/quranMetadata';
import { HizbInfo } from '../types';
import { useAuth } from '../context/AuthContext';

interface DailyTrackerProps {
  onSelectHizb: (hizbNumber: number) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ onSelectHizb }) => {
  const { user, isAuthenticated, openAuthModal, incrementHizbCount } = useAuth();

  // 60 Hizb state initialized from metadata
  const [hizbs, setHizbs] = useState<HizbInfo[]>(HIZB_LIST);
  const [activeView, setActiveView] = useState<'today' | 'all'>('today');
  const [claimedName, setClaimedName] = useState(user?.name || '');
  const [selectedClaimHizb, setSelectedClaimHizb] = useState<number | null>(null);

  // Today's target is Hizb 1 to 5
  const todayTargetHizbs = [1, 2, 3, 4, 5];
  const todayHizbsList = hizbs.filter(h => todayTargetHizbs.includes(h.hizbNumber));
  
  const completedCount = hizbs.filter(h => h.status === 'completed').length;
  const todayCompletedCount = todayHizbsList.filter(h => h.status === 'completed').length;
  const overallPercentage = Math.round((completedCount / 60) * 100);
  const todayPercentage = Math.round((todayCompletedCount / 5) * 100);

  // Toggle Hizb completion
  const handleToggleComplete = (hizbNumber: number) => {
    setHizbs(prev => prev.map(h => {
      if (h.hizbNumber === hizbNumber) {
        const nextStatus = h.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          // Trigger celebratory confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#E5B25D', '#FDE8B3', '#38BDF8', '#10B981']
          });
          incrementHizbCount();
        }
        return { ...h, status: nextStatus };
      }
      return h;
    }));
  };

  // Open Claim Modal or Prompt Auth
  const handleClaimClick = (hizbNumber: number) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setClaimedName(user?.name || '');
    setSelectedClaimHizb(hizbNumber);
  };

  // Claim a Hizb for recitation
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedName.trim() || selectedClaimHizb === null) return;

    setHizbs(prev => prev.map(h => {
      if (h.hizbNumber === selectedClaimHizb) {
        return {
          ...h,
          assignedReciter: claimedName.trim(),
          status: h.status === 'pending' ? 'in_progress' : h.status
        };
      }
      return h;
    }));

    setClaimedName('');
    setSelectedClaimHizb(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Banner: Today's 5-Hizb Target & Progress Stats */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-glass-lg overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emeraldGlow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Stats Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 font-bold text-xs border border-gold-500/30">
                <Flame className="w-3.5 h-3.5 text-gold-400" />
                DAILY RECITATION COMMITMENT
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-celestial-400" />
                5 Hizb Daily Cycle
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Today's Recitation Goal: <span className="text-gold-300">Hizb 1 to 5</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Al-Qur'an completion (Khatam) tracking for the Tilawa Daily group. Mark completed portions and claim your turn to recite.
              </p>
            </div>

            {/* Today's Goal Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Today's Session Completion</span>
                <span className="text-gold-400">{todayCompletedCount} of 5 Hizbs Completed ({todayPercentage}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${todayPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Stats Ring (Overall 60-Hizb Khatam) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl glass-card border border-white/10 text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Radial Progress Graphic */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-gold-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{completedCount}</span>
                <span className="text-[9px] uppercase font-bold text-gold-400 tracking-wider">of 60</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-extrabold text-white">Full Khatam Progress</p>
              <p className="text-[11px] text-slate-400">{60 - completedCount} Hizbs remaining to Khatam</p>
            </div>
          </div>

        </div>

      </div>

      {/* View Switcher: Today's 5 Hizbs vs All 60 Hizbs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-2xl glass-card border border-white/10">
          <button
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'today'
                ? 'bg-gold-500/25 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Today's 5 Hizbs</span>
          </button>
          
          <button
            onClick={() => setActiveView('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'all'
                ? 'bg-gold-500/25 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>All 60 Hizbs (Full Cycle)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Click any Hizb to read in Mushaf or claim reciter turn
        </span>
      </div>

      {/* Hizb Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeView === 'today' ? todayHizbsList : hizbs).map((hizb) => {
          const isDone = hizb.status === 'completed';
          const isInProg = hizb.status === 'in_progress';

          return (
            <div
              key={hizb.hizbNumber}
              className={`p-5 rounded-3xl glass-card border transition-all flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-sm'
                  : isInProg
                  ? 'border-gold-500/40 bg-gold-950/20 shadow-gold-glow'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Top: Hizb # and Status Indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-2xl bg-gold-500/20 border border-gold-500/30 text-gold-300 font-extrabold text-sm flex items-center justify-center shadow-sm">
                      #{hizb.hizbNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">Hizb {hizb.hizbNumber}</h4>
                      <p className="text-[10px] text-slate-400">Juz {hizb.juzNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(hizb.hizbNumber)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'glass-card border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>

                {/* Starting Verse Info */}
                <div className="p-3 rounded-2xl bg-midnight-950/60 border border-white/5 my-3 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block text-left mb-0.5">Starting Portion:</span>
                  <p className="font-arabic text-base font-bold text-gold-200">
                    {hizb.surahArabic}
                  </p>
                  <p className="text-[11px] text-slate-300 text-left mt-1">
                    {hizb.surahName} (Ayah {hizb.startAyah})
                  </p>
                </div>

                {/* Assigned Reciter Display */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400 font-medium">Assigned Reciter:</span>
                  <span className={`font-bold ${hizb.assignedReciter ? 'text-gold-300' : 'text-slate-500'}`}>
                    {hizb.assignedReciter || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectHizb(hizb.hizbNumber)}
                  className="flex-1 py-2 px-3 rounded-xl glass-card border border-white/10 text-xs font-bold text-slate-200 hover:border-gold-500/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                  <span>Open in Mushaf</span>
                </button>

                <button
                  onClick={() => handleClaimClick(hizb.hizbNumber)}
                  className="py-2 px-3 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 text-xs font-bold text-gold-300 flex items-center gap-1 transition-colors"
                  title="Claim this Hizb to recite"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Claim</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reciter Claim Modal */}
      {selectedClaimHizb !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-gold-500/40 shadow-glass-lg relative animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-1">
              Claim Hizb #{selectedClaimHizb} for Recitation
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter your name to be assigned to recite Hizb {selectedClaimHizb} in today's Halaqah session.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafiz Ahmad"
                  value={claimedName}
                  onChange={(e) => setClaimedName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaimHizb(null)}
                  className="px-4 py-2 rounded-xl glass-card border border-white/10 text-xs font-bold text-slate-300 hover:border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow hover:bg-gold-400 transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
