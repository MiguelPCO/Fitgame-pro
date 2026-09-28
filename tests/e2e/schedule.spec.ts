import { test, expect } from '@playwright/test';
import { seedFullState } from './helpers';

/** Abre la pantalla de Plan, tanto en movil (barra inferior) como en escritorio (lateral). */
async function openPlan(page: import('@playwright/test').Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: 'Plan', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Programa', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible({ timeout: 5000 });
}

/**
 * La sesion de hoy sale ya completada (seedFullState siembra historial de hoy), y
 * lo completado no se mueve ni se salta. La semana que viene tiene la misma
 * plantilla proyectada y sigue en 'planned'.
 */
async function goToNextWeekSameDay(page: import('@playwright/test').Page) {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const iso = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;

  await page.getByRole('button', { name: 'Semana siguiente' }).click();
  await page.getByRole('button', { name: new RegExp(`^${iso}`) }).first().click();
  await expect(page.getByText('Planificado').first()).toBeVisible({ timeout: 5000 });
}

test.describe('Calendario', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await seedFullState(page);
    await openPlan(page, !!isMobile);
  });

  test('el weekly_schedule sembrado aparece como sesion con fecha', async ({ page }) => {
    // seedFullState programa la plantilla en el dia de hoy
    await expect(page.getByText('Test Push Day').first()).toBeVisible();
  });

  test('semana y mes muestran la misma sesion', async ({ page }) => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayLabel = new RegExp(`^${iso}.*Test Push Day`);

    await expect(
      page.getByRole('group', { name: 'Dias de la semana' }).getByRole('button', { name: dayLabel })
    ).toHaveCount(1);

    await page.getByRole('tab', { name: 'Mes' }).click();
    await expect(
      page.getByRole('group', { name: 'Dias del mes' }).getByRole('button', { name: dayLabel })
    ).toHaveCount(1);
  });

  test('el estado se lee sin depender del color', async ({ page }) => {
    // Icono + etiqueta, no solo un punto de color
    await expect(page.getByText('Completado').first()).toBeVisible();
  });

  test('mover ofrece solo dias validos y reprograma', async ({ page }) => {
    await goToNextWeekSameDay(page);
    await page.getByRole('button', { name: /^Mover / }).first().click();
    await expect(page.getByText('Mover a')).toBeVisible();

    const targets = page.locator('button', { hasText: /^(lun|mar|mie|jue|vie|sab|dom) \d+$/ });
    const count = await targets.count();
    expect(count).toBeGreaterThan(0);
    // Regla 1: como mucho 14 dias distintos (una semana arriba y otra abajo)
    expect(count).toBeLessThanOrEqual(14);

    await targets.first().click();
    await expect(page.getByText('Sesion reprogramada')).toBeVisible({ timeout: 5000 });

    // Ya no esta en el dia de origen: se ha ido al destino, no se ha duplicado
    await expect(page.getByText('Planificado')).toHaveCount(0);
  });

  test('una sesion se salta, nunca se borra', async ({ page }) => {
    await goToNextWeekSameDay(page);
    await page.getByRole('button', { name: 'Saltar' }).first().click();
    await expect(page.getByText('Saltado').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Test Push Day').first()).toBeVisible();
  });

  test('la plantilla semanal sigue siendo editable', async ({ page }) => {
    await page.getByRole('button', { name: 'Editar plantilla semanal' }).click();
    await expect(page.getByRole('dialog', { name: 'Programa Semanal' })).toBeVisible();
  });
});
