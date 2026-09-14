---
name: 3d-web-design
description: Use when building or tuning Three.js / React Three Fiber landing-page or hero experiences for this app. Guides scene setup, performance budgets, and graceful fallback.
---

# 3D Web Design

3D, when present, is a stage, not the feature. The product (scope-creep analysis dashboard) lives in the app; 3D belongs on marketing hero moments and must never block it.

## Adding 3D

- React Three Fiber (`@react-three/fiber` + `@react-three/drei`) with the Vite/Next App Router client component pattern: `'use client'`, mounted under a `dynamic(() => import(...), { ssr: false })` boundary so it never runs on the server.
- Render only the scene needed. No global lights/bumps that the product doesn't use.
- Canvas fills its container with `resize` and `dpr` clamped (`[1, 2]`); never pollute layout with fixed pixel canvas sizes.

## Design guidance

- One focal object; the camera and lighting tell the story. Dark, brand-tinted lighting that matches the design tokens.
- Subtle float/parallax on pointer move only over hero content; stop hands-on interaction when content is not in hero.
- Match hero motion to system motion design (150-350ms ease settlement, no constant motion).

## Fallback & accessibility

- Reduced-motion users get a static rendered state (poster/framebuffer still or gradient), not an idle spinning scene.
- Scene must not trap pointer/keyboard focus or cover interactive copy without a way out.
- Lazy-load the 3D chunk: hero text first, geometry after.

## Performance budget

- Target under ~40-60k triangles and ~2-4 draw calls for a hero; lower DPR + smaller FOV before reducing quality further.
- Pause or dispose the render loop when the canvas scrolls out of view or the tab is hidden.