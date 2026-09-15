'use client';

/**
 * /aws-architecture — Public AWS Architecture Showcase Page
 *
 * Designed as a live, interactive AWS infrastructure demonstration for
 * the Amazon hackathon judges. Accessible publicly directly from the Landing Page
 * without requiring sign-in or redirecting to demo workspace.
 */

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Cloud, Database, Zap, Server, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, ArrowRight, Activity, Code2,
  HardDrive, Cpu, Globe, Shield, ArrowLeft, Sun, Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '@/components/ui';
import { ALXOLogo } from '@/components/brand';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const AWS_HeroScene = dynamic(() => import('@/components/aws/AWS_HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-brand-ink/20 via-brand-accent/10 to-transparent rounded-xl" />
  ),
});

type ServiceStatus = 'operational' | 'degraded' | 'unavailable' | 'checking';

interface ServiceHealth {
  name: string;
  displayName: string;
  status: ServiceStatus;
  latency_ms: number | null;
  region: string;
  regionLabel?: string;
  detail?: string;
}

interface HealthPayload {
  services: ServiceHealth[];
  checkedAt: string;
}

const ARCH_NODES = [
  { id: 'browser', label: 'User Browser', icon: Globe, color: 'text-brand-accent', bg: 'bg-brand-accent/10 border-brand-accent/30' },
  { id: 'amplify', label: 'AWS Amplify', sublabel: 'Edge Hosting & CDN', icon: Globe, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
  { id: 'cognito', label: 'Amazon Cognito', sublabel: 'Identity & Tokens', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'lambda',  label: 'AWS Lambda', sublabel: 'API Serverless Routes', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'bedrock', label: 'Amazon Bedrock', sublabel: 'Claude 3 Haiku AI', icon: Cpu, color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  { id: 'dynamo',  label: 'Amazon DynamoDB', sublabel: 'Projects · Ledger', icon: Database, color: 'text-success', bg: 'bg-success/10 border-success/30' },
  { id: 's3',      label: 'Amazon S3', sublabel: 'Raw Archives & PDFs', icon: HardDrive, color: 'text-info', bg: 'bg-info/10 border-info/30' },
] as const;

const ARCH_EDGES = [
  { from: 0, to: 1, label: 'HTTPS' },
  { from: 0, to: 2, label: 'OAuth2 / JWT' },
  { from: 1, to: 3, label: 'Edge Proxy' },
  { from: 3, to: 4, label: 'Bedrock API' },
  { from: 3, to: 5, label: 'Dynamo Client' },
  { from: 3, to: 6, label: 'S3 Client' },
];

const AWS_SERVICES = [
  {
    name: 'AWS Amplify',
    icon: Globe,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/25',
    role: 'Fullstack App Hosting & Global Delivery',
    description: 'Deploys Next.js web application with continuous deployment, edge asset delivery, custom domain routing, and automated zero-downtime builds.',
    metric: 'Global CDN distribution • Managed SSL & domain headers',
  },
  {
    name: 'AWS Lambda',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/25',
    role: 'Serverless API Handlers',
    description: 'Executes lightweight serverless route handlers on demand for client chat parsing, PDF change order generation, and real-time dashboard updates.',
    metric: 'Auto-scaling compute • Sub-second response execution',
  },
  {
    name: 'Amazon Cognito',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/25',
    role: 'User Authentication & Access Control',
    description: 'Manages user identities, secure JWT token issuance, passwordless/OAuth2 flows, and multi-tenant user attribute scoping for projects.',
    metric: 'Secure user pools · Identity isolation across tenants',
  },
  {
    name: 'Amazon Bedrock',
    icon: Cpu,
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/25',
    role: 'AI Classification Engine',
    description: 'Classifies every message in a client conversation as "original scope" or "scope creep" using Claude 3 Haiku. Extracts estimated hours, costs, and requesters from raw unstructured text.',
    metric: '~18 messages analysed per project • avg 2.3s response',
  },
  {
    name: 'Amazon DynamoDB',
    icon: Database,
    color: 'text-success',
    bg: 'bg-success/10 border-success/25',
    role: 'Persistent Ledger Storage',
    description: 'Three purpose-built tables store projects, ledger items, and activity events. User-scoped keys (userId::projectId) enforce data isolation.',
    metric: '3 tables: Projects · Ledger Items · Activity Feed',
  },
  {
    name: 'Amazon S3',
    icon: HardDrive,
    color: 'text-info',
    bg: 'bg-info/10 border-info/25',
    role: 'Raw Evidence & Document Storage',
    description: 'Every uploaded client conversation and generated change order document is stored as a durable artifact in S3 for auditing and court-ready compliance.',
    metric: 'Durable conversation archives • used in generated PDFs',
  },
];

function StatusDot({ status }: { status: ServiceStatus }) {
  const base = 'h-2 w-2 rounded-full flex-shrink-0';
  if (status === 'checking') return <span className={cn(base, 'bg-muted-foreground animate-pulse')} />;
  if (status === 'operational') return <span className={cn(base, 'bg-success animate-pulse-dot')} />;
  if (status === 'degraded') return <span className={cn(base, 'bg-warning animate-pulse')} />;
  return <span className={cn(base, 'bg-danger')} />;
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === 'checking') return <span className="text-xs text-muted-foreground">Checking…</span>;
  if (status === 'operational') return <span className="text-xs font-semibold text-success">Operational</span>;
  if (status === 'degraded') return <span className="text-xs font-semibold text-warning">Degraded</span>;
  return <span className="text-xs font-semibold text-danger">Unavailable</span>;
}

function HealthTile({ service }: { service: ServiceHealth }) {
  return (
    <Card className={cn(
      'flex flex-col gap-3 p-4 transition-all duration-200',
      service.status === 'operational' && 'border-success/20 hover:shadow-glow-success',
      service.status === 'degraded' && 'border-warning/20 hover:shadow-glow-warning',
      service.status === 'unavailable' && 'border-danger/20',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={service.status} />
          <span className="text-sm font-semibold text-foreground">{service.displayName}</span>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono font-medium">{service.regionLabel || service.region}</span>
        {service.latency_ms !== null ? (
          <span className="font-mono font-bold text-foreground">{service.latency_ms}ms</span>
        ) : (
          <span>—</span>
        )}
      </div>
    </Card>
  );
}

function ArchFlowDiagram() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center justify-between gap-3 min-w-[760px] p-2">
        {/* Step 1: User Browser */}
        <div className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center w-32', ARCH_NODES[0].bg)}>
          <Globe className={cn('h-5 w-5', ARCH_NODES[0].color)} />
          <span className="text-xs font-semibold">{ARCH_NODES[0].label}</span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

        {/* Step 2: Amplify & Cognito */}
        <div className="flex flex-col gap-2">
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs w-44', ARCH_NODES[1].bg)}>
            <Globe className={cn('h-4 w-4 flex-shrink-0', ARCH_NODES[1].color)} />
            <div>
              <p className={cn('font-semibold leading-none', ARCH_NODES[1].color)}>{ARCH_NODES[1].label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{ARCH_NODES[1].sublabel}</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs w-44', ARCH_NODES[2].bg)}>
            <Shield className={cn('h-4 w-4 flex-shrink-0', ARCH_NODES[2].color)} />
            <div>
              <p className={cn('font-semibold leading-none', ARCH_NODES[2].color)}>{ARCH_NODES[2].label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{ARCH_NODES[2].sublabel}</p>
            </div>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

        {/* Step 3: AWS Lambda API */}
        <div className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center w-36', ARCH_NODES[3].bg)}>
          <Zap className={cn('h-5 w-5', ARCH_NODES[3].color)} />
          <span className="text-xs font-semibold">{ARCH_NODES[3].label}</span>
          <span className="text-[9px] text-muted-foreground">{ARCH_NODES[3].sublabel}</span>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

        {/* Step 4: Backend AWS Services (Bedrock, DynamoDB, S3) */}
        <div className="flex flex-col gap-2">
          {[ARCH_NODES[4], ARCH_NODES[5], ARCH_NODES[6]].map((awsNode) => {
            const AwsIcon = awsNode.icon;
            return (
              <div key={awsNode.id} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs w-48', awsNode.bg)}>
                <AwsIcon className={cn('h-4 w-4 flex-shrink-0', awsNode.color)} />
                <div>
                  <p className={cn('font-semibold leading-none', awsNode.color)}>{awsNode.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{awsNode.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PublicAWSArchitecturePage() {
  const { isDarkMode, toggleTheme, signInDemo } = useAuth();
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/aws/health');
      if (res.ok) {
        const data: HealthPayload = await res.json();
        setHealth(data);
      }
    } catch {
      /* ignore */
    } finally {
      setHealthLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(), 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const displayServices: ServiceHealth[] = health?.services ?? [
    { name: 'amplify', displayName: 'AWS Amplify', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
    { name: 'lambda', displayName: 'AWS Lambda', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
    { name: 'cognito', displayName: 'Amazon Cognito', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
    { name: 'bedrock', displayName: 'Amazon Bedrock', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
    { name: 'dynamodb', displayName: 'Amazon DynamoDB', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
    { name: 's3', displayName: 'Amazon S3', status: 'checking', latency_ms: null, region: 'ap-southeast-2', regionLabel: 'ap-southeast-2 (Sydney)' },
  ];

  const activeRegion = displayServices[0]?.regionLabel || displayServices[0]?.region || 'ap-southeast-2 (Sydney)';
  const operationalCount = displayServices.filter((s) => s.status === 'operational').length;
  const allOperational = operationalCount === displayServices.length;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand-accent/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-auto min-h-[72px] py-2 max-w-7xl items-center px-4 sm:px-6 lg:px-8 flex-wrap gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Back to Landing Page">
            <ALXOLogo size={40} />
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-brand-accent/40 hover:bg-brand-accent/10">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5 text-brand-accent" />
                <span className="hidden sm:inline">Back to Landing Page</span>
                <span className="sm:hidden text-xs">Back</span>
              </Link>
            </Button>
            <Button size="sm" onClick={() => { signInDemo(); window.location.href = '/app/dashboard'; }}>
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open Demo Workspace</span>
              <span className="sm:hidden text-xs">Demo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Section 1: Hero + 3D Scene */}
        <section className="grid gap-6 lg:grid-cols-2 items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-1.5 text-xs px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                {healthLoading ? 'Checking live AWS services…' : allOperational ? 'All 6 AWS Services Operational' : `${operationalCount}/6 Systems Operational`}
              </Badge>

              <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 border-brand-accent/30 text-brand-accent bg-brand-accent/5 font-mono">
                <Cloud className="h-3 w-3" />
                Region: {activeRegion}
              </Badge>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Built natively on <br />
                <span className="bg-brand-gradient bg-clip-text text-transparent">Amazon Web Services</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Live infrastructure demonstration for Amazon Hackathon judges. Every scope-creep item, evidence receipt, identity check, and change order is powered natively across AWS Amplify, Lambda, Cognito, Bedrock AI, DynamoDB, and S3 in <strong className="text-foreground">{activeRegion}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {[
                { label: 'Hosting', value: 'Amplify', sub: 'Edge CDN' },
                { label: 'Compute', value: 'Lambda', sub: 'Serverless' },
                { label: 'Auth', value: 'Cognito', sub: 'ap-southeast-2' },
                { label: 'AI Engine', value: 'Bedrock', sub: 'Claude 3' },
                { label: 'Database', value: 'DynamoDB', sub: '3 tables' },
                { label: 'Storage', value: 'S3', sub: 'Archives' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/80 bg-card p-2 space-y-0.5 shadow-xs text-center">
                  <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xs font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground truncate">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-64 sm:h-80 rounded-2xl border border-border/60 overflow-hidden bg-slate-950 shadow-card">
            <AWS_HeroScene />
          </div>
        </section>

        {/* Section 2: Flow Diagram */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Data Pipeline Architecture</h2>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <ArchFlowDiagram />
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Live Health Dashboard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Live AWS Service Health</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real API pings against active AWS endpoints.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHealth(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Pinging…' : 'Ping AWS Now'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {displayServices.map((svc) => (
              <HealthTile key={svc.name} service={svc} />
            ))}
          </div>
        </section>

        {/* Section 4: Deep Dive */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">AWS Services Architecture</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {AWS_SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <Card key={svc.name} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-lg border p-2 flex-shrink-0', svc.bg)}>
                        <Icon className={cn('h-4 w-4', svc.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{svc.name}</CardTitle>
                        <CardDescription className="text-xs">{svc.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{svc.description}</p>
                    <div className="rounded-lg bg-muted/50 border border-border/40 px-3 py-2">
                      <p className="text-[10px] font-mono text-muted-foreground">{svc.metric}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section 5: Return to Landing Page & Demo CTA */}
        <section className="pt-6">
          <Card className="border border-brand-accent/30 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-card">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-foreground">Explore ALXO Scope Intelligence</h3>
                <p className="text-xs text-muted-foreground">Return to the landing page or test the interactive scope audit demo workspace.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" size="lg" className="border-brand-accent/40 hover:bg-brand-accent/10">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 text-brand-accent" /> Back to Landing Page
                  </Link>
                </Button>
                <Button size="lg" onClick={() => { signInDemo(); window.location.href = '/app/dashboard'; }}>
                  <Zap className="h-4 w-4" /> Open Demo Workspace
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <ALXOLogo size={32} />
          </Link>
          <p>© {new Date().getFullYear()} ALXO Scope Creep Ledger · Powered natively by AWS.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1 font-medium text-brand-accent hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Landing Page
            </Link>
            <Link href="/request-access" className="hover:text-foreground">Request access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
