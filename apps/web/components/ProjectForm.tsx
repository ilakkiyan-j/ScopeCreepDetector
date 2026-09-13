'use client';
import React, { useState } from 'react';
import { Play, Sparkles, FileText, DollarSign, User, FolderPlus } from 'lucide-react';
import { AnalyzeRequest } from '../../../shared/types';

interface ProjectFormProps {
  onAnalyze: (request: AnalyzeRequest) => void;
  isLoading: boolean;
}

const SAMPLE_SCOPE = `Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.
Budget: $2,000 at $60/hr.
Timeline: 2 weeks.`;

const SAMPLE_CHAT = `[01/03/2026, 09:15:22] Client: Hi Alex! Ready to kick off the website redesign project.
[01/03/2026, 09:16:10] Freelancer: Hi! Great, I have the agreement for 3 pages (Homepage, About, Contact), no backend work, 1 revision round at $60/hr.
[01/03/2026, 09:18:05] Client: Perfect. Can we start with the homepage layout first?
[01/03/2026, 09:20:00] Freelancer: Absolutely, working on the draft now.
[04/03/2026, 11:30:15] Client: Oh, by the way, can you also add a login page for our existing customers?
[04/03/2026, 11:45:00] Freelancer: I can check into that.
[06/03/2026, 14:00:10] Client: Does the homepage redesign include modern typography?
[06/03/2026, 14:05:20] Freelancer: Yes, modern Google fonts are included in the baseline design.
[09/03/2026, 10:00:00] Client: We reviewed revision 1. Can we do a second revision round with different color variations?
[09/03/2026, 10:15:30] Freelancer: Got it.
[12/03/2026, 16:20:00] Client: Can we make sure the layout is completely redesign-customized for mobile screens specifically as a standalone mobile layout?
[12/03/2026, 16:45:10] Freelancer: Mobile responsive adjustments are standard, but custom mobile-only layout components take extra effort.
[14/03/2026, 12:00:00] Client: Are we still meeting for coffee tomorrow at 10 AM?
[14/03/2026, 12:05:00] Freelancer: Yes, coffee at 10 AM works!
[15/03/2026, 09:30:00] Client: Hey Alex, we want to do a third revision round on the copy and banners.
[18/03/2026, 15:10:00] Client: Can you also create another version of the logo in dark mode for the header?
[20/03/2026, 11:00:00] Client: We also need Google Analytics and Meta pixel integration set up on all pages.
[20/03/2026, 11:15:00] Freelancer: Understood, I'll log all these requests.`;

export const ProjectForm: React.FC<ProjectFormProps> = ({ onAnalyze, isLoading }) => {
  const [projectName, setProjectName] = useState('Website Redesign');
  const [clientName, setClientName] = useState('Acme Corp');
  const [hourlyRate, setHourlyRate] = useState(60);
  const [originalScope, setOriginalScope] = useState(SAMPLE_SCOPE);
  const [rawConversationText, setRawConversationText] = useState(SAMPLE_CHAT);

  const handleLoadDemo = () => {
    setProjectName('Website Redesign');
    setClientName('Acme Corp');
    setHourlyRate(60);
    setOriginalScope(SAMPLE_SCOPE);
    setRawConversationText(SAMPLE_CHAT);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      projectName,
      clientName,
      originalScope,
      hourlyRate: Number(hourlyRate),
      rawConversationText,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Project Setup & Conversation Ingestion</h2>
        </div>
        <button
          type="button"
          onClick={handleLoadDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Benchmark Demo Thread
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <FolderPlus className="w-3.5 h-3.5 text-slate-400" /> Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Client / Company Name
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Hourly Billing Rate ($/hr)
            </label>
            <input
              type="number"
              required
              min="1"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Original Baseline Project Scope
            </label>
            <textarea
              rows={6}
              required
              value={originalScope}
              onChange={(e) => setOriginalScope(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
              placeholder="Paste original proposal or scope bullet points..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Raw Client Conversation Export (.txt / WhatsApp / Slack)
            </label>
            <textarea
              rows={6}
              required
              value={rawConversationText}
              onChange={(e) => setRawConversationText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
              placeholder="Paste chronological chat export text..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Conversation with Bedrock...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Analyze Scope & Generate Ledger
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
