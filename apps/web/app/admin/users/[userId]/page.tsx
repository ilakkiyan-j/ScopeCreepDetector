'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminProjectRows } from '@/hooks/useAdminOverview';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatMoney } from '@/lib/currency';
import { LoadingState } from '@/components/state/LoadingState';
import { PageHeader } from '@/components/PageHeader';

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const { allUsers } = useAuth();
  const { rows, loading } = useAdminProjectRows();
  const user = allUsers.find((u) => u.userId === params.userId);

  if (!user) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="text-sm font-medium text-info hover:underline">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Back to users
        </Link>
        <div role="status" className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          User not found.
        </div>
      </div>
    );
  }

  const userProjects = (rows ?? []).filter((r) => r.project.userId === user.userId);
  const statusTone = user.status === 'active' ? 'success' : 'secondary';

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm font-medium text-info hover:underline">
        <ArrowLeft className="mr-1 inline h-4 w-4" /> Back to users
      </Link>

      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <Badge variant={user.role === 'ADMIN' ? 'info' : 'secondary'}>{user.role}</Badge>
            <Badge variant={statusTone}>{user.status}</Badge>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Profession</dt>
              <dd className="mt-0.5 text-foreground">{user.profession || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Company</dt>
              <dd className="mt-0.5 text-foreground">{user.company || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Default currency</dt>
              <dd className="mt-0.5 text-foreground">{user.defaultCurrency ?? 'INR'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Active since</dt>
              <dd className="mt-0.5 text-foreground">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Projects ({userProjects.length})</h2>
        {loading ? (
          <LoadingState label="Loading projects…" />
        ) : userProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 pt-10 pb-10 text-center text-muted-foreground">
              <FolderKanban className="h-6 w-6" />
              <p className="text-sm">No projects attributed to this user yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {userProjects.map(({ project, totals }) => (
              <Link key={project.id} href={`/app/projects/${project.id}/overview`} className="block">
                <Card className="p-4 transition-shadow hover:shadow-card-hover">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.clientName}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-success">
                      {formatMoney(totals.totalCost, project.currency)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}