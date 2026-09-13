import {
  AnalyzeRequest,
  AnalyzeResponse,
  ProjectAnalysis,
  LedgerItem,
  ClassificationCategory,
} from '../../../shared/types';
import { parseConversation } from './parser';
import { classifyMessages, ClassifyOptions } from './classifier';

const DEFAULT_CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.70');

/**
 * Orchestrator Handler for POST /analyze
 * Ingests project scope, rate, and raw conversation text.
 * Runs parser, AI classifier, deterministic cost arithmetic, and review flagging.
 */
export async function handleAnalyzeRequest(
  request: AnalyzeRequest,
  options: ClassifyOptions = {}
): Promise<AnalyzeResponse> {
  // 1. Validate Input
  if (!request.originalScope || !request.originalScope.trim()) {
    throw new Error('Original project scope is required.');
  }

  if (!request.rawConversationText || !request.rawConversationText.trim()) {
    throw new Error('Raw conversation text is required.');
  }

  const hourlyRate = Number(request.hourlyRate);
  if (isNaN(hourlyRate) || hourlyRate <= 0) {
    throw new Error('Hourly rate must be a positive number.');
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const confidenceThreshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

  // 2. Parse Conversation into Chronological Messages
  const messages = parseConversation(request.rawConversationText);
  if (messages.length === 0) {
    throw new Error('No valid chat messages could be parsed from the uploaded conversation text.');
  }

  // 3. AI Message Classification Engine
  const classifications = await classifyMessages(messages, request.originalScope, {
    ...options,
    freelancerRole: request.freelancerRole || 'web-dev',
  });

  // 4. Deterministic Ledger & Cost Construction
  const ledgerItems: LedgerItem[] = [];
  const classificationsCount: Record<ClassificationCategory, number> = {
    'in-scope': 0,
    'new-ask': 0,
    'clarification': 0,
    'off-topic': 0,
  };

  let totalEstimatedHours = 0;
  let totalEstimatedCost = 0;
  let reviewRequiredCount = 0;

  for (const result of classifications) {
    // Increment category counter
    if (classificationsCount[result.classification] !== undefined) {
      classificationsCount[result.classification]++;
    } else {
      classificationsCount['off-topic']++;
    }

    const matchedMessage = messages.find((m) => m.id === result.messageId);
    if (!matchedMessage) continue;

    // Check low-confidence items (< threshold)
    const isLowConfidence = result.confidence < confidenceThreshold;

    if (isLowConfidence) {
      reviewRequiredCount++;
    }

    // Only new-ask items generate scope-creep ledger entries
    if (result.classification === 'new-ask') {
      const estimatedHours = result.estimatedHours ?? 0;
      // Core Principle: Deterministic arithmetic (estimatedHours * hourlyRate)
      const estimatedCost = estimatedHours * hourlyRate;

      totalEstimatedHours += estimatedHours;
      totalEstimatedCost += estimatedCost;

      const ledgerItem: LedgerItem = {
        id: `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        projectId,
        messageId: matchedMessage.id,
        timestamp: matchedMessage.timestamp,
        requester: matchedMessage.sender,
        originalMessage: matchedMessage.content,
        classification: result.classification,
        reason: result.reason,
        estimatedHours,
        estimatedCost,
        confidence: result.confidence,
        verificationStatus: isLowConfidence ? 'review_required' : 'verified',
        createdAt: new Date().toISOString(),
      };

      ledgerItems.push(ledgerItem);
    }
  }

  const summary: ProjectAnalysis = {
    projectId,
    totalMessagesParsed: messages.length,
    classificationsCount,
    totalScopeCreepItems: ledgerItems.length,
    totalEstimatedHours: Math.round(totalEstimatedHours * 100) / 100,
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
    reviewRequiredCount,
    ledgerItems,
  };

  return {
    projectId,
    summary,
  };
}
