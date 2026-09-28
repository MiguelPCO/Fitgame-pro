import { test, expect } from '@playwright/test';
import { seedAuth, seedFullState } from './helpers';

/** Alto/ancho minimo de un objetivo tactil (04-design-system.md §12). */
const MIN_TOUCH_TARGET = 44;

test.describe('Navigation', () => {
  test('sidebar nav items navigate correctly (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only test');

    await seedAuth(page);

    const navItems = [
      { label: 'Plantillas', expected: 'Workout Templates' },
      { label: 'Programa', expected: 'Programa Semanal' },
      { label: 'Ejercicios', expected: 'Exercise Library' },
      { label: 'Progreso', expected: 'Tu Progreso' },
      { label: 'Historial', expected: 'Historial de Sesiones' },
      { label: 'Configuración', expected: 'Configuracion' },
      { label: 'Inicio', expected: 'Weekly Progress' },
    ];

    for (const item of navItems) {
      await page.getByRole('button', { name: item.label, exact: true }).click();
      await expect(page.getByText(item.expected).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('bottom nav reaches every section in two taps (mobile)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');

    await seedAuth(page);

    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' });
    const sections = page.getByRole('navigation', { name: /^Secciones de / });
    await expect(bottomNav).toBeVisible();

    // Toque 1: pestaña. Toque 2: sub-pestaña de la seccion.
    await bottomNav.getByRole('button', { name: 'Plan', exact: true }).click();
    await expect(page.getByText('Programa Semanal').first()).toBeVisible({ timeout: 5000 });
    await sections.getByRole('button', { name: 'Plantillas', exact: true }).click();
    await expect(page.getByText('Workout Templates').first()).toBeVisible({ timeout: 5000 });

    await bottomNav.getByRole('button', { name: 'Progreso', exact: true }).click();
    await expect(page.getByText('Tu Progreso').first()).toBeVisible({ timeout: 5000 });
    await sections.getByRole('button', { name: 'Historial', exact: true }).click();
    await expect(page.getByText('Historial de Sesiones').first()).toBeVisible({ timeout: 5000 });

    await bottomNav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await expect(page.getByText('Configuracion').first()).toBeVisible({ timeout: 5000 });
    await sections.getByRole('button', { name: 'Ejercicios', exact: true }).click();
    await expect(page.getByText('Exercise Library').first()).toBeVisible({ timeout: 5000 });

    await bottomNav.getByRole('button', { name: 'Hoy', exact: true }).click();
    await expect(page.getByText('Weekly Progress').first()).toBeVisible({ timeout: 5000 });
  });

  test('bottom nav targets are at least 44px (mobile)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');

    await seedAuth(page);

    const buttons = page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button');
    const count = await buttons.count();
    expect(count).toBe(5);

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });

  test('action button opens the quick actions sheet (mobile)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');

    await seedAuth(page);

    await page.getByRole('button', { name: 'Acciones rápidas' }).click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('Empezar entreno libre')).toBeVisible();

    await sheet.getByRole('button', { name: 'Cerrar' }).click();
    await expect(sheet).not.toBeVisible();
  });

  test('workout player bypasses layout', async ({ page }) => {
    await seedFullState(page);

    // Start a workout from dashboard
    const startButton = page.locator('button:has-text("Start Session")');
    await startButton.scrollIntoViewIfNeeded();
    await startButton.click();

    // Wait for workout player — "Ejercicio" header is unique to the player
    await page.waitForSelector('text=Ejercicio', { timeout: 10000 });

    // Neither the sidebar nor the bottom nav should be present
    await expect(page.getByText('Configuracion')).not.toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Navegación principal' })
    ).not.toBeVisible();
  });

  test('logout returns to login page', async ({ page, isMobile }) => {
    await seedAuth(page);

    if (isMobile) {
      // En movil cerrar sesion vive en Perfil, no en una sidebar
      await page
        .getByRole('navigation', { name: 'Navegación principal' })
        .getByRole('button', { name: 'Perfil', exact: true })
        .click();
      await page.getByLabel('Cerrar sesión').click();
    } else {
      await page.click('text=Sign Out');
    }

    await expect(page.locator('h1')).toContainText('Hybrid', { timeout: 10000 });
    await expect(page.locator('#login-email')).toBeVisible();
  });
});
