'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  Receipt,
  Mail,
  UserCheck,
  Shield,
  KeyRound,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { UserRole } from '../../../../../shared/types';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isDarkMode, toggleTheme } = useAuth();

  const [email, setEmail] = useState('alex@freelance.dev');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password, selectedRole);
      if (selectedRole === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Scope Creep Ledger
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                AI Scope Expansion & Revenue Leakage Audit Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Product Overview
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" /> Open Demo Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Page Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Feature Value Spotlight */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
            <Cpu className="w-3.5 h-3.5" /> Amazon Bedrock & Cognito Integrated
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Sign In to Your <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">Scope Audit Workspace</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Access your active client projects, audit conversation threads for unbilled scope expansion, and generate instant change-order receipts.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI Scope Classifier</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distinguishes baseline scope commitments from unbilled client revision requests.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Deterministic Financial Calculations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Zero monetary hallucination. Unbilled totals are computed strictly in code (`hours × rate`).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right High-Contrast Sign In Form Card */}
        <div className="lg:w-5/12 w-full">
          <div className="glass-card rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 bg-white dark:bg-slate-900/90">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Sign In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials or select a preset demo persona below.
              </p>
            </div>

            {/* Persona Preset Switcher */}
            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Account Role Persona
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('USER');
                    setEmail('alex@freelance.dev');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedRole === 'USER'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> User Persona
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    setEmail('admin@scopecreep.io');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Persona
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="alex@freelance.dev"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Integrated with <strong className="text-slate-700 dark:text-slate-300">Amazon Cognito User Pools</strong>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Scope Creep Ledger • AI Scope Expansion Audit Workspace • AWS Amplify Hosted
      </footer>
    </div>
  );
}
