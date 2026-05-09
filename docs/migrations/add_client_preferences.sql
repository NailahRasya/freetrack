-- ============================================================
-- Migration: Add Client Preferences Columns
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add missing columns to onboarding_client table
ALTER TABLE public.onboarding_client 
  ADD COLUMN IF NOT EXISTS business_scale       text,
  ADD COLUMN IF NOT EXISTS work_type            text,
  ADD COLUMN IF NOT EXISTS experience_preference text;

-- 2. Add freelancer preference columns
ALTER TABLE public.onboarding_freelancer
  ADD COLUMN IF NOT EXISTS preferred_client_scales text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_type_preference     text[] DEFAULT '{}';

-- 3. Add UNIQUE constraint to user_id to enable upsert (ON CONFLICT)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_client_user_id_key') THEN
        ALTER TABLE public.onboarding_client ADD CONSTRAINT onboarding_client_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 3. Add matching columns to profiles table for easier access/sync
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_scale       text,
  ADD COLUMN IF NOT EXISTS work_type            text,
  ADD COLUMN IF NOT EXISTS experience_preference text;

-- 3. Update existing data if necessary (Optional)
-- UPDATE public.onboarding_client SET business_scale = 'UMKM' WHERE business_scale IS NULL;
-- UPDATE public.onboarding_client SET work_type = 'one-time' WHERE work_type IS NULL;
-- UPDATE public.onboarding_client SET experience_preference = 'mid' WHERE experience_preference IS NULL;

COMMENT ON COLUMN public.onboarding_client.business_scale IS 'Individu, Startup, UMKM, or Korporasi';
COMMENT ON COLUMN public.onboarding_client.work_type IS 'one-time or ongoing';
COMMENT ON COLUMN public.onboarding_client.experience_preference IS 'junior, mid, or senior';
