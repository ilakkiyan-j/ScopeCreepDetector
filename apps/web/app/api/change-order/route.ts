import { NextResponse } from 'next/server';
import { generateChangeOrderEmail } from '../../../../../services/change-order/src/change-order-service';
import { ChangeOrderRequest } from '../../../../../shared/types';

export async function POST(request: Request) {
  try {
    const body: ChangeOrderRequest = await request.json();
    const result = await generateChangeOrderEmail(body, { mockMode: true });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/change-order Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate change-order email.' },
      { status: 400 }
    );
  }
}
