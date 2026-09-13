'use client';

import Link from 'next/link';
import { FolderKanban, ArrowUpRight } from 'lucide-react';
import { Project, ProjectStatus } from '@scope-creep-ledger/shared';
import { Badge, Card } from '@/components/ui';
import { PROJECT_STATUS_LABEL } from '@/lib/api';
import { formatMoney } from '@/lib/currency';

const STATUS_TONE: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'secondary' | 'outline'> = {
  draft: 'outline',
  analyzed: 'success',
  review: 'warning',
  'change-orders': 'info',
  closed: 'secondary',
};

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
}: {
  project: Project;
  totalCost?: number;
}) {
  const status = project.status ?? 'draft';
  return (
    <Link href={`/app/projects/${project.id}/overview`} className="block group">
      <Card className="p-5 transition-shadow hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {project.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{project.clientName}</p>
            </div>
          </div>
          <Badge variant={STATUS_TONE[status]}>{PROJECT_STATUS_LABEL[status]}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Updated {timeAgo(project.createdAt)}
          </span>
          {typeof totalCost === 'number' && totalCost > 0 && (
            <span className="font-semibold text-success">
              {formatMoney(totalCost, project.currency)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}