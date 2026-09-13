# Product Requirements & User Flow

## Scope Creep Ledger

### First Commit Hackathon

---

## 1. Document Purpose

This document defines the product requirements and primary user workflow for **Scope Creep Ledger**.

The product helps freelancers and small agencies identify work that has gradually expanded beyond an agreed project scope through client conversations.

The system compares:

1. The **original project scope**
2. A chronological **client conversation**

It identifies scope-expansion requests, records them in an auditable ledger, estimates their additional effort and financial value, and helps the freelancer generate a change-order email.

---

# 2. Problem Statement

Freelancers and small agencies often lose money because project scope expands informally through everyday conversations.

Examples include:

- "Can you also add a login page?"
- "Can we tweak the colors?"
- "One more revision."
- "Can you add analytics?"

These requests may be agreed to casually without being formally added to the original project scope.

As the project progresses, the freelancer may forget which requests were additional work or may not have a clear record to use when requesting additional payment.

The current manual solution is to reread the entire conversation and identify additional work manually.

**Scope Creep Ledger automates this review.**

---

# 3. Product Goal

The goal is to transform a messy project conversation into a precise and auditable scope-creep record.

### Input

```text
Original Project Scope
        +
Client Conversation
        +
Hourly / Daily Rate
```

### Output

```text
Scope Creep Items
        +
Evidence from Conversation
        +
Estimated Additional Hours
        +
Estimated Unbilled Cost
        +
Low-Confidence Items for Review
        +
Change-Order Email
```

---

# 4. Target User

## Primary User

**Freelancers and small agencies**

Examples:

- Web developers
- Software developers
- Designers
- Marketing freelancers
- Small development agencies
- Consultants

The MVP focuses on users who have an agreed project scope and communicate with clients through exported conversations.

---

# 5. Core User Story

> As a freelancer, I want to upload my original project scope and client conversation so that I can quickly identify additional work I performed outside the original agreement and understand how much unbilled work it represents.

---

# 6. MVP Scope

The MVP must support the following workflow:

```text
Create Project
      ↓
Enter Original Scope
      ↓
Enter Hourly / Daily Rate
      ↓
Upload Conversation
      ↓
Analyze Conversation
      ↓
Classify Messages
      ↓
Identify Scope Expansion
      ↓
Create Scope Creep Ledger
      ↓
Calculate Additional Cost
      ↓
Review Low-Confidence Items
      ↓
Generate Change-Order Email
```

---

# 7. User Workflow

## Step 1 — Create Project

The user starts a new project.

Example:

```text
Project Name:
Website Redesign

Client:
Acme Corp
```

The system creates a project identifier used to associate uploaded files, classifications, and ledger entries.

---

## Step 2 — Enter Original Scope

The user provides the original agreement.

The MVP should allow a simple text-based scope rather than requiring a formal document.

Example:

```text
Redesign homepage and 3 internal pages.

No backend development.

One revision round.

Budget: $2,000

Timeline: 2 weeks.
```

The original scope becomes the **reference point** against which conversation messages are evaluated.

### Requirement

The original scope must remain visible and unchanged in the dashboard so that the user can compare it against detected scope expansion.

---

# 8. Step 3 — Enter Rate

The user provides their billing rate.

Example:

```text
Hourly Rate: $60/hour
```

The system uses this rate when calculating the estimated financial value of scope expansion.

The arithmetic must be performed deterministically by application code.

---

# 9. Step 4 — Upload Conversation

The user uploads a project conversation.

The MVP should support exported conversation files such as:

```text
.txt
.csv
```

Possible sources include:

- WhatsApp exports
- Email threads
- Slack exports

The conversation contains chronological messages.

Example:

```text
Mar 1 — Client:
Can we start with the homepage?

Mar 2 — Freelancer:
Sure.

Mar 4 — Client:
Oh, can you also add a login page?

Mar 5 — Freelancer:
Okay.

Mar 9 — Client:
Can we have another revision?
```

---

# 10. Step 5 — Conversation Processing

The system parses the uploaded conversation into individual messages.

Each normalized message should retain available information such as:

```text
Message ID
Timestamp
Requester / Sender
Message Text
```

The system then processes messages in batches for AI classification.

---

# 11. Step 6 — AI Message Classification

Each message is evaluated against the original project scope.

The system assigns one of four classifications:

### 1. IN-SCOPE

The message relates to work already included in the original agreement.

Example:

```text
"Can you update the homepage according to the agreed design?"
```

