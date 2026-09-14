import { Project, LedgerItem, VerificationStatus } from '../../../shared/types';

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
const mockProjectsStore: Map<string, Project> = g.__mockProjectsStore;
const mockLedgerStore: Map<string, LedgerItem[]> = g.__mockLedgerStore;

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const PROJECTS_TABLE = process.env.DYNAMODB_PROJECTS_TABLE || 'scope-creep-ledger-projects-dev';
const LEDGER_TABLE = process.env.DYNAMODB_LEDGER_TABLE || 'scope-creep-ledger-items-dev';

function isMockMode(): boolean {
  return process.env.MOCK_DYNAMODB === 'true' || !process.env.AWS_ACCESS_KEY_ID;
}

/**
 * Persists project metadata to DynamoDB (or local mock store).
 * In mock mode the project is stored under the owning user's bucket.
 */
export async function saveProject(project: Project, userId?: string): Promise<void> {
  const ownerId = userId ?? project.userId ?? DEFAULT_USER_ID;
  const incoming: Project = { ...project, userId: project.userId ?? (userId !== DEFAULT_USER_ID ? userId : undefined) };

  if (isMockMode()) {
    mockProjectsStore.set(mockKey(ownerId, incoming.id), incoming);
    return;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: DEFAULT_REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    await docClient.send(
      new PutCommand({
        TableName: PROJECTS_TABLE,
        Item: incoming,
      })
    );
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to save project to DynamoDB (${err.message}). Using local store fallback.`);
    mockProjectsStore.set(mockKey(ownerId, incoming.id), incoming);
  }
}

/**
 * Retrieves project metadata by ID. When `userId` is provided the lookup is
 * scoped to that user's bucket; otherwise it falls back to a global lookup so
 * admin/aggregate flows keep working.
 */
export async function getProject(projectId: string, userId?: string): Promise<Project | null> {
  if (isMockMode()) {
    if (userId) {
      return mockProjectsStore.get(mockKey(userId, projectId)) || null;
    }
    for (const project of mockProjectsStore.values()) {
      if (project.id === projectId) return project;
    }
    return null;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: DEFAULT_REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    const result = await docClient.send(
      new GetCommand({
        TableName: PROJECTS_TABLE,
        Key: { id: projectId },
      })
    );

    const item = result.Item as Project;
    if (item) {
      if (userId && item.userId && item.userId !== userId) return null;
      return item;
    }
    return null;
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to fetch project from DynamoDB (${err.message}). Using local store fallback.`);
    if (userId) {
      return mockProjectsStore.get(mockKey(userId, projectId)) || null;
    }
    for (const project of mockProjectsStore.values()) {
      if (project.id === projectId) return project;
    }
    return null;
  }
}

/**
 * Lists projects, most recently active first. When `userId` is provided only
 * that user's projects are returned; otherwise every project is returned.
 */
export async function listProjects(userId?: string): Promise<Project[]> {
  if (isMockMode()) {
    const projects = Array.from(mockProjectsStore.values()).filter(
      (p) => !userId || mockProjectsStore.has(mockKey(userId, p.id))
    );
    return sortByRecent(projects);
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: DEFAULT_REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    const result = await docClient.send(
      new ScanCommand({
        TableName: PROJECTS_TABLE,
        ...(userId
          ? {
              FilterExpression: 'userId = :uid',
              ExpressionAttributeValues: { ':uid': userId },
            }
          : {}),
      })
    );

    const projects = ((result.Items as Project[]) || []).filter((p) => !userId || !p.userId || p.userId === userId);
    return sortByRecent(projects);
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to scan projects (${err.message}). Using local store fallback.`);
    return sortByRecent(
      Array.from(mockProjectsStore.values()).filter((p) => !userId || mockProjectsStore.has(mockKey(userId, p.id)))
    );
  }
}

function sortByRecent(projects: Project[]): Project[] {
  return projects.sort(
    (a, b) =>
      new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()
  );
}

/**
 * Persists batch of scope creep ledger items (scoped to the owner's bucket).
 */
export async function saveLedgerItems(items: LedgerItem[], userId?: string): Promise<void> {
  if (!items || items.length === 0) return;

  const projectId = items[0].projectId;
  const ownerId = userId ?? DEFAULT_USER_ID;

  if (isMockMode()) {
    const key = mockKey(ownerId, projectId);
    const existing = mockLedgerStore.get(key) || [];
    // Deduplicate by item ID
    const mergedMap = new Map<string, LedgerItem>();
    existing.forEach((i) => mergedMap.set(i.id, i));
    items.forEach((i) => mergedMap.set(i.id, i));
    mockLedgerStore.set(key, Array.from(mergedMap.values()));
    return;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: DEFAULT_REGION });
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
    console.warn(`[DynamoDB Warning] Failed to save ledger items to DynamoDB (${err.message}). Using local store fallback.`);
    const key = mockKey(ownerId, projectId);
    const existing = mockLedgerStore.get(key) || [];
    const mergedMap = new Map<string, LedgerItem>();
    existing.forEach((i) => mergedMap.set(i.id, i));
    items.forEach((i) => mergedMap.set(i.id, i));
    mockLedgerStore.set(key, Array.from(mergedMap.values()));
  }
}

/**
 * Retrieves all ledger items associated with a project ID (scoped by owner).
 */
export async function getLedgerItems(projectId: string, userId?: string): Promise<LedgerItem[]> {
  if (isMockMode()) {
    if (userId) {
      return mockLedgerStore.get(mockKey(userId, projectId)) || [];
    }
    for (const [key, items] of mockLedgerStore.entries()) {
      if (key.endsWith(`::${projectId}`)) return items;
    }
    return [];
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: DEFAULT_REGION });
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

    return (result.Items as LedgerItem[]) || [];
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to query ledger items from DynamoDB (${err.message}). Using local store fallback.`);
    if (userId) {
      return mockLedgerStore.get(mockKey(userId, projectId)) || [];
    }
    for (const [key, items] of mockLedgerStore.entries()) {
      if (key.endsWith(`::${projectId}`)) return items;
    }
    return [];
  }
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