'use client';

import React from 'react';
import { Users, FolderKanban, Receipt, DollarSign, Activity } from 'lucide-react';
import { UserProfile } from '../../../shared/types';

interface AdminMetricsProps {
  users: UserProfile[];
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ users }) => {
  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-500" /> Total Users
          </span>
          <span className="text-[10px] font-semibold text-emerald-500 font-mono">{activeCount} active</span>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">{users.length}</div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5 text-cyan-500" /> Total Projects
          </span>
          <span className="text-[10px] font-mono text-slate-400">System wide</span>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">14</div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-amber-500" /> Creep Items
          </span>
          <span className="text-[10px] font-mono text-amber-500">Detected</span>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">61</div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Total Unbilled Value
          </span>
        </div>
        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">$6,840</div>
      </div>
    </div>
  );
};
