import { WorkoutSession } from '../types';

/**
 * Epley formula: 1RM ≈ weight × (1 + reps / 30)
 * Accurate for 1–10 reps. Returns 0 for invalid inputs.
 */
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Total volume (kg) for a single completed session */
export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce(
        (sAcc, s) => (s.completed ? sAcc + s.weight * s.reps : sAcc),
        0
      ),
    0
  );
}

/** Volume per muscle group over a list of sessions (all time or filtered) */
export function muscleGroupVolume(
  sessions: WorkoutSession[],
  muscleGroupMap: (exerciseId: string) => string[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const exVol = ex.sets.reduce(
        (acc, s) => (s.completed ? acc + s.weight * s.reps : acc),
        0
      );
      for (const muscle of muscleGroupMap(ex.exerciseId)) {
        map[muscle] = (map[muscle] || 0) + exVol;
      }
    }
  }
  return map;
}

/**
 * Muscle training frequency: count of sessions per muscle group
 * from `session.muscleFocus[]` within the given window.
 */
export function muscleFrequency(
  sessions: WorkoutSession[],
  daysBefore: number
): Record<string, number> {
  const cutoff = Date.now() - daysBefore * 24 * 60 * 60 * 1000;
  const freq: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.completed) continue;
    const t = s.endTime || (s.date ? new Date(s.date).getTime() : 0);
    if (t < cutoff) continue;
    for (const muscle of s.muscleFocus || []) {
      freq[muscle] = (freq[muscle] || 0) + 1;
    }
  }
  return freq;
}

// ─── Fatigue Score ────────────────────────────────────────────────────────────

export type FatigueLevel = 'fresh' | 'moderate' | 'fatigued' | 'overloaded';

export interface MuscleLoadData {
  /** Normalised 0-100 score (higher = more fatigued) */
  score: number;
  level: FatigueLevel;
}

/**
 * Exponential-decay fatigue per muscle group.
 * Uses session.muscleFocus[] and weighs recent sessions more heavily.
 * Half-life ≈ 1.7 days (decay constant 0.4).
 *
 * Thresholds (normalised against ~2.5 same-muscle sessions in 2 days):
 *   < 25 → fresh  |  25-50 → moderate  |  50-75 → fatigued  |  ≥ 75 → overloaded
 */
export function muscleFatigueScore(
  sessions: WorkoutSession[]
): Record<string, MuscleLoadData> {
  const now = Date.now();
  const raw: Record<string, number> = {};

  for (const s of sessions) {
    if (!s.completed) continue;
    const sessionTime = s.endTime || (s.date ? new Date(s.date).getTime() : 0);
    const daysAgo = Math.max(0, (now - sessionTime) / (1000 * 60 * 60 * 24));
    if (daysAgo > 7) continue;

    const decay = Math.exp(-daysAgo * 0.4);

    for (const muscle of s.muscleFocus ?? []) {
      raw[muscle] = (raw[muscle] ?? 0) + decay;
    }
  }

  // 3 sessions within ~2 days on the same muscle ≈ fully overloaded
  const MAX_EXPECTED = 2.5;
  const result: Record<string, MuscleLoadData> = {};

  for (const [muscle, rawScore] of Object.entries(raw)) {
    const score = Math.min(100, (rawScore / MAX_EXPECTED) * 100);
    result[muscle] = {
      score,
      level:
        score < 25 ? 'fresh'
        : score < 50 ? 'moderate'
        : score < 75 ? 'fatigued'
        : 'overloaded',
    };
  }

  return result;
}
