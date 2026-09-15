'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { LedgerItem, Project } from '@scope-creep-ledger/shared';
import { Badge, Card } from '@/components/ui';
import { formatMoney } from '@/lib/currency';

type Priority = 'high' | 'medium' | 'low';

function getPriority(confidence: number): Priority {
  if (confidence < 0.5) return 'high';
  if (confidence < 0.7) return 'medium';
  return 'low';
}

const PRIORITY_CONFIG: Record<Priority, {
  label: string;
  dotClass: string;
  badgeClass: string;
  borderClass: string;
}> = {
  high: {
    label: 'High priority',
    dotClass: 'bg-danger',
    badgeClass: 'bg-danger/15 text-danger border border-danger/25',
    borderClass: 'border-danger/20 hover:border-danger/40 hover:shadow-glow-danger',
  },
  medium: {
    label: 'Medium priority',
    dotClass: 'bg-warning',
    badgeClass: 'bg-warning/15 text-warning border border-warning/25',
    borderClass: 'border-warning/20 hover:border-warning/40 hover:shadow-glow-warning',
  },
  low: {
    label: 'Low priority',
    dotClass: 'bg-info',
    badgeClass: 'bg-info/15 text-info border border-info/25',
    borderClass: 'border-info/20 hover:border-info/40 hover:shadow-glow-info',
  },
};

interface NeedsAttentionCardProps {
  item: LedgerItem;
  project: Project;
}

export function NeedsAttentionCard({ item, project }: NeedsAttentionCardProps) {
  const priority = getPriority(item.confidence);
  const config = PRIORITY_CONFIG[priority];

  // Truncate the client message to a quote snippet (~100 chars)
  const quote = item.originalMessage.length > 110
    ? `"${item.originalMessage.slice(0, 107)}…"`
    : `"${item.originalMessage}"`;

  return (
    <Card
      className={`flex flex-col gap-3 p-4 transition-all duration-200 ${config.borderClass} animate-fade-up`}
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass} animate-pulse-dot`} />
          {config.label}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {formatMoney(item.estimatedCost, project.currency)}
        </span>
      </div>

      {/* Project context */}
      <div>
        <p className="text-xs font-semibold text-foreground leading-none">{project.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{project.clientName}</p>
      </div>

      {/* Client quote */}
      <blockquote className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-border pl-2.5">
        {quote}
      </blockquote>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.estimatedHours}h estimated
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {item.requester}
        </span>
      </div>

      {/* Review CTA */}
      <Link
        href={`/app/projects/${project.id}/ledger`}
        className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors self-start mt-auto"
        aria-label={`Review scope item from ${project.name}`}
      >
        Review
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  );
}
