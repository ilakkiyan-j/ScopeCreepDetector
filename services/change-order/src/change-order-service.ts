import {
  ChangeOrderRequest,
  ChangeOrderResponse,
  Project,
  LedgerItem,
} from '../../../shared/types';
import { getProject, getLedgerItems } from '../../ledger/src/ledger-service';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const DEFAULT_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export interface ChangeOrderOptions {
  mockMode?: boolean;
  modelId?: string;
  region?: string;
}

/**
 * Change-Order Email Generation Service
 * Formats verified scope creep receipts into a professional client change-order email.
 */
export async function generateChangeOrderEmail(
  request: ChangeOrderRequest,
  options: ChangeOrderOptions = {}
): Promise<ChangeOrderResponse> {
  const project = await getProject(request.projectId);
  if (!project) {
    throw new Error(`Project ${request.projectId} not found.`);
  }

  const allItems = await getLedgerItems(request.projectId);
  // Rule: Only verified new-ask ledger items become part of the change-order email
  const verifiedItems = allItems.filter(
    (item) => item.classification === 'new-ask' && item.verificationStatus === 'verified'
  );

  if (verifiedItems.length === 0) {
    throw new Error('No verified scope creep items exist for this project to generate a change order.');
  }

  // Core Principle: Deterministic arithmetic
  let totalHours = 0;
  const itemizedSummary = verifiedItems.map((item) => {
    totalHours += item.estimatedHours;
    return {
      title: item.originalMessage,
      date: item.timestamp,
      hours: item.estimatedHours,
      cost: item.estimatedCost,
    };
  });

  const totalCost = totalHours * project.hourlyRate;

  const mockMode = options.mockMode ?? (process.env.MOCK_BEDROCK === 'true' || !process.env.AWS_ACCESS_KEY_ID);

  if (mockMode) {
    return runMockChangeOrder(project, verifiedItems, itemizedSummary, totalHours, totalCost, request.customNote);
  }

  try {
    return await runBedrockChangeOrder(
      project,
      verifiedItems,
      itemizedSummary,
      totalHours,
      totalCost,
      request.customNote,
      options
    );
  } catch (err: any) {
    console.warn(`[Bedrock Warning] Change Order Bedrock call failed (${err.message}). Using local deterministic email formatter.`);
    return runMockChangeOrder(project, verifiedItems, itemizedSummary, totalHours, totalCost, request.customNote);
  }
}

/**
 * Real Amazon Bedrock API Call for Change-Order Email
 */
async function runBedrockChangeOrder(
  project: Project,
  verifiedItems: LedgerItem[],
  itemizedSummary: any[],
  totalHours: number,
  totalCost: number,
  customNote?: string,
  options: ChangeOrderOptions = {}
): Promise<ChangeOrderResponse> {
  const region = options.region || DEFAULT_REGION;
  const modelId = options.modelId || DEFAULT_MODEL_ID;

  const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');
  const client = new BedrockRuntimeClient({ region });

  const promptsDir = path.join(__dirname, '../../../ai/prompts');
  const systemPrompt = fs.readFileSync(path.join(promptsDir, 'change-order-system.md'), 'utf-8');

  const userPayload = {
    project_name: project.name,
    client_name: project.clientName,
    original_scope: project.originalScope,
    hourly_rate: project.hourlyRate,
    custom_note: customNote || null,
    total_hours: totalHours,
    total_cost: totalCost,
    verified_items: verifiedItems.map((item) => ({
      message_id: item.messageId,
      timestamp: item.timestamp,
      requester: item.requester,
      quote: item.originalMessage,
      estimated_hours: item.estimatedHours,
      estimated_cost: item.estimatedCost,
      reason: item.reason,
    })),
  };

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2500,
    temperature: 0.2,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Draft a professional change-order email using these verified receipts:\n${JSON.stringify(
          userPayload,
          null,
          2
        )}`,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBodyText = new TextDecoder().decode(response.body);
  const parsedResponse = JSON.parse(responseBodyText);

  const rawJsonText = parsedResponse.content?.[0]?.text || '';
  const jsonMatch = rawJsonText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Malformed AI response: Could not find JSON in Bedrock change-order output');
  }

  const emailData = JSON.parse(jsonMatch[0]);

  return {
    projectId: project.id,
    emailSubject: emailData.email_subject || `Change Order Request — ${project.name}`,
    emailBody: emailData.email_body || '',
    itemizedSummary,
    totalHours,
    totalCost,
  };
}

/**
 * Deterministic Mock Change-Order Email Formatter
 */
function runMockChangeOrder(
  project: Project,
  verifiedItems: LedgerItem[],
  itemizedSummary: any[],
  totalHours: number,
  totalCost: number,
  customNote?: string
): ChangeOrderResponse {
  const emailSubject = `Scope Adjustment & Change Order Request — ${project.name}`;

  const itemizedListText = verifiedItems
    .map(
      (item, idx) =>
        `  ${idx + 1}. Request (${item.timestamp}): "${item.originalMessage}"\n     Estimated Effort: ${item.estimatedHours} hrs ($${item.estimatedCost})`
    )
    .join('\n\n');

  const noteSection = customNote ? `\n\nNote: ${customNote}` : '';

  const emailBody = `Hi ${project.clientName},

I hope you're having a great week!

I'm writing to provide a quick project update for the ${project.name} project.

While reviewing our progress against our agreed baseline scope (${project.originalScope.split('\n')[0]}), I noted a few additional feature requests and revision rounds that have been requested during our ongoing conversation:

${itemizedListText}${noteSection}

---------------------------------------------------
TOTAL ADDITIONAL SCOPE DETECTED:
Total Additional Effort: ${totalHours} hours
Total Estimated Cost: $${totalCost} (at $${project.hourlyRate}/hr)
---------------------------------------------------

To ensure we stay aligned and transparent, please review the above items. Once approved, I will incorporate these deliverables into our current project roadmap.

Best regards,
Alex`;

  return {
    projectId: project.id,
    emailSubject,
    emailBody,
    itemizedSummary,
    totalHours,
    totalCost,
  };
}
