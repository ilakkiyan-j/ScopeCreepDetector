'use client';

import { Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const SignIn3DScene = dynamic(
  () => import('./SignIn3DScene').then((m) => m.SignIn3DScene),
  {
    ssr: false,
    loading: () => <FallbackPoster />,
  }
);

function FallbackPoster() {
  return (
    <div
      role="presentation"
      className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Concentric Glow Rings */}
        <div className="absolute inset-0 rounded-full border border-brand-accent/25 animate-ping opacity-20" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-4 rounded-full border border-primary/30 animate-pulse opacity-40" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-12 rounded-full border border-brand-accent/40 [transform:rotateX(65deg)] animate-spin opacity-50" style={{ animationDuration: '14s' }} />
        <div className="absolute inset-20 rounded-full border border-brand-ink/50 [transform:rotateY(65deg)] animate-spin opacity-50" style={{ animationDuration: '10s' }} />
        {/* Core Glowing Orb */}
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-brand-ink to-brand-accent shadow-glow opacity-80 blur-[1px] [transform:rotate(45deg)] animate-pulse" />
      </div>
    </div>
  );
}

class CanvasBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.warn('[3D Canvas Fallback Activated]:', error.message);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function SignIn3DCanvas({ className = '' }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <FallbackPoster />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <CanvasBoundary fallback={<FallbackPoster />}>
        <div className="absolute inset-0">
          <SignIn3DScene />
        </div>
      </CanvasBoundary>
    </div>
  );
}

export default SignIn3DCanvas;
