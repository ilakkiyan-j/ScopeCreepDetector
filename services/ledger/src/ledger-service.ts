import { Project, LedgerItem, VerificationStatus } from '../../../shared/types';

// In-memory fallback stores for offline / mock testing
const mockProjectsStore = new Map<string, Project>();
const mockLedgerStore = new Map<string, LedgerItem[]>();

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const PROJECTS_TABLE = process.env.DYNAMODB_PROJECTS_TABLE || 'scope-creep-ledger-projects-dev';
const LEDGER_TABLE = process.env.DYNAMODB_LEDGER_TABLE || 'scope-creep-ledger-items-dev';

function isMockMode(): boolean {
  return process.env.MOCK_DYNAMODB === 'true' || !process.env.AWS_ACCESS_KEY_ID;
}

/**
 * Persists project metadata to DynamoDB (or local mock store)
 */
export async function saveProject(project: Project): Promise<void> {
  if (isMockMode()) {
    mockProjectsStore.set(project.id, project);
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
        Item: project,
      })
    );
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to save project to DynamoDB (${err.message}). Using local store fallback.`);
    mockProjectsStore.set(project.id, project);
  }
}

/**
 * Retrieves project metadata by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  if (isMockMode()) {
    return mockProjectsStore.get(projectId) || null;
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

    return (result.Item as Project) || mockProjectsStore.get(projectId) || null;
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to fetch project from DynamoDB (${err.message}). Using local store fallback.`);
    return mockProjectsStore.get(projectId) || null;
  }
}

/**
 * Persists batch of scope creep ledger items
 */
export async function saveLedgerItems(items: LedgerItem[]): Promise<void> {
  if (!items || items.length === 0) return;

  const projectId = items[0].projectId;

  if (isMockMode()) {
    const existing = mockLedgerStore.get(projectId) || [];
    // Deduplicate by item ID
    const mergedMap = new Map<string, LedgerItem>();
    existing.forEach((i) => mergedMap.set(i.id, i));
    items.forEach((i) => mergedMap.set(i.id, i));
    mockLedgerStore.set(projectId, Array.from(mergedMap.values()));
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
    const existing = mockLedgerStore.get(projectId) || [];
    const mergedMap = new Map<string, LedgerItem>();
    existing.forEach((i) => mergedMap.set(i.id, i));
    items.forEach((i) => mergedMap.set(i.id, i));
    mockLedgerStore.set(projectId, Array.from(mergedMap.values()));
  }
}

/**
 * Retrieves all ledger items associated with a project ID
 */
export async function getLedgerItems(projectId: string): Promise<LedgerItem[]> {
  if (isMockMode()) {
    return mockLedgerStore.get(projectId) || [];
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

    return (result.Items as LedgerItem[]) || mockLedgerStore.get(projectId) || [];
  } catch (err: any) {
    console.warn(`[DynamoDB Warning] Failed to query ledger items from DynamoDB (${err.message}). Using local store fallback.`);
    return mockLedgerStore.get(projectId) || [];
  }
}

/**
 * Updates user verification status for a specific ledger item
 * Allows user to verify or reject low-confidence items or override estimated hours.
 */
export async function verifyLedgerItem(
  projectId: string,
  ledgerItemId: string,
  action: 'verify' | 'reject',
  customEstimatedHours?: number
): Promise<LedgerItem> {
  const items = await getLedgerItems(projectId);
  const targetItem = items.find((i) => i.id === ledgerItemId);

  if (!targetItem) {
    throw new Error(`Ledger item ${ledgerItemId} not found for project ${projectId}.`);
  }

  const project = await getProject(projectId);
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
  await saveLedgerItems([targetItem]);

  return targetItem;
}

/**
 * Calculates authoritative running totals deterministically across verified ledger items
 */
export async function calculateProjectTotals(projectId: string): Promise<{
  totalHours: number;
  totalCost: number;
  verifiedCount: number;
  reviewCount: number;
  rejectedCount: number;
}> {
  const items = await getLedgerItems(projectId);
  const project = await getProject(projectId);
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
