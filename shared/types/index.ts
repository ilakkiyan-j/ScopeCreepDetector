/**
 * Scope Creep Ledger — Shared Domain Types
 * Single source of truth for frontend & backend services
 */

/** Exactly four allowed AI classifications */
export type ClassificationCategory =
  | 'in-scope'
  | 'new-ask'
  | 'clarification'
  | 'off-topic';

/** Application verification status for ledger items */
export type VerificationStatus =
  | 'verified'
  | 'review_required'
  | 'rejected';

/** Normalized chronological message parsed from conversation export */
export interface ChatMessage {
  id: string;
  timestamp: string; // ISO string or standardized string date (e.g. "Mar 4, 2026")
  sender: string;
  content: string;
}

/** Bedrock AI classification result per message */
export interface ClassificationResult {
  messageId: string;
  classification: ClassificationCategory;
  confidence: number; // Float between 0.0 and 1.0
  reason: string;
  estimatedHours: number | null; // Relevant primarily for 'new-ask'
}

/** Project configuration baseline */
export interface Project {
  id: string;
  name: string;
  clientName: string;
  originalScope: string;
  hourlyRate: number;
  currency: string;
  createdAt: string; // ISO string
}

/** Authoritative Scope Creep Ledger Entry */
export interface LedgerItem {
  id: string;
  projectId: string;
  messageId: string;
  timestamp: string;
  requester: string;
  originalMessage: string;
  classification: ClassificationCategory;
  reason: string;
  estimatedHours: number;
  estimatedCost: number; // Deterministically calculated: estimatedHours * hourlyRate
  confidence: number;
  verificationStatus: VerificationStatus;
  createdAt: string; // ISO string
}

/** Overall Project Analysis Summary */
export interface ProjectAnalysis {
  projectId: string;
  totalMessagesParsed: number;
  classificationsCount: Record<ClassificationCategory, number>;
  totalScopeCreepItems: number;
  totalEstimatedHours: number; // Deterministically aggregated
  totalEstimatedCost: number; // Deterministically aggregated
  reviewRequiredCount: number;
  ledgerItems: LedgerItem[];
}

/** API Payload: POST /analyze */
export interface AnalyzeRequest {
  projectName: string;
  clientName: string;
  originalScope: string;
  hourlyRate: number;
  rawConversationText: string;
}

/** API Response: POST /analyze */
export interface AnalyzeResponse {
  projectId: string;
  summary: ProjectAnalysis;
}

/** API Payload: POST /ledger/verify */
export interface VerifyLedgerItemRequest {
  projectId: string;
  ledgerItemId: string;
  action: 'verify' | 'reject';
  customEstimatedHours?: number; // Optional user override of hours
}

/** API Request: POST /change-order */
export interface ChangeOrderRequest {
  projectId: string;
  customNote?: string;
}

/** API Response: POST /change-order */
export interface ChangeOrderResponse {
  projectId: string;
  emailSubject: string;
  emailBody: string;
  itemizedSummary: {
    title: string;
    date: string;
    hours: number;
    cost: number;
  }[];
  totalHours: number;
  totalCost: number;
}
