import { NextResponse } from 'next/server';
import { listProjects } from '../../../../../services/ledger/src/ledger-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get('userId') || undefined;
    const projects = await listProjects(userId);
    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('API GET /api/projects Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load projects.' },
      { status: 500 }
    );
  }
}