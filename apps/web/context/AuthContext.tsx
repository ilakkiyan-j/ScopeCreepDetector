'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, AuthSession, SessionMode, Currency } from '@scope-creep-ledger/shared';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  session: AuthSession | null;
  allUsers: UserProfile[];
  isDarkMode: boolean;
  toggleTheme: () => void;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signInDemo: () => void;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateCurrency: (currency: Currency) => void;
  createUser: (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => void;
  toggleUserStatus: (userId: string) => void;
}

const DEMO_USER_PROFILE: UserProfile = {
  userId: 'usr_demo_001',
  email: 'demo@scopecreep.io',
  name: 'Demo User',
  profession: 'Freelance Web Dev',
  company: 'Demo Workspace',
  role: 'USER',
  createdAt: '2026-01-15T08:00:00Z',
  status: 'active',
  defaultCurrency: 'USD',
};

const ADMIN_PROFILE: UserProfile = {
  userId: 'usr_admin_master_999',
  email: 'admin@scopecreep.io',
  name: 'Sara Chen',
  profession: 'System Administrator',
  company: 'Scope Creep Ledger Team',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00Z',
  status: 'active',
  defaultCurrency: 'USD',
};

const INITIAL_USERS: UserProfile[] = [
  DEMO_USER_PROFILE,
  ADMIN_PROFILE,
  {
    userId: 'usr_designer_456',
    email: 'jordan@designstudio.com',
    name: 'Jordan Lee',
    profession: 'Product Designer',
    company: 'PixelCraft Agency',
    role: 'USER',
    createdAt: '2026-02-10T10:30:00Z',
    status: 'active',
    defaultCurrency: 'INR',
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
    defaultCurrency: 'INR',
  },
];

const SESSION_KEY = 'scope_creep_session';
const USERS_KEY = 'scope_creep_users';
const THEME_KEY = 'scope_creep_theme';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function buildSession(user: UserProfile, mode: SessionMode, now = Date.now()): AuthSession {
  return { user, mode, issuedAt: now, expiresAt: now + SESSION_TTL_MS };
}

function loadStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.user || !parsed.mode || parsed.expiresAt < Date.now()) return null;
    // Demo or admin profiles are re-derived from canonical fixtures to keep
    // tampered localStorage from elevating privileges.
    if (parsed.mode === 'demo') {
      return buildSession(DEMO_USER_PROFILE, 'demo');
    }
    if (parsed.user.email === ADMIN_PROFILE.email) {
      return buildSession(ADMIN_PROFILE, 'signed-in');
    }
    return parsed;
  } catch {
    return null;
  }
}

function loadUsers(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return INITIAL_USERS;
  try {
    const parsed = JSON.parse(raw) as UserProfile[];
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
  } catch {
    /* fall through */
  }
  return INITIAL_USERS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth + theme hydrate from localStorage only after mount, so the initial
  // server and client trees render the same loading state (no hydration mismatch
  // in AuthGuard/shells, which skirt the client-only session).
  const [session, setSession] = useState<AuthSession | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => loadUsers());
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const user = session?.user ?? null;
  const role: UserRole = user?.role ?? 'USER';
  const isAuthenticated = !!user;
  const isDemo = session?.mode === 'demo'

  const persistSession = (next: AuthSession | null) => {
    if (typeof window === 'undefined') return;
    if (next) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const persistUsers = (users: UserProfile[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      // Mock validation: seeded accounts accept any non-empty password.
      if (!normalized || !normalizedPassword) {
        return { ok: false, error: 'Enter your email and password to continue.' };
      }

      const profile = allUsers.find((u) => u.email.toLowerCase() === normalized);
      if (!profile) {
        return {
          ok: false,
          error: 'No account found with this email. Accounts are provisioned by your administrator.',
        };
      }
      if (profile.status === 'disabled') {
        return { ok: false, error: 'This account is disabled. Contact your administrator.' };
      }

      const mode: SessionMode = 'signed-in';
      const next = buildSession({ ...profile, lastLoginAt: new Date().toISOString() }, mode);
      setSession(next);
      persistSession(next);
      return { ok: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInDemo = () => {
    const next = buildSession({ ...DEMO_USER_PROFILE, lastLoginAt: new Date().toISOString() }, 'demo');
    setSession(next);
    persistSession(next);
  };

  const signOut = () => {
    setSession(null);
    persistSession(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!session) return;
    const updated = { ...session.user, ...updates };
    const next = buildSession(updated, session.mode, session.issuedAt);
    setSession(next);
    persistSession(next);
    setAllUsers((prev) => {
      const mapped = prev.map((u) => (u.userId === updated.userId ? updated : u));
      persistUsers(mapped);
      return mapped;
    });
  };

  const updateCurrency = (currency: Currency) => {
    updateProfile({ defaultCurrency: currency });
  };

  const createUser = (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => {
    const created: UserProfile = {
      ...newUser,
      userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      defaultCurrency: newUser.defaultCurrency ?? 'INR',
    };
    setAllUsers((prev) => {
      const next = [...prev, created];
      persistUsers(next);
      return next;
    });
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) => {
      const next = prev.map((u) =>
        u.userId === userId
          ? { ...u, status: u.status === 'active' ? ('disabled' as const) : ('active' as const) }
          : u
      );
      persistUsers(next);
      return next;
    });
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Client-only hydration: restore the stored session and theme, and apply the
  // persisted theme to <html> so the mount-time effect below cannot clobber it.
  useEffect(() => {
    setSession(loadStoredSession());
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const storedDark = stored === null ? true : stored === 'dark';
      setIsDarkMode(storedDark);
      document.documentElement.classList.toggle('dark', storedDark);
    } catch {
      /* ignore storage errors */
    }
    setIsLoading(false);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Skip the mount render — the hydration effect above restored the theme.
    if (!isHydrated) return;
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isHydrated, isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        isDemo,
        session,
        allUsers,
        isDarkMode,
        toggleTheme,
        signIn,
        signInDemo,
        signOut,
        updateProfile,
        updateCurrency,
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