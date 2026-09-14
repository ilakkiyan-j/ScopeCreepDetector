import Link from 'next/link';
import { ALXOLogo } from '@/components/brand';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center text-foreground">
      <ALXOLogo size={40} className="mb-8" />
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
        404 · Lost in scope
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
        This page crossed the line.
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        The page you&rsquo;re looking for doesn&rsquo;t exist &mdash; or quietly drifted outside
        the original scope. Let&rsquo;s get you back on track.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button asChild>
          <Link href="/">Back to homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}