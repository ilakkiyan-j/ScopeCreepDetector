# Scope Creep Ledger — Project Context

## 1. Project Purpose
Scope Creep Ledger helps freelancers and small agencies track client requests that expand project scope beyond the original agreement, preventing lost revenue from unbilled work.

## 2. Problem
Clients frequently request scope additions (e.g., login pages, mobile responsiveness, extra revisions, analytics, logo variants) casually within long chronological chat threads (WhatsApp, Slack, email). Freelancers absorb 20-40% unbilled scope expansion because re-reading long chat threads is time-consuming and tedious.

## 3. Target Users
- Web & Software Freelancers
- Designers & Creative Freelancers
- Small Agencies & Consultants

## 4. Product Differentiator
**Cumulative Scope-Tracking System**: Unlike standard document risk flaggers that evaluate single static documents, Scope Creep Ledger maintains continuous scope-drift accounting across chronological, unstructured conversation streams against a baseline scope contract.

## 5. Core Product Principle
> **AI makes the judgment; deterministic code maintains the receipt.**

- **AI (Amazon Bedrock)** handles language understanding, classification, and effort estimation.
- **Deterministic Code** handles schema validation, ledger persistence, running totals arithmetic, confidence thresholding, duplicate handling, and state retrieval.

## 6. MVP User Flow
```text
Create Project
      ↓
Enter Project Name / Client
      ↓
Enter Original Project Scope
      ↓
Enter Hourly / Daily Rate
      ↓
Upload Conversation (.txt / .csv)
      ↓
Parse Conversation
      ↓
Analyze Conversation with Amazon Bedrock
      ↓
Classify Messages (in-scope, new-ask, clarification, off-topic)
      ↓
Identify Scope Expansion (new-ask)
      ↓
Create Scope Creep Ledger
      ↓
Calculate Additional Hours & Cost (Deterministic)
      ↓
Review Low-Confidence Items (< threshold)
      ↓
Verify / Reject Items
      ↓
Generate Change-Order Email
      ↓
Review / Copy Email
```

## 7. Technology Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, hosted on AWS Amplify.
- **Backend**: Amazon API Gateway, AWS Lambda.
- **AI**: Amazon Bedrock.
- **Storage**: Amazon S3 (raw chat exports), Amazon DynamoDB (projects, messages, verified ledger).
- **Monitoring**: Amazon CloudWatch (latency, errors, low-confidence classification tracking).

## 8. Important Constraints
- **No Direct AI Cost Arithmetic**: Cost calculation (`hours × rate`) must strictly be computed in application code.
- **Evidence Preservation**: Original raw conversation messages must never be altered or lost in ledger entries.
- **No Automatic AI Ledger Writes for Low Confidence**: Items below confidence threshold are flagged for review and require user verification before entering authoritative state.
- **No Unnecessary AWS/Cloud Complexity for MVP**: Cognito, Step Functions, EventBridge, RDS, ECS, etc., are explicitly excluded.

## 9. Current Implementation Status
- Repository initialized with AI knowledge base (`/ai/`) and documentation system (`/docs/`).
- Phase 1 (Foundation) setup in progress. Application codebase structure pending creation.
