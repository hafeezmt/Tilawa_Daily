import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

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

  // Instant 1-Click Social Login (Google / Facebook)
  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    const names = provider === 'google' ? 'Google Reciter' : 'Facebook Reciter';
    const email = provider === 'google' ? 'user@gmail.com' : 'user@facebook.com';
    
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

  // Reliable, Bulletproof Email Sign In
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }

    if (!pass) {
      setAuthError('Please enter your password.');
      return false;
    }

    const accounts = getRegisteredAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (found) {
      if (found.passwordHash !== pass) {
        setAuthError('Incorrect password for this email. Please check your password.');
        return false;
      }

      const verifiedUser: UserProfile = {
        id: found.id,
        name: found.name,
        email: found.email,
        provider: 'email',
        role: found.role,
        title: found.title || (found.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter'),
        hizbsRecited: found.hizbsRecited || 0,
        streakDays: found.streakDays || 1,
        bookmarks: found.bookmarks || [],
        joinedDate: found.joinedDate || 'Joined Recently',
      };

      setUser(verifiedUser);
      closeAuthModal();
      return true;
    }

    // If account doesn't exist yet, auto-register seamlessly so the user is NEVER blocked!
    const autoName = cleanEmail.split('@')[0];
    const formattedName = autoName.charAt(0).toUpperCase() + autoName.slice(1);
    const newAccount: StoredAccount = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      passwordHash: pass,
      role: 'member',
      title: 'Tilawa Reciter',
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

  // Sign Up
  const signupWithEmail = async (
    name: string, 
    email: string, 
    pass: string, 
    role: 'member' | 'ustadh' = 'member',
    adminPin?: string
  ): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }

    if (!pass || pass.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return false;
    }

    if (role === 'ustadh' && adminPin && adminPin.trim() !== ADMIN_SECURITY_PIN) {
      setAuthError(`Invalid Admin PIN. (Default Ustadh PIN is ${ADMIN_SECURITY_PIN})`);
      return false;
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

  const logout = () => {
    setUser(null);
    closeProfileDrawer();
  };

  const updateUserRole = (newRole: 'admin' | 'ustadh' | 'reciter' | 'member', adminPin?: string): boolean => {
    if (!user) return false;
    if (newRole === 'ustadh' || newRole === 'admin') {
      if (adminPin && adminPin !== ADMIN_SECURITY_PIN) {
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
