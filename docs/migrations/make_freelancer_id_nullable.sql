-- ============================================================
-- Migration: Make Freelancer ID Nullable for Marketplace
-- ============================================================

-- Drop the NOT NULL constraint if it exists
ALTER TABLE public.projects ALTER COLUMN freelancer_id DROP NOT NULL;

-- Add category and skills columns to projects table for marketplace matching
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';

-- Ensure client_id is present for all projects (optional but recommended)
-- ALTER TABLE public.projects ALTER COLUMN client_id SET NOT NULL;
