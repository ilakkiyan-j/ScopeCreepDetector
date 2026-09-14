---
name: product-design
description: Use when planning or reviewing the product's SaaS UX: information architecture, page hierarchy, navigation, route structure, onboarding, user flows, and admin/user role separation.
---

# Product Design

Focus on how the product is structured and navigated before any pixels move.

## Principles

- Separate concerns by audience: public landing, authenticated user workspace, admin console. Never mix them.
- Route layout = product hierarchy. Groups of pages that share chrome belong in a paired `layout.tsx`; leave the layout section to the workspace shell.
- Home a user where they act next: landing -> sign in -> workspace dashboard -> the primary action (new analysis).
- Keep routes honest: demo users stay in the user workspace; admins get the admin console. Guard redirects, never fake it.

## Checklist

- [ ] Each major flow has one clear entry point and one clear "what now" after completion.
- [ ] Page titles (h1) match the route's job; one h1 per page.
- [ ] Navigation reflects hierarchy, not a flat dump of every route.
- [ ] Empty states explain why the page is empty and what to do about it.
- [ ] Destructive or expensive actions require a confirm step before they run.
- [ ] New vs. existing entities reuse the same mental model (form -> result -> review).