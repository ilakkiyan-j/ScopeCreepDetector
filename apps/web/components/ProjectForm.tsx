'use client';

import React, { useState, useRef } from 'react';
import { Play, Sparkles, FileText, DollarSign, User, FolderPlus, Upload, Code, Palette, PenTool, Video, Briefcase, FileCheck } from 'lucide-react';
import { AnalyzeRequest, FreelancerRole } from '../../../shared/types';

interface ProjectFormProps {
  onAnalyze: (request: AnalyzeRequest) => void;
  isLoading: boolean;
}

const ROLES: { id: FreelancerRole; label: string; icon: React.ReactNode }[] = [
  { id: 'web-dev', label: 'Web / Software Dev', icon: <Code className="w-3.5 h-3.5" /> },
  { id: 'ui-ux', label: 'UI/UX & Designer', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'copywriter', label: 'Copywriter & Content', icon: <PenTool className="w-3.5 h-3.5" /> },
  { id: 'video-editor', label: 'Video & Motion', icon: <Video className="w-3.5 h-3.5" /> },
  { id: 'consultant', label: 'Consultant / Marketer', icon: <Briefcase className="w-3.5 h-3.5" /> },
];

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
  const [freelancerRole, setFreelancerRole] = useState<FreelancerRole>('web-dev');
  const [hourlyRate, setHourlyRate] = useState(60);
  const [originalScope, setOriginalScope] = useState(SAMPLE_SCOPE);
  const [rawConversationText, setRawConversationText] = useState(SAMPLE_CHAT);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadDemo = () => {
    setProjectName('Website Redesign');
    setClientName('Acme Corp');
    setFreelancerRole('web-dev');
    setHourlyRate(60);
    setOriginalScope(SAMPLE_SCOPE);
    setRawConversationText(SAMPLE_CHAT);
    setFileName('sample-whatsapp-redesign.txt');
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setRawConversationText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      projectName,
      clientName,
      freelancerRole,
      originalScope,
      hourlyRate: Number(hourlyRate),
      rawConversationText,
    });
  };

  const lineCount = rawConversationText.split('\n').filter((l) => l.trim()).length;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <FolderPlus className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project Setup & Multi-Channel Ingestion</h2>
        </div>
        <button
          type="button"
          onClick={handleLoadDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Load Benchmark Demo Thread
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Personalization Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Freelancer / Agency Role (Personalizes Scope Rules)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setFreelancerRole(role.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  freelancerRole === role.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                {role.icon}
                <span className="truncate">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FolderPlus className="w-3.5 h-3.5 text-slate-400" /> Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Client / Company Name
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Hourly Rate ($/hr)
            </label>
            <input
              type="number"
              required
              min="1"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              placeholder="60"
            />
          </div>
        </div>

        {/* Text Areas & Dropzone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-500" /> Original Baseline Project Scope
            </label>
            <textarea
              rows={7}
              required
              value={originalScope}
              onChange={(e) => setOriginalScope(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed shadow-sm"
              placeholder="Paste original proposal or scope bullet points..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-500" /> Raw Conversation Log (Slack, WhatsApp, Email)
              </label>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {lineCount} parsed lines {fileName ? `(${fileName})` : ''}
              </span>
            </div>

            {/* Drag and Drop File Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-2 cursor-pointer border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Drag & drop `.txt` / `.csv` file here, or <strong className="text-blue-500 underline">browse</strong></span>
              </div>
            </div>

            <textarea
              rows={5}
              required
              value={rawConversationText}
              onChange={(e) => setRawConversationText(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed shadow-sm"
              placeholder="Paste chronological chat export text..."
            />
          </div>
        </div>

        {/* Submit Button */}
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
