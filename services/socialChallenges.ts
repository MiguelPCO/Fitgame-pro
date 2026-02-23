import { getSupabase } from '../lib/supabase';
import { WorkoutSession, UserProfile } from '../types';
import { logger } from '../lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChallengeType = 'workouts' | 'volume' | 'streak';

export interface SocialChallenge {
  id: string;
  code: string;
  creator_id: string;
  creator_name: string;
  type: ChallengeType;
  title: string;
  target: number;
  bonus_xp: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  participants?: ChallengeParticipant[];
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  progress: number;
  joined_at: string;
}

// ─── Code generation ──────────────────────────────────────────────────────────

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Progress computation (local, from workoutHistory) ────────────────────────

export function computeProgress(
  type: ChallengeType,
  workoutHistory: WorkoutSession[],
  user: UserProfile,
  startsAt: string,
  endsAt: string
): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (type === 'streak') {
    return user.streak;
  }

  const sessions = workoutHistory.filter(s => {
    if (!s.completed) return false;
    const t = s.endTime ?? (s.date ? new Date(s.date).getTime() : 0);
    return t >= start && t <= end;
  });

  if (type === 'workouts') {
    return sessions.length;
  }

  if (type === 'volume') {
    return Math.round(
      sessions.reduce(
        (acc, s) =>
          acc +
          s.exercises.reduce(
            (eAcc, ex) =>
              eAcc + ex.sets.reduce((sAcc, set) => (set.completed ? sAcc + set.weight * set.reps : sAcc), 0),
            0
          ),
        0
      )
    );
  }

  return 0;
}

// ─── Supabase CRUD ────────────────────────────────────────────────────────────

export interface CreateChallengeParams {
  type: ChallengeType;
  title: string;
  target: number;
  bonusXp: number;
  durationDays: number;
  user: UserProfile & { id: string };
}

/** Create a new challenge and add the creator as first participant */
export async function createChallenge(
  params: CreateChallengeParams
): Promise<SocialChallenge | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  const code = generateCode();
  const now = new Date();
  const ends = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

  try {
    const { data: challenge, error } = await sb
      .from('social_challenges')
      .insert({
        code,
        creator_id: params.user.id,
        creator_name: params.user.name,
        type: params.type,
        title: params.title,
        target: params.target,
        bonus_xp: params.bonusXp,
        starts_at: now.toISOString(),
        ends_at: ends.toISOString(),
      })
      .select()
      .single();

    if (error || !challenge) {
      logger.error('Error creating challenge:', error);
      return null;
    }

    // Add creator as first participant
    await sb.from('challenge_participants').insert({
      challenge_id: challenge.id,
      user_id: params.user.id,
      user_name: params.user.name,
      progress: 0,
    });

    return challenge as SocialChallenge;
  } catch (err) {
    logger.error('createChallenge error:', err);
    return null;
  }
}

/** Look up a challenge by code and join it */
export async function joinChallenge(
  code: string,
  user: UserProfile & { id: string }
): Promise<SocialChallenge | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data: challenge, error } = await sb
      .from('social_challenges')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !challenge) {
      logger.warn('Challenge not found:', code);
      return null;
    }

    // Check if already a participant
    const { data: existing } = await sb
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      await sb.from('challenge_participants').insert({
        challenge_id: challenge.id,
        user_id: user.id,
        user_name: user.name,
        progress: 0,
      });
    }

    return challenge as SocialChallenge;
  } catch (err) {
    logger.error('joinChallenge error:', err);
    return null;
  }
}

/** Fetch all challenges the user participates in (with participants) */
export async function getMyChallenges(
  userId: string
): Promise<SocialChallenge[]> {
  const sb = await getSupabase();
  if (!sb) return [];

  try {
    // Get challenge IDs the user is in
    const { data: participations, error: pErr } = await sb
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', userId);

    if (pErr || !participations?.length) return [];

    const ids = participations.map(p => p.challenge_id as string);

    const { data: challenges, error: cErr } = await sb
      .from('social_challenges')
      .select('*, challenge_participants(*)')
      .in('id', ids)
      .order('created_at', { ascending: false });

    if (cErr || !challenges) return [];

    return challenges as SocialChallenge[];
  } catch (err) {
    logger.error('getMyChallenges error:', err);
    return [];
  }
}

/** Update own progress in a challenge */
export async function updateMyProgress(
  challengeId: string,
  userId: string,
  progress: number
): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;

  try {
    await sb
      .from('challenge_participants')
      .update({ progress })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);
  } catch (err) {
    logger.error('updateMyProgress error:', err);
  }
}

/** Leave a challenge */
export async function leaveChallenge(
  challengeId: string,
  userId: string
): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;

  try {
    await sb
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);
  } catch (err) {
    logger.error('leaveChallenge error:', err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CHALLENGE_TYPE_META: Record<
  ChallengeType,
  { label: string; unit: string; icon: string; options: number[] }
> = {
  workouts: {
    label: 'Completar más entrenamientos',
    unit: 'sesiones',
    icon: '🏋️',
    options: [3, 5, 7, 10],
  },
  volume: {
    label: 'Mayor volumen total',
    unit: 'kg',
    icon: '📊',
    options: [5000, 10000, 20000, 50000],
  },
  streak: {
    label: 'Mayor racha de días',
    unit: 'días',
    icon: '🔥',
    options: [7, 14, 21, 30],
  },
};

export function isActive(challenge: SocialChallenge): boolean {
  const now = Date.now();
  return (
    new Date(challenge.starts_at).getTime() <= now &&
    new Date(challenge.ends_at).getTime() >= now
  );
}

export function timeRemaining(challenge: SocialChallenge): string {
  const diff = new Date(challenge.ends_at).getTime() - Date.now();
  if (diff <= 0) return 'Finalizado';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
}
