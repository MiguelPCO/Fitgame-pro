import { test, expect } from '@playwright/test';
import { login, completeOnboarding } from './helpers';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Wait for onboarding to appear (new user)
    await page.waitForSelector('text=Cual es tu objetivo?', { timeout: 10000 });
  });

  test('redirects to onboarding after first login', async ({ page }) => {
    await expect(page.getByText('Paso 1 de 7')).toBeVisible();
    await expect(page.getByText('Cual es tu objetivo?')).toBeVisible();
  });

  test('completes full onboarding flow', async ({ page }) => {
    await completeOnboarding(page);
    // Should land on dashboard with full content loaded
    await expect(page.getByText('Weekly Progress')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate back between steps', async ({ page }) => {
    // Go to step 2
    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Disponibilidad')).toBeVisible();
    await expect(page.getByText('Paso 2 de 7')).toBeVisible();

    // Go back to step 1
    await page.click('button:has-text("Atras")');
    await expect(page.getByText('Cual es tu objetivo?')).toBeVisible();
    await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  });

  test('step indicators show progress', async ({ page }) => {
    await expect(page.getByText('Paso 1 de 7')).toBeVisible();
    await expect(page.getByText('14%')).toBeVisible();

    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Paso 2 de 7')).toBeVisible();
    await expect(page.getByText('29%')).toBeVisible();

    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Paso 3 de 7')).toBeVisible();
    await expect(page.getByText('43%')).toBeVisible();
  });
});
