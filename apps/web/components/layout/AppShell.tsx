'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Activity,
  Settings2,
} from 'lucide-react';
import { WorkspaceShell, ShellNavItem } from './WorkspaceShell';

const NAV: ShellNavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, section: 'Workspace' },
  { label: 'Projects', href: '/app/projects', icon: FolderKanban },
  { label: 'New Analysis', href: '/app/analysis/new', icon: Sparkles },
  { label: 'Activity', href: '/app/activity', icon: Activity },
  { label: 'Settings', href: '/app/settings/profile', icon: Settings2, section: 'Settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell navItems={NAV} accentLabel="User Workspace">
      {children}
    </WorkspaceShell>
  );
}