-- Migration: Add planning columns to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS planning_context text,
ADD COLUMN IF NOT EXISTS proposal_reason text;

-- Add index for better performance on project_id in milestones (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
