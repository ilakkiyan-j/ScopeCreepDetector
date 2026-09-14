'use client';

import { useEffect, useState } from 'react';

const QUERY = '(min-width: 768px)';

/** Gated media query; the 3D scene only mounts on md+ viewports. */
export function useIsDesktop(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return matches;
}