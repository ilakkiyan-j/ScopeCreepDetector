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
import { ChangeOrderResponse } from '@scope-creep-ledger/shared';

export default function ChangeOrdersPage() {
  const { project, ledgerItems, verifyItem } = useProjectWorkspace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChangeOrderResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateChangeOrder({ projectId: project.id, userId: user?.userId });
      setResponse(res);
      recordActivity({
        type: 'change_order_generated',
        projectId: project.id,
        projectName: project.name,
        message: `Change order generated for "${project.name}"`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate change order.');
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
      // fallback: select from textarea
    }
  };

  const verifiedItems = (ledgerItems ?? []).filter((i) => i.verificationStatus === 'verified');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Orders"
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
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              A change order includes every verified scope creep item. Rejected and unverified items
              are excluded.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">{verifiedItems.length} verified items</Badge>
              <Badge variant="secondary">{(ledgerItems ?? []).length - verifiedItems.length} other</Badge>
            </div>
          </div>

          <Button
            className="w-full sm:w-auto"
            loading={loading}
            onClick={generate}
          >
            Generate change order email
          </Button>

          {error && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change order email</CardTitle>
                  <CardDescription>
                    Subject: {response.emailSubject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={response.emailBody}
                      className="font-mono text-xs leading-relaxed min-h-[260px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={copyEmail}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <div className="rounded-md bg-info/10 px-3 py-2 text-xs text-muted-foreground">
                    <Info className="mr-1.5 inline h-3.5 w-3.5 align-middle text-info" />
                    Cost is derived in deterministic code: verified hours × project rate.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Itemized summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
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
                          <TableCell className="text-foreground">{row.title}</TableCell>
                          <TableCell className="text-muted-foreground">{row.date}</TableCell>
                          <TableCell className="text-right text-foreground">{row.hours}</TableCell>
                          <TableCell className="text-right font-medium text-success">
                            {formatMoney(row.cost || 0, project.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/20 font-semibold">
                        <TableCell colSpan={2} className="text-right text-foreground">Total</TableCell>
                        <TableCell className="text-right text-foreground">{response.totalHours || 0}</TableCell>
                        <TableCell className="text-right text-success">
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