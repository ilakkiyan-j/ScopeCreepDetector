'use client';

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { listActivity } from '@/lib/activity';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function AdminActivityPage() {
  const [events] = useState(() => listActivity());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description={
          <>
            Transparent, honest logging — every entry is a genuine user action recorded in the browser this
            session. <Badge variant="secondary">Browser-local store</Badge>
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <ActivityTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}