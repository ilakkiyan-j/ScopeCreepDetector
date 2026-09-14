import { ProjectStatus } from '@scope-creep-ledger/shared';

/**
 * Single source of truth for the Badge tone mapped to each project status.
 * Previously duplicated across ProjectCard, ProjectWorkspace, and the admin
 * projects table.
 */
export const PROJECT_STATUS_TONE: Record<
  ProjectStatus,
  'success' | 'warning' | 'info' | 'secondary' | 'outline'
> = {
  draft: 'outline',
  analyzed: 'success',
  review: 'warning',
  'change-orders': 'info',
  closed: 'secondary',
};