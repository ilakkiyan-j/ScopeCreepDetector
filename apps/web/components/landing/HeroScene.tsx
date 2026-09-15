'use client';

import { Component, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// ─── Floating 3D Message Cards Component ──────────────────────────────────────

function FloatingMessageCards({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;
    const updateParallax = () => {
      setOffset({
        x: mouseRef.current.x * 14,
        y: mouseRef.current.y * 10,
      });
      animId = requestAnimationFrame(updateParallax);
    };
    animId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animId);
  }, [mouseRef]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Container wrapper with 3D perspective */}
      <div
        className="relative h-[480px] w-[1100px] max-w-[96vw] [perspective:1200px]"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0px)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Card 1: Left floating client chat request */}
        <motion.div
          animate={{ y: [-8, 8, -8], rotateY: [14, 18, 14], rotateX: [4, 8, 4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[2%] top-[12%] w-[320px] rounded-2xl border border-brand-accent/40 bg-card/85 p-4 shadow-card backdrop-blur-md hidden md:block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent font-bold text-xs">
                SC
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Sarah Chen (Client)</p>
                <p className="text-[10px] text-muted-foreground">Slack thread · 2:14 PM</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 font-mono text-[10px] font-medium text-brand-accent">
              New Request
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-foreground/90">
            “Can we add dark mode and responsive navbar to this phase as well?”
          </p>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground border-t border-border/40 pt-2">
            <span>Original scope: Light mode</span>
            <span className="font-semibold text-brand-accent">+6 hrs estimated</span>
          </div>
        </motion.div>

        {/* Card 2: Right floating scope creep ledger preview */}
        <motion.div
          animate={{ y: [10, -10, 10], rotateY: [-16, -12, -16], rotateX: [6, 2, 6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute right-[2%] top-[18%] w-[340px] rounded-2xl border border-primary/40 bg-card/90 p-4 shadow-card backdrop-blur-md hidden md:block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-foreground">ALXO Scope Ledger</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-success">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-muted/60 p-2 border border-border/50">
              <span className="text-foreground">Dark mode theme toggle</span>
              <span className="font-mono text-xs font-semibold text-primary">+$360.00</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/60 p-2 border border-border/50">
              <span className="text-foreground">Responsive mobile nav</span>
              <span className="font-mono text-xs font-semibold text-primary">+$180.00</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
            <span className="font-semibold text-muted-foreground">Recovered Scope Value</span>
            <span className="font-mono font-bold text-foreground text-sm">+$540.00</span>
          </div>
        </motion.div>

        {/* Card 3: Floating Scope Drift Alert Badge (Top Right) */}
        <motion.div
          animate={{ y: [-6, 6, -6], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute right-[18%] top-[5%] flex items-center gap-2.5 rounded-full border border-danger/40 bg-card/90 px-3.5 py-1.5 shadow-glow backdrop-blur-md hidden lg:flex"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-danger animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            Scope drift detected: <strong className="text-danger font-semibold">3 unbilled requests</strong>
          </span>
        </motion.div>

        {/* Card 4: Floating Source Thread Link Badge (Bottom Left) */}
        <motion.div
          animate={{ y: [6, -6, 6], scale: [1, 1.03, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute left-[12%] bottom-[8%] flex items-center gap-2.5 rounded-full border border-brand-accent/40 bg-card/90 px-3.5 py-1.5 shadow-card backdrop-blur-md hidden lg:flex"
        >
          <MessageSquare className="h-3.5 w-3.5 text-brand-accent" />
          <span className="text-xs font-medium text-foreground">
            Linked to thread: <strong className="text-brand-accent font-semibold">#project-client-chat</strong>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Dynamic import of WebGL particle background ─────────────────────────────

const ScopeScene = dynamic(
  () => import('./ScopeScene').then((m) => m.ScopeScene),
  { ssr: false, loading: () => null }
);

class CanvasBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[ScopeScene] WebGL failed:', error);
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

  // Intersection observer to pause rendering when off-screen
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
      {/* CSS ambient glow orbs */}
      <div className="hero-glow-orb hero-glow-orb--cyan" />
      <div className="hero-glow-orb hero-glow-orb--indigo" />
      <div className="hero-glow-orb hero-glow-orb--violet" />

      {/* WebGL particle background layer */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        {showCanvas && (
          <CanvasBoundary fallback={null}>
            <ScopeScene
              mouseRef={mouseRef}
              scrollProgress={scrollProgress}
              onLoaded={onLoaded}
            />
          </CanvasBoundary>
        )}
      </div>

      {/* Floating 3D Message Cards & Chat Thread Atlas */}
      <FloatingMessageCards mouseRef={mouseRef} />

      {/* Bottom-to-top gradient scrim for text legibility */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/60 via-background/20 via-60% to-background/90" />
    </div>
  );
}
