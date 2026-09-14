import { NextResponse } from 'next/server';
import {
  getProject,
  getLedgerItems,
  calculateProjectTotals,
} from '../../../../../../services/ledger/src/ledger-service';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const userId = new URL(request.url).searchParams.get('userId') || undefined;
    const project = await getProject(projectId, userId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const [ledgerItems, totals] = await Promise.all([
      getLedgerItems(projectId, userId),
      calculateProjectTotals(projectId, userId),
    ]);

    return NextResponse.json({ project, ledgerItems, totals });
  } catch (err: any) {
    console.error('API GET /api/projects/[id] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load project.' },
      { status: 500 }
    );
  }
}