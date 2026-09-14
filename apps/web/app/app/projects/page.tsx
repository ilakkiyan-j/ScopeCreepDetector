'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FolderPlus, FolderKanban, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProject';
import { ProjectCard } from '@/components/project/ProjectCard';
import { LoadingState } from '@/components/state/LoadingState';
import { EmptyState, Card, CardContent, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, error } = useProjects(user?.userId);
  const [query, setQuery] = useState('');

  const filtered = (projects ?? []).filter((p) =>
    `${p.name} ${p.clientName}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every analyzed engagement, one ledger at a time."
        actions={
          <Button asChild size="lg">
            <Link href="/app/projects/new">
              <FolderPlus className="h-4 w-4" /> New Project
            </Link>
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by project or client…"
          className="pl-9"
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