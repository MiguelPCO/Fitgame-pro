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

    // En movil se navega por la barra inferior (pestaña + sub-pestaña);
    // en escritorio sigue mandando la sidebar.
    const openSection = async (tab: string, screen: string) => {
      if (isMobile) {
        await page
          .getByRole('navigation', { name: 'Navegación principal' })
          .getByRole('button', { name: tab, exact: true })
          .click();
      }
      // "Progreso" existe como pestaña y como sub-pestaña: hay que acotar.
      const scope = isMobile
        ? page.getByRole('navigation', { name: /^Secciones de / })
        : page;
      await scope.getByRole('button', { name: screen, exact: true }).click();
    };

    await openSection('Plan', 'Plantillas');
    await expect(page.getByText('Workout Templates').first()).toBeVisible();

    await openSection('Progreso', 'Progreso');
    await expect(page.getByText('Tu Progreso').first()).toBeVisible();

    await openSection('Progreso', 'Historial');
    await expect(page.getByText('Historial de Sesiones').first()).toBeVisible();
  });
});
