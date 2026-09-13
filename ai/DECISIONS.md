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

## Decision 6: Strict Public / User / Admin Route Separation
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Routes are strictly namespaced: public (`/`, `/sign-in`, `/request-access`), user workspace (`/app/*`), admin console (`/admin/*`). User routes must never resolve to admin routes and vice-versa. Direct URL access and role redirects are tested, not just button navigation.
- **Reason**: The previous flat structure (`/dashboard`, `/admin`, `/profile`) produced dead anchors, admin dead-ends, and a collapse of the whole workspace into one page.

## Decision 7: Demo = Authenticated Demo User (Option A)
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: The demo workspace is a real, authenticated demo **USER** account (`demo@scopecreep.io`, role USER). "Open Demo Workspace" signs the visitor in as that account and lands in `/app/dashboard` with a persistent "Demo Mode" banner. The demo experience must NEVER route to `/admin`.
- **Reason**: Showcases the real product without faking authorization state or accidentally exposing the admin interface.

## Decision 8: Clean Mock Auth for MVP (Cognito Later)
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: The MVP keeps a cleaned-up mock auth layer: visitors are unauthenticated by default (no silent auto-login), `/sign-in` is a real gate, the demo account is explicitly a demo session (no fabricated JWT claims), and `ProtectedRoute`/route guards are presentation-level only. Amazon Cognito remains the documented production path (see `AWS_STATUS.md`) and is NOT implemented in this redesign.
- **Reason**: Real Cognito SDK + JWT verification + backend auth middleware is a separate workstream requiring AWS resource setup; the hackathon needs an honest, non-misleading auth experience now.

## Decision 9: Semantic Theme Tokens Only (No Random `dark:` Colors)
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: All components consume a shared semantic token system (`background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `border`, `primary`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`, `input`, `ring`, `popover`). Light and dark modes use the same component system; hardcoded hex colors and mixed `dark:bg-*` values must not appear in component code. Tailwind must be configured with `darkMode: 'class'`.
- **Reason**: The prior theme was "split-brain" (Tailwind `dark:` responded to OS media queries while the app toggle only changed CSS variables), producing contradictory mixed styling and dark-only islands.

## Decision 10: User Default Currency + Project Currency (No FX)
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Currency is a per-user preference (`defaultCurrency`) and also a per-project property. New projects inherit the user's default currency but can be changed per project. A currency code identifies the currency only — NO automatic FX conversion. Cross-currency admin aggregation is shown grouped by currency.
- **Reason**: Freelancers work with international clients; assuming USD was wrong. Converting without real FX rates would fabricate financial truth.

## Decision 11: Attachment Staging Before Upload
- **Date**: 2026-09-13
- **Status**: Accepted
- **Decision**: Multi-file selection is staged in browser state (name/size) only. Users review, remove wrong files, add more, and confirm before any bytes are uploaded/analyzed. The upload button reflects the remaining file count.
- **Reason**: The prior dropzone uploaded/analyzed immediately; accidental or wrong files created wasted analyses and confusion.
