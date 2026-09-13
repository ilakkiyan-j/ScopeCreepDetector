'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Receipt, Mail, UserCheck, Shield, KeyRound, ArrowRight, UserPlus, LogIn, User, Briefcase } from 'lucide-react';
import { UserRole } from '../../../../../shared/types';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const { signIn, createUser } = useAuth() as any;

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('alex@freelance.dev');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Freelance Web Dev');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
      setEmail('');
    } else if (mode === 'signin') {
      setAuthMode('signin');
      setEmail('alex@freelance.dev');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const newUserEmail = email || 'newuser@agency.com';
        const newUserName = name || 'New Freelancer';
        createUser({
          name: newUserName,
          email: newUserEmail,
          profession,
          role: selectedRole,
          status: 'active',
        });
        await signIn(newUserEmail, password, selectedRole);
      } else {
        await signIn(email, password, selectedRole);
      }
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card max-w-md w-full rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 relative z-10 bg-slate-900/95 transform-gpu">
      {/* Header Branding */}
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 inline-flex items-center justify-center shadow-lg shadow-blue-500/20 mb-1">
          <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Receipt className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Scope Creep Ledger</h1>
        <p className="text-xs text-slate-400">
          {authMode === 'signin'
            ? 'Sign in to access your audit workspace & change-order receipts'
            : 'Create your workspace account & setup Amazon Cognito session'}
        </p>
      </div>

      {/* Auth Mode Tab Switcher (Sign In vs Sign Up) */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('signin');
            setEmail('alex@freelance.dev');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            authMode === 'signin'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" /> Sign In
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('signup');
            setEmail('');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            authMode === 'signup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Create Account
        </button>
      </div>

      {/* Demo Account Role Switcher */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Select Account Role Persona
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('USER');
              if (authMode === 'signin') setEmail('alex@freelance.dev');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              selectedRole === 'USER'
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" /> User Persona
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('ADMIN');
              if (authMode === 'signin') setEmail('admin@scopecreep.io');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              selectedRole === 'ADMIN'
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" /> Admin Persona
          </button>
        </div>
      </div>

      {/* Sign In / Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Alex Morgan"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-500" /> Account Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={authMode === 'signin' ? 'alex@freelance.dev' : 'you@company.com'}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {authMode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Primary Profession
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Freelance Web Dev">💻 Freelance Web / Software Dev</option>
              <option value="UI/UX & Product Designer">🎨 UI/UX & Product Designer</option>
              <option value="Copywriter & Content Strategist">✍️ Copywriter & Content</option>
              <option value="Video Editor & Motion Designer">🎥 Video Editor & Motion</option>
              <option value="Consultant / Marketer">📊 Consultant & Strategist</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {authMode === 'signin' ? 'Sign In to Workspace' : 'Create & Provision Account'}{' '}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500">
        Integrated with <strong className="text-slate-400">Amazon Cognito User Pools</strong>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Optimized Hardware-Accelerated Background Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none transform-gpu opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%)',
        }}
      />

      <Suspense
        fallback={
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-800 p-8 text-center text-slate-400 text-xs font-mono">
            Loading authentication workspace...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
