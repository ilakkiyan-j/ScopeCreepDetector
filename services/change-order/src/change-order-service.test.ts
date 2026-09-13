import { generateChangeOrderEmail } from './change-order-service';
import { saveProject, saveLedgerItems } from '../../ledger/src/ledger-service';
import { Project, LedgerItem } from '../../../shared/types';

async function runChangeOrderTest() {
  console.log('--- Testing Change-Order Email Generation Service ---');

  const projectId = 'proj_change_order_test_001';

  const testProject: Project = {
    id: projectId,
    name: 'Website Redesign',
    clientName: 'Acme Corp',
    originalScope: 'Redesign homepage and 3 pages. 1 revision. Budget: $2,000 at $60/hr.',
    hourlyRate: 60,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  };

  await saveProject(testProject);

  const items: LedgerItem[] = [
    {
      id: 'co_item_001',
      projectId,
      messageId: 'msg_005',
      timestamp: '04/03/2026',
      requester: 'Client',
      originalMessage: 'Add a login page for existing customers',
      classification: 'new-ask',
      reason: 'Login system excluded',
      estimatedHours: 3.0,
      estimatedCost: 180,
      confidence: 0.94,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co_item_002',
      projectId,
      messageId: 'msg_009',
      timestamp: '09/03/2026',
      requester: 'Client',
      originalMessage: 'Second revision round with color variations',
      classification: 'new-ask',
      reason: 'Extra revision',
      estimatedHours: 1.5,
      estimatedCost: 90,
      confidence: 0.91,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co_item_003',
      projectId,
      messageId: 'msg_011',
      timestamp: '12/03/2026',
      requester: 'Client',
      originalMessage: 'Custom standalone mobile layout',
      classification: 'new-ask',
      reason: 'Standalone mobile layout',
      estimatedHours: 2.5,
      estimatedCost: 150,
      confidence: 0.88,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co_item_004',
      projectId,
      messageId: 'msg_015',
      timestamp: '15/03/2026',
      requester: 'Client',
      originalMessage: 'Third revision round on copy and banners',
      classification: 'new-ask',
      reason: 'Extra revision',
      estimatedHours: 1.5,
      estimatedCost: 90,
      confidence: 0.95,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co_item_005',
      projectId,
      messageId: 'msg_016',
      timestamp: '18/03/2026',
      requester: 'Client',
      originalMessage: 'Dark mode version of logo',
      classification: 'new-ask',
      reason: 'New logo asset',
      estimatedHours: 1.0,
      estimatedCost: 60,
      confidence: 0.85,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'co_item_006',
      projectId,
      messageId: 'msg_017',
      timestamp: '20/03/2026',
      requester: 'Client',
      originalMessage: 'Google Analytics and Meta pixel setup',
      classification: 'new-ask',
      reason: 'Tracking integration',
      estimatedHours: 2.0,
      estimatedCost: 120,
      confidence: 0.92,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
  ];

  await saveLedgerItems(items);

  const response = await generateChangeOrderEmail(
    { projectId, customNote: 'Please review by Friday.' },
    { mockMode: true }
  );

  console.log(`Generated Subject: ${response.emailSubject}`);
  console.log('\nGenerated Email Body:\n');
  console.log(response.emailBody);

  console.log('\nItemized Receipts Count:', response.itemizedSummary.length);
  console.log('Total Hours:', response.totalHours);
  console.log('Total Cost:', response.totalCost);

  if (response.itemizedSummary.length !== 6) {
    console.error(`FAILED: Expected 6 itemized receipts, got ${response.itemizedSummary.length}`);
    process.exit(1);
  }

  if (response.totalHours !== 11.5 || response.totalCost !== 690) {
    console.error(`FAILED: Expected 11.5 hours / $690 cost, got ${response.totalHours} hrs / $${response.totalCost}`);
    process.exit(1);
  }

  console.log('\n✅ ALL CHANGE-ORDER SERVICE TESTS PASSED SUCCESSFULLY!');
}

runChangeOrderTest().catch((err) => {
  console.error('Change-order service test error:', err);
  process.exit(1);
});
