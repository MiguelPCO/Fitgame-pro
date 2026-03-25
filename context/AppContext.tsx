import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, WorkoutSession, WorkoutTemplate, WorkoutSet, ActiveExercise, WeeklySchedule, EarnedBadge, WeeklyChallenge, StreakFreezeState, PeriodizationState } from '../types';
import { currentUser as mockUser, mockTemplates } from '../data/mockData';
import { STORAGE_KEYS, DEFAULT_SET_CONFIG } from '../lib/constants';
import { playNotification } from '../services/audio';
import { calculateNewUserStats, calculateWorkoutXP, getValidatedStreak, PRRecord, XPBreakdown } from '../services/xp';
import { loadFromStorage } from '../hooks/usePersist';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { onAuthStateChange, signOut, getSession } from '../services/auth';
import { fetchTemplates, upsertTemplate, deleteTemplateFromDB } from '../services/templates';
import { fetchWorkoutHistory, saveCompletedSession, getPersonalRecords, upsertPersonalRecords, updateSession } from '../services/workoutSessions';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { processQueue, getQueue } from '../services/offlineQueue';
import { getRecommendedWeight, getWarmupWeight } from '../lib/weightRecommendation';
import { logger } from '../lib/logger';
import { useToast } from '../components/ui/Toast';
import { checkForNewBadges } from '../lib/badges';
import { getBadgeDefinition } from '../lib/badges';
import { generateWeeklyChallenge, evaluateChallengeProgress, getWeekStart } from '../lib/challenges';
import { notifyBadgeUnlocked, notifyPRAchieved, notifyChallengeCompleted } from '../lib/notifications';
import {
  PHASE_CONFIGS, getDefaultPeriodizationState,
  shouldTransitionPhase, advancePhase, countTrainingWeeksInPhase,
} from '../lib/periodization';
import { exerciseBlueprints } from '../data/exerciseBlueprints';

