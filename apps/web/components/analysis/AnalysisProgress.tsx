'use client';

import React from 'react';
import { Check, Circle, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface AnalysisResult {
  totalScopeCreepItems: number;
  totalEstimatedHours: number;
  totalEstimatedCost: number;
  reviewRequiredCount: number;
}

const STAGES = [
  { key: 'prepare', label: 'Files prepared' },
  { key: 'upload', label: 'Files uploaded' },
  { key: 'parse', label: 'Conversations parsed' },
  { key: 'classify', label: 'Analyzing conversation' },
  { key: 'ledger', label: 'Building scope creep ledger' },
] as const;

type StageIndex = number;

export function AnalysisProgress({
  status,
  result,
  error,
  projectName,
  onReview,
}: {
  status: 'running' | 'complete' | 'error';
  result: AnalysisResult | null;
  error?: string | null;
  projectName: string;
  onReview?: () => void;
}) {
  const [stageProgress, setStageProgress] = React.useState<StageIndex>(-1);
  const running = status === 'running';

  React.useEffect(() => {
    if (!running) {
      // On completion, reveal remaining stages as done.
      if (status === 'complete') setStageProgress(STAGES.length);
      return;
    }
    setStageProgress(0);
    const timer = window.setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= STAGES.length - 1) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [running, status]);

  return (
    <div className="space-y-6 p-6">
      {running && (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-info" />
          Analyzing {projectName}
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error ?? 'Analysis failed. Please try again.'}
        </div>
      )}

      {status === 'complete' && result && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-6">
          <div className="flex items-center gap-2 text-success">
            <PartyPopper className="h-5 w-5" />
            <h3 className="text-base font-semibold">Analysis Complete</h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Creep items</p>
              <p className="text-2xl font-bold text-foreground">{result.totalScopeCreepItems}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Additional hours</p>
              <p className="text-2xl font-bold text-foreground">{result.totalEstimatedHours}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Review queue</p>
              <p className="text-2xl font-bold text-foreground">{result.reviewRequiredCount}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Estimated hours are multiplied by your project rate in deterministic code — no AI-generated totals.
          </p>
          {onReview && (
            <Button className="mt-5" onClick={onReview}>
              Review Ledger <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
      )}

      <ol className="space-y-2.5">
        {STAGES.map((stage, idx) => {
          const completeStage = stageProgress > idx || status === 'complete';
          const activeStage = running && stageProgress === idx;
          const Icon = completeStage ? Check : activeStage ? Loader2 : Circle;
          return (
            <li
              key={stage.key}
              className={cn(
                'flex items-center gap-3 text-sm transition-colors',
                completeStage ? 'text-foreground' : 'text-muted-foreground'
              )}
              aria-current={activeStage ? 'step' : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  completeStage && 'text-success',
                  activeStage && 'animate-spin text-info'
                )}
              />
              {stage.label}
              {activeStage && <span className="text-xs text-muted-foreground">…</span>}
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground">
        This may take a moment while our classifier evaluates each message against your original scope.
      </p>
    </div>
  );
}