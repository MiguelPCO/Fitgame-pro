import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile, WorkoutSession, WorkoutTemplate, WorkoutSet, WeeklySchedule,
  EarnedBadge, WeeklyChallenge, StreakFreezeState, PeriodizationState,
} from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { currentUser as mockUser } from '../data/mockData';
import { calculateWorkoutXP, calculateNewUserStats, getValidatedStreak, PRRecord, XPBreakdown } from '../services/xp';
import { loadFromStorage } from '../hooks/usePersist';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { onAuthStateChange, signOut } from '../services/auth';
import { getSession } from '../services/auth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { processQueue, getQueue } from '../services/offlineQueue';
import { getRecommendedWeight, getWarmupWeight } from '../lib/weightRecommendation';
import { logger } from '../lib/logger';
import { useToast } from '../components/ui/Toast';
import { checkForNewBadges, getBadgeDefinition } from '../lib/badges';
import { generateWeeklyChallenge, evaluateChallengeProgress, getWeekStart } from '../lib/challenges';
import { notifyBadgeUnlocked, notifyPRAchieved, notifyChallengeCompleted } from '../lib/notifications';
import {
  PHASE_CONFIGS, shouldTransitionPhase, advancePhase, countTrainingWeeksInPhase,
} from '../lib/periodization';
import { exerciseBlueprints } from '../data/exerciseBlueprints';
import { useAuthState } from './useAuthState';
import { useWorkoutState } from './useWorkoutState';
import { useGamificationState, RestTimerState } from './useGamificationState';

interface AppState {
  user: UserProfile | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedDate: Date;
  templates: WorkoutTemplate[];
  activeWorkout: WorkoutSession | null;
  lastCompletedSession: WorkoutSession | null;
  lastXPBreakdown: XPBreakdown | null;
  workoutHistory: WorkoutSession[];
  personalRecords: Map<string, PRRecord>;
  weeklySchedule: WeeklySchedule;
  earnedBadges: EarnedBadge[];
  newlyEarnedBadges: EarnedBadge[];
  weeklyChallenge: WeeklyChallenge | null;
  streakFreezes: StreakFreezeState;
  periodizationState: PeriodizationState;
  restTimer: RestTimerState;

