import { test, expect } from '@playwright/test';

test.describe('Landing Page & Auth Flow E2E Tests', () => {
  test('should render public SaaS landing page with hero, features, and pricing', async ({ page }) => {
    await page.goto('/landing');

    // Verify Hero Section Elements
    await expect(page.getByRole('heading', { name: /Stop Losing Thousands to Unbilled Scope Creep/i })).toBeVisible();
    await expect(page.getByText('Powered by Amazon Bedrock & Claude 3 Haiku')).toBeVisible();

    // Verify Feature Highlights
    await expect(page.getByText('Multi-Channel Scope Ingestion')).toBeVisible();
    await expect(page.getByText('Amazon Bedrock AI Classifier')).toBeVisible();
    await expect(page.getByText('Deterministic Math Ledger')).toBeVisible();
    await expect(page.getByText('Instant Change-Order Generator')).toBeVisible();

    // Verify Pricing Tiers
    await expect(page.getByRole('heading', { name: 'Starter Freelancer' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro Freelancer' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agency Studio' })).toBeVisible();
  });

  test('should allow switching between Sign In and Create Account tabs on auth page', async ({ page }) => {
    await page.goto('/auth/login');

    // Default tab is Sign In
    await expect(page.getByRole('button', { name: /Sign In to Workspace/i })).toBeVisible();

    // Click Create Account tab
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify Sign Up form fields are rendered
    await expect(page.getByText('Full Name')).toBeVisible();
    await expect(page.getByText('Primary Profession')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create & Provision Account/i })).toBeVisible();
  });

  test('should handle /auth/signup redirect to mode=signup', async ({ page }) => {
    await page.goto('/auth/signup');

    // Verify URL redirected to login?mode=signup and signup fields are visible
    await expect(page).toHaveURL(/mode=signup/);
    await expect(page.getByText('Full Name')).toBeVisible();
  });
});
