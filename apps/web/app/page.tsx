'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  FileSearch,
  FileText,
  MessageSquareText,
  Moon,
  Scale,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { ALXOLogo } from '@/components/brand';
import { HeroScene } from '@/components/landing/HeroScene';
import { LedgerArtifact, ProcessArtifact, ValueArtifact } from '@/components/landing/LandingArtifacts';
import { LoadingScreen } from '@/components/landing/LoadingScreen';
import { ShowcaseGrid } from '@/components/landing/ShowcaseGrid';
import { LenisProvider } from '@/components/landing/LenisProvider';

// ─── Step data ────────────────────────────────────────────────────────────────

const steps = [
  { number: '01', icon: MessageSquareText, title: 'Bring the thread', body: 'Upload the conversations where the work actually changed.' },
  { number: '02', icon: FileSearch, title: 'Find the drift', body: 'ALXO compares every request to the original agreement.' },
  { number: '03', icon: Scale, title: 'Verify the receipt', body: 'Review the evidence and refine the estimate with confidence.' },
  { number: '04', icon: FileText, title: 'Send with certainty', body: 'Turn verified work into a clear change order.' },
];

// ─── Animated CTA button ──────────────────────────────────────────────────────

function MagneticButton({
  children,
  className,
  onClick,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.22);
    y.set((e.clientY - cy) * 0.22);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      onClick={onClick}
      id={id}
    >
      {children}
    </motion.div>
  );
}

// ─── Demo button ──────────────────────────────────────────────────────────────

function DemoButton({ compact = false, id }: { compact?: boolean; id?: string }) {
  const { signInDemo } = useAuth();
  const router = useRouter();
  const goDemo = () => { signInDemo(); router.push('/app/dashboard'); };

  return (
    <MagneticButton id={id} onClick={goDemo}>
      <Button
        size={compact ? 'sm' : 'lg'}
        className={!compact ? 'shadow-glow group' : 'group'}
      >
        <Zap className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        Open Demo Workspace
        {!compact && (
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        )}
      </Button>
    </MagneticButton>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const { isDarkMode, toggleTheme } = useAuth();

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="ALXO home">
          <ALXOLogo size={44} />
        </Link>
        <nav className="ml-12 hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
          {[
            { href: '#flow', label: 'The flow' },
            { href: '#showcase', label: 'Showcase' },
            { href: '#ledger', label: 'The ledger' },
            { href: '#value', label: 'The value' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="relative py-1 hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brand-accent after:transition-all hover:after:w-full"
            >
              {label}
            </a>
          ))}
          <Link
            href="/aws-architecture"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-brand-accent transition-colors"
          >
            <Cloud className="h-4 w-4 text-brand-accent animate-pulse-dot" />
            AWS Architecture
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:block"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
          </button>
          <DemoButton compact id="nav-demo-btn" />
        </div>
      </div>
    </header>
  );
}

// ─── Scroll cue ───────────────────────────────────────────────────────────────

function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      aria-hidden="true"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-4 w-4 text-brand-accent/70" />
      </motion.div>
    </motion.div>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent">
      {children}
    </p>
  );
}

// ─── Section fade-in wrapper ──────────────────────────────────────────────────

