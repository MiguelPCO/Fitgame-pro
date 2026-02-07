import { WorkoutSession, WorkoutSet, ActiveExercise } from '../types';
import { XP } from './constants';
import { PRRecord, XPBreakdown } from '../services/xp';

// ── Result types ────────────────────────────────────────────────

export interface SessionStatsResult {
  totalVolume: number;
  setsCompleted: number;
  averageRPE: number;
}

export interface DetectedPR {
  exerciseId: string;
  weight: number;
  reps: number;
  previousWeight: number;
  previousReps: number;
}

// ── 1. calculateSessionStats ────────────────────────────────────

/**
 * Calcula estadísticas agregadas de los sets completados en una sesión.
 */
export function calculateSessionStats(
  exercises: ActiveExercise[]
): SessionStatsResult {
  let totalVolume = 0;
  let setsCompleted = 0;
  let rpeSum = 0;
  let rpeCount = 0;

  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (!set.completed) continue;

      totalVolume += set.weight * set.reps;
      setsCompleted++;

      if (set.rpe && set.rpe > 0) {
        rpeSum += set.rpe;
        rpeCount++;
      }
    }
  }

  return {
    totalVolume,
    setsCompleted,
    averageRPE: rpeCount > 0 ? rpeSum / rpeCount : 0,
  };
}

// ── 2. calculateXPBreakdown ─────────────────────────────────────

/** Streak bonus: 2% per day, max 50% */
const STREAK_BONUS_PER_DAY = 0.02;
const MAX_STREAK_BONUS = 0.5;

/** Morning workout window: 6am – 10am → +20% */
const MORNING_BONUS = 0.2;

/**
 * Calcula el desglose completo de XP para una sesión terminada.
 *
 * @param session       Sesión con exercises y startTime
 * @param userStreak    Días consecutivos de entrenamiento
 * @param personalRecords  Historial de PRs por ejercicio
 * @param sessionTime   Timestamp opcional (para testear bonus matutino).
 *                      Si no se pasa, usa session.startTime o Date.now().
 */
export function calculateXPBreakdown(
  session: WorkoutSession,
  userStreak: number,
  personalRecords: Map<string, PRRecord> = new Map(),
  sessionTime?: number
): XPBreakdown {
  const breakdown: XPBreakdown = {
    baseXP: 0,
    setsXP: 0,
    rpeBonus: 0,
    prBonus: 0,
    completionBonus: 0,
    streakMultiplier: 1,
    morningBonus: 0,
    totalXP: 0,
    prsAchieved: [],
  };

  let totalSets = 0;
  let completedSets = 0;

  for (const exercise of session.exercises) {
    let bestWeight = 0;
    let bestReps = 0;

    for (const set of exercise.sets) {
      totalSets++;

      if (!set.completed) continue;
      completedSets++;

      // XP base por set
      breakdown.setsXP += XP.PER_SET;

      // Mejor set del ejercicio (para detectar PR)
      if (set.weight > bestWeight) {
        bestWeight = set.weight;
        bestReps = set.reps;
      }

      // Bonus RPE 9+
      if (set.rpe && set.rpe >= 9) {
        breakdown.rpeBonus += XP.BONUS_RPE_9_PLUS;
      }
    }

    // Detección de PR
    if (bestWeight > 0) {
      const prev = personalRecords.get(exercise.exerciseId);
      if (!prev || bestWeight > prev.weight) {
        breakdown.prBonus += XP.BONUS_PR;
        breakdown.prsAchieved.push(exercise.exerciseId);
      }
    }
  }

  // Bonus sesión completa
  if (totalSets > 0 && completedSets === totalSets) {
    breakdown.completionBonus = XP.BONUS_FULL_COMPLETION;
  }

  // Base XP (antes de multiplicadores)
  breakdown.baseXP =
    breakdown.setsXP +
    breakdown.rpeBonus +
    breakdown.prBonus +
    breakdown.completionBonus;

  // Streak multiplier (2%/día, máx 50%)
  const streakBonus = Math.min(userStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  breakdown.streakMultiplier = 1 + streakBonus;

  // Morning bonus (6–10 am)
  const hour = new Date(sessionTime ?? session.startTime ?? Date.now()).getHours();
  if (hour >= 6 && hour < 10) {
    breakdown.morningBonus = MORNING_BONUS;
  }

  // Total XP
  const multiplied = breakdown.baseXP * breakdown.streakMultiplier;
  breakdown.totalXP = Math.round(multiplied * (1 + breakdown.morningBonus));

  return breakdown;
}

// ── 3. detectPRs ────────────────────────────────────────────────

/**
 * Compara los mejores sets de cada ejercicio contra el historial
 * y retorna la lista de nuevos PRs detectados.
 *
 * Un PR se registra cuando el peso supera el récord previo.
 * Si no existe récord previo para un ejercicio, cualquier set
 * con peso > 0 cuenta como primer PR.
 */
export function detectPRs(
  exercises: ActiveExercise[],
  personalRecords: Map<string, PRRecord>
): DetectedPR[] {
  const prs: DetectedPR[] = [];

  for (const exercise of exercises) {
    let bestWeight = 0;
    let bestReps = 0;

    for (const set of exercise.sets) {
      if (!set.completed) continue;
      if (set.weight > bestWeight) {
        bestWeight = set.weight;
        bestReps = set.reps;
      }
    }

    if (bestWeight <= 0) continue;

    const prev = personalRecords.get(exercise.exerciseId);

    if (!prev) {
      // Primer registro → PR automático
      prs.push({
        exerciseId: exercise.exerciseId,
        weight: bestWeight,
        reps: bestReps,
        previousWeight: 0,
        previousReps: 0,
      });
    } else if (bestWeight > prev.weight) {
      prs.push({
        exerciseId: exercise.exerciseId,
        weight: bestWeight,
        reps: bestReps,
        previousWeight: prev.weight,
        previousReps: prev.reps,
      });
    }
  }

  return prs;
}
