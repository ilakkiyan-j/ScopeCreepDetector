'use client';

import React from 'react';
import { PieChart, CheckCircle2, AlertTriangle, HelpCircle, MessageSquare } from 'lucide-react';
import { ProjectAnalysis } from '../../../shared/types';

interface ScopeAnalyticsChartProps {
  summary: ProjectAnalysis;
}

export const ScopeAnalyticsChart: React.FC<ScopeAnalyticsChartProps> = ({ summary }) => {
  const total = summary.totalMessagesParsed || 1;
  const counts = summary.classificationsCount;

  const inScopePct = Math.round(((counts['in-scope'] || 0) / total) * 100);
  const newAskPct = Math.round(((counts['new-ask'] || 0) / total) * 100);
  const clarificationPct = Math.round(((counts['clarification'] || 0) / total) * 100);
  const offTopicPct = Math.round(((counts['off-topic'] || 0) / total) * 100);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <PieChart className="w-4 h-4 text-blue-500" />
          <span>Scope Classification Distribution</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {total} messages evaluated
        </span>
      </div>

      {/* Progress Bar Distribution Visual */}
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${newAskPct}%` }}
          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-500"
          title={`Scope Expansion: ${newAskPct}%`}
        />
        <div
          style={{ width: `${inScopePct}%` }}
          className="bg-emerald-500 h-full transition-all duration-500"
          title={`In-Scope: ${inScopePct}%`}
        />
        <div
          style={{ width: `${clarificationPct}%` }}
          className="bg-blue-500 h-full transition-all duration-500"
          title={`Clarification: ${clarificationPct}%`}
        />
        <div
          style={{ width: `${offTopicPct}%` }}
          className="bg-slate-400 dark:bg-slate-600 h-full transition-all duration-500"
          title={`Off-Topic: ${offTopicPct}%`}
        />
      </div>

      {/* Legend Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 rounded-lg border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>
            <strong>{counts['new-ask'] || 0}</strong> Scope Creep ({newAskPct}%)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            <strong>{counts['in-scope'] || 0}</strong> In-Scope ({inScopePct}%)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 p-2 rounded-lg border border-blue-500/20">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>
            <strong>{counts['clarification'] || 0}</strong> Clarify ({clarificationPct}%)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>
            <strong>{counts['off-topic'] || 0}</strong> Off-Topic ({offTopicPct}%)
          </span>
        </div>
      </div>
    </div>
  );
};
