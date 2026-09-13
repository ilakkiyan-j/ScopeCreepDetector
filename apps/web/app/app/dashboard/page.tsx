'use client';

import React from 'react';
import Link from 'next/link';
import { FolderPlus, ArrowRight, Sparkles, ListOrdered, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProject';
import { MetricCard } from '@/components/MetricCard';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { LoadingState } from '@/components/state/LoadingState';
import { Skeleton, EmptyState, Card, CardContent } from '@/components/ui';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/currency';
import { listActivity } from '@/lib/activity';
import { Project, LedgerItem } from '@scope-creep-ledger/shared';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading, error } = useProjects();
  const [activity] = React.useState(() => listActivity().slice(0, 8));

  const verifiedTotal = React.useMemo(async () => {
    let hours = 0;
    let cost = 0;
    let items = 0;
    if (projects) {
      for (const p of projects) {
        const detail: { totals: { totalHours: number; totalCost: number }; ledgerItems: LedgerItem[] } | null =
          await api.getProject(p.id).catch(() => null);
        if (detail) {
          hours += detail.totals.totalHours;
          cost += detail.totals.totalCost;
          items += (detail.ledgerItems ?? []).length;
        }
      }
    }
    return { hours, cost, items };
  }, [projects]);

  const [aggregate, setAggregate] = React.useState<{ hours: number; cost: number; items: number } | null>(null);
  React.useEffect(() => {
    let alive = true;
    verifiedTotal.then((v) => alive && setAggregate(v));
    return () => {
      alive = false;
    };
  }, [verifiedTotal]);

  const defaultCurrency = user?.defaultCurrency ?? 'INR';
  const recentProjects = (projects ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">Here&rsquo;s the state of scope creep across your projects.</p>
        </div>
        <Link
          href="/app/projects/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <FolderPlus className="h-4 w-4" /> New Project
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Projects"
          value={projects?.length ?? 0}
          hint="Total analyzed projects"
          icon={<FolderPlus className="h-4 w-4" />}
        />
        <MetricCard
          label="Creep items"
          value={aggregate?.items ?? 0}
          hint="Flagged across all projects"
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <MetricCard
          label="Additional hours"
          value={aggregate?.hours ?? 0}
          hint="Verified + reviewed"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="Recoverable value"
          value={aggregate ? formatMoney(aggregate.cost, defaultCurrency) : '—'}
          hint={`Sum in ${defaultCurrency} — no FX conversion`}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent projects</h2>
            <Link href="/app/projects" className="text-sm font-medium text-info hover:underline">
              View all <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger">{error}</p>
          )}
          {projects && projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={<FolderPlus className="h-6 w-6" />}
                  title="No projects yet"
                  description="Start by uploading a conversation export and comparing it against your original scope."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project as Project} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          <Link href="/app/activity" className="text-sm font-medium text-info hover:underline">
            View all <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ActivityTimeline events={activity} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}