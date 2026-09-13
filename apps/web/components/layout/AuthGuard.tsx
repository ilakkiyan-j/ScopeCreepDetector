'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';

/**
 * Presentation-level route guard for MVP auth.
 *
 * This is NOT the security boundary — the backend must enforce access in
 * production (see ai/ARCHITECTURE.md). It keeps the UI honest: unauthenticated
 * visitors are sent to /sign-in, admins are kept out of the user workspace,
 * and normal users are kept out of the admin console.
 */
export function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname ?? '/app/dashboard')}`);
      return;
    }

    if (requireAdmin && role !== 'ADMIN') {
      // Normal user hits an admin route → redirect to the user dashboard.
      router.replace('/app/dashboard');
      return;
    }

    if (!requireAdmin && role === 'ADMIN') {
      // Admin hits a user route → redirect to the admin console.
      router.replace('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, role, requireAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your workspace..." />
      </div>
    );
  }

  const allowed = isAuthenticated && (requireAdmin ? role === 'ADMIN' : role === 'USER');
  if (!allowed) {
    // Redirect will fire via effect; render nothing to avoid a flash.
    return null;
  }

  return <>{children}</>;
}