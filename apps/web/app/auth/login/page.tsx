'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Receipt, Lock, Mail, UserCheck, Shield, KeyRound, ArrowRight } from 'lucide-react';
import { UserRole } from '../../../../../shared/types';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('alex@freelance.dev');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password, selectedRole);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-md w-full rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 relative z-10 bg-slate-900/90">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 inline-flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Receipt className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Scope Creep Ledger</h1>
          <p className="text-xs text-slate-400">
            Sign in to access your audit workspace & change-order receipts
          </p>
        </div>

        {/* Demo Account Role Switcher */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Select Account Role Persona (Quick Sign-In)
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
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
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
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Admin Persona
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="alex@freelance.dev"
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

        <div className="pt-2 text-center text-xs text-slate-500">
          Integrated with <strong className="text-slate-400">Amazon Cognito User Pools</strong>
        </div>
      </div>
    </div>
  );
}
