// Capturas de las pantallas de la Fase 6 (Gamificacion), a 375px y 1440px, en
// claro y oscuro. Requiere el servidor de desarrollo levantado:
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-gamification.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-6';

const STORAGE_KEYS = {
  USER: 'fitgame_user',
  SESSION: 'fitgame_session',
  HISTORY: 'fitgame_history',
  THEME: 'fitgame-theme',
  // Evita el modal de resumen semanal: no es parte de esta fase, pero el
  // historial sembrado (semana pasada + esta semana) lo dispara igual.
  LAST_SUMMARY_WEEK: 'fitgame_last_summary_week',
};

// Racha semanal de 6, con historial coherente (una sesion la semana pasada y
// otra esta semana) para que "Racha: 6 semanas" no dependa de si hoy es
// sabado/domingo (el aviso de riesgo solo cambia el boton de Freeze, no la cifra).
const now = Date.now();
const thisWeek = now - 2 * 24 * 60 * 60 * 1000;
const lastWeek = now - 9 * 24 * 60 * 60 * 1000;

const user = {
  name: 'Test User', email: 'test@fitgame.pro', level: 12, xp: 450, xpToNextLevel: 800,
  streak: 6, avatarUrl: '', tier: 'Intermediate', daysPerWeek: 4, onboardingCompleted: true,
};

const makeSession = (id, endTime) => ({
  id, name: 'Empuje A', duration: '48 min', startTime: endTime - 2880000, endTime,
  muscleFocus: ['Chest'], exercises: [], completed: true, status: 'completed',
  xpReward: 220, date: new Date(endTime).toISOString(),
});

const history = [makeSession('s1', lastWeek), makeSession('s2', thisWeek)];

// Replica lib/challenges.ts getWeekStart(): lunes 00:00 de la semana actual.
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

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

async function openApp(theme, vp) {
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
      localStorage.setItem(keys.HISTORY, JSON.stringify(data.history));
      localStorage.setItem(keys.LAST_SUMMARY_WEEK, data.weekStart);
      localStorage.setItem(keys.THEME, theme);
    },
    { keys: STORAGE_KEYS, data: { user, history, weekStart: getWeekStart() }, theme }
  );
  await page.reload();
  await page.waitForSelector('text=Weekly Progress', { timeout: 20000 });
  return { ctx, page };
}

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    const { ctx, page } = await openApp(theme, vp);

    // 1. Dashboard: racha semanal en la cabecera y en la tarjeta
    await shoot(page, `dashboard-racha-${vp.name}-${theme}`);

    // 2. Ajustes: estadistica de racha en semanas
    if (vp.mobile) {
      await page.getByRole('navigation', { name: 'Navegación principal' })
        .getByRole('button', { name: 'Perfil', exact: true }).click();
      await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
    } else {
      await page.getByRole('navigation', { name: 'Navegación lateral' })
        .getByRole('button', { name: 'Configuración', exact: true }).click();
    }
    await page.waitForSelector('text=Configuracion', { timeout: 10000 });
    await page.waitForTimeout(300);
    await shoot(page, `ajustes-racha-${vp.name}-${theme}`);

    await ctx.close();
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
