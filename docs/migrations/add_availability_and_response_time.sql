-- ============================================================
-- Migration: Add Freelancer Availability & Response Time Columns
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS availability text DEFAULT 'Tersedia Sekarang',
  ADD COLUMN IF NOT EXISTS response_time text DEFAULT '< 1 Jam';

-- 2. Update existing freelancers with default values
UPDATE public.profiles 
  SET availability = 'Tersedia Sekarang' 
  WHERE role = 'freelancer' AND availability IS NULL;

UPDATE public.profiles 
  SET response_time = '< 1 Jam' 
  WHERE role = 'freelancer' AND response_time IS NULL;

COMMENT ON COLUMN public.profiles.availability IS 'Tersedia Sekarang, Tersedia Part-Time, or Sibuk';
COMMENT ON COLUMN public.profiles.response_time IS '< 1 Jam, 1-2 Jam, or Dalam 24 Jam';
