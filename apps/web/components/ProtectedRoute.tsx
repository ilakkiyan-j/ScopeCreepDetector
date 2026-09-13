'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../shared/types';
import { Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-300">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-amber-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You must be signed in to access the Scope Creep Ledger workspace.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            Sign In to Account
          </a>
        </div>
      </div>
    );
  }

  if (requiredRole && requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied (403)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This workspace area requires Administrator privileges (`ADMIN` role).
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Return to User Workspace
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
