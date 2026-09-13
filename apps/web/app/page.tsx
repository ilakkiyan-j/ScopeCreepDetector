'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProjectForm } from '../components/ProjectForm';
import { ScopePanel } from '../components/ScopePanel';
import { LedgerPanel } from '../components/LedgerPanel';
import { ReviewModal } from '../components/ReviewModal';
import { ChangeOrderModal } from '../components/ChangeOrderModal';

import {
  Project,
  ProjectAnalysis,
  AnalyzeRequest,
  AnalyzeResponse,
  VerificationStatus,
} from '../../../shared/types';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<ProjectAnalysis | null>(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);

  const handleAnalyze = async (request: AnalyzeRequest) => {
    setIsLoading(true);
    try {
      // Call Next.js API Route /api/analyze
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to analyze conversation.');
      }

      const response: AnalyzeResponse = await res.json();

      const currentProject: Project = {
        id: response.projectId,
        name: request.projectName,
        clientName: request.clientName,
        originalScope: request.originalScope,
        hourlyRate: request.hourlyRate,
        currency: 'USD',
        createdAt: new Date().toISOString(),
      };

      setProject(currentProject);
      setSummary(response.summary);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle User Verification / Rejection of Flagged Items
  const handleVerifyItem = (
    itemId: string,
    action: 'verify' | 'reject',
    customHours?: number
  ) => {
    if (!summary || !project) return;

    const updatedItems = summary.ledgerItems.map((item) => {
      if (item.id === itemId) {
        const newStatus: VerificationStatus = action === 'verify' ? 'verified' : 'rejected';
        const hours = typeof customHours === 'number' ? customHours : item.estimatedHours;
        const cost = hours * project.hourlyRate;

        return {
          ...item,
          verificationStatus: newStatus,
          estimatedHours: hours,
          estimatedCost: cost,
        };
      }
      return item;
    });

    // Recalculate deterministic project totals
    let totalEstimatedHours = 0;
    let totalEstimatedCost = 0;
    let reviewRequiredCount = 0;

    updatedItems.forEach((item) => {
      if (item.verificationStatus === 'verified') {
        totalEstimatedHours += item.estimatedHours;
        totalEstimatedCost += item.estimatedCost;
      } else if (item.verificationStatus === 'review_required') {
        reviewRequiredCount++;
      }
    });

    setSummary({
      ...summary,
      totalEstimatedHours: Math.round(totalEstimatedHours * 100) / 100,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
      reviewRequiredCount,
      ledgerItems: updatedItems,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project Creation & Ingestion Form */}
        <section>
          <ProjectForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Two-Panel Dashboard View */}
        {project && summary ? (
          <section className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Panel: Original Baseline Scope */}
              <div className="lg:col-span-5">
                <ScopePanel project={project} />
              </div>

              {/* Right Panel: Scope Creep Ledger */}
              <div className="lg:col-span-7">
                <LedgerPanel
                  summary={summary}
                  onOpenReviewModal={() => setIsReviewOpen(true)}
                  onOpenChangeOrderModal={() => setIsChangeOrderOpen(true)}
                />
              </div>
            </div>
          </section>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800/60">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ready to Audit Scope Drift</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Click <strong className="text-amber-300 font-semibold">"Load Benchmark Demo Thread"</strong> above to test the entire pipeline with a 18-message client thread, or paste your own project details.
            </p>
          </div>
        )}
      </main>

      {/* Interactive Review Queue Modal */}
      {project && summary && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          items={summary.ledgerItems}
          onVerify={handleVerifyItem}
        />
      )}

      {/* Change Order Email Preview Modal */}
      {project && summary && (
        <ChangeOrderModal
          isOpen={isChangeOrderOpen}
          onClose={() => setIsChangeOrderOpen(false)}
          project={project}
          summary={summary}
        />
      )}
    </div>
  );
}
