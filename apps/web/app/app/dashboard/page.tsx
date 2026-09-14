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
import { Skeleton, EmptyState, Card, CardContent, Button } from '@/components/ui';
import { api, ProjectDetail } from '@/lib/api';
import { formatMoney } from '@/lib/currency';
import { listActivity } from '@/lib/activity';
import { Project, Currency } from '@scope-creep-ledger/shared';
import { PageHeader } from '@/components/PageHeader';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface Aggregate {
  items: number;
  hours: number;
  costByCurrency: Record<Currency, number>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading, error, reload } = useProjects(user?.userId);
  const [activity, setActivity] = React.useState(() => listActivity().slice(0, 8));

  const [details, setDetails] = React.useState<Map<string, ProjectDetail> | null>(null);
  const [aggregate, setAggregate] = React.useState<Aggregate | null>(null);

  React.useEffect(() => {
    const handleActivityChange = () => {
      setActivity(listActivity().slice(0, 8));
    };

    window.addEventListener('scope-creep-activity-updated', handleActivityChange);
    window.addEventListener('storage', handleActivityChange);

    return () => {
      window.removeEventListener('scope-creep-activity-updated', handleActivityChange);
      window.removeEventListener('storage', handleActivityChange);
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    setDetails(null);
    setAggregate(null);
    if (!projects || projects.length === 0) return;

    // Single batched fetch — one round trip for every project's ledger + totals.
    Promise.all(
      projects.map((p) => api.getProject(p.id, user?.userId).catch(() => null))
    ).then((results) => {
      if (!alive) return;
      const detailMap = new Map<string, ProjectDetail>();
      let items = 0;
      let hours = 0;
      const costByCurrency: Record<Currency, number> = {} as Record<Currency, number>;
      projects.forEach((p, i) => {
        const detail = results[i];
        if (!detail) return;
        detailMap.set(p.id, detail);
        items += (detail.ledgerItems ?? []).length;
        hours += detail.totals.totalHours;
        const c = detail.project.currency;
        costByCurrency[c] = (costByCurrency[c] ?? 0) + detail.totals.totalCost;
      });
      setDetails(detailMap);
      setAggregate({ items, hours, costByCurrency });
    });

    return () => {
      alive = false;
    };
  }, [projects, user?.userId]);

  const recentProjects = (projects ?? []).slice(0, 4);

  const valueTiles = Object.entries(aggregate?.costByCurrency ?? {}).filter(([, v]) => v > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0]}`}
        description="Catch the unbilled work hiding between the lines."
        actions={
          <Button asChild size="lg">
            <Link href="/app/projects/new">
              <FolderPlus className="h-4 w-4" /> New Project
            </Link>
          </Button>
        }
      />

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
          hint="Verified additional effort"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="Recoverable value"
          value={
            aggregate && valueTiles.length > 0 ? (
              <span className="block space-y-1">
                {valueTiles.map(([cur, cost]) => (
                  <span key={cur} className="block whitespace-nowrap">
                    {formatMoney(cost, cur as Currency)}
                  </span>
                ))}
              </span>
            ) : (
              '—'
            )
          }
          hint="Each value stays in its original currency — no FX conversion"
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
                  action={
                    <Button asChild size="sm">
                      <Link href="/app/projects/new">Create your first project</Link>
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => {
                const detail = details?.get(project.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project as Project}
                    totalCost={detail?.totals.totalCost ?? undefined}
                    totalHours={detail?.totals.totalHours ?? undefined}
                    scopeChanges={detail?.totals.verifiedCount ?? 0}
                  />
                );
              })}
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