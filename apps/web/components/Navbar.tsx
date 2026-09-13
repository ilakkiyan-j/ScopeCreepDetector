'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  History,
  Settings,
  Receipt,
  Cpu,
  ShieldCheck,
  Sun,
  Moon,
  UserCheck,
  Shield,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleTheme,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', href: '/', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', href: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      id: 'admin',
      label: 'Admin Portal',
      href: '/admin',
      icon: <Shield className="w-4 h-4 text-purple-500" />,
    });
  }

  const userName = user?.name || 'Alex Morgan';
  const userProfession = user?.profession || 'Freelance Web Dev';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Scope Creep Ledger
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Cpu className="w-3 h-3 text-cyan-500" /> Amazon Bedrock
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
                AI Scope Drift Accounting Workspace
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
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

          {/* Right Action Icons & Profile Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic Math Verified</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-sm"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* User Profile Link Badge */}
            <Link
              href="/profile"
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none flex items-center gap-1">
                  {userName}{' '}
                  {user?.role === 'ADMIN' ? (
                    <Shield className="w-3 h-3 text-purple-500" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-blue-500" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{userProfession}</span>
              </div>
            </Link>

            {/* Sign Out Button */}
            {user && (
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
