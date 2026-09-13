'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Sun,
  Moon,
  Shield,
  LogOut,
  User,
  UserCheck,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode: propDarkMode,
  onToggleTheme: propToggleTheme,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { user, signOut, isDarkMode: contextDarkMode, toggleTheme, isAuthenticated } = useAuth();
  const currentDarkMode = propDarkMode ?? contextDarkMode;
  const currentToggleTheme = propToggleTheme ?? toggleTheme;

  // Build role-driven navigation items
  let navItems: { id: string; label: string; href: string; icon: React.ReactNode }[] = [];

  if (user?.role === 'ADMIN') {
    navItems = [
      {
        id: 'admin',
        label: 'Account Provisioning',
        href: '/admin',
        icon: <Shield className="w-4 h-4 text-purple-400" />,
      },
      {
        id: 'profile',
        label: 'Profile',
        href: '/profile',
        icon: <User className="w-4 h-4 text-slate-400" />,
      },
    ];
  } else if (isAuthenticated) {
    navItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/dashboard#projects',
        icon: <FolderKanban className="w-4 h-4" />,
      },
      {
        id: 'profile',
        label: 'Profile',
        href: '/profile',
        icon: <User className="w-4 h-4" />,
      },
    ];
  }

  const userName = user?.name || 'Alex Morgan';
  const userProfession = user?.profession || (user?.role === 'ADMIN' ? 'System Admin' : 'Freelance Dev');
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : '/dashboard') : '/'} className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="h-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Scope Creep Ledger
              </h1>
              {user?.role === 'ADMIN' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Shield className="w-3 h-3 text-purple-500" /> Admin
                </span>
              ) : isAuthenticated ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Freelancer
                </span>
              ) : null}
            </div>
          </Link>

          {/* Navigation Links */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onTabChange && onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={currentToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-sm"
            >
              {currentDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Authenticated User Badge & Sign Out */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                    user?.role === 'ADMIN'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                  }`}>
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none flex items-center gap-1">
                      {userName}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{userProfession}</span>
                  </div>
                </Link>

                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all shadow-sm ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
