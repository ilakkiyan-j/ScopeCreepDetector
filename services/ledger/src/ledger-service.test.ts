import {
  saveProject,
  getProject,
  saveLedgerItems,
  getLedgerItems,
  verifyLedgerItem,
  calculateProjectTotals,
} from './ledger-service';
import { Project, LedgerItem } from '@scope-creep-ledger/shared';

async function runLedgerServiceTest() {
  console.log('--- Testing Scope Creep Ledger Persistence & Deterministic Math ---');

  const projectId = 'proj_test_001';

  const testProject: Project = {
    id: projectId,
    name: 'Website Redesign',
    clientName: 'Acme Corp',
    originalScope: 'Redesign homepage and 3 pages. 1 revision. $60/hr.',
    hourlyRate: 60,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  };

  // 1. Save & Fetch Project
  await saveProject(testProject);
  const fetchedProject = await getProject(projectId);
  console.log(`Saved Project: ${fetchedProject?.name} ($${fetchedProject?.hourlyRate}/hr)`);

  if (!fetchedProject || fetchedProject.id !== projectId) {
    console.error('FAILED: Project save/fetch failed!');
    process.exit(1);
  }

  // 2. Save Ledger Items (5 verified items, 1 review_required item)
  const items: LedgerItem[] = [
    {
      id: 'item_001',
      projectId,
      messageId: 'msg_005',
      timestamp: '04/03/2026',
      requester: 'Client',
      originalMessage: 'Add a login page',
      classification: 'new-ask',
      reason: 'Login not in scope',
      estimatedHours: 3.0,
      estimatedCost: 180, // 3 * 60
      confidence: 0.94,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item_002',
      projectId,
      messageId: 'msg_009',
      timestamp: '09/03/2026',
      requester: 'Client',
      originalMessage: 'Second revision round',
      classification: 'new-ask',
      reason: 'Exceeds 1 revision limit',
      estimatedHours: 1.5,
      estimatedCost: 90, // 1.5 * 60
      confidence: 0.91,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item_003',
      projectId,
      messageId: 'msg_011',
      timestamp: '12/03/2026',
      requester: 'Client',
      originalMessage: 'Standalone mobile layout',
      classification: 'new-ask',
      reason: 'Custom mobile layout',
      estimatedHours: 2.5,
      estimatedCost: 150, // 2.5 * 60
      confidence: 0.88,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item_004',
      projectId,
      messageId: 'msg_015',
      timestamp: '15/03/2026',
      requester: 'Client',
      originalMessage: 'Third revision round',
      classification: 'new-ask',
      reason: 'Exceeds 1 revision limit',
      estimatedHours: 1.5,
      estimatedCost: 90, // 1.5 * 60
      confidence: 0.95,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item_005',
      projectId,
      messageId: 'msg_016',
      timestamp: '18/03/2026',
      requester: 'Client',
      originalMessage: 'Dark mode logo',
      classification: 'new-ask',
      reason: 'New logo asset',
      estimatedHours: 1.0,
      estimatedCost: 60, // 1 * 60
      confidence: 0.85,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item_006',
      projectId,
      messageId: 'msg_017',
      timestamp: '20/03/2026',
      requester: 'Client',
      originalMessage: 'Google Analytics setup',
      classification: 'new-ask',
      reason: 'Analytics integration',
      estimatedHours: 2.0,
      estimatedCost: 120, // 2 * 60
      confidence: 0.55, // Low confidence
      verificationStatus: 'review_required',
      createdAt: new Date().toISOString(),
    },
  ];

  await saveLedgerItems(items);
  const fetchedItems = await getLedgerItems(projectId);
  console.log(`Saved ${fetchedItems.length} ledger items.`);

  // 3. Verify Initial Totals
  let totals = await calculateProjectTotals(projectId);
  console.log('\nInitial Verified Totals:');
  console.log(`  Verified Hours: ${totals.totalHours} hrs`);
  console.log(`  Verified Cost: $${totals.totalCost}`);
  console.log(`  Verified Items: ${totals.verifiedCount}`);
  console.log(`  Review Required Items: ${totals.reviewCount}`);

  // Initial verified: 3 + 1.5 + 2.5 + 1.5 + 1.0 = 9.5 hours ($570)
  if (totals.totalHours !== 9.5 || totals.totalCost !== 570) {
    console.error(`FAILED: Expected initial 9.5 hours / $570 cost, got ${totals.totalHours} hrs / $${totals.totalCost}`);
    process.exit(1);
  }

  // 4. Perform User Verification on Item 006 (Review Required -> Verified)
  console.log('\nUser Action: Verifying low-confidence Item 006 (Google Analytics)...');
  await verifyLedgerItem(projectId, 'item_006', 'verify');

  totals = await calculateProjectTotals(projectId);
  console.log('\nPost-Verification Totals:');
  console.log(`  Verified Hours: ${totals.totalHours} hrs`);
  console.log(`  Verified Cost: $${totals.totalCost}`);
  console.log(`  Verified Items: ${totals.verifiedCount}`);
  console.log(`  Review Required Items: ${totals.reviewCount}`);

  // Post-verification: 9.5 + 2.0 = 11.5 hours ($690)
  if (totals.totalHours !== 11.5 || totals.totalCost !== 690) {
    console.error(`FAILED: Expected post-verification 11.5 hours / $690 cost, got ${totals.totalHours} hrs / $${totals.totalCost}`);
    process.exit(1);
  }

  // 5. Test User Override (Changing estimated hours on Item 005 from 1.0 to 2.0 hrs)
  console.log('\nUser Action: Overriding Item 005 hours from 1.0 to 2.0 hrs...');
  await verifyLedgerItem(projectId, 'item_005', 'verify', 2.0);

  totals = await calculateProjectTotals(projectId);
  console.log('\nPost-Override Totals:');
  console.log(`  Verified Hours: ${totals.totalHours} hrs`);
  console.log(`  Verified Cost: $${totals.totalCost}`);

  // 11.5 + 1.0 extra = 12.5 hours ($750)
  if (totals.totalHours !== 12.5 || totals.totalCost !== 750) {
    console.error(`FAILED: Expected 12.5 hours / $750 cost, got ${totals.totalHours} hrs / $${totals.totalCost}`);
    process.exit(1);
  }

  console.log('\n✅ ALL LEDGER SERVICE & DETERMINISTIC MATH TESTS PASSED!');
}

runLedgerServiceTest().catch((err) => {
  console.error('Ledger service test error:', err);
  process.exit(1);
});
