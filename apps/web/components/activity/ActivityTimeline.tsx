'use client';

import React from 'react';
import {
  FolderPlus,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Activity as ActivityIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { ActivityEvent, ActivityType } from '@/lib/activity';

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  project_created: FolderPlus,
  analysis_completed: Sparkles,
  item_verified: CheckCircle2,
  item_rejected: XCircle,
  change_order_generated: FileText,
};

import { cn } from '@/lib/utils';

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function ActivityTimeline({
  events,
  emptyMessage = 'No activity yet.',
  emptyDescription = 'Actions like analyzing a project or verifying scope items will appear here.',
}: {
  events: ActivityEvent[];
  emptyMessage?: string;
  emptyDescription?: string;
}) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<ActivityIcon className="h-6 w-6" />}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  const groups: { label: string; items: ActivityEvent[] }[] = [];
  for (const event of events) {
    const label = dayLabel(event.createdAt);
    const existing = groups.find((g) => g.label === label);
    if (existing) {
      existing.items.push(event);
    } else {
      groups.push({ label, items: [event] });
    }
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <ol className="mt-3 space-y-4 border-l border-border pl-5">
            {group.items.map((event) => {
              const Icon = ICONS[event.type];
              return (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
                    <Icon className="h-3 w-3 text-primary" />
                  </span>
                  <p className="text-sm text-foreground">{event.message}</p>
                  {event.projectName && (
                    <p className="text-xs text-muted-foreground">{event.projectName}</p>
                  )}
                  <p
                    className={cn(
                      'mt-0.5 text-xs text-muted-foreground/80',
                      group.label === 'Today' && 'font-medium'
                    )}
                  >
                    {timeLabel(event.createdAt)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}