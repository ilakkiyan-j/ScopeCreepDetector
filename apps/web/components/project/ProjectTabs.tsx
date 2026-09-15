'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScrollText, MessagesSquare, Sparkles, ListOrdered, FileText, Activity as ActivityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Overview', href: 'overview', icon: LayoutDashboard },
  { label: 'Scope', href: 'scope', icon: ScrollText },
  { label: 'Conversations', href: 'conversations', icon: MessagesSquare },
  { label: 'Analysis', href: 'analysis', icon: Sparkles },
  { label: 'Ledger', href: 'ledger', icon: ListOrdered },
  { label: 'Change Orders', href: 'change-orders', icon: FileText },
  { label: 'Activity', href: 'activity', icon: ActivityIcon },
];

export function ProjectTabs({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Project sections"
      className="flex w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1"
    >
      {TABS.map((tab) => {
        const href = `${basePath}/${tab.href}`;
        const active = pathname === href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              active
                ? 'bg-card text-foreground font-semibold shadow-sm border border-border/80'
                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}