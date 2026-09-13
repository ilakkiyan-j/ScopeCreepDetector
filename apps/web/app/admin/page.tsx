'use client';

import React from 'react';
import { AppLayout } from '../../components/AppLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminMetrics } from '../../components/AdminMetrics';
import { UserManagementTable } from '../../components/UserManagementTable';
import { useAuth } from '../../context/AuthContext';
import { Shield, Server, Activity, Lock } from 'lucide-react';

export default function AdminPage() {
  const { allUsers, toggleUserStatus, createUser, isDarkMode, handleToggleTheme } = useAuth() as any;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AppLayout
        isDarkMode={isDarkMode ?? true}
        onToggleTheme={handleToggleTheme ?? (() => {})}
        activeTab="admin"
      >
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  System Administration Portal
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Operational visibility, user status management, and system-wide metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
              <Server className="w-3.5 h-3.5" /> Region: ap-southeast-2 (Sydney)
            </div>
          </div>

          {/* Admin KPI Metric Overview */}
          <AdminMetrics users={allUsers || []} />

          {/* User Account Directory & Management Table */}
          <UserManagementTable
            users={allUsers || []}
            onToggleStatus={toggleUserStatus}
            onCreateUser={createUser}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
