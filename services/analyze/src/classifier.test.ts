import { parseConversation } from './parser';
import { classifyMessages } from './classifier';
import * as fs from 'fs';
import * as path from 'path';

async function runClassifierTest() {
  console.log('--- Testing Bedrock Classification Service & Review Logic ---');

  const samplePath = path.join(__dirname, '../../../sample-data/conversations/sample-whatsapp-redesign.txt');
  const rawText = fs.readFileSync(samplePath, 'utf-8');

  const originalScope = `
Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.
Budget: $2,000 at $60/hr.
Timeline: 2 weeks.
  `.trim();

  const messages = parseConversation(rawText);
  console.log(`Parsed ${messages.length} messages.`);

  const classifications = await classifyMessages(messages, originalScope, { mockMode: true });

  console.log(`Classified ${classifications.length} messages.`);

  // Filter new-ask items
  const newAsks = classifications.filter((c) => c.classification === 'new-ask');
  console.log(`\nDetected ${newAsks.length} Scope Expansion (new-ask) items:`);

  let totalHours = 0;
  newAsks.forEach((item, idx) => {
    const hours = item.estimatedHours || 0;
    totalHours += hours;
    const msg = messages.find((m) => m.id === item.messageId);
    console.log(`  ${idx + 1}. [${item.messageId}] ${msg?.content} -> ${hours} hrs (Confidence: ${item.confidence})`);
  });

  console.log(`\nTotal Estimated Additional Hours: ${totalHours} hrs`);

  // Verify demo target values
  if (newAsks.length !== 6) {
    console.error(`FAILED: Expected 6 scope expansion items, got ${newAsks.length}`);
    process.exit(1);
  }

  if (totalHours !== 11.5) {
    console.error(`FAILED: Expected 11.5 hours, got ${totalHours}`);
    process.exit(1);
  }

  // Check confidence threshold review flagging
  const lowConfidenceItems = classifications.filter((c) => c.confidence < 0.70);
  console.log(`\nLow Confidence Items (< 0.70) Flagged for Review: ${lowConfidenceItems.length}`);
  lowConfidenceItems.forEach((item) => {
    console.log(`  - [${item.messageId}] Confidence: ${item.confidence} | Reason: ${item.reason}`);
  });

  if (lowConfidenceItems.length === 0) {
    console.error('FAILED: Expected at least 1 low-confidence item flagged for review!');
    process.exit(1);
  }

  console.log('\n✅ ALL CLASSIFICATION SERVICE TESTS PASSED!');
}

runClassifierTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
