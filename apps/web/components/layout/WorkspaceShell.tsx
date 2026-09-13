'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Receipt as LogoIcon, Menu, X, Moon, Sun, LogOut, Settings, ChevronDown, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Badge, DropdownMenu, DropdownMenuItem } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { UserRole } from '@scope-creep-ledger/shared';

export interface ShellNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderActive = (href: string) =>
    cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      isActive(href)
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              <p className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LogoIcon className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Scope Creep Ledger</p>
          <p className="text-[11px] text-muted-foreground">
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
    <div className="border-t border-border p-4">
      <DropdownMenu
        trigger={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
          >
            <Avatar name={user?.name} className="h-8 w-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{user?.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  const demoBanner = isDemo ? (
    <div
      role="note"
      className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-6 py-2 text-xs text-warning"
    >
      <Info className="h-4 w-4 shrink-0" />
      Demo Mode — you&rsquo;re exploring as a demo user. Changes aren&rsquo;t saved to a real account.
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
    <div className="min-h-screen bg-background text-foreground">
      {demoBanner}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
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
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card animate-slide-in">
            {brand}
            {navContent}
            {footer}
          </aside>
        </div>
      )}

      {/* Topbar + content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-1">
            {themeToggle}
            <Badge variant="secondary">{role === 'ADMIN' ? 'Admin' : 'Workspace'}</Badge>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}