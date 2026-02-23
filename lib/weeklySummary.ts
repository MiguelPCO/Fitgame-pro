import { WorkoutSession } from '../types';
import { getWeekStart } from './challenges';

export interface WeekStats {
  weekStart: string;
  workouts: number;
  volumeKg: number;
  xpEarned: number;
}

export interface WeeklySummaryData {
  lastWeek: WeekStats;
  prevWeek: WeekStats;
}

const SUMMARY_KEY = 'fitgame_last_summary_week';

function sessionVol(s: WorkoutSession): number {
  return s.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((sAcc, set) => (set.completed ? sAcc + set.weight * set.reps : sAcc), 0),
    0
  );
}

function getStatsForWeek(history: WorkoutSession[], weekStart: Date): WeekStats {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const sessions = history.filter(s => {
    if (!s.completed) return false;
    const d = new Date(s.endTime || s.date || 0);
    return d >= weekStart && d < weekEnd;
  });

  return {
    weekStart: weekStart.toISOString(),
    workouts: sessions.length,
    volumeKg: Math.round(sessions.reduce((acc, s) => acc + sessionVol(s), 0)),
    xpEarned: sessions.reduce((acc, s) => acc + (s.xpReward || 0), 0),
  };
}

/**
 * Returns summary data for last week vs the week before.
 * Returns null if there were no workouts last week (nothing to show).
 */
export function getWeeklySummaryData(history: WorkoutSession[]): WeeklySummaryData | null {
  if (history.length === 0) return null;

  const now = new Date();
  const currentWeekStart = new Date(getWeekStart(now));

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);

  const lastWeek = getStatsForWeek(history, lastWeekStart);
  if (lastWeek.workouts === 0) return null;

  const prevWeekStart = new Date(lastWeekStart);
  prevWeekStart.setDate(lastWeekStart.getDate() - 7);

  return {
    lastWeek,
    prevWeek: getStatsForWeek(history, prevWeekStart),
  };
}

/** True if the weekly summary hasn't been shown yet for the current week */
export function shouldShowWeeklySummary(): boolean {
  try {
    const lastShown = localStorage.getItem(SUMMARY_KEY);
    return lastShown !== getWeekStart();
  } catch {
    return false;
  }
}

/** Record that the weekly summary has been shown for the current week */
export function markWeeklySummaryShown(): void {
  try {
    localStorage.setItem(SUMMARY_KEY, getWeekStart());
  } catch {
    // localStorage unavailable — ignore
  }
}
