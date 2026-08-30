import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isProfileDrawerOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string, role?: 'member' | 'ustadh') => Promise<void>;
  logout: () => void;
  updateUserRole: (role: 'admin' | 'ustadh' | 'reciter' | 'member') => void;
  incrementHizbCount: () => void;
}

const STORAGE_KEY = 'tilawa_daily_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with no pre-loaded demo user: only load if user actually logged in
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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileDrawer = () => setIsProfileDrawerOpen(true);
  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);

  // Social Login (Google / Facebook)
  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    // Generate member profile based on selected provider
    const names = provider === 'google' ? 'Google Member' : 'Facebook Member';
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

  // Email / Password Login
  const loginWithEmail = async (email: string) => {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('ustadh');

    const loggedUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: email,
      provider: 'email',
      role: isAdmin ? 'ustadh' : 'member',
      title: isAdmin ? 'Ustadh / Moderator' : 'Tilawa Reciter',
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today',
    };

    setUser(loggedUser);
    closeAuthModal();
  };

  // Sign Up
  const signupWithEmail = async (name: string, email: string, _pass: string, role: 'member' | 'ustadh' = 'member') => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      provider: 'email',
      role: role,
      title: role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today',
    };

    setUser(newUser);
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
    closeProfileDrawer();
  };

  const updateUserRole = (newRole: 'admin' | 'ustadh' | 'reciter' | 'member') => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
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
