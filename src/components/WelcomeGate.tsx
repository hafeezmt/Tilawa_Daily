import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Radio, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Phone,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

export const WelcomeGate: React.FC = () => {
  const { loginWithEmail, applyForMembership, authError, setAuthError } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'apply'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Application fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'ustadh'>('member');
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    await loginWithEmail(emailOrPhone, password);
    setIsLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const res = await applyForMembership(name, email, phone, location, password, selectedRole, adminPin);
    if (res.success && res.status === 'pending') {
      setIsSubmittedPending(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative z-10">
      
      {/* Central Glassmorphism Gate Card */}
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-10 border border-white/20 shadow-glass-lg relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Glowing Ambient Backgrounds */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-celestial-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative mb-5">
          <Logo size={70} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-amber-200">Tilawa Daily</span>
        </h1>
        <p className="text-sm font-arabic text-gold-300 font-bold mt-0.5">
          تلاوة يومية • 5 أحزاب
        </p>
        <p className="text-xs text-slate-300 mt-2 max-w-md">
          {authMode === 'login' 
            ? 'Sign in with your approved member account to enter the Halaqah.'
            : 'Apply for membership. All applications are reviewed and approved by Ustadhs / Admins.'}
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 w-full my-5">
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <Radio className="w-4 h-4 text-gold-400 mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">Live Voice</span>
          </div>
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <BookOpen className="w-4 h-4 text-gold-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">Mushaf</span>
          </div>
          <div className="p-2.5 rounded-2xl glass-card border border-white/10 flex flex-col items-center text-center">
            <CheckCircle2 className="w-4 h-4 text-gold-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-200 uppercase">5-Hizb Tracker</span>
          </div>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="w-full p-3.5 mb-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* PENDING SUBMISSION CONFIRMATION SCREEN */}
        {isSubmittedPending ? (
          <div className="w-full p-6 rounded-2xl glass-card border border-amber-500/40 bg-amber-500/10 text-center animate-fadeIn my-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-500/40">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-extrabold text-white">Application Submitted!</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Your application for <span className="font-bold text-gold-300">{name}</span> has been received.
            </p>
            <p className="text-xs text-amber-300 font-semibold mt-2">
              Status: ⏳ PENDING ADMIN APPROVAL
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              An Ustadh / Admin will review and approve your profile shortly. Once approved, you can sign in directly with your password.
            </p>

            <button
              onClick={() => {
                setIsSubmittedPending(false);
                setAuthMode('login');
              }}
              className="mt-4 px-6 py-2 rounded-xl bg-gold-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow hover:bg-gold-400 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Tabs: Sign In vs Apply for Membership */}
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
                Member Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('apply');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'apply' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-sm' : 'text-slate-400'
                }`}
              >
                Apply for Membership
              </button>
            </div>

            {/* FORM: SIGN IN */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="w-full space-y-3.5 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email Address or Phone Number</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. name@example.com or +234..."
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Password</label>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <span>{isLoading ? 'Verifying...' : 'Sign In to Halaqah'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM: APPLY FOR MEMBERSHIP */}
            {authMode === 'apply' && (
              <form onSubmit={handleApply} className="w-full space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ibrahim Abubakar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">WhatsApp / Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">City / State</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Kano, Abuja"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

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
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Create Password</label>
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

                <div className="pt-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Application Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('member')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
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
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
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
                      <span>Ustadh Security PIN</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Ustadh PIN"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium border-gold-500/40"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-midnight-950 font-extrabold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <span>{isLoading ? 'Submitting...' : 'Submit Membership Application'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}

        {/* Ustadh / Admin Quick Login Hint */}
        <div className="w-full mt-6 pt-4 border-t border-white/10 text-left p-3 rounded-2xl glass-card border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-gold-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Credentials:</span>
          </div>
          <span className="font-mono text-slate-300">admin@tilawadaily.com / admin123</span>
        </div>

      </div>
    </div>
  );
};
