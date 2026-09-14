import { test, expect } from '@playwright/test';

const SAMPLE_SCOPE = `Redesign homepage and 3 internal pages.
No backend functionality or login systems.
Includes 1 revision round.`;

test.describe('Analysis → Ledger → Change Order E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('button', { name: /Open Demo Workspace/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test('should analyze the benchmark thread, open the ledger, and generate a change order', async ({ page }) => {
    // Build a project
    await page.goto('/app/projects/new');
    await page.getByLabel('Project name').fill('Acme Website');
    await page.getByLabel('Client / company').fill('Acme Corp');
    await page.getByLabel('Original baseline scope').fill(SAMPLE_SCOPE);

    await page.getByRole('button', { name: 'Load benchmark sample thread' }).click();
    await expect(page.getByText('Sample thread (benchmark).txt')).toBeVisible();
    await page.getByRole('button', { name: 'Analyze Sample Thread' }).click();

    // Analysis progress → completion
    await expect(page.getByText('Analysis Complete')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Analysis Complete')).toBeVisible();
    await page.getByRole('button', { name: /Review Ledger/ }).click();

    // Ledger: benchmark yields 6 verified items + deterministic totals
    await expect(page).toHaveURL(/\/ledger/);
    await expect(page.getByRole('heading', { name: 'Ledger' })).toBeVisible();
    await expect(page.getByText('Verified value').first()).toBeVisible();
    await expect(page.getByText('$690.00')).toBeVisible();
    await expect(page.getByText('All flagged items')).toBeVisible();
    // Benchmark yields only verified items — the review queue section is absent.
// The metric tile says "Review queue" (lowercase); an exact match targets only the section.
    await expect(page.getByText('Review Queue', { exact: true })).not.toBeVisible();

    // Change order is available because there are verified items
    await page.getByRole('link', { name: 'Change Orders' }).click();
    await expect(page.getByRole('heading', { name: 'Change Orders' })).toBeVisible();
    await page.getByRole('button', { name: 'Generate change order email' }).click();

    await expect(page.getByRole('heading', { name: 'Change order email' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Itemized summary' })).toBeVisible();
    await expect(page.getByText('Total').last()).toBeVisible();
    await expect(page.getByText('$690.00').first()).toBeVisible();
    await expect(page.getByText('$690.00').last()).toBeVisible();
  });

  test('should open the projects list and navigate to a project overview', async ({ page }) => {
    await page.goto('/app/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByPlaceholder('Search by project or client…')).toBeVisible();

    // If any project exists (API or UI-created), a card routes to its overview
    const firstCard = page.getByRole('link', { name: /Acme Website|API Test Project|List Test Project|Assorted/ }).first();
    if (await firstCard.count()) {
      await firstCard.click();
      await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    }
  });
});