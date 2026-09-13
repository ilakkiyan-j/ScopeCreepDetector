# System Architecture — Scope Creep Ledger

## 1. High-Level Architecture Diagram

```text
                               ┌─────────────────┐
                               │   Public Site   │
                               │  Landing / Sign-In
                               │  Request Access │
                               └────────┬────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
             Authenticated        Demo Workspace      Cognito (future)
             User Workspace       (demo user,          / production path
             (/app/*)             USER role only)
                     │                  │
                     ▼                  │
            Project Workspace          │
                     │                  ▼
          ┌──────────┼──────────┐   Admin Console
          ▼          ▼          ▼   (/admin/*)
       Original    Files     Ledger &
        Scope     Staging   Analytics
                     │
                     ▼
                  Amazon S3
                     │
                     ▼
          Next.js API / AWS Lambda
                     │
               ┌─────┴─────┐
               ▼           ▼
         Amazon Bedrock  DynamoDB
       (Claude 3 Haiku)  (Projects & Ledger)
               │
               ▼
      Deterministic Engine
      (hours * rate = cost)
               │
               ▼
      PDF Change Order Receipt
```

## 2. Route Architecture

### Public
- `/` — Landing page.
- `/sign-in` — Sign in (mock auth for MVP; Cognito is the production path).
- `/request-access` — Request access info/flow.

### User Workspace (`/app/*` — authenticated USER)
- `/app` → redirects to `/app/dashboard`.
- `/app/dashboard` — Workspace overview (metrics, recent projects, recent activity).
- `/app/projects` — Project list (search, empty/loading/error states).
- `/app/projects/new` — New project (rate + currency + scope + conversation files).
- `/app/projects/[projectId]/overview` — Project overview.
- `/app/projects/[projectId]/scope` — Original scope (distinct visual layout).
- `/app/projects/[projectId]/conversations` — Conversation files / staging.
- `/app/projects/[projectId]/analysis` — Analysis progress + results.
- `/app/projects/[projectId]/ledger` — Evidence-first scope creep ledger.
- `/app/projects/[projectId]/change-orders` — Change-order drafts.
- `/app/projects/[projectId]/activity` — Project activity timeline.
- `/app/activity` — Global activity timeline.
- `/app/settings/profile` — Profile (name, profession, company, default currency).
- `/app/settings/preferences` — Preferences (currency, theme).

### Admin Console (`/admin/*` — authenticated ADMIN)
- `/admin` → redirects to `/admin/dashboard`.
- `/admin/dashboard` — Operations overview (real aggregates, grouped-by-currency value).
- `/admin/users`, `/admin/users/[userId]`.
- `/admin/projects`, `/admin/activity`, `/admin/usage`, `/admin/settings`.

### Separation Rules
- USER routes never resolve to ADMIN routes and vice-versa.
- Normal user hitting `/admin/*` → Access Denied (or redirect to `/app/dashboard`).
- Demo workspace routes to `/app/dashboard` only — NEVER `/admin`.
- Route protection is frontend-level for MVP; backend authorization is the future security boundary.

## 3. Frontend Layer (`apps/web`)

- **Framework**: Next.js 14 App Router (React 18, TypeScript, Tailwind CSS).
- **Theme**: semantic tokens in `globals.css` + `darkMode: 'class'`; shared `components/ui/*` primitives.
- **Shells**: `AppShell` (user sidebar + topbar), `AdminShell` (admin sidebar + topbar).
- **Key components**: `PublicNavbar`, `SignInForm`, `ProjectCard`, `ProjectTabs`, `FileUploader`, `AttachmentList`, `AnalysisProgress`, `LedgerItemCard`, `LedgerTable`, `EvidencePanel`, `CurrencySelector`, `ActivityTimeline`, `MetricCard`.
- **Data/UI separation**: `hooks/*` and `lib/*` (api client, currency formatter) live between components and the API routes.

## 4. Backend Service Layer (`services/`)

- **`services/analyze`**: Chronological conversation parser (`parser.ts`), Bedrock AI classifier (`classifier.ts`), handler pipeline (`handler.ts`), and S3 storage (`s3-storage.ts`).
- **`services/ledger`**: Authoritative DynamoDB ledger persistence & deterministic arithmetic engine (`ledger-service.ts`).
- **`services/change-order`**: Bedrock change-order email generation & fallback formatter (`change-order-service.ts`).

## 5. Shared Domain Layer (`shared/`)

- **`shared/types`**: TypeScript interface contracts (`Project`, `ChatMessage`, `LedgerItem`, `ProjectAnalysis`, `AnalyzeRequest`, `AnalyzeResponse`, `ChangeOrderRequest`, `ChangeOrderResponse`, `Currency`, `UserPreferences`, ...). Single source of truth.

## 6. Infrastructure Layer (`AWS Platform`)

- **Cognito**: Production path for authentication (planned; mock auth used for MVP).
- **Amplify**: Frontend web app hosting & CI/CD deployment.
- **Amazon Bedrock**: Anthropic Claude 3 Haiku model (`anthropic.claude-3-haiku-20240307-v1:0`).
- **DynamoDB**: NoSQL tables `scope-creep-ledger-projects-dev` and `scope-creep-ledger-items-dev`.
- **S3**: Raw conversation log storage (`scope-creep-ledger-conversations-dev`).
- **CloudWatch**: Backend structured logging & metrics monitoring.

## 7. Data Flow & Security Boundaries
1. User authenticates (mock session for MVP; Cognito JWT in production).
2. User creates a project (rate + currency + scope) and stages conversation files.
3. On confirm, files upload and conversation text is sent to `/api/analyze`.
4. Backend validates input & ownership (ownership enforcement is a future backend concern).
5. Raw log stored in private S3 bucket under `projects/{projectId}/conversations/raw_export.txt`.
6. Parser formats messages into chronological JSON objects (`ChatMessage`).
7. Classifier evaluates messages against project baseline scope via Amazon Bedrock (or offline mock engine fallback).
8. Classification items with confidence < 0.70 are flagged for user review (`review_required`).
9. Verified `new-ask` scope items undergo deterministic math calculation (`hours × rate`).
10. Final ledger items and project metadata persisted to DynamoDB.
11. Change order receipt generated (via `/api/change-order`) using verified scope items only.