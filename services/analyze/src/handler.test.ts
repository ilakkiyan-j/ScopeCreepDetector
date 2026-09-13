import { handleAnalyzeRequest } from './handler';
import { AnalyzeRequest } from '../../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

async function runHandlerTest() {
  console.log('--- Testing Analyze Service Handler (End-to-End Pipeline) ---');

  const samplePath = path.join(__dirname, '../../../sample-data/conversations/sample-whatsapp-redesign.txt');
  const rawConversationText = fs.readFileSync(samplePath, 'utf-8');

  const request: AnalyzeRequest = {
    projectName: 'Website Redesign',
    clientName: 'Acme Corp',
    originalScope: `
Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.
Budget: $2,000 at $60/hr.
Timeline: 2 weeks.
    `.trim(),
    hourlyRate: 60,
    rawConversationText,
  };

  const response = await handleAnalyzeRequest(request, { mockMode: true });

  console.log('Analysis Response Summary:');
  console.log(`  Project ID: ${response.projectId}`);
  console.log(`  Total Messages Parsed: ${response.summary.totalMessagesParsed}`);
  console.log(`  Scope Creep Items: ${response.summary.totalScopeCreepItems}`);
  console.log(`  Total Additional Hours: ${response.summary.totalEstimatedHours} hrs`);
  console.log(`  Total Unbilled Cost: $${response.summary.totalEstimatedCost}`);
  console.log(`  Review Required Count: ${response.summary.reviewRequiredCount}`);

  console.log('\nClassifications Breakdown:');
  console.log(JSON.stringify(response.summary.classificationsCount, null, 2));

  console.log('\nDetected Ledger Receipts:');
  response.summary.ledgerItems.forEach((item, idx) => {
    console.log(
      `  ${idx + 1}. [${item.messageId}] ${item.requester}: "${item.originalMessage.substring(0, 45)}..." -> ${item.estimatedHours} hrs | $${item.estimatedCost} (${item.verificationStatus})`
    );
  });

  // Verification against core demo targets
  if (response.summary.totalMessagesParsed !== 18) {
    console.error(`FAILED: Expected 18 messages parsed, got ${response.summary.totalMessagesParsed}`);
    process.exit(1);
  }

  if (response.summary.totalScopeCreepItems !== 6) {
    console.error(`FAILED: Expected 6 scope creep items, got ${response.summary.totalScopeCreepItems}`);
    process.exit(1);
  }

  if (response.summary.totalEstimatedHours !== 11.5) {
    console.error(`FAILED: Expected 11.5 total additional hours, got ${response.summary.totalEstimatedHours}`);
    process.exit(1);
  }

  // Deterministic Cost Check: 11.5 hrs * $60/hr = $690
  if (response.summary.totalEstimatedCost !== 690) {
    console.error(`FAILED: Expected $690 unbilled cost, got $${response.summary.totalEstimatedCost}`);
    process.exit(1);
  }

  console.log('\n✅ ALL ANALYZE HANDLER PIPELINE TESTS PASSED SUCCESSFULLY!');
}

runHandlerTest().catch((err) => {
  console.error('Handler test error:', err);
  process.exit(1);
});
