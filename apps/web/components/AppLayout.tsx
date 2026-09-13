'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  isDarkMode: propDarkMode,
  onToggleTheme: propToggleTheme,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { isDarkMode: contextDarkMode, toggleTheme } = useAuth();
  const currentDarkMode = propDarkMode ?? contextDarkMode;
  const currentToggleTheme = propToggleTheme ?? toggleTheme;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        isDarkMode={currentDarkMode}
        onToggleTheme={currentToggleTheme}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Scope Creep Ledger • AI Scope Expansion Audit Workspace • AWS Amplify Hosted
      </footer>
    </div>
  );
};
