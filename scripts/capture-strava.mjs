// Capturas de la tarjeta "Integraciones" (Strava) en Ajustes, a 375px y 1440px,
// en claro y oscuro. A diferencia de las demas capturas de este proyecto, esta
// pantalla solo se muestra con userId real (viene de la sesion de Supabase Auth,
// no de localStorage): sin ella, la tarjeta se oculta a proposito, porque
// Strava no puede funcionar sin cuenta en la nube. Por eso este script arranca
// su PROPIO servidor con credenciales de Supabase falsas pero con forma valida,
// y siembra una sesion falsa + intercepta las llamadas REST con Playwright, en
// vez de solo sembrar localStorage como el resto de scripts de docs/redesign.
//
//   npx vite --mode test --port 4001 --strictPort
//   node scripts/capture-strava.mjs [baseURL] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4001';
const OUT = process.argv[3] || 'docs/redesign/screens/fase-7';
const FAKE_HOST = 'fake-test-project.supabase.co';

const STORAGE_KEYS = {
  USER: 'fitgame_user',
  SESSION: 'fitgame_session',
  THEME: 'fitgame-theme',
};

const USER_ID = '11111111-1111-4111-8111-111111111111';

const user = {
  name: 'Test User', email: 'test@fitgame.pro', level: 12, xp: 450, xpToNextLevel: 800,
  streak: 6, avatarUrl: '', tier: 'Intermediate', daysPerWeek: 4, onboardingCompleted: true,
};

// JWT sin verificar criptograficamente por el cliente: getSession() de
// supabase-js solo decodifica la forma y la caducidad, no la firma.
function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}
function fakeJwt() {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const farFuture = Math.floor(Date.now() / 1000) + 3600;
  const payload = base64url({ sub: USER_ID, email: user.email, role: 'authenticated', exp: farFuture });
  return `${header}.${payload}.fake-signature`;
}
function fakeSession() {
  const token = fakeJwt();
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token: token, token_type: 'bearer', expires_in: 3600, expires_at: expiresAt,
    refresh_token: 'fake-refresh-token',
    user: { id: USER_ID, email: user.email, app_metadata: {}, user_metadata: {}, aud: 'authenticated' },
  };
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

async function openSettings(theme, vp, stravaConnected) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });

  // Cualquier llamada REST a nuestro host falso responde vacio por defecto,
  // para que las cargas de plantillas/historial/etc no se queden colgadas
  // intentando resolver un dominio que no existe.
  await ctx.route(`https://${FAKE_HOST}/**`, route => {
    const url = route.request().url();

    if (url.includes('/rest/v1/strava_connections')) {
      const body = stravaConnected
        ? { user_id: USER_ID, athlete_id: 87654321, connected_at: new Date(Date.now() - 5 * 86400000).toISOString(), last_synced_at: new Date(Date.now() - 3600000).toISOString() }
        : null;
      // .maybeSingle() en services/strava.ts espera un objeto o null, no un array.
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }

    if (url.includes('/rest/v1/profiles')) {
      // .single(): un objeto, con los mismos campos que consume AppContext.loadUserData.
      const profile = {
        id: USER_ID, email: user.email, name: user.name, level: user.level, xp: user.xp,
        xp_to_next_level: user.xpToNextLevel, streak: user.streak, tier: user.tier,
        goal: null, days_per_week: user.daysPerWeek, minutes_per_session: null, equipment: [],
        experience_level: null, discipline: null, injuries: [], limitations: null,
        weekly_schedule: null, onboarding_completed: true,
      };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate(
    ({ keys, data, theme, session, fakeHost }) => {
      localStorage.setItem(keys.USER, JSON.stringify(data.user));
      localStorage.setItem(keys.SESSION, 'true');
      localStorage.setItem(keys.THEME, theme);
      // Clave de storage de supabase-js v2: sb-<project-ref>-auth-token.
      const ref = fakeHost.split('.')[0];
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    },
    { keys: STORAGE_KEYS, data: { user }, theme, session: fakeSession(), fakeHost: FAKE_HOST }
  );
  await page.reload();
  await page.waitForSelector('text=Weekly Progress', { timeout: 20000 });

  if (vp.mobile) {
    await page.getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: 'Navegación lateral' })
      .getByRole('button', { name: 'Configuración', exact: true }).click();
  }
  await page.waitForSelector('text=Configuracion', { timeout: 10000 });
  const integrations = page.getByText('Integraciones', { exact: true });
  await integrations.waitFor({ timeout: 10000 });
  await integrations.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return { ctx, page };
}

for (const theme of ['dark', 'light']) {
  for (const vp of viewports) {
    for (const connected of [false, true]) {
      const { ctx, page } = await openSettings(theme, vp, connected);
      const label = connected ? 'strava-conectado' : 'strava-conectar';
      await shoot(page, `${label}-${vp.name}-${theme}`);
      await ctx.close();
    }
  }
}

await browser.close();
console.log(`\n${count} capturas en ${OUT}`);
