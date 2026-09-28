// Capturas de las pantallas de la Fase 5 (Running), a 375px y 1440px, en claro y oscuro.
// Requiere el servidor de desarrollo levantado:
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-running.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-5';

const STORAGE_KEYS = {
  USER: 'fitgame_user',
  SESSION: 'fitgame_session',
  TEMPLATES: 'fitgame_templates',
  THEME: 'fitgame-theme',
};

const user = {
  name: 'Test User', email: 'test@fitgame.pro', level: 7, xp: 1200, xpToNextLevel: 2000,
  streak: 4, avatarUrl: '', tier: 'Intermediate', daysPerWeek: 4, experienceLevel: 'Intermediate',
  onboardingCompleted: true,
};

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
      localStorage.setItem(keys.TEMPLATES, JSON.stringify([]));
      localStorage.setItem(keys.THEME, theme);
    },
    { keys: STORAGE_KEYS, data: { user }, theme }
  );
  await page.reload();
  await page.waitForSelector('text=Weekly Progress', { timeout: 20000 });
  return { ctx, page };
}

async function openRunLogger(page, vp) {
  if (vp.mobile) {
    await page.getByRole('button', { name: 'Acciones rápidas' }).click();
    await page.getByRole('button', { name: /Registrar carrera/ }).click();
  } else {
    await page.getByRole('navigation', { name: 'Navegación lateral' })
      .getByRole('button', { name: 'Registrar carrera', exact: true }).click();
  }
  await page.waitForSelector('role=heading[name="Registrar carrera"]', { timeout: 10000 });
  await page.waitForTimeout(400);
}

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    const { ctx, page } = await openApp(theme, vp);

    // 1. Registro manual, vacio
    await openRunLogger(page, vp);
    await shoot(page, `carrera-registrar-${vp.name}-${theme}`);

    // 2. Con datos: ritmo en vivo, esfuerzo y tipo de sesion
    await page.getByLabel('Distancia en kilometros').fill('10');
    await page.getByLabel('Duracion en minutos').fill('52');
    await page.getByRole('radio', { name: 'Tempo' }).click();
    await page.waitForTimeout(300);
    await shoot(page, `carrera-con-datos-${vp.name}-${theme}`);

    // 3. Plan de carrera por objetivo, desde el calendario
    if (vp.mobile) {
      await page.getByRole('navigation', { name: 'Navegación principal' })
        .getByRole('button', { name: 'Plan', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Programa', exact: true }).click();
    }
    await page.waitForSelector('role=heading[name="Plan"]', { timeout: 10000 });
    await page.getByRole('button', { name: 'Generar plan de carrera' }).click();
    await page.waitForSelector('role=heading[name="Plan de carrera"]', { timeout: 10000 });
    await page.waitForTimeout(300);
    await shoot(page, `plan-carrera-${vp.name}-${theme}`);

    await ctx.close();
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
