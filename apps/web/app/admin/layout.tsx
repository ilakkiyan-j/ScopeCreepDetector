'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { AdminShell } from '@/components/layout/AdminShell';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAdmin>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}