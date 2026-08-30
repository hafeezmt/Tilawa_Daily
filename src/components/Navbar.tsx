import React from 'react';
import { Logo } from './Logo';
import { 
  Radio, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'halaqah' | 'quran' | 'tracker';
  setActiveTab: (tab: 'halaqah' | 'quran' | 'tracker') => void;
  openRules: () => void;
  listenerCount: number;
  isLive: boolean;
  onShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openRules,
  onShare,
}) => {
  const { user, isAuthenticated, openAuthModal, openProfileDrawer } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-midnight-950/80 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Logo size={36} showText={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                Tilawa Daily
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[10px] font-arabic text-gold-400 font-bold -mt-0.5 hidden sm:inline">
              تلاوة يومية • 5 أحزاب
            </span>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-midnight-900/90 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'halaqah'
                ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-midnight-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'halaqah' ? 'text-midnight-950' : 'text-gold-400'}`} />
            <span>Live Halaqah</span>
          </button>

          <button
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'quran'
                ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-midnight-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'quran' ? 'text-midnight-950' : 'text-gold-400'}`} />
            <span>Mushaf Quran</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'tracker'
                ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-midnight-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'tracker' ? 'text-midnight-950' : 'text-gold-400'}`} />
            <span>5-Hizb Schedule</span>
          </button>
        </nav>

        {/* Right: Actions & User Account */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Rules Quick Icon Button */}
          <button
            onClick={openRules}
            title="Dokokin Group / Rules"
            className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:text-gold-300 hover:border-gold-500/40 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
          </button>

          {/* Share Invitation Button */}
          <button
            onClick={onShare}
            title="Invite Group Members"
            className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:text-celestial-300 hover:border-celestial-500/40 transition-all"
          >
            <Share2 className="w-4 h-4 text-celestial-400" />
          </button>

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <button
              onClick={openProfileDrawer}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl glass-card border border-gold-500/30 hover:border-gold-400 transition-all bg-gold-500/10"
              title="Account & Stats"
            >
              <div className="w-6 h-6 rounded-full bg-gold-500 text-midnight-950 font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[85px]">
                {user.name.split(' ')[0]}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                user.role === 'ustadh' ? 'bg-gold-500/30 text-gold-200' : 'bg-slate-700/60 text-slate-300'
              }`}>
                {user.role === 'ustadh' ? 'Ustadh' : 'Reciter'}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-midnight-950 text-xs font-extrabold shadow-gold-glow transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Streamlined Segmented Bar */}
      <div className="flex md:hidden items-center p-0.5 rounded-xl bg-midnight-900/90 border border-white/10 mt-2">
        <button
          onClick={() => setActiveTab('halaqah')}
          className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'halaqah' ? 'bg-gold-500 text-midnight-950 font-extrabold shadow-sm' : 'text-slate-400'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>Halaqah</span>
        </button>
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'quran' ? 'bg-gold-500 text-midnight-950 font-extrabold shadow-sm' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Mushaf</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'tracker' ? 'bg-gold-500 text-midnight-950 font-extrabold shadow-sm' : 'text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>5-Hizb</span>
        </button>
      </div>
    </header>
  );
};
