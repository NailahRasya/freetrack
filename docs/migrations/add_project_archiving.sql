-- Migration: Add archiving columns to projects for freelancer & client
-- Run this in your Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS client_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS freelancer_archived BOOLEAN DEFAULT FALSE;

-- Create partial indexes for fast queries since active queries will always look for non-archived projects
CREATE INDEX IF NOT EXISTS idx_projects_client_archived ON public.projects(client_id, client_archived) WHERE client_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_archived ON public.projects(freelancer_id, freelancer_archived) WHERE freelancer_archived = FALSE;
