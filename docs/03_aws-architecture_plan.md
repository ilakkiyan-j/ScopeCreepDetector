# AWS Architecture Plan

## Scope Creep Ledger
### First Commit Hackathon

---

# 1. Purpose

This document defines the AWS architecture for **Scope Creep Ledger**.

The architecture is intentionally lean and focuses on the core product workflow:

```text
Original Scope
      +
Chat Export
      ↓
AI Classification
      ↓
Deterministic Ledger
      ↓
Cost Calculation
      ↓
Scope Creep Dashboard
      ↓
Change-Order Email
```

The architecture uses AWS managed services wherever they provide clear value while avoiding unnecessary services and infrastructure complexity.

---

# 2. Architecture Goals

The architecture should provide:

- Simple deployment
- Low infrastructure overhead
- Reliable AI processing
- Persistent project data
- Raw file storage
- Deterministic financial calculations
- AI confidence monitoring
- Clear separation between AI judgment and application logic
- Sufficient performance for a 200+ message demonstration
- A straightforward architecture that can be explained to hackathon judges

---

# 3. AWS Services

The MVP uses the following AWS services:

| Layer | AWS Service | Primary Responsibility |
|---|---|---|
| Frontend Hosting | **AWS Amplify** | Host and deploy Next.js application |
| API | **Amazon API Gateway** | Expose backend HTTP endpoints |
| Compute | **AWS Lambda** | Run backend processing and business logic |
| AI | **Amazon Bedrock** | Classify messages and generate content |
| Raw Storage | **Amazon S3** | Store uploaded chat exports |
| Database | **Amazon DynamoDB** | Store projects and scope-creep ledger |
| Monitoring | **Amazon CloudWatch** | Logs, errors, confidence monitoring |

---

# 4. High-Level Architecture

```text
                         USER
                           │
                           ▼
                ┌────────────────────┐
                │    Next.js Web App  │
                │   Tailwind CSS      │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │    AWS Amplify      │
                │ Frontend Deployment │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   API Gateway      │
                └─────────┬──────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
                ▼                    ▼
        ┌───────────────┐    ┌────────────────┐
        │ Lambda        │    │ Lambda         │
        │ Analyze       │    │ Ledger / Cost  │
        └───────┬───────┘    └───────┬────────┘
                │                    │
                ▼                    ▼
        ┌───────────────┐    ┌────────────────┐
        │ Amazon        │    │ DynamoDB       │
        │ Bedrock       │    │ Project Ledger │
        └───────────────┘    └────────────────┘
                │
                │
                ▼
        ┌───────────────┐
        │ Amazon S3     │
        │ Raw Chat      │
        │ Exports       │
        └───────────────┘

                ┌────────────────┐
                │ CloudWatch     │
                │ Logs / Errors  │
                │ Confidence     │
                └────────────────┘
```

---

# 5. Frontend — AWS Amplify

## Responsibility

AWS Amplify hosts and deploys the Next.js frontend.

The frontend provides:

- Project creation
- Original scope input
- Billing rate input
- Conversation upload
- Analysis initiation
- Processing status
- Scope comparison dashboard
- Scope-creep ledger
- Cost summary
- Low-confidence review
- Change-order email preview

---

## Frontend Stack

```text
Next.js
   +
Tailwind CSS
   ↓
AWS Amplify
```

The application should communicate with backend services through API Gateway rather than directly accessing Lambda.

---

# 6. API Layer — Amazon API Gateway

API Gateway acts as the public backend entry point.

The MVP should expose a small number of focused endpoints.

## Endpoint 1 — Analyze Conversation

```text
POST /analyze
```

Purpose:

```text
Original Scope
+
Conversation
        ↓
Message Processing
        ↓
Bedrock Classification
```

The endpoint returns structured classification results.

---

## Endpoint 2 — Ledger

```text
POST /ledger
```

Purpose:

```text
Classifications
      ↓
New-Ask Extraction
      ↓
Ledger Creation
      ↓
Cost Calculation
      ↓
DynamoDB
```

---

## Endpoint 3 — Project Retrieval

```text
GET /projects/{projectId}
```

Purpose:

Load an existing project and its stored ledger.

---

## Endpoint 4 — Change-Order Generation

```text
POST /change-order
```

Purpose:

```text
Verified Ledger
      ↓
Bedrock
      ↓
Draft Change-Order Email
```

The API should remain intentionally small for the MVP.

