-- ============================================================
-- Migration: Onboarding Tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Client Onboarding Table
CREATE TABLE IF NOT EXISTS public.onboarding_client (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  project_categories  text[]      DEFAULT '{}',
  project_title       text,
  project_description text,
  budget_min          bigint,
  budget_max          bigint,
  deadline            date,
  required_skills     text[]      DEFAULT '{}',
  project_type        text        CHECK (project_type IN ('remote', 'hybrid', 'onsite')),
  draft_project_id    uuid        REFERENCES public.projects(id) ON DELETE SET NULL,
  completed_at        timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.onboarding_client ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own client onboarding"
  ON public.onboarding_client
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Freelancer Onboarding Table
CREATE TABLE IF NOT EXISTS public.onboarding_freelancer (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_categories    text[]      DEFAULT '{}',
  tools               text[]      DEFAULT '{}',
  experience_level    text        CHECK (experience_level IN ('junior', 'mid', 'senior', 'expert')),
  years_of_experience int,
  portfolio_url       text,
  completed_at        timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.onboarding_freelancer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own freelancer onboarding"
  ON public.onboarding_freelancer
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add onboarding_completed flag to profiles (optional, for existing users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS skills              text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tools              text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_level   text,
  ADD COLUMN IF NOT EXISTS years_of_experience int,
  ADD COLUMN IF NOT EXISTS portfolio_url      text;
