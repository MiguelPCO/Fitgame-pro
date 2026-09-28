export type Goal = 'Strength' | 'Hypertrophy' | 'Fat Loss' | 'Endurance';
/** Que entrena el usuario. Determina que plan se genera en el onboarding. */
export type Discipline = 'gym' | 'running' | 'both';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** Maps day-of-week (0=Sun..6=Sat) to a template ID */
export type WeeklySchedule = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, string>>;

export interface UserProfile {
  name: string;
  email?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  avatarUrl: string;
  tier: 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';

  // Onboarding / Preferences
  goal?: Goal;
  daysPerWeek?: number;
  minutesPerSession?: number;
  equipment?: string[];
  experienceLevel?: ExperienceLevel;
  discipline?: Discipline;
  /** Zonas con molestias o lesion, seleccionadas en el onboarding. */
  injuries?: string[];
  /** Nota libre sobre limitaciones. */
  limitations?: string;

  // Scheduling
  weeklySchedule?: WeeklySchedule;
  onboardingCompleted?: boolean;
}

export interface QueuedOperation {
  id: string;
  action: 'insert' | 'update' | 'upsert' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string[];
  equipment: string;
  difficulty: Difficulty;
  videoUrl?: string;
  instructions: string[];
  tips: string[];
  type: 'Compound' | 'Isolation';
}

export interface WorkoutSet {
  id: string;
  type: 'warmup' | 'top' | 'backoff';
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  targetReps: string;
  targetRPE: number;

  // Advanced Logging
  recommendedWeight?: number;
  isFailed?: boolean;
  isPain?: boolean;
  notes?: string;
}

export interface ActiveExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  restTimer: number;
  notes?: string;
}

/**
 * Tipo de sesion de carrera (06-modelo-datos.md SS B). Cada uno tiene su propia
 * tasa de XP en complete_workout(): la carrera es la que mas exige, y por eso paga mas.
 */
export type RunType = 'easy' | 'long' | 'intervals' | 'tempo' | 'recovery' | 'race';

export interface WorkoutSession {
  id: string;
  name: string;
  duration: string;
  startTime?: number;
  endTime?: number;
  muscleFocus: string[];
  exercises: ActiveExercise[];
  completed: boolean;
  xpReward: number;
  date?: string;
  status?: 'pending' | 'active' | 'completed' | 'skipped';
  notes?: string;

  /** 'strength' si no viene (sesiones anteriores a la Fase 5). */
  activityType?: 'strength' | 'run';
  /** Metros. Entero: evita errores de coma flotante al sumar distancias. */
  distanceM?: number;
  movingTimeS?: number;
  elapsedTimeS?: number;
  /** RPE de carrera, 1-10. */
  perceivedEffort?: number;
  runType?: RunType;
}

/** Tipo de actividad de una sesion planificada (06-modelo-datos.md SS C). */
export type ActivityType = 'strength' | 'run' | 'mobility' | 'rest';

/**
 * Estado de una sesion del plan. No existe "borrada": la regla 3 de
 * 05-arquitectura-ux.md SS 4.2 dice que una sesion del plan se salta, no se borra.
 */
export type ScheduledStatus = 'planned' | 'completed' | 'skipped' | 'moved';

/**
 * Una sesion con FECHA REAL, a diferencia de WeeklySchedule que es dia-de-semana.
 * Espejo local de la tabla scheduled_sessions.
 */
export interface ScheduledSession {
  id: string;
  /** 'YYYY-MM-DD'. Fecha de calendario, no instante: no cambia de dia al viajar. */
  scheduledFor: string;
  activityType: ActivityType;
  templateId?: string;
  title: string;
  status: ScheduledStatus;
  /** id de la WorkoutSession real, cuando se completa. */
  sessionId?: string;
  /** Orden dentro del dia: carrera por la manana, pesas por la tarde. */
  sortOrder: number;
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  targetReps: string;
  targetRPE: number;
  restTimer: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  muscleFocus: string[];
  exercises: TemplateExercise[];
  duration: string;
  difficulty: Difficulty;
  lastPerformed?: string;
}

export type BadgeCategory = 'milestone' | 'streak' | 'strength' | 'consistency' | 'volume';

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string; // ISO date string
}

export type ChallengeType = 'workouts' | 'pr' | 'volume' | 'sets';

export interface WeeklyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  weekStart: string; // ISO date of Monday
  bonusXP: number;
}

export interface StreakFreezeState {
  count: number;
  resetMonth: string; // 'YYYY-MM' — resets on 1st of each month
}

export type PeriodizationPhase = 1 | 2 | 3;

export interface PeriodizationState {
  currentPhase: PeriodizationPhase;
  phaseStartDate: string;         // ISO date — inicio de la fase actual
  completedTrainingWeeks: number; // semanas con ≥1 sesión completada en esta fase
}

export interface OverloadSuggestion {
  exerciseId: string;
  exerciseName: string;
  type: 'increase_weight' | 'increase_reps';
  currentWeight: number;
  suggestedWeight: number;
  currentReps: number;
  suggestedReps: number;
  reason: string;
}
