'use client';

import { Component, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// ─── Static poster fallback ───────────────────────────────────────────────────

function Poster() {
  return (
    <div
      role="presentation"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {/* CSS glow orbs */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(124,92,248,0.07) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Abstract crystal wireframe poster */}
      <svg
        width="220"
        height="260"
        viewBox="0 0 220 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-40"
      >
        <polygon points="110,10 200,70 200,190 110,250 20,190 20,70" stroke="rgba(34,211,238,0.6)" strokeWidth="1" fill="rgba(34,211,238,0.04)" />
        <polygon points="110,45 175,90 175,175 110,220 45,175 45,90" stroke="rgba(124,92,248,0.5)" strokeWidth="1" fill="rgba(124,92,248,0.03)" />
        <circle cx="110" cy="130" r="6" fill="rgba(34,211,238,0.8)" />
        <line x1="110" y1="10" x2="110" y2="130" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
        <line x1="20" y1="70" x2="110" y2="130" stroke="rgba(124,92,248,0.3)" strokeWidth="0.5" />
        <line x1="200" y1="70" x2="110" y2="130" stroke="rgba(124,92,248,0.3)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ─── Dynamic import of WebGL scene ────────────────────────────────────────────

const ScopeScene = dynamic(
  () => import('./ScopeScene').then((m) => m.ScopeScene),
  { ssr: false, loading: () => <Poster /> }
);

// ─── Error boundary ───────────────────────────────────────────────────────────

class CanvasBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[ScopeScene] WebGL failed, using poster fallback:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// ─── HeroScene ────────────────────────────────────────────────────────────────

interface HeroSceneProps {
  scrollProgress: React.MutableRefObject<number>;
  onLoaded?: () => void;
}

export function HeroScene({ scrollProgress, onLoaded }: HeroSceneProps) {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Intersection observer to pause WebGL when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mouse parallax tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const showCanvas = inView && isDesktop && !reduced;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden"
    >
      {/* CSS ambient glow orbs — layered behind the canvas */}
      <div className="hero-glow-orb hero-glow-orb--cyan" />
      <div className="hero-glow-orb hero-glow-orb--indigo" />
      <div className="hero-glow-orb hero-glow-orb--violet" />

      {/* WebGL canvas layer — CSS filter simulates bloom glow */}
      <div
        className="absolute inset-0"
        style={{
          pointerEvents: 'none',
          filter: 'brightness(1.08) saturate(1.15) contrast(1.02)',
        }}
      >
        {showCanvas ? (
          <CanvasBoundary fallback={<Poster />}>
            <ScopeScene
              mouseRef={mouseRef}
              scrollProgress={scrollProgress}
              onLoaded={onLoaded}
            />
          </CanvasBoundary>
        ) : (
          <Poster />
        )}
      </div>

      {/* Bottom-to-top gradient scrim for text legibility */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/60 via-background/20 via-60% to-background/90" />
    </div>
  );
}