---

# 7. Compute — AWS Lambda

Lambda provides the backend execution environment.

No continuously running server is required.

---

## Lambda Responsibility 1 — Conversation Analysis

The analysis Lambda performs:

```text
Receive Request
      ↓
Validate Input
      ↓
Parse Conversation
      ↓
Create Message Batches
      ↓
Call Bedrock
      ↓
Validate AI Response
      ↓
Return Classifications
```

---

## Lambda Responsibility 2 — Ledger Processing

The ledger Lambda performs deterministic application logic:

```text
Receive Classifications
      ↓
Filter NEW-ASK Items
      ↓
Create Ledger Records
      ↓
Calculate Estimated Hours
      ↓
Calculate Estimated Cost
      ↓
Store in DynamoDB
```

---

## Lambda Responsibility 3 — Change-Order Generation

The change-order Lambda:

```text
Retrieve Verified Ledger
        ↓
Build Bedrock Prompt
        ↓
Generate Email
        ↓
Return Draft
```

---

# 8. AI Layer — Amazon Bedrock

Amazon Bedrock provides the reasoning capabilities required by the application.

## Primary AI Task

Classify conversation messages against the original project scope.

Each message should produce structured information such as:

```json
{
  "classification": "new-ask",
  "confidence": 0.94,
  "reason": "Login functionality was not included in the original scope.",
  "estimated_hours": 3
}
```

The exact prompt and schema will be defined in the **Bedrock Prompt & JSON Schema** deliverable.

---

## Secondary AI Task

Bedrock generates the change-order email.

Input:

```text
Original Scope
+
Verified Scope-Creep Ledger
```

Output:

```text
Professional Change-Order Email
```

---

# 9. Bedrock Responsibility Boundary

Bedrock should be responsible for:

- Understanding natural language
- Interpreting conversation context
- Classifying messages
- Providing confidence
- Suggesting effort estimates
- Drafting change-order communication

Bedrock should **not** be responsible for:

- Maintaining the authoritative ledger
- Performing financial calculations
- Persisting project data
- Deciding whether low-confidence results should be silently accepted

Those responsibilities belong to application code and AWS storage services.

---

# 10. Raw Storage — Amazon S3

S3 stores the original uploaded conversation files.

Example:

```text
scope-creep-ledger/
    projects/
        project_123/
            conversations/
                whatsapp-export.txt
```

The original file should remain available as the source evidence for the analysis.

---

## S3 Responsibilities

S3 is responsible for:

- Raw conversation files
- Original uploaded artifacts
- File retrieval during processing

S3 is not the primary database for ledger records.

---

# 11. Database — Amazon DynamoDB

DynamoDB stores structured application data.

The main entities are:

```text
Project
Ledger Item
Message / Analysis Result
```

---

## Example Project Record

```json
{
  "projectId": "project_123",
  "name": "Website Redesign",
  "client": "Acme Corp",
  "originalScope": "Redesign homepage and 3 internal pages...",
  "billingRate": 60,
  "rateType": "hourly"
}
```

---

## Example Ledger Item

```json
{
  "projectId": "project_123",
  "ledgerId": "ledger_001",
  "message": "Can you also add a login page?",
  "timestamp": "2026-03-04T10:30:00Z",
  "requester": "Client",
  "classification": "new-ask",
  "confidence": 0.94,
  "estimatedHours": 3,
  "estimatedCost": 180,
  "reviewStatus": "approved"
}
```

---

# 12. Deterministic Cost Calculation

Financial calculations must happen in Lambda/application code.

Example:

```text
Billing Rate = $60/hour

Estimated Hours:
3 + 4 + 3 = 10

Total:
10 × $60 = $600
```

The system must not ask Bedrock to calculate the authoritative total.

Bedrock can suggest:

```text
estimated_hours = 3
```

Lambda calculates:

```text
estimated_cost = estimated_hours × billing_rate
```

This keeps the financial result reproducible.

---

# 13. CloudWatch — Monitoring

Amazon CloudWatch provides application observability.

The system should log:

- Lambda execution
- Processing errors
- Bedrock errors
- Invalid AI responses
- Processing duration
- Number of messages processed
- Number of scope-expansion items
- Classification confidence
- Low-confidence classifications

---

## Confidence Monitoring

Example:

```text
Message #147
Classification: new-ask
Confidence: 0.48
```

The application can flag this message for user review.

