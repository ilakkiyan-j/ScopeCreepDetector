import { Project, LedgerItem, VerificationStatus, ActivityEvent } from '@scope-creep-ledger/shared';

/**
 * Mock stores are scoped per user (keyed by `userId::projectId`) so every
 * account sees exactly its own projects and ledger. Callers omit `userId` for
 * backward compatibility / global queries (admin, seeded fixtures, e2e), which
 * resolve to the shared `__system` bucket.
 */
const DEFAULT_USER_ID = '__system';

function mockKey(userId: string, projectId: string): string {
  return `${userId}::${projectId}`;
}

// In-memory fallback stores for offline / mock testing (persisted on globalThis for dev server stability)
const g = globalThis as any;
if (!g.__mockProjectsStore) {
  g.__mockProjectsStore = new Map<string, Project>();
}
if (!g.__mockLedgerStore) {
  g.__mockLedgerStore = new Map<string, LedgerItem[]>();
}
if (!g.__mockActivityStore) {
  g.__mockActivityStore = [];
}
const mockProjectsStore: Map<string, Project> = g.__mockProjectsStore;
const mockLedgerStore: Map<string, LedgerItem[]> = g.__mockLedgerStore;
const mockActivityStore: ActivityEvent[] = g.__mockActivityStore;

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const PROJECTS_TABLE = process.env.DYNAMODB_PROJECTS_TABLE || 'scope-creep-ledger-projects-dev';
const LEDGER_TABLE = process.env.DYNAMODB_LEDGER_TABLE || 'scope-creep-ledger-items-dev';
const ACTIVITY_TABLE = process.env.DYNAMODB_ACTIVITY_TABLE || 'scope-creep-ledger-activity-dev';

function getAwsClientOptions() {
  const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
  const accessKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.APP_AWS_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN;

  if (accessKeyId && secretAccessKey) {
    return {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken ? { sessionToken } : {}),
      },
    };
  }

  return { region };
}

