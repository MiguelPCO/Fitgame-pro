import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
}

// Sign up with email and password
export async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
  const sb = await getSupabase();
  if (!sb) return { user: null, session: null, error: 'Supabase not configured' };

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || 'Athlete' }
    }
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const sb = await getSupabase();
  if (!sb) return { user: null, session: null, error: 'Supabase not configured' };

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

// Sign out
export async function signOut(): Promise<{ error: string | null }> {
  const sb = await getSupabase();
  if (!sb) return { error: null };

  const { error } = await sb.auth.signOut();
  return { error: error?.message || null };
}

// Get current session
export async function getSession(): Promise<{ session: Session | null; error: string | null }> {
  const sb = await getSupabase();
  if (!sb) return { session: null, error: null };

  const { data, error } = await sb.auth.getSession();
  return { session: data.session, error: error?.message || null };
}

// Get current user
export async function getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
  const sb = await getSupabase();
  if (!sb) return { user: null, error: null };

  const { data, error } = await sb.auth.getUser();
  return { user: data.user, error: error?.message || null };
}

// Reset password via email
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const sb = await getSupabase();
  if (!sb) return { error: 'Supabase not configured' };

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  });

  return { error: error?.message || null };
}

// Delete user account and all data via SECURITY DEFINER RPC
export async function deleteAccount(): Promise<{ error: string | null }> {
  const sb = await getSupabase();
  if (!sb) return { error: 'Supabase not configured' };

  const { error: rpcError } = await sb.rpc('delete_user_account');
  if (rpcError) return { error: rpcError.message };

  await sb.auth.signOut();
  return { error: null };
}

// Listen to auth state changes — returns immediately, subscribes async after Supabase loads
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  let unsubscribeFn = () => {};

  getSupabase().then(sb => {
    if (!sb) return;
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    unsubscribeFn = () => subscription.unsubscribe();
  });

  return { unsubscribe: () => unsubscribeFn() };
}
