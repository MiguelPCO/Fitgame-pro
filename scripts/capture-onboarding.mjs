// Capturas del onboarding (Fase 3), a 375px y 1440px, en claro y oscuro.
// Requiere el servidor de desarrollo levantado:
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-onboarding.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-3';

// Usuario recien registrado: sin onboardingCompleted, el asistente se muestra solo.
const newUser = {
  name: 'Test User',
  email: 'test@fitgame.pro',
  level: 1,
  xp: 0,
  xpToNextLevel: 500,
  streak: 0,
  avatarUrl: '',
  tier: 'Novice',
};

const viewports = [
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

// Pasos del recorrido de gimnasio, en orden.
const gymSteps = [
  'disciplina',
  'objetivo',
  'disponibilidad',
  'equipamiento',
  'experiencia',
  'lesiones',
  'plan',
  'programa',
  'resumen',
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let count = 0;

async function newSession(theme, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate(
    ({ user, theme }) => {
      localStorage.setItem('fitgame_user', JSON.stringify(user));
      localStorage.setItem('fitgame_session', 'true');
      localStorage.setItem('fitgame-theme', theme);
    },
    { user: newUser, theme }
  );
  await page.reload();
  await page.waitForSelector('text=Que entrenas?', { timeout: 20000 });
  await page.waitForTimeout(1200);
  return { ctx, page };
}

const shoot = async (page, name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  count++;
  console.log(`  ${name}.png`);
};

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    // Recorrido de gimnasio: los 9 pasos
    const { ctx, page } = await newSession(theme, vp);

    for (const step of gymSteps) {
      // La pregunta de lesiones se ve mejor con algo marcado
      if (step === 'lesiones') {
        await page.getByRole('button', { name: 'Rodilla' }).click();
        await page.waitForTimeout(300);
      }
      await shoot(page, `${step}-${vp.name}-${theme}`);
      if (step !== 'resumen') {
        await page.click('button:has-text("Siguiente")');
        await page.waitForTimeout(500);
      }
    }
    await ctx.close();

    // Recorrido de carrera: salta equipamiento y genera plan de carrera
    const run = await newSession(theme, vp);
    await run.page.getByText('Carrera', { exact: true }).click();
    await run.page.waitForTimeout(300);
    await shoot(run.page, `disciplina-carrera-${vp.name}-${theme}`);

    for (let i = 0; i < 5; i++) {
      await run.page.click('button:has-text("Siguiente")');
      await run.page.waitForTimeout(400);
    }
    await run.page.waitForSelector('text=Tu Plan de Entrenamiento', { timeout: 10000 });
    await run.page.waitForTimeout(500);
    await shoot(run.page, `plan-carrera-${vp.name}-${theme}`);
    await run.ctx.close();
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
