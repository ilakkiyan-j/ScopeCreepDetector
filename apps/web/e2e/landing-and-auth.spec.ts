import { test, expect } from '@playwright/test';

test.describe('Landing Page & Auth Flow E2E Tests', () => {
  test('should render public SaaS landing page with hero, features, and FAQs', async ({ page }) => {
    await page.goto('/');

    // Verify Hero Section Elements
    await expect(page.getByRole('heading', { name: /Stop Losing Thousands to Unbilled Scope Creep/i })).toBeVisible();
    await expect(page.getByText('Powered by Amazon Bedrock & Claude 3 Haiku')).toBeVisible();

    // Verify Feature Highlights
    await expect(page.getByText('Multi-Channel Scope Ingestion')).toBeVisible();
    await expect(page.getByText('Amazon Bedrock AI Classifier')).toBeVisible();
    await expect(page.getByText('Deterministic Math Ledger')).toBeVisible();
    await expect(page.getByText('Instant Change-Order Generator')).toBeVisible();

    // Verify FAQ items
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  });

  test('should render full-page Sign In view with persona presets and redirect to /dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    // Verify full-page header and sign in form
    await expect(page.getByRole('heading', { name: 'Account Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: /User Persona/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Admin Persona/i })).toBeVisible();

    // Click Sign In
    await page.getByRole('button', { name: /Sign In to Workspace/i }).click();

    // Verify redirect to /dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Ready to Audit Scope Drift')).toBeVisible();
  });

  test('should handle /auth/signup redirect to /auth/login', async ({ page }) => {
    await page.goto('/auth/signup');

    // Verify URL redirected to /auth/login
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByRole('heading', { name: 'Account Sign In' })).toBeVisible();
  });
});
