import { NextResponse } from 'next/server';
import { listProjects, getLedgerItems, calculateProjectTotals } from '../../../../../services/ledger/src/ledger-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get('userId') || undefined;
    const projects = await listProjects(userId);
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const items = await getLedgerItems(project.id, userId);
        const totals = await calculateProjectTotals(project.id, userId, items, project);
        return {
          ...project,
          totals,
          itemCount: items.length,
        };
      })
    );
    return NextResponse.json({ projects: enriched });
  } catch (err: any) {
    console.error('API GET /api/projects Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load projects.' },
      { status: 500 }
    );
  }
}