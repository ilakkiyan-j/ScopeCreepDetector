# Scope Creep Ledger — Product Enhancement Plan

## 1. Purpose

Scope Creep Ledger started as a hackathon-focused AI tool that compares an original project scope against messy client conversations, identifies scope expansion, estimates additional effort/value, and generates a change-order email.

The next stage is to evolve it from a single-page demo into a **secure, multi-user product/MVP** while preserving the existing core intelligence.

The goal is not to build every possible SaaS feature. The goal is to build a polished, believable product that can be demonstrated at the hackathon and can serve as a strong foundation for continued development after the hackathon.

---

## 2. Product Vision

### Current experience

```text
Upload Scope
     ↓
Upload Conversation
     ↓
Analyze
     ↓
View Scope Creep
```

### Target product experience

```text
Public Landing Page
        ↓
Sign In / Authorization
        ↓
User Workspace
        ↓
Dashboard
        ↓
Projects
        ↓
Project Workspace
        ↓
Original Scope
        ↓
Multiple Conversation Attachments
        ↓
Review Attachments
        ↓
Analyze
        ↓
AI Classification
        ↓
Scope Creep Ledger
        ↓
User Verification
        ↓
Cost / Impact
        ↓
Change-Order Email
        ↓
Activity History
```

The product should feel like a real workspace rather than a one-time analysis page.

---

## 3. Product Architecture

The product should have three major layers:

```text
┌──────────────────────────────────────────┐
│              PRODUCT SHELL               │
│                                          │
│ Landing Page                             │
│ Authentication                           │
│ User Profiles                            │
│ Admin Dashboard                          │
│ Projects                                 │
│ Activity                                 │
│ Navigation                               │
│ Design System                            │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│            CORE INTELLIGENCE             │
│                                          │
│ Conversation Parsing                     │
│ Bedrock Classification                   │
│ Confidence / Review                      │
│ Scope Creep Ledger                       │
│ Deterministic Cost Calculation           │
│ Change-Order Generation                  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│               AWS PLATFORM               │
│                                          │
│ Cognito                                  │
│ Amplify                                  │
│ API Gateway                              │
│ Lambda                                   │
│ Bedrock                                  │
│ S3                                       │
│ DynamoDB                                 │
│ CloudWatch                               │
└──────────────────────────────────────────┘
```

---

## 4. Guiding Product Principles

### 4.1 Preserve the existing core

Do not throw away the working Scope Creep Ledger functionality.

Enhance the product around it.

### 4.2 AI makes the judgment; deterministic code maintains the receipt

Bedrock handles language understanding, classification, reasoning, rough effort estimation, and change-order drafting.

Application code handles validation, persistence, confidence thresholds, verification state, duplicate handling, arithmetic, project ownership, and authorization.

### 4.3 Security is part of the product

The application should not be publicly usable by unknown users.

Authentication and authorization should be implemented before treating the application as a multi-user product.

Backend APIs must verify the authenticated user and enforce resource ownership.

### 4.4 Evidence-first

Every detected scope expansion should allow the user to understand:

- What was requested?
- Who requested it?
- When was it requested?
- Why is it outside the original scope?
- What additional effort was estimated?
- What is its current verification status?

The original conversation evidence must be preserved.

### 4.5 Product simplicity

Build only what strengthens the core product.

Do not add unnecessary complexity such as payments, subscriptions, teams, real-time collaboration, full Slack/WhatsApp integrations, mobile applications, or complex AI agents.

---

## 5. User Roles

Start with two roles.

### USER

A user can:

- sign in
- manage their profile
- create projects
- view their own projects
- define original scope
- upload conversation files
- review attachments
- analyze conversations
- review scope creep
- verify/reject items
- view cost impact
- generate change-order emails
- view their activity

### ADMIN

An administrator can:

- sign in
- create users
- manage user status
- view users
- view projects
- view activity
- view system/usage information
- access admin dashboard

Do not create unnecessary additional roles for the MVP.

---

