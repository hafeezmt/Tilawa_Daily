import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Plus, 
  Flame,
  Check
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
            particleCount: 55,
            spread: 65,
            origin: { y: 0.7 },
            colors: ['#ECC272', '#FAF2DE', '#38BDF8', '#10B981']
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
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-glass-lg overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emeraldGlow-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Stats Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 font-extrabold text-xs border border-gold-500/40 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-gold-400" />
                DAILY RECITATION COMMITMENT
              </span>
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-celestial-400" />
                5 Hizb Daily Schedule
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Today's Recitation Target: <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-300 to-amber-300">Hizb 1 to 5</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl leading-relaxed font-medium">
                Al-Qur'an completion (Khatm) tracking for the Tilawa Daily circle. Mark completed portions or claim your turn to recite.
              </p>
            </div>

            {/* Today's Goal Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-200">Today's Session Completion</span>
                <span className="text-gold-300">{todayCompletedCount} of 5 Hizbs Completed ({todayPercentage}%)</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-midnight-950/80 border border-white/15 overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-gold-glow"
                  style={{ width: `${todayPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Stats Ring (Overall 60-Hizb Khatam) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl glass-card border border-white/15 text-center shadow-glass-md">
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
                <span className="text-xl font-black text-white">{completedCount}</span>
                <span className="text-[10px] uppercase font-black text-gold-300 tracking-wider">of 60</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-extrabold text-white">Full Khatm Cycle</p>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">{60 - completedCount} Hizbs remaining to Khatm</p>
            </div>
          </div>

        </div>

      </div>

      {/* View Switcher: Today's 5 Hizbs vs All 60 Hizbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1.5 rounded-2xl glass-card border border-white/15 shadow-inner">
          <button
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'today'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 shadow-gold-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's 5 Hizbs</span>
          </button>
          
          <button
            onClick={() => setActiveView('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'all'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 shadow-gold-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All 60 Hizbs (Full Cycle)</span>
          </button>
        </div>

        <span className="text-xs text-slate-300 font-medium hidden sm:inline">
          Click any Hizb to read in Mushaf or claim your turn to recite
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
                  ? 'border-emerald-500/50 bg-emerald-950/25 shadow-emerald-glow'
                  : isInProg
                  ? 'border-gold-500/50 bg-gold-950/25 shadow-gold-glow'
                  : 'border-white/15 hover:border-gold-500/40'
              }`}
            >
              {/* Card Top: Hizb # and Status Indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-400 text-midnight-950 font-black text-sm flex items-center justify-center shadow-md">
                      #{hizb.hizbNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-tight">Hizb {hizb.hizbNumber}</h4>
                      <p className="text-[11px] text-slate-300 font-medium">Juz {hizb.juzNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(hizb.hizbNumber)}
                    className={`p-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50 shadow-sm'
                        : 'glass-card border-white/15 text-slate-300 hover:text-white'
                    }`}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-400" />}
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>

                {/* Starting Verse Info */}
                <div className="p-3.5 rounded-2xl bg-midnight-950/70 border border-white/10 my-3 text-right">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block text-left mb-1 tracking-wider">Starting Portion:</span>
                  <p className="font-arabic text-base font-bold text-gold-200">
                    {hizb.surahArabic}
                  </p>
                  <p className="text-xs text-slate-200 text-left mt-1.5 font-medium">
                    {hizb.surahName} (Ayah {hizb.startAyah})
                  </p>
                </div>

                {/* Assigned Reciter Display */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300 font-medium">Assigned Reciter:</span>
                  <span className={`font-bold ${hizb.assignedReciter ? 'text-gold-300' : 'text-slate-400'}`}>
                    {hizb.assignedReciter || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectHizb(hizb.hizbNumber)}
                  className="flex-1 py-2 px-3 rounded-xl glass-card border border-white/15 text-xs font-bold text-slate-200 hover:border-gold-500/40 hover:text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                  <span>Open in Mushaf</span>
                </button>

                <button
                  onClick={() => handleClaimClick(hizb.hizbNumber)}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-black text-xs flex items-center gap-1 shadow-gold-glow hover:from-gold-400 hover:to-amber-400 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-gold-500/50 shadow-glass-lg relative">
            <h3 className="text-lg font-extrabold text-white mb-1">
              Claim Hizb #{selectedClaimHizb} for Recitation
            </h3>
            <p className="text-xs text-slate-200 mb-4 leading-relaxed">
              Enter your name to be assigned to recite Hizb {selectedClaimHizb} in today's Halaqah session.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafiz Ahmad"
                  value={claimedName}
                  onChange={(e) => setClaimedName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaimHizb(null)}
                  className="px-4 py-2 rounded-xl glass-card border border-white/15 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow hover:from-gold-400 hover:to-amber-400"
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
