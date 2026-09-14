import { NextResponse } from 'next/server';
import { saveActivity, listActivityEvents } from '../../../../../services/ledger/src/ledger-service';
import { ActivityEvent } from '@scope-creep-ledger/shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await listActivityEvents();
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('API GET /api/activity Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load activity events.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: ActivityEvent = await request.json();
    const event: ActivityEvent = {
      ...body,
      id: body.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: body.createdAt || new Date().toISOString(),
    };
    await saveActivity(event);
    return NextResponse.json({ ok: true, event });
  } catch (err: any) {
    console.error('API POST /api/activity Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to record activity event.' },
      { status: 500 }
    );
  }
}
