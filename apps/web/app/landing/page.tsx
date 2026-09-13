'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-mono text-xs">
      Redirecting to Public SaaS Landing Page...
    </div>
  );
}