---

### 2. NEW-ASK / SCOPE-EXPANSION

The message introduces work that was not included in the original scope.

Example:

```text
"Can you also add a login page?"
```

This is the most important classification for the product.

---

### 3. CLARIFICATION

The message asks for clarification or discusses an existing requirement without introducing additional work.

Example:

```text
"Does the homepage redesign include the hero section?"
```

---

### 4. OFF-TOPIC

The message is unrelated to project scope.

Example:

```text
"Are we still meeting tomorrow?"
```

---

# 12. Step 7 — Scope Creep Detection

Messages classified as:

```text
NEW-ASK / SCOPE-EXPANSION
```

are added to the Scope Creep Ledger.

Each ledger item should preserve the evidence required to understand why it was identified.

Example:

```text
Scope Creep Item
────────────────────────────
Request:
"Can you also add a login page?"

Date:
Mar 4

Requester:
Client

Estimated Effort:
3 hours

Estimated Value:
$180

Confidence:
94%
```

The original message must remain available as evidence rather than replacing it with a generated summary.

---

# 13. Step 8 — Effort Estimation

For each detected scope-expansion item, the system can obtain an estimated effort.

Example:

```text
Login flow → 3 hours
Mobile redesign → 4 hours
Analytics integration → 3 hours
```

The estimate may be suggested by the AI.

However, the final cost calculation must be performed by deterministic application code.

---

# 14. Step 9 — Cost Calculation

The user-provided rate is applied to estimated additional hours.

Example:

```text
Hourly rate = $60

Additional work:
3 + 4 + 3 = 10 hours

Estimated unbilled value:

10 × $60 = $600
```

The application should display both:

```text
Additional Hours
Estimated Unbilled Cost
```

---

# 15. Step 10 — Confidence & Human Review

AI classification is not always certain.

For ambiguous messages, the system should not silently make a decision.

Example:

```text
Message:
"Can we revisit the homepage again?"

Confidence:
51%
```

If the confidence is below the configured threshold, the item should be placed into:

```text
Flagged for Review
```

The user can then review the original message and make the final decision.

This makes human validation part of the product rather than hiding uncertain AI decisions.

---

# 16. Step 11 — Scope Creep Dashboard

The primary dashboard should use a two-panel layout.

```text
┌──────────────────────┬────────────────────────────┐
│ ORIGINAL SCOPE       │ SCOPE CREEP LOG            │
│                      │                            │
│ Homepage redesign    │ + Login flow               │
│ 3 internal pages     │   Mar 4                    │
│ No backend           │   3 hours                  │
│ 1 revision           │   $180                     │
│ $2,000               │                            │
│ 2 weeks              │ + Mobile redesign          │
│                      │   Mar 12                   │
│                      │   4 hours                  │
│                      │   $240                     │
│                      │                            │
│                      │ Total: 10 hours            │
│                      │ Unbilled: $600             │
└──────────────────────┴────────────────────────────┘
```

The dashboard should make the difference between **what was agreed** and **what was subsequently requested** immediately understandable.

---

# 17. Step 12 — Generate Change-Order Email

After reviewing the ledger, the user can select:

```text
Generate Change-Order Email
```

The system generates a professional email based on the verified ledger items.

The email should communicate:

- Additional requested work
- Why it is outside the original scope
- Estimated additional effort
- Estimated additional cost
- Request for approval / change order

The user should be able to review and copy the generated email.

---

# 18. Functional Requirements

## FR-01 — Project Creation

The system must allow a user to create a project.

---

## FR-02 — Original Scope Input

The system must allow the user to enter the original project scope as text.

---

## FR-03 — Rate Input

The system must allow the user to provide an hourly or daily billing rate.

---

## FR-04 — Conversation Upload

The system must accept supported conversation export files.

---

## FR-05 — Message Parsing

The system must convert the conversation into normalized chronological messages.

---

## FR-06 — AI Classification

The system must classify each message into:

```text
in-scope
new-ask / scope-expansion
clarification
off-topic
```

---

## FR-07 — Confidence

The classification response must contain a confidence value.

---

## FR-08 — Scope Creep Ledger

The system must create ledger entries for messages classified as scope expansion.

---

## FR-09 — Evidence Preservation

Each ledger entry must retain the original request/message used as evidence.

---

## FR-10 — Effort Estimation

The system must associate an estimated effort with detected scope-expansion items.

---

## FR-11 — Deterministic Cost Calculation

