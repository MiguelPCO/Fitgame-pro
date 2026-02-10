import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Auth Flow', () => {
  test('shows login page with expected elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('FitGame');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Training' })).toBeVisible();
    // Offline mode banner should be present (no Supabase env vars in test)
    await expect(page.getByText('Running in offline mode')).toBeVisible();
  });

  test('login with mock credentials redirects to onboarding for new user', async ({ page }) => {
    await login(page);
    // New user (no onboardingCompleted) → goes to onboarding
    await expect(page.getByText('Cual es tu objetivo?')).toBeVisible({ timeout: 10000 });
  });

  test('navigate to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Create account")');
    // Signup form should appear
    await expect(page.locator('#signup-name')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#signup-email')).toBeVisible();
  });

  test('forgot password link shows reset form', async ({ page }) => {
    await page.goto('/');
    await page.fill('#login-email', 'test@fitgame.pro');
    await page.click('text=Olvidaste tu contrasena?');
    await expect(page.getByText('Enviar enlace')).toBeVisible({ timeout: 5000 });
  });
});
