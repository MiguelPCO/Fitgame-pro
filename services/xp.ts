import { UserProfile, WorkoutSession, WorkoutSet } from '../types';
import { XP } from '../lib/constants';

/**
 * XP level multiplier for calculating next level requirements
 */
const LEVEL_MULTIPLIER = 1.2;

/**
 * Streak bonus multiplier (percentage)
 */
const STREAK_BONUS_PER_DAY = 0.02; // 2% per day, max 50%
const MAX_STREAK_BONUS = 0.5;

/**
 * Morning workout bonus (6am - 10am)
 */
const MORNING_BONUS = 0.2; // 20%

/**
 * Personal Record history for comparison
 */
export interface PRRecord {
  weight: number;
  reps: number;
  date: string;
}

/**
 * XP calculation result with breakdown
 */
export interface XPBreakdown {
  baseXP: number;
  setsXP: number;
  rpeBonus: number;
  prBonus: number;
  completionBonus: number;
  streakMultiplier: number;
  morningBonus: number;
  totalXP: number;
  prsAchieved: string[]; // exercise IDs that got PRs
}

/**
 * Calculate XP for a completed workout with full bonus system
 */
export function calculateWorkoutXP(
  session: WorkoutSession,
  userStreak: number,
  personalRecords: Map<string, PRRecord> = new Map()
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
  let highRPESets = 0;

  // Calculate per-set XP and check for PRs
  for (const exercise of session.exercises) {
    let exerciseBestWeight = 0;
    let exerciseBestReps = 0;

    for (const set of exercise.sets) {
      totalSets++;

      if (set.completed) {
        completedSets++;
        breakdown.setsXP += XP.PER_SET;

        // Track best performance for this exercise
        if (set.weight > exerciseBestWeight) {
          exerciseBestWeight = set.weight;
          exerciseBestReps = set.reps;
        }

        // RPE 9+ bonus
        if (set.rpe && set.rpe >= 9) {
          highRPESets++;
          breakdown.rpeBonus += XP.BONUS_RPE_9_PLUS;
        }
      }
    }

    // Check for PR
    if (exerciseBestWeight > 0) {
      const previousPR = personalRecords.get(exercise.exerciseId);

      if (!previousPR || exerciseBestWeight > previousPR.weight) {
        breakdown.prBonus += XP.BONUS_PR;
        breakdown.prsAchieved.push(exercise.exerciseId);
      }
    }
  }

  // Full completion bonus (all sets completed)
  if (totalSets > 0 && completedSets === totalSets) {
    breakdown.completionBonus = XP.BONUS_FULL_COMPLETION;
  }

  // Calculate base XP
  breakdown.baseXP = breakdown.setsXP + breakdown.rpeBonus + breakdown.prBonus + breakdown.completionBonus;

  // Streak multiplier (2% per day, max 50%)
  const streakBonus = Math.min(userStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  breakdown.streakMultiplier = 1 + streakBonus;

  // Morning bonus check
  const workoutHour = session.startTime
    ? new Date(session.startTime).getHours()
    : new Date().getHours();

  if (workoutHour >= 6 && workoutHour < 10) {
    breakdown.morningBonus = MORNING_BONUS;
  }

  // Calculate total XP
  const multipliedXP = breakdown.baseXP * breakdown.streakMultiplier;
  const withMorningBonus = multipliedXP * (1 + breakdown.morningBonus);
  breakdown.totalXP = Math.round(withMorningBonus);

  return breakdown;
}

/**
 * Calculate new user stats after earning XP
 */
export function calculateNewUserStats(
  user: UserProfile,
  xpReward: number
): Pick<UserProfile, 'xp' | 'level' | 'xpToNextLevel' | 'streak' | 'tier'> {
  let newXp = user.xp + xpReward;
  let newLevel = user.level;
  let newXpToNextLevel = user.xpToNextLevel;

  // Handle multiple level ups
  while (newXp >= newXpToNextLevel) {
    newXp -= newXpToNextLevel;
    newLevel++;
    newXpToNextLevel = Math.round(newXpToNextLevel * LEVEL_MULTIPLIER);
  }

  return {
    xp: newXp,
    level: newLevel,
    xpToNextLevel: newXpToNextLevel,
    streak: user.streak + 1,
    tier: calculateTier(newLevel),
  };
}

/**
 * Calculate XP progress percentage for the current level
 */
export function calculateXpProgress(user: UserProfile): number {
  return (user.xp / user.xpToNextLevel) * 100;
}

/**
 * Calculate XP needed to reach next level
 */
export function calculateXpNeeded(user: UserProfile): number {
  return user.xpToNextLevel - user.xp;
}

/**
 * Determine user tier based on level
 */
export function calculateTier(level: number): UserProfile['tier'] {
  if (level >= 50) return 'Elite';
  if (level >= 25) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  return 'Novice';
}

/**
 * Check if a set is a PR compared to history
 */
export function isPR(
  exerciseId: string,
  weight: number,
  reps: number,
  personalRecords: Map<string, PRRecord>
): boolean {
  const previousPR = personalRecords.get(exerciseId);

  if (!previousPR) {
    return weight > 0; // First recorded set is always a PR
  }

  // PR if weight is higher (with similar or more reps)
  return weight > previousPR.weight;
}

/**
 * Format XP breakdown for display
 */
export function formatXPBreakdown(breakdown: XPBreakdown): string[] {
  const lines: string[] = [];

  lines.push(`Sets completed: +${breakdown.setsXP} XP`);

  if (breakdown.rpeBonus > 0) {
    lines.push(`High intensity (RPE 9+): +${breakdown.rpeBonus} XP`);
  }

  if (breakdown.prBonus > 0) {
    const prCount = breakdown.prsAchieved.length;
    lines.push(`Personal Records (${prCount}): +${breakdown.prBonus} XP`);
  }

  if (breakdown.completionBonus > 0) {
    lines.push(`Full completion: +${breakdown.completionBonus} XP`);
  }

  if (breakdown.streakMultiplier > 1) {
    const percent = Math.round((breakdown.streakMultiplier - 1) * 100);
    lines.push(`Streak bonus: +${percent}%`);
  }

  if (breakdown.morningBonus > 0) {
    lines.push(`Morning workout: +20%`);
  }

  return lines;
}
