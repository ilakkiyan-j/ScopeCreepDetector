# UI Audit — Scope Creep Ledger Frontend

> **Date**: 2026-09-13
> **Status**: Completed — supersedes all prior "UI polish" descriptions in `CURRENT_STATE.md`.
> **Purpose**: Baseline audit of the existing frontend before the complete product-architecture redesign.

---

## 1. Current Frontend Architecture

- **Framework**: Next.js 14 (App Router, **14.2.35** installed), React 18.3, TypeScript 5.9 (strict).
- **Styling**: Tailwind CSS 3.4.19 (PostCSS + Autoprefixer), `lucide-react` icons.
- **Monorepo** (npm workspaces): `apps/web` (frontend), `services/*` (backend service layer), `shared/types` (single source of truth domain types).
- **State**: React Context only (`AuthContext`). No React Query / SWR / Redux / data-fetching library.
- **Data layer**: Exactly **one** `fetch()` in the entire frontend (`POST /api/analyze` from `/dashboard`).
- **Routing**: App Router; **no** `middleware.ts`, **no** `loading.tsx`, **no** `error.tsx`, **no** `not-found.tsx` anywhere.
- **Testing**: 6 backend suites (`npx tsx services/test-all.ts`) + 6 Playwright specs (13 tests) in `apps/web/e2e`.

## 2. Current Route Tree

| Route | File | Public | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | ✓ | SaaS landing page |
| `/landing` | `app/landing/page.tsx` | ✓ | Client-side redirect stub → `/` (unlinked, dead weight) |
| `/auth/login` | `app/auth/login/page.tsx` | ✓ | Mock login w/ persona switcher |
| `/auth/signup` | `app/auth/signup/page.tsx` | ✓ | Redirect stub → `/auth/login` (unlinked) |
| `/dashboard` | `app/dashboard/page.tsx` | ✗ | **Entire user workspace** (form + analysis + ledger + modals) |
| `/admin` | `app/admin/page.tsx` | ✗ | **Entire admin portal** (metrics + user mgmt) |
| `/profile` | `app/profile/page.tsx` | ✗ | Profile editing |
| `/api/analyze` | `app/api/analyze/route.ts` | POST | Forced `mockMode: true` |
| `/api/change-order` | `app/api/change-order/route.ts` | POST | Forced mock, **never called by UI** |

**7 pages · 3 meaningful routes.** No `/app/*` namespace, no project routes, no settings, no activity, no demo route.

## 3. Public Routes

`/`, `/auth/login`, `/auth/signup` (stub), `/landing` (stub). Landing/footer claim AWS Amplify + Cognito integration that does not exist in code.

## 4. User Routes (authenticated, non-admin)

`/dashboard`, `/profile`. Both wrapped in `ProtectedRoute` (client-side only). Navbar "Projects" → `/dashboard#projects` is a **dead anchor** (no `id="projects"` element exists).

## 5. Admin Routes

`/admin` only. Non-admins → 403 screen. Admins are **blocked from `/dashboard` and `/profile`** by the admin-isolation guard → **admins effectively have one usable page**. Admin Navbar links "Profile" (`/profile`), a **dead-end for admins**.

## 6. Current Authentication Flow

`AuthContext` is a **100% client-side mock**:

- Every fresh visitor is **silently auto-authenticated** as demo freelancer `Alex Morgan` (`localStorage` empty → `DEMO_USER_PROFILE`). `isAuthenticated === true` for everyone by default.
- `signIn(email, password, role)` **ignores the password**; selects ADMIN if `email.includes('admin')`.
- Emits fabricated token `mock_jwt_token_<userId>`; no Cognito SDK, no JWT validation, no network call.
- Sign-out does not survive refresh (falls back to demo user again).
- Cognito env vars exist in `.env.example` but are referenced nowhere in code.
- `/auth/signup` redirects to login; "accounts provisioned by admins" are in-memory only (lost on refresh).

## 7. Current Authorization Flow

- Only mechanism: `ProtectedRoute` component — pure client-side conditional rendering.
- **`allowedRoles` prop is declared but never checked** (dead code). Only `requiredRole`.
- Admin-isolation rule (`role === 'ADMIN' && requiredRole !== 'ADMIN'`) makes every generic protected route a dead-end for admins.
- No `middleware.ts`, no server-side enforcement, no ownership checks. `/api/analyze` accepts arbitrary POSTs.
- Role is read from editable `localStorage` → any user can set `role: "ADMIN"` and gain the admin UI.
- **Frontend is the only boundary; this is presentation, not security.**

## 8. Current API / Data Dependencies

