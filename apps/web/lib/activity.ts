/**
 * Activity log — records real in-session user actions.
 *
 * MVP note: events are stored in localStorage because there is no activity
 * backend yet. Only genuine actions are recorded (analysis completed, items
 * verified/rejected, change-order generated); nothing is fabricated.
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

export function recordActivity(entry: Omit<ActivityEvent, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return;
  const events = read();
  const next: ActivityEvent[] = [
    { ...entry, id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, createdAt: new Date().toISOString() },
    ...events,
  ].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(next));
}

/** Events recorded this session (most recent first). */
export function listActivity(): ActivityEvent[] {
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}