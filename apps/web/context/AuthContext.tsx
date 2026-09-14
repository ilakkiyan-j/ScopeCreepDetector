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
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateCurrency: (currency: Currency) => void;
  createUser: (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => Promise<void>;
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
  company: 'ALXO Team',
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
const CREDENTIALS_KEY = 'scope_creep_passwords';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/** Initial password assigned to admin-created accounts (mock auth). */
const DEFAULT_NEW_USER_PASSWORD = 'Welcome123!';

/** Seeded credential passwords for the bundled demo/fixture accounts. */
const SEED_CREDENTIALS: Record<string, string> = {
  'demo@scopecreep.io': 'Demo123!',
  'admin@scopecreep.io': 'Admin123!',
  'jordan@designstudio.com': 'Jordan123!',
  'taylor@wordsmith.co': 'Taylor123!',
};

const PASSWORD_SALT = 'scope-creep-mock::';

/**
 * Password policy shared by sign-in and password change.
 * The mock store preserves this shape so the UX matches the real system.
 */
function passwordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  return null;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(PASSWORD_SALT + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readCredentials(): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string>;
  } catch {
    /* fall through */
  }
  return null;
}

function writeCredentials(creds: Record<string, string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

/** Seeds credential hashes on first ever sign-in attempt. */
async function ensureCredentials(): Promise<Record<string, string>> {
  const existing = readCredentials();
  if (existing) return existing;
  const seeded: Record<string, string> = {};
  for (const [email, pw] of Object.entries(SEED_CREDENTIALS)) {
    seeded[email] = await hashPassword(pw);
  }
  writeCredentials(seeded);
  return seeded;
}

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
    if (parsed.user.email.toLowerCase() === ADMIN_PROFILE.email) {
      return buildSession(ADMIN_PROFILE, 'signed-in');
    }
    // Any other signed-in session is re-derived from the canonical users store
    // (role included), so a forged session with a different role/email is rejected.
    const canonical = loadUsers().find((u) => u.email.toLowerCase() === parsed.user.email.toLowerCase());
    if (!canonical) return null;
    if (canonical.status === 'disabled') return null;
    return buildSession(
      { ...canonical, lastLoginAt: parsed.user.lastLoginAt ?? canonical.lastLoginAt },
      'signed-in',
      parsed.issuedAt
    );
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

      // Real password matching: seeded accounts no longer accept any password.
      const creds = await ensureCredentials();
      const storedHash = creds[normalized];
      const attemptHash = await hashPassword(normalizedPassword);
      if (!storedHash || storedHash !== attemptHash) {
        return {
          ok: false,
          error: 'That password does not match this account. If you forgot it, contact your administrator.',
        };
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

  const createUser = async (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => {
    const created: UserProfile = {
      ...newUser,
      userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      defaultCurrency: newUser.defaultCurrency ?? 'INR',
    };
    // Every new account starts with the documented initial password.
    const creds = await ensureCredentials();
    creds[created.email.toLowerCase()] = await hashPassword(DEFAULT_NEW_USER_PASSWORD);
    writeCredentials(creds);
    setAllUsers((prev) => {
      const next = [...prev, created];
      persistUsers(next);
      return next;
    });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'You must be signed in to change your password.' };
    if (session?.mode === 'demo') {
      return { ok: false, error: 'Demo accounts cannot change their password.' };
    }
    const email = user.email.toLowerCase();
    const creds = await ensureCredentials();
    const currentHash = await hashPassword(currentPassword);
    if (!creds[email] || creds[email] !== currentHash) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    const ruleError = passwordError(newPassword);
    if (ruleError) return { ok: false, error: ruleError };
    creds[email] = await hashPassword(newPassword);
    writeCredentials(creds);
    return { ok: true };
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
        changePassword,
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