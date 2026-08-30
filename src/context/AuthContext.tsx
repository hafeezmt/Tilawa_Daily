import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, MemberStatus, UserRole } from '../types';

export interface StoredMemberAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  passwordHash: string;
  role: UserRole;
  status: MemberStatus;
  title?: string;
  hizbsRecited: number;
  streakDays: number;
  bookmarks: number[];
  joinedDate: string;
}

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
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  applyForMembership: (name: string, email: string, phone: string, location: string, pass: string, role: 'member' | 'ustadh', adminPin?: string) => Promise<{ success: boolean; status: MemberStatus; message?: string }>;
  logout: () => void;
  updateUserRole: (role: UserRole, adminPin?: string) => boolean;
  incrementHizbCount: () => void;
  // Admin Approval Management
  allMembers: StoredMemberAccount[];
  pendingMembers: StoredMemberAccount[];
  approveMember: (id: string) => void;
  rejectMember: (id: string) => void;
}

const STORAGE_KEY = 'tilawa_daily_user_session';
const MEMBERS_DB_KEY = 'tilawa_members_registry_db';
export const ADMIN_SECURITY_PIN = '7860';

// Default initial master admin account
const INITIAL_ADMIN: StoredMemberAccount = {
  id: 'usr_lead_admin',
  name: 'Ustadh Mansur (Lead Admin)',
  email: 'admin@tilawadaily.com',
  phone: '+234 800 000 0000',
  location: 'Kano, Nigeria',
  passwordHash: 'admin123',
  role: 'admin',
  status: 'approved',
  title: 'Lead Ustadh / Moderator',
  hizbsRecited: 60,
  streakDays: 30,
  bookmarks: [1, 2, 3],
  joinedDate: 'Group Founder'
};

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

  const [membersList, setMembersList] = useState<StoredMemberAccount[]>(() => {
    try {
      const raw = localStorage.getItem(MEMBERS_DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading members DB', e);
    }
    return [INITIAL_ADMIN];
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(MEMBERS_DB_KEY, JSON.stringify(membersList));
  }, [membersList]);

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

  // STRICT LOGIN: Only approved members are allowed in
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError('Please enter your email or phone number.');
      return false;
    }

    if (!pass) {
      setAuthError('Please enter your password.');
      return false;
    }

    // Find in members list (supports matching either email or phone)
    const found = membersList.find(m => 
      m.email.toLowerCase() === cleanEmail || 
      m.phone.replace(/[^0-9]/g, '') === cleanEmail.replace(/[^0-9]/g, '')
    );

    if (!found) {
      setAuthError('Account not found. Please click "Apply to Join" to submit your membership application.');
      return false;
    }

    if (found.passwordHash !== pass) {
      setAuthError('Incorrect password. Please verify your credentials.');
      return false;
    }

    // CHECK APPROVAL STATUS
    if (found.status === 'pending') {
      setAuthError('Your membership application is currently PENDING APPROVAL by Tilawa Daily Admins. You will be able to log in once an Ustadh approves your profile.');
      return false;
    }

    if (found.status === 'rejected') {
      setAuthError('Your membership application was declined by the group administrators.');
      return false;
    }

    // Log in approved user
    const authenticatedUser: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      location: found.location,
      role: found.role,
      status: found.status,
      title: found.title || (found.role === 'admin' || found.role === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter'),
      hizbsRecited: found.hizbsRecited || 0,
      streakDays: found.streakDays || 1,
      bookmarks: found.bookmarks || [],
      joinedDate: found.joinedDate || 'Verified Member',
    };

    setUser(authenticatedUser);
    closeAuthModal();
    return true;
  };

  // APPLY FOR MEMBERSHIP (Requires Admin Approval)
  const applyForMembership = async (
    name: string,
    email: string,
    phone: string,
    location: string,
    pass: string,
    role: 'member' | 'ustadh' = 'member',
    adminPin?: string
  ): Promise<{ success: boolean; status: MemberStatus; message?: string }> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      const msg = 'Please enter your full name.';
      setAuthError(msg);
      return { success: false, status: 'rejected', message: msg };
    }

    if (!cleanPhone) {
      const msg = 'Please enter your WhatsApp / phone number.';
      setAuthError(msg);
      return { success: false, status: 'rejected', message: msg };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      setAuthError(msg);
      return { success: false, status: 'rejected', message: msg };
    }

    if (!pass || pass.length < 4) {
      const msg = 'Password must be at least 4 characters.';
      setAuthError(msg);
      return { success: false, status: 'rejected', message: msg };
    }

    // If applying for Ustadh, verify Admin PIN immediately
    let initialStatus: MemberStatus = 'pending';
    let assignedRole: UserRole = role;

    if (role === 'ustadh') {
      if (adminPin && adminPin.trim() === ADMIN_SECURITY_PIN) {
        initialStatus = 'approved'; // Ustadh with PIN is auto-approved
      } else {
        const msg = `Invalid Ustadh Security PIN. The PIN is required for Ustadh registration.`;
        setAuthError(msg);
        return { success: false, status: 'rejected', message: msg };
      }
    }

    // Check if duplicate email or phone
    const existing = membersList.find(m => 
      m.email.toLowerCase() === cleanEmail || 
      (cleanPhone && m.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''))
    );

    if (existing) {
      const msg = existing.status === 'pending'
        ? 'You have already submitted an application. It is pending review by the Admins.'
        : 'An account with this email/phone already exists. Please log in.';
      setAuthError(msg);
      return { success: false, status: existing.status, message: msg };
    }

    // Create member application
    const newMember: StoredMemberAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      location: location.trim() || 'Nigeria',
      passwordHash: pass,
      role: assignedRole,
      status: initialStatus,
      title: assignedRole === 'ustadh' ? 'Ustadh / Moderator' : 'Tilawa Reciter',
      hizbsRecited: 0,
      streakDays: 1,
      bookmarks: [],
      joinedDate: 'Joined Today'
    };

    setMembersList(prev => [...prev, newMember]);

    if (initialStatus === 'approved') {
      const verifiedUser: UserProfile = {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        location: newMember.location,
        role: newMember.role,
        status: 'approved',
        title: newMember.title,
        hizbsRecited: 0,
        streakDays: 1,
        bookmarks: [],
        joinedDate: 'Joined Today'
      };
      setUser(verifiedUser);
      closeAuthModal();
      return { success: true, status: 'approved' };
    }

    return { 
      success: true, 
      status: 'pending', 
      message: 'Your application has been submitted to Tilawa Daily Admins for approval!' 
    };
  };

  // ADMIN ACTION: Approve Member
  const approveMember = (id: string) => {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
  };

  // ADMIN ACTION: Reject Member
  const rejectMember = (id: string) => {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
  };

  const logout = () => {
    setUser(null);
    closeProfileDrawer();
  };

  const updateUserRole = (newRole: UserRole, adminPin?: string): boolean => {
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

  const pendingMembers = membersList.filter(m => m.status === 'pending');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.status === 'approved',
        isAuthModalOpen,
        isProfileDrawerOpen,
        authError,
        setAuthError,
        openAuthModal,
        closeAuthModal,
        openProfileDrawer,
        closeProfileDrawer,
        loginWithEmail,
        applyForMembership,
        logout,
        updateUserRole,
        incrementHizbCount,
        allMembers: membersList,
        pendingMembers,
        approveMember,
        rejectMember,
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
