import { test, expect } from '@playwright/test';

test.describe('Role Selection & Ingestion E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should allow selecting different freelancer roles', async ({ page }) => {
    const devRole = page.getByRole('button', { name: 'Web / Software Dev' });
    const uiRole = page.getByRole('button', { name: 'UI/UX & Designer' });
    const copyRole = page.getByRole('button', { name: 'Copywriter & Content' });

    await expect(devRole).toBeVisible();
    await expect(uiRole).toBeVisible();
    await expect(copyRole).toBeVisible();

    // Select UI/UX Designer role
    await uiRole.click();
    await expect(uiRole).toHaveClass(/bg-blue-600/);

    // Select Copywriter role
    await copyRole.click();
    await expect(copyRole).toHaveClass(/bg-blue-600/);
  });

  test('should load benchmark demo thread data', async ({ page }) => {
    const demoButton = page.getByRole('button', { name: 'Load Benchmark Demo Thread' });
    await demoButton.click();

    const projectNameInput = page.getByPlaceholder('e.g. Website Redesign');
    await expect(projectNameInput).toHaveValue('Website Redesign');

    const clientNameInput = page.getByPlaceholder('e.g. Acme Corp');
    await expect(clientNameInput).toHaveValue('Acme Corp');

    await expect(page.getByText('sample-whatsapp-redesign.txt')).toBeVisible();
  });
});
