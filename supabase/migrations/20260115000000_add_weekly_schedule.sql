-- Migration: Add weekly schedule support to profiles
-- Adds JSONB column for storing user's weekly workout schedule

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_schedule JSONB DEFAULT NULL;
