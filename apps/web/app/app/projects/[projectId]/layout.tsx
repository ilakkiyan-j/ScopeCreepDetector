'use client';

import React from 'react';
import { ProjectProvider, ProjectWorkspace } from '@/components/project/ProjectWorkspace';

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <ProjectProvider projectId={params.projectId}>
      <ProjectWorkspace>{children}</ProjectWorkspace>
    </ProjectProvider>
  );
}