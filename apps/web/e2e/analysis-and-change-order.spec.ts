import { test, expect } from '@playwright/test';

test.describe('Analysis & Change Order Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should analyze scope and render financial ledger & analytics chart', async ({ page }) => {
    // Load benchmark demo thread
    await page.getByRole('button', { name: 'Load Benchmark Demo Thread' }).click();

    // Click Analyze button
    const analyzeBtn = page.getByRole('button', { name: 'Analyze Scope & Generate Ledger' });
    await analyzeBtn.click();

    // Verify loading state or wait for results
    await expect(page.getByText('Unbilled Value')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('$690')).toBeVisible();

    // Verify analytics chart headers & legends
    await expect(page.getByText('Scope Classification Distribution')).toBeVisible();
    await expect(page.getByText(/Scope Creep/i).first()).toBeVisible();

    // Open review modal
    const reviewBtn = page.getByRole('button', { name: /Review Flagged/i });
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();
    await expect(page.getByText('Review Flagged Scope Creep Items')).toBeVisible();

    // Close review modal
    await page.getByRole('button', { name: 'Close Review Window' }).click();

    // Open Change Order Modal
    const changeOrderBtn = page.getByRole('button', { name: 'Draft Change Order' });
    await changeOrderBtn.click();

    await expect(page.getByText(/Generated Change-Order Email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Print \/ Save PDF Receipt/i })).toBeVisible();
  });
});
