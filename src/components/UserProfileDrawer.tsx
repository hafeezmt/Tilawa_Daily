import React from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Flame, 
  BookOpen, 
  Bookmark, 
  LogOut, 
  Award,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const UserProfileDrawer: React.FC = () => {
  const { user, isProfileDrawerOpen, closeProfileDrawer, logout, updateUserRole } = useAuth();

  if (!isProfileDrawerOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-midnight-950/70 backdrop-blur-md animate-fadeIn">
      {/* Drawer Container */}
      <div 
        className="w-full max-w-md h-full glass-panel border-l border-white/20 shadow-glass-lg p-6 sm:p-8 flex flex-col justify-between overflow-y-auto relative animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gold-400" />
              <h3 className="text-base font-bold text-white">Member Profile</h3>
            </div>
            <button
              onClick={closeProfileDrawer}
              className="p-2 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Card */}
          <div className="p-6 rounded-3xl glass-card border border-gold-500/30 text-center relative overflow-hidden mb-6">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-midnight-900 border-2 border-gold-400 flex items-center justify-center text-xl font-extrabold text-gold-200 shadow-gold-glow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 border-2 border-midnight-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-white">{user.name}</h4>
            <p className="text-xs text-slate-400">{user.email}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                user.role === 'ustadh' || user.role === 'admin'
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                  : 'bg-celestial-500/20 text-celestial-300 border border-celestial-500/40'
              }`}>
                {user.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter'}
              </span>
              <span className="px-2 py-0.5 rounded-full glass-card border border-white/10 text-[10px] text-slate-300 font-semibold">
                via {user.provider.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Recitation Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl glass-card border border-white/10 text-center">
              <BookOpen className="w-5 h-5 text-gold-400 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{user.hizbsRecited}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400">Hizbs Recited</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-white/10 text-center">
              <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{user.streakDays} Days</p>
              <p className="text-[10px] uppercase font-bold text-slate-400">Recitation Streak</p>
            </div>
          </div>

          {/* Role Switcher (For easy testing & permission change) */}
          <div className="p-4 rounded-2xl glass-card border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Switch Role / Permissions</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateUserRole('member')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  user.role === 'member'
                    ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40'
                    : 'glass-card text-slate-400 hover:text-white'
                }`}
              >
                Member
              </button>
              <button
                onClick={() => updateUserRole('ustadh')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  user.role === 'ustadh'
                    ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40'
                    : 'glass-card text-slate-400 hover:text-white'
                }`}
              >
                Ustadh / Admin
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Logout */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {user.joinedDate}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
