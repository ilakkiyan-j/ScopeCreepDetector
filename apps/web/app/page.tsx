'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  Zap,
  Moon,
  Sun,
  FileSearch,
  MessageSquareText,
  Scale,
  Calculator,
  FileText,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { ALXOLogo } from '@/components/brand';
import { HeroScene } from '@/components/landing/HeroScene';

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Add your conversations',
    body: 'Upload client threads from WhatsApp, Slack, email, or CSV exports. Baseline scope and your rate are all you need to begin.',
  },
  {
    icon: FileSearch,
    title: 'AI isolates scope creep',
    body: 'Each message is classified against your original scope agreement. New requests are flagged with confidence and effort estimates — backed by the source message.',
  },
  {
    icon: Scale,
    title: 'Review the evidence',
    body: 'Low-confidence items go to your review queue. Approve, adjust hours, or reject with one click. Every ledger entry points back to its original message.',
  },
  {
    icon: Calculator,
    title: 'Know the real impact',
    body: 'Hours turn into currency through deterministic math — no AI-generated dollar figures, ever. See exactly what unbilled work added up to.',
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Evidence-first ledger',
    body: 'No vague AI verdicts. Every line item is backed by the exact client request, timestamp, and your baseline scope.',
  },
  {
    icon: Calculator,
    title: 'Deterministic financial math',
    body: 'Estimated hours are multiplied by your rate in code. The numbers you present are exact and auditable.',
  },
  {
    icon: Scale,
    title: 'Original scope preserved',
    body: 'Your agreement stays visible and separate from the conversation, so scope drift is measured against a fixed reference.',
  },
  {
    icon: ShieldCheck,
    title: 'Ready-to-send change orders',
    body: 'Generate a formal change-order email from verified items only — professional, itemized, and ready to send.',
  },
];

function PublicNavbar({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <ALXOLogo size={28} />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          <Link
            href="/request-access"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Request Access
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign In
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-1">
          <button
            type="button"
            onClick={onToggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <DemoButton variant="navbar" />
        </div>
      </div>
    </header>
  );
}

function DemoButton({ variant }: { variant: 'navbar' | 'hero' | 'cta' }) {
  const { signInDemo } = useAuth();
  const router = useRouter();

  const goDemo = () => {
    // Always switch to the isolated demo session — even when another account
    // is signed in — so the demo never runs under a real (or admin) identity.
    signInDemo();
    router.push('/app/dashboard');
  };

  if (variant === 'navbar') {
    return (
      <Button size="sm" onClick={goDemo}>
        <Zap className="h-4 w-4" /> Demo
      </Button>
    );
  }
  if (variant === 'hero') {
    return (
      <Button size="lg" onClick={goDemo}>
        <Zap className="h-4 w-4" /> Open Demo Workspace <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <Button size="lg" onClick={goDemo}>
      Open Demo Workspace <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-info">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {body && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{body}</p>}
    </div>
  );
}

export default function LandingPage() {
  const { isDarkMode, toggleTheme } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar isDark={isDarkMode} onToggle={toggleTheme} />

      {/* Hero */}
      <section className="relative px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <HeroScene />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs font-medium text-info">
            <ShieldCheck className="h-3.5 w-3.5" /> Evidence-backed scope accounting
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stop doing extra work for free.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            ALXO turns messy client conversations into an evidence-backed record of
            additional work, estimated impact, and actionable change orders.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DemoButton variant="hero" />
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In <LogIn className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From client chat to billing evidence in four steps"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Step {idx + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Preview */}
      <section className="border-y border-border bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Product preview"
            title="A ledger built on evidence, not vibes"
            body="Every scope-creep item shows the exact request, why it falls outside the original agreement, and what it is worth."
          />
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-left shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Acme Website</p>
                <p className="text-xs text-muted-foreground">ALXO ledger</p>
              </div>
              <span className="rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
                6 items · 11.5 additional hours
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { q: '"Can you add a login system?"', why: 'Backend was explicitly excluded from scope.', h: '3 hrs' },
                { q: '"Let\'s do a mobile-friendly version."', why: 'Separate deliverable not in the baseline.', h: '2 hrs' },
                { q: '"A few more rounds of changes."', why: 'Revision agreement covered one round only.', h: '4 hrs' },
              ].map((row, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">&ldquo;{row.q}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">{row.why}</p>
                  <p className="mt-2 text-xs font-semibold text-success">{row.h} estimated</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Tools that make unpaid work impossible to ignore"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feat.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-foreground">Why it matters</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Scope creep rarely shows up in an invoice — it shows up as late nights, resentful
            projects, and revenue you can&rsquo;t articulate. ALXO turns that invisible
            work into a clear, evidence-backed number you can act on.
          </p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left">
            {[
              'Every request traced to its source message',
              'Financial totals computed deterministically in code',
              'Change orders built from verified items only',
            ].map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Start auditing your client conversations
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Try the demo workspace right now, or request access for a provisioned account.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DemoButton variant="cta" />
            <Link href="/request-access">
              <Button variant="outline" size="lg">Request Access</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>ALXO · Catch the work hiding between the lines.</p>
      </footer>
    </div>
  );
}