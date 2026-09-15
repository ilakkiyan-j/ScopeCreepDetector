import {
  ChangeOrderRequest,
  ChangeOrderResponse,
  Project,
  LedgerItem,
} from '@scope-creep-ledger/shared';
import { getProject, getLedgerItems, touchProject } from '../../ledger/src/ledger-service';
import { formatMoney } from '@scope-creep-ledger/shared';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const DEFAULT_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

function getAwsClientOptions(customRegion?: string) {
  const region = customRegion || process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
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

function isMockBedrockMode(): boolean {
  if (process.env.MOCK_BEDROCK === 'true') return true;
  if (process.env.MOCK_BEDROCK === 'false') return false;
  const hasKeys = Boolean(
    ((process.env.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY) && process.env.APP_AWS_SECRET_ACCESS_KEY) ||
    (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  );
  return !hasKeys;
}

export interface ChangeOrderOptions {
  mockMode?: boolean;
  modelId?: string;
  region?: string;
}

export class ChangeOrderError extends Error {
  readonly code: 'PROJECT_NOT_FOUND' | 'NO_VERIFIED_ITEMS' | 'BEDROCK_ERROR' | 'MALFORMED_RESPONSE';

  constructor(code: ChangeOrderError['code'], message: string) {
    super(message);
    this.name = 'ChangeOrderError';
    this.code = code;
  }
}

export async function generateChangeOrderEmail(
  request: ChangeOrderRequest,
  options: ChangeOrderOptions = {}
): Promise<ChangeOrderResponse> {
  let project = await getProject(request.projectId, request.userId);
  if (!project && request.fallbackProject) {
    project = request.fallbackProject;
  }
  if (!project) {
    throw new ChangeOrderError('PROJECT_NOT_FOUND', `Project ${request.projectId} not found.`);
  }

  let allItems = await getLedgerItems(request.projectId, request.userId);
  if (allItems.length === 0 && request.fallbackLedgerItems && request.fallbackLedgerItems.length > 0) {
    allItems = request.fallbackLedgerItems;
  }
  const verifiedItems = allItems.filter(
    (item) => item.classification === 'new-ask' && item.verificationStatus === 'verified'
  );

  if (verifiedItems.length === 0) {
    throw new ChangeOrderError(
      'NO_VERIFIED_ITEMS',
      'No verified scope creep items exist for this project to generate a change order.'
    );
  }

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
  const mockMode = options.mockMode ?? (isMockBedrockMode());

  const response = mockMode
    ? runMockChangeOrder(project, verifiedItems, itemizedSummary, totalHours, totalCost, request.customNote)
    : await runBedrockChangeOrder(
        project,
        verifiedItems,
        itemizedSummary,
        totalHours,
        totalCost,
        request.customNote,
        options
      );

  await touchProject(project.id, request.userId);
  return response;
}

async function runBedrockChangeOrder(
  project: Project,
  verifiedItems: LedgerItem[],
  itemizedSummary: any[],
  totalHours: number,
  totalCost: number,
  customNote?: string,
  options: ChangeOrderOptions = {}
): Promise<ChangeOrderResponse> {
  const modelId = options.modelId || DEFAULT_MODEL_ID;

  try {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');
    const client = new BedrockRuntimeClient(getAwsClientOptions(options.region));

    const promptsDir = path.join(__dirname, '../../../ai/prompts');
    const systemPrompt = fs.readFileSync(path.join(promptsDir, 'change-order-system.md'), 'utf-8');

    const userPayload = {
      project_name: project.name,
      client_name: project.clientName,
      original_scope: project.originalScope,
      hourly_rate: project.hourlyRate,
      currency: project.currency,
      custom_note: customNote || null,
      total_hours: totalHours,
      total_cost_unit: project.currency,
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
      throw new Error('Could not find JSON in Bedrock change-order output');
    }

    const emailData = JSON.parse(jsonMatch[0]);

    return {
      projectId: project.id,
      emailSubject: emailData.email_subject || `Change Order Request — ${project.name}`,
      emailBody: emailData.email_body || '',
      itemizedSummary: emailData.itemized_summary || itemizedSummary,
      totalHours,
      totalCost,
    };
  } catch (err: any) {
    console.warn(`[Bedrock Warning] Change order generation via Bedrock failed (${err?.message}). Falling back to deterministic email formatter.`);
    return runMockChangeOrder(project, verifiedItems, itemizedSummary, totalHours, totalCost, customNote);
  }
}

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
        `  ${idx + 1}. Request (${item.timestamp}): "${item.originalMessage}"\n     Estimated Effort: ${item.estimatedHours} hrs (${formatMoney(
          item.estimatedCost ?? 0,
          project.currency
        )})`
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
Total Estimated Cost: ${formatMoney(totalCost, project.currency)} (at ${formatMoney(
    project.hourlyRate,
    project.currency
  )}/hr)
---------------------------------------------------

To ensure we stay aligned and transparent, please review the above items. Once approved, I will incorporate these deliverables into our current project roadmap.

Best regards,
Alex`;

  return {
    projectId: project.id,
    emailSubject,
    emailBody,
    itemizedSummary: itemizedSummary || [],
    totalHours,
    totalCost,
  };
}