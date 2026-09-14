# ALXO — Product Redesign Audit

> **Scope**: `D:\Projects\1-active\ScopeCreepDetector` (repo root).
> **Purpose**: Full read-only audit before the ALXO redesign (Phase 1 of the ALXO brief). No files were modified, no AWS resources created, no backend contracts changed.
> **Method**: Verified against source (`services/*`, `shared/types`, `apps/web/app`, `apps/web/components`, `apps/web/lib`, `ai/*`, `apps/web/e2e`). Bug conclusions name the exact root-cause path per flow.

---

## Current Architecture

- **Frontend**: Next.js 14.2.35 (App Router), React 18.3, TypeScript strict, Tailwind CSS 3.4 (PostCSS), `lucide-react` icons. All app pages are `'use client'`; no `Server Components` usage.
- **Monorepo**: npm workspaces — `apps/web` (frontend + API route handlers), `services/{analyze,ledger,change-order}` (backend service layer), `shared/types` (single source of domain truth).
- **State**: React Context only (`AuthContext` for session/theme/users). No query/data-fetching library.
- **Data layer**: single typed client `apps/web/lib/api.ts` → 5 Route Handlers. No `middleware.ts`, no `loading.tsx` / `error.tsx` / `not-found.tsx` anywhere.
- **Storage**: `services/ledger` uses DynamoDB `PutCommand`/`GetCommand`/`ScanCommand`/`QueryCommand` when credentials exist; otherwise a **process-local `globalThis` Map store** (`services/ledger/src/ledger-service.ts:3-12`). S3 storage util exists but is **not wired** into any route.
- **AI**: `services/analyze` parser + Bedrock/Claude 3 Haiku classifier with a deterministic offline keyword mock fallback; deterministic arithmetic (`hours × rate`) in code only.
- **Testing**: 6 backend suites (`services/test-all.ts`, run via `npx tsx`) + 6 Playwright specs (23 tests), all green.

## Current Route Tree

| Route | File | Who | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | public | Old-brand landing (Scope Creep Ledger) |
| `/sign-in` | `app/sign-in/page.tsx` | public | Real gate; demo button; `?next=` |
| `/request-access` | `app/request-access/page.tsx` | public | Mock submit |
| `/dashboard` | `app/dashboard/page.tsx` | public | Redirect stub → `/app/dashboard` |
| `/auth/login` | `app/auth/login/page.tsx` | public | Redirect stub → `/sign-in` |
| `/app` | `app/app/page.tsx` | USER | Redirect stub → `/app/dashboard` |
| `/app/dashboard` | `app/app/dashboard/page.tsx` | USER | Metrics + recent projects + activity |
| `/app/projects` | `app/app/projects/page.tsx` | USER | List/search/empty |
| `/app/projects/new` | `app/app/projects/new/page.tsx` | USER | `NewProjectForm` |
| `/app/analysis/new` | `app/app/analysis/new/page.tsx` | USER | Same `NewProjectForm` |
| `/app/activity` | `app/app/activity/page.tsx` | USER | localStorage activity |
| `/app/settings/profile` | `app/app/settings/profile/page.tsx` | USER | Profile card |
| `/app/settings/preferences` | `app/app/settings/preferences/page.tsx` | USER | Theme + currency |
| `/app/projects/[projectId]` | `layout` | USER | `ProjectProvider` + `ProjectWorkspace` |
| `/app/projects/[projectId]/overview,scope,conversations,analysis,ledger,change-orders,activity` | 7 `page.tsx` | USER | 7 project tabs |
| `/admin` | `app/admin/page.tsx` | ADMIN | Redirect stub → `/admin/dashboard` |
| `/admin/dashboard` | page | ADMIN | Metrics + by-currency |
| `/admin/users` `/admin/users/[userId]` | pages | ADMIN | User mgmt |
| `/admin/projects` | page | ADMIN | Table + by-currency |
| `/admin/activity` `/admin/usage` `/admin/settings` | pages | ADMIN | Activity/usage/settings |
| `/api/analyze` `/api/projects` `/api/projects/[projectId]` `/api/ledger/verify` `/api/change-order` `/api/admin/info` | Route Handlers | public | **No auth on any API route** |

Redirect stubs kept intentionally: `/dashboard→/app/dashboard`, `/app→/app/dashboard`, `/admin→/admin/dashboard`, `/auth/login→/sign-in`.

## Authentication Flow