- `POST /api/analyze` → parser → classifier (Bedrock OR mock keyword fallback) → deterministic cost math (`hours × rate`) → save to DynamoDB/mock → `{ projectId, summary }`. **Forced `mockMode: true` — Bedrock never hit from web app.**
- `POST /api/change-order` → backend generator — **exists but UI never calls it**; `ChangeOrderModal` builds email client-side.
- `VerifyLedgerItemRequest` contract + backend `verifyLedgerItem` exist; **no HTTP route, no UI call** — verify/reject is client-side only.
- Ledger persistence: DynamoDB (`scope-creep-ledger-projects-dev`, `scope-creep-ledger-items-dev`) or `globalThis` mock Maps. **No GET endpoints → previously analyzed projects cannot be reloaded.** "Projects" nav implies multi-project capability that does not exist.
- S3 storage util exists but is **not wired** into the analyze handler or any route.

## 9. Current Project Model

```ts
Project {
  id: string;
  userId?: string;
  name: string;
  clientName: string;
  freelancerRole?: FreelancerRole;
  originalScope: string;
  hourlyRate: number;
  currency: string;    // plain string, hardcoded 'USD', never surfaced
  createdAt: string;   // ISO
}
```

- `currency` is a loose `string`, hardcoded `'USD'` in exactly 2 places (analyze `handler.ts` + dashboard reconstruction), not in the request, not rendered, not user-configurable.
- No project status field, no project list/persistence UI, no owner enforcement in UI.

## 10. Current Currency / Rate Implementation

- **No `Currency` type**. Rate is a bare `number` (`hourlyRate`).
- All money display hardcodes `$` via template literals (`$690`, `$6,840`, `/hr`).
- `AdminMetrics` shows **hardcoded fake KPIs** (14 projects / 61 creep items / $6,840).
- No currency formatting helper. Currency is effectively a dead field.

## 11. Current Theme Implementation

- CSS variables exist in `globals.css` but **6 of 11 are dead code** (declared, never consumed).
- **Critical bug: `darkMode: 'class'` is NOT set in `tailwind.config.js`** → all ~100 `dark:` usages respond to OS `prefers-color-scheme`, **not** the app toggle. The toggle only affects a handful of CSS custom properties → split-brain rendering.
- `layout.tsx` hardcodes `className="dark"` and `bg-[#0b0f19]` on `<html>`/`<body>` → light users get a dark flash; body is always dark.
- `ScopePanel`, `ReviewModal`, `ProtectedRoute` are **hardcoded dark-only** (no light styles).
- `brand` Tailwind palette defined but never used; `brand-500` === `brand-600` (copy/paste bug).
- JetBrains Mono loaded but not wired into Tailwind `fontFamily`.
- `animate-fadeIn` used in 4 places but **no `@keyframes` defined** — silent no-op.
- 5+ distinct input styles, 4+ distinct primary-button styles, mixed radii (`rounded-lg/xl/2xl/[10px]`), inconsistent shadows.

## 12. Current Reusable Components

`Navbar`, `AppLayout`, `ProjectForm`, `ScopePanel`, `LedgerPanel`, `ScopeAnalyticsChart`, `ReviewModal`, `ChangeOrderModal`, `ProtectedRoute`, `AdminMetrics`, `UserManagementTable` (+ dead `Header` re-export).

- No design-system primitives (Button/Input/Card/Badge/etc.)
- No `CurrencySelector`, `EmptyState`, `ErrorState`, `Skeleton`, `ActivityTimeline`.

## 13. Broken / Conflicting Routes

1. Dead anchor `/dashboard#projects`.
2. Admin Profile dead-end (Navbar link vs. guard).
3. `/landing` and `/auth/signup` — unlinked redirect stubs with render flash.
4. Nav highlight mismatch — `/profile` passes `activeTab="settings"` (matches no item).
5. "Open Demo Workspace" / "Launch Interactive Demo" route to `/dashboard`, which only works because every visitor is auto-authenticated. **No isolated demo route; demo is indistinguishable from the real workspace.**
6. Mobile: nav links `hidden md:flex`, no hamburger → **no navigation on small screens**.
7. Entire user workspace is a single route (`/dashboard`).

## 14. UI Problems

- Split-brain theme (see §11) — worst systemic issue.
- 3 modals (Review/ChangeOrder/CreateUser) lack `role="dialog"`, focus trap, Escape handling, aria labels.
- 5+ input patterns, inconsistent buttons/radii/shadows.
- Role buttons no `aria-pressed`; dropzone no keyboard support; table no `<caption>`/`<th scope>`.
- Hardcoded demo data in production chrome: "Alex Morgan" fallbacks, "Best regards, Alex" change-order sign-off, sample prefills in `ProjectForm`, fake admin stats.
- `alert()` used for analysis errors.
- `h-4 h-4` icon width typo in Navbar brand (missing `w-4`).

## 15. Security Concerns

