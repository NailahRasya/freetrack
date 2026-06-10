-- ============================================================
-- Migration: Add Freelancer Profiling Fields
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add city, country, billing_rate, billing_type, and completed_projects_count to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS billing_rate BIGINT,
  ADD COLUMN IF NOT EXISTS billing_type TEXT CHECK (billing_type IN ('hourly', 'fixed')),
  ADD COLUMN IF NOT EXISTS completed_projects_count INT DEFAULT 0;

-- 2. Add city, country, billing_rate, and billing_type to onboarding_freelancer
ALTER TABLE public.onboarding_freelancer
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS billing_rate BIGINT,
  ADD COLUMN IF NOT EXISTS billing_type TEXT CHECK (billing_type IN ('hourly', 'fixed'));
