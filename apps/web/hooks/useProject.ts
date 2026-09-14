'use client';

import { useCallback, useEffect, useState } from 'react';
import { Project, LedgerItem } from '@scope-creep-ledger/shared';
import { api, ProjectDetail } from '@/lib/api';
import { ApiError } from '@/lib/api';

export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.listProjects(userId);
      setProjects(data.projects);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load projects.');
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading: projects === null, error, reload: load };
}

export function useProject(projectId: string, userId?: string) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      const detail = await api.getProject(projectId, userId);
      setData(detail);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load project.');
    }
  }, [projectId, userId]);

  useEffect(() => {
    if (projectId) load();
  }, [projectId, load]);

  const updateItem = useCallback(
    (itemId: string, patch: Partial<LedgerItem>) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ledgerItems: prev.ledgerItems.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        };
      });
    },
    []
  );

  return { ...data, loading: !data && !error, error, reload: load, updateItem };
}