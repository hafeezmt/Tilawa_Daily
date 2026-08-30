import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  AlertCircle,
  KeyRound,
  Phone,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithEmail, applyForMembership, authError, setAuthError } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'apply'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Apply fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'ustadh'>('member');
  const [isPendingSubmitted, setIsPendingSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

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
      setIsPendingSubmitted(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight-950/85 backdrop-blur-2xl animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-glass-lg relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <Logo size={48} />
          <h3 className="text-xl font-extrabold text-white mt-3">
            {authMode === 'login' ? 'Sign In to Tilawa Daily' : 'Apply for Membership'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {authMode === 'login' 
              ? 'Enter your verified credentials to enter the Halaqah' 
              : 'Submit your profile for admin verification'}
          </p>
        </div>

        {authError && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {isPendingSubmitted ? (
          <div className="p-5 rounded-2xl glass-card border border-amber-500/40 bg-amber-500/10 text-center animate-fadeIn my-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Application Received!</h4>
            <p className="text-xs text-amber-300 font-semibold mt-1">Status: Pending Admin Approval</p>
            <p className="text-[11px] text-slate-400 mt-2">
              An Ustadh will review and approve your membership request shortly.
            </p>
            <button
              onClick={() => {
                setIsPendingSubmitted(false);
                setAuthMode('login');
              }}
              className="mt-4 px-5 py-1.5 rounded-xl bg-gold-500 text-midnight-950 font-bold text-xs hover:bg-gold-400"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center p-1 rounded-2xl glass-card border border-white/10 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'login' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40' : 'text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('apply');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'apply' ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40' : 'text-slate-400'
                }`}
              >
                Apply to Join
              </button>
            </div>

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email or Phone</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Email or phone number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
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
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 text-midnight-950 font-extrabold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all mt-3"
                >
                  <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">WhatsApp / Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
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
                      className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
                    />
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
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-medium border-gold-500/40"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 text-midnight-950 font-extrabold text-xs shadow-gold-glow flex items-center justify-center gap-2 transition-all mt-3"
                >
                  <span>{isLoading ? 'Submitting...' : 'Submit Application'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
