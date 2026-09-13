'use client';

import React from 'react';
import Link from 'next/link';
import { ListOrdered, Clock3, TrendingUp, ShieldAlert, ArrowRight, ScrollText } from 'lucide-react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { MetricCard } from '@/components/MetricCard';
import { Button, Badge, EmptyState } from '@/components/ui';
import { LedgerItemCard } from '@/components/ledger/LedgerItemCard';
import { formatMoney } from '@/lib/currency';
import { PageHeader } from '@/components/PageHeader';

export default function OverviewPage({ params }: { params: { projectId: string } }) {
  const { project, ledgerItems, totals, verifyItem, rejectItem } = useProjectWorkspace();

  if (!project) return null;

  const items = [...(ledgerItems ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recent = items.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="The state of scope creep on this engagement at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Creep items"
          value={items.length}
          hint="Flagged requests outside original scope"
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <MetricCard
          label="Additional hours"
          value={totals?.totalHours ?? 0}
          hint="Verified + reviewed estimate"
          icon={<Clock3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Scope creep value"
          value={formatMoney(totals?.totalCost ?? 0, project.currency)}
          hint={`Rate ${project.currency} ${project.hourlyRate}/hr`}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Needs review"
          value={totals?.reviewCount ?? 0}
          hint="Low-confidence items to verify"
          tone={totals?.reviewCount ? 'warning' : 'default'}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Baseline scope</h2>
          <blockquote className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {project.originalScope}
          </blockquote>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Project</h2>
          <dl className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Client</dt>
              <dd className="font-medium text-foreground">{project.clientName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-foreground">{project.freelancerRole?.replace('-', ' ') ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant="secondary">{project.status ?? 'draft'}</Badge>
              </dd>
            </div>
          </dl>

          {totals && totals.reviewCount > 0 && (
            <Button asChild className="w-full">
              <Link href={`/app/projects/${project.id}/ledger`}>
                Review {totals.reviewCount} pending item{totals.reviewCount === 1 ? '' : 's'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent flagged messages</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/projects/${project.id}/conversations`}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-6 w-6" />}
            title="Nothing flagged yet"
            description="When new-ask messages are detected, they appear here as evidence-backed scope items."
          />
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <LedgerItemCard
                key={item.id}
                item={item}
                currency={project.currency}
                onVerify={verifyItem}
                onReject={rejectItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}