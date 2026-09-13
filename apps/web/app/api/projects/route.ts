import { NextResponse } from 'next/server';
import { listProjects } from '../../../../../services/ledger/src/ledger-service';

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('API GET /api/projects Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load projects.' },
      { status: 500 }
    );
  }
}