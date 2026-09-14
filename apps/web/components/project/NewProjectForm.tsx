'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2, FolderPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_CURRENCY } from '@/lib/currency';
import { api, ApiError } from '@/lib/api';
import { recordActivity } from '@/lib/activity';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Textarea, Select, Badge } from '@/components/ui';
import { FileStaging, StagedFile, readStagedText } from '@/components/upload/FileStaging';
import { AnalysisProgress, AnalysisResult } from '@/components/analysis/AnalysisProgress';
import { RateInput } from '@/components/RateInput';
import type { Currency, FreelancerRole } from '@scope-creep-ledger/shared';

const ROLES: { value: FreelancerRole; label: string }[] = [
  { value: 'web-dev', label: 'Web / Software Developer' },
  { value: 'ui-ux', label: 'UI/UX & Product Designer' },
  { value: 'copywriter', label: 'Copywriter & Content Strategist' },
  { value: 'video-editor', label: 'Video Editor & Motion Designer' },
  { value: 'consultant', label: 'Consultant / Marketer' },
];

type Phase = 'form' | 'running' | 'complete' | 'error';

export function NewProjectForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [freelancerRole, setFreelancerRole] = useState<FreelancerRole>('web-dev');
  const [originalScope, setOriginalScope] = useState('');
  const [rate, setRate] = useState<number>(60);
  const [currency, setCurrency] = useState<Currency>(user?.defaultCurrency ?? DEFAULT_CURRENCY);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

  const [phase, setPhase] = useState<Phase>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const fileCount = stagedFiles.filter((f) => f.source === 'file').length;

  const loadSampleThread = async () => {
    setLoadingSample(true);
    try {
      const res = await fetch('/sample-whatsapp-redesign.txt');
      if (!res.ok) throw new Error('Could not load the sample thread.');
      const text = await res.text();
      setStagedFiles((prev) => [
        ...prev,
        {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: 'Sample thread (benchmark).txt',
          size: text.length,
          source: 'sample',
          text,
        },
      ]);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to load sample thread.');
    } finally {
      setLoadingSample(false);
    }
  };

  const runAnalysis = async () => {
    // Build the raw conversation text only now that the user has confirmed.
    let rawText = '';
    try {
      rawText = await readStagedText(stagedFiles);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Could not read the selected files.');
      return;
    }
    if (!rawText.trim()) {
      setErrorMessage('Upload or paste at least one conversation file.');
      return;
    }
    if (!originalScope.trim()) {
      setErrorMessage('Describe your original scope before analyzing.');
      return;
    }

    setPhase('running');
    setErrorMessage(null);
    try {
      const response = await api.analyzeProject({
        projectName: projectName.trim() || 'Untitled Project',
        clientName: clientName.trim() || 'Client',
        freelancerRole,
        originalScope,
        hourlyRate: rate,
        currency,
        rawConversationText: rawText,
        userId: user?.userId,
      });

      recordActivity({
        type: 'analysis_completed',
        projectId: response.projectId,
        projectName: projectName.trim() || 'Untitled Project',
        message: `Analysis completed for "${projectName.trim() || 'Untitled Project'}"`,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('scope-creep-project-updated'));
      }

      setResult({
        totalScopeCreepItems: response.summary.totalScopeCreepItems,
        totalEstimatedHours: response.summary.totalEstimatedHours,
        totalEstimatedCost: response.summary.totalEstimatedCost,
        reviewRequiredCount: response.summary.reviewRequiredCount,
      });
      setProjectId(response.projectId);
      setPhase('complete');
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : 'Analysis failed. Please try again.');
      setPhase('error');
    }
  };

  if (phase === 'running' || phase === 'complete' || phase === 'error') {
    return (
      <Card>
        <CardContent className="pt-6">
          <AnalysisProgress
            status={phase === 'error' ? 'error' : phase === 'complete' ? 'complete' : 'running'}
            result={result}
            error={errorMessage}
            projectName={projectName.trim() || 'your project'}
            onReview={
              phase === 'complete' && projectId
                ? () => router.push(`/app/projects/${projectId}/ledger`)
                : undefined
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Baseline scope is locked in first. Conversation files are staged below and upload only
            after you confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                required
                placeholder="Acme Website"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-name">Client / company</Label>
              <Input
                id="client-name"
                required
                placeholder="Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="freelancer-role">Your role</Label>
            <Select
              id="freelancer-role"
              value={freelancerRole}
              onChange={(e) => setFreelancerRole(e.target.value as FreelancerRole)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>

          <RateInput
            rate={rate}
            onRateChange={setRate}
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <div className="space-y-1.5">
            <Label htmlFor="original-scope">Original baseline scope</Label>
            <Textarea
              id="original-scope"
              required
              rows={6}
              placeholder="What was agreed? List included deliverables, pages, revisions, and anything explicitly excluded (e.g., backend development, extra pages, mobile version)."
              value={originalScope}
              onChange={(e) => setOriginalScope(e.target.value)}
              className="font-mono text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation files</CardTitle>
          <CardDescription>
            Files stay in browser staging until you confirm the upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileStaging files={stagedFiles} onChange={setStagedFiles} />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={loadSampleThread}
            loading={loadingSample}
          >
            <Wand2 className="h-4 w-4" /> Load benchmark sample thread
          </Button>

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            {fileCount > 0 ? (
              <Button className="w-full" size="lg" onClick={runAnalysis}>
                <FolderPlus className="h-4 w-4" /> Upload &amp; Analyze {fileCount} File{fileCount === 1 ? '' : 's'}
              </Button>
            ) : stagedFiles.length > 0 ? (
              <Button className="w-full" size="lg" onClick={runAnalysis}>
                Analyze Sample Thread
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={runAnalysis} disabled>
                Add conversation files to analyze
              </Button>
            )}
            <Badge variant="secondary" className="mt-3 w-full justify-center">
              {currency} · {rate ? `rate ${rate}` : 'no rate'} /hr
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}