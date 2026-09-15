/**
 * Shared scroll bridge refs used by ImmersiveScrollDriver and landing elements
 * to track scroll progress, velocity, and active narrative act without causing
 * React state re-render thrashing.
 */

export const scrollProgress = { current: 0 };
export const scrollVelocity = { current: 0 };
export const activeAct = { current: 0 };
