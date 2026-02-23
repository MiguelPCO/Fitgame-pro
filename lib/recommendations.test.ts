import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWorkoutRecommendation } from './recommendations';
import type { WorkoutSession, WorkoutTemplate, UserProfile } from '../types';

const TEMPLATE_CHEST: WorkoutTemplate = {
  id: 't1',
  name: 'Push Day',
  muscleFocus: ['Chest', 'Shoulders', 'Triceps'],
  exercises: [],
  duration: '60 min',
  difficulty: 'Intermediate',
};

const TEMPLATE_LEGS: WorkoutTemplate = {
  id: 't2',
  name: 'Leg Day',
  muscleFocus: ['Legs', 'Glutes'],
  exercises: [],
  duration: '60 min',
  difficulty: 'Intermediate',
};

const USER: UserProfile = {
  id: 'u1',
  name: 'Test',
  email: 'test@test.com',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streak: 3,
  tier: 'Novice',
  goal: 'Hypertrophy',
  daysPerWeek: 4,
  minutesPerSession: 60,
  equipment: ['Barbell'],
  experienceLevel: 'Intermediate',
  onboardingCompleted: true,
};

function makeSession(muscleFocus: string[], endTime: number): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    name: 'Test',
    muscleFocus,
    exercises: [],
    completed: true,
    xpReward: 50,
    endTime,
    duration: '60 min',
    status: 'completed',
  };
}

describe('getWorkoutRecommendation', () => {
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns new_user when no history and no templates', () => {
    const rec = getWorkoutRecommendation({
      workoutHistory: [],
      muscleFatigue: {},
      user: USER,
      templates: [],
      scheduledTemplate: null,
    });
    expect(rec.type).toBe('new_user');
  });

  it('returns rest if already worked out today', () => {
    const session = makeSession(['Chest'], now - 1000 * 60 * 30); // 30 min ago
    const rec = getWorkoutRecommendation({
      workoutHistory: [session],
      muscleFatigue: {},
      user: USER,
      templates: [TEMPLATE_CHEST],
      scheduledTemplate: null,
    });
    expect(rec.type).toBe('rest');
    expect(rec.readinessScore).toBe(0);
  });

  it('returns scheduled when scheduledTemplate is provided', () => {
    const rec = getWorkoutRecommendation({
      workoutHistory: [],
      muscleFatigue: {},
      user: USER,
      templates: [TEMPLATE_CHEST],
      scheduledTemplate: TEMPLATE_CHEST,
    });
    expect(rec.type).toBe('scheduled');
    expect(rec.suggestedTemplate?.id).toBe('t1');
  });

  it('returns suggested with matching template when no schedule', () => {
    const rec = getWorkoutRecommendation({
      workoutHistory: [],
      muscleFatigue: {},
      user: USER,
      templates: [TEMPLATE_CHEST, TEMPLATE_LEGS],
      scheduledTemplate: null,
    });
    expect(rec.type).toBe('suggested');
    expect(rec.suggestedTemplate).not.toBeNull();
    expect(rec.targetMuscles.length).toBeGreaterThan(0);
  });

  it('avoids overloaded muscles (readiness < 25)', () => {
    // Simulate heavily fatigued Chest
    const heavyFatigue = {
      Chest: { score: 90, level: 'overloaded' as const },
    };
    const rec = getWorkoutRecommendation({
      workoutHistory: [],
      muscleFatigue: heavyFatigue,
      user: { ...USER, goal: 'Hypertrophy' },
      templates: [TEMPLATE_CHEST, TEMPLATE_LEGS],
      scheduledTemplate: null,
    });
    expect(rec.targetMuscles).not.toContain('Chest');
  });

  it('readinessScore reflects muscle freshness', () => {
    // All muscles fresh → high readiness
    const fresh = getWorkoutRecommendation({
      workoutHistory: [],
      muscleFatigue: {},
      user: USER,
      templates: [TEMPLATE_CHEST],
      scheduledTemplate: null,
    });
    expect(fresh.readinessScore).toBeGreaterThan(50);
  });

  it('scheduled priority overrides suggestion', () => {
    const session = makeSession(['Legs'], now - 1000 * 60 * 60 * 48); // 2 days ago
    const rec = getWorkoutRecommendation({
      workoutHistory: [session],
      muscleFatigue: { Legs: { score: 30, level: 'moderate' as const } },
      user: USER,
      templates: [TEMPLATE_CHEST, TEMPLATE_LEGS],
      scheduledTemplate: TEMPLATE_CHEST,
    });
    expect(rec.type).toBe('scheduled');
    expect(rec.suggestedTemplate?.id).toBe('t1');
  });
});
