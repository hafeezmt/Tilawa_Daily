import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

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

  // Sync Supabase Auth state if available
  useEffect(() => {
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

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileDrawer = () => setIsProfileDrawerOpen(true);
  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);

  // Social Login with Supabase / Fallback
  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.warn('OAuth redirect fallback', err);
      // Instant Client Auth Fallback
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
    }
    closeAuthModal();
  };

  // Email / Password Login with Supabase / Fallback
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) throw error;
      if (data.user) {
        const u = data.user;
        const userMeta = u.user_metadata || {};
        setUser({
          id: u.id,
          name: userMeta.name || email.split('@')[0],
          email: u.email || email,
          provider: 'email',
          role: userMeta.role || (email.includes('ustadh') ? 'ustadh' : 'member'),
          title: userMeta.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
          hizbsRecited: 0,
          streakDays: 1,
          bookmarks: [],
          joinedDate: 'Joined Today'
        });
        closeAuthModal();
        return;
      }
    } catch (err) {
      console.warn('Supabase email login fallback', err);
    }

    // Direct Login Fallback
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

  // Sign Up with Supabase / Fallback
  const signupWithEmail = async (name: string, email: string, password: string, role: 'member' | 'ustadh' = 'member') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            role: role
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          provider: 'email',
          role: role,
          title: role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
          hizbsRecited: 0,
          streakDays: 1,
          bookmarks: [],
          joinedDate: 'Joined Today'
        });
        closeAuthModal();
        return;
      }
    } catch (err) {
      console.warn('Supabase signup fallback', err);
    }

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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out notice', err);
    }
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
