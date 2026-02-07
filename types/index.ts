export type Goal = 'Strength' | 'Hypertrophy' | 'Fat Loss' | 'Endurance';
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
