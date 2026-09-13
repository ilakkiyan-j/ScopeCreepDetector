# System Architecture — Scope Creep Ledger

## 1. High-Level Architecture Diagram

```text
                               ┌─────────────────┐
                               │  Landing Page   │
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │  Amazon Cognito │
                               │ Authentication  │
                               └────────┬────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     ▼                                     ▼
             User Workspace                         Admin Dashboard
                     │                                     │
                     ▼                                     ▼
            Project Workspace                      System Monitoring
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
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

## 2. Component Layers

### Frontend Layer (`apps/web`)
- **Framework**: Next.js 14 App Router (React 18, TypeScript, Tailwind CSS).
- **Routes**:
  - Public: Landing page (`/`), Sign-in/Auth pages (`/auth/login`).
  - Authenticated: Workspace Dashboard (`/dashboard`), Projects (`/projects/[id]`), Activity (`/activity`).
  - Admin: Admin Portal (`/admin`).
- **UI Components**: Header, Theme Toggle, ProjectForm (Dropzone & Role selector), ScopePanel, LedgerPanel, ScopeAnalyticsChart, ReviewModal, ChangeOrderModal.

### Backend Service Layer (`services/`)
- **`services/analyze`**: Chronological conversation parser (`parser.ts`), Bedrock AI classifier (`classifier.ts`), handler pipeline (`handler.ts`), and S3 storage (`s3-storage.ts`).
- **`services/ledger`**: Authoritative DynamoDB ledger persistence & deterministic arithmetic engine (`ledger-service.ts`).
- **`services/change-order`**: Bedrock change-order email generation & fallback formatter (`change-order-service.ts`).

### Shared Domain Layer (`shared/`)
- **`shared/types`**: TypeScript interface contracts (`Project`, `ChatMessage`, `LedgerItem`, `ProjectAnalysis`, `AnalyzeRequest`, `AnalyzeResponse`, `ChangeOrderRequest`, `ChangeOrderResponse`).

### Infrastructure Layer (`AWS Platform`)
- **Cognito**: User authentication, JWT tokens, user/admin role claims.
- **Amplify**: Frontend web app hosting & CI/CD deployment.
- **Amazon Bedrock**: Anthropic Claude 3 Haiku model (`anthropic.claude-3-haiku-20240307-v1:0`).
- **DynamoDB**: NoSQL tables `scope-creep-ledger-projects-dev` and `scope-creep-ledger-items-dev`.
- **S3**: Raw conversation log storage (`scope-creep-ledger-conversations-dev`).
- **CloudWatch**: Backend structured logging & metrics monitoring.

## 3. Data Flow & Security Boundaries
1. User authenticates via Cognito -> Receives JWT.
2. User submits project scope and raw conversation logs.
3. Backend validates authentication token & resource ownership.
4. Raw log stored in private S3 bucket under `projects/{projectId}/conversations/raw_export.txt`.
5. Parser formats messages into chronological JSON objects (`ChatMessage`).
6. Classifier evaluates messages against project baseline scope via Amazon Bedrock (or offline mock engine fallback).
7. Classification items with confidence < 0.70 are flagged for user review (`review_required`).
8. Verified `new-ask` scope items undergo deterministic math calculation (`hours × rate`).
9. Final ledger items and project metadata persisted to DynamoDB.
10. Change order receipt generated using verified scope items only.
