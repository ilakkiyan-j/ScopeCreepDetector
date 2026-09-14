---
name: accessibility
description: Use when implementing or auditing keyboard support, focus management, contrast/color, reduced motion, ARIA roles, or semantic HTML in this app.
---

# Accessibility

Accessibility is a design decision in the same commit, not a cleanup pass.

## Semantics & structure

- One `<h1>` per page (via `PageHeader`); heading order skips no levels.
- Native controls first: real `<button>`, `<a href>`, `<label htmlFor>`, `<input>`, `<select>`. Do not swap in `div` click handlers without a role.
- Icons carry `aria-label` or `aria-hidden` + adjacent text; never rely on visual-only icons.
- Dialogs (`Dialog`) already trap focus and restore focus on close; keep behavior: Escape closes, `aria-modal`, overlay button `aria-label`. Do not regress the focus trap.
- Dropdown menus: `role="menu"` + `aria-expanded`/`aria-haspopup` on the trigger, as in `Dropdown.tsx`.

## Keyboard

- Every interaction reachable by Tab; no dead ends. Focus rings via `focus-visible:ring-*` stay visible.
- Tab in/out of modals wraps within the dialog; Shift+Tab exits at the top.
- Avoid focus stealing: effects must not call `.focus()` on a re-render that isn't a genuine open/close (see the dialog focus regression fix).

## Color & motion

- Use semantic tokens in `globals.css` — these define accessible contrast for both themes. Do not brighten muted text.
- Error/success text use `text-danger`/`text-success` tokens plus an icon or `role="alert"`; never color alone.
- Decorative animation is disabled under `prefers-reduced-motion`. Non-essential content never blinks.
- Never communicate state with color alone (% complete, verified/rejected badges already pair text with shape).

## Checklist

- [ ] Keyboard: full flow reachable, focus visible, no traps.
- [ ] Screen-reader labels on icon-only buttons and inputs.
- [ ] Reduced-motion safe; contrast relies on tokens.