## 6. Authentication & Authorization

### Goal

Move from an openly accessible application to an authenticated product.

### Target flow

```text
Landing Page
     ↓
Sign In
     ↓
Authentication
     ↓
Role Detection
     ├───────────────┐
     ▼               ▼
   USER            ADMIN
     ↓               ↓
User Dashboard   Admin Dashboard
```

### Authentication requirements

- Sign in
- Sign out
- Password setup/reset flow
- Protected application routes
- Protected admin routes
- User/admin role handling
- Backend authorization
- Project ownership validation

### Account model

For the initial product, accounts should be created/controlled by administrators rather than allowing unrestricted public signup.

---

## 7. User Profile

Each user should have an application profile.

Suggested fields:

```text
userId
name
email
profession
company
createdAt
lastLoginAt
status
```

The profession should help make the product feel tailored to different professional users.

---

## 8. User Activity

Maintain an activity history for important actions.

Examples:

```text
PROJECT_CREATED
FILES_ADDED
FILES_REMOVED
FILES_UPLOADED
ANALYSIS_STARTED
ANALYSIS_COMPLETED
LEDGER_ITEM_VERIFIED
LEDGER_ITEM_REJECTED
CHANGE_ORDER_GENERATED
PROFILE_UPDATED
```

Activity should support both user history and appropriate admin visibility.

---

## 9. Project-Centered Product Model

Projects become the central application object.

```text
User
 │
 ├── Project A
 │     ├── Original Scope
 │     ├── Rate
 │     ├── Conversations
 │     ├── Analyses
 │     ├── Scope Creep Ledger
 │     └── Change Orders
 │
 ├── Project B
 │
 └── Project C
```

This allows users to return later instead of losing their work after one analysis.

---

## 10. Dashboard

The authenticated user should land on a dashboard.

Suggested overview:

```text
Welcome back, John

Projects             8
Analyses             24
Scope creep items    61
Estimated value      $4,820

Recent Projects
────────────────────────
Acme Website
Nova Mobile App
ABC Branding
```

The dashboard should prioritize useful information over decorative charts.

---

## 11. Project Workspace

A project should have a persistent workspace.

Suggested sections:

```text
Project
├── Overview
├── Original Scope
├── Conversations
├── Analysis
├── Scope Creep Ledger
└── Change Orders
```

---

## 12. Multiple File Upload Workflow

### Current problem

When users select multiple `.txt` files, they should be able to verify their selection before analysis.

Users may accidentally select the wrong files.

### New workflow

```text
Select Files
     ↓
Temporary Attachment List
     ↓
Review
     ├── Remove file
     ├── Add more files
     └── Inspect file information
     ↓
Confirm
     ↓
Upload All
     ↓
Analyze
```

Example:

```text
Attachments (3)

📄 WhatsApp_01.txt     2.4 MB    Remove
📄 WhatsApp_02.txt     1.8 MB    Remove
📄 Client_Email.txt    900 KB    Remove

[ + Add more files ]

[ Analyze 3 files ]
```

The final action should clearly communicate how many files will be processed.

---

## 13. File Validation

Before analysis:

- accept supported file types
- reject unsupported files
- validate file size
- prevent empty files where appropriate
- display file names
- allow removal
- allow additional files
- prevent accidental duplicate selection where appropriate

---

## 14. Analysis Experience

The analysis process should feel like a real workflow rather than an instant black box.

Suggested states:

```text
Preparing files
      ↓
Uploading conversations
      ↓
Parsing messages
      ↓
Analyzing messages
      ↓
Building scope creep ledger
      ↓
Calculating impact
      ↓
Analysis complete
```

The UI should communicate progress and meaningful status.

---

## 15. Scope Creep Ledger

The core product remains the Scope Creep Ledger.

Each authoritative ledger entry should preserve:

```text
messageId
timestamp
requester
originalMessage
classification
reason
estimatedHours
estimatedCost
confidence
verificationStatus
```

Only verified `new-ask` items should become authoritative ledger records.

