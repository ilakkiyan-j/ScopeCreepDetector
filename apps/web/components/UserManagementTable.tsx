'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../../shared/types';
import { UserPlus, Shield, UserCheck, CheckCircle2, XCircle, X, Mail, User, Briefcase } from 'lucide-react';

interface UserManagementTableProps {
  users: UserProfile[];
  onToggleStatus: (userId: string) => void;
  onCreateUser: (newUser: Omit<UserProfile, 'userId' | 'createdAt'>) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onToggleStatus,
  onCreateUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('Freelance Web Dev');
  const [role, setRole] = useState<UserRole>('USER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onCreateUser({
      name,
      email,
      profession,
      role,
      status: 'active',
    });

    setName('');
    setEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            User Accounts & Permission Directory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage application access, Cognito roles, and professional specializations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" /> Create User Account
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Profession</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
            {users.map((u) => (
              <tr key={u.userId} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-sans font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>

                <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                  {u.profession}
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.status}
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onToggleStatus(u.userId)}
                    className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold border transition-all ${
                      u.status === 'active'
                        ? 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-slate-300 dark:border-slate-700 hover:bg-rose-500/10'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'active' ? 'Disable Access' : 'Enable Access'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-md rounded-2xl border border-blue-500/30 p-6 shadow-2xl space-y-5 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. David Miller"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="david@agency.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Profession
                </label>
                <input
                  type="text"
                  required
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Full-Stack Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-500" /> Assign Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="USER">USER (Standard Freelancer)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
                >
                  Create & Issue Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
