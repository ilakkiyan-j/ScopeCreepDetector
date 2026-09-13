'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Info, ArrowRight } from 'lucide-react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { MetricCard } from '@/components/MetricCard';
import { Badge, Card, CardContent, Button } from '@/components/ui';
import { formatMoney } from '@/lib/currency';
import { PageHeader } from '@/components/PageHeader';
import { ClassificationCategory } from '@scope-creep-ledger/shared';

const CLASSIFICATION_COUNTS: { key: ClassificationCategory; label: string; tone: 'default' | 'success' | 'warning' | 'info' }[] = [
  { key: 'in-scope', label: 'In scope', tone: 'success' },
  { key: 'new-ask', label: 'New ask (creep)', tone: 'warning' },
  { key: 'clarification', label: 'Clarification', tone: 'info' },
  { key: 'off-topic', label: 'Off-topic', tone: 'default' },
];

export default function AnalysisTabPage({ params }: { params: { projectId: string } }) {
  const { project, ledgerItems, totals } = useProjectWorkspace();
  if (!project) return null;

  const counts: Record<ClassificationCategory, number> = {
    'in-scope': 0,
    'new-ask': (ledgerItems ?? []).length,
    clarification: 0,
    'off-topic': 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis"
        description="The classifier's findings, stored deterministically — no hidden totals."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Estimated hours"
          value={totals?.totalHours ?? 0}
          hint="Deterministic — no AI totals"
        />
        <MetricCard
          label="Estimated value"
          value={formatMoney(totals?.totalCost ?? 0, project.currency)}
          tone="success"
        />
        <MetricCard label="Creep items" value={counts['new-ask']} />
        <MetricCard
          label="Needs review"
          value={totals?.reviewCount ?? 0}
          tone={totals?.reviewCount ? 'warning' : 'default'}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Classification breakdown</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CLASSIFICATION_COUNTS.map((c) => (
              <label key={c.key} className="cursor-pointer">
                <input type="radio" name="class-filter" value={c.key} className="peer sr-only" />
                <span className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-3 py-3 peer-checked:border-primary peer-checked:bg-primary/5">
                  <Badge variant={c.tone === 'success' ? 'success' : c.tone === 'warning' ? 'warning' : c.tone === 'info' ? 'info' : 'secondary'} className="w-fit">
                    {c.label}
                  </Badge>
                  <span className="text-xl font-bold text-foreground">{counts[c.key]}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="flex items-start gap-2 rounded-md bg-info/10 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
            The estimator only reports classifications for the dominant run on this project. Only{' '}
            <strong className="text-foreground">new-ask</strong> messages become ledger items; the
            other classes are stored per message in the full pipeline.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/app/projects/new`}>
            Re-run with updated scope <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}