- Entirely client-side mock in `apps/web/context/AuthContext.tsx`. Session persisted to `localStorage` (`scope_creep_session`, 24 h TTL), hydrated in a mount `useEffect` to avoid hydration mismatch.
- Seeded fixtures: `demo@scopecreep.io` (USER, demo), `admin@scopecreep.io` (ADMIN), plus two extra USER accounts. `signIn` matches email in `allUsers` (also localStorage-backed `scope_creep_users`) and **accepts any non-empty password** (`AuthContext.tsx:149-179`).
- Session re-derivation: demo mode and the admin email always re-map to canonical fixtures; other stored sessions are returned verbatim.
- No Cognito. No server-side verification. `NEXT_PUBLIC_COGNITO_*` env vars exist in `.env.example` but are referenced nowhere.

## Authorization Flow

- Only `components/layout/AuthGuard.tsx`: client-side redirect (`/sign-in?next=`, admin→`/app/dashboard`, user→`/admin/dashboard`). It is presentation-level and documented as such.
- **No middleware, no server-side enforcement on any `/api/*` route.** Projects/ledger/change-order handlers accept arbitrary requests.
- `listProjects()`/`getProject()` are **not owner-scoped** (`ledger-service.ts`) — any caller sees every project.

## USER vs ADMIN Access

- Layout split works: `/app/*` wrapped in `AuthGuard` (USER), `/admin/*` in `AuthGuard requireAdmin`. Covered by e2e (`role-selection-and-upload.spec.ts`, `admin-and-profile.spec.ts`).
- **Bugs found**:
  1. Payload `data.projects` row links to **`/app/projects/[id]/overview`** (`admin/projects/page.tsx:76`). An admin lands there, hits AuthGuard, and is bounced back to `/admin/dashboard` — a dead-end click. Admin project rows must link to an admin-view route (or the guard must allow admin read of project workspace).
  2. Role elevation via localStorage: `loadStoredSession` returns any non-demo, non-admin-email stored session verbatim (`AuthContext.tsx:85-104`). A user who writes `{ user: { role: 'ADMIN', email:'x@y.z', ... } }` to `scope_creep_session` gains the admin UI. Demo/admin fixtures are protected; arbitrary forged sessions are not. Must be closed (re-derive role from email/fixture, or validate against users store).

## Demo Flow

- Demo = authenticated demo USER (`usr_demo_001`, mode `'demo'`), persistent "Demo Mode" banner with a “Sign in” override, never routes to admin. Good isolation of UI.
- **Bugs found**:
  1. Landing `DemoButton` (`app/page.tsx:112-142`): if already authenticated it skips `signInDemo()` and just pushes `/app/dashboard` — so a signed-in (non-demo) user never actually gets the demo session, and an admin gets bounced by AuthGuard instead of seeing the demo.
  2. Demo workspace shares the **global mock project/ledger store** — demo-created projects are visible to every other “user” of the same server process, and persist until the server restarts. The demo should be sandboxed (per-user store at minimum).
  3. Sign bar: the demo banner and the footer “Sign out” both work (→ `/sign-in`), but there is no explicit “demo mode” affordance in the top bar beyond the banner.

## API/Data Flow

1. `POST /api/analyze` → `handleAnalyzeRequest` (parse → classify → deterministic ledger) → `saveProject` + `saveLedgerItems`. **Forced `mockMode: true`** (`api/analyze/route.ts:8`) — Bedrock is never called from the web app even with AWS creds.
2. `GET /api/projects` → `listProjects()` — **all** projects, sorted by `createdAt` desc.
3. `GET /api/projects/[id]` → project + ledger items + totals. No ownership check.
4. `POST /api/ledger/verify` → updates status/hours, recomputes totals deterministically.
5. `POST /api/change-order` → `generateChangeOrderEmail` (**forced `mockMode: true`**, `api/change-order/route.ts:8`).
6. `GET /api/admin/info` → benign deployment flags.
7. Activity is **localStorage-only** (`lib/activity.ts`), not an API concern.
8. S3 storage util (`services/analyze/src/s3-storage.ts`) exists but is **unused**.

## Project Data Model

```ts
Project {
  id, userId?, name, clientName, freelancerRole?, originalScope,
  hourlyRate, currency, status?, createdAt        // shared/types/index.ts
}
```
- No `updatedAt`, no `lastAnalyzedAt`, no conversation-file metadata, no revision history. `listProjects` sorts by `createdAt` only — “recent activity” cannot be honored today.
- `LedgerItem` is complete (id, projectId, messageId, timestamp, requester, originalMessage, classification, reason, estimatedHours, estimatedCost, confidence, verificationStatus, createdAt).
- `ProjectAnalysis` is returned in the analyze response but **never persisted** — the project Analysis tab reconstructs counts from ledger items only, so in-scope/clarification/off-topic are hardcoded `0` (`[projectId]/analysis/page.tsx:24-29`).

