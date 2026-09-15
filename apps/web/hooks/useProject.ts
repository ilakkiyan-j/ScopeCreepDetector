'use client';

import { useCallback, useEffect, useState } from 'react';
import { Project, LedgerItem } from '@scope-creep-ledger/shared';
import { api, ProjectDetail, ApiError, getLocalProjectDetail, getLocalProjects } from '@/lib/api';

// Module-level in-memory cache to ensure instant UI rendering during section switching
// Module-level in-memory cache scoped per userId to ensure instant UI rendering without cross-account leakage
const userProjectsCacheMap = new Map<string, Project[]>();
const projectCacheMap = new Map<string, ProjectDetail>();

export function useProjects(userId?: string) {
  const cacheKey = userId || '__guest';
  const [projects, setProjects] = useState<Project[] | null>(
    () => userProjectsCacheMap.get(cacheKey) || getLocalProjects(userId) || null
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.listProjects(userId);
      userProjectsCacheMap.set(cacheKey, data.projects);
      setProjects(data.projects);
      setError(null);
    } catch (e) {
      const fallback = getLocalProjects(userId);
      if (fallback.length > 0) {
        setProjects(fallback.map((p) => ({ ...p, isLocalOnly: true })));
      } else {
        setError(e instanceof ApiError ? e.message : 'Failed to load projects.');
      }
    }
  }, [userId, cacheKey]);

  useEffect(() => {
    // Reset or re-hydrate projects for current userId
    setProjects(userProjectsCacheMap.get(cacheKey) || getLocalProjects(userId) || null);
    load();

    const handleRevalidate = () => {
      load();
    };

    window.addEventListener('scope-creep-project-updated', handleRevalidate);

    return () => {
      window.removeEventListener('scope-creep-project-updated', handleRevalidate);
    };
  }, [load, cacheKey, userId]);

  return { projects: projects || [], loading: projects === null && !error, error, reload: load };
}

export function useProject(projectId: string, userId?: string) {
  const [data, setData] = useState<ProjectDetail | null>(() => {
    if (!projectId) return null;
    return projectCacheMap.get(projectId) || getLocalProjectDetail(projectId) || null;
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const detail = await api.getProject(projectId, userId);
      if (projectId) {
        projectCacheMap.set(projectId, detail);
      }
      setData(detail);
      setError(null);
    } catch (e) {
      const fallback = projectId ? getLocalProjectDetail(projectId) : null;
      if (fallback) {
        (fallback.project as any).isLocalOnly = true;
        setData(fallback);
        setError(null);
      } else {
        setError(e instanceof ApiError ? e.message : 'Failed to load project.');
      }
    }
  }, [projectId, userId]);

  useEffect(() => {
    if (projectId) load();
  }, [projectId, load]);

  const updateItem = useCallback(
    (itemId: string, patch: Partial<LedgerItem>) => {
      setData((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          ledgerItems: prev.ledgerItems.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        };
        if (projectId) {
          projectCacheMap.set(projectId, updated);
        }
        return updated;
      });
    },
    [projectId]
  );

  return { ...data, loading: !data && !error, error, reload: load, updateItem };
}