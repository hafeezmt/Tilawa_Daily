import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isProfileDrawerOpen: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, pass: string, role?: 'member' | 'ustadh', adminPin?: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (role: 'admin' | 'ustadh' | 'reciter' | 'member', adminPin?: string) => boolean;
  incrementHizbCount: () => void;
}

const STORAGE_KEY = 'tilawa_daily_user_session';
const USERS_DB_KEY = 'tilawa_registered_accounts_db';
export const ADMIN_SECURITY_PIN = '7860';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'ustadh' | 'reciter' | 'member';
  title?: string;
  hizbsRecited: number;
  streakDays: number;
  bookmarks: number[];
  joinedDate: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return null;
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Sync Supabase Auth session if active
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const userMeta = u.user_metadata || {};
          const syncedUser: UserProfile = {
            id: u.id,
            name: userMeta.full_name || userMeta.name || u.email?.split('@')[0] || 'Member',
            email: u.email || '',
            avatar: userMeta.avatar_url,
            provider: (u.app_metadata?.provider as any) || 'email',
            role: userMeta.role || (u.email?.includes('ustadh') ? 'ustadh' : 'member'),
            title: userMeta.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
            hizbsRecited: userMeta.hizbsRecited || 0,
            streakDays: userMeta.streakDays || 1,
            bookmarks: userMeta.bookmarks || [],
            joinedDate: 'Joined Recently'
          };
          setUser(syncedUser);
        }
      }).catch(e => console.warn('Supabase session notice', e));

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const userMeta = u.user_metadata || {};
          setUser({
            id: u.id,
            name: userMeta.full_name || userMeta.name || u.email?.split('@')[0] || 'Member',
            email: u.email || '',
            avatar: userMeta.avatar_url,
            provider: (u.app_metadata?.provider as any) || 'email',
            role: userMeta.role || 'member',
            title: userMeta.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
            hizbsRecited: 0,
            streakDays: 1,
            bookmarks: [],
            joinedDate: 'Joined Recently'
          });
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (err) {
      console.warn('Supabase auth listener notice', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  };
  const openProfileDrawer = () => setIsProfileDrawerOpen(true);
  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);

  // Helper: Get registered accounts
  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  // Helper: Save new account
  const saveAccountToDb = (account: StoredAccount) => {
    const existing = getRegisteredAccounts();
    const filtered = existing.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([...filtered, account]));
  };

  // Social Login with Google / Facebook
  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: window.location.origin
          }
        });
        if (!error) {
          closeAuthModal();
          return;
        }
      } catch (err) {
        console.warn('OAuth notice', err);
      }
    }

    const names = provider === 'google' ? 'Google Member' : 'Facebook Member';
    const email = provider === 'google' ? 'member@gmail.com' : 'member@facebook.com';
    
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: names,
      email: email,
      provider: provider,
      role: 'member',
      title: 'Tilawa Reciter',
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today',
    };
    setUser(newUser);
    closeAuthModal();
  };

  // STRICT Email & Password Login
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }

    if (!pass || pass.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return false;
    }

    // Check Supabase first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });

        if (data.user && !error) {
          const u = data.user;
          const userMeta = u.user_metadata || {};
          setUser({
            id: u.id,
            name: userMeta.name || cleanEmail.split('@')[0],
            email: u.email || cleanEmail,
            provider: 'email',
            role: userMeta.role || 'member',
            title: userMeta.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
            hizbsRecited: 0,
            streakDays: 1,
            bookmarks: [],
            joinedDate: 'Joined Today'
          });
          closeAuthModal();
          return true;
        } else if (error) {
          setAuthError(error.message || 'Invalid login credentials. Please check your email and password.');
          return false;
        }
      } catch (err: any) {
        console.warn('Supabase auth notice', err);
      }
    }

    // Check registered accounts database
    const accounts = getRegisteredAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!found) {
      setAuthError('No account found with this email. Please switch to "Create New Account" tab to register.');
      return false;
    }

    if (found.passwordHash !== pass) {
      setAuthError('Incorrect password. Please verify your credentials.');
      return false;
    }

    const verifiedUser: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      provider: 'email',
      role: found.role,
      title: found.title || (found.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter'),
      hizbsRecited: found.hizbsRecited,
      streakDays: found.streakDays,
      bookmarks: found.bookmarks,
      joinedDate: found.joinedDate,
    };

    setUser(verifiedUser);
    closeAuthModal();
    return true;
  };

  // STRICT Account Registration
  const signupWithEmail = async (
    name: string, 
    email: string, 
    pass: string, 
    role: 'member' | 'ustadh' = 'member',
    adminPin?: string
  ): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      setAuthError('Please enter your full name.');
      return false;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }

    if (!pass || pass.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return false;
    }

    if (role === 'ustadh') {
      if (!adminPin || adminPin.trim() !== ADMIN_SECURITY_PIN) {
        setAuthError(`Invalid Admin Security PIN.`);
        return false;
      }
    }

    const accounts = getRegisteredAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setAuthError('An account with this email already exists. Please sign in instead.');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              name: cleanName,
              role: role
            }
          }
        });
        if (error) {
          setAuthError(error.message);
          return false;
        }
      } catch (err: any) {
        console.warn('Supabase signup notice', err);
      }
    }

    const newAccount: StoredAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: pass,
      role: role,
      title: role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today'
    };

    saveAccountToDb(newAccount);

    const newUser: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      provider: 'email',
      role: newAccount.role,
      title: newAccount.title,
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today'
    };

    setUser(newUser);
    closeAuthModal();
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice', err);
      }
    }
    setUser(null);
    closeProfileDrawer();
  };

  const updateUserRole = (newRole: 'admin' | 'ustadh' | 'reciter' | 'member', adminPin?: string): boolean => {
    if (!user) return false;
    if (newRole === 'ustadh' || newRole === 'admin') {
      if (adminPin !== ADMIN_SECURITY_PIN) {
        alert(`Security Error: Invalid Admin PIN.`);
        return false;
      }
    }
    setUser({ ...user, role: newRole });
    return true;
  };

  const incrementHizbCount = () => {
    if (user) {
      setUser(prev => prev ? { ...prev, hizbsRecited: prev.hizbsRecited + 1 } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        isProfileDrawerOpen,
        authError,
        setAuthError,
        openAuthModal,
        closeAuthModal,
        openProfileDrawer,
        closeProfileDrawer,
        loginWithSocial,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateUserRole,
        incrementHizbCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
