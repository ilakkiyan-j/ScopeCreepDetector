'use client';

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Activity,
  BarChart3,
  Settings2,
} from 'lucide-react';
import { WorkspaceShell, ShellNavItem } from './WorkspaceShell';

const NAV: ShellNavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, section: 'Admin Console' },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Usage', href: '/admin/usage', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell navItems={NAV} accentLabel="Admin Console">
      {children}
    </WorkspaceShell>
  );
}