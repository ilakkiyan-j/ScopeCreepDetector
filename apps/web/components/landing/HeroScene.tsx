'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

function Poster() {
  return (
    <div
      role="presentation"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="pointer-events-none relative h-[300px] w-[500px] max-w-[94vw] opacity-60 sm:h-[360px] sm:w-[620px]">
        <div className="absolute left-[7%] top-[17%] h-[58%] w-[47%] rounded-2xl border border-brand-accent/30 bg-card/45 shadow-card backdrop-blur-sm [transform:perspective(700px)_rotateY(12deg)_rotateX(4deg)]">
          <span className="absolute left-7 top-8 h-2 w-24 rounded-full bg-foreground/40" />
          <span className="absolute left-7 top-14 h-1.5 w-40 rounded-full bg-muted-foreground/30" />
          <span className="absolute left-7 top-20 h-1.5 w-32 rounded-full bg-muted-foreground/20" />
          <span className="absolute bottom-7 left-7 h-7 w-24 rounded-md bg-primary/55" />
        </div>
        <span className="absolute left-[52%] top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-accent/60 bg-brand-accent/20 shadow-glow" />
        <div className="absolute right-[7%] top-[32%] h-[37%] w-[25%] rounded-xl border border-primary/40 bg-primary/20 shadow-card [transform:perspective(700px)_rotateY(-12deg)_rotateX(4deg)]">
          <span className="absolute left-5 top-6 h-1.5 w-16 rounded-full bg-primary-foreground/65" />
          <span className="absolute left-5 top-11 h-1 w-20 rounded-full bg-primary-foreground/35" />
          <span className="absolute bottom-5 left-5 h-3 w-12 rounded-sm bg-brand-accent/80" />
        </div>
      </div>
    </div>
  );
}

const ScopeScene = dynamic(() => import('./ScopeScene').then((m) => m.ScopeScene), {
  ssr: false,
  loading: () => <Poster />,
});

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: any) {
    console.warn('[R3F Canvas Warning] WebGL or Fiber initialization failed, rendering poster fallback:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function HeroScene() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showCanvas = inView && isDesktop && !reduced;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      {showCanvas ? (
        <CanvasBoundary fallback={<Poster />}>
          <div className="absolute inset-0">
            <ScopeScene />
          </div>
        </CanvasBoundary>
      ) : (
        <Poster />
      )}

      {/* Scrim: preserves hero-legibility over the scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/65 to-background" />
    </div>
  );
}
