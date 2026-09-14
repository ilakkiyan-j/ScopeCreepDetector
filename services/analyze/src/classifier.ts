import { ChatMessage, ClassificationResult, ClassificationCategory } from '@scope-creep-ledger/shared';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const DEFAULT_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
const DEFAULT_CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.70');
const DEFAULT_BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);

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

/**
 * Options for classification execution
 */
export interface ClassifyOptions {
  freelancerRole?: string;
  confidenceThreshold?: number;
  batchSize?: number;
  mockMode?: boolean;
  modelId?: string;
  region?: string;
}

/**
 * Main AI Classification Engine
 * Analyzes chronological ChatMessage[] against original scope contract.
 */
export async function classifyMessages(
  messages: ChatMessage[],
  originalScope: string,
  options: ClassifyOptions = {}
): Promise<ClassificationResult[]> {
  if (!messages || messages.length === 0) {
    return [];
  }

  const confidenceThreshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const mockMode = options.mockMode ?? isMockBedrockMode();

  const results: ClassificationResult[] = [];

  // Process messages in batches to manage token size and performance
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    let batchResults: ClassificationResult[];

    if (mockMode) {
      batchResults = runMockClassification(batch, originalScope);
    } else {
      try {
        batchResults = await runBedrockClassification(batch, originalScope, options);
      } catch (err: any) {
        console.warn(`[Bedrock Warning] Bedrock API call failed (${err.message}). Falling back to local offline classification.`);
        batchResults = runMockClassification(batch, originalScope);
      }
    }

    results.push(...batchResults);
  }

  return results;
}

/**
 * Real Amazon Bedrock API Classifier via InvokeModelCommand
 */
async function runBedrockClassification(
  batch: ChatMessage[],
  originalScope: string,
  options: ClassifyOptions
): Promise<ClassificationResult[]> {
  const modelId = options.modelId || DEFAULT_MODEL_ID;

  // Dynamic import so offline/mock mode can execute without npm installing AWS SDK
  const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

  const client = new BedrockRuntimeClient(getAwsClientOptions(options.region));

  // Load system prompt and user prompt template from /ai/prompts/
  const promptsDir = path.join(__dirname, '../../../ai/prompts');
  const rawSystemPrompt = fs.readFileSync(path.join(promptsDir, 'classification-system.md'), 'utf-8');
  const roleContext = options.freelancerRole || 'web-dev';
  const systemPrompt = rawSystemPrompt.replace('{{FREELANCER_ROLE}}', roleContext);
  const userPromptTemplate = fs.readFileSync(path.join(promptsDir, 'classification-user.md'), 'utf-8');

  const messagesPayload = batch.map((m) => ({
    id: m.id,
    timestamp: m.timestamp,
    sender: m.sender,
    content: m.content,
  }));

  const userPrompt = userPromptTemplate
    .replace('{{ORIGINAL_SCOPE}}', originalScope)
    .replace('{{MESSAGES_JSON}}', JSON.stringify(messagesPayload, null, 2));

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2000,
    temperature: 0.1,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
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
    throw new Error('Malformed AI response: Could not find JSON object in Bedrock output');
  }

  const classificationData = JSON.parse(jsonMatch[0]);
  if (!classificationData || !Array.isArray(classificationData.results)) {
    throw new Error('Invalid AI response schema: Missing "results" array');
  }

  return normalizeResults(batch, classificationData.results);
}

/**
 * Offline Mock Classifier
 * Provides realistic deterministic classifications for testing without live AWS credentials.
 */
