'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Mail,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';

export default function RootLandingPage() {
  const { isDarkMode, toggleTheme } = useAuth();

  const featureCards = [
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      title: 'Multi-Channel Scope Ingestion',
      description:
        'Paste timestamped conversation threads from Slack, WhatsApp, Email, or CSV exports. Our parser handles fragmented messages effortlessly.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      title: 'Amazon Bedrock AI Classifier',
      description:
        'Powered by Claude 3 Haiku fine-tuned for software devs, UI/UX designers, and agency roles to distinguish baseline scope from new scope asks.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Deterministic Math Ledger',
      description:
        'No AI math hallucination. Financial totals, estimated hours, and unbilled revenue are calculated strictly in verified backend code.',
    },
    {
      icon: <Mail className="w-6 h-6 text-purple-400" />,
      title: 'Instant Change-Order Generator',
      description:
        'Transform detected scope creep into client-ready, professional change-order email drafts and printable PDF receipts with 1 click.',
    },
  ];

  const faqs = [
    {
      q: 'How does Scope Creep Ledger detect scope drift?',
      a: 'You provide your project baseline scope (e.g. 3 pages, 1 revision round at $60/hr) and paste ongoing client conversation messages. Amazon Bedrock AI classifies each message against your baseline scope rules.',
    },
    {
      q: 'Is financial arithmetic trusted and non-hallucinated?',
      a: 'Yes! The AI engine only identifies scope items and estimated effort hours. All monetary math (Hours × Hourly Rate = Total Cost) is computed deterministically by verified software code.',
    },
    {
      q: 'What formats can I ingest?',
      a: 'We support raw plain text exports, Slack threads, WhatsApp exports, email threads, and CSV files.',
    },
    {
      q: 'How are accounts provisioned?',
      a: 'User accounts and permission roles are provisioned securely by your System Administrator via the Cognito-integrated Admin Portal.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Scope Creep Ledger
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                AI Scope Expansion & Revenue Leakage Audit Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" /> Open Demo Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Amazon Bedrock & Claude 3 Haiku
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Stop Losing Thousands to <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">Unbilled Scope Creep</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Automatically audit client message threads from Slack, WhatsApp, and Email. Identify unbilled revision rounds and feature requests, calculate exact unbilled revenue, and generate instant change-orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Launch Interactive Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Hero Proof Metrics */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-blue-600 dark:text-cyan-400">$690</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg Unbilled Drift / Project</div>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deterministic Financial Math</div>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">18 Msg</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Benchmark Thread Audited</div>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">1 Click</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Change-Order Email Output</div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Software Developers, Designers & Agencies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to turn ambiguous "quick asks" into clear, billable change order requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl space-y-3 hover:border-blue-500/40 transition-all"
            >
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">{feat.icon}</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-extrabold text-center text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500" /> {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p>Scope Creep Ledger • AI Scope Expansion & Revenue Leakage Audit Workspace</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Powered by Amazon Bedrock, Claude 3 Haiku, AWS Amplify, & Cognito User Pools
        </p>
      </footer>
    </div>
  );
}
