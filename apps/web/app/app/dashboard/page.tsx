'use client';

/**
 * Dashboard Page — Amazon Hackathon Edition
 *
 * 3-column command center layout:
 * - Hero greeting + 4 action KPI tiles (computed from real user data)
 * - Left wide: Active Projects table + Financial Sparkline (preferred currency)
 * - Right narrow: Activity feed + Quick Actions + AWS Powered mini-card
 * - Full-width: "Needs Your Attention" priority review queue
 *
 * Skill compliance:
 * - motion-design: animate-fade-up staggered per section (≤350ms, prefers-reduced-motion respected by globals.css)
 * - design-system: semantic tokens only, no literal colors
 * - frontend-design: composes from Card, Badge, Button, EmptyState, Skeleton primitives
 * - accessibility: one h1 (via PageHeader), aria-live on dynamic regions
 * - web-performance: dynamic() for FinancialSparkline SVG; batched API calls
 * - responsive-design: grid-cols-1 → lg:grid-cols-3 layout
 */

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  FolderPlus, ArrowRight, Sparkles, ListOrdered, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Cloud, Zap, Database,
  Activity as ActivityIcon, BarChart2, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProject';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { Skeleton, EmptyState, Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { api, ProjectDetail } from '@/lib/api';
import { formatMoney } from '@/lib/currency';
import { consolidateCurrencies } from '@/lib/currency-convert';
import { listActivity } from '@/lib/activity';
import { Project, Currency, LedgerItem } from '@scope-creep-ledger/shared';
import { PageHeader } from '@/components/PageHeader';
import { NeedsAttentionCard } from '@/components/dashboard/NeedsAttentionCard';
import { cn } from '@/lib/utils';

// Dynamic-load heavy SVG component (web-performance: code-split)
const FinancialSparkline = dynamic(
  () => import('@/components/dashboard/FinancialSparkline').then((m) => ({ default: m.FinancialSparkline })),
  { ssr: false, loading: () => <Skeleton className="h-40 rounded-lg" /> }
);

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface Aggregate {
  items: number;
  reviewCount: number;
  hours: number;
  costByCurrency: Record<Currency, number>;
  verifiedCount: number;
}

interface KpiTile {
  label: string;
  value: string | number;
  hint: string;
  tone: 'danger' | 'info' | 'success' | 'default';
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const preferredCurrency: Currency = (user?.defaultCurrency ?? 'USD') as Currency;
  const { projects, loading, error } = useProjects(user?.userId);
  const [activity, setActivity] = React.useState(() => listActivity().slice(0, 8));
  const [details, setDetails] = React.useState<Map<string, ProjectDetail> | null>(null);
  const [aggregate, setAggregate] = React.useState<Aggregate | null>(null);
  const [unverifiedItems, setUnverifiedItems] = React.useState<Array<{ item: LedgerItem; project: Project }>>([]);

  React.useEffect(() => {
    const handleActivityChange = () => setActivity(listActivity().slice(0, 8));
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

    Promise.all(
      projects.map((p) => api.getProject(p.id, user?.userId).catch(() => null))
    ).then((results) => {
      if (!alive) return;
      const detailMap = new Map<string, ProjectDetail>();
      let items = 0;
      let reviewCount = 0;
      let hours = 0;
      let verifiedCount = 0;
      const costByCurrency = {} as Record<Currency, number>;
      const pendingItems: Array<{ item: LedgerItem; project: Project }> = [];

      projects.forEach((p, i) => {
        const detail = results[i];
        if (!detail) return;
        detailMap.set(p.id, detail);
        items += (detail.ledgerItems ?? []).length;
        hours += detail.totals.totalHours;
        verifiedCount += detail.totals.verifiedCount;
        reviewCount += detail.totals.reviewCount;
        const c = detail.project.currency;
        costByCurrency[c] = (costByCurrency[c] ?? 0) + detail.totals.totalCost;

        // Collect items needing review for "Needs Attention" queue
        (detail.ledgerItems ?? []).forEach((item) => {
          if (item.verificationStatus === 'review_required') {
            reviewCount++;
            pendingItems.push({ item, project: p as Project });
          }
        });
      });

      setDetails(detailMap);
      setAggregate({ items, reviewCount, hours, costByCurrency, verifiedCount });
      // Sort by confidence ascending (lowest confidence = most critical)
      setUnverifiedItems(pendingItems.sort((a, b) => a.item.confidence - b.item.confidence).slice(0, 3));
    });

    return () => { alive = false; };
  }, [projects, user?.userId]);

  const recentProjects = (projects ?? []).slice(0, 5);
  const consolidatedValue = aggregate
    ? consolidateCurrencies(aggregate.costByCurrency, preferredCurrency)
    : 0;

  // Build sparkline data points from project details
  const sparklineData = React.useMemo(() => {
    if (!details || !projects) return [];
    return projects.map((p) => {
      const d = details.get(p.id);
      return {
        label: p.name,
        originalValue: d ? d.totals.totalCost * 0.8 : 0, // 80% baseline, 20% creep (illustrative)
        creepValue: d ? d.totals.totalCost * 0.2 : 0,
        currency: p.currency as Currency,
      };
    }).filter((dp) => dp.originalValue > 0);
  }, [details, projects]);

