import { test, expect } from '@playwright/test';

test.describe('Admin Console & User Management E2E', () => {
  test('should open the admin console for the admin account', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('admin@scopecreep.io');
    await page.getByLabel('Password', { exact: true }).fill('Admin123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // ADMIN role is steered to the admin console
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByText('Scope creep value by currency')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Admin Overview', exact: true })).toBeVisible();
  });

  test('should block a USER account from /admin', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('jordan@designstudio.com');
    await page.getByLabel('Password', { exact: true }).fill('Jordan123!');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test('should list users and add a new account from the admin console', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('admin@scopecreep.io');
    await page.getByLabel('Password', { exact: true }).fill('Admin123!');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Users directory
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByText('demo@scopecreep.io')).toBeVisible();

    // Create a user
    await page.getByRole('button', { name: /Add user/i }).click();
    await page.getByLabel('Full name').fill('E2E Test User');
    await page.getByLabel('Email').fill('e2e-test@scopecreep.io');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/Account created/)).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByText('e2e-test@scopecreep.io')).toBeVisible();
  });

  test('should render admin settings with deployment info', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('admin@scopecreep.io');
    await page.getByLabel('Password', { exact: true }).fill('Admin123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deployment' })).toBeVisible();
  });
});