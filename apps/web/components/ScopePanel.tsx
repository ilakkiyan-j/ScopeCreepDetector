import React from 'react';
import { FileCheck, DollarSign, Calendar, ShieldAlert } from 'lucide-react';
import { Project } from '../../../shared/types';

interface ScopePanelProps {
  project: Project;
}

export const ScopePanel: React.FC<ScopePanelProps> = ({ project }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Original Baseline Scope</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Reference Contract
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Project & Client</div>
            <div className="text-base font-bold text-white">{project.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">Client: {project.clientName}</div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Baseline Agreement Text</div>
            <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {project.originalScope}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Billing Rate
            </div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">${project.hourlyRate} / hour</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Baseline Status
            </div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">Locked Contract</div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-xs text-amber-300/80">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Every client message is evaluated against this baseline contract. Any unlisted feature requests or extra revision rounds trigger scope expansion.
          </span>
        </div>
      </div>
    </div>
  );
};
