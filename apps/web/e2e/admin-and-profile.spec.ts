import { test, expect } from '@playwright/test';

test.describe('Profile & Admin Portal E2E Tests', () => {
  test('should navigate to user profile and update profile details', async ({ page }) => {
    await page.goto('/profile');

    // Verify profile page components are rendered
    await expect(page.getByText('User Profile & Professional Specialization')).toBeVisible();
    await expect(page.getByText('Email Address (Cognito Managed)')).toBeVisible();

    // Fill profile input
    const companyInput = page.getByPlaceholder('e.g. Independent Contractor / Acme Agency');
    await companyInput.fill('Apex Software Labs');

    // Click save
    await page.getByRole('button', { name: /Save Profile Changes/i }).click();

    // Verify success indicator
    await expect(page.getByText('Profile Saved!')).toBeVisible();
  });

  test('should block non-admin users with 403 Access Denied on Admin Portal', async ({ page }) => {
    // Log in as standard USER persona
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /User Persona/i }).click();
    await page.getByRole('button', { name: /Sign In to Workspace/i }).click();

    // Try accessing /admin
    await page.goto('/admin');
    await expect(page.getByText('Access Denied (403)')).toBeVisible();
    await expect(page.getByText('Administrator privileges')).toBeVisible();
  });

  test('should render Admin Portal dashboard and allow user management when signed in as ADMIN', async ({ page }) => {
    // Log in as ADMIN persona
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /Admin Persona/i }).click();
    await page.getByRole('button', { name: /Sign In to Workspace/i }).click();

    // Navigate to /admin
    await page.goto('/admin');

    // Verify Admin metrics and table
    await expect(page.getByRole('heading', { name: 'System Administration Portal' })).toBeVisible();
    await expect(page.getByText('Total Users')).toBeVisible();
    await expect(page.getByText('User Accounts & Permission Directory')).toBeVisible();
    await expect(page.getByText('alex@freelance.dev')).toBeVisible();

    // Open provision user modal
    await page.getByRole('button', { name: /Create User Account/i }).click();
    await expect(page.getByRole('heading', { name: 'Create New User Account' })).toBeVisible();

    // Fill modal form
    await page.locator('input[placeholder="e.g. David Miller"]').fill('E2E Test User');
    await page.locator('input[placeholder="david@agency.com"]').fill('e2e-test@scopecreep.io');
    await page.locator('input[placeholder="e.g. Full-Stack Engineer"]').fill('Automation QA Engineer');

    // Submit user creation
    await page.getByRole('button', { name: 'Create & Issue Invitation' }).click();

    // Verify user in directory
    await expect(page.getByText('e2e-test@scopecreep.io')).toBeVisible();
  });
});
