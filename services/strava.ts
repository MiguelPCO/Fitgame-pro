import { getSupabase } from '../lib/supabase';
import { logger } from '../lib/logger';

/**
 * Integracion con Strava (Fase 7). El intercambio de codigo por token y la
 * importacion de actividades viven en las Edge Functions
 * (supabase/functions/strava-oauth, strava-webhook): este servicio solo hace
 * lo que es seguro hacer desde el navegador — construir la URL de
 * autorizacion (el client_id no es secreto), leer el estado de conexion (sin
 * los tokens, ver 06-modelo-datos.md SS F) y desconectar.
 */

const STRAVA_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';

export const isStravaConfigured = (): boolean =>
  !!import.meta.env.VITE_STRAVA_CLIENT_ID && !!import.meta.env.VITE_SUPABASE_URL;

/**
 * URL de autorizacion de Strava. redirect_uri apunta a la Edge Function, no al
 * SPA (no hay rutas reales todavia, Fase 0 sin hacer): es la propia funcion la
 * que procesa el callback y redirige de vuelta al SPA con un aviso.
 * state=userId es como esa funcion, sin sesion propia, sabe que perfil conectar.
 */
export function getStravaAuthorizeUrl(userId: string): string {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID as string;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const redirectUri = `${supabaseUrl}/functions/v1/strava-oauth`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
    state: userId,
  });

  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

export interface StravaStatus {
  athleteId: number;
  connectedAt: string;
  lastSyncedAt: string | null;
}

/** Estado de conexion, nunca los tokens (el cliente no tiene GRANT para leerlos). */
export async function fetchStravaStatus(userId: string): Promise<StravaStatus | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('strava_connections')
      .select('athlete_id, connected_at, last_synced_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Error leyendo estado de Strava:', error);
      return null;
    }
    if (!data) return null;

    return { athleteId: data.athlete_id, connectedAt: data.connected_at, lastSyncedAt: data.last_synced_at };
  } catch (err) {
    logger.error('Error de red leyendo estado de Strava:', err);
    return null;
  }
}

/** Borra la conexion (y con ella los tokens): permitido por RLS, solo la fila propia. */
export async function disconnectStrava(userId: string): Promise<boolean> {
  const sb = await getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('strava_connections').delete().eq('user_id', userId);
    if (error) {
      logger.error('Error desconectando Strava:', error);
      return false;
    }
    return true;
  } catch (err) {
    logger.error('Error de red desconectando Strava:', err);
    return false;
  }
}
