'use client';

import React from 'react';
import { Receipt, Clock, DollarSign, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { ProjectAnalysis, LedgerItem } from '../../../shared/types';
import { ScopeAnalyticsChart } from './ScopeAnalyticsChart';

interface LedgerPanelProps {
  summary: ProjectAnalysis;
  onOpenReviewModal: () => void;
  onOpenChangeOrderModal: () => void;
}

export const LedgerPanel: React.FC<LedgerPanelProps> = ({
  summary,
  onOpenReviewModal,
  onOpenChangeOrderModal,
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-cyan-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Scope Creep Ledger</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit receipt of detected client requests outside baseline scope
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary.reviewRequiredCount > 0 && (
            <button
              onClick={onOpenReviewModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all animate-pulse shadow-sm"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Review Flagged ({summary.reviewRequiredCount})
            </button>
          )}

          <button
            onClick={onOpenChangeOrderModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            Draft Change Order
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> Extra Work
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{summary.totalEstimatedHours} hrs</div>
        </div>

        <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/30 shadow-sm">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Unbilled Value
          </div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${summary.totalEstimatedCost}</div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-cyan-500" /> Creep Items
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{summary.totalScopeCreepItems}</div>
        </div>

        <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/30 shadow-sm">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Review Queue
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{summary.reviewRequiredCount}</div>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      <ScopeAnalyticsChart summary={summary} />

      {/* Ledger Receipts List */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {summary.ledgerItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
            No scope creep items detected yet. Upload a conversation thread above.
          </div>
        ) : (
          summary.ledgerItems.map((item: LedgerItem) => (
            <div
              key={item.id}
              className={`glass-card p-4 rounded-xl border transition-all ${
                item.verificationStatus === 'verified'
                  ? 'border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
                  : item.verificationStatus === 'review_required'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-rose-500/30 bg-rose-500/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{item.requester}</span>
                  <span className="text-xs text-slate-500">• {item.timestamp}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    +{item.estimatedHours} hrs (${item.estimatedCost})
                  </span>

                  {item.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : item.verificationStatus === 'review_required' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> Review Req.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              <blockquote className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 mb-2.5 italic">
                "{item.originalMessage}"
              </blockquote>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">Reason:</strong> {item.reason}
                </span>
                <span className="text-slate-500 font-mono">Conf: {(item.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
