'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { User, Briefcase, Building, Mail, Save, CheckCircle2, Shield, Calendar } from 'lucide-react';
import { FreelancerRole } from '../../../../shared/types';

const PROFESSIONS: { id: string; label: string }[] = [
  { id: 'Freelance Web Dev', label: '💻 Freelance Web / Software Dev' },
  { id: 'UI/UX & Product Designer', label: '🎨 UI/UX & Product Designer' },
  { id: 'Copywriter & Content Strategist', label: '✍️ Copywriter & Content' },
  { id: 'Video Editor & Motion Designer', label: '🎥 Video Editor & Motion' },
  { id: 'Consultant / Marketer', label: '📊 Consultant & Strategist' },
];

export default function ProfilePage() {
  const { user, updateProfile, isDarkMode, handleToggleTheme } = useAuth() as any;
  const [isSaved, setIsSaved] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [profession, setProfession] = useState(user?.profession || 'Freelance Web Dev');
  const [company, setCompany] = useState(user?.company || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      profession,
      company,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <ProtectedRoute>
      <AppLayout activeTab="settings">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                {user?.name?.substring(0, 2).toUpperCase() || 'AM'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Account {user?.status || 'Active'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {user?.role === 'ADMIN' ? <Shield className="w-3 h-3 text-purple-400" /> : null}
                    Role: {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Customization Form */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> User Profile & Professional Specialization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalizing your profession configures the AI classifier's scope evaluation rules.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address (Cognito Managed)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Profession / Primary Specialization
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {PROFESSIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Agency / Company Name
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Independent Contractor / Acme Agency"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 2026'}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Profile Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
