import { NextResponse } from 'next/server';
import { generateChangeOrderEmail, ChangeOrderError } from '../../../../../services/change-order/src/change-order-service';
import { ChangeOrderRequest } from '@scope-creep-ledger/shared';

const ERROR_STATUS: Record<ChangeOrderError['code'], number> = {
  PROJECT_NOT_FOUND: 404,
  NO_VERIFIED_ITEMS: 409,
  BEDROCK_ERROR: 502,
  MALFORMED_RESPONSE: 502,
};

export async function POST(request: Request) {
  try {
    const body: ChangeOrderRequest = await request.json();
    const result = await generateChangeOrderEmail(body);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/change-order Error:', err);
    const status = err instanceof ChangeOrderError ? ERROR_STATUS[err.code] : 400;
    return NextResponse.json(
      { error: err.message || 'Failed to generate change-order email.' },
      { status }
    );
  }
}