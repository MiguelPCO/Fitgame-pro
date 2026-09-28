import { getSupabase } from '../lib/supabase';
import { WorkoutSession, ActiveExercise, UserProfile, RunType } from '../types';
import { logger } from '../lib/logger';

/** 42703 = undefined_column. La migracion de cardio (Fase 5) puede no estar aplicada. */
const UNDEFINED_COLUMN = '42703';

/**
 * Se apaga sola la primera vez que falta una columna de cardio, en lugar de
 * reintentar en cada guardado. Sin la migracion aplicada, una carrera se guarda
 * igual (como sesion generica) pero sin distance_m/run_type: se queda en 0 XP
 * hasta que la migracion se aplique — nunca se inventa XP en el cliente.
 */
let cardioColumnsMissing = false;

/**
 * Database workout session row type
 */
interface DBWorkoutSession {
  id: string;
  user_id: string;
  name: string;
  duration: string;
  muscle_focus: string[];
  exercises: unknown;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  xp_reward: number;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  notes?: string | null;
  activity_type?: 'strength' | 'run';
  distance_m?: number | null;
  moving_time_s?: number | null;
  elapsed_time_s?: number | null;
  perceived_effort?: number | null;
  run_type?: RunType | null;
}

/**
 * Convert Supabase WorkoutSession to app WorkoutSession
 */
function toWorkoutSession(dbSession: DBWorkoutSession): WorkoutSession {
  return {
    id: dbSession.id,
    name: dbSession.name,
    duration: dbSession.duration,
    muscleFocus: dbSession.muscle_focus,
    exercises: dbSession.exercises as ActiveExercise[],
    status: dbSession.status,
    xpReward: dbSession.xp_reward,
    startTime: dbSession.start_time ? new Date(dbSession.start_time).getTime() : undefined,
    endTime: dbSession.end_time ? new Date(dbSession.end_time).getTime() : undefined,
    completed: dbSession.status === 'completed',
    date: dbSession.created_at,
    notes: dbSession.notes || undefined,
    activityType: dbSession.activity_type,
    distanceM: dbSession.distance_m ?? undefined,
    movingTimeS: dbSession.moving_time_s ?? undefined,
    elapsedTimeS: dbSession.elapsed_time_s ?? undefined,
    perceivedEffort: dbSession.perceived_effort ?? undefined,
    runType: dbSession.run_type ?? undefined,
  };
}

/**
 * Convert app WorkoutSession to Supabase insert
 */
function toSessionInsert(session: WorkoutSession, userId: string) {
  const base = {
    id: session.id,
    user_id: userId,
    name: session.name,
    duration: session.duration,
    muscle_focus: session.muscleFocus,
    exercises: JSON.parse(JSON.stringify(session.exercises)),
    status: session.status || 'pending',
    // xp_reward no se envía: lo fija complete_workout en el servidor.
    start_time: session.startTime ? new Date(session.startTime).toISOString() : null,
    end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
    notes: session.notes || null,
  };

  if (cardioColumnsMissing || session.activityType !== 'run') return base;

  return {
    ...base,
    activity_type: session.activityType,
    distance_m: session.distanceM ?? null,
    moving_time_s: session.movingTimeS ?? null,
    elapsed_time_s: session.elapsedTimeS ?? null,
    perceived_effort: session.perceivedEffort ?? null,
    run_type: session.runType ?? null,
  };
}

/**
 * Fetch workout history for the current user
 */
export async function fetchWorkoutHistory(
  userId: string,
  limit: number = 50
): Promise<WorkoutSession[]> {
  const sb = await getSupabase();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching workout history:', error);
      return [];
    }

    return (data as DBWorkoutSession[] || []).map(toWorkoutSession);
  } catch (err) {
    logger.error('Network error fetching workout history:', err);
    return [];
  }
}

/**
 * Fetch all sessions (including active, completed, skipped)
 */
export async function fetchAllSessions(userId: string): Promise<WorkoutSession[]> {
  const sb = await getSupabase();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching sessions:', error);
      return [];
    }

    return (data as DBWorkoutSession[] || []).map(toWorkoutSession);
  } catch (err) {
    logger.error('Network error fetching sessions:', err);
    return [];
  }
}

/**
 * Save a completed workout session
 */
