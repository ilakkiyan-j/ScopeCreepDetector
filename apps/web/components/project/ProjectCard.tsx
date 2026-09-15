'use client';

import Link from 'next/link';
import { FolderKanban, ArrowUpRight, Clock, Cloud } from 'lucide-react';
import { Project } from '@scope-creep-ledger/shared';
import { Badge, Card } from '@/components/ui';
import { api, PROJECT_STATUS_LABEL } from '@/lib/api';
import { PROJECT_STATUS_TONE } from '@/lib/projectStatus';
import { formatMoney } from '@/lib/currency';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ProjectCard({
  project,
  totalCost,
  totalHours,
  scopeChanges,
}: {
  project: Project;
  totalCost?: number;
  totalHours?: number;
  scopeChanges?: number;
}) {
  const status = project.status ?? 'draft';
  return (
    <Link href={`/app/projects/${project.id}/overview`} className="block group">
      <Card className="p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FolderKanban className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{project.clientName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={PROJECT_STATUS_TONE[status]}>
              {PROJECT_STATUS_LABEL[status]}
            </Badge>
            {(project as any).isLocalOnly ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  api.syncLocalProjectsToCloud().then(() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('scope-creep-project-updated'));
                    }
                  });
                }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 hover:bg-warning/20 px-2 py-0.5 rounded-full border border-warning/30 transition-colors"
                title="Click to push project to AWS Cloud"
              >
                <Cloud className="h-2.5 w-2.5 text-warning" />
                Push to Cloud
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full border border-success/20">
                <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
                Cloud Synced
              </span>
            )}
          </div>
        </div>

        {(typeof scopeChanges === 'number' || typeof totalHours === 'number') && (
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {typeof scopeChanges === 'number' && (
              <span>
                <strong className="font-semibold text-foreground">{scopeChanges}</strong> scope change{scopeChanges === 1 ? '' : 's'}
              </span>
            )}
            {typeof totalHours === 'number' && (
              <span>
                <strong className="font-semibold text-foreground">{totalHours}h</strong> additional
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-border/40 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0 truncate">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Updated {timeAgo(project.updatedAt ?? project.createdAt)}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {typeof totalCost === 'number' && totalCost > 0 && (
              <span className="font-bold text-success">
                {formatMoney(totalCost, project.currency)}
              </span>
            )}
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </div>
      </Card>
    </Link>
  );
}