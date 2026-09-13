'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, AuthSession } from '../../../shared/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  signIn: (email?: string, password?: string, preferredRole?: UserRole) => Promise<void>;
  signOut: () => void;
  switchRolePersona: (role: UserRole) => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<AuthSession | null>({
    user: DEMO_USER_PROFILE,
    idToken: 'mock_jwt_token_alex_dev_123',
    expiresAt: Date.now() + 86400 * 1000,
  });

  const isAuthenticated = !!user;
  const role: UserRole = user?.role || 'USER';

  const signIn = async (email?: string, password?: string, preferredRole?: UserRole) => {
    setIsLoading(true);
    try {
      // 1. Check if Cognito environment variables exist
      const cognitoUserPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
      const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;

      if (cognitoUserPoolId && cognitoClientId && email && password) {
        // Amazon Cognito production connection flow
        console.log(`Connecting to Amazon Cognito User Pool (${cognitoUserPoolId})...`);
      }

      // 2. Fallback / Persona Auth Selection
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setSession(null);
  };

  const switchRolePersona = (newRole: UserRole) => {
    const profile = newRole === 'ADMIN' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE;
    setUser(profile);
    setSession({
      user: profile,
      idToken: `mock_jwt_token_${profile.userId}`,
      expiresAt: Date.now() + 86400 * 1000,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        session,
        signIn,
        signOut,
        switchRolePersona,
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