export async function saveCompletedSession(
  session: WorkoutSession,
  userId: string
): Promise<WorkoutSession | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const insert = toSessionInsert(session, userId);
    insert.status = 'completed';

    const { data, error } = await sb
      .from('workout_sessions')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insert as any)
      .select()
      .single();

    if (error?.code === UNDEFINED_COLUMN && !cardioColumnsMissing) {
      cardioColumnsMissing = true;
      logger.warn('Columnas de cardio no existen todavia; la carrera se guarda sin ellas.');
      return saveCompletedSession(session, userId);
    }

    if (error) {
      logger.error('Error saving session:', error);
      return null;
    }

    return toWorkoutSession(data as DBWorkoutSession);
  } catch (err) {
    logger.error('Network error saving session:', err);
    return null;
  }
}

/**
 * Update an existing session
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<WorkoutSession>
): Promise<boolean> {
  const sb = await getSupabase();
  if (!sb) return false;

  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.muscleFocus !== undefined) dbUpdates.muscle_focus = updates.muscleFocus;
    // exercises, status, tiempos y xp_reward no son editables tras guardar (GRANT UPDATE por columnas).
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

    const { error } = await sb
      .from('workout_sessions')
      .update(dbUpdates as Record<string, unknown>)
      .eq('id', sessionId);

    if (error) {
      logger.error('Error updating session:', error);
      return false;
    }

    return true;
  } catch (err) {
    logger.error('Network error updating session:', err);
    return false;
  }
}

export type ServerUserStats = Pick<UserProfile, 'xp' | 'level' | 'xpToNextLevel' | 'streak' | 'tier'> & {
  xpAwarded: number;
};

/**
 * Award XP for a saved completed session. XP, level, streak and tier are computed
 * server-side (RPC complete_workout, with per-session and per-day caps).
 * Returns the authoritative stats, or null on error.
 */
export async function awardWorkoutXP(sessionId: string): Promise<ServerUserStats | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.rpc('complete_workout', {
      p_session_id: sessionId,
      p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (error || !data) {
      logger.error('Error awarding workout XP:', error);
      return null;
    }

    const r = data as {
      xp_awarded: number; xp: number; level: number; xp_to_next_level: number; streak: number; tier: UserProfile['tier'];
    };
    return {
      xpAwarded: r.xp_awarded,
      xp: r.xp,
      level: r.level,
      xpToNextLevel: r.xp_to_next_level,
      streak: r.streak,
      tier: r.tier,
    };
  } catch (err) {
    logger.error('Network error awarding workout XP:', err);
    return null;
  }
}

/**
 * Get the most recent completed session for comparison (PR detection)
 */
export async function getLastSessionForExercise(
  userId: string,
  exerciseId: string
): Promise<{ weight: number; reps: number } | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('workout_sessions')
      .select('exercises')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return null;

    for (const session of data) {
      const exercises = session.exercises as unknown as ActiveExercise[];
      const exercise = exercises.find(e => e.exerciseId === exerciseId);

      if (exercise) {
        const completedSets = exercise.sets.filter(s => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          const best = completedSets.reduce((max, set) =>
            set.weight > max.weight ? set : max
          );
          return { weight: best.weight, reps: best.reps };
        }
      }
    }

    return null;
  } catch (err) {
    logger.error('Network error fetching last session for exercise:', err);
    return null;
  }
}

/**
 * Get personal records for all exercises (reads from personal_records table)
 */
export async function getPersonalRecords(
  userId: string
): Promise<Map<string, { weight: number; reps: number; date: string }>> {
  const sb = await getSupabase();
  if (!sb) return new Map();

  try {
    const { data, error } = await sb
      .from('personal_records')
      .select('exercise_id, weight, reps, achieved_at')
      .eq('user_id', userId);

    if (error || !data) return new Map();

    const prs = new Map<string, { weight: number; reps: number; date: string }>();

    for (const row of data) {
      prs.set(row.exercise_id, {
        weight: Number(row.weight),
        reps: row.reps,
        date: row.achieved_at,
      });
    }

    return prs;
  } catch (err) {
    logger.error('Network error fetching personal records:', err);
    return new Map();
  }
}

/**
 * Upsert personal records after a session (only for PRs that were achieved)
 */
export async function upsertPersonalRecords(
  userId: string,
  records: { exerciseId: string; weight: number; reps: number }[]
): Promise<boolean> {
  const sb = await getSupabase();
  if (!sb || records.length === 0) return false;

  try {
    const rows = records.map(r => ({
      user_id: userId,
      exercise_id: r.exerciseId,
      weight: r.weight,
      reps: r.reps,
      achieved_at: new Date().toISOString(),
    }));

    const { error } = await sb
      .from('personal_records')
      .upsert(rows, { onConflict: 'user_id,exercise_id' });

    if (error) {
      logger.error('Error upserting personal records:', error);
      return false;
    }

    return true;
  } catch (err) {
    logger.error('Network error upserting personal records:', err);
    return false;
  }
}
