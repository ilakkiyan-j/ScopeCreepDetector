import { NextResponse } from 'next/server';
import { saveProject, saveLedgerItems } from '../../../../../../services/ledger/src/ledger-service';
import { Project, LedgerItem } from '@scope-creep-ledger/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projects, ledgers, userId } = body as {
      projects?: Project[];
      ledgers?: Record<string, LedgerItem[]>;
      userId?: string;
    };

    let syncedProjectsCount = 0;
    let syncedItemsCount = 0;

    if (projects && Array.isArray(projects)) {
      for (const p of projects) {
        await saveProject(p, userId);
        syncedProjectsCount++;
      }
    }

    if (ledgers && typeof ledgers === 'object') {
      for (const [projectId, items] of Object.entries(ledgers)) {
        if (Array.isArray(items) && items.length > 0) {
          await saveLedgerItems(items, userId);
          syncedItemsCount += items.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      syncedProjectsCount,
      syncedItemsCount,
      message: `Successfully synced ${syncedProjectsCount} project(s) and ${syncedItemsCount} ledger item(s) to AWS DynamoDB.`,
    });
  } catch (err: any) {
    console.error('API POST /api/projects/sync Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sync local data with AWS Cloud storage.' },
      { status: 500 }
    );
  }
}
