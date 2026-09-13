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
- **Component Styling**: Use Tailwind CSS with semantic tokens for Light (`data-theme="light"`) and Dark (`className="dark"`) mode consistency.
- **Error Handling**: Return human-readable error messages to users while logging detailed errors safely to CloudWatch / console.

## 3. Testing & Verification Rules
- **No Declaration of Success Without Command Execution**: Run `npm test` or `npm run build` after changes and verify clean passing output before completing tasks.
- **Automated Test Coverage**:
  - Unit & Service: `npx tsx services/test-all.ts`
  - Playwright E2E & API: `npx playwright test`
