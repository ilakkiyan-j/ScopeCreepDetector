'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollText, Lock, ArrowRight } from 'lucide-react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function ScopePage({ params }: { params: { projectId: string } }) {
  const { project } = useProjectWorkspace();
  if (!project) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Scope"
        description="The agreed baseline against which every message is measured."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" /> Original baseline scope
          </CardTitle>
          <CardDescription>
            This is the contract against which every message is compared. Keep it accurate —
            the estimator treats it as ground truth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
            {project.originalScope}
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/30">
        <CardContent className="flex items-start gap-3 pt-6">
          <span className="mt-0.5 rounded-md bg-warning/10 p-1.5 text-warning">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Baseline is locked per analysis</p>
            <p className="mt-1 text-xs text-muted-foreground">
              If the agreed scope changes mid-project, create a new analysis so creep detection
              compares against the updated baseline. Editing the text here won&rsquo;t re-run the
              classifier.
            </p>
            <Button variant="link" size="sm" className="mt-1 p-0" asChild>
              <Link href="/app/projects/new">
                Start a new project with updated scope <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}