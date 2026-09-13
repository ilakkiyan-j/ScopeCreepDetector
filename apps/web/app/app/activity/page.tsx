'use client';

import React from 'react';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { listActivity } from '@/lib/activity';

export default function ActivityPage() {
  const [events] = React.useState(() => listActivity());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground">
          A transparent log of your real actions this session — nothing is implied or auto-generated.
        </p>
      </div>
      <ActivityTimeline events={events} />
    </div>
  );
}