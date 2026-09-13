import { NextResponse } from 'next/server';

/**
 * Sanitized deployment info for the Admin → Settings page.
 * Never leaks secrets; only benign configuration flags.
 */
export async function GET() {
  const mockDynamo = process.env.MOCK_DYNAMODB === 'true' || !process.env.AWS_ACCESS_KEY_ID;

  return NextResponse.json({
    mockMode: mockDynamo,
    region: process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
    projectsTable: mockDynamo ? null : process.env.DYNAMODB_PROJECTS_TABLE || 'scope-creep-ledger-projects-dev',
    ledgerTable: mockDynamo ? null : process.env.DYNAMODB_LEDGER_TABLE || 'scope-creep-ledger-items-dev',
    railbreakerMode: 'demo',
    version: '1.0.0-mvp',
  });
}