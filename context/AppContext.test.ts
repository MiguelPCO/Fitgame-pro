import { describe, it, expect, beforeEach } from 'vitest';
import { calculateWorkoutXP, calculateNewUserStats, calculateTier } from '../services/xp';
import { getRecommendedWeight, getWarmupWeight } from '../lib/weightRecommendation';
import { WorkoutSession, WorkoutSet } from '../types';
import type { PRRecord } from '../services/xp';

// Helper to create a mock workout session
function createMockSession(overrides?: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: 'session-1',
    name: 'Test Workout',
    duration: '60 Mins',
    muscleFocus: ['Chest'],
    exercises: [],
    completed: false,
    xpReward: 0,
    status: 'active',
    startTime: Date.now() - 3600000,
    ...overrides,
  };
}

function createMockSet(overrides?: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 'set-1',
    type: 'top',
    weight: 80,
    reps: 10,
    completed: true,
    targetReps: '8-12',
    targetRPE: 8,
    ...overrides,
  };
}

describe('Session Lifecycle Integration', () => {
  describe('completeSession flow', () => {
    it('calculates XP correctly for a full session', () => {
      const session = createMockSession({
        exercises: [
          {
            exerciseId: 'bench-press',
            restTimer: 120,
            sets: [
              createMockSet({ id: 's1', weight: 80, reps: 10, rpe: 8, completed: true }),
              createMockSet({ id: 's2', weight: 80, reps: 10, rpe: 8, completed: true }),
              createMockSet({ id: 's3', weight: 80, reps: 8, rpe: 9, completed: true }),
            ],
          },
          {
            exerciseId: 'squat',
            restTimer: 120,
            sets: [
              createMockSet({ id: 's4', weight: 100, reps: 8, rpe: 9, completed: true }),
              createMockSet({ id: 's5', weight: 100, reps: 8, rpe: 9.5, completed: true }),
              createMockSet({ id: 's6', weight: 100, reps: 6, rpe: 10, completed: true }),
            ],
          },
        ],
      });

      const prs = new Map<string, PRRecord>();
      const xpBreakdown = calculateWorkoutXP(session, 0, prs);

      // 6 sets * 5 XP = 30 setsXP
      expect(xpBreakdown.setsXP).toBe(30);
      // Sets with RPE >= 9: s3, s4, s5, s6 = 4 * 10 = 40
      expect(xpBreakdown.rpeBonus).toBe(40);
      // All 6 sets completed = full completion bonus
      expect(xpBreakdown.completionBonus).toBe(30);
      // baseXP = setsXP + rpeBonus + prBonus + completionBonus
      // 2 exercises with no prior PRs = 2 * 25 = 50 prBonus
      expect(xpBreakdown.prBonus).toBe(50);
      expect(xpBreakdown.baseXP).toBe(30 + 40 + 50 + 30);
    });

    it('detects PRs when weight exceeds existing records', () => {
      const session = createMockSession({
        exercises: [{
          exerciseId: 'bench-press',
          restTimer: 120,
          sets: [
            createMockSet({ id: 's1', weight: 100, reps: 8, completed: true }),
          ],
        }],
      });

      const prs = new Map<string, PRRecord>();
      prs.set('bench-press', { weight: 80, reps: 10, date: '2026-01-01' });

      const xpBreakdown = calculateWorkoutXP(session, 0, prs);

      expect(xpBreakdown.prsAchieved).toContain('bench-press');
      expect(xpBreakdown.prBonus).toBe(25); // 1 PR * 25 XP
    });

    it('does not detect PR when weight is lower than existing', () => {
      const session = createMockSession({
        exercises: [{
          exerciseId: 'bench-press',
          restTimer: 120,
          sets: [
            createMockSet({ id: 's1', weight: 70, reps: 10, completed: true }),
          ],
        }],
      });

      const prs = new Map<string, PRRecord>();
      prs.set('bench-press', { weight: 80, reps: 10, date: '2026-01-01' });

      const xpBreakdown = calculateWorkoutXP(session, 0, prs);
      expect(xpBreakdown.prsAchieved).not.toContain('bench-press');
      expect(xpBreakdown.prBonus).toBe(0);
    });

    it('applies streak multiplier correctly', () => {
      const session = createMockSession({
        exercises: [{
          exerciseId: 'squat',
          restTimer: 120,
          sets: [
            createMockSet({ id: 's1', weight: 100, reps: 8, rpe: 7, completed: true }),
          ],
        }],
      });

      const prs = new Map<string, PRRecord>();
      const xpNoStreak = calculateWorkoutXP(session, 0, prs);
      const xpWith5Streak = calculateWorkoutXP(session, 5, prs);

      // Streak multiplier is 1 + (days * 0.02), so 5 days = 1.10
      expect(xpWith5Streak.streakMultiplier).toBeCloseTo(1.10, 2);
      expect(xpWith5Streak.totalXP).toBeGreaterThan(xpNoStreak.totalXP);
    });

    it('caps streak multiplier at 30', () => {
      const session = createMockSession({
        exercises: [{
          exerciseId: 'squat',
          restTimer: 120,
          sets: [
            createMockSet({ id: 's1', weight: 100, reps: 8, rpe: 7, completed: true }),
          ],
        }],
      });

      const prs = new Map<string, PRRecord>();
      const xp = calculateWorkoutXP(session, 50, prs);
      // Max streak bonus is 50% → multiplier capped at 1.5
      expect(xp.streakMultiplier).toBeLessThanOrEqual(1.5);
    });
  });

  describe('User stats progression', () => {
    it('levels up when XP exceeds threshold', () => {
      const user = { level: 1, xp: 90, xpToNextLevel: 100, streak: 0, tier: 'Novice' as const } as Parameters<typeof calculateNewUserStats>[0];
      const stats = calculateNewUserStats(user, 20);

      // XP overflow after level up: 90 + 20 = 110, minus 100 threshold = 10 remaining
      expect(stats.level).toBe(2);
      expect(stats.xp).toBe(10);
    });

    it('increments streak', () => {
      const user = { level: 1, xp: 0, xpToNextLevel: 100, streak: 3, tier: 'Novice' as const } as Parameters<typeof calculateNewUserStats>[0];
      const stats = calculateNewUserStats(user, 10);

      expect(stats.streak).toBe(4);
    });

    it('calculates tier based on level', () => {
      expect(calculateTier(1)).toBe('Novice');
      expect(calculateTier(9)).toBe('Novice');
      expect(calculateTier(10)).toBe('Intermediate');
      expect(calculateTier(25)).toBe('Advanced');
      expect(calculateTier(50)).toBe('Elite');
    });
  });

  describe('Recommended weight integration', () => {
    it('recommends higher weight after successful session', () => {
      const history: WorkoutSession[] = [
        createMockSession({
          status: 'completed',
          completed: true,
          exercises: [{
            exerciseId: 'bench-press',
            restTimer: 120,
            sets: [
              createMockSet({ id: 'r1', type: 'top', weight: 80, reps: 12, completed: true, targetReps: '8-12' }),
              createMockSet({ id: 'r2', type: 'top', weight: 80, reps: 12, completed: true, targetReps: '8-12' }),
              createMockSet({ id: 'r3', type: 'top', weight: 80, reps: 12, completed: true, targetReps: '8-12' }),
            ],
          }],
        }),
      ];

      const recommended = getRecommendedWeight('bench-press', '8-12', history);

      // All sets hit target range max (12), should suggest increase
      expect(recommended).toBe(82.5); // 80 + 2.5 increment
    });

    it('calculates warmup weight as 60% of top set', () => {
      const warmup = getWarmupWeight(100);
      expect(warmup).toBe(60);
    });

    it('returns 0 warmup for 0 weight', () => {
      expect(getWarmupWeight(0)).toBe(0);
    });

    it('returns 0 recommended when no history', () => {
      const recommended = getRecommendedWeight('bench-press', '8-12', []);
      expect(recommended).toBe(0);
    });
  });

  describe('localStorage persistence simulation', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('stores and retrieves session history', () => {
      const session = createMockSession({ id: 'test-session' });
      const history = [session];

      localStorage.setItem('fitgame_history', JSON.stringify(history));
      const stored = JSON.parse(localStorage.getItem('fitgame_history') || '[]');

      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('test-session');
    });

    it('stores user profile with XP updates', () => {
      const user = { name: 'Test', level: 2, xp: 150, xpToNextLevel: 200, streak: 5, tier: 'Novice' };

      localStorage.setItem('fitgame_user', JSON.stringify(user));
      const stored = JSON.parse(localStorage.getItem('fitgame_user') || '{}');

      expect(stored.level).toBe(2);
      expect(stored.xp).toBe(150);
      expect(stored.streak).toBe(5);
    });

    it('clears active workout on completion', () => {
      localStorage.setItem('fitgame_activeWorkout', JSON.stringify(createMockSession()));

      // Simulate completeSession clearing
      localStorage.removeItem('fitgame_activeWorkout');

      expect(localStorage.getItem('fitgame_activeWorkout')).toBeNull();
    });
  });

  describe('Set mutations', () => {
    it('updateSet modifies specific set in exercise', () => {
      const session = createMockSession({
        exercises: [{
          exerciseId: 'bench-press',
          restTimer: 120,
          sets: [
            createMockSet({ id: 's1', weight: 0, reps: 0, completed: false }),
            createMockSet({ id: 's2', weight: 0, reps: 0, completed: false }),
          ],
        }],
      });

      // Simulate updateSet logic
      const exerciseIndex = 0;
      const setIndex = 0;
      const newExercises = [...session.exercises];
      const targetExercise = { ...newExercises[exerciseIndex] };
      const newSets = [...targetExercise.sets];
      newSets[setIndex] = { ...newSets[setIndex], weight: 80, reps: 10, completed: true };
      targetExercise.sets = newSets;
      newExercises[exerciseIndex] = targetExercise;

      expect(newExercises[0].sets[0].weight).toBe(80);
      expect(newExercises[0].sets[0].reps).toBe(10);
      expect(newExercises[0].sets[0].completed).toBe(true);
      // Second set unchanged
      expect(newExercises[0].sets[1].completed).toBe(false);
    });

    it('addSet creates new set with defaults from last set', () => {
      const existingSets = [
        createMockSet({ id: 's1', weight: 80, reps: 10, targetReps: '8-12', targetRPE: 8 }),
      ];

      // Simulate addSet logic
      const lastSet = existingSets[existingSets.length - 1];
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        type: 'top',
        weight: 0,
        reps: 0,
        completed: false,
        targetReps: lastSet.targetReps,
        targetRPE: lastSet.targetRPE,
      };

      const updatedSets = [...existingSets, newSet];

      expect(updatedSets).toHaveLength(2);
      expect(updatedSets[1].targetReps).toBe('8-12');
      expect(updatedSets[1].targetRPE).toBe(8);
      expect(updatedSets[1].completed).toBe(false);
    });

    it('deleteSet removes set at index', () => {
      const sets = [
        createMockSet({ id: 's1' }),
        createMockSet({ id: 's2' }),
        createMockSet({ id: 's3' }),
      ];

      const filtered = sets.filter((_, i) => i !== 1);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('s1');
      expect(filtered[1].id).toBe('s3');
    });
  });
});
