import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { WorkoutTemplate, WorkoutSession, WorkoutSet, ActiveExercise, WeeklySchedule } from '../types';
import { STORAGE_KEYS, DEFAULT_SET_CONFIG } from '../lib/constants';
import { loadFromStorage } from '../hooks/usePersist';
import { mockTemplates } from '../data/mockData';
import { fetchTemplates, upsertTemplate, deleteTemplateFromDB } from '../services/templates';
import { fetchWorkoutHistory, saveCompletedSession, getPersonalRecords, upsertPersonalRecords, updateSession } from '../services/workoutSessions';
import { isSupabaseConfigured } from '../lib/supabase';
import { PRRecord } from '../services/xp';
import { logger } from '../lib/logger';

export interface WorkoutStateResult {
  templates: WorkoutTemplate[];
  activeWorkout: WorkoutSession | null;
  lastCompletedSession: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  personalRecords: Map<string, PRRecord>;
  weeklySchedule: WeeklySchedule;
  selectedDate: Date;

  setTemplates: Dispatch<SetStateAction<WorkoutTemplate[]>>;
  setActiveWorkout: Dispatch<SetStateAction<WorkoutSession | null>>;
  setLastCompletedSession: Dispatch<SetStateAction<WorkoutSession | null>>;
  setWorkoutHistory: Dispatch<SetStateAction<WorkoutSession[]>>;
  setPersonalRecords: Dispatch<SetStateAction<Map<string, PRRecord>>>;
  setWeeklyScheduleState: Dispatch<SetStateAction<WeeklySchedule>>;

  loadForUser: (uid: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  saveTemplate: (template: WorkoutTemplate, userId: string | null) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getScheduledTemplate: (dayOfWeek: number) => WorkoutTemplate | null;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: WorkoutSet[keyof WorkoutSet]) => void;
  addSet: (exerciseIndex: number) => void;
  deleteSet: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToSession: (exerciseId: string) => void;
  removeExerciseFromSession: (exerciseIndex: number) => void;
  updateSessionNotes: (sessionId: string, notes: string) => void;

  saveSession: (session: WorkoutSession, userId: string) => ReturnType<typeof saveCompletedSession>;
  upsertPRs: typeof upsertPersonalRecords;
}

export function useWorkoutState(): WorkoutStateResult {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    loadFromStorage(STORAGE_KEYS.TEMPLATES, mockTemplates));
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() =>
    loadFromStorage(STORAGE_KEYS.ACTIVE_WORKOUT, null));
  const [lastCompletedSession, setLastCompletedSession] = useState<WorkoutSession | null>(() =>
    loadFromStorage(STORAGE_KEYS.LAST_SESSION, null));
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY, []));
  const [personalRecords, setPersonalRecords] = useState<Map<string, PRRecord>>(new Map());
  const [weeklySchedule, setWeeklyScheduleState] = useState<WeeklySchedule>(() =>
    loadFromStorage(STORAGE_KEYS.SCHEDULE, {}));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadForUser = useCallback(async (uid: string) => {
    const supabaseTemplates = await fetchTemplates(uid);
    if (supabaseTemplates.length > 0) {
      setTemplates(supabaseTemplates);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(supabaseTemplates));
    }

    const history = await fetchWorkoutHistory(uid);
    if (history.length > 0) {
      setWorkoutHistory(history);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }

    const prs = await getPersonalRecords(uid);
    setPersonalRecords(prs);
  }, []);

  const saveTemplate = useCallback(async (template: WorkoutTemplate, userId: string | null) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      const updated = exists
        ? prev.map(t => t.id === template.id ? template : t)
        : [...prev, template];
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
      return updated;
    });
    if (userId) upsertTemplate(template, userId);
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    await deleteTemplateFromDB(id);
  }, []);

  const getScheduledTemplate = useCallback((dayOfWeek: number): WorkoutTemplate | null => {
    const templateId = weeklySchedule[dayOfWeek as keyof WeeklySchedule];
    if (!templateId) return null;
    return templates.find(t => t.id === templateId) || null;
  }, [weeklySchedule, templates]);

  const updateSet = useCallback((
    exerciseIndex: number, setIndex: number,
    field: keyof WorkoutSet, value: WorkoutSet[keyof WorkoutSet]
  ) => {
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
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
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
        completed: false,
      };
      targetExercise.sets = [...targetExercise.sets, newSet];
      newExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const deleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      const targetExercise = { ...newExercises[exerciseIndex] };
      targetExercise.sets = targetExercise.sets.filter((_, i) => i !== setIndex);
      newExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const addExerciseToSession = useCallback((exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercise: ActiveExercise = {
        exerciseId,
        restTimer: DEFAULT_SET_CONFIG.restTimer,
        sets: [1, 2, 3].map(i => ({
          id: `set-${Date.now()}-${i}`,
          type: 'top',
          weight: 0,
          recommendedWeight: 0,
          reps: 0,
          targetReps: DEFAULT_SET_CONFIG.targetReps,
          targetRPE: DEFAULT_SET_CONFIG.targetRPE,
          completed: false,
        })),
      };
      return { ...prev, exercises: [...prev.exercises, newExercise] };
    });
  }, []);

  const removeExerciseFromSession = useCallback((exerciseIndex: number) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercises = [...prev.exercises];
      newExercises.splice(exerciseIndex, 1);
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const updateSessionNotes = useCallback((sessionId: string, notes: string) => {
    setWorkoutHistory(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, notes } : s);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
    if (isSupabaseConfigured()) {
      updateSession(sessionId, { notes }).catch(e => logger.error('Error syncing session notes:', e));
    }
  }, []);

  return {
    templates, activeWorkout, lastCompletedSession, workoutHistory,
    personalRecords, weeklySchedule, selectedDate,
    setTemplates, setActiveWorkout, setLastCompletedSession,
    setWorkoutHistory, setPersonalRecords, setWeeklyScheduleState,
    loadForUser, setSelectedDate, saveTemplate, deleteTemplate,
    getScheduledTemplate, updateSet, addSet, deleteSet,
    addExerciseToSession, removeExerciseFromSession, updateSessionNotes,
    saveSession: saveCompletedSession,
    upsertPRs: upsertPersonalRecords,
  };
}
