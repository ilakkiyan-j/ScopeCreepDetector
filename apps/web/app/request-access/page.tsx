'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '@/components/ui';
import { ALXOGlyph } from '@/components/brand';

export default function RequestAccessPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // MVP: accounts are provisioned by an administrator. For a production
    // deployment this form would submit to the admin/approval pipeline.
    setSubmitted(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <ALXOGlyph size={40} />
          <div>
            <h1 className="text-lg font-bold text-foreground">Request Access</h1>
            <p className="text-sm text-muted-foreground">ALXO</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get started with ALXO</CardTitle>
            <CardDescription>
              Accounts are provisioned by an administrator. Let us know who you are and we&rsquo;ll
              reach out about setting up your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
                <p className="font-semibold">Request received</p>
                <p className="mt-1 text-success/90">
                  Thank you. Your access request has been noted and an administrator will follow up
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="request-email">Work email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="request-email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Submit request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Homepage</Link>
        </div>
      </div>
    </main>
  );
}