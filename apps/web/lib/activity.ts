/**
 * Activity log — records real in-session user actions.
 * Synchronizes client localStorage events with AWS DynamoDB activity table.
 */

export type ActivityType =
  | 'project_created'
  | 'analysis_completed'
  | 'item_verified'
  | 'item_rejected'
  | 'change_order_generated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  projectId: string | null;
  projectName: string | null;
  message: string;
  createdAt: string;
}

const KEY = 'scope_creep_activity';

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  project_created: 'Created project',
  analysis_completed: 'Analysis completed',
  item_verified: 'Scope item verified',
  item_rejected: 'Scope item rejected',
  change_order_generated: 'Change order generated',
};

function read(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

function save(events: ActivityEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(sorted));
  } catch {
    /* ignore */
  }
}

export function recordActivity(entry: Omit<ActivityEvent, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return;
  const newEvent: ActivityEvent = {
    ...entry,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const events = read();
  const next = [newEvent, ...events];
  save(next);
  window.dispatchEvent(new CustomEvent('scope-creep-activity-updated'));

  // Asynchronously sync event to AWS DynamoDB
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEvent),
  }).catch(() => {
    /* fallback to local storage on offline/network errors */
  });
}

export async function syncCloudActivity(): Promise<ActivityEvent[]> {
  if (typeof window === 'undefined') return read();
  try {
    const res = await fetch('/api/activity');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.events) && data.events.length > 0) {
        const local = read();
        const map = new Map<string, ActivityEvent>();
        local.forEach((e) => map.set(e.id, e));
        data.events.forEach((e: ActivityEvent) => map.set(e.id, e));
        const merged = Array.from(map.values());
        save(merged);
        window.dispatchEvent(new CustomEvent('scope-creep-activity-updated'));
        return merged;
      }
    }
  } catch {
    /* ignore */
  }
  return read();
}

/** Events recorded this session (most recent first). */
export function listActivity(): ActivityEvent[] {
  // Trigger background cloud sync
  void syncCloudActivity();
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Purges activity log from localStorage. */
export function clearActivity(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('scope-creep-activity-updated'));
}