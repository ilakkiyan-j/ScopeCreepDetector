'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Profile', href: '/app/settings/profile', icon: UserRound },
  { label: 'Preferences', href: '/app/settings/preferences', icon: SlidersHorizontal },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Your profile and app defaults.</p>
      </div>

      <nav
        aria-label="Settings sections"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}