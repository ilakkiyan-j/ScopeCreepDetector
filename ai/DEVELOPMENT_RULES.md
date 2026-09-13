# Development Rules & Standards — Scope Creep Ledger

## 1. Core Engineering Mandates
1. **Preserve Working Functionality**: Never rewrite existing working code unless necessary for feature integration. Extend or refactor incrementally.
2. **Never Guess Code Logic or Schemas**: Inspect source files directly before consuming functions, methods, or types.
3. **No Superficial Error Patching**: Trace failures to root causes instead of suppressing exceptions or returning dummy data.
4. **Deterministic Math Enforcement**: All cost arithmetic must happen in code. Never ask Bedrock to calculate financial totals.
5. **Least Privilege & AWS Security**: Never hardcode AWS keys, expose secrets in frontend code, or expose private S3 objects publicly.

## 2. Code Quality & Conventions
- **Language**: TypeScript with strict mode enabled.
- **Shared Types**: Use `shared/types/index.ts` as the single source of truth for domain models across frontend and backend.
- **Money**: Never hardcode a currency symbol (`$`, `₹`, etc.) in UI code or templates. Every monetary value must be rendered through `lib/currency.ts` `formatMoney(amount, currency)`. Store `amount` (number) + `currency` (code) separately — never a formatted string as source of truth.
- **Currency**: Never add currency codes from different projects as if they were equal amounts. Cross-currency admin aggregation must be shown grouped by currency (no fake FX conversion).
- **Theme**: All styling must use semantic tokens (`background`, `card`, `muted-foreground`, etc.). Never hardcode theme hex colors (`#0b0f19`, `bg-slate-900`, `dark:bg-[...]`) directly in components. Light/dark must share one component system via `darkMode: 'class'` + token classes.
- **Routing**: Every route has a purpose. Public / user / admin routes are strictly separated (`/`, `/app/*`, `/admin/*`). Demo workspace is an authenticated demo **user** experience and must NEVER route to `/admin`.
- **Demo separation**: `mock` data and `real` API data must be clearly separated. Never ship mock statistics as real user data.
- **No fake functionality**: Buttons that appear functional but do nothing are forbidden. Disable, mark unavailable, or remove.
- **Component Styling**: Use Tailwind CSS with semantic tokens for Light and Dark mode consistency.
- **Error Handling**: Return human-readable error messages to users while logging detailed errors safely to CloudWatch / console.

## 3. Testing & Verification Rules
- **No Declaration of Success Without Command Execution**: Run `npm test` or `npm run build` after changes and verify clean passing output before completing tasks.
- **Automated Test Coverage**:
  - Unit & Service: `npx tsx services/test-all.ts`
  - Playwright E2E & API: `npx playwright test`
- **Route/QA gate (every major route, before declaring done)**:
  - Checked in: Light mode, Dark mode, Desktop, Tablet, Mobile.
  - Checked for: routing, navigation, spacing, typography, contrast, cards, forms, tables, buttons, dialogs, loading, empty states, errors, currency display, authorization.
- **Currency QA gate**: verify user default currency flows into new projects, project can override currency, and ledger/change-order/dashboard all display the project currency. Changing currency must NOT convert the numeric rate (no FX).
- **Theme QA gate**: no component may look visually broken when switching themes; no random hard-coded theme colors remain.