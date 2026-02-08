import { describe, it, expect } from 'vitest';
import {
  parseRepRange,
  findLastExerciseData,
  getRecommendedWeight,
  getWarmupWeight,
} from './weightRecommendation';
import { WorkoutSession } from '../types';

describe('parseRepRange', () => {
  it('parses "8-12" correctly', () => {
    expect(parseRepRange('8-12')).toEqual({ min: 8, max: 12 });
  });

  it('parses "5-5" correctly', () => {
    expect(parseRepRange('5-5')).toEqual({ min: 5, max: 5 });
  });

  it('parses single number "5"', () => {
    expect(parseRepRange('5')).toEqual({ min: 5, max: 5 });
  });

  it('returns fallback for invalid input', () => {
    expect(parseRepRange('abc')).toEqual({ min: 8, max: 12 });
  });
});

describe('getWarmupWeight', () => {
  it('returns 60% of top set rounded to 2.5', () => {
    expect(getWarmupWeight(100)).toBe(60);
    expect(getWarmupWeight(80)).toBe(47.5);
    expect(getWarmupWeight(60)).toBe(35);
  });

  it('returns 0 for 0 weight', () => {
    expect(getWarmupWeight(0)).toBe(0);
  });
});

const makeSession = (
  exerciseId: string,
  sets: { weight: number; reps: number }[],
): WorkoutSession => ({
  id: 'test-session',
  name: 'Test',
  duration: '60',
  muscleFocus: [],
  completed: true,
  xpReward: 0,
  date: new Date().toISOString(),
  status: 'completed',
  exercises: [
    {
      exerciseId,
      restTimer: 90,
      sets: [
        // warmup set (excluded from analysis)
        { id: 's0', type: 'warmup', weight: 40, reps: 10, completed: true, targetReps: '8-12', targetRPE: 8 },
        // top sets
        ...sets.map((s, i) => ({
          id: `s${i + 1}`,
          type: 'top' as const,
          weight: s.weight,
          reps: s.reps,
          completed: true,
          targetReps: '8-12',
          targetRPE: 8,
        })),
      ],
    },
  ],
});

describe('findLastExerciseData', () => {
  it('returns null when no history', () => {
    expect(findLastExerciseData('bp01', [])).toBeNull();
  });

  it('returns top sets from last session', () => {
    const history = [makeSession('bp01', [{ weight: 80, reps: 10 }, { weight: 80, reps: 9 }])];
    const result = findLastExerciseData('bp01', history);
    expect(result).toHaveLength(2);
    expect(result![0].weight).toBe(80);
  });

  it('returns null for exercise not in history', () => {
    const history = [makeSession('bp01', [{ weight: 80, reps: 10 }])];
    expect(findLastExerciseData('sq01', history)).toBeNull();
  });
});

describe('getRecommendedWeight', () => {
  it('returns 0 when no history', () => {
    expect(getRecommendedWeight('bp01', '8-12', [])).toBe(0);
  });

  it('increases weight when all sets hit top of range', () => {
    const history = [
      makeSession('bp01', [
        { weight: 80, reps: 12 },
        { weight: 80, reps: 12 },
        { weight: 80, reps: 12 },
      ]),
    ];
    expect(getRecommendedWeight('bp01', '8-12', history)).toBe(82.5);
  });

  it('keeps same weight when reps within range', () => {
    const history = [
      makeSession('bp01', [
        { weight: 80, reps: 10 },
        { weight: 80, reps: 9 },
        { weight: 80, reps: 9 },
      ]),
    ];
    expect(getRecommendedWeight('bp01', '8-12', history)).toBe(80);
  });

  it('decreases weight when multiple sets below range', () => {
    const history = [
      makeSession('bp01', [
        { weight: 80, reps: 6 },
        { weight: 80, reps: 5 },
        { weight: 80, reps: 7 },
      ]),
    ];
    expect(getRecommendedWeight('bp01', '8-12', history)).toBe(77.5);
  });
});
