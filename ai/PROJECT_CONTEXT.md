# Project Context — Scope Creep Ledger

## 1. Project Overview
**Scope Creep Ledger** is an AI-assisted cumulative scope-drift tracking system for freelancers and small agencies.
It analyzes chronological client conversation exports (Slack, WhatsApp, Email, CSV threads) against an agreed baseline project contract, classifies requests outside scope, calculates deterministic financial value, and generates auditable change-order receipts.

## 2. Target Persona & Problem
- **Target User**: Freelancers, independent software developers, UI/UX designers, copywriters, video editors, and agency project managers.
- **Problem Solved**: Freelancers lose over $12B annually to unbilled scope creep ("*just one small tweak*"). Freelancers lack formal accounting evidence to justify billing extra hours.

## 3. Product Enhancement Plan Goals
Transitioning Scope Creep Ledger from a single-page demo into a **secure, multi-user, product-quality MVP for hackathon demonstration** and SaaS production readiness.

### Key Enhancement Pillars:
1. **Product Shell & Navigation**: Public landing page, authenticated application workspace, user dashboard, admin portal.
2. **Authentication & Authorization**: Amazon Cognito identity management, JWT validation, backend API permission checks, and strict project ownership enforcement.
3. **Multi-User & Profile Management**: Professional roles (Web Dev, UI/UX, Copywriter, Video, Consultant), user statuses, and admin visibility.
4. **Project Workspace & Persistence**: Reusable projects saved in AWS DynamoDB / local persistence.
5. **Multiple File Upload & Staging**: File dropzone staging with review, validation, and multi-file processing.
6. **Activity & Audit**: Full event timeline logging (`PROJECT_CREATED`, `ANALYSIS_STARTED`, `LEDGER_ITEM_VERIFIED`, `CHANGE_ORDER_GENERATED`).
7. **Design System & Responsive UI**: Coherent light/dark mode design tokens across all components.

## 4. Core Principle
> **AI makes the judgment; deterministic code maintains the receipt.**
- **AI Core**: Language understanding, contract boundary classification (`in-scope`, `new-ask`, `clarification`, `off-topic`), reasoning, and initial effort estimation.
- **Application Core**: Validation, persistence, arithmetic (`estimatedHours × userRate`), confidence thresholds (<0.70 review required), verification state, ownership, and authorization.
