import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Radio, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

export const WelcomeGate: React.FC = () => {
  const { loginWithSocial, loginWithEmail, signupWithEmail, authError, setAuthError } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'ustadh'>('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialClick = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    await loginWithSocial(provider);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (authMode === 'login') {
      await loginWithEmail(email, password);
    } else {
      await signupWithEmail(name, email, password, selectedRole, adminPin);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative z-10">
      
      {/* Central Glassmorphism Login Gate Card */}
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-10 border border-white/20 shadow-glass-lg relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Glowing Ambient Backgrounds */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-celestial-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative mb-5">
          <Logo size={72} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-amber-200">Tilawa Daily</span>
        </h1>
        <p className="text-sm font-arabic text-gold-300 font-bold mt-0.5">
          تلاوة يومية • 5 أحزاب
        </p>
        <p className="text-xs text-slate-300 mt-2 max-w-md">
          {authMode === 'login' 
            ? 'Enter your registered email & password to access the Halaqah.'
            : 'Create your secure account to join our daily Quran recitation circle.'}
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 w-full my-5">
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <Radio className="w-4 h-4 text-gold-400 mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">Live Halaqah</span>
          </div>
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <BookOpen className="w-4 h-4 text-gold-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">Mushaf Quran</span>
          </div>
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <CheckCircle2 className="w-4 h-4 text-gold-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">5-Hizb Tracker</span>
          </div>
        </div>

        {/* Security Error Alert */}
        {authError && (
          <div className="w-full p-3 mb-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Social Authentication Buttons */}
        <div className="w-full flex flex-col gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => handleSocialClick('google')}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl glass-card border border-white/15 hover:border-gold-500/50 font-bold text-xs text-white flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/10 shadow-sm"
          >
            {/* Google Vector SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialClick('facebook')}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl glass-card border border-white/15 hover:border-celestial-500/50 font-bold text-xs text-white flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/10 shadow-sm"
          >
            {/* Facebook Vector SVG Icon */}
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            or with email & password
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="w-full flex items-center p-1 rounded-2xl glass-card border border-white/10 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authMode === 'login' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-sm' : 'text-slate-400'
            }`}
          >
            Sign In to Existing Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authMode === 'signup' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-sm' : 'text-slate-400'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 text-left">
          
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafiz Mansur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Password {authMode === 'signup' && <span className="text-slate-500 text-[10px] lowercase">(min 6 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('member')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === 'member'
                        ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                        : 'glass-card border-white/10 text-slate-400'
                    }`}
                  >
                    Member / Reciter
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ustadh')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === 'ustadh'
                        ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                        : 'glass-card border-white/10 text-slate-400'
                    }`}
                  >
                    Ustadh / Moderator
                  </button>
                </div>
              </div>

              {selectedRole === 'ustadh' && (
                <div className="p-3 rounded-2xl bg-gold-950/30 border border-gold-500/30">
                  <label className="block text-[11px] font-bold uppercase text-gold-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-gold-400" />
                    <span>Admin Security PIN</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter 4-digit Ustadh PIN (Default: 7860)"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium border-gold-500/40"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Ustadh role requires the Tilawa Daily admin security PIN to prevent unauthorized moderation.
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all mt-4"
          >
            <span>{isLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In' : 'Create Account & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="w-full mt-6 pt-4 border-t border-white/10 text-left p-3 rounded-2xl glass-card border border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-gold-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Moderator Demo Account:</span>
          </div>
          <p>Email: <span className="font-mono text-slate-200">mansur@tilawadaily.com</span></p>
          <p>Password: <span className="font-mono text-slate-200">Mansur@2026</span></p>
        </div>

      </div>
    </div>
  );
};
