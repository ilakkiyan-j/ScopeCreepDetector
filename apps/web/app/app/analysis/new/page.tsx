'use client';

import React from 'react';
import { NewProjectForm } from '@/components/project/NewProjectForm';

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Analyze a conversation against your original scope to build a scope creep ledger.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}