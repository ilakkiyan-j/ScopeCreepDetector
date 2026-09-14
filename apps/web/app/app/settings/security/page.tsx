'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge } from '@/components/ui';

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function SecurityPage() {
  const { user, isDemo, session, signOut, changePassword } = useAuth();
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const submit = async () => {
    setSuccess(false);
    setError(null);

    if (!current || !next || !confirm) {
      setError('Fill in your current password, a new password, and the confirmation.');
      return;
    }
    if (next !== confirm) {
      setError('The new password and confirmation do not match.');
      return;
    }
    if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next)) {
      setError('The new password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);
    const result = await changePassword(current, next);
    setLoading(false);

    // Only report success when the change actually succeeded.
    if (result.ok) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setSuccess(true);
    } else {
      setError(result.error ?? 'Could not change the password.');
    }
  };

  const doSignOut = () => {
    signOut();
    router.push('/sign-in');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Change password
          </CardTitle>
          <CardDescription>
            {isDemo
              ? 'Demo sessions are read-only and cannot change their password.'
              : 'Your password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isDemo ? (
            <p className="text-sm text-muted-foreground">
              Sign in with your provisioned account to manage security settings.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sec-current">Current password</Label>
                <Input
                  id="sec-current"
                  type={show ? 'text' : 'password'}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-new">New password</Label>
                  <Input
                    id="sec-new"
                    type={show ? 'text' : 'password'}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-confirm">Confirm new password</Label>
                  <Input
                    id="sec-confirm"
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-danger">{error}</p>
              )}
              {success && (
                <p role="status" className="text-sm text-success">Password updated.</p>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={submit} loading={loading}>
                  Update password
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {show ? 'Hide' : 'Show'} passwords
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active session</CardTitle>
          <CardDescription>Signed-in sessions stay active for 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={isDemo ? 'warning' : 'success'}>
              {session?.mode === 'demo' ? 'Demo account' : 'Signed in'}
            </Badge>
            <span className="text-muted-foreground">{user.email}</span>
          </div>
          {session && (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Issued</dt>
                <dd className="mt-0.5 text-foreground">{formatDateTime(session.issuedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Expires</dt>
                <dd className="mt-0.5 text-foreground">{formatDateTime(session.expiresAt)}</dd>
              </div>
            </dl>
          )}
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={doSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}