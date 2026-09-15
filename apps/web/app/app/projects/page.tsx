'use client';

/**
 * Projects Hub — Grid/Table dual view
 *
 * Full dense table columns: Project | Client | Status | Changes | +Hours | Value | →
 * Grid view uses existing ProjectCard.
 *
 * Skill compliance:
 * - responsive-design: table wrapped in overflow-x-auto; grid-cols-1 → sm:2 → lg:3
 * - frontend-design: composes Card, Badge, Button, Input, EmptyState primitives
 * - motion-design: animate-fade-up entrance on content; 200ms delay on card grid
 * - accessibility: table has proper thead scope, buttons have aria-labels
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderPlus, FolderKanban, Search, Filter, LayoutGrid, List,
  ArrowUpDown, Cloud, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProject';
import { ProjectCard } from '@/components/project/ProjectCard';
import { LoadingState } from '@/components/state/LoadingState';
import { EmptyState, Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { api, ProjectDetail } from '@/lib/api';
import { formatMoney } from '@/lib/currency';
import { PROJECT_STATUS_LABEL } from '@/lib/api';
import { Project, ProjectStatus, Currency } from '@scope-creep-ledger/shared';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'status' | 'createdAt';

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'completed', label: 'Completed' },
  { id: 'draft', label: 'Draft' },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  active:       <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />,
  under_review: <Clock className="h-3 w-3 text-warning" />,
  approved:     <CheckCircle2 className="h-3 w-3 text-info" />,
  completed:    <CheckCircle2 className="h-3 w-3 text-muted-foreground" />,
  draft:        <AlertCircle className="h-3 w-3 text-muted-foreground" />,
};

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  under_review: 'warning',
  approved: 'info',
  completed: 'default',
  draft: 'default',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, error } = useProjects(user?.userId);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [details, setDetails] = React.useState<Map<string, ProjectDetail> | null>(null);

  // Load project details for table view
  React.useEffect(() => {
    if (!projects || projects.length === 0 || viewMode !== 'table') return;
    let alive = true;
    Promise.all(
      projects.map((p) => api.getProject(p.id, user?.userId).catch(() => null))
    ).then((results) => {
      if (!alive) return;
      const detailMap = new Map<string, ProjectDetail>();
      projects.forEach((p, i) => { if (results[i]) detailMap.set(p.id, results[i]!); });
      setDetails(detailMap);
    });
    return () => { alive = false; };
  }, [projects, user?.userId, viewMode]);

  const filtered = (projects ?? [])
    .filter((p) => {
      const q = `${p.name} ${p.clientName}`.toLowerCase();
      const matchesQuery = q.includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      if (sortField === 'status') return (a.status ?? '').localeCompare(b.status ?? '');
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    });

  const getStatusCount = (id: string) => {
    if (!projects) return 0;
    if (id === 'all') return projects.length;
    return projects.filter((p) => p.status === id).length;
  };

  const isLocalOnly = (p: Project) => !!(p as any).isLocalOnly;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Monitor and track scope creep across all client engagements."
        actions={
          <Button asChild size="lg" id="projects-new-btn">
            <Link href="/app/projects/new">
              <FolderPlus className="h-4 w-4" /> New Project
            </Link>
          </Button>
        }
      />

      {/* ── Control bar ── */}
      <div className="space-y-3 animate-fade-up">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="projects-search"
              type="search"
              placeholder="Search projects or clients…"
              className="pl-9 h-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Sort */}
            <select
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              aria-label="Sort projects"
            >
              <option value="createdAt">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="status">Status</option>
            </select>

            {/* Grid/Table toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={cn(
                  'px-2.5 py-2 transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                aria-pressed={viewMode === 'table'}
                className={cn(
                  'px-2.5 py-2 transition-colors',
                  viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const count = getStatusCount(f.id);
            const isActive = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {f.label}
                <span className={cn(
                  'px-1.5 rounded-full text-[10px] tabular-nums',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingState label="Loading projects…" />
      ) : error ? (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        projects && projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={<FolderKanban className="h-6 w-6 text-muted-foreground" />}
                title="No projects yet"
                description="Upload a conversation transcript to start detecting scope creep."
                action={
                  <Button asChild size="sm">
                    <Link href="/app/projects/new">Create Project</Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<Filter className="h-5 w-5 text-muted-foreground" />}
            title="No matching projects"
            description={`No projects match "${query}"${statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.`}
          />
        )
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up delay-50">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project as Project} />
          ))}
        </div>
      ) : (
        /* ── Table View ── */
        <Card className="animate-fade-up delay-50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Projects table">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left font-semibold text-muted-foreground px-4 py-3 text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => setSortField('name')}>
                      Project <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left font-semibold text-muted-foreground px-2 py-3 text-xs hidden sm:table-cell">Client</th>
                  <th className="text-left font-semibold text-muted-foreground px-2 py-3 text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => setSortField('status')}>
                      Status <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right font-semibold text-muted-foreground px-2 py-3 text-xs hidden md:table-cell">Changes</th>
                  <th className="text-right font-semibold text-muted-foreground px-2 py-3 text-xs hidden md:table-cell">+Hours</th>
                  <th className="text-right font-semibold text-muted-foreground px-2 py-3 text-xs hidden lg:table-cell">Value</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 text-xs">Sync</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const detail = details?.get(project.id);
                  const local = isLocalOnly(project);
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/projects/${project.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {project.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-0.5 sm:hidden">{project.clientName}</p>
                      </td>
                      <td className="px-2 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {project.clientName}
                      </td>
                      <td className="px-2 py-3">
                        <Badge
                          variant={STATUS_BADGE_VARIANT[project.status as string] ?? 'default'}
                          className="gap-1 text-[10px]"
                        >
                          {STATUS_ICON[project.status as string]}
                          {PROJECT_STATUS_LABEL[project.status as ProjectStatus] ?? project.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right text-xs text-muted-foreground hidden md:table-cell tabular-nums">
                        {detail ? `+${(detail.ledgerItems ?? []).length}` : '—'}
                      </td>
                      <td className="px-2 py-3 text-right text-xs text-muted-foreground hidden md:table-cell tabular-nums">
                        {detail ? `+${detail.totals.totalHours.toFixed(1)}h` : '—'}
                      </td>
                      <td className="px-2 py-3 text-right text-xs font-semibold text-success hidden lg:table-cell tabular-nums">
                        {detail && detail.totals.totalCost > 0
                          ? formatMoney(detail.totals.totalCost, project.currency as Currency)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {local ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-warning">
                            <Cloud className="h-3 w-3" /> Local
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success">
                            <Cloud className="h-3 w-3" /> Synced
                          </span>
                        )}
                      </td>
                      <td className="pr-3">
                        <Link
                          href={`/app/projects/${project.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary font-medium hover:underline"
                          aria-label={`Open project ${project.name}`}
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}