CloudWatch provides the operational record while the UI provides the human-review experience.

---

# 14. End-to-End Data Flow

## Phase A — Project Setup

```text
User
 ↓
Next.js
 ↓
API Gateway
 ↓
Lambda
 ↓
DynamoDB
```

Project information is persisted.

---

## Phase B — Conversation Upload

```text
User
 ↓
Next.js
 ↓
S3
 ↓
Raw Chat Export
```

The original conversation is stored.

---

## Phase C — AI Analysis

```text
User
 ↓
Next.js
 ↓
API Gateway
 ↓
Lambda
 ↓
S3
 ↓
Conversation
 ↓
Message Parser
 ↓
Bedrock
 ↓
Structured Classification
```

---

## Phase D — Ledger Creation

```text
Bedrock Results
       ↓
Lambda
       ↓
Filter NEW-ASK
       ↓
Create Ledger
       ↓
Calculate Hours
       ↓
Calculate Cost
       ↓
DynamoDB
```

---

## Phase E — Dashboard

```text
Next.js
   ↓
API Gateway
   ↓
Lambda
   ↓
DynamoDB
   ↓
Ledger Data
   ↓
Dashboard
```

---

## Phase F — Change Order

```text
Verified Ledger
      ↓
API Gateway
      ↓
Lambda
      ↓
Bedrock
      ↓
Email Draft
      ↓
Next.js
      ↓
User Review / Copy
```

---

# 15. Error Handling

The application should handle failures at each major boundary.

## File Upload Failure

```text
S3 upload fails
      ↓
Return upload error
      ↓
User can retry
```

---

## Bedrock Failure

```text
Bedrock request fails
      ↓
Lambda records error
      ↓
CloudWatch
      ↓
Return analysis failure
```

The system should not create an incomplete ledger from failed AI processing.

---

## Invalid AI Response

If Bedrock returns malformed or unexpected JSON:

```text
Bedrock
   ↓
Invalid JSON
   ↓
Lambda validation fails
   ↓
CloudWatch log
   ↓
Retry / error response
```

---

## Low Confidence

```text
Bedrock
   ↓
Confidence < threshold
   ↓
Flag for Review
   ↓
User Decision
```

The system should not silently convert uncertain predictions into confirmed scope creep.

---

# 16. Security Approach for MVP

The hackathon MVP should use a minimal security model.

The system should:

- Avoid exposing AWS credentials in the frontend.
- Route AWS service access through backend Lambda functions.
- Validate API input.
- Validate uploaded file types.
- Keep S3 objects private.
- Give Lambda only the AWS permissions it needs.
- Avoid storing unnecessary personal information.

Full user authentication is intentionally outside the MVP.

---

# 17. IAM Principle

Lambda functions should use dedicated IAM permissions rather than broad administrator permissions.

Conceptually:

```text
Analyze Lambda
 ├── Bedrock access
 ├── S3 read access
 └── CloudWatch logging

Ledger Lambda
 ├── DynamoDB access
 └── CloudWatch logging

Change-Order Lambda
 ├── DynamoDB read access
 ├── Bedrock access
 └── CloudWatch logging
```

The exact IAM policies will be defined during implementation.

---

# 18. Scalability Considerations

The MVP is designed around relatively small project conversations.

For the hackathon:

```text
~200 messages
```

is the primary demonstration case.

The system should process messages in batches rather than making an unnecessary Bedrock request for every individual message.

Conceptually:

```text
200 messages
      ↓
Batches
      ↓
Bedrock
      ↓
Classification Results
```

Batch size will be finalized after testing the model's context limits, latency, accuracy, and cost.

---

# 19. Architecture Decision — Why No Step Functions?

Step Functions is intentionally excluded from the MVP.

The current workflow is simple:

```text
Upload
 ↓
Lambda
 ↓
Bedrock
 ↓
DynamoDB
```

There is not enough workflow complexity to justify adding Step Functions.

If the product later introduces:

- asynchronous processing
- multiple processing stages
- retries across long-running steps
- large conversation pipelines
- complex orchestration

then Step Functions could become appropriate.

For the hackathon MVP, it adds unnecessary complexity.

---

# 20. Architecture Decision — Why No EventBridge?

EventBridge is not required because the product does not depend on scheduled processing.

The core workflow is user-triggered:

```text
User uploads conversation
        ↓
Analysis begins
```

There is no natural periodic event in the MVP.

