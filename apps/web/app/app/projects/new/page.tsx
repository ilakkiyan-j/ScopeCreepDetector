'use client';

import React from 'react';
import { NewProjectForm } from '@/components/project/NewProjectForm';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Project</h1>
        <p className="text-sm text-muted-foreground">
          Lock in your baseline scope, stage conversation files, then confirm to analyze.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}