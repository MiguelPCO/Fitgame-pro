// Capturas de las pantallas del shell, a 375px y 1440px, en claro y oscuro.
// Requiere el servidor de desarrollo levantado:
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-screens.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-2';

const STORAGE_KEYS = {
  USER: 'fitgame_user',
  TEMPLATES: 'fitgame_templates',
  HISTORY: 'fitgame_history',
  SESSION: 'fitgame_session',
  SCHEDULE: 'fitgame_schedule',
};

const user = {
  name: 'Test User',
  email: 'test@fitgame.pro',
  level: 5,
  xp: 120,
  xpToNextLevel: 500,
  streak: 3,
  avatarUrl: '',
  tier: 'Novice',
  goal: 'Hypertrophy',
  daysPerWeek: 4,
  minutesPerSession: 60,
  equipment: ['Gym Complete'],
  experienceLevel: 'Intermediate',
  onboardingCompleted: true,
};

const template = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Test Push Day',
  description: 'Chest, shoulders and triceps',
  muscleFocus: ['Chest', 'Triceps'],
  exercises: [
    { exerciseId: 'bp01', sets: 3, targetReps: '8-12', targetRPE: 8, restTimer: 120 },
    { exerciseId: 'sq01', sets: 3, targetReps: '8-12', targetRPE: 8, restTimer: 120 },
  ],
  duration: '60 min',
  difficulty: 'Intermediate',
};

const session = {
  id: '22222222-2222-4222-8222-222222222222',
  name: template.name,
  duration: '45 min',
  startTime: Date.now() - 3600000,
  endTime: Date.now() - 900000,
  muscleFocus: ['Chest', 'Triceps'],
  exercises: [
    {
      exerciseId: 'bp01',
      sets: [
        { id: 'a', type: 'top', weight: 60, reps: 10, rpe: 7, completed: true, targetReps: '8-12', targetRPE: 8 },
        { id: 'b', type: 'top', weight: 60, reps: 10, rpe: 8, completed: true, targetReps: '8-12', targetRPE: 8 },
        { id: 'c', type: 'top', weight: 60, reps: 8, rpe: 9, completed: true, targetReps: '8-12', targetRPE: 8 },
      ],
      restTimer: 120,
    },
  ],
  completed: true,
  xpReward: 55,
  date: new Date().toISOString().split('T')[0],
  status: 'completed',
};

// En movil se navega por la barra inferior (pestana + sub-pestana);
// en escritorio por la sidebar.
const screens = [
  { file: 'dashboard', tab: 'Hoy', section: null, sidebar: 'Inicio' },
  { file: 'programa', tab: 'Plan', section: 'Programa', sidebar: 'Programa' },
  { file: 'plantillas', tab: 'Plan', section: 'Plantillas', sidebar: 'Plantillas' },
  { file: 'programas', tab: 'Plan', section: 'Programas', sidebar: 'Programas' },
  { file: 'progreso', tab: 'Progreso', section: 'Progreso', sidebar: 'Progreso' },
  { file: 'historial', tab: 'Progreso', section: 'Historial', sidebar: 'Historial' },
  { file: 'configuracion', tab: 'Perfil', section: 'Ajustes', sidebar: 'Configuración' },
  { file: 'retos', tab: 'Perfil', section: 'Retos', sidebar: 'Retos' },
  { file: 'ejercicios', tab: 'Perfil', section: 'Ejercicios', sidebar: 'Ejercicios' },
];

const viewports = [
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let count = 0;

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await ctx.newPage();

    await page.goto(BASE);
    await page.evaluate(
      ({ keys, user, templates, schedule, history, theme }) => {
        localStorage.setItem(keys.USER, JSON.stringify(user));
        localStorage.setItem(keys.SESSION, 'true');
        localStorage.setItem(keys.TEMPLATES, JSON.stringify(templates));
        localStorage.setItem(keys.SCHEDULE, JSON.stringify(schedule));
        localStorage.setItem(keys.HISTORY, JSON.stringify(history));
        localStorage.setItem('fitgame-theme', theme);
      },
      {
        keys: STORAGE_KEYS,
        user,
        templates: [template],
        schedule: { [new Date().getDay()]: template.id },
        history: [session],
        theme,
      }
    );
    await page.reload();
    await page.waitForSelector("text=Weekly Progress", { timeout: 20000 });
    await page.waitForTimeout(1500);

    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' });
    const sections = page.getByRole('navigation', { name: /^Secciones de / });

    for (const screen of screens) {
      if (vp.mobile) {
        await bottomNav.getByRole('button', { name: screen.tab, exact: true }).click();
        await page.waitForTimeout(400);
        if (screen.section) {
          await sections.getByRole('button', { name: screen.section, exact: true }).click();
        }
      } else {
        await page.getByRole('button', { name: screen.sidebar, exact: true }).click();
      }
      await page.waitForTimeout(600);
      const name = `${screen.file}-${vp.name}-${theme}.png`;
      await page.screenshot({ path: `${OUT}/${name}` });
      count++;
      console.log(`  ${name}`);
    }

    // La hoja de acciones del boton central solo existe en movil
    if (vp.mobile) {
      await bottomNav.getByRole('button', { name: 'Hoy', exact: true }).click();
      await page.getByRole('button', { name: 'Acciones rápidas' }).click();
      await page.waitForTimeout(500);
      const name = `acciones-${vp.name}-${theme}.png`;
      await page.screenshot({ path: `${OUT}/${name}` });
      count++;
      console.log(`  ${name}`);
    }

    await ctx.close();
  }
}

// La pantalla de login no lleva sesion sembrada, va aparte.
for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.evaluate((t) => localStorage.setItem('fitgame-theme', t), theme);
    await page.reload();
    await page.waitForSelector('#login-email', { timeout: 20000 });
    const name = `login-${vp.name}-${theme}.png`;
    await page.screenshot({ path: `${OUT}/${name}` });
    count++;
    console.log(`  ${name}`);
    await ctx.close();
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
