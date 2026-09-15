'use client';

import React, { useState } from 'react';
import { FileText, Loader2, Copy, Check, Info } from 'lucide-react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { recordActivity } from '@/lib/activity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Textarea, EmptyState, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { formatMoney } from '@/lib/currency';
import { PageHeader } from '@/components/PageHeader';
import { ChangeOrderResponse, LedgerItem } from '@scope-creep-ledger/shared';

export default function ChangeOrdersPage() {
  const { project, ledgerItems, verifyItem } = useProjectWorkspace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChangeOrderResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!project) return null;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateChangeOrder({
        projectId: project.id,
        userId: user?.userId,
        customNote: customNote,
        fallbackProject: project,
        fallbackLedgerItems: ledgerItems ?? undefined,
      });
      setResponse(res);
      recordActivity({
        type: 'change_order_generated',
        message: `Generated Change Order for ${project.name}: ${formatMoney(res.totalCost, project.currency)} (${res.totalHours} hrs)`,
        projectId: project.id,
        projectName: project.name,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate change order.');
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    if (!response) return;
    const text = `Subject: ${response.emailSubject}\n\n${response.emailBody}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const verifiedItems = (ledgerItems ?? []).filter((i: LedgerItem) => i.verificationStatus === 'verified');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Order Studio"
        description="Generate a ready-to-send change order from verified scope items only."
      />
      {verifiedItems.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No verified items to include"
          description="Verify scope items in the Ledger tab first. Only verified items are included in the change order."
        />
      ) : (
        <>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{verifiedItems.length} verified item{verifiedItems.length === 1 ? '' : 's'}</Badge>
                    <Badge variant="secondary">{(ledgerItems ?? []).length - verifiedItems.length} excluded</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only verified new-ask items are included. Excludes unverified and rejected requests.
                  </p>
                </div>
                <Button
                  loading={loading}
                  onClick={generate}
                >
                  <FileText className="h-4 w-4" />
                  {response ? 'Regenerate Change Order' : 'Generate Change Order'}
                </Button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <label htmlFor="customNote" className="text-xs font-semibold text-foreground">
                  Optional Custom Note to Client
                </label>
                <Textarea
                  id="customNote"
                  rows={2}
                  placeholder="e.g. Please review by Friday so we can keep the launch timeline on schedule."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          {response && (
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
              <Card className="flex flex-col shadow-card">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Change Order Email
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-sm">
                        <span className="font-semibold text-foreground">Subject:</span> {response.emailSubject}
                      </p>
                    </div>
                    <Button
                      variant={copied ? 'success' : 'outline'}
                      size="sm"
                      onClick={copyEmail}
                      className="gap-1.5 transition-all shadow-xs"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-success-foreground" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied to Clipboard' : 'Copy Email'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 pt-4">
                  <div className="relative group">
                    <Textarea
                      readOnly
                      value={response.emailBody}
                      className="font-mono text-xs leading-relaxed min-h-[360px] resize-y bg-muted/30 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/30 p-4 rounded-xl shadow-inner text-foreground transition-all"
                      aria-label="Generated Change Order Email text"
                    />
                  </div>
                  <div className="rounded-xl border border-info/20 bg-info/10 px-3.5 py-2.5 text-xs text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 shrink-0 text-info" />
                      Deterministic cost calculation
                    </span>
                    <span className="font-mono font-semibold text-info">
                      {response.totalHours || 0} hrs × {project.currency} {project.hourlyRate}/hr
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Itemized Scope Receipt</CardTitle>
                  <CardDescription className="text-xs">
                    Itemized line items included in this change order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Item</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(response.itemizedSummary || []).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-foreground font-medium text-xs">{row.title}</TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{row.date}</TableCell>
                          <TableCell className="text-right text-foreground text-xs">{row.hours}</TableCell>
                          <TableCell className="text-right font-medium text-success text-xs whitespace-nowrap">
                            {formatMoney(row.cost || 0, project.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell colSpan={2} className="text-right text-foreground">Total Additional</TableCell>
                        <TableCell className="text-right text-foreground">{response.totalHours || 0} hrs</TableCell>
                        <TableCell className="text-right text-success text-sm">
                          {formatMoney(response.totalCost || 0, project.currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}