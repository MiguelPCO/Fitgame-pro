// Capturas del calendario (Fase 4), a 375px y 1440px, en claro y oscuro.
// Requiere el servidor de desarrollo levantado:
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-schedule.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-4';

const STORAGE_KEYS = {
  USER: 'fitgame_user',
  SESSION: 'fitgame_session',
  TEMPLATES: 'fitgame_templates',
  SCHEDULE: 'fitgame_schedule',
  HISTORY: 'fitgame_history',
  SCHEDULED: 'fitgame_scheduled',
  THEME: 'fitgame-theme',
};

const iso = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const user = {
  name: 'Test User', email: 'test@fitgame.pro', level: 7, xp: 1200, xpToNextLevel: 2000,
  streak: 4, avatarUrl: '', tier: 'Intermediate', daysPerWeek: 4, onboardingCompleted: true,
};

// Tres plantillas de tipos distintos: el calendario tiene que distinguirlas sin color.
const templates = [
  { id: 'tpl-push', name: 'Empuje A', muscleFocus: ['Chest', 'Triceps'], duration: '50 Mins', difficulty: 'Intermediate',
    exercises: [1, 2, 3, 4, 5].map(i => ({ exerciseId: `bp0${i}`, sets: 3, targetReps: '8-12', targetRPE: 8, restTimer: 90 })) },
  { id: 'tpl-pull', name: 'Tiron B', muscleFocus: ['Back', 'Biceps'], duration: '45 Mins', difficulty: 'Intermediate',
    exercises: [1, 2, 3, 4].map(i => ({ exerciseId: `bp0${i}`, sets: 3, targetReps: '8-12', targetRPE: 8, restTimer: 90 })) },
  { id: 'tpl-run', name: 'Rodaje suave', muscleFocus: ['Cardio'], duration: '35 Mins', difficulty: 'Beginner',
    exercises: [{ exerciseId: 'run01', sets: 1, targetReps: '35 min', targetRPE: 5, restTimer: 0 }] },
];

// Lunes/miercoles fuerza, viernes carrera: llena la semana sin inventar nada raro.
const weeklySchedule = { 1: 'tpl-push', 3: 'tpl-pull', 5: 'tpl-run' };

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const history = [{
  id: 'sess-1', name: 'Empuje A', duration: '48 min',
  startTime: Date.now() - 90000000, endTime: Date.now() - 87000000,
  muscleFocus: ['Chest'], exercises: [], completed: true, status: 'completed',
  xpReward: 220, date: `${iso(yesterday)}T18:00:00.000Z`,
}];

const viewports = [
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let count = 0;

const shoot = async (page, name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  count++;
  console.log(`  ${name}.png`);
};

async function openPlan(theme, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate(
    ({ keys, data, theme }) => {
      localStorage.setItem(keys.USER, JSON.stringify(data.user));
      localStorage.setItem(keys.SESSION, 'true');
      localStorage.setItem(keys.TEMPLATES, JSON.stringify(data.templates));
      localStorage.setItem(keys.SCHEDULE, JSON.stringify(data.weeklySchedule));
      localStorage.setItem(keys.HISTORY, JSON.stringify(data.history));
      localStorage.removeItem(keys.SCHEDULED);
      localStorage.setItem(keys.THEME, theme);
    },
    { keys: STORAGE_KEYS, data: { user, templates, weeklySchedule, history }, theme }
  );
  await page.reload();
  await page.waitForSelector('text=Weekly Progress', { timeout: 20000 });

  if (vp.mobile) {
    await page.getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: 'Plan', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Programa', exact: true }).click();
  }
  await page.waitForSelector('role=heading[name="Plan"]', { timeout: 10000 });
  await page.waitForTimeout(600);
  return { ctx, page };
}

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    const { ctx, page } = await openPlan(theme, vp);

    // El dia de hoy puede caer en descanso: se selecciona el primer dia con sesion
    await page.getByRole('group', { name: 'Dias de la semana' })
      .getByRole('button', { name: /Fuerza|Carrera/ }).first().click();
    await page.waitForTimeout(400);

    // 1. Vista semana
    await shoot(page, `plan-semana-${vp.name}-${theme}`);

    // 2. Sesion con las opciones de mover desplegadas
    await page.getByRole('button', { name: /^Mover / }).first().click();
    await page.waitForTimeout(300);
    await shoot(page, `plan-mover-${vp.name}-${theme}`);
    await page.getByRole('button', { name: /^Mover / }).first().click();
    await page.waitForTimeout(200);

    // 3. Vista mes
    await page.getByRole('tab', { name: 'Mes' }).click();
    await page.waitForTimeout(400);
    await shoot(page, `plan-mes-${vp.name}-${theme}`);

    // 4. Hoja del dia, abierta desde el mes (un dia con sesion, no uno de descanso)
    await page.getByRole('group', { name: 'Dias del mes' })
      .getByRole('button', { name: /Fuerza|Carrera/ }).first().click();
    await page.waitForTimeout(500);
    await shoot(page, `plan-dia-${vp.name}-${theme}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 5. Plantilla semanal recurrente
    await page.getByRole('button', { name: 'Editar plantilla semanal' }).click();
    await page.waitForTimeout(500);
    await shoot(page, `plantilla-semanal-${vp.name}-${theme}`);

    await ctx.close();
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
