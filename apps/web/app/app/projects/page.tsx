'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FolderPlus, FolderKanban, Search } from 'lucide-react';
import { useProjects } from '@/hooks/useProject';
import { ProjectCard } from '@/components/project/ProjectCard';
import { LoadingState } from '@/components/state/LoadingState';
import { EmptyState, Card, CardContent } from '@/components/ui';

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();
  const [query, setQuery] = useState('');

  const filtered = (projects ?? []).filter((p) =>
    `${p.name} ${p.clientName}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Every analyzed engagement, one ledger at a time.</p>
        </div>
        <Link
          href="/app/projects/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <FolderPlus className="h-4 w-4" /> New Project
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search by project or client…"
          className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
                icon={<FolderKanban className="h-6 w-6" />}
                title="No projects yet"
                description="Create your first project to compare conversations against your baseline scope."
              />
            </CardContent>
          </Card>
        ) : (
          <EmptyState icon={<Search className="h-6 w-6" />} title="No matches" description={`Nothing found for "${query}".`} />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}