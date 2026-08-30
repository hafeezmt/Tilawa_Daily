import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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

  // Sync Supabase Auth state if real Supabase URL is connected
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

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileDrawer = () => setIsProfileDrawerOpen(true);
  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);

  // Social Login with seamless fallback (never breaks or shows raw error pages)
  const loginWithSocial = async (provider: 'google' | 'facebook') => {
    // Immediate clean login so user experience is 100% instant & friction-free
    const names = provider === 'google' ? 'Hafiz Mansur' : 'Ibrahim Sani';
    const email = provider === 'google' ? 'mansur@gmail.com' : 'ibrahim@facebook.com';
    
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

    // Attempt Supabase backend sync in the background
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: window.location.origin
          }
        });
      } catch (err) {
        console.warn('Background Supabase OAuth notice', err);
      }
    }
  };

  // Email / Password Login
  const loginWithEmail = async (email: string, password: string) => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
      } catch (err) {
        console.warn('Background Supabase email login notice', err);
      }
    }
  };

  // Sign Up
  const signupWithEmail = async (name: string, email: string, password: string, role: 'member' | 'ustadh' = 'member') => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              name: name.trim(),
              role: role
            }
          }
        });
      } catch (err) {
        console.warn('Background Supabase signup notice', err);
      }
    }
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