  useStreakFreeze: () => boolean;
  clearNewlyEarnedBadges: () => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  addRestTime: (seconds: number) => void;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  setSelectedDate: (date: Date) => void;
  saveTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  setWeeklySchedule: (schedule: WeeklySchedule) => void;
  getScheduledTemplate: (dayOfWeek: number) => WorkoutTemplate | null;
  startSession: (session: WorkoutSession) => void;
  startSessionFromTemplate: (template: WorkoutTemplate) => void;
  completeSession: () => void;
  updateSessionNotes: (sessionId: string, notes: string) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: WorkoutSet[keyof WorkoutSet]) => void;
  addSet: (exerciseIndex: number) => void;
  deleteSet: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToSession: (exerciseId: string) => void;
  removeExerciseFromSession: (exerciseIndex: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { isOnline, onReconnect } = useOnlineStatus();

  const auth = useAuthState();
  const workout = useWorkoutState();
  const gamification = useGamificationState();

  const [lastXPBreakdown, setLastXPBreakdown] = useState<XPBreakdown | null>(null);

  // ── Load user profile from Supabase ──────────────────────────────────────
  const loadUserProfile = useCallback(async (uid: string) => {
    const sb = await getSupabase();
    if (!sb) return;

    const { data: profile, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      logger.error('Error loading profile:', error);
      toast('Error al cargar perfil', 'error');
      return;
    }

    if (!profile) return;

    const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
    const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
    const validatedStreak = getValidatedStreak(profile.streak, storedHistory);

    const userProfile: UserProfile = {
      name: profile.name,
      email: profile.email,
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.xp_to_next_level,
      streak: validatedStreak,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
      tier: profile.tier as UserProfile['tier'],
      goal: profile.goal as UserProfile['goal'] || storedUser?.goal,
      daysPerWeek: profile.days_per_week || storedUser?.daysPerWeek,
      minutesPerSession: profile.minutes_per_session || storedUser?.minutesPerSession,
      equipment: profile.equipment || storedUser?.equipment,
      experienceLevel: profile.experience_level as UserProfile['experienceLevel'] || storedUser?.experienceLevel,
      onboardingCompleted: profile.onboarding_completed || storedUser?.onboardingCompleted || false,
    };

    if (profile.weekly_schedule) {
      const schedule = profile.weekly_schedule as Record<string, string>;
      const parsed: WeeklySchedule = {};
      for (const [key, val] of Object.entries(schedule)) {
        const dayNum = Number(key) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
        if (dayNum >= 0 && dayNum <= 6) parsed[dayNum] = val;
      }
      workout.setWeeklyScheduleState(parsed);
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(parsed));
    }

    auth.setUser(userProfile);
    auth.setUserId(uid);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    await workout.loadForUser(uid);
  }, [auth, workout, toast]);

  // ── Auth init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { session } = await getSession();
          if (session?.user) {
            await loadUserProfile(session.user.id);
            auth.setIsAuthenticated(true);
          } else {
            const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
            if (storedUser) {
              const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
              const validatedStreak = getValidatedStreak(storedUser.streak, storedHistory);
              const userToSet = validatedStreak !== storedUser.streak ? { ...storedUser, streak: validatedStreak } : storedUser;
              if (validatedStreak !== storedUser.streak) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
              auth.setUser(userToSet);
              auth.setIsAuthenticated(true);
            }
          }
        } catch (err) {
          logger.error('Error initializing auth:', err);
          const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
          if (storedUser) {
            auth.setUser(storedUser);
            auth.setIsAuthenticated(true);
          }
        }
      } else {
        const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
        const hasSession = !!localStorage.getItem(STORAGE_KEYS.SESSION);
        if (storedUser && hasSession) {
          const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
          const validatedStreak = getValidatedStreak(storedUser.streak, storedHistory);
          const userToSet = validatedStreak !== storedUser.streak ? { ...storedUser, streak: validatedStreak } : storedUser;
          if (validatedStreak !== storedUser.streak) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
          auth.setUser(userToSet);
          auth.setIsAuthenticated(true);
        }
      }
      auth.setIsLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured()) {
      const { unsubscribe } = onAuthStateChange(async (authUser) => {
        if (authUser) {
          await loadUserProfile(authUser.id);
          auth.setIsAuthenticated(true);
        } else {
          auth.setUser(null);
          auth.setUserId(null);
          auth.setIsAuthenticated(false);
        }
      });
      return () => unsubscribe();
    }
  }, [loadUserProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persistence effects ──────────────────────────────────────────────────
  useEffect(() => {
    if (auth.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth.user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [auth.user]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(workout.templates)); }, [workout.templates]);
  useEffect(() => {
    if (workout.activeWorkout) localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout.activeWorkout));
    else localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  }, [workout.activeWorkout]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(workout.workoutHistory)); }, [workout.workoutHistory]);
  useEffect(() => { if (workout.lastCompletedSession) localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(workout.lastCompletedSession)); }, [workout.lastCompletedSession]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(workout.weeklySchedule)); }, [workout.weeklySchedule]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(gamification.earnedBadges)); }, [gamification.earnedBadges]);
  useEffect(() => { if (gamification.weeklyChallenge) localStorage.setItem(STORAGE_KEYS.WEEKLY_CHALLENGE, JSON.stringify(gamification.weeklyChallenge)); }, [gamification.weeklyChallenge]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STREAK_FREEZES, JSON.stringify(gamification.streakFreezes)); }, [gamification.streakFreezes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PERIODIZATION, JSON.stringify(gamification.periodizationState)); }, [gamification.periodizationState]);

  // ── Challenge recalculation on history change ────────────────────────────
  useEffect(() => {
    if (!gamification.weeklyChallenge) return;
    const currentWeek = getWeekStart();
    const activeChallenge = gamification.weeklyChallenge.weekStart === currentWeek
      ? gamification.weeklyChallenge
      : generateWeeklyChallenge(currentWeek);
    const updated = evaluateChallengeProgress(activeChallenge, workout.workoutHistory);
    if (updated.progress !== gamification.weeklyChallenge.progress || updated.weekStart !== gamification.weeklyChallenge.weekStart) {
      gamification.setWeeklyChallenge(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout.workoutHistory.length]);

  // ── Offline queue: auto-sync + notify on drops ───────────────────────────
  useEffect(() => {
    if (isOnline && getQueue().length > 0) {
      processQueue().then(({ processed, dropped }) => {
        if (processed > 0) toast('Datos sincronizados', 'info');
        if (dropped > 0) toast(`⚠️ ${dropped} operación(es) perdidas tras reintentos. Revisa tu historial.`, 'error');
      });
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  onReconnect(() => {
    processQueue().then(({ dropped }) => {
      toast('Reconectado — sincronizando datos', 'info');
      if (dropped > 0) toast(`⚠️ ${dropped} operación(es) perdidas tras reintentos.`, 'error');
    });
  });

  // ── Cross-domain actions ──────────────────────────────────────────────────

  const login = (email: string) => {
    const userWithEmail = { ...mockUser, email };
    auth.setUser(userWithEmail);
    auth.setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
  };

  const logout = async () => {
    if (isSupabaseConfigured()) await signOut();

    auth.setUser(null);
    auth.setUserId(null);
    auth.setIsAuthenticated(false);
    workout.setActiveWorkout(null);
    workout.setWorkoutHistory([]);
    workout.setPersonalRecords(new Map());
    workout.setWeeklyScheduleState({});
    gamification.stopRestTimer();
    gamification.setEarnedBadges([]);
    gamification.setNewlyEarnedBadges([]);
    const currentMonth = new Date().toISOString().slice(0, 7);
    gamification.setStreakFreezes({ count: 2, resetMonth: currentMonth });
    gamification.setWeeklyChallenge(generateWeeklyChallenge(getWeekStart()));

    [
      STORAGE_KEYS.SESSION, STORAGE_KEYS.USER, STORAGE_KEYS.ACTIVE_WORKOUT,
      STORAGE_KEYS.LAST_SESSION, STORAGE_KEYS.HISTORY, STORAGE_KEYS.SCHEDULE,
      STORAGE_KEYS.BADGES, STORAGE_KEYS.WEEKLY_CHALLENGE, STORAGE_KEYS.STREAK_FREEZES,
    ].forEach(key => localStorage.removeItem(key));
  };

  const setWeeklySchedule = async (schedule: WeeklySchedule) => {
    workout.setWeeklyScheduleState(schedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    auth.setUser(prev => {
      const updated = prev ? { ...prev, weeklySchedule: schedule } : null;
      if (updated) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured() && auth.userId) {
      const sb = await getSupabase();
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({ weekly_schedule: schedule as Record<string, string> })
          .eq('id', auth.userId);
        if (error) logger.error('Error saving schedule:', error);
      }
    }
  };

  const startSession = (session: WorkoutSession) => {
    workout.setActiveWorkout({ ...session, startTime: Date.now(), status: 'active' });
    gamification.stopRestTimer();
  };

  const startSessionFromTemplate = (template: WorkoutTemplate) => {
    const phaseConfig = PHASE_CONFIGS[gamification.periodizationState.currentPhase];
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration,
      muscleFocus: template.muscleFocus,
      completed: false,
      xpReward: 0,
      date: new Date().toISOString(),
      startTime: Date.now(),
      status: 'active' as const,
      exercises: template.exercises.map(ex => {
        const topWeight = getRecommendedWeight(ex.exerciseId, phaseConfig.repRange, workout.workoutHistory);
        const warmupWeight = getWarmupWeight(topWeight);
        return {
          exerciseId: ex.exerciseId,
          restTimer: ex.restTimer,
          sets: Array.from({ length: ex.sets }).map((_, idx) => {
            const isWarmup = idx === 0;
            const recommended = isWarmup ? warmupWeight : topWeight;
            return {
              id: `set-${Date.now()}-${idx}`,
              type: isWarmup ? 'warmup' : 'top',
              weight: recommended,
              reps: 0,
              completed: false,
              targetReps: isWarmup ? ex.targetReps : phaseConfig.repRange,
              targetRPE: isWarmup ? ex.targetRPE : phaseConfig.rpeTarget,
              recommendedWeight: recommended,
            } as WorkoutSet;
          }),
        };
      }),
    };
    workout.setActiveWorkout(session);
    gamification.stopRestTimer();
  };

  const completeSession = async () => {
    if (!workout.activeWorkout || !auth.user) return;

    const xpBreakdown = calculateWorkoutXP(workout.activeWorkout, auth.user.streak, workout.personalRecords);

    const completedSession: WorkoutSession = {
      ...workout.activeWorkout,
      endTime: Date.now(),
      completed: true,
      status: 'completed',
      xpReward: xpBreakdown.totalXP,
    };

    const newHistory = [...workout.workoutHistory, completedSession];
    workout.setWorkoutHistory(newHistory);
    workout.setLastCompletedSession(completedSession);
    setLastXPBreakdown(xpBreakdown);
    workout.setActiveWorkout(null);
    gamification.stopRestTimer();

    localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(completedSession));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);

    // Periodization
    if (shouldTransitionPhase(gamification.periodizationState, newHistory)) {
      const next = advancePhase(gamification.periodizationState);
      gamification.setPeriodizationState(next);
      localStorage.setItem(STORAGE_KEYS.PERIODIZATION, JSON.stringify(next));
      toast(`¡Ciclo completado! Entrando en Fase ${next.currentPhase}: ${PHASE_CONFIGS[next.currentPhase].name}`, 'success');
    } else {
      const weeks = countTrainingWeeksInPhase(newHistory, gamification.periodizationState.phaseStartDate);
      if (weeks !== gamification.periodizationState.completedTrainingWeeks) {
        gamification.setPeriodizationState(prev => ({ ...prev, completedTrainingWeeks: weeks }));
      }
    }

    // XP + streak
    const lastCompleted = workout.workoutHistory
      .filter(s => s.status === 'completed' && s.endTime)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];
    const lastWorkoutDate = lastCompleted?.endTime ? new Date(lastCompleted.endTime) : null;
    const newStats = calculateNewUserStats(auth.user, xpBreakdown.totalXP, lastWorkoutDate);
    const updatedUser = { ...auth.user, ...newStats };
    auth.setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // PRs
    const updatedPRs = new Map<string, PRRecord>(workout.personalRecords);
    if (xpBreakdown.prsAchieved.length > 0) {
      for (const exerciseId of xpBreakdown.prsAchieved) {
        const exercise = completedSession.exercises.find(e => e.exerciseId === exerciseId);
        if (exercise) {
          const bestSet = exercise.sets
            .filter(s => s.completed && s.weight > 0)
            .reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0 });
          if (bestSet.weight > 0) {
            updatedPRs.set(exerciseId, { weight: bestSet.weight, reps: bestSet.reps, date: new Date().toISOString() });
            const blueprint = exerciseBlueprints.find(e => e.id === exerciseId);
            if (blueprint) notifyPRAchieved(blueprint.name, bestSet.weight);
          }
        }
      }
    }
    workout.setPersonalRecords(updatedPRs);

    // Badges
    const newBadges = checkForNewBadges(updatedUser, newHistory, updatedPRs, gamification.earnedBadges);
    if (newBadges.length > 0) {
      const allBadges = [...gamification.earnedBadges, ...newBadges];
      gamification.setEarnedBadges(allBadges);
      gamification.setNewlyEarnedBadges(newBadges);
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(allBadges));
      const firstDef = getBadgeDefinition(newBadges[0].badgeId);
      if (firstDef) notifyBadgeUnlocked(firstDef.name);
    }

    // Weekly challenge
    if (gamification.weeklyChallenge) {
      const currentWeek = getWeekStart();
      const activeChallenge = gamification.weeklyChallenge.weekStart === currentWeek
        ? gamification.weeklyChallenge
        : generateWeeklyChallenge(currentWeek);
      const prsThisWeek = xpBreakdown.prsAchieved.length;
      const updatedChallenge = evaluateChallengeProgress(activeChallenge, newHistory, prsThisWeek);
      if (updatedChallenge.completed && !activeChallenge.completed) {
        notifyChallengeCompleted(updatedChallenge.title, updatedChallenge.bonusXP);
        toast(`🎯 Reto completado: ${updatedChallenge.title} · +${updatedChallenge.bonusXP} XP`, 'success');
      }
      gamification.setWeeklyChallenge(updatedChallenge);
      localStorage.setItem(STORAGE_KEYS.WEEKLY_CHALLENGE, JSON.stringify(updatedChallenge));
    }

    // Supabase sync
    if (isSupabaseConfigured() && auth.userId) {
      await workout.saveSession(completedSession, auth.userId);

      if (xpBreakdown.prsAchieved.length > 0) {
        const prRecords = xpBreakdown.prsAchieved.map(exerciseId => {
          const exercise = completedSession.exercises.find(e => e.exerciseId === exerciseId);
          const bestSet = exercise?.sets
            .filter(s => s.completed && s.weight > 0)
            .reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0 });
          return { exerciseId, weight: bestSet?.weight || 0, reps: bestSet?.reps || 0 };
        }).filter(r => r.weight > 0);
        await workout.upsertPRs(auth.userId, prRecords);
      }

      const sb = await getSupabase();
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({ xp: newStats.xp, level: newStats.level, xp_to_next_level: newStats.xpToNextLevel, streak: newStats.streak, tier: newStats.tier })
          .eq('id', auth.userId);
        if (error) {
          logger.error('Error syncing XP to Supabase:', error);
          toast('Error al sincronizar XP', 'error');
        }
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user: auth.user,
      userId: auth.userId,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      selectedDate: workout.selectedDate,
      templates: workout.templates,
      activeWorkout: workout.activeWorkout,
      lastCompletedSession: workout.lastCompletedSession,
      lastXPBreakdown,
      workoutHistory: workout.workoutHistory,
      personalRecords: workout.personalRecords,
      weeklySchedule: workout.weeklySchedule,
      earnedBadges: gamification.earnedBadges,
      newlyEarnedBadges: gamification.newlyEarnedBadges,
      weeklyChallenge: gamification.weeklyChallenge,
      streakFreezes: gamification.streakFreezes,
      periodizationState: gamification.periodizationState,
      restTimer: gamification.restTimer,
      useStreakFreeze: () => gamification.useStreakFreeze(toast),
      clearNewlyEarnedBadges: gamification.clearNewlyEarnedBadges,
      startRestTimer: gamification.startRestTimer,
      stopRestTimer: gamification.stopRestTimer,
      addRestTime: gamification.addRestTime,
      login,
      logout,
      updateUser: (data) => auth.updateUser(data, auth.userId),
      setSelectedDate: workout.setSelectedDate,
      saveTemplate: (t) => workout.saveTemplate(t, auth.userId),
      deleteTemplate: workout.deleteTemplate,
      setWeeklySchedule,
      getScheduledTemplate: workout.getScheduledTemplate,
      startSession,
      startSessionFromTemplate,
      completeSession,
      updateSessionNotes: workout.updateSessionNotes,
      updateSet: workout.updateSet,
      addSet: workout.addSet,
      deleteSet: workout.deleteSet,
      addExerciseToSession: workout.addExerciseToSession,
      removeExerciseFromSession: workout.removeExerciseFromSession,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
