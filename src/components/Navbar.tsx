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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Logo size={40} showText={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                Tilawa Daily
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>
            <span className="text-[11px] font-arabic text-amber-700 font-bold -mt-0.5 hidden sm:inline tracking-wider">
              تلاوة يومية • 5 أحزاب
            </span>
          </div>
        </div>

        {/* Center: Clean White & Gold Segmented Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('halaqah')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'halaqah'
                ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'halaqah' ? 'text-white' : 'text-amber-600'}`} />
            <span>Live Halaqah</span>
          </button>

          <button
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'quran'
                ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'quran' ? 'text-white' : 'text-amber-600'}`} />
            <span>Mushaf Quran</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'tracker'
                ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'tracker' ? 'text-white' : 'text-amber-600'}`} />
            <span>5-Hizb Schedule</span>
          </button>
        </nav>

        {/* Right: Actions & User Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Member Approvals Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminApprovalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-extrabold hover:bg-amber-100 transition-all shadow-sm"
              title="Review Member Applications"
            >
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingMembers.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black animate-pulse">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          )}

          {/* Rules Button */}
          <button
            onClick={openRules}
            title="Dokokin Group / Group Rules"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-300 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </button>

          {/* Share Invitation Button */}
          <button
            onClick={onShare}
            title="Invite Members to Halaqah"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-300 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-amber-600" />
          </button>

          {/* User Account / Profile */}
          {isAuthenticated && user ? (
            <button
              onClick={openProfileDrawer}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3.5 rounded-2xl bg-white border border-amber-300 hover:border-amber-500 transition-all shadow-sm"
              title="Account & Stats"
            >
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                {user.name.split(' ')[0]}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                user.role === 'ustadh' || user.role === 'admin' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {user.role === 'admin' ? 'Admin' : user.role === 'ustadh' ? 'Ustadh' : 'Reciter'}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Streamlined Segmented Bar */}
      <div className="flex md:hidden items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-2.5">
        <button
          onClick={() => setActiveTab('halaqah')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'halaqah' 
              ? 'bg-amber-600 text-white font-black shadow-sm' 
              : 'text-slate-600'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Halaqah</span>
        </button>
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quran' 
              ? 'bg-amber-600 text-white font-black shadow-sm' 
              : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mushaf</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'tracker' 
              ? 'bg-amber-600 text-white font-black shadow-sm' 
              : 'text-slate-600'
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
