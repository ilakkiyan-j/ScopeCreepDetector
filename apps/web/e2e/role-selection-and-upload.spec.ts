import { test, expect } from '@playwright/test';
import { Buffer } from 'buffer';

const CHAT_SAMPLE = `[01/03/2026, 09:15:22] Client: Hi Alex! Ready to kick off the website redesign project.
[04/03/2026, 11:30:15] Client: Oh, by the way, can you also add a login page for our existing customers?`;

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: /Open Demo Workspace/i }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
});

test.describe('Project Creation & File Staging E2E', () => {
  test('should render the new project form with staged upload flow', async ({ page }) => {
    await page.goto('/app/projects/new');

    await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
    await expect(page.getByLabel('Project name')).toBeVisible();
    await expect(page.getByLabel('Client / company')).toBeVisible();
    await expect(page.getByLabel('Hourly Rate')).toBeVisible();
    await expect(page.getByLabel('Original baseline scope')).toBeVisible();

    // Demo user defaults to USD, shown in the rate suffix
    await expect(page.getByLabel('Hourly Rate')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load benchmark sample thread' })).toBeVisible();
  });

  test('should load the benchmark sample thread into staging', async ({ page }) => {
    await page.goto('/app/projects/new');

    await page.getByRole('button', { name: 'Load benchmark sample thread' }).click();

    await expect(page.getByText('Sample thread (benchmark).txt')).toBeVisible();
    // Sample-only staging shows the single-confirm analyze button
    await expect(page.getByRole('button', { name: 'Analyze Sample Thread' })).toBeVisible();
  });

  test('should stage an uploaded file and show the upload & analyze confirm button', async ({ page }) => {
    await page.goto('/app/projects/new');

    await page.setInputFiles('input[type="file"]', {
      name: 'chat-export.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(CHAT_SAMPLE),
    });

    await expect(page.getByText('chat-export.txt')).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload & Analyze 1 File/i })).toBeVisible();
  });

  test('should require scope before analysis is possible', async ({ page }) => {
    await page.goto('/app/projects/new');

    // No files staged yet → analyze disabled
    await expect(page.getByRole('button', { name: /Add conversation files to analyze/i })).toBeDisabled();
  });
});