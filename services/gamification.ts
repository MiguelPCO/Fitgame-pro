import { getSupabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { ChallengeType, EarnedBadge, UserProfile } from '../types';

/**
 * Gamificacion al servidor (Fase 6). El cliente sigue calculando localmente que
 * badge cree haber ganado y que progreso lleva un reto (para el toast al
 * instante), pero la escritura real y el pago de XP los hace el servidor:
 * award_badge()/claim_weekly_challenge_bonus() revalidan la condicion antes de
 * insertar o pagar. Ver supabase/migrations/20260927000000_weekly_gamification.sql.
 */

/** Trae los badges ya confirmados por el servidor para este usuario. */
export async function fetchEarnedBadges(userId: string): Promise<EarnedBadge[] | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('earned_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error leyendo earned_badges:', error);
      return null;
    }
    return (data ?? []).map(r => ({ badgeId: r.badge_id, earnedAt: r.earned_at }));
  } catch (err) {
    logger.error('Error de red leyendo earned_badges:', err);
    return null;
  }
}

/**
 * Pide al servidor que revalide y registre un badge. Devuelve true si quedo
 * registrado (la condicion se cumplia de verdad), false si no, null si no se
 * pudo ni siquiera comprobar (sin conexion).
 */
export async function awardBadge(badgeId: string): Promise<boolean | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.rpc('award_badge', {
      p_badge_id: badgeId,
      p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (error) {
      logger.error('Error en award_badge:', error);
      return null;
    }
    return Boolean(data);
  } catch (err) {
    logger.error('Error de red en award_badge:', err);
    return null;
  }
}

export type ClaimChallengeResult = Pick<UserProfile, 'xp' | 'level' | 'xpToNextLevel' | 'tier'> & {
  completed: boolean;
  bonusXP?: number;
};

/**
 * Reclama el bonus del reto semanal actual. El servidor recalcula el progreso
 * desde workout_sessions/personal_records y solo paga si el objetivo real se
 * cumple; type/target/bonusXP se validan contra una lista blanca (no se puede
 * inventar un bonus mayor). Idempotente: como mucho un reto pagado por semana.
 */
export async function claimWeeklyChallengeBonus(
  type: ChallengeType,
  target: number,
  bonusXP: number
): Promise<ClaimChallengeResult | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.rpc('claim_weekly_challenge_bonus', {
      p_type: type,
      p_target: target,
      p_bonus_xp: bonusXP,
      p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (error || !data) {
      logger.error('Error en claim_weekly_challenge_bonus:', error);
      return null;
    }
    const r = data as {
      completed: boolean; bonus_xp?: number; xp?: number; level?: number;
      xp_to_next_level?: number; tier?: UserProfile['tier'];
    };
    if (!r.completed || r.xp === undefined) return { completed: false, xp: 0, level: 0, xpToNextLevel: 0, tier: 'Novice' };
    return {
      completed: true,
      bonusXP: r.bonus_xp,
      xp: r.xp,
      level: r.level!,
      xpToNextLevel: r.xp_to_next_level!,
      tier: r.tier!,
    };
  } catch (err) {
    logger.error('Error de red en claim_weekly_challenge_bonus:', err);
    return null;
  }
}
