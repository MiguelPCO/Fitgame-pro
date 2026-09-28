import { test, expect } from '@playwright/test';
import { seedFullState } from './helpers';

/** Abre el registro manual de carrera, en movil (boton "+") o escritorio (barra lateral). */
async function openRunLogger(page: import('@playwright/test').Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Acciones rápidas' }).click();
    await page.getByRole('button', { name: /Registrar carrera/ }).click();
  } else {
    await page.getByRole('navigation', { name: 'Navegación lateral' })
      .getByRole('button', { name: 'Registrar carrera', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Registrar carrera' })).toBeVisible({ timeout: 5000 });
}

test.describe('Registro manual de carrera', () => {
  test.beforeEach(async ({ page }) => {
    await seedFullState(page);
  });

  test('se registra en 4 interacciones: distancia, duracion, esfuerzo, enviar', async ({ page, isMobile }) => {
    await openRunLogger(page, !!isMobile);

    await page.getByLabel('Distancia en kilometros').fill('8');
    await page.getByLabel('Duracion en minutos').fill('45');
    // El esfuerzo ya trae un valor por defecto (5): no hace falta tocarlo para enviar.
    // Escopado al formulario: en escritorio la barra lateral tiene su propio
    // boton "Registrar carrera" siempre montado.
    await page.locator('form').getByRole('button', { name: 'Registrar carrera' }).click();

    await expect(page.getByText('Carrera registrada')).toBeVisible({ timeout: 5000 });
  });

  test('el ritmo se calcula en vivo', async ({ page, isMobile }) => {
    await openRunLogger(page, !!isMobile);

    await page.getByLabel('Distancia en kilometros').fill('10');
    await page.getByLabel('Duracion en minutos').fill('50');

    // 50 min / 10 km = 5:00 /km
    await expect(page.getByRole('status').filter({ hasText: 'Ritmo' })).toHaveText(/5:00/);
  });

  test('el envio queda deshabilitado sin distancia o duracion', async ({ page, isMobile }) => {
    await openRunLogger(page, !!isMobile);
    const submit = page.locator('form').getByRole('button', { name: 'Registrar carrera' });
    await expect(submit).toBeDisabled();

    await page.getByLabel('Distancia en kilometros').fill('5');
    await expect(submit).toBeDisabled();

    await page.getByLabel('Duracion en minutos').fill('25');
    await expect(submit).toBeEnabled();
  });
});
