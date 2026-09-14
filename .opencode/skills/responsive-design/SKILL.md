---
name: responsive-design
description: Use when implementing or reviewing desktop, tablet, and mobile layout behavior: breakpoint behavior, mobile navigation/drawer, touch targets, and content reflow.
---

# Responsive Design

Base layout is mobile-first, enhanced at `sm` (640px) and `lg` (1024px). Mobile uses a drawer shell; desktop uses a fixed sidebar. Verify both in QA.

## Conventions

- Workspace/admin shells: `WorkspaceShell` shows a fixed sidebar at `lg` and a slide-in drawer below it. Never render a second navigation for mobile — reuse the same nav definition.
- Cards and grids: use `grid-cols-1` then widen (`sm:grid-cols-2`, `lg:grid-cols-3`). Full-bleed tables wrap in an overflow-x container rather than shrinking columns to 0.
- Touch targets: interactive controls >= 40px tall (the `Input` h-9 / `Button` sizing already qualifies); avoid back-to-back links smaller than that.
- Text: do not scale font sizes down on mobile. Reduce padding/gutters, not legibility.

## Rules

- No horizontal overflow at 390px — use `min-w-0` / `overflow-x-auto` for intrinsic content, never `whitespace-nowrap` willy-nilly.
- Verify the three states QA checks: desktop 1440, mobile 390, dark + light.
- Anchored/absolute overlays (menus, dialogs) must fit the 390px viewport: dialogs cap with `max-w` and the app already centers with `p-4` gutters.

## Checklist

- [ ] Layout reflows at sm/lg correctly (sidebar vs. drawer).
- [ ] No scrollbar overflow on mobile; no clipped text.
- [ ] Touch targets and tap-to-open affordances obvious.