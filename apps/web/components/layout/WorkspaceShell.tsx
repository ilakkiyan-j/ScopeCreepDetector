'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Moon, Sun, LogOut, Settings, ChevronDown, Info, Cloud, Search } from 'lucide-react';
import { ALXOGlyph } from '@/components/brand';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Badge, DropdownMenu, DropdownMenuItem, CommandPalette } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { UserRole } from '@scope-creep-ledger/shared';

export interface ShellNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

import { api, getLocalProjects } from '@/lib/api';

function GlobalCloudSyncStatus({ userId }: { userId?: string }) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const checkStatus = React.useCallback(() => {
    const local = getLocalProjects();
    const unsynced = local.filter((p) => (p as any).isLocalOnly);
    setUnsyncedCount(unsynced.length);
  }, []);

  React.useEffect(() => {
    checkStatus();
    const handleUpdate = () => checkStatus();
    window.addEventListener('scope-creep-project-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('scope-creep-project-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [checkStatus]);

  const handleGlobalSync = async () => {
    setSyncing(true);
    try {
      await api.syncLocalProjectsToCloud(userId);
      checkStatus();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('scope-creep-project-updated'));
      }
    } catch {
      /* ignore */
    } finally {
      setSyncing(false);
    }
  };

  if (unsyncedCount > 0) {
    return (
      <button
        type="button"
        onClick={handleGlobalSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 hover:bg-warning/20 px-3 py-1 text-xs font-semibold text-warning transition-colors"
        title="Click to push all local projects to AWS Cloud"
      >
        <Cloud className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : `Sync (${unsyncedCount}) to AWS`}
      </button>
    );
  }

  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
      AWS Cloud Synced
    </span>
  );
}

export function WorkspaceShell({
  navItems,
  accentLabel,
  children,
}: {
  navItems: ShellNavItem[];
  accentLabel: string;
  children: React.ReactNode;
}) {
  const { user, role, isDemo, isDarkMode, toggleTheme, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderActive = (href: string) =>
    cn(
      'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      isActive(href)
        ? 'bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-brand-accent shadow-sm'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    );

  const navContent = (
    <nav aria-label="Primary navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {navItems.map((item, idx) => {
        const prevSection = idx > 0 ? navItems[idx - 1].section : undefined;
        const showHeader = item.section && item.section !== prevSection;
        const Icon = item.icon;
        return (
          <React.Fragment key={item.href}>
            {showHeader && (
              <p className="mt-5 mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {item.section}
              </p>
            )}
            <Link href={item.href} className={renderActive(item.href)} onClick={() => setMobileOpen(false)}>
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
      <div className="flex items-center gap-3">
        <ALXOGlyph size={38} />
        <div className="leading-tight">
          <p className="text-base font-bold tracking-[0.15em] text-foreground">ALXO</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {accentLabel}
            {role === 'ADMIN' && <span className="ml-1 text-info">· Admin</span>}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Close navigation"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        onClick={() => setMobileOpen(false)}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const footer = (
    <div className="border-t border-border/50 p-3 bg-muted/20">
      <DropdownMenu
        side="top"
        align="left"
        trigger={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Avatar name={user?.name} className="h-9 w-9 shrink-0 ring-1 ring-border/50" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{user?.name || 'User'}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        }
      >
        <DropdownMenuItem
          label="Settings"
          onSelect={() => router.push(role === 'ADMIN' ? '/admin/settings' : '/app/settings/profile')}
        >
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          label="Sign out"
          danger
          onSelect={() => {
            signOut();
            router.push('/sign-in');
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {isDarkMode ? <Sun className="h-4.5 w-4.5 text-warning" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );

  const demoBanner = isDemo ? (
    <div
      role="note"
      className="flex items-center gap-2 border-b border-warning/30 bg-warning/15 px-6 py-2.5 text-xs font-medium text-warning backdrop-blur-sm lg:pl-[calc(16rem+1.5rem)] transition-all"
    >
      <Info className="h-4 w-4 shrink-0" />
      Demo Mode — exploring as demo user.
      <button
        type="button"
        className="ml-auto font-semibold underline underline-offset-2 hover:opacity-80"
        onClick={() => {
          signOut();
          router.push('/sign-in');
        }}
      >
        Sign in
      </button>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-accent/20">
      {demoBanner}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-card/85 backdrop-blur-md lg:flex">
        {brand}
        {navContent}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation"
            tabIndex={-1}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card shadow-2xl animate-slide-in">
            {brand}
            {navContent}
            {footer}
          </aside>
        </div>
      )}

      {/* Topbar + content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-background/85 px-4 backdrop-blur-md border-b border-border/50 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground sm:w-64"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 text-left">Search or Cmd + K</span>
            <kbd className="hidden rounded border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <GlobalCloudSyncStatus userId={user?.userId} />
            {themeToggle}
            <Badge variant="secondary" className="font-semibold">{role === 'ADMIN' ? 'Admin' : 'Workspace'}</Badge>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">{children}</main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}