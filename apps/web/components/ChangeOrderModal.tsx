'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Mail, ShieldCheck, Printer } from 'lucide-react';
import { Project, ProjectAnalysis } from '../../../shared/types';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  summary: ProjectAnalysis;
}

export const ChangeOrderModal: React.FC<ChangeOrderModalProps> = ({
  isOpen,
  onClose,
  project,
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const verifiedItems = summary.ledgerItems.filter((item) => item.verificationStatus === 'verified');

  const emailSubject = `Project Scope Adjustment & Change Order Request — ${project.name}`;

  const itemizedListText = verifiedItems
    .map(
      (item, idx) =>
        `  ${idx + 1}. Request (${item.timestamp}): "${item.originalMessage}"\n     Estimated Effort: ${item.estimatedHours} hrs ($${item.estimatedCost})`
    )
    .join('\n\n');

  const emailBody = `Hi ${project.clientName},

I hope you're having a great week!

I'm writing to provide a quick project update for the ${project.name} project.

While reviewing our progress against our agreed baseline scope (${project.originalScope.split('\n')[0]}), I noted a few additional feature requests and revision rounds that have been requested during our ongoing conversation:

${itemizedListText}

---------------------------------------------------
TOTAL ADDITIONAL SCOPE DETECTED:
Total Additional Effort: ${summary.totalEstimatedHours} hours
Total Estimated Cost: $${summary.totalEstimatedCost} (at $${project.hourlyRate}/hr)
---------------------------------------------------

To ensure we stay aligned and transparent, please review the above items. Once approved, I will incorporate these deliverables into our current project roadmap.

Best regards,
Alex`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-blue-500/30 p-6 shadow-2xl space-y-5 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Mail className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Change-Order Email & Formal Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Built strictly from {verifiedItems.length} verified ledger receipts
          </span>
          <span className="font-mono text-slate-500">Rate: ${project.hourlyRate}/hr</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject Line</label>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Body</label>
            <textarea
              readOnly
              rows={10}
              value={emailBody}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-900 dark:text-slate-200 leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF Receipt
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Email Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
