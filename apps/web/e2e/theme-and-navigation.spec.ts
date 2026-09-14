import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: /Open Demo Workspace/i }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
});

test.describe('Workspace Navigation & Theme E2E', () => {
  test('should render the app shell brand and primary navigation', async ({ page }) => {
    await expect(page.getByText('ALXO', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Analysis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Activity' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Demo User/ })).toBeVisible();
  });

  test('should let the user sign out and return to the sign-in page', async ({ page }) => {
    // Open the account dropdown and sign out
    await page.getByRole('button', { name: /Demo User/ }).click();
    await page.getByRole('menuitem', { name: /Sign out/ }).click();

    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('should toggle between dark and light theme inside the workspace', async ({ page }) => {
    const htmlTag = page.locator('html');

    // Demo defaults to dark
    await expect(htmlTag).toHaveClass(/dark/);

    const toggleButton = page.getByRole('button', { name: 'Switch to light mode' });
    await toggleButton.click();
    await expect(htmlTag).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(htmlTag).toHaveClass(/dark/);
  });

  test('should keep theme choice when navigating to the landing page', async ({ page }) => {
    const htmlTag = page.locator('html');
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(htmlTag).not.toHaveClass(/dark/);

    await page.goto('/');
    await expect(htmlTag).not.toHaveClass(/dark/);
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
  });
});