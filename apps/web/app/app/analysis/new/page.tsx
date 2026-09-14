'use client';

import React from 'react';
import { NewProjectForm } from '@/components/project/NewProjectForm';
import { PageHeader } from '@/components/PageHeader';

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Analysis"
        description="Analyze a conversation against your original scope to build a scope creep ledger."
      />
      <NewProjectForm />
    </div>
  );
}