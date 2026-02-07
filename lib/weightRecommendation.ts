import { WorkoutSession } from '../types';

const WEIGHT_INCREMENT = 2.5;
const WARMUP_RATIO = 0.6;

/**
 * Parse a rep range string like "8-12" into min/max numbers.
 * If a single number like "5", returns { min: 5, max: 5 }.
 */
export function parseRepRange(targetReps: string): { min: number; max: number } {
  const parts = targetReps.split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  const single = parseInt(targetReps, 10);
  if (!isNaN(single)) return { min: single, max: single };
  return { min: 8, max: 12 }; // fallback
}

/**
 * Find the last completed session data for a given exercise from workout history.
 * Returns the top-set data (excluding warmup) sorted by set order.
 */
export function findLastExerciseData(
  exerciseId: string,
  workoutHistory: WorkoutSession[]
): { weight: number; reps: number; rpe: number }[] | null {
  // Search from most recent to oldest
  for (let i = workoutHistory.length - 1; i >= 0; i--) {
    const session = workoutHistory[i];
    if (!session.completed) continue;

    const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
    if (!exercise) continue;

    const topSets = exercise.sets
      .filter(s => s.completed && s.type !== 'warmup' && s.weight > 0)
      .map(s => ({ weight: s.weight, reps: s.reps, rpe: s.rpe || 0 }));

    if (topSets.length > 0) return topSets;
  }

  return null;
}

/**
 * Calculate the recommended weight for an exercise using double progression.
 *
 * Logic:
 * 1. Find last session data for this exercise
 * 2. If all top sets hit the top of the rep range → suggest +2.5kg
 * 3. If reps are within range → repeat same weight
 * 4. If reps are below range on multiple sets → suggest -2.5kg
 * 5. If no history → return 0 (user enters manually)
 */
export function getRecommendedWeight(
  exerciseId: string,
  targetReps: string,
  workoutHistory: WorkoutSession[]
): number {
  const lastData = findLastExerciseData(exerciseId, workoutHistory);
  if (!lastData || lastData.length === 0) return 0;

  const range = parseRepRange(targetReps);
  const avgWeight = lastData.reduce((sum, s) => sum + s.weight, 0) / lastData.length;
  const baseWeight = Math.round(avgWeight / WEIGHT_INCREMENT) * WEIGHT_INCREMENT;

  // Count how many sets hit the top of the rep range
  const hitsTop = lastData.filter(s => s.reps >= range.max).length;
  // Count how many sets fell below the bottom of the rep range
  const belowMin = lastData.filter(s => s.reps < range.min).length;

  if (hitsTop === lastData.length) {
    // All sets hit top of range → progress weight
    return baseWeight + WEIGHT_INCREMENT;
  }

  if (belowMin >= 2) {
    // Multiple sets below range → reduce weight
    return Math.max(0, baseWeight - WEIGHT_INCREMENT);
  }

  // Within range → repeat same weight
  return baseWeight;
}

/**
 * Calculate warmup weight as ~60% of the top-set weight, rounded to nearest 2.5.
 */
export function getWarmupWeight(topSetWeight: number): number {
  if (topSetWeight <= 0) return 0;
  return Math.round((topSetWeight * WARMUP_RATIO) / WEIGHT_INCREMENT) * WEIGHT_INCREMENT;
}
