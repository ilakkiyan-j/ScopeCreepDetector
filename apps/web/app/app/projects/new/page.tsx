'use client';

import React from 'react';
import { NewProjectForm } from '@/components/project/NewProjectForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Project"
        description="Lock in your baseline scope, stage conversation files, then confirm to analyze."
      />
      <NewProjectForm />
    </div>
  );
}