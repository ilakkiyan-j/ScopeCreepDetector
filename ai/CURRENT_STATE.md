# Current State — Scope Creep Ledger

> **Updated**: 2026-09-13 — Frontend redesign in progress (see `UI_AUDIT.md` for the baseline audit).

## 1. Status Summary

**Frontend product redesign in progress.** The audit (`ai/UI_AUDIT.md`) is complete. The previous flat route model (`/dashboard`, `/admin`, `/profile`) is being rebuilt into the strict public / user (`/app/*`) / admin (`/admin/*`) architecture with a semantic design system, dual app shells, staged file upload, evidence-first ledger, and user+project currency handling. Backend services (analyze, ledger, change-order) are preserved intact. MVP auth is a cleaned-up mock (no silent auto-login, isolated authenticated demo user, no fake JWT claims); Cognito remains the documented production path.

### Current Progress by Phase
| Phase | Status |
|---|---|
| Audit & docs (`/ai/UI_AUDIT.md` + updated knowledge files) | ✅ Complete |
| Phase 1 · Route architecture | ⏳ In progress |
| Phase 2 · Design system | ⏳ Pending |
| Phase 3 · AppShell / AdminShell | ⏳ Pending |
| Phase 4 · Landing + Sign-in + Request Access + demo user | ⏳ Pending |
| Phase 5 · Dashboard + projects | ⏳ Pending |
| Phase 6 · Project workspace | ⏳ Pending |
| Phase 7 · File upload staging | ⏳ Pending |
| Phase 8 · Analysis UI | ⏳ Pending |
| Phase 9 · Ledger + evidence | ⏳ Pending |
| Phase 10 · Currency | ⏳ Pending |
| Phase 11 · Profile & preferences | ⏳ Pending |
| Phase 12 · Activity | ⏳ Pending |
| Phase 13 · Admin workspace | ⏳ Pending |
| Phase 14 · API additions | ⏳ Pending |
| Phase 15 · QA | ⏳ Pending |

## 2. Preserved Backend Components (unchanged)

| Component | Status | Details |
|---|---|---|
| AI Classification Engine | ✅ Working | Amazon Bedrock + Claude 3 Haiku with role prompt rules (mock fallback) |
| Conversation Parser | ✅ Working | Parses timestamped Slack, WhatsApp, Email, CSV threads |
| Deterministic Math Engine | ✅ Working | Strictly computes `hours × rate` in code |
| Ledger Service | ✅ Working | In-memory fallback + DynamoDB tables |
| Change Order Generator | ✅ Working | Backend email generator (service test passing; UI previously bypassed it) |
| S3 Storage | ✅ Working | Raw conversation storage util |

## 3. Rediscovery / Behavior Changes from Audit

- **Auth**: `AuthContext` was silently auto-authenticating every visitor as demo user and issuing fabricated `mock_jwt_` tokens. Now: visitors unauthenticated by default; demo is an explicit authenticated demo USER session (Option A); no fake JWT claims.
- **Theme**: `darkMode: 'class'` was missing in `tailwind.config.js`, so `dark:` variants ignored the app toggle (responded to OS media query). Now: token-based semantic theming.
- **Currency**: was hardcoded `'USD'` in two places, never surfaced. Now: user default + project currency, locale formatting, no FX conversion.
- **Change order**: UI built emails client-side, bypassing `/api/change-order`. Now: UI consumes the backend endpoint.

## 4. Active Configuration
- **AWS Region**: `ap-southeast-2` (Asia Pacific Sydney)
- **Bedrock Model ID**: `anthropic.claude-3-haiku-20240307-v1:0`
- **S3 Bucket**: `scope-creep-ledger-conversations-dev`
- **DynamoDB Projects Table**: `scope-creep-ledger-projects-dev`
- **DynamoDB Ledger Table**: `scope-creep-ledger-items-dev`
- **Confidence Threshold**: `0.70`

## 5. Next Recommended Step
Proceed through the redesign phases in `UI_AUDIT.md` §20 (1 → 15). Currently on **Phase 1: Route architecture**.