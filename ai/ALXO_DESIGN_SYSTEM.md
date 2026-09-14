# ALXO — Design System

> Status: **Phases 3–5 live** (tokens, primitives, brand mark, motif, workspace redesign)
> → **Phase 6 done** (landing 3D hero + fallbacks). This document is the source of
> truth for how ALXO looks, feels, and restrains itself.

## 1. Brand

- **Name**: ALXO
- **Tagline**: "Catch the work hiding between the lines."
- **Mark**: the **X** — a requested change crossing the original agreement. One
  stroke in the surface color, one stroke in the electric accent (cyan).

### Brand line / concept

Every ALXO insight is an X: new work drawn over the original scope. But the X must
stay subtle — it signals "something changed," not "something's wrong."

## 2. Color

Tokens live in `apps/web/app/globals.css` as RGB channel triplets and are consumed
through `tailwind.config.js`. **Never hardcode hex/colors in components** — always
use token classes (`bg-primary`, `text-muted-foreground`, `brand-accent`, …).

### Semantic tokens (light / dark)

| Token             | Light                       | Dark                          | Role |
| ----------------- | --------------------------- | ----------------------------- | ---- |
| `background`      | `248 250 252` (slate-50)    | `11 17 32` (slate-950)        | Page canvas. Dark is a deep ink, not neutral grey. |
| `foreground`      | `15 23 42` (slate-900)      | `241 245 249` (slate-100)     | Primary text |
| `card`            | `255 255 255`               | `15 23 42` (slate-900)        | Surfaces. Sits one step off the dark canvas. |
| `popover`         | `255 255 255`               | `15 23 42`                    | Menus/dialogs |
| `primary`         | `67 56 202` (indigo-700)    | `124 92 248` (indigo-400)     | **ALXO ink** — interactive emphasis |
| `secondary`       | `241 245 249`               | `51 65 85`                    | Mild fills |
| `muted`           | `241 245 249`               | `51 65 85`                    | Hover/track backgrounds |
| `muted-foreground`| `100 116 139` (slate-500)   | `148 163 184` (slate-400)     | Meta/secondary text |
| `accent`          | `207 250 254` (cyan-100)    | `8 51 68` (cyan-950)          | Subtle cyan-tinted highlight |
| `accent-foreground`| `14 116 144` (cyan-800)    | `103 232 249` (cyan-300)      | Text on accent |
| `border`          | `226 232 240`               | `30 41 59`                    | Hairlines |
| `input`           | `226 232 240`               | `51 65 85`                    | Field borders |
| `ring`            | `67 56 202`                 | `124 92 248`                  | Focus rings |

### Brand tokens (motif + gradients)

| Token          | Light                   | Dark                   | Role |
| -------------- | ----------------------- | ---------------------- | ---- |
| `brand-ink`    | `67 56 202` (indigo-700)| `124 92 248` (indigo-400) | Gradient start, X strokes |
| `brand-accent` | `6 182 212` (cyan-500)  | `34 211 238` (cyan-400)  | Electric accent — X stroke, gradient end |

### Status tokens (kept separate & distinct — do NOT fold into brand)

`success` (emerald), `warning` (amber), `danger` (rose), `info` (sky). These carry
meaning, never branding. Badges, alerts, and diff views use them.

### Usage rules

- Primary text never sits on `brand-accent`.
- `brand-accent` is for strokes, dots, gradients, focus glows — small moments.
- The ink primary does the heavy lifting; cyan is the garnish.
- Gradients: `bg-brand-gradient` (135° ink→cyan) for the logo tile and feature
  moments; `bg-brand-radial` for ambient page washes.
- `shadow-glow` for cyan accent rings (focus or selection of a highlighted X).

## 3. Typography

- **Body / UI**: Inter (weights 300–800) — `font-sans`.
- **Data / evidence**: JetBrains Mono (400, 500) — `font-mono`. Reserved for
  amounts, message excerpts, technical fields.
- Display headlines stay Inter at heavier weights (`font-bold` + `tracking-tight`)
  — no novelty display face; the brand voice comes from density and the X mark.
- Scale (Tailwind defaults ensure consistency):

  | Purpose        | Class                                 |
  | -------------- | ------------------------------------- |
  | Meta/labels    | `text-xs` uppercase `tracking-wider`  |
  | Body           | `text-sm`                              |
  | Card titles    | `text-base font-semibold` (`CardTitle`) |
  | Page headings  | `text-xl`/`text-2xl font-bold tracking-tight` (`PageHeader`) |
  | Hero (landing) | `text-4xl`–`text-6xl font-bold tracking-tight` |

- Wordmark: `tracking-[0.18em]` — letterspaced for a technical-precision feel.

## 4. Spacing & radius

- Layout scale: Tailwind `4px` grid (space-1…space-10). Page max-width `max-w-7xl`.
- Radii: cards/panels `rounded-xl` (0.75rem), dialogs `rounded-2xl` (1rem),
  inputs/buttons/badges `rounded-lg` (0.5rem).
- Surfaces: hairlines `border-border`; subtle elevation `shadow-card`, hover
  `shadow-card-hover`.

## 5. Motif — usage rules (important)

**The X is the brand's signature and must be used sparingly.**

- **`ALXOGlyph`** — the tile mark. Allowed: workspace shell, landing nav, sign-in,
  request-access, onboarding, empty states. Never decorate with it haphazardly.
- **`XMark`** — the abstract large X (ghost + accent crossing). Allowed **only** as
  a backdrop in the landing hero and the sign-in backdrop. **Never inside the
  workspace UI.**
- One X per view is plenty. Two in the same view = noise.
- Respect `prefers-reduced-motion`: XMark is static; any future hero animation must
  disable under reduced motion.

## 6. Components

- Primitives: `components/ui/*` — Button, Card, Badge, Input, Label, Dialog,
  Select, Avatar, DropdownMenu, etc. Token-driven, `cn()`-joined classes.
- Brand: `components/brand/*` — `ALXOGlyph`, `ALXOLogo` (glyph + wordmark,
  marketing surfaces only), `XMark` (hero/sign-in backdrop only).
- Landing 3D: `components/landing/ScopeScene.tsx` (R3F island loading via
  `HeroScene.tsx`). Rules: mounts on `/` only, md+ viewport, no reduced motion;
  reads brand tokens from CSS variables at runtime (theme-switch true); dpr
  clamped `[1,2]`; unmounts when scrolled offscreen (IntersectionObserver);
  WebGL failure falls back to the static `XMark` poster. Never inside the
  workspace.

## 7. Accessibility

- All text pairs hit WCAG AA (white on indigo-400 in dark mode is reserved for
  large/bold button labels only).
- Focus rings everywhere via `--ring`; visible on light + dark.
- Motion reduced globally in `@layer base` (`prefers-reduced-motion`).
- Selection: `selection:bg-primary/25 selection:text-foreground`.

## 8. How to extend

1. Add a value to `:root` and `.dark` in `globals.css` (RGB triplets).
2. Surface it in `tailwind.config.js` (under `colors`, `backgroundImage`,
   `boxShadow`, etc.).
3. Consume via generated classes only. No raw `style={{ color: '#…' }}` in
   components.