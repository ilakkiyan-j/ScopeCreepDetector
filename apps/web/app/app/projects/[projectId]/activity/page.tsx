'use client';

import React from 'react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { PageHeader } from '@/components/PageHeader';
import { listActivity } from '@/lib/activity';

export default function ProjectActivityPage() {
  const { project } = useProjectWorkspace();
  const [events, setEvents] = React.useState(() => listActivity().filter((e) => e.projectId === project?.id));

  React.useEffect(() => {
    if (project) setEvents(listActivity().filter((e) => e.projectId === project.id));
  }, [project]);

  if (!project) return null;

  return (
    <>
      <PageHeader
        title="Activity"
        description="Real actions performed on this project this session."
      />
      <ActivityTimeline
        events={events}
        emptyMessage="No activity for this project yet"
        emptyDescription="Verifying scope items, generating change orders, and completing analyses will be logged here."
      />
    </>
  );
}