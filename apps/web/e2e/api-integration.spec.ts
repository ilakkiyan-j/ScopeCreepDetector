import { test, expect } from '@playwright/test';

const SAMPLE_SCOPE = `Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.
Budget: $2,000 at $60/hr.`;

const SAMPLE_CHAT = `[01/03/2026, 09:15:22] Client: Hi Alex! Ready to kick off the website redesign project.
[04/03/2026, 11:30:15] Client: Oh, by the way, can you also add a login page for our existing customers?
[09/03/2026, 10:00:00] Client: We reviewed revision 1. Can we do a second revision round with different color variations?`;

test.describe('Backend API Integration Tests', () => {
  test('POST /api/analyze should process scope analysis and return project summary', async ({ request }) => {
    const payload = {
      projectName: 'API Test Project',
      clientName: 'Integration Client',
      freelancerRole: 'web-dev',
      hourlyRate: 60,
      originalScope: SAMPLE_SCOPE,
      rawConversationText: SAMPLE_CHAT,
    };

    const response = await request.post('/api/analyze', {
      data: payload,
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.projectId).toBeDefined();
    expect(data.summary).toBeDefined();
    expect(data.summary.ledgerItems.length).toBeGreaterThan(0);
    expect(data.summary.totalEstimatedCost).toBeGreaterThan(0);
  });

  test('POST /api/change-order should generate change order email response', async ({ request }) => {
    // 1. First analyze project to seed ledger items
    const analyzePayload = {
      projectName: 'Change Order Test Project',
      clientName: 'Enterprise Client',
      freelancerRole: 'web-dev',
      hourlyRate: 100,
      originalScope: SAMPLE_SCOPE,
      rawConversationText: SAMPLE_CHAT,
    };

    const analyzeRes = await request.post('/api/analyze', {
      data: analyzePayload,
    });
    expect(analyzeRes.ok()).toBeTruthy();
    const analyzeData = await analyzeRes.json();

    // 2. Generate Change Order for created project
    const changeOrderRes = await request.post('/api/change-order', {
      data: {
        projectId: analyzeData.projectId,
        customNote: 'Please review by Friday.',
      },
    });

    expect(changeOrderRes.ok()).toBeTruthy();
    const changeOrderData = await changeOrderRes.json();

    expect(changeOrderData.projectId).toBe(analyzeData.projectId);
    expect(changeOrderData.emailSubject).toContain('Change Order Request');
    expect(changeOrderData.totalCost).toBeGreaterThan(0);
    expect(changeOrderData.emailBody).toContain('Enterprise Client');
  });
});
