import React from 'react';
import { Logo } from './Logo';
import { 
  Radio, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Share2,
  LogIn,
  User
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
  listenerCount,
  isLive,
  onShare,
}) => {
  const { user, isAuthenticated, openAuthModal, openProfileDrawer } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Logo size={42} showText={true} />
          
          {/* Live Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              {isLive ? 'HALAQAH LIVE' : 'SESSION READY'}
            </span>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              <span>{listenerCount}</span>
            </div>
          </div>
        </div>

        {/* Central Navigation Tabs (Glassmorphism Pill) */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl glass-card border border-white/10">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'halaqah'
                ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-gold-400" />
            <span>Live Halaqah</span>
          </button>

          <button
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'quran'
                ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-gold-400" />
            <span>Al-Qur'an Mushaf</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'tracker'
                ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>5-Hizb Schedule</span>
          </button>
        </nav>

        {/* Right Actions: Rules, Share, Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today's Goal Quick Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border border-gold-500/20">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse-slow" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Today's Reading</p>
              <p className="text-xs font-bold text-gold-300 leading-tight">Hizb 1 to 5</p>
            </div>
          </div>

          {/* Group Rules Button */}
          <button
            onClick={openRules}
            title="Dokokin Group / Group Rules"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card glass-card-hover border border-white/10 text-xs font-semibold text-slate-200 hover:border-gold-500/40"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Share Link */}
          <button
            onClick={onShare}
            title="Share Recitation Link"
            className="p-2 sm:px-3 sm:py-2 rounded-xl glass-card glass-card-hover border border-white/10 text-xs font-semibold text-slate-200 hover:border-gold-500/40 flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-celestial-400" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          {/* User Account / Login Button */}
          {isAuthenticated && user ? (
            <button
              onClick={openProfileDrawer}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl glass-card border border-gold-500/40 hover:border-gold-400 transition-all bg-gold-500/10"
              title="View Profile & Stats"
            >
              <div className="w-6 h-6 rounded-full bg-gold-500/30 text-gold-300 font-extrabold text-[11px] flex items-center justify-center border border-gold-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-200 truncate max-w-[90px]">
                {user.name.split(' ')[0]}
              </span>
              <span className={`hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase ${
                user.role === 'ustadh' ? 'bg-gold-500/30 text-gold-200' : 'bg-celestial-500/30 text-celestial-200'
              }`}>
                {user.role === 'ustadh' ? 'Ustadh' : 'Reciter'}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-midnight-950 text-xs font-extrabold shadow-gold-glow transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around mt-2 pt-2 border-t border-white/5 gap-1">
        <button
          onClick={() => setActiveTab('halaqah')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === 'halaqah' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' : 'text-slate-400'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Call</span>
        </button>
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === 'quran' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mushaf</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
            activeTab === 'tracker' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' : 'text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>5-Hizb</span>
        </button>
      </div>
    </header>
  );
};
