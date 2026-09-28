import { Page } from '@playwright/test';

// Mirror the app's localStorage keys
export const STORAGE_KEYS = {
  USER: 'fitgame_user',
  TEMPLATES: 'fitgame_templates',
  ACTIVE_WORKOUT: 'fitgame_activeWorkout',
  HISTORY: 'fitgame_history',
  LAST_SESSION: 'fitgame_lastSession',
  SESSION: 'fitgame_session',
  SCHEDULE: 'fitgame_schedule',
  OFFLINE_QUEUE: 'fitgame_offlineQueue',
} as const;

export function mockUser(overrides?: Record<string, unknown>) {
  return {
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
    ...overrides,
  };
}

export function mockTemplate(overrides?: Record<string, unknown>) {
  const id = crypto.randomUUID();
  return {
    id,
    name: 'Test Push Day',
    description: 'Chest, shoulders and triceps',
    muscleFocus: ['Chest', 'Triceps'],
    exercises: [
      {
        exerciseId: 'bp01',
        sets: 3,
        targetReps: '8-12',
        targetRPE: 8,
        restTimer: 120,
      },
      {
        exerciseId: 'sq01',
        sets: 3,
        targetReps: '8-12',
        targetRPE: 8,
        restTimer: 120,
      },
    ],
    duration: '60 min',
    difficulty: 'Intermediate',
    ...overrides,
  };
}

function mockCompletedSession(templateName: string) {
  return {
    id: crypto.randomUUID(),
    name: templateName,
    duration: '45 min',
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 900000,
    muscleFocus: ['Chest', 'Triceps'],
    exercises: [
      {
        exerciseId: 'bp01',
        sets: [
          { id: crypto.randomUUID(), type: 'top', weight: 60, reps: 10, rpe: 7, completed: true, targetReps: '8-12', targetRPE: 8 },
          { id: crypto.randomUUID(), type: 'top', weight: 60, reps: 10, rpe: 8, completed: true, targetReps: '8-12', targetRPE: 8 },
          { id: crypto.randomUUID(), type: 'top', weight: 60, reps: 8, rpe: 9, completed: true, targetReps: '8-12', targetRPE: 8 },
        ],
        restTimer: 120,
      },
    ],
    completed: true,
    xpReward: 55,
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
  };
}

/**
 * Wait for the dashboard to be fully loaded (not just sidebar nav).
 * "Weekly Progress" is unique to the Dashboard page content.
 */
async function waitForDashboard(page: Page) {
  await page.waitForSelector('text=Weekly Progress', { timeout: 15000 });
}

/**
 * Inject authenticated user state into localStorage and navigate to dashboard.
 * Skips login and onboarding.
 */
export async function seedAuth(page: Page) {
  await page.goto('/');
  await page.evaluate(
    ({ keys, user }) => {
      localStorage.setItem(keys.USER, JSON.stringify(user));
      localStorage.setItem(keys.SESSION, 'true');
    },
    { keys: STORAGE_KEYS, user: mockUser() }
  );
  await page.reload();
  await waitForDashboard(page);
}

/**
 * Inject full state: auth + templates + schedule + history.
 */
export async function seedFullState(page: Page) {
  const template = mockTemplate();
  const today = new Date().getDay(); // 0=Sun..6=Sat

  await page.goto('/');
  await page.evaluate(
    ({ keys, user, templates, schedule, history }) => {
      localStorage.setItem(keys.USER, JSON.stringify(user));
      localStorage.setItem(keys.SESSION, 'true');
      localStorage.setItem(keys.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem(keys.SCHEDULE, JSON.stringify(schedule));
      localStorage.setItem(keys.HISTORY, JSON.stringify(history));
    },
    {
      keys: STORAGE_KEYS,
      user: mockUser(),
      templates: [template],
      schedule: { [today]: template.id },
      history: [mockCompletedSession(template.name)],
    }
  );
  await page.reload();
  await waitForDashboard(page);
}

/**
 * Perform login through the UI (offline mock mode).
 */
export async function login(page: Page, email = 'test@fitgame.pro') {
  await page.goto('/');
  await page.fill('#login-email', email);
  await page.fill('#login-password', 'password123');
  await page.click('button:has-text("Start Training")');
}

/**
 * Complete the full onboarding wizard through the UI.
 * `discipline` decide cuantos pasos hay: "Carrera" salta el de equipamiento.
 */
export async function completeOnboarding(
  page: Page,
  discipline: 'Gimnasio' | 'Carrera' | 'Las dos' = 'Gimnasio'
) {
  // Paso 1: Disciplina
  await page.waitForSelector('text=Que entrenas?', { timeout: 10000 });
  if (discipline !== 'Gimnasio') {
    await page.getByText(discipline, { exact: true }).click();
  }
  await page.click('button:has-text("Siguiente")');

  // Paso 2: Objetivo — ya hay uno marcado por defecto
  await page.waitForSelector('text=Cual es tu objetivo?');
  await page.click('button:has-text("Siguiente")');

  // Paso 3: Disponibilidad — 4 dias / 60 min por defecto
  await page.waitForSelector('text=Disponibilidad');
  await page.click('button:has-text("Siguiente")');

  // Paso 4: Equipamiento — solo existe si se entrena en gimnasio
  if (discipline !== 'Carrera') {
    await page.waitForSelector('text=Equipamiento');
    await page.click('button:has-text("Siguiente")');
  }

  // Nivel de experiencia — Intermedio por defecto
  await page.waitForSelector('text=Nivel de Experiencia');
  await page.click('button:has-text("Siguiente")');

  // Lesiones — se puede pasar sin marcar nada
  await page.waitForSelector('text=Alguna lesion?');
  await page.click('button:has-text("Siguiente")');

  // Plan generado
  await page.waitForSelector('text=Tu Plan de Entrenamiento');
  await page.click('button:has-text("Siguiente")');

  // Programa semanal
  await page.waitForSelector('text=Programa Semanal');
  await page.click('button:has-text("Siguiente")');

  // Resumen
  await page.waitForSelector('text=Todo Listo!');
  await page.click('button:has-text("Comenzar!")');

  // Wait for onboarding to disappear and dashboard content to load
  await page.waitForSelector('text=Todo Listo!', { state: 'hidden', timeout: 10000 });
  await waitForDashboard(page);
}
