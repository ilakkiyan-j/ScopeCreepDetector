'use client';

/**
 * LenisProvider.tsx
 *
 * Initializes Lenis smooth-scroll, connects it to GSAP's ticker so
 * ScrollTrigger reads the virtual scroll position (not the raw DOM scroll).
 * Exposes a `scrollProgress` ref updated on every scroll tick.
 *
 * Usage: Wrap the landing page content. Pass the scrollProgress ref down
 * to the 3D scene for camera control.
 */

import { useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextValue {
  scrollProgress: React.MutableRefObject<number>;
}

const LenisContext = createContext<LenisContextValue>({
  scrollProgress: { current: 0 },
});

export function useLenisScroll() {
  return useContext(LenisContext);
}

interface LenisProviderProps {
  children: ReactNode;
  scrollProgress: React.MutableRefObject<number>;
}

export function LenisProvider({ children, scrollProgress }: LenisProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Update scroll progress ref
    lenis.on('scroll', ({ progress }: { progress: number }) => {
      scrollProgress.current = progress;
    });

    // Also make ScrollTrigger use Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, [scrollProgress]);

  return (
    <LenisContext.Provider value={{ scrollProgress }}>
      {children}
    </LenisContext.Provider>
  );
}