The system must calculate estimated additional cost using application code rather than relying on AI-generated arithmetic.

---

## FR-12 — Persistence

The system must persist project and ledger information so that a project can be reloaded.

---

## FR-13 — Human Review

The system must identify low-confidence classifications for user review.

---

## FR-14 — Dashboard

The system must display the original scope and detected scope expansion side-by-side.

---

## FR-15 — Change-Order Email

The system must generate a client-ready change-order email from the ledger.

---

# 19. Non-Functional Requirements

## Reliability

The system should avoid silently making decisions when classification confidence is low.

---

## Auditability

Detected scope expansion must be traceable back to the original conversation message.

---

## Determinism

Ledger construction and cost arithmetic should be performed by application code wherever possible.

---

## Usability

The primary value should be understandable immediately after processing a conversation.

The user should be able to answer:

> "What extra work was requested, and how much is it worth?"

---

## Performance

The system should process a realistic conversation quickly enough for the hackathon demonstration.

The target demonstration scenario is a conversation containing approximately 200 messages.

---

# 20. MVP Out of Scope

The following capabilities are intentionally excluded from the MVP:

### Authentication

No full user authentication system is required for the hackathon demonstration.

### Automated Invoice Generation

The MVP identifies unbilled work but does not generate or send invoices.

### Automatic Client Communication

The system generates an email but does not automatically send it.

### Scheduled Monitoring

The MVP analyzes uploaded conversations rather than continuously monitoring communication channels.

### Full Chat Platform Integrations

Direct integrations with WhatsApp, Slack, Gmail, etc. are not required for the initial MVP. Exported files are sufficient.

---

# 21. Success Criteria

The MVP is successful if a user can:

1. Create a project.
2. Enter an original project scope.
3. Enter a billing rate.
4. Upload a realistic conversation.
5. Analyze the conversation.
6. See messages classified against the original scope.
7. See detected scope-expansion items.
8. See the original evidence for each detected item.
9. See estimated additional hours.
10. See calculated unbilled value.
11. Review ambiguous classifications.
12. Generate a change-order email.

---

# 22. Primary Demo Scenario

The primary hackathon demonstration should use a realistic 200+ message conversation.

Example result:

```text
Original Scope
────────────────────
3-page redesign
No backend
$2,000
2 weeks


Scope Creep Detected
────────────────────
6 additional requests

• Login flow
• Extra revision #2
• Extra revision #3
• Mobile-specific redesign
• New logo variant
• Analytics integration


Estimated Additional Work
────────────────────
11.5 hours

Estimated Unbilled Value
────────────────────
$690
```

The intended product moment is:

> A freelancer can see, within seconds, the additional work that would otherwise require manually rereading a long client conversation.

---

# 23. Product Principle

The central product principle is:

> **AI makes the judgment; deterministic code maintains the receipt.**

Bedrock is responsible for understanding ambiguous human conversation and classifying messages.

Application code is responsible for maintaining the ledger, preserving evidence, and calculating totals.

This separation is fundamental to making the system useful, auditable, and trustworthy.

---

# 24. Final MVP Architecture Flow

```text
                 USER
                   │
                   ▼
          ┌─────────────────┐
          │   Project Setup │
          │ Scope + Rate    │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Conversation    │
          │ Upload          │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Message Parser  │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Amazon Bedrock  │
          │ Classification  │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Ledger Logic    │
          │ + Cost Math     │
          └────────┬────────┘
                   │
             ┌─────┴─────┐
             ▼           ▼
       ┌──────────┐ ┌───────────┐
       │DynamoDB  │ │ Review    │
       │ Ledger   │ │ Queue     │
       └────┬─────┘ └─────┬─────┘
            │             │
            └──────┬──────┘
                   ▼
          ┌─────────────────┐
          │ Ledger Dashboard│
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Change-Order    │
          │ Email           │
          └─────────────────┘
```

---

## Definition of Done

**Phase 1 — Product Requirements & User Flow is complete when:**

- [ ] Problem is clearly defined
- [ ] Target user is defined
- [ ] MVP workflow is defined
- [ ] Core features are defined
- [ ] Classification categories are identified
- [ ] Ledger requirements are defined
- [ ] Cost calculation behavior is defined
- [ ] Human-review behavior is defined
- [ ] Dashboard behavior is defined
- [ ] Change-order workflow is defined
- [ ] MVP boundaries are defined
- [ ] Success criteria are defined
