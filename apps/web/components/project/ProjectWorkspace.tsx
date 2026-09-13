'use client';

import React, { createContext, useContext } from 'react';
import { useProject } from '@/hooks/useProject';
import { api, ProjectDetail } from '@/lib/api';
import { recordActivity } from '@/lib/activity';
import { LoadingState } from '@/components/state/LoadingState';
import { ProjectTabs } from '@/components/project/ProjectTabs';
import { Badge, Button } from '@/components/ui';
import { PROJECT_STATUS_LABEL } from '@/lib/api';
import { ProjectStatus } from '@scope-creep-ledger/shared';
import { LedgerItem, Project } from '@scope-creep-ledger/shared';

type Detail = ProjectDetail;

interface ProjectWorkspaceValue {
  project: Project | null;
  ledgerItems: LedgerItem[] | null;
  totals: Detail['totals'] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  updateItemLocal: (itemId: string, patch: Partial<LedgerItem>) => void;
  verifyItem: (itemId: string) => Promise<void>;
  rejectItem: (itemId: string) => Promise<void>;
}

const ProjectWorkspaceContext = createContext<ProjectWorkspaceValue | null>(null);

export function useProjectWorkspace() {
  const ctx = useContext(ProjectWorkspaceContext);
  if (!ctx) throw new Error('useProjectWorkspace must be used inside ProjectProvider');
  return ctx;
}

const STATUS_TONE: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'secondary' | 'outline'> = {
  draft: 'outline',
  analyzed: 'success',
  review: 'warning',
  'change-orders': 'info',
  closed: 'secondary',
};

export function ProjectProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const { loading, error, reload, updateItem, ...detail } = useProject(projectId);

  const verifyItem = async (itemId: string) => {
    const item = detail.ledgerItems?.find((i) => i.id === itemId);
    const res = await api.verifyLedgerItem({ projectId, ledgerItemId: itemId, action: 'verify' });
    updateItem(itemId, { verificationStatus: 'verified' });
    reload();
    if (item) {
      recordActivity({
        type: 'item_verified',
        projectId,
        projectName: detail.project?.name ?? null,
        message: `Verified "${item.originalMessage.slice(0, 50)}${item.originalMessage.length > 50 ? '…' : ''}"`,
      });
    }
    void res;
  };

  const rejectItem = async (itemId: string) => {
    const item = detail.ledgerItems?.find((i) => i.id === itemId);
    await api.verifyLedgerItem({ projectId, ledgerItemId: itemId, action: 'reject' });
    updateItem(itemId, { verificationStatus: 'rejected' });
    reload();
    if (item) {
      recordActivity({
        type: 'item_rejected',
        projectId,
        projectName: detail.project?.name ?? null,
        message: `Rejected "${item.originalMessage.slice(0, 50)}${item.originalMessage.length > 50 ? '…' : ''}"`,
      });
    }
  };

  return (
    <ProjectWorkspaceContext.Provider
      value={{
        project: detail.project ?? null,
        ledgerItems: detail.ledgerItems ?? null,
        totals: detail.totals ?? null,
        loading,
        error,
        reload,
        updateItemLocal: updateItem,
        verifyItem,
        rejectItem,
      }}
    >
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function ProjectWorkspace({ children }: { children: React.ReactNode }) {
  const { project, loading, error } = useProjectWorkspace();

  return (
    <div className="space-y-6">
      {loading && !project ? (
        <LoadingState label="Loading project…" />
      ) : error && !project ? (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
          <br />
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project?.name}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{project?.clientName}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline">{project?.currency}</Badge>
                <Badge variant={STATUS_TONE[project?.status ?? 'draft']}>
                  {PROJECT_STATUS_LABEL[project?.status ?? 'draft']}
                </Badge>
              </div>
            </div>
          </div>
          <ProjectTabs basePath={`/app/projects/${project?.id ?? ''}`} />
          {children}
        </>
      )}
    </div>
  );
}