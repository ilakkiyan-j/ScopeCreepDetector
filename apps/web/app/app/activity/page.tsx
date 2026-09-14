'use client';

import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { listActivity, clearActivity, ActivityEvent } from '@/lib/activity';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui';

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(listActivity());

    const handleUpdate = () => {
      setEvents(listActivity());
    };

    window.addEventListener('scope-creep-activity-updated', handleUpdate);
    return () => {
      window.removeEventListener('scope-creep-activity-updated', handleUpdate);
    };
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local activity logs?')) {
      clearActivity();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Activity"
          description="A transparent log of your real actions this session — nothing is implied or auto-generated."
        />
        {events.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="self-start sm:self-auto gap-2 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
            Clear Activity Log
          </Button>
        )}
      </div>
      <ActivityTimeline events={events} />
    </div>
  );
}