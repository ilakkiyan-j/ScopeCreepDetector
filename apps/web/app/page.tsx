'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronRight, Cloud, FileSearch, FileText, MessageSquareText, Moon, Scale, Sparkles, Sun, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { ALXOLogo } from '@/components/brand';
import { HeroScene } from '@/components/landing/HeroScene';
import { LedgerArtifact, ProcessArtifact, ValueArtifact } from '@/components/landing/LandingArtifacts';

const steps = [
  { number: '01', icon: MessageSquareText, title: 'Bring the thread', body: 'Upload the conversations where the work actually changed.' },
  { number: '02', icon: FileSearch, title: 'Find the drift', body: 'ALXO compares every request to the original agreement.' },
  { number: '03', icon: Scale, title: 'Verify the receipt', body: 'Review the evidence and refine the estimate with confidence.' },
  { number: '04', icon: FileText, title: 'Send with certainty', body: 'Turn verified work into a clear change order.' },
];

function DemoButton({ compact = false }: { compact?: boolean }) {
  const { signInDemo } = useAuth();
  const router = useRouter();
  const goDemo = () => { signInDemo(); router.push('/app/dashboard'); };
  return <Button size={compact ? 'sm' : 'lg'} onClick={goDemo} className={!compact ? 'shadow-glow' : undefined}><Zap className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> {compact ? 'Try the demo' : 'Open demo workspace'} {!compact && <ArrowRight className="h-4 w-4" />}</Button>;
}

function Navbar({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="ALXO home"><ALXOLogo size={29} /></Link>
        <nav className="ml-12 hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#flow" className="hover:text-foreground">The flow</a>
          <a href="#ledger" className="hover:text-foreground">The ledger</a>
          <a href="#value" className="hover:text-foreground">The value</a>
          <Link href="/aws-architecture" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-brand-accent transition-colors">
            <Cloud className="h-4 w-4 text-brand-accent animate-pulse-dot" /> AWS Architecture
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/sign-in" className="hidden px-3 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">Sign In</Link>
          <button type="button" onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <DemoButton compact />
        </div>
      </div>
    </header>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-info">{children}</p>; }

export default function LandingPage() {
  const { isDarkMode, toggleTheme } = useAuth();
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar isDark={isDarkMode} toggle={toggleTheme} />
      <main>
        <section className="relative isolate min-h-[680px] px-4 pb-16 pt-16 sm:px-6 lg:min-h-[760px] lg:px-8 lg:pt-24">
          <HeroScene />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-info/25 bg-background/65 px-3 py-1.5 text-xs font-semibold text-info backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Scope intelligence for independent teams
              </p>
              <Link href="/aws-architecture" className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-brand-accent hover:border-brand-accent hover:bg-card shadow-glow transition-all">
                <Cloud className="h-3.5 w-3.5 animate-pulse-dot" /> Live AWS Architecture Showcase →
              </Link>
            </div><h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Stop doing extra work for free.<br /><span className="bg-brand-gradient bg-clip-text text-transparent">Your agreement should too.</span></h1><p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">ALXO turns scattered client conversations into a calm, evidence-backed case for work that wasn’t part of the plan.</p><div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><DemoButton /><Link href="/request-access"><Button variant="outline" size="lg">Request access <ArrowRight className="h-4 w-4" /></Button></Link></div><p className="mt-4 text-xs text-muted-foreground">No credit card · Demo data is ready to explore</p></div><div className="relative z-10 mx-auto mt-16 grid max-w-3xl grid-cols-3 border-y border-border/80 bg-background/35 py-5 text-center text-xs backdrop-blur sm:text-sm"><div><strong className="block">Every request</strong><span className="text-muted-foreground">linked to source</span></div><div><strong className="block">Every number</strong><span className="text-muted-foreground">calculated in code</span></div><div><strong className="block">Every ask</strong><span className="text-muted-foreground">ready to send</span></div></div></section>

    <section id="flow" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"><div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><Eyebrow>Chapter 01 · the flow</Eyebrow><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">From client chat to billing evidence — a conversation becomes a system.</h2><p className="mt-5 max-w-lg leading-7 text-muted-foreground">Your client thread is no longer a flat pile of messages. It becomes a dimensional map of what was agreed, requested, and worth addressing.</p></div><ProcessArtifact /></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step) => { const Icon = step.icon; return <article key={step.number} className="group rounded-xl border border-border bg-card/75 p-5 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-card-hover [transform:perspective(900px)_rotateX(1deg)]"><div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{step.number}</span><Icon className="h-5 w-5 text-brand-accent" /></div><h3 className="mt-9 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p></article>; })}</div></section>

    <section id="ledger" className="relative border-y border-border bg-muted/30 px-4 py-24 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center"><LedgerArtifact /><div><Eyebrow>Chapter 02 · the evidence</Eyebrow><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">A ledger built on evidence, not vibes.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Each verified item holds the full story in one place: the client request, the original agreement, the reasoning, and its real impact.</p><div className="mt-7 space-y-3">{['Source-linked client request', 'Original scope kept visible', 'Hours and value calculated deterministically'].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-medium"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div><Link href="/sign-in" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-brand-accent">See the evidence workspace <ChevronRight className="h-4 w-4" /></Link></div></div></section>

    <section id="value" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"><div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><Eyebrow>Chapter 03 · the value</Eyebrow><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Why it matters: protect the relationship, not just the margin.</h2><p className="mt-5 max-w-lg leading-7 text-muted-foreground">Scope creep rarely needs a confrontation. It needs a record that is precise, fair, and easy to act on while the details still matter.</p><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">Clearer client conversations</span><span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">Defensible change orders</span></div></div><ValueArtifact /></div></section>

    <section className="px-4 pb-24 sm:px-6 lg:px-8"><div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand-accent/30 bg-card px-6 py-16 text-center shadow-card-hover sm:px-12"><div className="absolute inset-0 bg-brand-radial opacity-80" /><div className="relative"><Eyebrow>Draw the line with confidence</Eyebrow><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Stop letting valuable work disappear into the thread.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Open the demo and see what a defensible scope conversation feels like.</p><div className="mt-8"><DemoButton /></div></div></div></section>
  </main>
  <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row"><ALXOLogo size={22} /><p>© {new Date().getFullYear()} ALXO · Catch the work hiding between the lines.</p><div className="flex items-center gap-4"><Link href="/aws-architecture" className="hover:text-primary font-medium">AWS Architecture Showcase</Link><Link href="/request-access" className="hover:text-foreground">Request access</Link></div></div></footer>
</div>
  );
}
