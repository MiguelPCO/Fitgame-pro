import { test, expect } from '@playwright/test';
import { seedAuth, seedFullState } from './helpers';

test.describe('Dashboard', () => {
  test('shows user info after seed', async ({ page }) => {
    await seedAuth(page);

    // Dashboard shows first name only (user.name.split(' ')[0])
    await expect(page.getByRole('heading', { name: 'Test' })).toBeVisible();
    await expect(page.getByText('Weekly Progress')).toBeVisible();
  });

  test('shows scheduled workout when state is seeded', async ({ page }) => {
    await seedFullState(page);

    // The template name should appear on the dashboard
    await expect(page.getByText('Test Push Day').first()).toBeVisible({ timeout: 5000 });
  });

  test('can start a workout from dashboard', async ({ page }) => {
    await seedFullState(page);

    // Click the Start Session button on the workout card
    await page.click('button:has-text("Start Session")');

    // Should navigate to workout player — "Ejercicio" is unique to the player header
    await expect(page.getByText('Ejercicio').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation works from dashboard', async ({ page, isMobile }) => {
    await seedAuth(page);

    // On mobile, need to open menu first
    if (isMobile) {
      await page.locator('[aria-label="Abrir menú"]').click();
    }

    // Click Templates nav
    await page.click('text=Templates');
    await expect(page.getByText('Templates').first()).toBeVisible();

    if (isMobile) {
      await page.locator('[aria-label="Abrir menú"]').click();
    }

    // Click Progress nav
    await page.click('text=Progress');
    await expect(page.getByText('Progress').first()).toBeVisible();

    if (isMobile) {
      await page.locator('[aria-label="Abrir menú"]').click();
    }

    // Click Historial nav
    await page.click('text=Historial');
    await expect(page.getByText('Historial').first()).toBeVisible();
  });
});
