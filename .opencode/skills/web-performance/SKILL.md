---
name: web-performance
description: Use when optimizing load time, bundle size, lazy loading, rendering/hydration, or 3D/WebGL performance in this Next.js app.
---

# Web Performance

Measure before and after. This app is Next 14.2 App Router on a monorepo workspace (`apps/web`); the "First Load JS" table printed by `npm run build` is the ground-truth signal.

## Loading & bundles

- Route-level code splitting is automatic in App Router — keep heavy features in their own routes, never import them from the root layout.
- Lazy-load anything off the critical path: `dynamic(() => import(...))` for 3D, charts, or rarely used modals.
- Do not preload every icon; `lucide-react` treeshakes, so import only used icons at call sites.
- Watch the build report: a jump in a route's First Load JS is a review blocker. Shared deps belong in the `shared/*` worktree, not duplicated per app.

## Rendering

- `'use client'` marks the boundary; keep components server-rendered unless they need hooks/events. Don't sprinkle `useState` where props suffice.
- Hydration: client providers must render the same tree as the server (the auth/theme hydration pattern in `AuthContext`). Any server/client mismatch forces full client re-render.
- Avoid effects that re-run destructively on unrelated state (the dialog focus regression) — they burn frames and break UX.

## 3D / WebGL budget

- Clamp canvas `dpr` to `[1, 2]`, cap triangle counts (`~40-60k` for heroes), and keep draw calls low.
- Dispose the render loop offscreen or on `visibilitychange`; never animate objects that left the viewport.
- Load the 3D chunk after hero text paints.

## Deliverables

- [ ] `npm run build` passes with no new First Load JS regression on the route changed.
- [ ] Heavy code is code-split; server renders where possible.
- [ ] No busy-wait effects on hot paths.