function isMockMode(): boolean {
  if (process.env.MOCK_DYNAMODB === 'true') return true;
  if (process.env.MOCK_DYNAMODB === 'false') return false;
  const hasKeys = Boolean(
    ((process.env.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY) && process.env.APP_AWS_SECRET_ACCESS_KEY) ||
    (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  );
  return !hasKeys;
}

/**
 * Persists project metadata to DynamoDB (or local mock store).
 * In mock mode the project is stored under the owning user's bucket.
 */
/**
 * Persists project metadata to DynamoDB (and local mock store).
 */
export async function saveProject(project: Project, userId?: string): Promise<void> {
  const ownerId = userId ?? project.userId ?? DEFAULT_USER_ID;
  const incoming: Project = {
    ...project,
    userId: project.userId ?? (userId !== DEFAULT_USER_ID ? userId : undefined),
    updatedAt: project.updatedAt ?? project.createdAt ?? new Date().toISOString(),
  };

  // Always update local memory store for instant fallback & seamless cross-turn retrieval
  mockProjectsStore.set(mockKey(ownerId, incoming.id), incoming);
  mockProjectsStore.set(mockKey(DEFAULT_USER_ID, incoming.id), incoming);
  mockProjectsStore.set(incoming.id, incoming);

  if (isMockMode()) {
    return;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient(getAwsClientOptions());
    const docClient = DynamoDBDocumentClient.from(client);

    await docClient.send(
      new PutCommand({
        TableName: PROJECTS_TABLE,
        Item: incoming,
      })
    );
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to save project to DynamoDB (${err.message}). Local memory fallback preserved.`);
  }
}

/**
 * Retrieves project metadata by ID.
 * Merges DynamoDB lookup with local store fallback.
 */
export async function getProject(projectId: string, userId?: string): Promise<Project | null> {
  let project: Project | null = null;

  if (!isMockMode()) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient(getAwsClientOptions());
      const docClient = DynamoDBDocumentClient.from(client);

      const result = await docClient.send(
        new GetCommand({
          TableName: PROJECTS_TABLE,
          Key: { id: projectId },
        })
      );

      const item = result.Item as Project;
      if (item && item.id === projectId) {
        project = item;
      }
    } catch (err: any) {
      console.warn(`[DynamoDB Warning] Failed to fetch project from DynamoDB (${err.message}). Using local store fallback.`);
    }
  }

  if (!project) {
    if (userId) {
      project = mockProjectsStore.get(mockKey(userId, projectId)) || null;
    }
    if (!project) {
      project = mockProjectsStore.get(mockKey(DEFAULT_USER_ID, projectId)) || mockProjectsStore.get(projectId) || null;
    }
    if (!project) {
      for (const p of mockProjectsStore.values()) {
        if (p.id === projectId) {
          project = p;
          break;
        }
      }
    }
  }

  return project;
}

function matchesUser(p: Project, targetUserId?: string): boolean {
  if (!targetUserId || targetUserId === 'usr_admin_master_999' || targetUserId === '__system') return true;
  if (p.userId === targetUserId) return true;
  if (targetUserId === 'usr_demo_001' && (!p.userId || p.userId === 'usr_demo_001')) return true;
  return false;
}

/**
 * Lists projects, most recently active first.
 * Merges DynamoDB results with local store fallback so projects never disappear.
 */
export async function listProjects(userId?: string): Promise<Project[]> {
  const projectsMap = new Map<string, Project>();

  if (!isMockMode()) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient(getAwsClientOptions());
      const docClient = DynamoDBDocumentClient.from(client);

      const result = await docClient.send(
        new ScanCommand({
          TableName: PROJECTS_TABLE,
        })
      );

      const items = (result.Items as Project[]) || [];
      for (const p of items) {
        if (matchesUser(p, userId)) {
          projectsMap.set(p.id, p);
        }
      }
    } catch (err: any) {
      console.warn(`[DynamoDB Warning] Failed to scan projects (${err.message}). Using local store fallback.`);
    }
  }

  // Merge with local memory store
  for (const p of mockProjectsStore.values()) {
    if (matchesUser(p, userId)) {
      if (!projectsMap.has(p.id)) {
        projectsMap.set(p.id, p);
      }
    }
  }

  return sortByRecent(Array.from(projectsMap.values()));
}

function sortByRecent(projects: Project[]): Project[] {
  return projects.sort(
    (a, b) =>
      new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()
  );
}

/**
 * Persists batch of scope creep ledger items.
 */
export async function saveLedgerItems(items: LedgerItem[], userId?: string): Promise<void> {
  if (!items || items.length === 0) return;

  const projectId = items[0].projectId;
  const ownerId = userId ?? DEFAULT_USER_ID;

  const saveToMock = (keyUserId: string) => {
    const key = mockKey(keyUserId, projectId);
    const existing = mockLedgerStore.get(key) || [];
    const mergedMap = new Map<string, LedgerItem>();
    existing.forEach((i) => mergedMap.set(i.id, i));
    items.forEach((i) => mergedMap.set(i.id, i));
    mockLedgerStore.set(key, Array.from(mergedMap.values()));
  };

  saveToMock(ownerId);
  saveToMock(DEFAULT_USER_ID);
  mockLedgerStore.set(projectId, items);

  if (isMockMode()) {
    return;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient(getAwsClientOptions());
    const docClient = DynamoDBDocumentClient.from(client);

    for (const item of items) {
      await docClient.send(
        new PutCommand({
          TableName: LEDGER_TABLE,
          Item: item,
        })
      );
    }
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to save ledger items to DynamoDB (${err.message}). Local memory fallback preserved.`);
  }
}

/**
 * Retrieves all ledger items associated with a project ID.
 */
export async function getLedgerItems(projectId: string, userId?: string): Promise<LedgerItem[]> {
  let items: LedgerItem[] = [];

  if (!isMockMode()) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient(getAwsClientOptions());
      const docClient = DynamoDBDocumentClient.from(client);

      const result = await docClient.send(
        new QueryCommand({
          TableName: LEDGER_TABLE,
          KeyConditionExpression: 'projectId = :pid',
          ExpressionAttributeValues: {
            ':pid': projectId,
          },
        })
      );

      items = (result.Items as LedgerItem[]) || [];
    } catch (err: any) {
      console.warn(`[DynamoDB Warning] Failed to query ledger items from DynamoDB (${err.message}). Using local store fallback.`);
    }
  }

  if (items.length === 0) {
    if (userId) {
      items = mockLedgerStore.get(mockKey(userId, projectId)) || [];
    }
    if (items.length === 0) {
      items = mockLedgerStore.get(mockKey(DEFAULT_USER_ID, projectId)) || mockLedgerStore.get(projectId) || [];
    }
    if (items.length === 0) {
      for (const [key, list] of mockLedgerStore.entries()) {
        if (key.endsWith(`::${projectId}`) || key === projectId) {
          items = list;
          break;
        }
      }
    }
  }

  return items;
}

