import { NextResponse } from 'next/server';
import {
  verifyLedgerItem,
  calculateProjectTotals,
} from '../../../../../../services/ledger/src/ledger-service';
import { VerifyLedgerItemRequest } from '@scope-creep-ledger/shared';

export async function POST(request: Request) {
  try {
    const body: VerifyLedgerItemRequest = await request.json();

    if (!body.projectId || !body.ledgerItemId || !body.action) {
      return NextResponse.json(
        { error: 'projectId, ledgerItemId, and action are required.' },
        { status: 400 }
      );
    }

    await verifyLedgerItem(
      body.projectId,
      body.ledgerItemId,
      body.action,
      body.customEstimatedHours,
      body.userId
    );

    const totals = await calculateProjectTotals(body.projectId, body.userId);

    return NextResponse.json({ totals });
  } catch (err: any) {
    console.error('API POST /api/ledger/verify Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to verify ledger item.' },
      { status: 400 }
    );
  }
}