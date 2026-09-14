---
name: motion-design
description: Use when adding page transitions, micro-interactions, hover/active states, spinners, progress feedback, or loading animations in the app. Always honor prefers-reduced-motion.
---

# Motion Design

Motion should communicate state and hierarchy, not decorate. This app is React 18 + Tailwind with CSS keyframe utilities (`animate-fade-in`, `animate-fade-up`, `animate-slide-in`) already defined.

## Principles

- Purposeful: entrance, state change, or feedback — if it does none of those, cut it.
- Fast: 150-250ms for micro-interactions, up to 350ms for entrances. No marquee, no infinite bounce.
- Respect reduced motion: gate decorative CSS animations and disable them under `prefers-reduced-motion`. State-changing motion (spinners, progress) can stay but should not flash.
- Prefer existing keyframes (`animate-fade-in`, `animate-fade-up`, `animate-slide-in`) before adding new ones.
- Hover/active: subtle (color/scale/opacity), never layout-shifting.

## Patterns in this app

- Stage/async flows (analysis progress) animate step completion, not the whole layout.
- Modals/dialogs animate via the `Dialog` wrapper; do not animate dialog internals independently.
- Loading: `Spinner` with a label; skeletons for known card shapes.

## Checklist

- [ ] Duration <= 350ms unless it is a multi-step progress reveal.
- [ ] Motion is hidden under `prefers-reduced-motion`.
- [ ] No re-trigger on unrelated state change (no re-running entrance when a prop identity changes).