import { describe, it, expect } from 'vitest';
import { calculateWorkoutXP, calculateNewUserStats, calculateTier, isPR } from './xp';
import { WorkoutSession, UserProfile } from '../types';

const makeCompletedSession = (
  sets: { weight: number; reps: number; rpe?: number; completed?: boolean }[],
  options?: { startTime?: number }
): WorkoutSession => ({
  id: 'test',
  name: 'Test Workout',
  duration: '60',
  muscleFocus: ['Chest'],
  completed: true,
  xpReward: 0,
  status: 'completed',
  startTime: options?.startTime || Date.now(),
  exercises: [
    {
      exerciseId: 'bp01',
      restTimer: 90,
      sets: sets.map((s, i) => ({
        id: `s${i}`,
        type: 'top' as const,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe || 7,
        completed: s.completed !== false,
        targetReps: '8-12',
        targetRPE: 8,
      })),
    },
  ],
});

describe('calculateWorkoutXP', () => {
  it('gives 5 XP per completed set', () => {
    const session = makeCompletedSession([
      { weight: 80, reps: 10 },
      { weight: 80, reps: 10 },
      { weight: 80, reps: 10 },
    ]);
    const result = calculateWorkoutXP(session, 0);
    expect(result.setsXP).toBe(15);
  });

  it('gives RPE bonus for sets with RPE >= 9', () => {
    const session = makeCompletedSession([
      { weight: 80, reps: 10, rpe: 9 },
      { weight: 80, reps: 10, rpe: 10 },
      { weight: 80, reps: 10, rpe: 7 },
    ]);
    const result = calculateWorkoutXP(session, 0);
    expect(result.rpeBonus).toBe(20); // 2 sets * 10 XP
  });

  it('gives completion bonus when all sets completed', () => {
    const session = makeCompletedSession([
      { weight: 80, reps: 10 },
      { weight: 80, reps: 10 },
    ]);
    const result = calculateWorkoutXP(session, 0);
    expect(result.completionBonus).toBe(30);
  });

  it('no completion bonus when sets incomplete', () => {
    const session = makeCompletedSession([
      { weight: 80, reps: 10, completed: true },
      { weight: 0, reps: 0, completed: false },
    ]);
    const result = calculateWorkoutXP(session, 0);
    expect(result.completionBonus).toBe(0);
  });

  it('detects PR when exceeding previous record', () => {
    const session = makeCompletedSession([{ weight: 100, reps: 8 }]);
    const prs = new Map([['bp01', { weight: 90, reps: 8, date: '2026-01-01' }]]);
    const result = calculateWorkoutXP(session, 0, prs);
    expect(result.prBonus).toBe(25);
    expect(result.prsAchieved).toContain('bp01');
  });

  it('no PR when weight is same or less', () => {
    const session = makeCompletedSession([{ weight: 80, reps: 10 }]);
    const prs = new Map([['bp01', { weight: 80, reps: 10, date: '2026-01-01' }]]);
    const result = calculateWorkoutXP(session, 0, prs);
    expect(result.prBonus).toBe(0);
  });

  it('applies streak multiplier', () => {
    const session = makeCompletedSession([{ weight: 80, reps: 10 }]);
    // 10 day streak = 20% bonus
    const result = calculateWorkoutXP(session, 10);
    // base = 5 (set) + 30 (completion) + 25 (first PR, no history) = 60
    // with 20% streak = 60 * 1.2 = 72
    expect(result.streakMultiplier).toBe(1.2);
    expect(result.totalXP).toBe(72);
  });

  it('caps streak bonus at 50%', () => {
    const session = makeCompletedSession([{ weight: 80, reps: 10 }]);
    const result = calculateWorkoutXP(session, 100); // 100 days
    expect(result.streakMultiplier).toBe(1.5); // Capped at 50%
  });
});

describe('calculateNewUserStats', () => {
  const baseUser: UserProfile = {
    name: 'Test',
    level: 5,
    xp: 100,
    xpToNextLevel: 200,
    streak: 3,
    avatarUrl: '',
    tier: 'Novice',
  };

  it('adds XP correctly', () => {
    const result = calculateNewUserStats(baseUser, 50);
    expect(result.xp).toBe(150);
    expect(result.level).toBe(5);
  });

  it('handles level up', () => {
    const result = calculateNewUserStats(baseUser, 150);
    expect(result.level).toBe(6);
    expect(result.xp).toBe(50); // 100 + 150 - 200 = 50
  });

  it('increments streak', () => {
    const result = calculateNewUserStats(baseUser, 10);
    expect(result.streak).toBe(4);
  });
});

describe('calculateTier', () => {
  it('returns correct tiers for levels', () => {
    expect(calculateTier(1)).toBe('Novice');
    expect(calculateTier(9)).toBe('Novice');
    expect(calculateTier(10)).toBe('Intermediate');
    expect(calculateTier(24)).toBe('Intermediate');
    expect(calculateTier(25)).toBe('Advanced');
    expect(calculateTier(49)).toBe('Advanced');
    expect(calculateTier(50)).toBe('Elite');
  });
});

describe('isPR', () => {
  it('returns true for first recorded set', () => {
    expect(isPR('bp01', 80, 10, new Map())).toBe(true);
  });

  it('returns true when weight exceeds previous', () => {
    const prs = new Map([['bp01', { weight: 80, reps: 10, date: '' }]]);
    expect(isPR('bp01', 82.5, 10, prs)).toBe(true);
  });

  it('returns false when weight is same', () => {
    const prs = new Map([['bp01', { weight: 80, reps: 10, date: '' }]]);
    expect(isPR('bp01', 80, 12, prs)).toBe(false);
  });

  it('returns false for 0 weight with no history', () => {
    expect(isPR('bp01', 0, 0, new Map())).toBe(false);
  });
});