function runMockClassification(
  batch: ChatMessage[],
  originalScope: string
): ClassificationResult[] {
  return batch.map((msg) => {
    const text = msg.content.toLowerCase();
    const isFreelancer = msg.sender.toLowerCase().includes('freelancer') || msg.sender.toLowerCase().includes('alex');

    // Freelancer explanations are clarifications/updates, not new-ask requests
    if (isFreelancer) {
      if (text.includes('check into that') || text.includes('log all these')) {
        return {
          messageId: msg.id,
          classification: 'clarification',
          confidence: 0.55, // Low confidence (< 0.70) to test review queue flagging
          reason: 'Ambiguous acknowledgement by freelancer requiring confirmation.',
          estimatedHours: null,
        };
      }
      return {
        messageId: msg.id,
        classification: 'clarification',
        confidence: 0.92,
        reason: 'Freelancer explanation or status update regarding project scope.',
        estimatedHours: null,
      };
    }

    // Client requests: Check for explicit new-ask items
    if (text.includes('login page') || text.includes('login system')) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.94,
        reason: 'Login functionality was explicitly excluded or not mentioned in baseline project scope.',
        estimatedHours: 3.0,
      };
    }

    if (text.includes('second revision') || text.includes('revision round #2') || text.includes('revision 1')) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.91,
        reason: 'Original baseline scope includes only 1 revision round. Additional revision round requested.',
        estimatedHours: 1.5,
      };
    }

    if (text.includes('mobile') && (text.includes('custom') || text.includes('standalone') || text.includes('redesign'))) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.88,
        reason: 'Custom standalone mobile redesign requested beyond standard responsive adjustments.',
        estimatedHours: 2.5,
      };
    }

    if (text.includes('third revision') || text.includes('revision round #3') || text.includes('revision 3')) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.95,
        reason: 'Third revision round exceeds agreed 1 revision limit.',
        estimatedHours: 1.5,
      };
    }

    if (text.includes('logo') || text.includes('dark mode')) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.85,
        reason: 'New dark mode logo variant requested beyond original page design assets.',
        estimatedHours: 1.0,
      };
    }

    if (text.includes('analytics') || text.includes('google analytics') || text.includes('pixel')) {
      return {
        messageId: msg.id,
        classification: 'new-ask',
        confidence: 0.92,
        reason: 'Third-party analytics and tracking integration was not included in baseline agreement.',
        estimatedHours: 2.0,
      };
    }

    // Clarifications
    if (text.includes('include') || text.includes('how many') || text.includes('does')) {
      return {
        messageId: msg.id,
        classification: 'clarification',
        confidence: 0.89,
        reason: 'Inquires about existing scope details without requesting extra deliverables.',
        estimatedHours: null,
      };
    }

    // Off-topic
    if (text.includes('coffee') || text.includes('meeting tomorrow') || text.includes('ready to kick off')) {
      return {
        messageId: msg.id,
        classification: 'off-topic',
        confidence: 0.98,
        reason: 'Casual conversation, scheduling, or greeting unrelated to deliverable specifications.',
        estimatedHours: null,
      };
    }

    // Default: in-scope
    return {
      messageId: msg.id,
      classification: 'in-scope',
      confidence: 0.90,
      reason: 'Relates directly to baseline project scope execution.',
      estimatedHours: null,
    };
  });
}

/**
 * Normalizes raw Bedrock results into strictly typed ClassificationResult array
 */
function normalizeResults(
  batch: ChatMessage[],
  rawResults: any[]
): ClassificationResult[] {
  return batch.map((msg) => {
    const matched = rawResults.find((r) => r.message_id === msg.id);
    if (!matched) {
      return {
        messageId: msg.id,
        classification: 'off-topic',
        confidence: 0.5,
        reason: 'Unclassified by AI engine.',
        estimatedHours: null,
      };
    }

    const validCategories: ClassificationCategory[] = ['in-scope', 'new-ask', 'clarification', 'off-topic'];
    const category: ClassificationCategory = validCategories.includes(matched.classification)
      ? matched.classification
      : 'off-topic';

    return {
      messageId: msg.id,
      classification: category,
      confidence: typeof matched.confidence === 'number' ? matched.confidence : 0.5,
      reason: matched.reason || 'No reason provided.',
      estimatedHours: category === 'new-ask' && typeof matched.estimated_hours === 'number' ? matched.estimated_hours : null,
    };
  });
}