interface RestTimerState {
  remaining: number;
  duration: number;
  isActive: boolean;
  endTime?: number;
}

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

  // Gamification
  earnedBadges: EarnedBadge[];
  newlyEarnedBadges: EarnedBadge[]; // Cleared after Dashboard reads them
  weeklyChallenge: WeeklyChallenge | null;
  streakFreezes: StreakFreezeState;
  periodizationState: PeriodizationState;
  useStreakFreeze: () => boolean;
  clearNewlyEarnedBadges: () => void;

  // Rest Timer
  restTimer: RestTimerState;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => loadFromStorage(STORAGE_KEYS.TEMPLATES, mockTemplates));
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => loadFromStorage(STORAGE_KEYS.ACTIVE_WORKOUT, null));
  const [lastCompletedSession, setLastCompletedSession] = useState<WorkoutSession | null>(() => loadFromStorage(STORAGE_KEYS.LAST_SESSION, null));
  const [lastXPBreakdown, setLastXPBreakdown] = useState<XPBreakdown | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => loadFromStorage(STORAGE_KEYS.HISTORY, []));
  const [personalRecords, setPersonalRecords] = useState<Map<string, PRRecord>>(new Map());
  const [weeklySchedule, setWeeklyScheduleState] = useState<WeeklySchedule>(() => loadFromStorage(STORAGE_KEYS.SCHEDULE, {}));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Gamification state
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>(() => loadFromStorage(STORAGE_KEYS.BADGES, []));
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<EarnedBadge[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(() => {
    const stored = loadFromStorage<WeeklyChallenge | null>(STORAGE_KEYS.WEEKLY_CHALLENGE, null);
    const currentWeek = getWeekStart();
    if (!stored || stored.weekStart !== currentWeek) {
      return generateWeeklyChallenge(currentWeek);
    }
    return stored;
  });
  const [streakFreezes, setStreakFreezes] = useState<StreakFreezeState>(() => {
    const stored = loadFromStorage<StreakFreezeState | null>(STORAGE_KEYS.STREAK_FREEZES, null);
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!stored || stored.resetMonth !== currentMonth) {
      return { count: 2, resetMonth: currentMonth };
    }
    return stored;
  });

  const [periodizationState, setPeriodizationState] = useState<PeriodizationState>(() =>
    loadFromStorage<PeriodizationState | null>(STORAGE_KEYS.PERIODIZATION, null) ?? getDefaultPeriodizationState()
  );

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({ remaining: 0, duration: 0, isActive: false });

  // Load user data from Supabase
  const loadUserData = useCallback(async (uid: string) => {
    setUserId(uid);

    // Load templates from Supabase
    const supabaseTemplates = await fetchTemplates(uid);
    if (supabaseTemplates.length > 0) {
      setTemplates(supabaseTemplates);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(supabaseTemplates));
    }

    // Load workout history from Supabase
    const history = await fetchWorkoutHistory(uid);
    if (history.length > 0) {
      setWorkoutHistory(history);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }

    // Load personal records
    const prs = await getPersonalRecords(uid);
    setPersonalRecords(prs);
  }, []);

  // Load user profile from Supabase
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

    if (profile) {
      // Merge with localStorage fallback so local-only changes aren't lost
      const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);

      // Validate stored streak: reset to 0 if no workout in the last 2 days
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

      // Load schedule from profile
      if (profile.weekly_schedule) {
        const schedule = profile.weekly_schedule as Record<string, string>;
        const parsed: WeeklySchedule = {};
        for (const [key, val] of Object.entries(schedule)) {
          const dayNum = Number(key) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
          if (dayNum >= 0 && dayNum <= 6) parsed[dayNum] = val;
        }
        setWeeklyScheduleState(parsed);
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(parsed));
      }

      setUser(userProfile);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));

      // Load additional user data (templates, history, PRs)
      await loadUserData(uid);
    }
  }, [loadUserData, toast]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { session } = await getSession();

          if (session?.user) {
            await loadUserProfile(session.user.id);
            setIsAuthenticated(true);
          } else {
            // No Supabase session — try localStorage fallback
            const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
            if (storedUser) {
              const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
              const validatedStreak = getValidatedStreak(storedUser.streak, storedHistory);
              const userToSet = validatedStreak !== storedUser.streak ? { ...storedUser, streak: validatedStreak } : storedUser;
              if (validatedStreak !== storedUser.streak) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
              setUser(userToSet);
              setIsAuthenticated(true);
            }
          }
        } catch (err) {
          logger.error('Error initializing auth:', err);
          // Fallback to localStorage on Supabase failure
          const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
          if (storedUser) {
            const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
            const validatedStreak = getValidatedStreak(storedUser.streak, storedHistory);
            const userToSet = validatedStreak !== storedUser.streak ? { ...storedUser, streak: validatedStreak } : storedUser;
            if (validatedStreak !== storedUser.streak) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
            setUser(userToSet);
            setIsAuthenticated(true);
          }
        }
      } else {
        // Fallback to localStorage for offline mode
        const storedUser = loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
        const hasSession = !!localStorage.getItem(STORAGE_KEYS.SESSION);

        if (storedUser && hasSession) {
          const storedHistory = loadFromStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);
          const validatedStreak = getValidatedStreak(storedUser.streak, storedHistory);
          const userToSet = validatedStreak !== storedUser.streak ? { ...storedUser, streak: validatedStreak } : storedUser;
          if (validatedStreak !== storedUser.streak) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
          setUser(userToSet);
          setIsAuthenticated(true);
        }
      }

      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes (Supabase)
    if (isSupabaseConfigured()) {
      const { unsubscribe } = onAuthStateChange(async (authUser) => {
        if (authUser) {
          await loadUserProfile(authUser.id);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setUserId(null);
          setIsAuthenticated(false);
        }
      });

      return () => unsubscribe();
    }
  }, [loadUserProfile]);

  // Persistence Effects (localStorage fallback)
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates)); }, [templates]);
  useEffect(() => { if (activeWorkout) localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout)); else localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT); }, [activeWorkout]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(workoutHistory)); }, [workoutHistory]);
  useEffect(() => { if (lastCompletedSession) localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(lastCompletedSession)); }, [lastCompletedSession]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(weeklySchedule)); }, [weeklySchedule]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(earnedBadges)); }, [earnedBadges]);
  useEffect(() => { if (weeklyChallenge) localStorage.setItem(STORAGE_KEYS.WEEKLY_CHALLENGE, JSON.stringify(weeklyChallenge)); }, [weeklyChallenge]);

  // Recalculate challenge progress whenever workoutHistory changes (e.g. on app load or Supabase sync)
  useEffect(() => {
    if (!weeklyChallenge) return;
    const currentWeek = getWeekStart();
    const activeChallenge = weeklyChallenge.weekStart === currentWeek
      ? weeklyChallenge
      : generateWeeklyChallenge(currentWeek);
    const updated = evaluateChallengeProgress(activeChallenge, workoutHistory);
    if (updated.progress !== weeklyChallenge.progress || updated.weekStart !== weeklyChallenge.weekStart) {
      setWeeklyChallenge(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutHistory.length]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STREAK_FREEZES, JSON.stringify(streakFreezes)); }, [streakFreezes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PERIODIZATION, JSON.stringify(periodizationState)); }, [periodizationState]);

  // Rest Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (restTimer.isActive && restTimer.endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((restTimer.endTime! - now) / 1000);

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

  // Offline queue: auto-sync on reconnect and on startup
  const { isOnline, onReconnect } = useOnlineStatus();

  useEffect(() => {
    if (isOnline && getQueue().length > 0) {
      processQueue();
      toast('Datos sincronizados', 'info');
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  onReconnect(() => {
    processQueue();
    toast('Reconectado — sincronizando datos', 'info');
  });

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
      return {
        ...prev,
        remaining: prev.remaining + seconds,
        isActive: true,
        endTime: currentEnd + (seconds * 1000)
      };
    });
  };

  // Gamification actions
  const clearNewlyEarnedBadges = () => setNewlyEarnedBadges([]);

  const useStreakFreeze = (): boolean => {
    if (streakFreezes.count <= 0) return false;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newCount = streakFreezes.count - 1;
    const updated: StreakFreezeState = { count: newCount, resetMonth: currentMonth };
    setStreakFreezes(updated);
    localStorage.setItem(STORAGE_KEYS.STREAK_FREEZES, JSON.stringify(updated));
    toast(`Freeze activado — racha protegida. Te quedan ${newCount} freeze${newCount !== 1 ? 's' : ''}.`, 'info');
    return true;
  };

  // Auth Functions
  const login = (email: string) => {
    // Mock login for offline mode
    const userWithEmail = { ...mockUser, email };
    setUser(userWithEmail);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await signOut();
    }

    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
    setActiveWorkout(null);
    setWorkoutHistory([]);
    setPersonalRecords(new Map());
    setLastXPBreakdown(null);
    setWeeklyScheduleState({});
    stopRestTimer();

    setEarnedBadges([]);
    setNewlyEarnedBadges([]);
    const currentMonth = new Date().toISOString().slice(0, 7);
    setStreakFreezes({ count: 2, resetMonth: currentMonth });
    const currentWeek = getWeekStart();
    setWeeklyChallenge(generateWeeklyChallenge(currentWeek));

    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.LAST_SESSION);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    localStorage.removeItem(STORAGE_KEYS.WEEKLY_CHALLENGE);
    localStorage.removeItem(STORAGE_KEYS.STREAK_FREEZES);
  };

  const setWeeklySchedule = async (schedule: WeeklySchedule) => {
    setWeeklyScheduleState(schedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    setUser(prev => {
      const updated = prev ? { ...prev, weeklySchedule: schedule } : null;
      if (updated) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured() && userId) {
      const sb = await getSupabase();
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({ weekly_schedule: schedule as Record<string, string> })
          .eq('id', userId);

        if (error) {
          logger.error('Error saving schedule:', error);
        }
      }
    }
  };

  const getScheduledTemplate = useCallback((dayOfWeek: number): WorkoutTemplate | null => {
    const templateId = weeklySchedule[dayOfWeek as keyof WeeklySchedule];
    if (!templateId) return null;
    return templates.find(t => t.id === templateId) || null;
  }, [weeklySchedule, templates]);

  const updateUser = async (data: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...data } : null;
      // Persist immediately to localStorage (don't rely on async effect)
      if (updated) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    // Sync to Supabase if configured
    if (isSupabaseConfigured() && userId) {
      const updatePayload: Record<string, unknown> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.goal !== undefined) updatePayload.goal = data.goal;
      if (data.daysPerWeek !== undefined) updatePayload.days_per_week = data.daysPerWeek;
      if (data.minutesPerSession !== undefined) updatePayload.minutes_per_session = data.minutesPerSession;
      if (data.equipment !== undefined) updatePayload.equipment = data.equipment;
      if (data.experienceLevel !== undefined) updatePayload.experience_level = data.experienceLevel;
      if (data.onboardingCompleted !== undefined) updatePayload.onboarding_completed = data.onboardingCompleted;

      if (Object.keys(updatePayload).length > 0) {
        const sb = await getSupabase();
        if (sb) {
          const { error } = await sb
            .from('profiles')
            .update(updatePayload as Record<string, unknown>)
            .eq('id', userId);

          if (error) {
            logger.error('Error updating profile:', error);
            toast('Error al actualizar perfil', 'error');
          }
        }
      }
    }
  };

  // Template Functions with Supabase sync
  const saveTemplate = async (template: WorkoutTemplate) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      const updated = exists ? prev.map(t => t.id === template.id ? template : t) : [...prev, template];
      // Persist immediately to localStorage
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
      return updated;
    });

    // Sync to Supabase (non-blocking — local state is already saved)
    if (userId) {
      upsertTemplate(template, userId);
    }
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));

    // Sync to Supabase
    await deleteTemplateFromDB(id);
  };

  const startSession = (session: WorkoutSession) => {
    setActiveWorkout({ ...session, startTime: Date.now(), status: 'active' });
    stopRestTimer();
  };

  const startSessionFromTemplate = (template: WorkoutTemplate) => {
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration,
      muscleFocus: template.muscleFocus,
      completed: false,
      xpReward: 0, // Will be calculated on completion
      date: new Date().toISOString(),
      startTime: Date.now(),
      status: 'active' as const,
      exercises: (() => {
        const phaseConfig = PHASE_CONFIGS[periodizationState.currentPhase];
        return template.exercises.map(ex => {
        const topWeight = getRecommendedWeight(ex.exerciseId, phaseConfig.repRange, workoutHistory);
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
      });
      })()
    };
    setActiveWorkout(session);
    stopRestTimer();
  };

  const completeSession = async () => {
    if (!activeWorkout || !user) return;

    // Calculate XP with full bonus system
    const xpBreakdown = calculateWorkoutXP(activeWorkout, user.streak, personalRecords);

    const completedSession: WorkoutSession = {
      ...activeWorkout,
      endTime: Date.now(),
      completed: true,
      status: 'completed',
      xpReward: xpBreakdown.totalXP,
    };

    // Update local state
    const newHistory = [...workoutHistory, completedSession];
    setWorkoutHistory(newHistory);
    setLastCompletedSession(completedSession);
    setLastXPBreakdown(xpBreakdown);
    setActiveWorkout(null);
    stopRestTimer();

    // Update localStorage
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(completedSession));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);

    // ── Periodization: check phase transition ──────────────────────────────────
    if (shouldTransitionPhase(periodizationState, newHistory)) {
      const next = advancePhase(periodizationState);
      setPeriodizationState(next);
      localStorage.setItem(STORAGE_KEYS.PERIODIZATION, JSON.stringify(next));
      toast(`¡Ciclo completado! Entrando en Fase ${next.currentPhase}: ${PHASE_CONFIGS[next.currentPhase].name}`, 'success');
    } else {
      const weeks = countTrainingWeeksInPhase(newHistory, periodizationState.phaseStartDate);
      if (weeks !== periodizationState.completedTrainingWeeks) {
        setPeriodizationState(prev => ({ ...prev, completedTrainingWeeks: weeks }));
      }
    }

    // Find the last completed session before this one to compute streak correctly
    const lastCompletedSession = workoutHistory
      .filter(s => s.status === 'completed' && s.endTime)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];
    const lastWorkoutDate = lastCompletedSession?.endTime ? new Date(lastCompletedSession.endTime) : null;

    // Calculate new user stats
    const newStats = calculateNewUserStats(user, xpBreakdown.totalXP, lastWorkoutDate);
    const updatedUser = { ...user, ...newStats };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // ── Gamification: badges ───────────────────────────────────────
    // Build updated PRs map (also handles setPersonalRecords below)
    const updatedPRs = new Map<string, PRRecord>(personalRecords);
    if (xpBreakdown.prsAchieved.length > 0) {
      for (const exerciseId of xpBreakdown.prsAchieved) {
        const exercise = completedSession.exercises.find(e => e.exerciseId === exerciseId);
        if (exercise) {
          const bestSet = exercise.sets
            .filter(s => s.completed && s.weight > 0)
            .reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0 });
          if (bestSet.weight > 0) {
            updatedPRs.set(exerciseId, { weight: bestSet.weight, reps: bestSet.reps, date: new Date().toISOString() });
            // PR notification
            const exBlueprint = exerciseBlueprints.find(e => e.id === exerciseId);
            if (exBlueprint) notifyPRAchieved(exBlueprint.name, bestSet.weight);
          }
        }
      }
    }
    setPersonalRecords(updatedPRs);

    const newBadges = checkForNewBadges(updatedUser, newHistory, updatedPRs, earnedBadges);
    if (newBadges.length > 0) {
      const allBadges = [...earnedBadges, ...newBadges];
      setEarnedBadges(allBadges);
      setNewlyEarnedBadges(newBadges);
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(allBadges));
      // Notify first new badge
      const firstDef = getBadgeDefinition(newBadges[0].badgeId);
      if (firstDef) notifyBadgeUnlocked(firstDef.name);
    }

    // ── Gamification: weekly challenge ─────────────────────────────
    if (weeklyChallenge) {
      const currentWeek = getWeekStart();
      const activeChallenge = weeklyChallenge.weekStart === currentWeek
        ? weeklyChallenge
        : generateWeeklyChallenge(currentWeek);

      const prsThisWeek = xpBreakdown.prsAchieved.length;
      const updatedChallenge = evaluateChallengeProgress(activeChallenge, newHistory, prsThisWeek);

      if (updatedChallenge.completed && !activeChallenge.completed) {
        notifyChallengeCompleted(updatedChallenge.title, updatedChallenge.bonusXP);
        toast(`🎯 Reto completado: ${updatedChallenge.title} · +${updatedChallenge.bonusXP} XP`, 'success');
      }
      setWeeklyChallenge(updatedChallenge);
      localStorage.setItem(STORAGE_KEYS.WEEKLY_CHALLENGE, JSON.stringify(updatedChallenge));
    }

    // ── Sync to Supabase ───────────────────────────────────────────
    if (isSupabaseConfigured() && userId) {
      // Save completed session
      await saveCompletedSession(completedSession, userId);

      // Persist new PRs to personal_records table
      if (xpBreakdown.prsAchieved.length > 0) {
        const prRecords = xpBreakdown.prsAchieved.map(exerciseId => {
          const exercise = completedSession.exercises.find(e => e.exerciseId === exerciseId);
          const bestSet = exercise?.sets
            .filter(s => s.completed && s.weight > 0)
            .reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0 });
          return { exerciseId, weight: bestSet?.weight || 0, reps: bestSet?.reps || 0 };
        }).filter(r => r.weight > 0);

        await upsertPersonalRecords(userId, prRecords);
      }

      // Update user profile with new XP
      const sb = await getSupabase();
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({
            xp: newStats.xp,
            level: newStats.level,
            xp_to_next_level: newStats.xpToNextLevel,
            streak: newStats.streak,
            tier: newStats.tier,
          })
          .eq('id', userId);

        if (error) {
          logger.error('Error syncing XP to Supabase:', error);
          toast('Error al sincronizar XP', 'error');
        }
      }
    }
  };

  const updateSessionNotes = useCallback((sessionId: string, notes: string) => {
    const updated = workoutHistory.map(s =>
      s.id === sessionId ? { ...s, notes } : s
    );
    setWorkoutHistory(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    // Fire-and-forget Supabase sync
    if (isSupabaseConfigured()) {
      updateSession(sessionId, { notes }).catch(e => logger.error('Error syncing session notes:', e));
    }
  }, [workoutHistory]);

  // Workout Modifiers
  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: WorkoutSet[keyof WorkoutSet]) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      const targetExercise = { ...newExercises[exerciseIndex] };
      const newSets = [...targetExercise.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      targetExercise.sets = newSets;
      newExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: newExercises };
    });
  };

  const addSet = (exerciseIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      const targetExercise = { ...newExercises[exerciseIndex] };

      const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
      const recommended = lastSet ? (lastSet.weight > 0 ? lastSet.weight : lastSet.recommendedWeight) : 0;

      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        type: 'top',
        weight: recommended || 0,
        recommendedWeight: recommended,
        reps: lastSet ? lastSet.reps : 0,
        targetReps: lastSet ? lastSet.targetReps : '8-12',
        targetRPE: lastSet ? lastSet.targetRPE : 8,
        completed: false
      };

      targetExercise.sets = [...targetExercise.sets, newSet];
      newExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: newExercises };
    });
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      const targetExercise = { ...newExercises[exerciseIndex] };
      targetExercise.sets = targetExercise.sets.filter((_, i) => i !== setIndex);
      newExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: newExercises };
    });
  };

  const addExerciseToSession = (exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercise: ActiveExercise = {
        exerciseId,
        restTimer: DEFAULT_SET_CONFIG.restTimer,
        sets: [1, 2, 3].map((i) => ({
          id: `set-${Date.now()}-${i}`,
          type: 'top',
          weight: 0,
          recommendedWeight: 0,
          reps: 0,
          targetReps: DEFAULT_SET_CONFIG.targetReps,
          targetRPE: DEFAULT_SET_CONFIG.targetRPE,
          completed: false
        }))
      };
      return { ...prev, exercises: [...prev.exercises, newExercise] };
    });
  };

  const removeExerciseFromSession = (exerciseIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      newExercises.splice(exerciseIndex, 1);
      return { ...prev, exercises: newExercises };
    });
  };

  return (
    <AppContext.Provider value={{
      user, userId, isAuthenticated, isLoading, selectedDate, templates, activeWorkout,
      lastCompletedSession, lastXPBreakdown, workoutHistory, personalRecords, weeklySchedule,
      earnedBadges, newlyEarnedBadges, weeklyChallenge, streakFreezes, periodizationState,
      useStreakFreeze, clearNewlyEarnedBadges,
      restTimer, startRestTimer, stopRestTimer, addRestTime,
      login, logout, updateUser, setSelectedDate, saveTemplate, deleteTemplate,
      setWeeklySchedule, getScheduledTemplate,
      startSession, startSessionFromTemplate, completeSession, updateSessionNotes,
      updateSet, addSet, deleteSet, addExerciseToSession, removeExerciseFromSession
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
