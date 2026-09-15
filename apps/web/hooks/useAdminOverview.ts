'use client';

import { useEffect, useState } from 'react';
import { Project, Currency } from '@scope-creep-ledger/shared';
import { api } from '@/lib/api';

export interface ProjectRow {
  project: Project;
  totals: { totalHours: number; totalCost: number; verifiedCount: number; reviewCount: number; rejectedCount: number };
  itemCount: number;
  reviewCount: number;
}

/**
 * Admin aggregate: loads every project plus its ledger totals.
 * Items are fetched from real service data — admin dashboards show no fabricated KPIs.
 */
export function useAdminProjectRows() {
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { projects } = await api.listProjects();
        const enriched = (projects as any[]).map((p): ProjectRow => {
          return {
            project: p,
            totals: p.totals ?? { totalHours: 0, totalCost: 0, verifiedCount: 0, reviewCount: 0, rejectedCount: 0 },
            itemCount: p.itemCount ?? 0,
            reviewCount: p.totals?.reviewCount ?? 0,
          };
        });
        if (alive) setRows(enriched);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load analytics.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { rows, loading, error };
}

/** Group scope creep cost by currency — the estimator never converts between currencies. */
export function groupByCurrency(rows: ProjectRow[]) {
  const groups = new Map<Currency, { currency: Currency; cost: number; hours: number; projects: number }>();
  for (const row of rows) {
    const c = row.project.currency;
    const existing = groups.get(c) ?? { currency: c, cost: 0, hours: 0, projects: 0 };
    existing.cost += row.totals.totalCost;
    existing.hours += row.totals.totalHours;
    existing.projects += 1;
    groups.set(c, existing);
  }
  return Array.from(groups.values()).sort((a, b) => b.cost - a.cost);
}