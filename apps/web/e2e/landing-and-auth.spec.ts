import { test, expect } from '@playwright/test';

test.describe('Landing Page, Auth & Role Guard E2E', () => {
  test('should render the public landing page with hero and demo CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Stop doing extra work for free/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /From client chat to billing evidence/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Demo Workspace/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' }).first()).toBeVisible();

    // Theme toggle on the public navbar defaults to dark
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });

  test('should sign in as demo user and land on the user workspace', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // Sign in with the demo one-click entry
    await page.getByRole('button', { name: /Open Demo Workspace/i }).click();

    // Redirected to /app/dashboard with a demo banner
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByText(/Demo Mode/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening),/ })).toBeVisible();
  });

  test('should sign in via credentials for a provisioned user', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('jordan@designstudio.com');
    await page.getByLabel('Password', { exact: true }).fill('Jordan123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Jordan/i })).toBeVisible();
  });

  test('should keep demo users out of the admin console', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('button', { name: /Open Demo Workspace/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);

    // Demo is USER — /admin must bounce back to /app/dashboard
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test('should render /request-access with honest MVP copy', async ({ page }) => {
    await page.goto('/request-access');
    await expect(page.getByRole('heading', { name: 'Request Access' })).toBeVisible();
    await expect(page.getByText(/Accounts are provisioned by an administrator/)).toBeVisible();
  });
});