## Change Order Flow (bug #1)

**Path**: `change-orders page → api.generateChangeOrder({projectId}) → /api/change-order → getProject(request.projectId) → verify → new-ask+verified filter → formatter → response`.

**Root cause of “Project … not found.”**: persistence is the **process-local `globalThis` mock store**. It is wiped by any dev-server restart, hot reload of server modules, or serverless cold start — while the open SPA still holds a healthy project. Clicking **Generate** then calls `getProject(projectId)` against an empty store → `throw new Error('Project ${id} not found.')` (`change-order-service.ts:28-31`), surfaced verbatim by the UI error box. The e2e change-order test only passes because `reuseExistingServer: true` keeps one long-lived dev server whose store was seeded seconds earlier in the same process.

**Contributing factors**:
1. `mockMode: true` hardcoded in `/api/change-order` (and `/api/analyze`) — real DynamoDB/Bedrock is unreachable from the web app regardless of env.
2. DynamoDB path assumes partition key `id` and performs no GSI/`SK` query; if the provisioned table layout differs, the read throws and falls back to the (empty) mock store → same “not found”.
3. UI gates on client-side `verifiedItems` only; a server/client store divergence (e.g., item verified after page load, then server restarted) yields the second error type: “No verified scope creep items exist…”.

**Fix directions (Phase 2)**: persist mock store per `<userId>` and survive restart (or keep an explicit “mock data resets on restart” contract + clear messaging), remove forced `mockMode` in favour of env-driven behavior, emit distinct 404/403/409 errors for project-not-found / unauthorized / empty-ledger, and handle Bedrock timeout/malformed responses as first-class errors. Change-order contents **must remain verified `new-ask` items only**, with deterministic math.

## Dashboard Project Retrieval (bug #2)

**Path**: dashboard mount → `useProjects()` → `GET /api/projects` → `listProjects()` (mock store, `createdAt` desc) → `recentProjects = projects.slice(0,4)` → `ProjectCard` grid.

**Root cause of “Recent projects do not appear”**: same process-local store lifecycle. A project created in a prior server run is gone after restart, so the list legitimately returns `[]` and renders “No projects yet”. Data therefore does **not** come from a durable backend, and the empty state is real but confusing (the project *felt* created moments ago). The dashboard’s sum-metric also collapses all currencies into the user’s default currency (`dashboard/page.tsx:30-46,96`) — misleading for multi-currency users, and lower than the required “group per currency” standard already used in admin (`useAdminOverview.ts`).

Secondary gaps vs. brief: sort is by `createdAt` (no activity ordering), cost never shows on dashboard `ProjectCard` (the `totalCost` prop is not passed), and lists are not owner-scoped.

## Profile/Settings Flow (bug #3)

- `app/app/settings/layout.tsx` renders `<h1>Settings</h1>` + a 2-tab pill nav, and each child renders its own card (`max-w-xl`), all **left-aligned** with large unused whitespace; Profile vs Preferences cards are different heights and separate scrolls — the “poor alignment” reported.
- Two tabs only (Profile, Preferences). No `Security` tab; brief requires Profile / Preferences / Security with a centered responsive container.
- Admin settings is a single page (`/admin/settings`, deployment+integrity); fine, but `admin/usage/page.tsx:35` renders the literal string `"Out of {allUsers.length}"` (template-literal bug).

## Password Flow (bug #4)

- Password exists only at sign-in and in `CreateUserDialog` (info text: “any non-empty password (mock)”). `signIn` validates **non-empty only**; seeds accept any password (`AuthContext.tsx:155-158`).
- **No password requirements, no confirmation, no change-password flow, no `/app/settings/security` page, no backend credential store.** Any visitor can sign in as any seeded user with any password — the reported “password checking/validation does not work” is a structural gap, not a single line.

## Currency Flow

