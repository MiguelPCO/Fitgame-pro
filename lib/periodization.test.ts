import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getNextPhase,
  countTrainingWeeksInPhase,
  shouldTransitionPhase,
  advancePhase,
  getWeeklyOverloadSuggestions,
  PHASE_CONFIGS,
} from './periodization';
import { WorkoutSession } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(
  daysAgo: number,
  exercises: { id: string; reps: number; weight: number }[] = []
): WorkoutSession {
  const endTime = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return {
    id: `s-${daysAgo}-${Math.random()}`,
    name: 'Test',
    duration: '60',
    muscleFocus: ['Chest'],
    completed: true,
    xpReward: 0,
    status: 'completed',
    endTime,
    date: new Date(endTime).toISOString(),
    exercises: exercises.map(ex => ({
      exerciseId: ex.id,
      restTimer: 90,
      sets: [
        { id: 's1', type: 'top' as const, weight: ex.weight, reps: ex.reps, completed: true, targetReps: '8-12', targetRPE: 8 },
        { id: 's2', type: 'top' as const, weight: ex.weight, reps: ex.reps, completed: true, targetReps: '8-12', targetRPE: 8 },
      ],
    })),
  };
}

// Monday of a specific week given a date string
function mondayOf(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// ─── getNextPhase ─────────────────────────────────────────────────────────────

describe('getNextPhase', () => {
  it('advances 1 → 2', () => expect(getNextPhase(1)).toBe(2));
  it('advances 2 → 3', () => expect(getNextPhase(2)).toBe(3));
  it('wraps 3 → 1', () => expect(getNextPhase(3)).toBe(1));
});

// ─── countTrainingWeeksInPhase ────────────────────────────────────────────────

describe('countTrainingWeeksInPhase', () => {
  const phaseStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  it('returns 0 with no sessions', () => {
    expect(countTrainingWeeksInPhase([], phaseStart)).toBe(0);
  });

  it('returns 1 for 3 sessions in the same week', () => {
    const sessions = [makeSession(3), makeSession(4), makeSession(5)];
    // All within the past week — same week bucket
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(countTrainingWeeksInPhase(sessions, oneWeekAgo)).toBe(1);
  });

  it('returns 2 for sessions in 2 different weeks', () => {
    const s1 = makeSession(3);   // this week
    const s2 = makeSession(10);  // last week
    expect(countTrainingWeeksInPhase([s1, s2], phaseStart)).toBe(2);
  });

  it('ignores incomplete sessions', () => {
    const s = makeSession(3);
    s.completed = false;
    expect(countTrainingWeeksInPhase([s], phaseStart)).toBe(0);
  });

  it('ignores sessions before phaseStartDate', () => {
    const futureStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const sessions = [makeSession(3), makeSession(10)];
    expect(countTrainingWeeksInPhase(sessions, futureStart)).toBe(0);
  });
});

// ─── shouldTransitionPhase ───────────────────────────────────────────────────

describe('shouldTransitionPhase', () => {
  const phaseStart = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString();

  it('returns false when fewer than durationWeeks training weeks', () => {
    const state = { currentPhase: 1 as const, phaseStartDate: phaseStart, completedTrainingWeeks: 2 };
    const sessions = [makeSession(3), makeSession(10)]; // only 2 weeks
    expect(shouldTransitionPhase(state, sessions)).toBe(false);
  });

  it('returns true when durationWeeks training weeks completed', () => {
    const state = { currentPhase: 1 as const, phaseStartDate: phaseStart, completedTrainingWeeks: 5 };
    // 5 sessions in 5 different weeks
    const sessions = [
      makeSession(3), makeSession(10), makeSession(17), makeSession(24), makeSession(31),
    ];
    expect(shouldTransitionPhase(state, sessions)).toBe(true);
  });
});

// ─── advancePhase ─────────────────────────────────────────────────────────────

describe('advancePhase', () => {
  it('increments phase', () => {
    const state = { currentPhase: 1 as const, phaseStartDate: '2026-01-01', completedTrainingWeeks: 5 };
    const next = advancePhase(state);
    expect(next.currentPhase).toBe(2);
  });

  it('resets completedTrainingWeeks to 0', () => {
    const state = { currentPhase: 2 as const, phaseStartDate: '2026-01-01', completedTrainingWeeks: 5 };
    expect(advancePhase(state).completedTrainingWeeks).toBe(0);
  });

  it('sets phaseStartDate to current week start', () => {
    const state = { currentPhase: 1 as const, phaseStartDate: '2026-01-01', completedTrainingWeeks: 5 };
    const next = advancePhase(state);
    expect(next.phaseStartDate).toBeTruthy();
    expect(next.phaseStartDate).not.toBe('2026-01-01');
  });

  it('wraps from phase 3 to phase 1', () => {
    const state = { currentPhase: 3 as const, phaseStartDate: '2026-01-01', completedTrainingWeeks: 5 };
    expect(advancePhase(state).currentPhase).toBe(1);
  });
});

// ─── getWeeklyOverloadSuggestions ────────────────────────────────────────────

describe('getWeeklyOverloadSuggestions', () => {
  const nameMap = new Map([['bp01', 'Press de Banca'], ['sq01', 'Sentadilla']]);

  it('returns empty array with no history', () => {
    const result = getWeeklyOverloadSuggestions([], 1, nameMap);
    expect(result).toEqual([]);
  });

  it('returns increase_weight when 2 consecutive sessions hit max reps', () => {
    // Phase 1 max = 12 reps
    const s1 = makeSession(3,  [{ id: 'bp01', reps: 12, weight: 80 }]);
    const s2 = makeSession(10, [{ id: 'bp01', reps: 12, weight: 80 }]);
    const result = getWeeklyOverloadSuggestions([s2, s1], 1, nameMap);
    const suggestion = result.find(s => s.exerciseId === 'bp01');
    expect(suggestion?.type).toBe('increase_weight');
    expect(suggestion?.suggestedWeight).toBe(82.5);
  });

  it('returns increase_reps when only last session hits max reps', () => {
    // Phase 1: last at 12 reps, prev at 10 reps
    const s1 = makeSession(3,  [{ id: 'bp01', reps: 12, weight: 80 }]);
    const s2 = makeSession(10, [{ id: 'bp01', reps: 10, weight: 80 }]);
    const result = getWeeklyOverloadSuggestions([s2, s1], 1, nameMap);
    const suggestion = result.find(s => s.exerciseId === 'bp01');
    expect(suggestion?.type).toBe('increase_reps');
  });

  it('returns no suggestion when below max reps', () => {
    const s1 = makeSession(3,  [{ id: 'bp01', reps: 9, weight: 80 }]);
    const s2 = makeSession(10, [{ id: 'bp01', reps: 9, weight: 80 }]);
    const result = getWeeklyOverloadSuggestions([s2, s1], 1, nameMap);
    expect(result.find(s => s.exerciseId === 'bp01')).toBeUndefined();
  });

  it('caps results at 5 suggestions', () => {
    const ids = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];
    const map = new Map(ids.map(id => [id, id]));
    // All at max reps twice
    const s1 = makeSession(3,  ids.map(id => ({ id, reps: 12, weight: 80 })));
    const s2 = makeSession(10, ids.map(id => ({ id, reps: 12, weight: 80 })));
    const result = getWeeklyOverloadSuggestions([s2, s1], 1, map);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('uses phase-specific rep range for Phase 2 (max=6)', () => {
    const s1 = makeSession(3,  [{ id: 'bp01', reps: 6, weight: 100 }]);
    const s2 = makeSession(10, [{ id: 'bp01', reps: 6, weight: 100 }]);
    const result = getWeeklyOverloadSuggestions([s2, s1], 2, nameMap);
    const suggestion = result.find(s => s.exerciseId === 'bp01');
    expect(suggestion?.type).toBe('increase_weight');
  });
});
