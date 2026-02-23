-- Migration: Social Challenges
-- Adds social_challenges and challenge_participants tables for friend duels

-- ============================================
-- SOCIAL CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workouts', 'volume', 'streak')),
  title TEXT NOT NULL,
  target INTEGER NOT NULL,
  bonus_xp INTEGER DEFAULT 100,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHALLENGE PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.social_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view challenges (needed to look up by code)
CREATE POLICY "Authenticated users can view challenges" ON public.social_challenges
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only creator can insert/update/delete their challenge
CREATE POLICY "Users can create challenges" ON public.social_challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenge" ON public.social_challenges
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their challenge" ON public.social_challenges
  FOR DELETE USING (auth.uid() = creator_id);

-- Participants: anyone authenticated can view (to see others' progress)
CREATE POLICY "Authenticated users can view participants" ON public.challenge_participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can join challenges (insert themselves)
CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can leave challenges
CREATE POLICY "Users can leave challenges" ON public.challenge_participants
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_social_challenges_code ON public.social_challenges(code);
CREATE INDEX IF NOT EXISTS idx_social_challenges_creator ON public.social_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants(user_id);
