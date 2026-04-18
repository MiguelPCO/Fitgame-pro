import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { EarnedBadge, WeeklyChallenge, StreakFreezeState, PeriodizationState } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { loadFromStorage } from '../hooks/usePersist';
import { playNotification } from '../services/audio';
import { generateWeeklyChallenge, getWeekStart } from '../lib/challenges';
import { getDefaultPeriodizationState } from '../lib/periodization';

export interface RestTimerState {
  remaining: number;
  duration: number;
  isActive: boolean;
  endTime?: number;
}

export interface GamificationStateResult {
  earnedBadges: EarnedBadge[];
  newlyEarnedBadges: EarnedBadge[];
  weeklyChallenge: WeeklyChallenge | null;
  streakFreezes: StreakFreezeState;
  periodizationState: PeriodizationState;
  restTimer: RestTimerState;

  setEarnedBadges: Dispatch<SetStateAction<EarnedBadge[]>>;
  setNewlyEarnedBadges: Dispatch<SetStateAction<EarnedBadge[]>>;
  setWeeklyChallenge: Dispatch<SetStateAction<WeeklyChallenge | null>>;
  setStreakFreezes: Dispatch<SetStateAction<StreakFreezeState>>;
  setPeriodizationState: Dispatch<SetStateAction<PeriodizationState>>;

  clearNewlyEarnedBadges: () => void;
  useStreakFreeze: (toast: (msg: string, type: string) => void) => boolean;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  addRestTime: (seconds: number) => void;
}

export function useGamificationState(): GamificationStateResult {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>(() =>
    loadFromStorage(STORAGE_KEYS.BADGES, []));
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<EarnedBadge[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(() => {
    const stored = loadFromStorage<WeeklyChallenge | null>(STORAGE_KEYS.WEEKLY_CHALLENGE, null);
    const currentWeek = getWeekStart();
    if (!stored || stored.weekStart !== currentWeek) return generateWeeklyChallenge(currentWeek);
    return stored;
  });
  const [streakFreezes, setStreakFreezes] = useState<StreakFreezeState>(() => {
    const stored = loadFromStorage<StreakFreezeState | null>(STORAGE_KEYS.STREAK_FREEZES, null);
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!stored || stored.resetMonth !== currentMonth) return { count: 2, resetMonth: currentMonth };
    return stored;
  });
  const [periodizationState, setPeriodizationState] = useState<PeriodizationState>(() =>
    loadFromStorage<PeriodizationState | null>(STORAGE_KEYS.PERIODIZATION, null)
    ?? getDefaultPeriodizationState());
  const [restTimer, setRestTimer] = useState<RestTimerState>({ remaining: 0, duration: 0, isActive: false });

  // Rest timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (restTimer.isActive && restTimer.endTime) {
      interval = setInterval(() => {
        const diff = Math.ceil((restTimer.endTime! - Date.now()) / 1000);
        if (diff <= 0) {
          playNotification();
          setRestTimer(prev => ({ ...prev, remaining: 0, isActive: false }));
        } else {
          setRestTimer(prev => ({ ...prev, remaining: diff }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.endTime]);

  const clearNewlyEarnedBadges = () => setNewlyEarnedBadges([]);

  const useStreakFreeze = (toast: (msg: string, type: string) => void): boolean => {
    if (streakFreezes.count <= 0) return false;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newCount = streakFreezes.count - 1;
    const updated: StreakFreezeState = { count: newCount, resetMonth: currentMonth };
    setStreakFreezes(updated);
    localStorage.setItem(STORAGE_KEYS.STREAK_FREEZES, JSON.stringify(updated));
    toast(`Freeze activado — racha protegida. Te quedan ${newCount} freeze${newCount !== 1 ? 's' : ''}.`, 'info');
    return true;
  };

  const startRestTimer = (duration: number) => {
    const endTime = Date.now() + duration * 1000;
    setRestTimer({ remaining: duration, duration, isActive: true, endTime });
  };

  const stopRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isActive: false, remaining: 0, endTime: undefined }));
  };

  const addRestTime = (seconds: number) => {
    setRestTimer(prev => {
      const currentEnd = prev.endTime || (Date.now() + prev.remaining * 1000);
      return { ...prev, remaining: prev.remaining + seconds, isActive: true, endTime: currentEnd + seconds * 1000 };
    });
  };

  return {
    earnedBadges, newlyEarnedBadges, weeklyChallenge, streakFreezes, periodizationState, restTimer,
    setEarnedBadges, setNewlyEarnedBadges, setWeeklyChallenge, setStreakFreezes, setPeriodizationState,
    clearNewlyEarnedBadges, useStreakFreeze, startRestTimer, stopRestTimer, addRestTime,
  };
}
