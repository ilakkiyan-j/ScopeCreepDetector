'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useAdminProjectRows, groupByCurrency } from '@/hooks/useAdminOverview';
import { LoadingState } from '@/components/state/LoadingState';
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { PROJECT_STATUS_LABEL } from '@/lib/api';
import { formatMoney } from '@/lib/currency';
import { ProjectStatus } from '@scope-creep-ledger/shared';

const STATUS_TONE: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'secondary' | 'outline'> = {
  draft: 'outline',
  analyzed: 'success',
  review: 'warning',
  'change-orders': 'info',
  closed: 'secondary',
};

export default function AdminProjectsPage() {
  const { rows, loading, error } = useAdminProjectRows();

  if (loading) return <LoadingState label="Loading projects…" />;
  if (error) return <p role="alert" className="text-sm text-danger">{error}</p>;
  if (!rows) return null;

  const byCurrency = groupByCurrency(rows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">{rows.length} analyzed projects across the platform.</p>
      </div>

      {byCurrency.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scope creep value by currency</CardTitle>
            <CardDescription>Each value remains in its original currency — no FX conversion is performed.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ project, totals, itemCount }) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/app/projects/${project.id}/overview`} className="group flex items-center gap-2">
                    {project.name}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-info" />
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.clientName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_TONE[project.status ?? 'draft']}>
                    {PROJECT_STATUS_LABEL[project.status ?? 'draft']}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{itemCount}</TableCell>
                <TableCell className="text-right tabular-nums">{totals.totalHours}</TableCell>
                <TableCell className="text-right tabular-nums font-medium text-success">
                  {formatMoney(totals.totalCost, project.currency)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{totals.reviewCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}