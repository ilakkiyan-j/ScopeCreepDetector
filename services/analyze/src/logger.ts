export interface CloudWatchLogPayload {
  projectId: string;
  requestId: string;
  messageCount: number;
  classificationsCount: Record<string, number>;
  newAskCount: number;
  lowConfidenceCount: number;
  bedrockLatencyMs?: number;
  errorType?: string;
}

/**
 * Structured CloudWatch Logger
 * Formats operational metrics into JSON for CloudWatch Logs ingestion
 */
export function logCloudWatchMetrics(payload: CloudWatchLogPayload): void {
  const structuredLog = {
    timestamp: new Date().toISOString(),
    service: 'scope-creep-analyze-service',
    project_id: payload.projectId,
    request_id: payload.requestId,
    message_count: payload.messageCount,
    classifications_count: payload.classificationsCount,
    new_ask_count: payload.newAskCount,
    low_confidence_count: payload.lowConfidenceCount,
    bedrock_latency_ms: payload.bedrockLatencyMs ?? null,
    error_type: payload.errorType ?? null,
  };

  console.log(`[CloudWatch Metric] ${JSON.stringify(structuredLog)}`);
}
