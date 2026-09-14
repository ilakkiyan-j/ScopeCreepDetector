'use client';

import React from 'react';
import { useAdminProjectRows, groupByCurrency } from '@/hooks/useAdminOverview';
import { useAuth } from '@/context/AuthContext';
import { MetricCard } from '@/components/MetricCard';
import { LoadingState } from '@/components/state/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, Badge, EmptyState } from '@/components/ui';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { listActivity, ACTIVITY_LABEL } from '@/lib/activity';
import { formatMoney } from '@/lib/currency';
import { MessagesSquare } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function AdminUsagePage() {
  const { allUsers } = useAuth();
  const { rows, loading } = useAdminProjectRows();
  const [events] = React.useState(() => listActivity());
  const analyses = events.filter((e) => e.type === 'analysis_completed');

  if (loading) return <LoadingState label="Computing usage…" />;
  if (!rows) return null;

  const byCurrency = groupByCurrency(rows);

  return (
    <div className="space-y-8">
      <PageHeader title="Usage" description="Operational metrics computed directly from stored ledger data." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Analyses run" value={analyses.length} hint="Session-stored in-browser activity events" />
        <MetricCard label="Projects" value={rows.length} hint="Persisted in ledger service" />
        <MetricCard label="Active users" value={allUsers.filter((u) => u.status === 'active').length} hint="Out of {allUsers.length}" />
        <MetricCard
          label="Total recoverable"
          value={byCurrency.length === 1 ? formatMoney(byCurrency[0].cost, byCurrency[0].currency) : `${byCurrency.length} currencies`}
          hint="Grouped — never converted between currencies"
          tone="success"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<MessagesSquare className="h-6 w-6" />}
            title="Message counts require pipeline persistence"
            description="Today the parser and classifier run in-memory per analysis; aggregate message counts would require a dedicated summaries store. Only flagged creep items are persisted."
          />
        </CardContent>
      </Card>
    </div>
  );
}