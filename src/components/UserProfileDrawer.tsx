import React from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Flame, 
  BookOpen, 
  LogOut, 
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfileDrawer: React.FC = () => {
  const { user, isProfileDrawerOpen, closeProfileDrawer, logout, updateUserRole } = useAuth();

  if (!isProfileDrawerOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Drawer Container */}
      <div 
        className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto relative animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Member Profile</h3>
            </div>
            <button
              onClick={closeProfileDrawer}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Card */}
          <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200 text-center relative overflow-hidden mb-6">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-amber-600 border-2 border-amber-400 flex items-center justify-center text-xl font-extrabold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-600 border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-slate-900">{user.name}</h4>
            <p className="text-xs text-slate-600">{user.email}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                user.role === 'ustadh' || user.role === 'admin'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {user.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 font-semibold">
                via {(user.provider || 'email').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Recitation Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-black text-slate-900">{user.hizbsRecited}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Hizbs Recited</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <Flame className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-black text-slate-900">{user.streakDays} Days</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Recitation Streak</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Switch Role / Permissions</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateUserRole('member')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  user.role === 'member'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Member
              </button>
              <button
                onClick={() => {
                  const pin = prompt('Enter Ustadh Security PIN (7860):');
                  if (pin) updateUserRole('ustadh', pin);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  user.role === 'ustadh' || user.role === 'admin'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Ustadh Mode
              </button>
            </div>
          </div>

        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};
