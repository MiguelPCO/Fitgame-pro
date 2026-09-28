import { getSupabase } from '../lib/supabase';
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

// ─── Supabase CRUD ────────────────────────────────────────────────────────────

export interface CreateChallengeParams {
  type: ChallengeType;
  title: string;
  target: number;
  bonusXp: number;
  durationDays: number;
}

/**
 * Create a new challenge. The server generates the code, takes the creator name
 * from profiles and adds the creator as first participant.
 */
export async function createChallenge(
  params: CreateChallengeParams
): Promise<SocialChallenge | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.rpc('create_challenge', {
      p_type: params.type,
      p_title: params.title,
      p_target: params.target,
      p_duration_days: params.durationDays,
      p_bonus_xp: params.bonusXp,
    });

    if (error || !data) {
      logger.error('Error creating challenge:', error);
      return null;
    }

    return data as SocialChallenge;
  } catch (err) {
    logger.error('createChallenge error:', err);
    return null;
  }
}

/** Join a challenge by code (server-side: only whoever has the code can join) */
export async function joinChallenge(code: string): Promise<SocialChallenge | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.rpc('join_challenge', { p_code: code }).maybeSingle();

    if (error || !data) {
      if (error) logger.error('joinChallenge error:', error);
      else logger.warn('Challenge not found:', code);
      return null;
    }

    return data as SocialChallenge;
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
      .select('*, participants:challenge_participants(*)')
      .in('id', ids)
      .order('created_at', { ascending: false });

    if (cErr || !challenges) return [];

    return challenges as unknown as SocialChallenge[];
  } catch (err) {
    logger.error('getMyChallenges error:', err);
    return [];
  }
}

/** Recompute progress of every participant in my active challenges (server-side, from workout_sessions) */
export async function refreshChallengeProgress(): Promise<void> {
  const sb = await getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb.rpc('refresh_challenge_progress');
    if (error) logger.error('refreshChallengeProgress error:', error);
  } catch (err) {
    logger.error('refreshChallengeProgress error:', err);
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