Low-confidence items should be presented for user review rather than silently accepted.

---

## 16. Deterministic Cost Calculation

The authoritative calculation must remain application-side.

```text
estimated cost =
estimated hours × user rate
```

Running totals must be calculated deterministically.

Bedrock may suggest effort, but it should not be trusted with authoritative financial arithmetic.

---

## 17. Change-Order Generation

The change-order feature should use only verified ledger items.

The generated draft should:

- distinguish original scope from additional work
- list verified additional requests
- include estimated effort
- include estimated cost where available
- remain professional and neutral
- request client confirmation/approval
- never invent information

The user reviews and copies the email.

Automatic sending remains outside the MVP.

---

## 18. Landing Page

Create a public landing page before the authenticated application.

Suggested structure:

```text
Navbar
  Logo
  Product
  How It Works
  Features
  Sign In
  Request Access

Hero
  "Stop doing extra work for free."

  Supporting explanation

  [Request Access]
  [Sign In]

How It Works
  01 Define scope
  02 Upload conversations
  03 Detect scope expansion
  04 Review evidence
  05 Generate change order

Product Preview
  Dashboard / Ledger visual

Features
  Scope-aware AI
  Evidence-backed detection
  Cost impact
  Review workflow
  Change-order generation
  Project history

Footer
```

The landing page should communicate the product value within seconds.

---

## 19. Design System & Theme

The existing light/dark implementation is inconsistent.

Do not fix this by changing individual components randomly.

Create a shared design system using semantic design tokens.

Core tokens should cover:

```text
background
card
foreground
muted foreground
border
primary
secondary
success
warning
danger
```

All major components should use these shared semantic values.

Audit:

- buttons
- cards
- inputs
- tables
- modals
- dropdowns
- navigation
- sidebar
- upload components
- dashboard
- admin pages
- landing page
- empty states
- loading states
- error states

Light and dark themes should be visually coherent across the entire application.

---

## 20. Application Navigation

Authenticated users should have a persistent product layout.

Suggested navigation:

```text
Scope Creep Ledger

Dashboard
Projects
New Analysis
Activity

────────────────
Settings
Profile
```

Admin navigation:

```text
Admin

Overview
Users
Projects
Activity
Usage
Settings
```

---

## 21. Admin Dashboard

Suggested sections:

```text
Admin Dashboard
├── Overview
├── Users
├── Projects
├── Activity
├── Usage
└── Settings
```

Overview metrics may include:

```text
Total Users
Active Users
Projects
Analyses
Scope Creep Items
Estimated Additional Value
```

User management should include:

- create user
- view user
- enable/disable user
- inspect activity where appropriate

---

## 22. AWS Architecture Evolution

The existing AWS architecture should be expanded to include authentication.

```text
                         ┌─────────────────┐
                         │  Landing Page   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Cognito     │
                         │ Authentication  │
                         └────────┬────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                   USER                      ADMIN
                     │                         │
                     ▼                         ▼
              User Workspace            Admin Dashboard
                     │
                     ▼
                  Projects
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Scope     Conversations Ledger
                     │
                     ▼
                    S3
                     │
                     ▼
                  Lambda
                     │
               ┌─────┴─────┐
               ▼           ▼
            Bedrock     DynamoDB
               │           │
               └─────┬─────┘
                     ▼
                  Results
                     │
                     ▼
              Change Order

              CloudWatch
          monitors backend systems
```

---

## 23. Data Model Direction

The application should conceptually contain:

```text
User
UserProfile
Project
ConversationFile
ConversationMessage
Analysis
LedgerItem
ActivityEvent
ChangeOrder
```

Exact DynamoDB implementation can be finalized during implementation after inspecting the current code.

Do not unnecessarily redesign existing working data structures without reason.

---

## 24. Security Requirements

The product must include:

- authenticated access
- backend authorization
- project ownership checks
- least-privilege AWS permissions
- private S3 storage
- no AWS credentials in browser
- no credentials committed to Git
- file validation
- AI response validation
- input validation
- safe error messages
- appropriate CloudWatch logging
- avoidance of unnecessary sensitive-data logging

