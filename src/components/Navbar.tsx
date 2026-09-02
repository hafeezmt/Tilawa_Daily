import React, { useState } from 'react';
import { Logo } from './Logo';
import { 
  Radio, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  LogIn,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminApprovalModal } from './AdminApprovalModal';

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
  const { user, isAuthenticated, openAuthModal, openProfileDrawer, pendingMembers } = useAuth();
  const [isAdminApprovalModalOpen, setIsAdminApprovalModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'ustadh';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-midnight-950/85 border-b border-gold-500/20 px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Logo size={40} showText={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Tilawa Daily
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-400 shadow-gold-glow"></span>
              </span>
            </div>
            <span className="text-[11px] font-arabic text-gold-300 font-bold -mt-0.5 hidden sm:inline tracking-wider">
              تلاوة يومية • 5 أحزاب
            </span>
          </div>
        </div>

        {/* Center: Luxury Segmented Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1.5 rounded-2xl bg-midnight-900/90 border border-gold-500/20 shadow-inner">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'halaqah'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 shadow-gold-glow font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'halaqah' ? 'text-midnight-950' : 'text-gold-400 animate-pulse'}`} />
            <span>Live Halaqah</span>
          </button>

          <button
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'quran'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 shadow-gold-glow font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'quran' ? 'text-midnight-950' : 'text-gold-400'}`} />
            <span>Mushaf Quran</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'tracker'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 shadow-gold-glow font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'tracker' ? 'text-midnight-950' : 'text-gold-400'}`} />
            <span>5-Hizb Schedule</span>
          </button>
        </nav>

        {/* Right: Actions & User Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Member Approvals Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminApprovalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/50 text-xs font-extrabold hover:bg-gold-500/30 transition-all shadow-sm"
              title="Review Member Applications"
            >
              <UserCheck className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingMembers.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gold-500 text-midnight-950 text-[10px] font-black animate-pulse shadow-sm">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          )}

          {/* Rules Button */}
          <button
            onClick={openRules}
            title="Dokokin Group / Group Rules"
            className="p-2.5 rounded-xl glass-card border border-gold-500/20 text-slate-200 hover:text-gold-300 hover:border-gold-500/50 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
          </button>

          {/* Share Invitation Button */}
          <button
            onClick={onShare}
            title="Invite Members to Halaqah"
            className="p-2.5 rounded-xl glass-card border border-gold-500/20 text-slate-200 hover:text-gold-300 hover:border-gold-500/50 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-gold-400" />
          </button>

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <button
              onClick={openProfileDrawer}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3.5 rounded-2xl glass-card border border-gold-500/40 hover:border-gold-400 transition-all bg-gold-500/10 shadow-sm"
              title="Account & Stats"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gold-500 to-amber-400 text-midnight-950 font-black text-xs flex items-center justify-center shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[90px]">
                {user.name.split(' ')[0]}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                user.role === 'ustadh' || user.role === 'admin' 
                  ? 'bg-gold-500/30 text-gold-200 border border-gold-500/50' 
                  : 'bg-midnight-800 text-gold-300 border border-gold-500/20'
              }`}>
                {user.role === 'admin' ? 'Admin' : user.role === 'ustadh' ? 'Ustadh' : 'Reciter'}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 text-midnight-950 text-xs font-black shadow-gold-glow transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Streamlined Segmented Bar */}
      <div className="flex md:hidden items-center p-1 rounded-2xl bg-midnight-900/90 border border-gold-500/20 mt-2.5 shadow-inner">
        <button
          onClick={() => setActiveTab('halaqah')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'halaqah' 
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-black shadow-gold-glow' 
              : 'text-slate-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Halaqah</span>
        </button>
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quran' 
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-black shadow-gold-glow' 
              : 'text-slate-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mushaf</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'tracker' 
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-black shadow-gold-glow' 
              : 'text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>5-Hizb</span>
        </button>
      </div>

      {/* Admin Approval Management Modal */}
      <AdminApprovalModal
        isOpen={isAdminApprovalModalOpen}
        onClose={() => setIsAdminApprovalModalOpen(false)}
      />
    </header>
  );
};
