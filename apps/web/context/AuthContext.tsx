'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole, AuthSession } from '../../../shared/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  allUsers: UserProfile[];
  signIn: (email?: string, password?: string, preferredRole?: UserRole) => Promise<void>;
  signOut: () => void;
  switchRolePersona: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  createUser: (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => void;
  toggleUserStatus: (userId: string) => void;
}

const DEMO_USER_PROFILE: UserProfile = {
  userId: 'usr_alex_dev_123',
  email: 'alex@freelance.dev',
  name: 'Alex Morgan',
  profession: 'Freelance Web Dev',
  company: 'Independent Contractor',
  role: 'USER',
  createdAt: '2026-01-15T08:00:00Z',
  status: 'active',
};

const DEMO_ADMIN_PROFILE: UserProfile = {
  userId: 'usr_admin_master_999',
  email: 'admin@scopecreep.io',
  name: 'Sarah Chen (Admin)',
  profession: 'System Administrator',
  company: 'Scope Creep Ledger Team',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00Z',
  status: 'active',
};

const INITIAL_USERS: UserProfile[] = [
  DEMO_USER_PROFILE,
  DEMO_ADMIN_PROFILE,
  {
    userId: 'usr_designer_456',
    email: 'jordan@designstudio.com',
    name: 'Jordan Lee',
    profession: 'UI/UX & Product Designer',
    company: 'PixelCraft Agency',
    role: 'USER',
    createdAt: '2026-02-10T10:30:00Z',
    status: 'active',
  },
  {
    userId: 'usr_copy_789',
    email: 'taylor@wordsmith.co',
    name: 'Taylor Reed',
    profession: 'Copywriter & Content Strategist',
    company: 'Wordsmith Copy',
    role: 'USER',
    createdAt: '2026-03-01T14:15:00Z',
    status: 'active',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('scope_creep_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return DEMO_USER_PROFILE;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() => {
    if (user) {
      return {
        user,
        idToken: `mock_jwt_token_${user.userId}`,
        expiresAt: Date.now() + 86400 * 1000,
      };
    }
    return null;
  });

  const isAuthenticated = !!user;
  const role: UserRole = user?.role || 'USER';

  const signIn = async (email?: string, password?: string, preferredRole?: UserRole) => {
    setIsLoading(true);
    try {
      const selectedProfile = preferredRole === 'ADMIN' || email?.includes('admin')
        ? DEMO_ADMIN_PROFILE
        : {
            ...DEMO_USER_PROFILE,
            email: email || DEMO_USER_PROFILE.email,
          };

      const newSession: AuthSession = {
        user: selectedProfile,
        idToken: `mock_jwt_token_${selectedProfile.userId}`,
        expiresAt: Date.now() + 86400 * 1000,
      };

      setUser(selectedProfile);
      setSession(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('scope_creep_user', JSON.stringify(selectedProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scope_creep_user');
    }
  };

  const switchRolePersona = (newRole: UserRole) => {
    const profile = newRole === 'ADMIN' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE;
    setUser(profile);
    setSession({
      user: profile,
      idToken: `mock_jwt_token_${profile.userId}`,
      expiresAt: Date.now() + 86400 * 1000,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('scope_creep_user', JSON.stringify(profile));
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.userId === user.userId ? updated : u)));
  };

  const createUser = (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => {
    const created: UserProfile = {
      ...newUser,
      userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setAllUsers((prev) => [...prev, created]);
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          return {
            ...u,
            status: u.status === 'active' ? 'disabled' : 'active',
          };
        }
        return u;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        session,
        allUsers,
        signIn,
        signOut,
        switchRolePersona,
        updateProfile,
        createUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
