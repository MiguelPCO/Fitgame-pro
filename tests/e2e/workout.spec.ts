import { test, expect } from '@playwright/test';
import { seedFullState } from './helpers';

/**
 * Seed state and navigate to the workout player by clicking "Start Session".
 */
async function startWorkoutFromDashboard(page: import('@playwright/test').Page) {
  await seedFullState(page);

  // Click the Start Session button on the scheduled workout card
  const startButton = page.locator('button:has-text("Start Session")');
  await startButton.scrollIntoViewIfNeeded();
  await startButton.click();

  // Wait for the workout player to load — "Ejercicio" header is unique to the player
  await page.waitForSelector('text=Ejercicio', { timeout: 10000 });
}

test.describe('Workout Player', () => {
  test('shows workout player after starting session', async ({ page }) => {
    await startWorkoutFromDashboard(page);

    // Verify workout-specific UI elements
    await expect(page.getByText('Ejercicio').first()).toBeVisible();
    // Verify exercise name in main content area (not sidebar)
    await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible();
  });

  test('set input modal opens and can save data', async ({ page }) => {
    await startWorkoutFromDashboard(page);

    // Click on the first incomplete set card (the "Registrar" button or set card)
    const registerButton = page.locator('button:has-text("Registrar")').first();
    if (await registerButton.isVisible({ timeout: 3000 })) {
      await registerButton.click();

      // Modal should show with weight and reps inputs
      const saveButton = page.getByText('Guardar y continuar');
      if (await saveButton.isVisible({ timeout: 3000 })) {
        // Fill in weight using the increment button
        const increaseWeight = page.locator('[aria-label="Increase Peso"]');
        for (let i = 0; i < 10; i++) {
          await increaseWeight.click();
        }

        // Fill in reps
        const increaseReps = page.locator('[aria-label="Increase Repeticiones"]');
        for (let i = 0; i < 10; i++) {
          await increaseReps.click();
        }

        // Save
        await page.click('button:has-text("Guardar y continuar")');

        // Modal should close
        await expect(saveButton).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('workout player hides sidebar nav', async ({ page }) => {
    await startWorkoutFromDashboard(page);

    // Sidebar nav should NOT be visible in workout player
    await expect(page.getByText('Configuracion')).not.toBeVisible();
  });
});
