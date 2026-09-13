# Scope Creep Ledger — Architectural Decisions

## Decision 001: Monorepo Repository Structure
Date: 2026-09-13
Status: Approved

**Decision:**
Use a single monorepo (`scope-creep-ledger`) containing `apps/web`, `services/*`, `shared/*`, `ai/`, `docs/`, `infrastructure/`, and `sample-data/`.

**Reason:**
Enables unified TypeScript types across frontend and backend services without code duplication or publishing external NPM packages.

**Alternatives considered:**
Multi-repo strategy (separate repos for frontend and lambdas). Rejected due to hackathon complexity and overhead in sharing types/schemas.

**Consequences:**
Shared types must live in `shared/types` and `shared/schemas`.

---

## Decision 002: AI Judgment + Deterministic Accounting
Date: 2026-09-13
Status: Approved

**Decision:**
Use Amazon Bedrock strictly for message language interpretation, classification, and effort estimation. Perform all cost calculations (`hours × rate`), ledger state transitions, total aggregations, and evidence storage using deterministic TypeScript code.

**Reason:**
LLMs are unreliable for precise arithmetic and persistent state tracking. Financial evidence and totals require 100% reproducibility and auditing.

**Alternatives considered:**
Asking Bedrock to summarize total financial impact in prose. Rejected because it cannot provide auditable or reliable accounting receipts.

---

## Decision 003: Confidence Threshold & Review Queue (No 5th Classification)
Date: 2026-09-13
Status: Approved

**Decision:**
Maintain exactly four AI classification categories (`in-scope`, `new-ask`, `clarification`, `off-topic`). Low confidence (< threshold, e.g. 0.70) triggers an application-level state `review_required` rather than a separate AI classification.

**Reason:**
Keeping AI classification taxonomically pure simplifies prompt contracts and schemas. Review status is an application workflow concern, not a semantic text category.

**Alternatives considered:**
Adding `review` as a 5th AI classification category. Rejected as it confuses semantic categorization with decision uncertainty.

---

## Decision 004: Omission of Complex Cloud Infrastructure (No Cognito, Step Functions, EventBridge)
Date: 2026-09-13
Status: Approved

**Decision:**
Explicitly exclude Cognito, Step Functions, EventBridge, RDS, and microservice orchestration from MVP. Use session/project IDs and direct API Gateway → Lambda executions.

**Reason:**
Minimizes infrastructure cost, setup overhead, and moving parts while maintaining clean serverless architecture suitable for hackathon demonstration.

**Alternatives considered:**
Full OAuth/Cognito authentication and async event queues. Rejected due to unnecessary MVP scope expansion.
