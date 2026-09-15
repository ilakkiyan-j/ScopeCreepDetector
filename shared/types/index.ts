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

/** Freelancer role / industry specialization for tailored scope rules */
export type FreelancerRole =
  | 'web-dev'
  | 'ui-ux'
  | 'copywriter'
  | 'video-editor'
  | 'consultant';

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

/** User authentication roles */
export type UserRole = 'USER' | 'ADMIN';

/**
 * Supported ISO currency codes for project rates & scope-creep value.
 * A code identifies the currency only — it does NOT perform FX conversion.
 */
export type Currency =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'AED'
  | 'JPY';

/** Application user profile */
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  profession: string;
  company?: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'disabled' | 'invited';
  /** User's default currency; new projects inherit this value. */
  defaultCurrency?: Currency;
}

/** User display/settings preferences (backed by profile storage for MVP). */
export interface UserPreferences {
  currency: Currency;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Session mode — honest representation of how the user entered the app.
 * The MVP uses a mock auth layer (no real JWT); `demo` marks the isolated
 * demo account (always USER role, never routes to admin).
 */
export type SessionMode = 'demo' | 'signed-in';

/** Active authentication session */
export interface AuthSession {
  user: UserProfile;
  mode: SessionMode;
  issuedAt: number;
  expiresAt: number;
}

/** Project lifecycle status */
export type ProjectStatus = 'draft' | 'analyzed' | 'review' | 'change-orders' | 'closed';

/** Project configuration baseline */
export interface Project {
  id: string;
  userId?: string;
  name: string;
  clientName: string;
  freelancerRole?: FreelancerRole;
  originalScope: string;
  hourlyRate: number;
  currency: Currency;
  status?: ProjectStatus;
  createdAt: string; // ISO string
  /** ISO string — last activity (analysis, verification, change order). Falls back to createdAt. */
  updatedAt?: string;
  /** Visual & persistence indicator: true if stored only in browser localStorage mirror */
  isLocalOnly?: boolean;
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
  freelancerRole?: FreelancerRole;
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
  freelancerRole?: FreelancerRole;
  originalScope: string;
  hourlyRate: number;
  currency?: Currency;
  rawConversationText: string;
  /** Owner of the analysis (mock auth identity for MVP attribution). */
  userId?: string;
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
  /** Owner of the project (mock auth identity for MVP attribution). */
  userId?: string;
}

/** API Request: POST /change-order */
export interface ChangeOrderRequest {
  projectId: string;
  customNote?: string;
  /** Owner of the project (mock auth identity for MVP attribution). */
  userId?: string;
  fallbackProject?: Project;
  fallbackLedgerItems?: LedgerItem[];
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

export type ActivityType =
  | 'project_created'
  | 'analysis_completed'
  | 'item_verified'
  | 'item_rejected'
  | 'change_order_generated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  projectId: string | null;
  projectName: string | null;
  message: string;
  createdAt: string;
}

export * from './currency';
