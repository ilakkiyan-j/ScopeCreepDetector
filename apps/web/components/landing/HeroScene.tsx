'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { XMark } from '@/components/brand';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const ScopeScene = dynamic(() => import('./ScopeScene').then((m) => m.ScopeScene), {
  ssr: false,
  loading: () => null,
});

function Poster() {
  return (
    <div
      role="presentation"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 sm:h-[480px] sm:w-[480px]">
        <XMark size={480} strokeWidth={1.5} className="absolute inset-0 text-muted-foreground/15" />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent shadow-glow" />
      </div>
    </div>
  );
}

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
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
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/25 to-background" />
    </div>
  );
}