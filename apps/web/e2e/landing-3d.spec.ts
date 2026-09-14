import { test, expect } from '@playwright/test';

test.describe('Landing 3D Hero E2E', () => {
  test('should mount the 3D scene on desktop without reduced motion', async ({ page }) => {
    await page.goto('/');

    // The R3F canvas island mounts behind the hero copy
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Stop doing extra work for free/i })).toBeVisible();

    // Scrolling well past the hero unmounts the canvas (render loop is paused offscreen)
    await page.getByRole('heading', { name: /Why it matters/i }).scrollIntoViewIfNeeded();
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('should show the static poster instead of 3D under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Stop doing extra work for free/i })).toBeVisible();
  });
});