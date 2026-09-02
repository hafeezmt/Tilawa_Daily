import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Plus, 
  Flame
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
            colors: ['#D97706', '#B45309', '#F59E0B', '#FBBF24']
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
      
      {/* Top Banner: Today's 5-Hizb Target & Progress Stats (White & Gold) */}
      <div className="relative rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Stats Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-xs border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                DAILY RECITATION COMMITMENT
              </span>
              <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                5 Hizb Daily Schedule
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Today's Recitation Target: <span className="text-amber-600">Hizb 1 to 5</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed font-medium">
                Al-Qur'an completion (Khatm) tracking for the Tilawa Daily circle. Mark completed portions or claim your turn to recite.
              </p>
            </div>

            {/* Today's Goal Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Today's Session Completion</span>
                <span className="text-amber-700">{todayCompletedCount} of 5 Hizbs Completed ({todayPercentage}%)</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${todayPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Stats Ring (Overall 60-Hizb Khatam) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-amber-50/50 border border-amber-200 text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Radial Progress Graphic */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">{completedCount}</span>
                <span className="text-[10px] uppercase font-black text-amber-700 tracking-wider">of 60</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-extrabold text-slate-900">Full Khatm Cycle</p>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">{60 - completedCount} Hizbs remaining</p>
            </div>
          </div>

        </div>

      </div>

      {/* View Switcher: Today's 5 Hizbs vs All 60 Hizbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'today'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Today's 5 Hizbs</span>
          </button>
          
          <button
            onClick={() => setActiveView('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'all'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>All 60 Hizbs (Full Cycle)</span>
          </button>
        </div>

        <span className="text-xs text-slate-600 font-medium hidden sm:inline">
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
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : isInProg
                  ? 'border-amber-400 bg-amber-50/40'
                  : 'border-slate-200 hover:border-amber-400 shadow-sm'
              }`}
            >
              {/* Card Top: Hizb # and Status Indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center border border-amber-200">
                      #{hizb.hizbNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">Hizb {hizb.hizbNumber}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Juz {hizb.juzNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(hizb.hizbNumber)}
                    className={`p-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>

                {/* Starting Verse Info */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 my-3 text-right">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block text-left mb-1 tracking-wider">Starting Portion:</span>
                  <p className="font-arabic text-base font-bold text-amber-800">
                    {hizb.surahArabic}
                  </p>
                  <p className="text-xs text-slate-700 text-left mt-1.5 font-medium">
                    {hizb.surahName} (Ayah {hizb.startAyah})
                  </p>
                </div>

                {/* Assigned Reciter Display */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Assigned Reciter:</span>
                  <span className={`font-bold ${hizb.assignedReciter ? 'text-amber-800' : 'text-slate-400'}`}>
                    {hizb.assignedReciter || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectHizb(hizb.hizbNumber)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-amber-400 hover:text-amber-800 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Open in Mushaf</span>
                </button>

                <button
                  onClick={() => handleClaimClick(hizb.hizbNumber)}
                  className="py-2 px-3.5 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center gap-1 hover:bg-amber-700 transition-all shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xl relative">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Claim Hizb #{selectedClaimHizb} for Recitation
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your name to be assigned to recite Hizb {selectedClaimHizb} in today's Halaqah session.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 tracking-wider">Your Full Name</label>
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
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700 shadow-sm"
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