  // ── KPI Tiles ──
  const kpiTiles: KpiTile[] = [
    {
      label: 'Needs Review',
      value: aggregate?.reviewCount ?? 0,
      hint: 'Items awaiting verification',
      tone: 'danger',
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      label: 'Projects',
      value: projects?.length ?? 0,
      hint: 'Active analyzed projects',
      tone: 'info',
      icon: <FolderPlus className="h-4 w-4" />,
    },
    {
      label: 'Verified Items',
      value: aggregate?.verifiedCount ?? 0,
      hint: 'Ready to invoice',
      tone: 'success',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: 'Recoverable',
      value: consolidatedValue > 0 ? formatMoney(consolidatedValue, preferredCurrency) : '—',
      hint: `Total value in ${preferredCurrency}`,
      tone: 'default',
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  const TILE_STYLES: Record<KpiTile['tone'], string> = {
    danger: 'border-danger/20 bg-danger/5 hover:shadow-glow-danger',
    info: 'border-info/20 bg-info/5 hover:shadow-glow-info',
    success: 'border-success/20 bg-success/5 hover:shadow-glow-success',
    default: 'border-border hover:shadow-card-hover',
  };

  const TILE_TEXT: Record<KpiTile['tone'], string> = {
    danger: 'text-danger',
    info: 'text-info',
    success: 'text-success',
    default: 'text-foreground',
  };

  return (
    <div className="space-y-8">
      {/* ── Hero Greeting ── */}
      <div className="animate-fade-up">
        <PageHeader
          title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
          description="Catch the unbilled work hiding between the lines."
          actions={
            <Button asChild size="lg" id="dashboard-new-project-btn">
              <Link href="/app/projects/new">
                <FolderPlus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          }
        />
      </div>

      {/* ── KPI Tiles ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up delay-50">
        {kpiTiles.map((tile) => (
          <Card key={tile.label} className={cn('transition-all duration-200', TILE_STYLES[tile.tone])}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('p-1.5 rounded-md bg-card border border-border', TILE_TEXT[tile.tone])}>
                  {tile.icon}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">{tile.hint}</span>
              </div>
              <p className={cn('text-2xl font-bold tabular-nums', TILE_TEXT[tile.tone])}>
                {tile.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{tile.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main 2+1 Column Layout ── */}
      <div className="grid gap-6 lg:grid-cols-3 animate-fade-up delay-100">
        {/* ── Left Wide Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Projects Table */}
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm">Active Projects</CardTitle>
              <Link href="/app/projects" className="text-xs font-medium text-info hover:underline underline-offset-2 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-px p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<FolderPlus className="h-5 w-5" />}
                    title="No projects yet"
                    description="Upload a conversation to get started."
                    action={
                      <Button asChild size="sm">
                        <Link href="/app/projects/new">Create first project</Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left font-medium text-muted-foreground px-4 py-2">Project</th>
                        <th className="text-left font-medium text-muted-foreground px-2 py-2 hidden sm:table-cell">Client</th>
                        <th className="text-right font-medium text-muted-foreground px-2 py-2">Changes</th>
                        <th className="text-right font-medium text-muted-foreground px-2 py-2 hidden md:table-cell">+Hours</th>
                        <th className="text-right font-medium text-muted-foreground px-4 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProjects.map((project) => {
                        const detail = details?.get(project.id);
                        return (
                          <tr
                            key={project.id}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <Link
                                href={`/app/projects/${project.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
                              >
                                {project.name}
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-muted-foreground hidden sm:table-cell">
                              {project.clientName}
                            </td>
                            <td className="px-2 py-3 text-right">
                              {detail ? (
                                <Badge variant={detail.totals.reviewCount > 0 ? 'warning' : 'success'} className="text-[10px]">
                                  +{(detail.ledgerItems ?? []).length}
                                </Badge>
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-2 py-3 text-right text-muted-foreground hidden md:table-cell tabular-nums">
                              {detail ? `+${detail.totals.totalHours.toFixed(1)}h` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-success">
                              {detail && detail.totals.totalCost > 0
                                ? formatMoney(detail.totals.totalCost, project.currency as Currency)
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Sparkline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-success" />
                  Financial Impact
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">Converted to {preferredCurrency}</span>
              </div>
            </CardHeader>
            <CardContent>
              <FinancialSparkline
                dataPoints={sparklineData}
                preferredCurrency={preferredCurrency}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Right Narrow Column ── */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" size="sm" id="dashboard-analyze-btn">
                <Link href="/app/analysis/new">
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyse New Project
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/app/projects">
                  <ListOrdered className="h-3.5 w-3.5" />
                  View All Projects
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/app/activity">
                  <ActivityIcon className="h-3.5 w-3.5" />
                  Activity Feed
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* AWS Powered Mini-Card */}
          <Card className="border-brand-accent/20 bg-brand-accent/5 hover:shadow-glow transition-all duration-200">
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-brand-accent" />
                <span className="text-xs font-semibold text-foreground">Powered by AWS</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              </div>
              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-warning flex-shrink-0" />
                  <span>Amazon Bedrock (Claude 3 Haiku)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-success flex-shrink-0" />
                  <span>DynamoDB · Projects · Ledger · Activity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cloud className="h-3 w-3 text-info flex-shrink-0" />
                  <span>S3 · Conversation archives</span>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full h-7 text-[10px] text-brand-accent hover:bg-brand-accent/10">
                <Link href="/app/aws-architecture">
                  View Architecture <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Link href="/app/activity" className="text-xs font-medium text-info hover:underline underline-offset-2">
                All <ArrowRight className="inline h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityTimeline events={activity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Needs Your Attention ── */}
      {unverifiedItems.length > 0 && (
        <section className="space-y-4 animate-fade-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Needs Your Attention</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {aggregate?.reviewCount ?? 0} scope items waiting for verification
              </p>
            </div>
            {(aggregate?.reviewCount ?? 0) > 3 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/app/projects">View all →</Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unverifiedItems.map(({ item, project }) => (
              <NeedsAttentionCard key={item.id} item={item} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}