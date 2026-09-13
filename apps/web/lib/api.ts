/**
 * Typed API client — single entry point for all server calls.
 * Every request transaction lives here so components stay free of
 * fetch/xhr plumbing.
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
  analyzeProject: (request: AnalyzeRequest) =>
    json<AnalyzeResponse>('/api/analyze', { method: 'POST', body: JSON.stringify(request) }),

  listProjects: () => json<{ projects: Project[] }>('/api/projects'),

  getProject: (projectId: string) =>
    json<ProjectDetail>(`/api/projects/${encodeURIComponent(projectId)}`),

  verifyLedgerItem: (request: VerifyLedgerItemRequest) =>
    json<{ totals: ProjectDetail['totals'] }>('/api/ledger/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

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