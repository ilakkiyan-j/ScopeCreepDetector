import { test, expect } from '@playwright/test';

test.describe('Theme & Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display app title and Amazon Bedrock badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Scope Creep Ledger' })).toBeVisible();
    await expect(page.getByText('Amazon Bedrock')).toBeVisible();
    await expect(page.getByText('Deterministic Math Verified')).toBeVisible();
  });

  test('should toggle theme mode between dark and light', async ({ page }) => {
    const htmlTag = page.locator('html');
    
    // Initially dark mode (has dark class)
    await expect(htmlTag).toHaveClass(/dark/);

    // Click theme toggle button
    const toggleButton = page.getByRole('button', { name: 'Toggle Theme' });
    await toggleButton.click();

    // Verify theme changed to light (dark class removed)
    await expect(htmlTag).not.toHaveClass(/dark/);

    // Click again to return to dark mode
    await toggleButton.click();
    await expect(htmlTag).toHaveClass(/dark/);
  });
});
