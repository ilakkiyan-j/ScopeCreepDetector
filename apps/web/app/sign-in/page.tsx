'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  LogIn,
  Zap,
  ShieldCheck,
  Lock,
  Mail,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Label } from '@/components/ui';
import { ALXOLogo, ALXOGlyph } from '@/components/brand';
import { SignIn3DCanvas } from '@/components/SignIn3DCanvas';

function SignInForm() {
  const { signIn, signInDemo, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3D Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, spotX: 50, spotY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;
    // -8 to +8 degrees rotation
    const rotX = (normY - 0.5) * -12;
    const rotY = (normX - 0.5) * 12;
    setTilt({ rotX, rotY, spotX: normX * 100, spotY: normY * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotX: 0, rotY: 0, spotX: 50, spotY: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.ok) {
        setError(result.error || 'Unable to sign in.');
        setIsSubmitting(false);
        return;
      }
      router.replace(next || '/app/dashboard');
    } catch {
      setError('Unable to sign in. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => {
    signInDemo();
    router.replace('/app/dashboard');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) scale3d(${isHovered ? 1.01 : 1}, ${isHovered ? 1.01 : 1}, 1)`,
        transition: isHovered
          ? 'transform 0.08s cubic-bezier(0.2, 0, 0.2, 1)'
          : 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
      }}
      className="relative w-full rounded-2xl border border-border/80 bg-card/75 p-6 shadow-2xl backdrop-blur-2xl transition-shadow duration-300 hover:shadow-glow sm:p-8 dark:border-white/10 dark:bg-card/70"
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.35 : 0,
          background: `radial-gradient(380px circle at ${tilt.spotX}% ${tilt.spotY}%, rgb(var(--brand-accent) / 0.5), transparent 80%)`,
        }}
      />

      {/* Header */}
      <div className="relative mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-brand-accent/40 bg-brand-accent/10 shadow-glow">
            <ALXOGlyph size={36} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-xs text-muted-foreground">Sign in to your scope audit ledger</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Encrypted
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="relative mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger animate-fade-in"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          {error}
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="relative space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-foreground">
            Account Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Forgot? Ask admin
            </span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10 text-sm"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="relative w-full overflow-hidden shadow-glow"
          loading={isSubmitting || isLoading}
        >
          <LogIn className="h-4 w-4" /> Sign In to Workspace
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border/80" />
        <span className="text-[11px] uppercase tracking-wider">or instant demo</span>
        <span className="h-px flex-1 bg-border/80" />
      </div>

      {/* Instant Demo & Request Actions */}
      <div className="relative space-y-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full border-brand-accent/40 bg-card/60 hover:bg-brand-accent/10"
          onClick={handleDemo}
        >
          <Zap className="h-4 w-4 text-brand-accent" /> Open Demo Workspace
        </Button>
        <Link
          href="/request-access"
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Request agency or enterprise access
        </Link>
      </div>

      {/* Security note */}
      <div className="mt-5 border-t border-border/60 pt-4 text-center">
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Cpu className="h-3 w-3 text-brand-accent" />
          Deterministic Scope Math · 256-bit Encrypted Session
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const { isDarkMode, toggleTheme } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Subtle background ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand-ink/15 blur-[120px] dark:bg-brand-ink/25" />
        <div className="absolute -right-[10%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-brand-accent/15 blur-[120px] dark:bg-brand-accent/20" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/60 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="ALXO home" className="transition-opacity hover:opacity-90">
            <ALXOLogo size={44} />
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Quantum Scope Vault v2.4</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Homepage</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">

          {/* Left Column: 3D Scene Showcase & Telemetry */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Tagline */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3.5 py-1.5 text-xs font-semibold text-brand-accent backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Stop Doing Extra Work For Free
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Deterministic Scope Auditing.{' '}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Every Billable Drift Caught.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              ALXO compares ongoing client communications directly to your signed agreement, calculating
              drift in code with source-linked receipts.
            </p>

            {/* Interactive 3D Canvas Showcase */}
            <div className="relative mt-6 h-[340px] w-full overflow-hidden rounded-2xl border border-border/80 bg-card/30 shadow-2xl backdrop-blur-sm sm:h-[400px] dark:border-white/10 dark:bg-card/20">
              <SignIn3DCanvas className="absolute inset-0" />

              {/* Floating 3D Telemetry Badges */}
              <div className="pointer-events-none absolute left-4 top-4 z-10 animate-float-slow">
                <div className="flex items-center gap-2.5 rounded-xl border border-brand-accent/40 bg-card/85 px-3 py-2 shadow-lg backdrop-blur-md dark:bg-card/80">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-accent/20 text-brand-accent">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Drift Detection Rate
                    </p>
                    <p className="text-xs font-bold text-foreground">99.8% Mathematical Precision</p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 z-10 animate-float-reverse">
                <div className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-card/85 px-3 py-2 shadow-lg backdrop-blur-md dark:bg-card/80">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Average Drift Recovered
                    </p>
                    <p className="text-xs font-bold text-foreground">+$42,850 / Project Cycle</p>
                  </div>
                </div>
              </div>

              {/* 3D Scene Interaction Hint */}
              <div className="pointer-events-none absolute bottom-3 left-4 z-10 hidden sm:block">
                <p className="rounded-md bg-background/70 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
                  Interactive 3D Vault · Move mouse to tilt · Click to surge
                </p>
              </div>
            </div>

            {/* Security Proof Points */}
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/80 pt-4 text-center">
              <div>
                <p className="text-xs font-bold text-foreground sm:text-sm">Deterministic</p>
                <p className="text-[11px] text-muted-foreground">Zero AI Hallucination</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground sm:text-sm">Source-Linked</p>
                <p className="text-[11px] text-muted-foreground">Evidence on Every Line</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground sm:text-sm">Ready to Send</p>
                <p className="text-[11px] text-muted-foreground">Instant Change Orders</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Tilt Sign-In Card */}
          <div className="flex justify-center lg:col-span-5">
            <div className="w-full max-w-md">
              <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-card" />}>
                <SignInForm />
              </Suspense>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ALXO Scope Creep Ledger · Catch the work hiding between the lines.</p>
      </footer>
    </div>
  );
}