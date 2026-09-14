'use client';

import React from 'react';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { listActivity } from '@/lib/activity';
import { PageHeader } from '@/components/PageHeader';

export default function ActivityPage() {
  const [events] = React.useState(() => listActivity());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="A transparent log of your real actions this session — nothing is implied or auto-generated."
      />
      <ActivityTimeline events={events} />
    </div>
  );
}