---

# 21. Architecture Decision — Why No Cognito?

Cognito is intentionally excluded from the hackathon MVP.

The MVP does not require full account management.

A project/session identifier is sufficient for the demonstration.

Authentication can be added later if the application becomes a real multi-user product.

---

# 22. Cost-Conscious Architecture

The architecture should minimize unnecessary AWS usage.

The main potentially variable-cost component is AI inference through Bedrock.

Therefore:

- Batch messages where practical.
- Avoid sending unnecessary conversation content.
- Use structured responses.
- Avoid repeated classification of the same messages.
- Store analysis results in DynamoDB.
- Do not invoke Bedrock for deterministic calculations.
- Do not invoke Bedrock for simple CRUD operations.

The guiding principle is:

> **Use AI only where reasoning is required.**

---

# 23. Architecture Boundaries

The system should maintain clear boundaries.

```text
┌─────────────────────────────────────┐
│              FRONTEND               │
│ Next.js + Tailwind + Amplify        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│                API                  │
│            API Gateway              │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│              COMPUTE                │
│               Lambda                │
└─────────────┬───────────┬───────────┘
              │           │
              ▼           ▼
        ┌──────────┐  ┌─────────────┐
        │ Bedrock  │  │ DynamoDB    │
        │ AI       │  │ Ledger      │
        └──────────┘  └─────────────┘
              │
              ▼
        ┌──────────┐
        │ S3       │
        │ Raw Data │
        └──────────┘

              +
        ┌────────────┐
        │ CloudWatch │
        │ Monitoring │
        └────────────┘
```

---

# 24. Monorepo Alignment

The AWS architecture will be implemented within a single project repository.

Recommended structure:

```text
scope-creep-ledger/
│
├── apps/
│   └── web/
│       └── Next.js application
│
├── services/
│   ├── analyze/
│   │   └── Lambda
│   ├── ledger/
│   │   └── Lambda
│   └── change-order/
│       └── Lambda
│
├── infrastructure/
│   └── AWS configuration
│
├── shared/
│   ├── types/
│   └── schemas/
│
├── sample-data/
│   └── demo conversations
│
└── README.md
```

The monorepo keeps the frontend, backend, shared schemas, infrastructure, and demo data together.

---

# 25. Deployment Flow

The intended deployment flow is:

```text
Developer
    │
    ▼
GitHub Repository
    │
    ├──────────────► AWS Amplify
    │                   │
    │                   ▼
    │              Next.js App
    │
    └──────────────► AWS Backend
                        │
                        ├── API Gateway
                        ├── Lambda
                        ├── Bedrock
                        ├── S3
                        └── DynamoDB
```

The exact infrastructure-as-code approach will be selected during implementation.

---

# 26. Reliability Architecture

The reliability strategy is based on three principles:

### 1. AI Uncertainty Is Visible

Low-confidence classifications are surfaced for human review.

### 2. Evidence Is Preserved

The original conversation message remains attached to each ledger item.

### 3. Critical Calculations Are Deterministic

Cost calculations and ledger totals are performed by application code.

Together:

```text
AI Judgment
     +
Original Evidence
     +
Deterministic Calculation
     +
Human Review
     =
Trustworthy Ledger
```

---

# 27. Definition of Done

The AWS Architecture Plan is complete when:

- [ ] AWS services and responsibilities are defined.
- [ ] Frontend architecture is defined.
- [ ] API architecture is defined.
- [ ] Lambda responsibilities are defined.
- [ ] Bedrock responsibilities are defined.
- [ ] S3 storage strategy is defined.
- [ ] DynamoDB responsibilities are defined.
- [ ] CloudWatch monitoring is defined.
- [ ] End-to-end data flow is defined.
- [ ] Error handling is defined.
- [ ] Low-confidence handling is defined.
- [ ] Security/IAM approach is defined.
- [ ] Scalability considerations are defined.
- [ ] Excluded AWS services are justified.
- [ ] Monorepo alignment is defined.
- [ ] Deployment approach is defined.

---

# 28. Core Architecture Principle

> **Keep the architecture lean: use AWS Bedrock where human-language judgment is required, Lambda for deterministic business logic, DynamoDB for structured project state, S3 for raw evidence, and Amplify/API Gateway/CloudWatch for application delivery and observability.**

This architecture is deliberately small enough to build during the hackathon while still demonstrating meaningful use of AWS services.