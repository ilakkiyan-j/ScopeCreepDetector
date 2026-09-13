# Scope Creep Ledger — System Architecture

## 1. System Overview

```text
                 ┌────────────────────┐
                 │      User          │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Next.js Frontend   │
                 │ + Tailwind         │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │   API Gateway      │
                 └─────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌──────────────┐
        │ Analyze │   │ Ledger  │   │ Change Order │
        │ Lambda  │   │ Lambda  │   │ Lambda       │
        └────┬────┘   └────┬────┘   └──────┬───────┘
             │             │               │
             ▼             ▼               ▼
        ┌─────────┐   ┌──────────┐    ┌─────────┐
        │Bedrock  │   │DynamoDB  │    │Bedrock  │
        └─────────┘   └──────────┘    └─────────┘

             │
             ▼
        ┌─────────┐
        │   S3    │
        └─────────┘

        CloudWatch monitors backend
```

## 2. Components Breakdown

### Frontend (Next.js + TypeScript + Tailwind CSS)
- Hosted on AWS Amplify.
- Provides project setup UI, chat file uploader, two-panel Scope vs. Creep Ledger dashboard, verification/review queue, and Change-Order email preview/copy interface.
- Makes HTTP API calls to API Gateway endpoints.

### API Gateway
- Entry point for RESTful client requests.
- Endpoints:
  - `POST /analyze` - Ingests scope & chat messages, triggers classification via Analyze Lambda.
  - `POST /ledger` - Updates verified ledger entries and calculates authoritative totals.
  - `GET /projects/{projectId}` - Fetches project state, scope, messages, and ledger entries.
  - `POST /change-order` - Requests change-order email generation based on verified ledger items.

### Lambda Services
1. **Analyze Service (`services/analyze`)**:
   - Parses conversation exports.
   - Saves raw chat file to S3.
   - Sends scoped message batches to Amazon Bedrock for classification.
   - Validates Bedrock JSON output against schema.
   - Flags low-confidence items (< threshold).
2. **Ledger Service (`services/ledger`)**:
   - Stores project and scope metadata in DynamoDB.
   - Manages user verification/rejection of flagged items.
   - Computes deterministic cost: `additional_cost = estimated_hours × user_rate`.
3. **Change-Order Service (`services/change-order`)**:
   - Takes verified ledger items from DynamoDB.
   - Invokes Bedrock with the change-order prompt to generate professional email text.

### Amazon Bedrock
- Model endpoint used for per-message classification against scope contract and effort estimation.
- Model endpoint used for drafting neutral, professional change-order email.

### Storage
- **Amazon S3**: Stores raw conversation export files (`.txt`, `.csv`).
- **Amazon DynamoDB**: Stores structured application tables:
  - `ProjectsTable`: `projectId`, `name`, `client`, `originalScope`, `hourlyRate`, `createdAt`.
  - `LedgerTable`: `ledgerId`, `projectId`, `messageId`, `originalMessage`, `requester`, `timestamp`, `classification`, `reason`, `estimatedHours`, `estimatedCost`, `confidence`, `verificationStatus`.

### Monitoring
- **Amazon CloudWatch**: Logs backend requests, execution timing, Bedrock latency, errors, and flagged low-confidence events.

## 3. Data & Request Flow

1. **Upload & Analysis Flow**:
   - Client sends Original Scope, Rate, and Chat File to API Gateway (`POST /analyze`).
   - `Analyze Lambda` stores chat file in S3, parses chat into chronological messages.
   - Messages are sent in batches to `Amazon Bedrock` along with the baseline Scope contract.
   - Bedrock returns classifications + confidence + estimated hours.
   - Application validates schema and tags entries as `verified` (high confidence) or `review_required` (low confidence).

2. **Ledger & Verification Flow**:
   - User views dashboard. High-confidence `new-ask` items appear in the ledger. Low-confidence items appear in Review Queue.
   - User verifies or rejects items. `Ledger Lambda` updates DynamoDB and recalculates `total_hours` and `total_unbilled_cost` deterministically.

3. **Change Order Email Flow**:
   - User clicks "Generate Change-Order Email".
   - `Change-Order Lambda` fetches verified `new-ask` items from DynamoDB.
   - `Amazon Bedrock` formats items into a client-ready email. User copies text.
