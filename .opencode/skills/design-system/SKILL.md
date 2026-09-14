---
name: design-system
description: Use when creating or extending the design system: color and semantic tokens, typography scale, spacing, radii, and UI components. Ensures consistency with the existing Tailwind-based system.
---

# Design System

This app uses Tailwind CSS with semantic tokens defined in `tailwind.config.js` and mapped to CSS variables in `globals.css` (light + dark).

## Tokens first

- Colors: use semantic names (`bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-danger`, `text-success`, `text-warning`, `text-info`). Never hardcode hex in components.
- Theming: dark mode is a `.dark` class on `<html>`. New tokens must have both light and dark values.
- Typography: `text-xs` meta, `text-sm` body, `text-lg`/`font-semibold` card titles, `PageHeader` for page h1s. Ambition stays restrained.
- Radii/rounding: cards `rounded-lg`/`rounded-xl`, inputs/buttons `rounded-lg`, small controls `rounded-md`.
- Spacing: 4px base rhythm consistent with `space-y-*` utilities already used.

## Components

- Extend `components/ui/*` primitives when a behavior is reusable (dialog, select, badge). Add a new primitive under `components/ui/` with `cn()` + `forwardRef`, export from `index.ts`.
- Feature components live in `components/<feature>/` and compose primitives; they must not re-style primitives.
- No hardcoded Tailwind classNames duplicated across features when a primitive exists.

## Checklist

- [ ] Change touches both dark and light.
- [ ] Uses existing tokens; no literal colors.
- [ ] Reuses a primitive instead of copying markup.