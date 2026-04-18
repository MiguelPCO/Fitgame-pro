-- Deletes all data for the calling user and removes their auth record.
-- SECURITY DEFINER so the function runs as postgres (bypassing RLS to reach auth.users).
-- The calling user is identified via auth.uid() — only works for the authenticated user.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.challenge_participants WHERE user_id = _uid;
  DELETE FROM public.personal_records      WHERE user_id = _uid;
  DELETE FROM public.workout_sessions      WHERE user_id = _uid;
  DELETE FROM public.templates             WHERE user_id = _uid;
  DELETE FROM public.profiles              WHERE id = _uid;
  DELETE FROM auth.users                   WHERE id = _uid;
END;
$$;

-- Only authenticated users can call this (they can only delete themselves)
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