- **Solid foundation to keep**: typed `Currency` (INR, USD, EUR, GBP, AUD, CAD, SGD, AED, JPY); user `defaultCurrency`; project `currency`; `Intl.NumberFormat` in `lib/currency.ts` (2 fixed decimals); `amount:number` + `currency:string` stored, never formatted-as-truth; admin `groupByCurrency` (no FX). Correct per brief.
- **Bugs/gaps**:
  1. User dashboard sums cost across currencies into one number (`Recoverable value`).
  2. Mock change-order email hardcodes `$${cost}` (`change-order-service.ts:181,200`) — always USD-looking regardless of project currency.
  3. Analyze handler falls back to `'USD'` when currency missing (`handler.ts:120`) while the form always sends one.
  4. `RateInput`/`CurrencySelector` exist but currency is not shown as a badge on dashboard project cards.

## Theme System

- Token-based: `globals.css` `:root` + `.dark` with RGB triplet vars; Tailwind `darkMode:'class'` (fixed in redesign round 1); single `THEME_INIT_SCRIPT` flash-guard; `AuthContext` hydrates + persists `scope_creep_theme`; global `prefers-reduced-motion` guard; system-scrollbar styling. Verified in both themes by the 93-checkpoint QA (round 1) and e2e.
- **Gaps**: `selection:bg-blue-500` raw hex in `app/layout.tsx:29`; no semantic `--surface`/`--surface-elevated` tokens (brief requests them); accent usage is light; no focus ring colorization story beyond `ring`.

## Existing Component System

- **UI primitives** (`components/ui/*`, 20 files, exported via `index.ts`): Button, Input, Textarea, Select, Label, Card(+Header/Title/Description/Content/Footer), Badge, Tabs, Skeleton, Spinner, EmptyState, ErrorState, Dialog (focus-trap, Escape, focus-restore — regression fixed), ConfirmDialog, Avatar, Table(+Header/Row/Head/Body/Cell/Caption), DropdownMenu/Item, Tooltip.
- **Feature components**: `MetricCard`, `PageHeader`, `ProjectCard`, `ProjectTabs`, `ProjectWorkspace`(+Provider), `NewProjectForm`, `FileStaging`, `AnalysisProgress`, `LedgerItemCard`(+EvidencePanel/StatusBadge), `ActivityTimeline`, `CurrencySelector`, `RateInput`, `CreateUserDialog`, `WorkspaceShell` (user+admin shared), `AppShell`, `AdminShell`, `AuthGuard`, `states/LoadingState`.
- **Good**: no Button2/CardNew duplication; primitives reused broadly; Dialog focus regression already fixed last round.
- **Dupes found**: `STATUS_TONE` map copied 3× (`ProjectWorkspace.tsx`, `ProjectCard.tsx`, `admin/projects/page.tsx`); inline primary “New Project” link-button markup duplicated (dashboard + projects); raw `<input type="search">` duplicated 3× (projects, admin users) instead of using `Input`.

## Existing Dependencies

- Runtime: `next ^14.1` (14.2.35), `react 18.2`, `react-dom`, `lucide-react ^0.330`. Dev: `typescript`, `tailwindcss 3.4`, `postcss/autoprefixer`, `@playwright/test`, `@types/*`.
- Backend (dynamic-imported): `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-bedrock-runtime` (used only when not mock).
- **Not present (and needed for ALXO)**: framer-motion (motion design), `@react-three/fiber` + `@react-three/drei` + `three` (landing 3D), no fonts package (Google Fonts `@import` in CSS).

## Existing Motion/3D

- **Motion**: only Tailwind keyframes `fade-in`, `fade-up`, `slide-in` (desktop drawer), `animate-spin`, plus `transition-colors`. No framer-motion yet. Global reduced-motion guard exists.
- **3D**: none. No three/R3F anywhere. The landing page is a static client component.

## Current Bugs (root causes above)

| # | Symptom | Root cause | Layer |
|---|---|---|---|
| 1 | Change order “Project … not found.” | Process-local `globalThis` store emptied on server restart/cold start while SPA still holds the project; read hits empty store | `ledger-service.ts` mock store + `change-order-service.ts:28-31` |
| 1b | (Same) never real backend | `mockMode:true` forced in `/api/change-order` and `/api/analyze` | route handlers |
| 2 | Recent projects empty | Same store lifecycle; plus no persistence guarantee, no owner scoping, sort-by-createdAt only | `api/projects` / dashboard |
| 3 | Demo nav/session | `DemoButton` skips `signInDemo` when already authenticated; demo writes to the shared global store | `app/page.tsx` DemoButton |
| 4 | Profile/Settings alignment | Left-aligned `max-w-xl` cards, no centered container, no padding rhythm, missing Security tab | settings layout/pages |
| 5 | Password validation | Mock auth accepts any non-empty password; no strength/confirmation/change flow or security page | `AuthContext.signIn`, no settings/security |
| 6 | Admin project row dead-end | `/admin/projects` links into `/app/projects/[id]` which AuthGuard bounces | `admin/projects/page.tsx:76` |
| 7 | Role elevation | Forged localStorage session carries `role:'ADMIN'` through `loadStoredSession` verbatim | `AuthContext.tsx:100` |
| 8 | Cross-currency dashboard sum | Dashboard sums all projects into defaultCurrency | `app/app/dashboard/page.tsx` |
| 9 | Change-order email always `$` | Mock formatter hardcodes `$${}` | `change-order-service.ts` |
| 10 | Analysis counts fake | Non-new-ask counts constant `0` (summary not persisted) | `app/.../analysis/page.tsx` |
| 11 | Activity is browser-local | `lib/activity.ts` localStorage only, not per-user backend | lib |

