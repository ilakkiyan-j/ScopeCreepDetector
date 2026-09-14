---
name: frontend-design
description: Use when composing or polishing UI in this React/Next app: building new screens or sections, layout composition, visual hierarchy, spacing rhythm, and premium finish.
---

# Frontend Design

Compose screens from primitives and existing components first; invent new visuals only when the system cannot express it.

## Principles

- Build on the existing UI kit (`components/ui/*`, `Card`, `Badge`, `Button`, `Input`, etc.). Consistency beats one-off flair.
- One visual idea per screen. Groups of controls use the same vertical rhythm (`space-y-5`/`space-y-4` patterns already in the app).
- Use semantic Tailwind tokens (`bg-card`, `text-muted-foreground`, `border-border`) rather than inventing values per screen.
- Hierarchies: page-level h1 via `PageHeader`, card titles smaller and bolder, meta copy muted and small.

## Composition rules

- Alignment: fewer alignments look more premium. Grids align on consistent columns.
- Contrast of emphasis: primary action + one secondary + everything else quiet.
- Density: comfortable padding, but do not waste vertical space on important information screens.
- Icons: `lucide-react` only; use them as supporting glyphs, never as text substitutes.

## Checklist

- [ ] Matches existing spacing/token scales, no ad-hoc colors.
- [ ] Responsive at sm/lg breakpoints; no horizontal overflow (checked in QA).
- [ ] States covered: loading, empty, error, disabled, and success for every async action.