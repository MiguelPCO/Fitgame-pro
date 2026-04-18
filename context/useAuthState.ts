import { useState, Dispatch, SetStateAction } from 'react';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { loadFromStorage } from '../hooks/usePersist';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface AuthStateResult {
  user: UserProfile | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<UserProfile | null>>;
  setUserId: Dispatch<SetStateAction<string | null>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  updateUser: (data: Partial<UserProfile>, userId: string | null) => Promise<void>;
}

export function useAuthState(): AuthStateResult {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = async (data: Partial<UserProfile>, uid: string | null) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...data } : null;
      if (updated) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    if (!isSupabaseConfigured() || !uid) return;

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.goal !== undefined) updatePayload.goal = data.goal;
    if (data.daysPerWeek !== undefined) updatePayload.days_per_week = data.daysPerWeek;
    if (data.minutesPerSession !== undefined) updatePayload.minutes_per_session = data.minutesPerSession;
    if (data.equipment !== undefined) updatePayload.equipment = data.equipment;
    if (data.experienceLevel !== undefined) updatePayload.experience_level = data.experienceLevel;
    if (data.onboardingCompleted !== undefined) updatePayload.onboarding_completed = data.onboardingCompleted;

    if (Object.keys(updatePayload).length === 0) return;

    const sb = await getSupabase();
    if (!sb) return;

    const { error } = await sb
      .from('profiles')
      .update(updatePayload)
      .eq('id', uid);

    if (error) logger.error('Error updating profile:', error);
  };

  return {
    user, userId, isAuthenticated, isLoading,
    setUser, setUserId, setIsAuthenticated, setIsLoading,
    updateUser,
  };
}