1. No server-side auth/authz anywhere — guards are client-side rendering.
2. Role in editable `localStorage` → admin UI exposure.
3. `/api/analyze` unauthenticated + no ownership check, accepts arbitrary POSTs.
4. No ownership scoping on DynamoDB reads (no GET yet, but unpaved).
5. Fabricated JWT presented as a real session.
6. No `userId` binding on project creation.

## 16. What Can Be Preserved (Working Backend)

- **Services**: `analyze` (parser + classifier + deterministic ledger build), `ledger` (save/get/verify/totals), `change-order` (email generator) — all tested, dual AWS/mock fallback.
- **`shared/types`** — clean single source of truth; needs small extensions (currency, project status, user preferences), not a rewrite.
- **`/api/analyze` contract** — functional; keep `mockMode` fallback for hackathon.
- **`/api/change-order` contract** — functional backend; should be re-wired so the UI consumes it.
- **`verifyLedgerItem`** — exists; needs an HTTP route + UI wiring.
- **Bedrock prompts & JSON schemas**, sample thread, CloudWatch logger, S3 storage util.
- **Deterministic math principle** (`hours × rate` in code only) — preserve religiously.

## 17. What Should Be Rebuilt

- **Entire route architecture** — map onto `/app/*` + `/admin/*` model.
- **Auth layer** — real sign-in gate; no silent auto-login; isolated authenticated demo account; honest "demo session" instead of fake JWT.
- **Design system from scratch** — semantic tokens → Tailwind token classes → shared UI primitives.
- **AppShell / AdminShell** — sidebar-based layouts.
- **File upload** — staging → review → confirm (multi-file, removable, additive).
- **Project workspace** — `[projectId]` tabs (overview/scope/conversations/analysis/ledger/change-orders/activity).
- **Currency** — user default + project currency + locale formatting; no hardcoded `$`.
- **Profile/Settings, Activity, Admin user/project/usage pages** — new.
- **Loading/empty/error states, modals, confirmation dialogs** — new primitives.
- **Data/UI separation** — hooks + service layer; currency/format helpers.

## 18. Proposed Final Route Tree

```
/                        Landing (public)
/sign-in                 Sign In (public)
/request-access          Request Access (public)
/app                     redirect → /app/dashboard
  /dashboard
  /projects
    /new
    /[projectId]
      /overview  /scope  /conversations  /analysis  /ledger  /change-orders  /activity
  /analysis/new
  /activity
  /settings
    /profile  /preferences
/admin                   redirect → /admin/dashboard
  /dashboard  /users  /users/[userId]  /projects  /activity  /usage  /settings
```

- Demo: authenticated demo **USER** account (Option A). "Open Demo Workspace" signs in as demo user → `/app/dashboard` with a persistent Demo Mode banner. **Never routes to `/admin`.**
- Normal user hitting `/admin/*` → Access Denied / redirect to user dashboard. Direct URL access tested.

## 19. Proposed Component / Design-System Structure

```
components/ui/      Button Input Textarea Select Card Badge Tabs Table Dialog
                    Dropdown Tooltip Skeleton EmptyState ErrorState Spinner Avatar
components/layout/  AppShell AdminShell SidebarItem Topbar
components/         PublicNavbar SignInForm MetricCard ProjectCard ProjectTabs
                    FileUploader AttachmentList AnalysisProgress LedgerItemCard
                    LedgerTable EvidencePanel CurrencySelector ActivityTimeline
                    ConfirmDialog
hooks/              useProjects useProject useAnalysis useActivity
lib/                currency.ts api.ts constants.ts
```

- `globals.css` rebuilt as semantic tokens (`background`, `foreground`, `card`, `muted`, `border`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`) with `darkMode: 'class'`.

## 20. Recommended Implementation Sequence

1. Route architecture — new `/app/*`, `/admin/*`, `/sign-in`, `/request-access`; remove dead stubs.
2. Design system — semantic tokens, UI primitives, both themes.
3. App shells — user + admin sidebar layouts.
4. Landing + auth + demo account.
5. Dashboard + projects list (real data via new GET endpoints).
6. Project workspace tabs + original scope view.
7. File upload staging.
8. Analysis progress UI.
9. Ledger + evidence + `/api/ledger/verify` wiring.
10. Currency (user default + project + locale formatting).
11. Profile & preferences.
12. Activity timeline + events.
13. Admin workspace (separate shell, real aggregates).
14. API additions (`GET /api/projects`, verify, currency through analyze).
15. QA: routes/roles/themes/currency/build/e2e.

---

## Locked Decisions (from product owner, 2026-09-13)

- **Demo = authenticated demo user** (Option A): seeded `USER` demo account; Demo Mode banner; never admin.
- **MVP auth = clean mock auth**: no silent auto-login, real sign-in gate, honest "demo session" (no fake JWT claims), Cognito documented as production path only.
- **No new AWS resources** for this redesign.
- **Backend preserved**; only additive API surface (GET projects, verify, currency pass-through) using existing DynamoDB/mock patterns.