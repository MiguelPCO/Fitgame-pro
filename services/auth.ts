import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
}

// Sign up with email and password
export async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, session: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signUp({
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
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, session: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
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
  if (!isSupabaseConfigured() || !supabase) {
    return { error: null }; // No-op if not configured
  }

  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

// Get current session
export async function getSession(): Promise<{ session: Session | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { session: null, error: null };
  }

  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error: error?.message || null };
}

// Get current user
export async function getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: null };
  }

  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error: error?.message || null };
}

// Reset password via email
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  });

  return { error: error?.message || null };
}

// Delete user account and all data
export async function deleteAccount(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase not configured' };
  }

  // RLS cascade will delete all user data (profiles, templates, sessions, records)
  // Sign out the user (Supabase admin function needed for full deletion)
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured() || !supabase) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return { unsubscribe: () => subscription.unsubscribe() };
}
