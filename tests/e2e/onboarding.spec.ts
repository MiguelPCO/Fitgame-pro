import { test, expect } from '@playwright/test';
import { login, seedAuth, completeOnboarding } from './helpers';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Wait for onboarding to appear (new user)
    await page.waitForSelector('text=Que entrenas?', { timeout: 10000 });
  });

  test('redirects to onboarding after first login', async ({ page }) => {
    await expect(page.getByText('Paso 1 de 9')).toBeVisible();
    await expect(page.getByText('Que entrenas?')).toBeVisible();
  });

  test('completes full onboarding flow', async ({ page }) => {
    await completeOnboarding(page);
    // Should land on dashboard with full content loaded
    await expect(page.getByText('Weekly Progress')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate back between steps', async ({ page }) => {
    // Go to step 2
    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Cual es tu objetivo?')).toBeVisible();
    await expect(page.getByText('Paso 2 de 9')).toBeVisible();

    // Go back to step 1
    await page.click('button:has-text("Atras")');
    await expect(page.getByText('Que entrenas?')).toBeVisible();
    await expect(page.getByText('Paso 1 de 9')).toBeVisible();
  });

  test('step indicators show progress', async ({ page }) => {
    await expect(page.getByText('Paso 1 de 9')).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByText('11%')).toBeVisible();

    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Paso 2 de 9')).toBeVisible();
    await expect(page.getByText('22%')).toBeVisible();

    await page.click('button:has-text("Siguiente")');
    await expect(page.getByText('Paso 3 de 9')).toBeVisible();
    await expect(page.getByText('33%')).toBeVisible();
  });

  test('running-only skips equipment and generates a running plan', async ({ page }) => {
    await page.getByText('Carrera', { exact: true }).click();

    // Un paso menos: el equipamiento no aplica
    await expect(page.getByText('Paso 1 de 8')).toBeVisible();

    await page.click('button:has-text("Siguiente")');
    await page.click('button:has-text("Siguiente")'); // objetivo
    await page.click('button:has-text("Siguiente")'); // disponibilidad

    // Se salta equipamiento
    await expect(page.getByText('Nivel de Experiencia')).toBeVisible();
    await page.click('button:has-text("Siguiente")');
    await page.click('button:has-text("Siguiente")'); // lesiones

    await expect(page.getByText('Tu Plan de Entrenamiento')).toBeVisible();
    await expect(page.getByText('Tirada larga')).toBeVisible();
    await expect(page.getByText('Carrera').first()).toBeVisible();
  });

  test('injuries are shown on the generated plan', async ({ page }) => {
    await page.click('button:has-text("Siguiente")'); // disciplina
    await page.click('button:has-text("Siguiente")'); // objetivo
    await page.click('button:has-text("Siguiente")'); // disponibilidad
    await page.click('button:has-text("Siguiente")'); // equipamiento
    await page.click('button:has-text("Siguiente")'); // experiencia

    await expect(page.getByText('Alguna lesion?')).toBeVisible();
    await page.getByRole('button', { name: 'Rodilla' }).click();
    await page.click('button:has-text("Siguiente")');

    await expect(page.getByText('Lo que nos has contado')).toBeVisible();
    await expect(page.getByText('Rodilla')).toBeVisible();
  });
});

test.describe('Onboarding gating', () => {
  test('a user who already completed onboarding never sees it again', async ({ page }) => {
    await seedAuth(page);
    await expect(page.getByText('Que entrenas?')).not.toBeVisible();

    // Recargar tampoco lo devuelve
    await page.reload();
    await expect(page.getByText('Weekly Progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Que entrenas?')).not.toBeVisible();
  });
});
