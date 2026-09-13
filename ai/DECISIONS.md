# Architecture Decisions Record — Scope Creep Ledger

## Decision 1: Deterministic Cost Arithmetic Over AI Math
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: AI (Amazon Bedrock) is used strictly for message parsing, intent classification, and effort estimation (`estimatedHours`). All financial calculations (`estimatedHours × hourlyRate`, sum of totals) are executed deterministically in application code.
- **Reason**: AI models are non-deterministic and can produce calculation drift or hallucinations. Financial receipts must be mathematically exact and auditable.

## Decision 2: Application-Level Review State for Low-Confidence Items
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Confidence scores returned by Bedrock below `0.70` set the application verification status to `review_required`. No 5th AI classification category is created.
- **Reason**: Keeps AI classification taxonomy clean (`in-scope`, `new-ask`, `clarification`, `off-topic`) while allowing human-in-the-loop review.

## Decision 3: Fail-Safe Dual Execution Engine (AWS + Mock Fallback)
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: AWS SDK calls to Bedrock, S3, and DynamoDB automatically fall back to deterministic in-memory mock engines when AWS credentials are not configured or when AWS SCP policies restrict access in student lab accounts.
- **Reason**: Ensures 100% reliable execution during live hackathon demonstrations and local development without cloud dependency failures.

## Decision 4: Amazon Cognito for Authentication & Authorization
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Amazon Cognito will handle user identity, JWT tokens, and user/admin role claims. Unrestricted public registration will be disabled in favor of admin-invitation / request access flows for MVP.
- **Reason**: Provides secure, production-grade identity management integrated directly into the AWS stack.

## Decision 5: Monorepo Workspaces Layout
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Maintained npm workspace structure: `apps/web` (Next.js 14 frontend), `services/*` (backend microservices), `shared/*` (TypeScript contracts).
- **Reason**: Clear separation of concerns while keeping shared domain types synchronized across frontend and backend.