---

## 25. AWS Beginner Experience

Because the developer is a beginner to AWS, every new AWS service must have a beginner-friendly setup guide.

For each service document:

```text
Why we need it
What the service does
What needs to be created
AWS Console steps
Configuration
IAM permissions
Environment variables
Local development
Verification
Common errors
Security notes
Project integration
Cleanup
```

AWS infrastructure should never be introduced without explaining what the developer needs to do.

---

## 26. AWS Documentation

Maintain:

```text
/docs/aws/
```

Examples:

```text
cognito.md
s3.md
dynamodb.md
lambda.md
api-gateway.md
bedrock.md
amplify.md
cloudwatch.md
```

Only create service documentation when that service is actually being implemented.

---

## 27. AI Project Knowledge System

Maintain:

```text
/ai/
```

with:

```text
PROJECT_CONTEXT.md
ARCHITECTURE.md
CURRENT_STATE.md
DECISIONS.md
DEVELOPMENT_RULES.md
AWS_STATUS.md

/prompts/
/schemas/
/examples/
```

The `/ai/` directory is the project's persistent AI knowledge layer.

Every meaningful architectural or implementation change should update the relevant AI files.

---

## 28. Development Phases

### Phase 1 — Existing Foundation

Preserve and complete:

- requirements
- user flow
- classification rules
- AWS architecture
- Bedrock prompts
- JSON schemas

### Phase 2 — Existing AI Classification Pipeline

Build/refine:

- conversation parser
- Bedrock classification
- confidence handling
- classification API

### Phase 3 — Existing Ledger Backend

Build/refine:

- DynamoDB model
- ledger generation
- cost calculation
- project persistence

### Phase 4 — Existing Product Interface

Build/refine:

- project setup
- upload
- dashboard
- scope comparison
- cost summary

### Phase 5 — Existing Change Order

Build/refine:

- change-order prompt
- generator
- preview

### Phase 6 — Existing AWS Deployment & Reliability

Build/refine:

- S3
- Amplify
- API Gateway
- Lambda
- CloudWatch
- end-to-end validation

---

# 29. New Productization Phases

## Phase 7 — Product Foundation

Goal: establish the product shell.

Deliverables:

- public/private route structure
- authenticated application layout
- navigation
- design system
- light/dark theme consistency
- responsive layout
- shared UI components

---

## Phase 8 — Authentication & Authorization

Goal: secure the product.

Deliverables:

- Amazon Cognito
- sign in
- sign out
- password flow
- protected routes
- admin/user roles
- backend authorization
- project ownership checks
- access denied experience

---

## Phase 9 — User & Admin Management

Goal: introduce the multi-user product model.

Deliverables:

- user profiles
- profession
- user status
- admin dashboard
- user creation
- user management
- activity visibility
- usage overview

---

## Phase 10 — Project Workspace

Goal: make projects persistent and reusable.

Deliverables:

- project list
- project creation
- project detail
- scope section
- conversation section
- analysis section
- ledger section
- change-order section

---

## Phase 11 — Professional File Workflow

Goal: improve the multiple-file experience.

Deliverables:

- attachment staging
- file preview information
- remove file
- add more files
- file validation
- confirm before upload
- upload all
- analysis initiation

---

## Phase 12 — Analysis Experience

Goal: make analysis understandable.

Deliverables:

- analysis states
- progress feedback
- upload status
- parsing status
- AI analysis status
- completion state
- failure state
- retry behavior

---

## Phase 13 — Activity & Audit

Goal: make the product persistent and traceable.

Deliverables:

- activity event model
- user activity page
- project activity
- admin activity
- important event tracking

---

## Phase 14 — Product Dashboard

Goal: create a useful user home.

Deliverables:

- project metrics
- analysis metrics
- scope creep metrics
- estimated value
- recent projects
- recent activity

---

## Phase 15 — Security & Reliability

