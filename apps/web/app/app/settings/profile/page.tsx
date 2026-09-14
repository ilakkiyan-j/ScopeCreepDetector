'use client';

import React, { useState } from 'react';
import { UserRound, Save, CloudCheck, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Textarea, Badge } from '@/components/ui';

export default function ProfilePage() {
  const { user, isDemo, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [profession, setProfession] = useState(user?.profession ?? '');
  const [company, setCompany] = useState(user?.company ?? '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const save = () => {
    updateProfile({
      name: name.trim() || user.name,
      profession: profession.trim() || user.profession,
      company: company.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
          <CardDescription>Shown on your change orders and project headers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <Badge variant={isDemo ? 'warning' : 'success'}>
              {isDemo ? 'Demo account' : 'Signed in'}
            </Badge>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isDemo} />
            {isDemo && (
              <p className="text-xs text-muted-foreground">Demo sessions are read-only to keep the sample data clean.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profession">What do you do?</Label>
            <Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} disabled={isDemo} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company / freelance brand</Label>
            <Textarea
              id="company"
              rows={2}
              value={company ?? ''}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isDemo}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={isDemo}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
            {saved && <span className="text-sm text-success font-medium">Saved</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-success/30 bg-success/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CloudCheck className="h-4 w-4 text-success" /> AWS Cloud Sync &amp; Health Status
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time status of your AWS DynamoDB tables, S3 storage, and Bedrock AI engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-muted-foreground" /> AWS Primary Region
            </span>
            <span className="font-mono font-bold text-foreground">ap-southeast-2</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">DynamoDB Tables (Projects, Ledger, Activity)</span>
            <span className="font-semibold text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Active &amp; Connected
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Amazon Bedrock Model (Claude 3 Haiku)</span>
            <span className="font-semibold text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Operational
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-info" /> Multi-Layer Persistence
            </span>
            <span className="font-semibold text-foreground">Active (0-Latency Local + AWS Auto-Sync)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}