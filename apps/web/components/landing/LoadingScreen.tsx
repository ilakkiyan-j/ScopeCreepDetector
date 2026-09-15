'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALXOLogo } from '@/components/brand';

const STATUS_LINES = [
  'Initializing scope engine…',
  'Building intelligence graph…',
  'Connecting project threads…',
  'Ready to explore…',
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
    }, 850);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const start = performance.now();
    const duration = 2400;
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
  }, [loaded]);

  // Once loaded, snap to 100% then fade out
  useEffect(() => {
    if (!loaded) return;
    setProgress(100);
    const timeout = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="loading-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden"
          aria-label="Loading experience"
          role="status"
        >
          {/* Background grid texture */}
          <div className="loading-bg-grid absolute inset-0 opacity-[0.04]" />

          {/* Ambient radial glow orb behind logo */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.6, 0.85, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 380,
              height: 380,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, rgba(124,92,248,0.12) 45%, transparent 70%)',
              filter: 'blur(45px)',
            }}
          />

          {/* Animated Official ALXO Brand Logo Lockup */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{
              scale: [0.96, 1.04, 0.96],
              opacity: 1,
              y: 0,
            }}
            transition={{
              scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
            className="relative mb-6 flex flex-col items-center justify-center"
          >
            <ALXOLogo size={64} className="drop-shadow-2xl" />
          </motion.div>

          {/* Cycling status line */}
          <div className="mb-6 h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="text-center text-xs font-semibold text-muted-foreground tracking-wide"
              >
                {STATUS_LINES[lineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar container + % counter */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative overflow-hidden rounded-full bg-muted/80 border border-border/60 shadow-xs"
              style={{ width: 180, height: 4 }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-accent via-primary to-success shadow-glow"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-brand-accent">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
