'use client';

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { listActivity } from '@/lib/activity';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';

export default function AdminActivityPage() {
  const [events] = useState(() => listActivity());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Transparent, honest logging — every entry is a genuine user action recorded in the browser this
          session. <Badge variant="secondary">Browser-local store</Badge>
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ActivityTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}