import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

let _client: SupabaseClient<Database> | null = null;
let _initPromise: Promise<SupabaseClient<Database> | null> | null = null;

/**
 * Lazy-loads @supabase/supabase-js and returns the client.
 * The module is only downloaded when first called, keeping the main bundle lean.
 */
export async function getSupabase(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  if (_initPromise) return _initPromise;

  _initPromise = import('@supabase/supabase-js').then(({ createClient }) => {
    _client = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return _client;
  });

  return _initPromise;
}
