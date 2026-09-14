'use client';

import React from 'react';
import { Users, FolderKanban, ListOrdered, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminProjectRows, groupByCurrency } from '@/hooks/useAdminOverview';
import { MetricCard } from '@/components/MetricCard';
import { LoadingState } from '@/components/state/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatMoney } from '@/lib/currency';
import { PageHeader } from '@/components/PageHeader';

export default function AdminDashboardPage() {
  const { allUsers } = useAuth();
  const { rows, loading, error } = useAdminProjectRows();

  if (loading) return <LoadingState label="Loading admin overview…" />;
  if (error) return <p role="alert" className="text-sm text-danger">{error}</p>;
  if (!rows) return null;

  const activeUsers = allUsers.filter((u) => u.status === 'active');
  const totalItems = rows.reduce((s, r) => s + r.itemCount, 0);
  const totalReview = rows.reduce((s, r) => s + r.reviewCount, 0);
  const byCurrency = groupByCurrency(rows);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Real metrics from your ledger service. No fabricated KPI tiles."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active users" value={activeUsers.length} hint={`${allUsers.length} total accounts`} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Projects" value={rows.length} hint="Across all users" icon={<FolderKanban className="h-4 w-4" />} />
        <MetricCard label="Creep items" value={totalItems} hint="Flagged in all ledgers" icon={<ListOrdered className="h-4 w-4" />} />
        <MetricCard label="Pending review" value={totalReview} tone={totalReview ? 'warning' : 'default'} hint="Low-confidence items" icon={<ShieldAlert className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scope creep value by currency</CardTitle>
          </CardHeader>
          <CardContent>
            {byCurrency.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <ul className="space-y-2">
                {byCurrency.map((g) => (
                  <li key={g.currency} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{g.currency}</p>
                      <p className="text-xs text-muted-foreground">{g.projects} projects · {g.hours} hrs</p>
                    </div>
                    <p className="text-sm font-bold text-success">{formatMoney(g.cost, g.currency)}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Values are grouped per currency — the estimator never performs FX conversion.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allUsers.slice(0, 6).map((u) => (
                <li key={u.userId} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}`}>
                    {u.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}