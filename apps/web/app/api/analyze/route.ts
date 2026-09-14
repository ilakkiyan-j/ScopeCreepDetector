import { NextResponse } from 'next/server';
import { handleAnalyzeRequest } from '../../../../../services/analyze/src/handler';
import { AnalyzeRequest } from '@scope-creep-ledger/shared';

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();
    const result = await handleAnalyzeRequest(body);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/analyze Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze project conversation.' },
      { status: 400 }
    );
  }
}