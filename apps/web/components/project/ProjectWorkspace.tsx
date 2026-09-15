'use client';

import React, { createContext, useContext } from 'react';
import { Cloud } from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { api, ProjectDetail } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { recordActivity } from '@/lib/activity';
import { LoadingState } from '@/components/state/LoadingState';
import { ProjectTabs } from '@/components/project/ProjectTabs';
import { Badge, Button, EmptyState } from '@/components/ui';
import { PROJECT_STATUS_LABEL } from '@/lib/api';
import { PROJECT_STATUS_TONE } from '@/lib/projectStatus';
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

export function ProjectProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const ownerId = user?.userId;
  const { loading, error, reload, updateItem, ...detail } = useProject(projectId, ownerId);

  const verifyItem = async (itemId: string) => {
    const item = detail.ledgerItems?.find((i) => i.id === itemId);
    const res = await api.verifyLedgerItem({
      projectId,
      ledgerItemId: itemId,
      action: 'verify',
      userId: ownerId,
    });
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
    await api.verifyLedgerItem({
      projectId,
      ledgerItemId: itemId,
      action: 'reject',
      userId: ownerId,
    });
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

function PushToCloudButton() {
  const { reload } = useProjectWorkspace();
  const { user } = useAuth();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncLocalProjectsToCloud(user?.userId);
      reload();
    } catch {
      /* ignore */
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="border-warning/50 text-warning hover:bg-warning/10"
    >
      <Cloud className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Pushing to AWS...' : 'Push to Cloud'}
    </Button>
  );
}

export function ProjectWorkspace({ children }: { children: React.ReactNode }) {
  const { project, loading, error } = useProjectWorkspace();

  return (
    <div className="space-y-6">
      {loading && !project ? (
        <LoadingState label="Loading project…" />
      ) : error && !project ? (
        <div className="py-12">
          <EmptyState
            title="Project Not Found"
            description="This project ID is not available in your AWS cloud storage or local cache. Create a new analysis or choose an active project."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <Button variant="outline" onClick={() => window.location.href = '/app/projects'}>
                  View All Projects
                </Button>
                <Button onClick={() => window.location.href = '/app/analysis/new'}>
                  Start New Analysis
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{project?.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {project?.clientName}
                  {project?.updatedAt && (
                    <span className="before:mx-1.5 before:content-['·']">
                      Updated{' '}
                      {new Date(project.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {project?.isLocalOnly ? (
                  <PushToCloudButton />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-md">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Cloud Synced
                  </span>
                )}
                <Badge variant="outline">{project?.currency}</Badge>
                <Badge variant={PROJECT_STATUS_TONE[project?.status ?? 'draft']}>
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