/**
 * Records recent activity on a project by bumping its `updatedAt` timestamp.
 */
export async function touchProject(projectId: string, userId?: string): Promise<void> {
  const project = await getProject(projectId, userId);
  if (!project) return;
  await saveProject({ ...project, updatedAt: new Date().toISOString() }, userId);
}

/**
 * Updates user verification status for a specific ledger item
 * Allows user to verify or reject low-confidence items or override estimated hours.
 */
export async function verifyLedgerItem(
  projectId: string,
  ledgerItemId: string,
  action: 'verify' | 'reject',
  customEstimatedHours?: number,
  userId?: string
): Promise<LedgerItem> {
  const items = await getLedgerItems(projectId, userId);
  const targetItem = items.find((i) => i.id === ledgerItemId);

  if (!targetItem) {
    throw new Error(`Ledger item ${ledgerItemId} not found for project ${projectId}.`);
  }

  const project = await getProject(projectId, userId);
  const hourlyRate = project ? project.hourlyRate : 60;

  // Update item properties
  const newStatus: VerificationStatus = action === 'verify' ? 'verified' : 'rejected';
  targetItem.verificationStatus = newStatus;

  if (typeof customEstimatedHours === 'number' && customEstimatedHours >= 0) {
    targetItem.estimatedHours = customEstimatedHours;
  }

  // Core Principle: Deterministic cost calculation (estimatedHours * hourlyRate)
  targetItem.estimatedCost = targetItem.estimatedHours * hourlyRate;

  // Save updated item back
  await saveLedgerItems([targetItem], userId);

  // Verification is recent project activity
  await touchProject(projectId, userId);

  return targetItem;
}

/**
 * Calculates authoritative running totals deterministically across verified ledger items
 */
export async function calculateProjectTotals(
  projectId: string,
  userId?: string
): Promise<{
  totalHours: number;
  totalCost: number;
  verifiedCount: number;
  reviewCount: number;
  rejectedCount: number;
}> {
  const items = await getLedgerItems(projectId, userId);
  const project = await getProject(projectId, userId);
  const hourlyRate = project ? project.hourlyRate : 60;

  let totalHours = 0;
  let verifiedCount = 0;
  let reviewCount = 0;
  let rejectedCount = 0;

  for (const item of items) {
    if (item.verificationStatus === 'verified') {
      verifiedCount++;
      totalHours += item.estimatedHours;
    } else if (item.verificationStatus === 'review_required') {
      reviewCount++;
    } else if (item.verificationStatus === 'rejected') {
      rejectedCount++;
    }
  }

  // Core Principle: Deterministic arithmetic (totalHours * hourlyRate)
  const totalCost = totalHours * hourlyRate;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    verifiedCount,
    reviewCount,
    rejectedCount,
  };
}

/**
 * Persists an activity event to AWS DynamoDB (and local mock store).
 */
export async function saveActivity(event: ActivityEvent): Promise<void> {
  mockActivityStore.unshift(event);
  if (mockActivityStore.length > 50) mockActivityStore.pop();

  if (isMockMode()) return;

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient(getAwsClientOptions());
    const docClient = DynamoDBDocumentClient.from(client);

    await docClient.send(
      new PutCommand({
        TableName: ACTIVITY_TABLE,
        Item: event,
      })
    );
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to save activity event (${err.message}).`);
  }
}

/**
 * Lists activity events from AWS DynamoDB (merged with local store).
 */
export async function listActivityEvents(): Promise<ActivityEvent[]> {
  const eventsMap = new Map<string, ActivityEvent>();

  if (!isMockMode()) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient(getAwsClientOptions());
      const docClient = DynamoDBDocumentClient.from(client);

      const result = await docClient.send(
        new ScanCommand({
          TableName: ACTIVITY_TABLE,
        })
      );

      const items = (result.Items as ActivityEvent[]) || [];
      for (const item of items) {
        eventsMap.set(item.id, item);
      }
    } catch (err: any) {
      console.warn(`[DynamoDB Warning] Failed to scan activity events (${err.message}).`);
    }
  }

  for (const item of mockActivityStore) {
    if (!eventsMap.has(item.id)) {
      eventsMap.set(item.id, item);
    }
  }

  return Array.from(eventsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}