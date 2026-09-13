import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { LedgerItem } from '../../../shared/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LedgerItem[];
  onVerify: (itemId: string, action: 'verify' | 'reject', customHours?: number) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  items,
  onVerify,
}) => {
  const [editingHours, setEditingHours] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const reviewRequiredItems = items.filter((i) => i.verificationStatus === 'review_required');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-amber-500/30 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Review Flagged Scope Creep Items</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          The AI engine flagged these items due to lower confidence (&lt; 70%). As the primary freelancer, verify if these represent genuine scope additions, adjust estimated hours if needed, or reject them.
        </p>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {reviewRequiredItems.length === 0 ? (
            <div className="text-center py-8 text-emerald-400 text-sm font-medium">
              ✨ All items have been reviewed and verified!
            </div>
          ) : (
            reviewRequiredItems.map((item) => {
              const currentHours = editingHours[item.id] ?? item.estimatedHours;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {item.requester} • {item.timestamp}
                    </span>
                    <span className="text-xs font-mono text-amber-400">
                      Confidence: {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <blockquote className="text-xs font-mono text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 italic">
                    "{item.originalMessage}"
                  </blockquote>

                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">AI Reason:</strong> {item.reason}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300">Est. Hours:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={currentHours}
                        onChange={(e) =>
                          setEditingHours({
                            ...editingHours,
                            [item.id]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onVerify(item.id, 'reject')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => onVerify(item.id, 'verify', currentHours)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Verify & Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close Review Window
          </button>
        </div>
      </div>
    </div>
  );
};
