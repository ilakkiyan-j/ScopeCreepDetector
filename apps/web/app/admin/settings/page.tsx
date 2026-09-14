'use client';

import React, { useEffect, useState } from 'react';
import { Settings2, Server, ShieldCheck, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Table, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/PageHeader';

interface Info {
  mockMode: boolean;
  region: string;
  projectsTable: string | null;
  ledgerTable: string | null;
  version: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/info')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load deployment info.'))))
      .then(setInfo)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load deployment info.'));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Deployment configuration and workspace integrity." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> Deployment
          </CardTitle>
          <CardDescription>Read-only settings for the MVP environment.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          {!info && !error && <p className="text-sm text-muted-foreground">Loading…</p>}
          {info && (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Mode</TableCell>
                  <TableCell>
                    <Badge variant={info.mockMode ? 'warning' : 'success'}>
                      {info.mockMode ? 'Mock (no AWS credentials)' : 'DynamoDB live'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">AWS region</TableCell>
                  <TableCell className="text-muted-foreground">{info.region}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Projects table</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{info.projectsTable ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Ledger table</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{info.ledgerTable ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Version</TableCell>
                  <TableCell className="text-muted-foreground">{info.version}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Workspace integrity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <KeyRound className="mr-1.5 inline h-4 w-4 align-middle" />
            Signed-in as <strong className="text-foreground">{user?.email}</strong> ({user?.role}).
          </p>
          <p>
            The MVP uses a clear mock auth layer — no real JWT is minted. Demo and admin fixtures are
            re-derived on session load, so localStorage tampering cannot elevate privileges. Production
            authentication is targeted via Amazon Cognito (documented in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ai/ARCHITECTURE.md</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}