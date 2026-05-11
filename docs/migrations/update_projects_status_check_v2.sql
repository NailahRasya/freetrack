-- ============================================================
-- Migration: Add 'agreed' and other statuses to Projects Check Constraint
-- ============================================================

-- Drop the existing constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add the updated constraint with all necessary workflow statuses
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN (
    'draft', 
    'published', 
    'pending_client', 
    'pending_freelancer', 
    'agreed', 
    'active', 
    'ongoing', 
    'review', 
    'completed', 
    'cancelled'
  ));