## UI Problems

- Landing page is a competent but generic “Scope Creep Ledger” static page — nothing memorable, no brand, no 3D, no storytelling arc; hero copy is not ALXO.
- Workspace is calm/usable (good) but visually generic flat cards; no motion hierarchy; “New Project” CTAs duplicated without the Button primitive.
- Settings double `h1` (layout “Settings” + each child card title), uneven whitespace.
- Ledger cards are solid but don’t yet present the “receipt” story (classification/confidence strap + evidence expand) that the ALXO brief wants as a hero moment.
- Analysis progress animates a fake timer across predefined stages not tied to real pipeline state (`AnalysisProgress.tsx:41-58`) — brief requires real-state progress.
- No `loading.tsx`/`error.tsx`/`not-found.tsx` boundaries; every page hand-rolls loading/error.

## Security Concerns

- All `/api/*` endpoints are unauthenticated and unauth-owner-checked (analyze, projects list/detail, verify, change-order).
- localStorage role elevation (bug #7).
- Mock auth = anyone signs in as any seeded user with any password.
- No middleware or server-side guard for `/app` vs `/admin`.
- Nothing dangerous is exposed to the client (no AWS keys in frontend code; `/api/admin/info` returns benign flags only). Good.

## Performance Concerns

- Dashboard + admin overview do **N+1** `GET /api/projects/[id]` per project to compute aggregates.
- AnalysisProgress timer re-renders every 900 ms via `setInterval` for a UI-only progression.
- External Google Fonts `@import` in CSS (render-chain cost).
- `globalThis` store grows unbounded (no cap) while the server runs.
- No code-splitting strategy yet — nothing heavy today (no 3D libs), but adding three/R3F requires strict lazy-loading.
- Server components unused; a Landing page with 3D must be isolated from the app bundle.

## Accessibility Concerns

- Good baseline: global `:focus-visible` ring, dialog focus trap/restore, menu roles, reduced-motion guard, semantic tokens with contrast, `aria-live` on file staging.
- Gaps: settings duplicate `h1`; analysis stage list has `aria-current` but no live announcement; classification counts use unlabeled radio-card groups; tables lack `caption`; `Dialog`/`Dropdown` labels are close-button-only in places; no contrast check tool for the new ALXO palette.

## What Must Be Preserved

- Backend service layer & 6 passing test suites; `shared/types` as single source of truth (extend, don’t rewrite).
- **Deterministic math rule** (`hours × rate` in code only — never AI-arithmetic) and the “AI judges, deterministic code keeps the receipt” split.
- Dual AWS/mock fallback design, Bedrock prompts, sample thread + `sample-data/conversations/*`.
- API contracts and route shape (additive only).
- Semantic theme-token system + `darkMode:'class'`, reduced-motion guard, auth hydration pattern (no hydration mismatch).
- UI primitive set + Dialog/Dropdown focus behavior; currency helpers + no-FX rule; admin grouped-by-currency UX; AuthGuard layout split; 23 e2e tests.

## What Should Be Rebuilt

- **Brand → ALXO** across metadata, shell brand, landing, copy, logo mark (the X motif), loading states.
- **Landing page**: cinematic narrative, 3D hero, scroll storytelling, reduced-motion/mobile fallback.
- **Dashboard**: real owner-scoped metrics, per-currency totals, recent-project cards with cost badge, real empty state.
- **Settings**: centered container, Profile/Preferences/Security tabs, aligned cards.
- **Auth**: honest mock with real password validation + change-password + security page; close role-elevation hole; sandbox the demo store; fix DemoButton session switching.
- **Project persistence**: per-user mock store + owner scoping on every read; persist `updatedAt`/`lastAnalyzedAt`; decide S3 wiring.
- **Unknowns to verify in Phase 2**: the DynamoDB partition-key layout (`id`) assumption; whether Amplify envs set `AWS_ACCESS_KEY_ID` (validates perceived serverless data loss).
- **Change order**: env-driven mock, 404/403/409 errors, currency-aware email, richer success/copy states.
- **Analysis**: real-stage progress; persist full classification summary.
- **Conversations tab**: show actual staged/uploaded files (not just flagged messages).
- **Motion system**, **3D system** (new), `loading.tsx`/`error.tsx`/`not-found.tsx`.

## Proposed ALXO Architecture

- Layered: Public (`/`) → Auth gate → User workspace (`/app/*`) vs Admin console (`/admin/*`), each with its own shell; project workspace as an inner `[projectId]` layout with 7 tabs.
- `AuthProvider` (session/theme/users/currency) at root; owners passed explicitly by auth; APIs become owner-checked server-side; demo scoped to a per-user demo bucket.
- Data: extend `shared/types` (add `updatedAt`, `lastAnalyzedAt`, `sourceFiles[]`, persisted `ProjectAnalysis`); mock store keyed by `userId`; keep DynamoDB writing path pristine.
- Bundle topology: landing is an island — its 3D chunk (`dynamic(..., { ssr:false })`) never ships into `/app` or `/admin`; framer-motion loaded only where used; workspace stays dependency-light.
- Brand system: ALXO wordmark + X motif; Scope Creep Ledger demoted to an internal concept (Scope Intelligence → Scope Creep Ledger → Change Orders).

## Proposed Route Tree

```
Public        /  /sign-in  /request-access
User (/app)   /app →/app/dashboard
              /app/dashboard  /app/projects  /app/projects/new
              /app/projects/[projectId]/{overview,scope,conversations,analysis,ledger,change-orders,activity}
              /app/analysis/new  /app/activity
              /app/settings/{profile,preferences,security}
Admin         /admin →/admin/dashboard
              /admin/dashboard /admin/users /admin/users/[userId]
              /admin/projects /admin/activity /admin/usage /admin/settings
```
(Matches the brief’s final list; the only structural additions are `/app/settings/security`.)

## Proposed Design System

- **Tokens**: add `--surface`, `--surface-elevated`, `--success/--warning/--danger/--info` already present; ensure *every* element consumes tokens (remove `selection:bg-blue-500`, hardcoded hex). Two intentional palettes (light + dark), not inverted twins.
- **Typography**: display serif or tight title face for landing hero + Inter for product; mono for scope/evidence quoting (JetBrains Mono already loaded). Type scale + tracking tokens.
- **Components**: extend existing primitives (Input search variant, table `caption`, confirmation flows); single `STATUS_TONE` map; shared link-button component. States: loading/skeleton, empty, error, success everywhere.

## Proposed Motion System

- framer-motion (or CSS-first for the workspace) with a constrained vocabulary: content entrance (fade-up, 200–300 ms), list reflow, number transitions for cost tiles, analysis stage reveals keyed to **real** state, change-order pipeline (verify → prepare → generate → ready), dialog/menu handled by existing focus-correct primitives.
- Hard rules: nothing on the critical interaction path is delayed; no bounce/decorative loops; all animation disabled under `prefers-reduced-motion`.

## Proposed 3D System

- three + `@react-three/fiber` + `@react-three/drei`, **only on `/`**, `ssr:false` + `dynamic()` lazy import; `dpr` clamp `[1,2]`, ~40–60k triangles, 2–4 draw calls; render loop paused offscreen/hidden.
- Scene narrates the product: original-scope plane → conversation fragments orbit → a request drifts past the boundary → the **X** forms (request crosses agreement) → ledger entry + cost grows (+4 hrs, +8 hrs, ₹6,400). Slow, elegant, interactive on pointer only over hero; static poster + no idle motion under reduced motion. Mobile gets the simplified poster (or 2D narrative fallback).

---

**Out of scope for this audit (flagging):** the ALXO brief’s “expected skills” list also includes `ux-copywriting` and `visual-qa`, which are **not yet installed** under `.opencode/skills/` (8 skills from the prior round exist: product-design, frontend-design, design-system, motion-design, 3d-web-design, responsive-design, accessibility, web-performance). I can add the two missing skills before Phase 2 begins.

**Phase 1 complete — stopping here per the brief. No files under `apps/`, `services/`, or `shared/` were modified.**