function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const scrollProgress = useRef(0);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  const handleSceneLoaded = useCallback(() => {
    setSceneLoaded(true);
  }, []);

  return (
    <LenisProvider scrollProgress={scrollProgress}>
      {/* Branded loading screen */}
      <LoadingScreen loaded={sceneLoaded} />

      <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-200">
        <Navbar />

        <main>
          {/* ── Hero Section (full viewport) ─────────────────────── */}
          <section
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
            aria-label="Hero"
          >
            {/* 3D background scene + CSS glow orbs */}
            <HeroScene
              scrollProgress={scrollProgress}
              onLoaded={handleSceneLoaded}
            />

            {/* DOM content overlay */}
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-24 text-center sm:px-6 lg:px-8">
              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8 inline-flex flex-wrap items-center justify-center gap-2"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-brand-accent backdrop-blur shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Scope intelligence for independent teams
                </span>
                <Link
                  href="/aws-architecture"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-brand-accent hover:border-brand-accent hover:bg-card shadow-glow transition-all"
                >
                  <Cloud className="h-3.5 w-3.5 animate-pulse-dot" />
                  Live AWS Architecture Showcase →
                </Link>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-4xl text-5xl font-extrabold leading-[0.96] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl"
                data-gsap="hero-line"
              >
                Stop doing extra work for free.
                <br />
                <span className="bg-brand-gradient bg-clip-text text-transparent">
                  Your agreement should too.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
                data-gsap="hero-sub"
              >
                ALXO turns scattered client conversations into a calm, evidence-backed case for work that wasn't part of the plan.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.6 }}
                className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                data-gsap="hero-cta"
              >
                <DemoButton id="hero-demo-btn" />
                <MagneticButton>
                  <Link href="/request-access">
                    <Button
                      variant="outline"
                      size="lg"
                      className="group border-border/80 bg-card/60 text-foreground hover:bg-muted"
                    >
                      Request access
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </MagneticButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 text-xs text-muted-foreground"
              >
                No credit card · Demo data is ready to explore
              </motion.p>

              {/* Stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="mx-auto mt-16 grid max-w-3xl grid-cols-3 border-y border-border/80 bg-card/60 backdrop-blur-md py-5 text-center text-xs sm:text-sm"
              >
                <div>
                  <strong className="block text-foreground">Every request</strong>
                  <span className="text-muted-foreground">linked to source</span>
                </div>
                <div className="border-x border-border/80">
                  <strong className="block text-foreground">Every number</strong>
                  <span className="text-muted-foreground">calculated in code</span>
                </div>
                <div>
                  <strong className="block text-foreground">Every ask</strong>
                  <span className="text-muted-foreground">ready to send</span>
                </div>
              </motion.div>
            </div>

            {/* Scroll cue */}
            <ScrollCue />
          </section>

          {/* ── Section divider ──────────────────────────────────── */}
          <div className="section-rule" />

          {/* ── Flow Section ──────────────────────────────────────── */}
          <section id="flow" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <FadeInSection>
                <Eyebrow>Chapter 01 · the flow</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                  From client chat to billing evidence — a conversation becomes a system.
                </h2>
                <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
                  Your client thread is no longer a flat pile of messages. It becomes a dimensional map of what was agreed, requested, and worth addressing.
                </p>
              </FadeInSection>
              <FadeInSection delay={0.15}>
                <ProcessArtifact />
              </FadeInSection>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.article
                    key={step.number}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
                    className="group rounded-xl border border-border/80 bg-card/75 p-5 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-brand-accent/40 hover:shadow-card-hover [transform:perspective(900px)_rotateX(1deg)] backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
                      <Icon className="h-5 w-5 text-brand-accent" />
                    </div>
                    <h3 className="mt-9 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* ── Showcase Grid ─────────────────────────────────────── */}
          <div className="section-rule" />
          <ShowcaseGrid />

          {/* ── Ledger Section ────────────────────────────────────── */}
          <div className="section-rule" />
          <section
            id="ledger"
            className="relative border-y border-border/80 bg-muted/30 py-24"
          >
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
              <FadeInSection>
                <LedgerArtifact />
              </FadeInSection>
              <FadeInSection delay={0.15}>
                <Eyebrow>Chapter 02 · the evidence</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                  A ledger built on evidence, not vibes.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                  Each verified item holds the full story in one place: the client request, the original agreement, the reasoning, and its real impact.
                </p>
                <div className="mt-7 space-y-3">
                  {['Source-linked client request', 'Original scope kept visible', 'Hours and value calculated deterministically'].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <Link
                  href="/sign-in"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-brand-accent group"
                >
                  See the evidence workspace
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </FadeInSection>
            </div>
          </section>

          {/* ── Value Section ─────────────────────────────────────── */}
          <section id="value" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <FadeInSection>
                <Eyebrow>Chapter 03 · the value</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                  Why it matters: protect the relationship, not just the margin.
                </h2>
                <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
                  Scope creep rarely needs a confrontation. It needs a record that is precise, fair, and easy to act on while the details still matter.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Clearer client conversations', 'Defensible change orders'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </FadeInSection>
              <FadeInSection delay={0.15}>
                <ValueArtifact />
              </FadeInSection>
            </div>
          </section>

          {/* ── CTA Section ───────────────────────────────────────── */}
          <section className="px-4 pb-28 sm:px-6 lg:px-8">
            <FadeInSection>
              <div
                className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand-accent/30 bg-card/85 px-6 py-20 text-center sm:px-12 shadow-card backdrop-blur-md"
              >
                {/* Background gradient */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(60% 60% at 20% 10%, rgb(var(--brand-ink) / 0.15) 0%, transparent 70%)',
                  }}
                />
                <div className="relative">
                  <Eyebrow>Draw the line with confidence</Eyebrow>
                  <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                    Stop letting valuable work disappear into the thread.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
                    Open the demo and see what a defensible scope conversation feels like.
                  </p>
                  <div className="mt-8">
                    <DemoButton id="cta-demo-btn" />
                  </div>
                </div>
              </div>
            </FadeInSection>
          </section>
        </main>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-border/80 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
            <ALXOLogo size={32} />
            <p>© {new Date().getFullYear()} ALXO · Catch the work hiding between the lines.</p>
            <div className="flex items-center gap-4">
              <Link href="/aws-architecture" className="hover:text-foreground font-medium transition-colors">
                AWS Architecture Showcase
              </Link>
              <Link href="/request-access" className="hover:text-foreground transition-colors">
                Request access
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  );
}
