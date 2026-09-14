'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Eye, EyeOff, LogIn, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Label } from '@/components/ui';
import { ALXOGlyph } from '@/components/brand';

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
      // Role-based routing handled by AuthGuard; go to the intended page or the
      // user workspace. Admins are steered to the admin console.
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
    <div className="glass-card w-full rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <ALXOGlyph size={40} />
        <div>
          <h1 className="text-lg font-bold text-card-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your scope audit workspace</p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-xs text-muted-foreground">
              Forgot password? Contact your administrator.
            </span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting || isLoading}>
          <LogIn className="h-4 w-4" /> Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Button variant="outline" size="lg" className="w-full" onClick={handleDemo}>
          <Zap className="h-4 w-4 text-primary" /> Open Demo Workspace
        </Button>
        <Link
          href="/request-access"
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ShieldCheck className="h-4 w-4" /> Request access
        </Link>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <div className="w-full max-w-sm">
          <SignInForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground underline underline-offset-2">
              Back to homepage
            </Link>
          </p>
        </div>
      </Suspense>
    </main>
  );
}

export default SignInPage;