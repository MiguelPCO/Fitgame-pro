import { getSupabase } from '../lib/supabase';
import { ActivityType, ScheduledSession, ScheduledStatus } from '../types';
import { logger } from '../lib/logger';

/**
 * Sincronizacion del calendario (Fase 4). La fuente de verdad es localStorage:
 * el criterio de la fase es que el calendario funcione sin conexion, asi que
 * Supabase es espejo, no dependencia.
 */

/** 42P01 = undefined_table. La migracion de scheduled_sessions puede no estar aplicada. */
const UNDEFINED_TABLE = '42P01';

/**
 * Se apaga sola la primera vez que la tabla no existe, en lugar de reintentar y
 * llenar el log en cada guardado. Se reevalua al recargar la pagina.
 */
let tableMissing = false;

export const isScheduleSyncAvailable = (): boolean => !tableMissing;

interface DBScheduledSession {
  id: string;
  user_id: string;
  scheduled_for: string;
  activity_type: string;
  template_id: string | null;
  title: string | null;
  status: string;
  session_id: string | null;
  sort_order: number | null;
}

const toScheduledSession = (row: DBScheduledSession): ScheduledSession => ({
  id: row.id,
  scheduledFor: row.scheduled_for,
  activityType: row.activity_type as ActivityType,
  templateId: row.template_id || undefined,
  title: row.title || 'Sesion',
  status: row.status as ScheduledStatus,
  sessionId: row.session_id || undefined,
  sortOrder: row.sort_order ?? 0,
});

const toRow = (session: ScheduledSession, userId: string) => ({
  id: session.id,
  user_id: userId,
  scheduled_for: session.scheduledFor,
  activity_type: session.activityType,
  template_id: session.templateId ?? null,
  title: session.title,
  status: session.status,
  session_id: session.sessionId ?? null,
  sort_order: session.sortOrder,
});

/** true si el error era "la tabla no existe", en cuyo caso se apaga la sincronizacion. */
function handleError(error: { code?: string; message?: string } | null, context: string): boolean {
  if (!error) return false;
  if (error.code === UNDEFINED_TABLE) {
    tableMissing = true;
    logger.warn('scheduled_sessions no existe todavia; el calendario se queda en local.');
    return true;
  }
  logger.error(`Error ${context} scheduled_sessions:`, error);
  return false;
}

export async function fetchScheduledSessions(userId: string): Promise<ScheduledSession[] | null> {
  if (tableMissing) return null;
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('scheduled_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });

    if (error) {
      handleError(error, 'leyendo');
      return null;
    }
    return ((data ?? []) as unknown as DBScheduledSession[]).map(toScheduledSession);
  } catch (err) {
    logger.error('Error de red leyendo scheduled_sessions:', err);
    return null;
  }
}

/** Sube las sesiones dadas. Silencioso a proposito: local ya se guardo antes de llamar. */
export async function upsertScheduledSessions(
  sessions: ScheduledSession[],
  userId: string
): Promise<boolean> {
  if (tableMissing || sessions.length === 0) return false;
  const sb = await getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('scheduled_sessions')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(sessions.map(s => toRow(s, userId)) as any, { onConflict: 'id' });

    return !error && !handleError(error, 'guardando');
  } catch (err) {
    logger.error('Error de red guardando scheduled_sessions:', err);
    return false;
  }
}