Goal: harden the product.

Deliverables:

- authorization audit
- ownership audit
- input validation
- file validation
- AI schema validation
- error handling
- CloudWatch logging
- security review

---

## Phase 16 — Landing Page & Product Marketing

Goal: create a polished public entry point.

Deliverables:

- landing page
- product messaging
- feature sections
- how-it-works section
- product preview
- sign-in CTA
- request-access CTA
- responsive design

---

## Phase 17 — Hackathon Polish

Goal: make the product compelling in a live demo.

Deliverables:

- realistic user
- realistic project
- realistic conversation dataset
- polished dashboard
- polished ledger
- loading states
- empty states
- error states
- responsive UI
- architecture diagram
- demo workflow
- presentation narrative

---

## 30. Hackathon Demo Flow

The final demonstration should be:

```text
1. Open landing page
2. Explain the scope-creep problem
3. Sign in
4. Show user dashboard
5. Open/create project
6. Show original scope
7. Select multiple messy conversation files
8. Show attachment review
9. Remove an incorrect file
10. Add the correct file
11. Confirm all files
12. Start analysis
13. Show analysis progress
14. AI identifies scope expansion
15. Show evidence
16. Show confidence
17. Verify/reject items
18. Show additional hours
19. Show estimated additional value
20. Generate change-order email
21. Show activity history
22. Briefly show admin dashboard
23. Explain AWS architecture
```

The demo should communicate both **AI capability and real product engineering**.

---

## 31. Success Criteria

The enhanced product should allow:

- controlled user access
- role-based application experience
- persistent user profiles
- persistent projects
- multiple-file conversation uploads
- attachment review before upload
- scope-aware AI classification
- low-confidence review
- evidence-backed ledger
- deterministic cost calculation
- change-order generation
- activity history
- admin visibility
- consistent light/dark theme
- responsive UI
- public landing page
- secure AWS architecture

---

## 32. Explicitly Out of Scope for Hackathon

Do not add unless specifically approved:

- billing
- subscriptions
- payment processing
- team collaboration
- advanced organization management
- WhatsApp API
- Slack integration
- Gmail integration
- automatic email sending
- mobile application
- complex analytics platform
- real-time collaboration
- autonomous AI agents

These belong to the post-hackathon roadmap.

---

## 33. Product Roadmap After Hackathon

Potential future features:

```text
Team Workspaces
        ↓
Slack / Gmail / WhatsApp integrations
        ↓
Automatic conversation synchronization
        ↓
Continuous scope monitoring
        ↓
Client approval workflows
        ↓
Change-order tracking
        ↓
Billing integration
        ↓
Team analytics
        ↓
Enterprise controls
```

These should not interfere with the hackathon MVP.

---

## 34. Implementation Strategy

Do not rebuild the application from scratch.

Use this strategy:

```text
Current Working Application
          ↓
Inspect
          ↓
Stabilize
          ↓
Create Product Shell
          ↓
Authentication
          ↓
User / Admin Model
          ↓
Project Persistence
          ↓
File Workflow
          ↓
Activity
          ↓
Design System
          ↓
Security
          ↓
Landing Page
          ↓
Hackathon Polish
```

At every stage, preserve working functionality.

---

## 35. Definition of Product Ready for Hackathon

The product is ready when a judge can understand:

### In the first 10 seconds

What problem does this solve?

### In the first minute

How does the product work?

### During the demo

Why is AI necessary?

### During the architecture discussion

Why were these AWS services chosen?

### During the security discussion

How are users and projects protected?

### During the product discussion

Why is this more than a single AI page?

The final answer should be obvious through the product itself.

---

## 36. Final Product Statement

Scope Creep Ledger is not merely:

> "An AI that detects scope creep."

It is:

> **A secure workspace that turns messy client conversations into an evidence-backed record of additional work, estimated impact, and actionable change orders.**

The hackathon version should demonstrate that complete product loop while keeping the architecture simple enough to understand, deploy, and maintain.
