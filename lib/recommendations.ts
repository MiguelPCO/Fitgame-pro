import type { WorkoutSession, WorkoutTemplate, UserProfile } from '../types';
import type { MuscleLoadData } from './calculations';

export interface WorkoutRecommendation {
  type: 'scheduled' | 'suggested' | 'rest' | 'new_user';
  headline: string;
  reason: string;
  targetMuscles: string[];
  suggestedTemplate: WorkoutTemplate | null;
  readinessScore: number; // 0–100 (100 = fully rested)
}

/** Spanish display labels for muscle group keys */
export const MUSCLE_LABELS: Record<string, string> = {
  Chest:     'Pecho',
  Back:      'Espalda',
  Legs:      'Piernas',
  Shoulders: 'Hombros',
  Arms:      'Brazos',
  Core:      'Core',
  Glutes:    'Glúteos',
  Biceps:    'Bíceps',
  Triceps:   'Tríceps',
};

type Goal = NonNullable<UserProfile['goal']>;

const ALL_MUSCLE_GROUPS = Object.keys(MUSCLE_LABELS);

/** Goal → ordered priority list of muscle groups */
const GOAL_PRIORITY: Record<Goal, string[]> = {
  Strength:    ['Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'],
  Hypertrophy: ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Arms'],
  'Fat Loss':  ['Legs', 'Back', 'Core', 'Chest', 'Shoulders', 'Glutes'],
  Endurance:   ['Core', 'Legs', 'Back', 'Glutes', 'Chest'],
};

const GOAL_REASON_SUFFIX: Record<Goal, string> = {
  Strength:    'Ideal para tus objetivos de fuerza máxima.',
  Hypertrophy: 'Perfecto para maximizar el crecimiento muscular.',
  'Fat Loss':  'Grupos grandes = más calorías quemadas.',
  Endurance:   'Construye base aeróbica y resistencia muscular.',
};

/** True if the user already completed a workout today */
function workedOutToday(history: WorkoutSession[]): boolean {
  const today = new Date().toDateString();
  return history.some(s => s.completed && s.endTime && new Date(s.endTime).toDateString() === today);
}

/**
 * Convert fatigue scores to readiness (0 = overloaded, 100 = fully rested).
 * Muscles with no data are treated as fully rested.
 */
function muscleReadiness(fatigue: Record<string, MuscleLoadData>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const muscle of ALL_MUSCLE_GROUPS) {
    const data = fatigue[muscle];
    out[muscle] = data ? Math.max(0, 100 - data.score) : 100;
  }
  return out;
}

/**
 * Pick the top N muscle groups to train today based on goal priority and readiness.
 * Muscles with readiness < 25 (overloaded) are excluded.
 */
function pickTargetMuscles(
  readiness: Record<string, number>,
  goal: Goal,
  count = 2,
): string[] {
  const priority = GOAL_PRIORITY[goal] ?? ALL_MUSCLE_GROUPS;

  const scored = priority
    .filter(m => (readiness[m] ?? 100) >= 25) // skip overloaded
    .map((m, idx) => ({
      muscle: m,
      // Blend readiness (80%) with goal priority rank (20%)
      score: (readiness[m] ?? 100) * 0.8 + (1 - idx * 0.05) * 20,
    }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(m => m.muscle);
}

/**
 * Find the user template whose muscleFocus best overlaps with the target muscles.
 * Returns null if no templates exist or none match.
 */
function bestMatchingTemplate(
  templates: WorkoutTemplate[],
  targets: string[],
): WorkoutTemplate | null {
  if (!templates.length || !targets.length) return null;

  const scored = templates.map(t => ({
    template: t,
    overlap: t.muscleFocus.filter(m => targets.includes(m)).length,
  }));

  const best = scored.sort((a, b) => b.overlap - a.overlap)[0];
  return best.overlap > 0 ? best.template : null;
}

function buildReason(targets: string[], goal: Goal | undefined, readiness: Record<string, number>): string {
  const names = targets.map(m => MUSCLE_LABELS[m] ?? m);
  const avgReady = targets.reduce((acc, m) => acc + (readiness[m] ?? 100), 0) / Math.max(targets.length, 1);

  const freshnessLabel =
    avgReady >= 80 ? 'están totalmente recuperados' :
    avgReady >= 55 ? 'tienen buena recuperación' :
    'están listos para otra sesión';

  const suffix = goal ? GOAL_REASON_SUFFIX[goal] : '';
  return `${names.join(' y ')} ${freshnessLabel}. ${suffix}`.trim();
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export function getWorkoutRecommendation(params: {
  workoutHistory: WorkoutSession[];
  muscleFatigue: Record<string, MuscleLoadData>;
  user: UserProfile | null;
  templates: WorkoutTemplate[];
  scheduledTemplate: WorkoutTemplate | null;
}): WorkoutRecommendation {
  const { workoutHistory, muscleFatigue, user, templates, scheduledTemplate } = params;

  // New user: no data at all
  if (workoutHistory.length === 0 && templates.length === 0) {
    return {
      type: 'new_user',
      headline: '¡Bienvenido a FitGame Pro!',
      reason: 'Crea tu primera plantilla o adopta un programa para comenzar.',
      targetMuscles: [],
      suggestedTemplate: null,
      readinessScore: 100,
    };
  }

  // Already worked out today → rest
  if (workedOutToday(workoutHistory)) {
    return {
      type: 'rest',
      headline: '¡Gran trabajo hoy!',
      reason: 'Ya completaste tu sesión. Descansa y deja que los músculos se recuperen.',
      targetMuscles: [],
      suggestedTemplate: null,
      readinessScore: 0,
    };
  }

  const readiness = muscleReadiness(muscleFatigue);

  // Scheduled template for today → highest priority
  if (scheduledTemplate) {
    const focusMuscles = scheduledTemplate.muscleFocus;
    const avgReadiness =
      focusMuscles.length
        ? focusMuscles.reduce((acc, m) => acc + (readiness[m] ?? 100), 0) / focusMuscles.length
        : 70;

    const readinessNote =
      avgReadiness >= 65
        ? 'Estás bien recuperado para dar el máximo hoy.'
        : 'Estos grupos aún tienen algo de fatiga. Escucha a tu cuerpo.';

    return {
      type: 'scheduled',
      headline: scheduledTemplate.name,
      reason: `Sesión programada para hoy. ${readinessNote}`,
      targetMuscles: focusMuscles,
      suggestedTemplate: scheduledTemplate,
      readinessScore: Math.round(avgReadiness),
    };
  }

  // Smart suggestion based on goal + fatigue
  const goal = user?.goal ?? 'Hypertrophy';
  const targetMuscles = pickTargetMuscles(readiness, goal, 2);
  const suggestedTemplate = bestMatchingTemplate(templates, targetMuscles);

  const avgReadiness =
    targetMuscles.length
      ? targetMuscles.reduce((acc, m) => acc + (readiness[m] ?? 100), 0) / targetMuscles.length
      : 100;

  const muscleNames = targetMuscles.map(m => MUSCLE_LABELS[m] ?? m);
  const headline =
    targetMuscles.length
      ? `Día de ${muscleNames.join(' + ')}`
      : '¡A entrenar!';

  return {
    type: 'suggested',
    headline,
    reason: targetMuscles.length
      ? buildReason(targetMuscles, user?.goal, readiness)
      : 'Basado en tu historial y objetivo de entrenamiento.',
    targetMuscles,
    suggestedTemplate,
    readinessScore: Math.round(avgReadiness),
  };
}
