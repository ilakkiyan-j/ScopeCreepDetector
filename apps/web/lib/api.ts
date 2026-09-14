/**
 * Typed API client — single entry point for all server calls.
 * Every request transaction lives here so components stay free of
 * fetch/xhr plumbing.
 *
 * Includes dual-storage client persistence (localStorage mirror) so projects
 * and ledger receipts never vanish on serverless container recycles or network drops.
 */
import {
  AnalyzeRequest,
  AnalyzeResponse,
  ChangeOrderRequest,
  ChangeOrderResponse,
  VerifyLedgerItemRequest,
  LedgerItem,
  Project,
  ProjectStatus,
} from '@scope-creep-ledger/shared';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const LOCAL_PROJECTS_KEY = 'scope_creep_projects_mirror';
const LOCAL_LEDGER_PREFIX = 'scope_creep_ledger_mirror_';

export function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalProject(project: Project): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalProjects();
    const map = new Map<string, Project>();
    existing.forEach((p) => map.set(p.id, p));
    map.set(project.id, project);
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(Array.from(map.values())));
  } catch {
    /* fallback ignore */
  }
}

export function getLocalProjectDetail(projectId: string): ProjectDetail | null {
  if (typeof window === 'undefined') return null;
  try {
    const projects = getLocalProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    const rawLedger = localStorage.getItem(`${LOCAL_LEDGER_PREFIX}${projectId}`);
    const ledgerItems: LedgerItem[] = rawLedger ? JSON.parse(rawLedger) : [];

    const verified = ledgerItems.filter((i) => i.verificationStatus === 'verified');
    const review = ledgerItems.filter((i) => i.verificationStatus === 'review_required');
    const rejected = ledgerItems.filter((i) => i.verificationStatus === 'rejected');

    const totalHours = verified.reduce((acc, i) => acc + (i.estimatedHours || 0), 0);
    const totalCost = verified.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);

    return {
      project,
      ledgerItems,
      totals: {
        totalHours,
        totalCost,
        verifiedCount: verified.length,
        reviewCount: review.length,
        rejectedCount: rejected.length,
      },
    };
  } catch {
    return null;
  }
}

export function saveLocalLedger(projectId: string, ledgerItems: LedgerItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_LEDGER_PREFIX}${projectId}`, JSON.stringify(ledgerItems));
  } catch {
    /* ignore */
  }
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status}).`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export interface ProjectDetail {
  project: Project;
  ledgerItems: LedgerItem[];
  totals: {
    totalHours: number;
    totalCost: number;
    verifiedCount: number;
    reviewCount: number;
    rejectedCount: number;
  };
}

export const api = {
  analyzeProject: async (request: AnalyzeRequest) => {
    const response = await json<AnalyzeResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.projectId && response.summary) {
      const mockProject: Project = {
        id: response.projectId,
        userId: request.userId,
        name: request.projectName,
        clientName: request.clientName,
        freelancerRole: request.freelancerRole || 'web-dev',
        originalScope: request.originalScope,
        hourlyRate: request.hourlyRate,
        currency: request.currency || 'USD',
        status: 'analyzed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveLocalProject(mockProject);
      if (response.summary.ledgerItems) {
        saveLocalLedger(response.projectId, response.summary.ledgerItems);
      }
    }

    return response;
  },

  listProjects: async (userId?: string) => {
    try {
      const data = await json<{ projects: Project[] }>(
        userId ? `/api/projects?userId=${encodeURIComponent(userId)}` : '/api/projects'
      );
      if (data.projects && data.projects.length > 0) {
        data.projects.forEach((p) => {
          (p as any).isLocalOnly = false;
          saveLocalProject(p);
        });
        return data;
      }
    } catch {
      /* network/container fallback */
    }

    const localProjects = getLocalProjects().map((p) => ({ ...p, isLocalOnly: true }));
    return { projects: localProjects };
  },

  getProject: async (projectId: string, userId?: string) => {
    try {
      const detail = await json<ProjectDetail>(
        userId
          ? `/api/projects/${encodeURIComponent(projectId)}?userId=${encodeURIComponent(userId)}`
          : `/api/projects/${encodeURIComponent(projectId)}`
      );
      if (detail.project) {
        (detail.project as any).isLocalOnly = false;
        saveLocalProject(detail.project);
        if (detail.ledgerItems) {
          saveLocalLedger(projectId, detail.ledgerItems);
        }
        return detail;
      }
    } catch {
      /* fallback */
    }

    const localDetail = getLocalProjectDetail(projectId);
    if (localDetail) {
      (localDetail.project as any).isLocalOnly = true;
      return localDetail;
    }

    throw new ApiError('Project not found.', 404);
  },

  verifyLedgerItem: async (request: VerifyLedgerItemRequest) => {
    const res = await json<{ totals: ProjectDetail['totals'] }>('/api/ledger/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const localDetail = getLocalProjectDetail(request.projectId);
    if (localDetail && localDetail.ledgerItems) {
      const updatedItems = localDetail.ledgerItems.map((it) =>
        it.id === request.ledgerItemId
          ? { ...it, verificationStatus: request.action === 'verify' ? ('verified' as const) : ('rejected' as const) }
          : it
      );
      saveLocalLedger(request.projectId, updatedItems);
    }

    return res;
  },

  generateChangeOrder: (request: ChangeOrderRequest) =>
    json<ChangeOrderResponse>('/api/change-order', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: 'Draft',
  analyzed: 'Analyzed',
  review: 'Review',
  'change-orders': 'Change Orders',
  closed: 'Closed',
};