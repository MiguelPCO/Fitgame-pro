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
 * Complete the full 7-step onboarding wizard through the UI.
 */
export async function completeOnboarding(page: Page) {
  // Step 1: Goal — Hypertrophy is already selected by default
  await page.waitForSelector('text=Cual es tu objetivo?', { timeout: 10000 });
  await page.click('button:has-text("Siguiente")');

  // Step 2: Availability — defaults are fine (4 days, 60 min)
  await page.waitForSelector('text=Disponibilidad');
  await page.click('button:has-text("Siguiente")');

  // Step 3: Equipment — Gym Complete is already selected by default
  await page.waitForSelector('text=Equipamiento');
  await page.click('button:has-text("Siguiente")');

  // Step 4: Experience — Intermediate is already selected by default
  await page.waitForSelector('text=Nivel de Experiencia');
  await page.click('button:has-text("Siguiente")');

  // Step 5: Generated Plan Preview
  await page.waitForSelector('text=Tu Plan de Entrenamiento');
  await page.click('button:has-text("Siguiente")');

  // Step 6: Schedule
  await page.waitForSelector('text=Programa Semanal');
  await page.click('button:has-text("Siguiente")');

  // Step 7: Summary — click finish
  await page.waitForSelector('text=Todo Listo!');
  await page.click('button:has-text("Comenzar!")');

  // Wait for onboarding to disappear and dashboard content to load
  await page.waitForSelector('text=Todo Listo!', { state: 'hidden', timeout: 10000 });
  await waitForDashboard(page);
}
