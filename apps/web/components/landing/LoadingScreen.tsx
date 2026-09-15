'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LINES = [
  'Initializing scene…',
  'Building intelligence graph…',
  'Compiling shaders…',
  'Almost ready…',
];

interface LoadingScreenProps {
  loaded: boolean;
}

export function LoadingScreen({ loaded }: LoadingScreenProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Cycle through status lines
  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const start = performance.now();
    const duration = 2800;
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out curve that slows near 90% until loaded
      const eased = loaded ? 1 : Math.min(t * 0.9 + Math.pow(t, 3) * 0.1, 0.92);
      setProgress(eased * 100);
      if (t < 1 && !loaded) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // Once loaded, snap to 100% then fade out
  useEffect(() => {
    if (!loaded) return;
    setProgress(100);
    const timeout = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeOut' } }}
          className="loading-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground select-none"
          aria-label="Loading experience"
          role="status"
        >
          {/* Background noise texture */}
          <div className="loading-bg-grid absolute inset-0 opacity-[0.03]" />

          {/* Glow orb behind logo */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(124,92,248,0.08) 50%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Logo mark — pulsing crystal shard SVG */}
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-8"
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="26,2 48,14 48,38 26,50 4,38 4,14"
                stroke="rgba(6,182,212,0.9)"
                strokeWidth="1.5"
                fill="rgba(6,182,212,0.06)"
              />
              <polygon
                points="26,10 40,18 40,34 26,42 12,34 12,18"
                stroke="rgba(124,92,248,0.7)"
                strokeWidth="1"
                fill="rgba(124,92,248,0.05)"
              />
              <circle cx="26" cy="26" r="4" fill="rgba(6,182,212,0.9)" />
            </svg>
          </motion.div>

          {/* Brand name */}
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-foreground/70">
            ALXO
          </p>

          {/* Cycling status line */}
          <div className="mb-8 h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center text-xs font-medium text-muted-foreground tracking-wide"
              >
                {STATUS_LINES[lineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div
            className="relative overflow-hidden rounded-full bg-muted border border-border/40"
            style={{ width: 160, height: 3 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-brand-accent shadow-glow"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
