import { test, expect } from '@playwright/test';

const SAMPLE_SCOPE = `Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.
Budget: $2,000 at $60/hr.`;

const SAMPLE_CHAT = `[01/03/2026, 09:15:22] Client: Hi Alex! Ready to kick off the website redesign project.
[04/03/2026, 11:30:15] Client: Oh, by the way, can you also add a login page for our existing customers?
[09/03/2026, 10:00:00] Client: We reviewed revision 1. Can we do a second revision round with different color variations?`;

test.describe('Backend API Integration E2E', () => {
  test('POST /api/analyze should honor project currency and return a deterministic summary', async ({ request }) => {
    const payload = {
      projectName: 'API Test Project',
      clientName: 'Integration Client',
      freelancerRole: 'web-dev',
      hourlyRate: 100,
      currency: 'INR',
      originalScope: SAMPLE_SCOPE,
      rawConversationText: SAMPLE_CHAT,
    };

    const response = await request.post('/api/analyze', { data: payload });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.projectId).toBeDefined();
    expect(data.summary).toBeDefined();
    expect(data.summary.ledgerItems.length).toBeGreaterThan(0);
    expect(data.summary.totalEstimatedCost).toBeGreaterThan(0);

    // Deterministic math: cost = hours * rate
    const item = data.summary.ledgerItems[0];
    expect(item.estimatedCost).toBe(item.estimatedHours * payload.hourlyRate);

    // The persisted project carries the requested currency
    const projectDetail = await request.get(`/api/projects/${data.projectId}`);
    expect(projectDetail.ok()).toBeTruthy();
    const detail = await projectDetail.json();
    expect(detail.project.currency).toBe('INR');
    expect(detail.ledgerItems.length).toBe(data.summary.ledgerItems.length);
    expect(detail.totals.totalCost).toBe(data.summary.totalEstimatedCost);
  });

  test('POST /api/ledger/verify should recompute totals after a reject', async ({ request }) => {
    const analyzeRes = await request.post('/api/analyze', {
      data: {
        projectName: 'Verify Test Project',
        clientName: 'Verify Client',
        freelancerRole: 'web-dev',
        hourlyRate: 100,
        currency: 'USD',
        originalScope: SAMPLE_SCOPE,
        rawConversationText: SAMPLE_CHAT,
      },
    });
    expect(analyzeRes.ok()).toBeTruthy();
    const analyzeData = await analyzeRes.json();

    const target = analyzeData.summary.ledgerItems.find((i: any) => i.verificationStatus === 'verified');
    expect(target).toBeDefined();

    const verifyRes = await request.post('/api/ledger/verify', {
      data: { projectId: analyzeData.projectId, ledgerItemId: target.id, action: 'reject' },
    });
    expect(verifyRes.ok()).toBeTruthy();
    const verifyData = await verifyRes.json();

    const expectedTotal = analyzeData.summary.totalEstimatedCost - target.estimatedCost;
    expect(verifyData.totals.totalCost).toBe(expectedTotal);
  });

  test('GET /api/projects should list stored projects newest first', async ({ request }) => {
    await request.post('/api/analyze', {
      data: {
        projectName: 'List Test Project',
        clientName: 'List Client',
        freelancerRole: 'web-dev',
        hourlyRate: 60,
        currency: 'EUR',
        originalScope: SAMPLE_SCOPE,
        rawConversationText: SAMPLE_CHAT,
      },
    });

    const res = await request.get('/api/projects');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.projects)).toBeTruthy();
    expect(data.projects.length).toBeGreaterThan(0);

    // Sorted descending by updatedAt/createdAt
    const times = data.projects.map((p: any) => new Date(p.updatedAt ?? p.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  test('POST /api/change-order should generate a change order for verified items only', async ({ request }) => {
    const analyzeRes = await request.post('/api/analyze', {
      data: {
        projectName: 'Change Order Test Project',
        clientName: 'Enterprise Client',
        freelancerRole: 'web-dev',
        hourlyRate: 100,
        currency: 'USD',
        originalScope: SAMPLE_SCOPE,
        rawConversationText: SAMPLE_CHAT,
      },
    });
    expect(analyzeRes.ok()).toBeTruthy();
    const analyzeData = await analyzeRes.json();

    const changeOrderRes = await request.post('/api/change-order', {
      data: { projectId: analyzeData.projectId, customNote: 'Please review by Friday.' },
    });
    expect(changeOrderRes.ok()).toBeTruthy();
    const changeOrderData = await changeOrderRes.json();

    expect(changeOrderData.projectId).toBe(analyzeData.projectId);
    expect(changeOrderData.emailSubject).toContain('Change Order Request');
    expect(changeOrderData.totalCost).toBeGreaterThan(0);
    expect(changeOrderData.emailBody).toContain('Enterprise Client');
  });
});