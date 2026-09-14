# ⚡ ALXO

> **Catch the work hiding between the lines.**
> AI-Assisted Cumulative Scope-Drift Accounting & Change-Order Engine for Freelancers and Agencies

[![ALXO CI](https://github.com/ilakkiyan-j/ScopeCreepDetector/actions/workflows/ci.yml/badge.svg)](https://github.com/ilakkiyan-j/ScopeCreepDetector/actions/workflows/ci.yml)
[![Live Deployment](https://img.shields.io/badge/AWS%20Amplify-Live%20App-00C7B7?style=flat&logo=awsamplify)](https://master.d2ctutlbtt1yhj.amplifyapp.com/)
[![AWS Bedrock](https://img.shields.io/badge/Amazon%20Bedrock-Claude%203%20Haiku-FF9900?style=flat&logo=amazonaws)](https://aws.amazon.com/bedrock/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Passed-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)

---

## ⚡ Live Application

👉 **Try the Live AWS Amplify App:** [https://master.d2ctutlbtt1yhj.amplifyapp.com/](https://master.d2ctutlbtt1yhj.amplifyapp.com/)

---

## 🎯 The Problem

Freelancers and small agencies lose over **$12 Billion annually** in unbilled scope expansion. Scope creep rarely happens all at once—it manifests as a series of small, innocent client requests ("*Can you add a quick login page?*", "*Could we do a 3rd revision round?*", "*Can you set up Google Analytics too?*").

Because freelancers lack a formal accounting system for communication logs, these incremental requests go unbilled. When it comes time to bill, freelancers struggle to justify charges without concrete proof and exact timeline receipts.

---

## 💡 The Solution

**ALXO** acts as an AI audit layer between client conversation exports (Slack, WhatsApp, Email, CSV logs) and original baseline project contracts.

1. **AI Classification**: Evaluates every message against contract scope boundaries.
2. **Deterministic Arithmetic**: Calculates unbilled hours and dollar value strictly in code (`hours × hourlyRate`)—NEVER allowing AI to invent price numbers.
3. **Audit Ledger & Analytics**: Renders an interactive scope classification chart and audit trail.
4. **Change Order Generator**: Produces a client-ready Change Order email & printable PDF receipt with signature blocks.

---

## ✨ Key Features

- **🌐 Live AWS Amplify Deployment**: Hosted on AWS Amplify (`ap-southeast-2`) with zero infrastructure friction.
- **🎨 High-Contrast Light & Dark Themes**: Modern glassmorphism dark mode (`#0B0F19`) and clean light mode with an instant ☀️/🌙 toggle.
- **👔 Multi-Industry Role Personalization**: Tailors boundary classification rules for:
  - 💻 **Web / Software Dev**
  - 🎨 **UI/UX & Designer**
  - ✍️ **Copywriter & Content**
  - 🎥 **Video & Motion**
  - 📊 **Consultant / Marketer**
- **📁 Multi-Format Chat Dropzone**: Drag and drop `.txt`, `.csv`, or `.json` transaction logs directly into the analysis pipeline.
- **📊 Visual Scope Drift Analytics Chart**: SVG progress distribution visualizing `Scope Creep`, `In-Scope`, `Clarification`, and `Off-Topic` items.
- **📄 Printable PDF Change Order Receipt**: Formatted change order receipt complete with signature blocks, itemized breakdown, and one-click PDF printing.
- **🛡️ 100% Fail-Safe Dual Execution Engine**: Seamlessly runs with Amazon Bedrock + DynamoDB + S3 in production, with an automatic offline fallback engine for student accounts or offline development.

---

## 🏗️ Architecture & Technology Stack

```
[ Client Conversation Log (.txt / .csv) ] + [ Baseline Contract Scope ]
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │    Next.js 14 Web Frontend    │
                   │   (React 18, Tailwind CSS)    │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  Scope Analysis Pipeline      │
                   │  (Parser -> AI Classifier)    │
                   └───────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       ┌─────────────────────────┐   ┌───────────────────────────┐
       │ Amazon Bedrock Runtime  │   │  Deterministic Ledger Math│
       │ (Claude 3 Haiku / SCP)  │   │ (hours * rate = $cost)    │
       └─────────────────────────┘   └─────────────┬─────────────┘
                                                   │
                                                   ▼
                                     ┌───────────────────────────┐
                                     │ Change Order Receipt PDF  │
                                     └───────────────────────────┘
```

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router), React 18, Tailwind CSS, Lucide Icons.
- **AI Core**: [Amazon Bedrock](https://aws.amazon.com/bedrock/) (Claude 3 Haiku) for zero-shot text classification.
- **Persistence Layer**: [AWS DynamoDB](https://aws.amazon.com/dynamodb/) (Project & Ledger Tables) & [AWS S3](https://aws.amazon.com/s3/) (Raw Conversation Storage).
- **Testing Engine**: [Playwright E2E](https://playwright.dev/) & Node.js Native Test Runner.
- **CI/CD Pipeline**: GitHub Actions & AWS Amplify Hosting.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ilakkiyan-j/ScopeCreepDetector.git
cd ScopeCreepDetector
npm install
```

### 2. Configure Environment Variables (Optional for AWS Cloud)
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
*(Note: If AWS credentials are not set, the app automatically switches to the offline deterministic fallback engine!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

ALXO includes a comprehensive automated test suite containing **13 verified tests** across unit, backend pipeline, and Playwright E2E integration specs.

### Run All Tests (Backend + Playwright E2E)
```bash
npm test
```

### Run Backend Unit & Service Tests
```bash
npm run test:backend
```

### Run Playwright E2E & API Integration Tests
```bash
npm run test:e2e
```

---

## 📁 Repository Structure

```
ScopeCreepDetector/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── apps/
│   └── web/                       # Next.js 14 Frontend Application
│       ├── app/                   # App Router pages & API routes (/api/analyze, /api/change-order)
│       ├── components/            # React Components (Header, ProjectForm, ScopeAnalyticsChart, etc.)
│       ├── e2e/                   # Playwright E2E & API integration test specs
│       └── playwright.config.ts   # Playwright configuration
├── services/
│   ├── analyze/                   # Conversation parser & Bedrock AI classifier
│   ├── ledger/                    # Scope creep ledger & deterministic math service
│   ├── change-order/              # Change order email & PDF generator service
│   └── test-all.ts                # Master backend test suite
├── shared/
│   └── types/                     # Shared domain interfaces & TypeScript contracts
├── ai/
│   └── prompts/                   # System & User prompt templates with role rules
└── docs/
    ├── aws/                       # AWS cloud deployment guides (S3, DynamoDB, Bedrock, Amplify)
    └── spec/                      # Product requirements & scope classification specifications
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
