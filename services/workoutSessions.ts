import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WorkoutSession, ActiveExercise } from '../types';

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
  };
}

/**
 * Convert app WorkoutSession to Supabase insert
 */
function toSessionInsert(session: WorkoutSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    name: session.name,
    duration: session.duration,
    muscle_focus: session.muscleFocus,
    exercises: JSON.parse(JSON.stringify(session.exercises)),
    status: session.status || 'pending',
    xp_reward: session.xpReward,
    start_time: session.startTime ? new Date(session.startTime).toISOString() : null,
    end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
  };
}

/**
 * Fetch workout history for the current user
 */
export async function fetchWorkoutHistory(
  userId: string,
  limit: number = 50
): Promise<WorkoutSession[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }

  return (data as DBWorkoutSession[] || []).map(toWorkoutSession);
}

/**
 * Fetch all sessions (including active, completed, skipped)
 */
export async function fetchAllSessions(userId: string): Promise<WorkoutSession[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return (data as DBWorkoutSession[] || []).map(toWorkoutSession);
}

/**
 * Save a completed workout session
 */
export async function saveCompletedSession(
  session: WorkoutSession,
  userId: string
): Promise<WorkoutSession | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const insert = toSessionInsert(session, userId);
  insert.status = 'completed';

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(insert as any)
    .select()
    .single();

  if (error) {
    console.error('Error saving session:', error);
    return null;
  }

  return toWorkoutSession(data as DBWorkoutSession);
}

/**
 * Update an existing session
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<WorkoutSession>
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.muscleFocus !== undefined) dbUpdates.muscle_focus = updates.muscleFocus;
  if (updates.exercises !== undefined) dbUpdates.exercises = JSON.parse(JSON.stringify(updates.exercises));
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.xpReward !== undefined) dbUpdates.xp_reward = updates.xpReward;
  if (updates.startTime !== undefined) {
    dbUpdates.start_time = updates.startTime ? new Date(updates.startTime).toISOString() : null;
  }
  if (updates.endTime !== undefined) {
    dbUpdates.end_time = updates.endTime ? new Date(updates.endTime).toISOString() : null;
  }

  const { error } = await supabase
    .from('workout_sessions')
    .update(dbUpdates as any)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    return false;
  }

  return true;
}

/**
 * Get the most recent completed session for comparison (PR detection)
 */
export async function getLastSessionForExercise(
  userId: string,
  exerciseId: string
): Promise<{ weight: number; reps: number } | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('exercises')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return null;
  }

  // Find the most recent set for this exercise
  for (const session of data) {
    const exercises = session.exercises as unknown as ActiveExercise[];
    const exercise = exercises.find(e => e.exerciseId === exerciseId);

    if (exercise) {
      const completedSets = exercise.sets.filter(s => s.completed && s.weight > 0);
      if (completedSets.length > 0) {
        // Return the heaviest completed set
        const best = completedSets.reduce((max, set) =>
          set.weight > max.weight ? set : max
        );
        return { weight: best.weight, reps: best.reps };
      }
    }
  }

  return null;
}

/**
 * Get personal records for all exercises (reads from personal_records table)
 */
export async function getPersonalRecords(
  userId: string
): Promise<Map<string, { weight: number; reps: number; date: string }>> {
  if (!isSupabaseConfigured() || !supabase) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('personal_records')
    .select('exercise_id, weight, reps, achieved_at')
    .eq('user_id', userId);

  if (error || !data) {
    return new Map();
  }

  const prs = new Map<string, { weight: number; reps: number; date: string }>();

  for (const row of data) {
    prs.set(row.exercise_id, {
      weight: Number(row.weight),
      reps: row.reps,
      date: row.achieved_at,
    });
  }

  return prs;
}

/**
 * Upsert personal records after a session (only for PRs that were achieved)
 */
export async function upsertPersonalRecords(
  userId: string,
  records: { exerciseId: string; weight: number; reps: number }[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || records.length === 0) {
    return false;
  }

  const rows = records.map(r => ({
    user_id: userId,
    exercise_id: r.exerciseId,
    weight: r.weight,
    reps: r.reps,
    achieved_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('personal_records')
    .upsert(rows, { onConflict: 'user_id,exercise_id' });

  if (error) {
    console.error('Error upserting personal records:', error);
    return false;
  }

  return true;
}
