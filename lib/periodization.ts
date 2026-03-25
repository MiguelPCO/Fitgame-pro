import { PeriodizationPhase, PeriodizationState, OverloadSuggestion, WorkoutSession } from '../types';
import { parseRepRange, findLastExerciseData } from './weightRecommendation';
import { getWeekStart } from './challenges';
import { STORAGE_KEYS } from './constants';

// ─── Phase configuration ──────────────────────────────────────────────────────

export const PHASE_CONFIGS = {
  1: {
    phase: 1 as PeriodizationPhase,
    name: 'Moderado',
    repRange: '8-12',
    rpeTarget: 8,
    durationWeeks: 5,
    descriptor: 'Volumen moderado · Intensidad moderada',
    color: 'blue',
  },
  2: {
    phase: 2 as PeriodizationPhase,
    name: 'Intensidad',
    repRange: '3-6',
    rpeTarget: 9,
    durationWeeks: 5,
    descriptor: 'Bajo volumen · Alta intensidad',
    color: 'red',
  },
  3: {
    phase: 3 as PeriodizationPhase,
    name: 'Volumen',
    repRange: '12-20',
    rpeTarget: 7,
    durationWeeks: 5,
    descriptor: 'Alto volumen · Intensidad moderada',
    color: 'green',
  },
} as const;

// ─── State helpers ────────────────────────────────────────────────────────────

export function getDefaultPeriodizationState(): PeriodizationState {
  return {
    currentPhase: 1,
    phaseStartDate: getWeekStart(),
    completedTrainingWeeks: 0,
  };
}

export function getNextPhase(phase: PeriodizationPhase): PeriodizationPhase {
  return phase === 3 ? 1 : ((phase + 1) as PeriodizationPhase);
}

// ─── Phase transition logic ───────────────────────────────────────────────────

/**
 * Count distinct calendar weeks (Mon–Sun) in which the user completed
 * at least one session since phaseStartDate.
 */
export function countTrainingWeeksInPhase(
  history: WorkoutSession[],
  phaseStartDate: string
): number {
  const phaseStart = new Date(phaseStartDate).getTime();
  const weeks = new Set<string>();

  for (const session of history) {
    if (!session.completed || !session.endTime) continue;
    if (session.endTime <= phaseStart) continue;
    weeks.add(getWeekStart(new Date(session.endTime)));
  }

  return weeks.size;
}

export function shouldTransitionPhase(
  state: PeriodizationState,
  history: WorkoutSession[]
): boolean {
  return (
    countTrainingWeeksInPhase(history, state.phaseStartDate) >=
    PHASE_CONFIGS[state.currentPhase].durationWeeks
  );
}

export function advancePhase(state: PeriodizationState): PeriodizationState {
  return {
    currentPhase: getNextPhase(state.currentPhase),
    phaseStartDate: getWeekStart(),
    completedTrainingWeeks: 0,
  };
}

// ─── Progressive overload suggestions ────────────────────────────────────────

/**
 * Returns sets from the second-to-last session that includes exerciseId.
 * Mirrors findLastExerciseData but skips the first matching session.
 */
function findSecondLastExerciseData(
  exerciseId: string,
  history: WorkoutSession[]
): { weight: number; reps: number; rpe: number }[] | null {
  let skipped = false;

  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    if (!session.completed) continue;

    const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
    if (!exercise) continue;

    const topSets = exercise.sets
      .filter(s => s.completed && s.type !== 'warmup' && s.weight > 0)
      .map(s => ({ weight: s.weight, reps: s.reps, rpe: s.rpe || 0 }));

    if (topSets.length === 0) continue;

    if (!skipped) {
      skipped = true; // skip the most recent session (already handled by findLastExerciseData)
      continue;
    }

    return topSets;
  }

  return null;
}

/**
 * Compute progressive overload suggestions for the current week.
 * Returns at most 5 suggestions (weight increases first, then rep increases).
 */
export function getWeeklyOverloadSuggestions(
  history: WorkoutSession[],
  phase: PeriodizationPhase,
  exerciseNameMap: Map<string, string>
): OverloadSuggestion[] {
  const range = parseRepRange(PHASE_CONFIGS[phase].repRange);
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000; // last 90 days

  // Collect unique exercise IDs from recent history
  const exerciseIds = new Set<string>();
  for (const session of history) {
    if (!session.completed || !session.endTime) continue;
    if (session.endTime < cutoff) continue;
    for (const ex of session.exercises) {
      exerciseIds.add(ex.exerciseId);
    }
  }

  const weightSuggestions: OverloadSuggestion[] = [];
  const repSuggestions: OverloadSuggestion[] = [];

  for (const exerciseId of exerciseIds) {
    const lastSets = findLastExerciseData(exerciseId, history);
    if (!lastSets || lastSets.length === 0) continue;

    const prevSets = findSecondLastExerciseData(exerciseId, history);

    const lastAllAtMax = lastSets.every(s => s.reps >= range.max);
    const prevAllAtMax = prevSets ? prevSets.every(s => s.reps >= range.max) : false;

    const avgWeight = Math.round(lastSets.reduce((sum, s) => sum + s.weight, 0) / lastSets.length * 2) / 2;
    const avgReps = Math.round(lastSets.reduce((sum, s) => sum + s.reps, 0) / lastSets.length);

    const exerciseName = exerciseNameMap.get(exerciseId) ?? exerciseId;

    if (lastAllAtMax && prevAllAtMax) {
      // Two consecutive sessions hitting max reps → increase weight
      weightSuggestions.push({
        exerciseId,
        exerciseName,
        type: 'increase_weight',
        currentWeight: avgWeight,
        suggestedWeight: avgWeight + 2.5,
        currentReps: avgReps,
        suggestedReps: range.min,
        reason: `Sube a ${avgWeight + 2.5} kg y vuelve a ${range.min} reps`,
      });
    } else if (lastAllAtMax && !prevAllAtMax) {
      // First session hitting max → consolidate with more reps
      repSuggestions.push({
        exerciseId,
        exerciseName,
        type: 'increase_reps',
        currentWeight: avgWeight,
        suggestedWeight: avgWeight,
        currentReps: avgReps,
        suggestedReps: Math.min(avgReps + 1, range.max),
        reason: `Intenta ${Math.min(avgReps + 1, range.max)} reps a ${avgWeight} kg`,
      });
    }
    // If below max or no second session: no suggestion
  }

  // Weight increases first, then rep increases, capped at 5 total
  return [...weightSuggestions, ...repSuggestions].slice(0, 5);
}

// ─── Cache layer ──────────────────────────────────────────────────────────────

interface OverloadCache {
  weekStart: string;
  phase: PeriodizationPhase;
  suggestions: OverloadSuggestion[];
}

export function getCachedOverloadSuggestions(
  history: WorkoutSession[],
  phase: PeriodizationPhase,
  exerciseNameMap: Map<string, string>
): OverloadSuggestion[] {
  const currentWeek = getWeekStart();

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OVERLOAD_CACHE);
    if (raw) {
      const cached: OverloadCache = JSON.parse(raw);
      if (cached.weekStart === currentWeek && cached.phase === phase) {
        return cached.suggestions;
      }
    }
  } catch {
    // ignore stale/corrupt cache
  }

  const suggestions = getWeeklyOverloadSuggestions(history, phase, exerciseNameMap);
  const cache: OverloadCache = { weekStart: currentWeek, phase, suggestions };
  try {
    localStorage.setItem(STORAGE_KEYS.OVERLOAD_CACHE, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }

  return suggestions;
}
