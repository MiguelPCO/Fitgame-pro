import { test, expect } from '@playwright/test';
import { seedAuth, seedFullState } from './helpers';

test.describe('Navigation', () => {
  test('sidebar nav items navigate correctly (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only test');

    await seedAuth(page);

    const navItems = [
      { label: 'Templates', expected: 'Templates' },
      { label: 'Programa', expected: 'Programa' },
      { label: 'Exercises', expected: 'Exercises' },
      { label: 'Progress', expected: 'Progress' },
      { label: 'Historial', expected: 'Historial' },
      { label: 'Configuracion', expected: 'Configuracion' },
      { label: 'Dashboard', expected: 'Weekly Progress' },
    ];

    for (const item of navItems) {
      await page.click(`text=${item.label}`);
      await expect(page.getByText(item.expected).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('mobile menu nav works', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');

    await seedAuth(page);

    // Open mobile menu
    await page.locator('[aria-label="Abrir menú"]').click();

    // Navigate to Templates
    await page.click('text=Templates');
    await expect(page.getByText('Templates').first()).toBeVisible({ timeout: 5000 });

    // Navigate to Historial
    await page.locator('[aria-label="Abrir menú"]').click();
    await page.click('text=Historial');
    await expect(page.getByText('Historial').first()).toBeVisible({ timeout: 5000 });
  });

  test('workout player bypasses layout', async ({ page }) => {
    await seedFullState(page);

    // Start a workout from dashboard
    const startButton = page.locator('button:has-text("Start Session")');
    await startButton.scrollIntoViewIfNeeded();
    await startButton.click();

    // Wait for workout player — "Ejercicio" header is unique to the player
    await page.waitForSelector('text=Ejercicio', { timeout: 10000 });

    // Sidebar nav should NOT be visible in workout player
    await expect(page.getByText('Configuracion')).not.toBeVisible();
  });

  test('logout returns to login page', async ({ page, isMobile }) => {
    await seedAuth(page);

    if (isMobile) {
      await page.locator('[aria-label="Abrir menú"]').click();
    }

    // Click Sign Out
    await page.click('text=Sign Out');

    await expect(page.locator('h1')).toContainText('FitGame', { timeout: 10000 });
    await expect(page.locator('#login-email')).toBeVisible();
  });
});
