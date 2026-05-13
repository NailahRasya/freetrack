-- Migration: Add Milestone Evidence Support
-- Description: Create table and policies for storing milestone evidence (files and links)
-- Date: 2026-05-13

-- ============================================
-- 1. Create milestone_evidence table
-- ============================================

CREATE TABLE IF NOT EXISTS milestone_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  evidence_type VARCHAR(10) NOT NULL CHECK (evidence_type IN ('file', 'link')),
  
  -- For file uploads
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type VARCHAR(100),
  
  -- For external links
  external_link TEXT,
  link_title TEXT,
  
  -- Common fields
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  submission_version INTEGER DEFAULT 1,
  
  -- Constraints
  CONSTRAINT evidence_data_check CHECK (
    (evidence_type = 'file' AND file_url IS NOT NULL) OR
    (evidence_type = 'link' AND external_link IS NOT NULL)
  )
);

-- ============================================
-- 2. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_milestone_evidence_milestone 
  ON milestone_evidence(milestone_id);

CREATE INDEX IF NOT EXISTS idx_milestone_evidence_uploaded_by 
  ON milestone_evidence(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_milestone_evidence_active 
  ON milestone_evidence(is_active) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_milestone_evidence_type 
  ON milestone_evidence(evidence_type);

-- ============================================
-- 3. Update milestones table
-- ============================================

-- Add columns to track evidence submission
ALTER TABLE milestones 
ADD COLUMN IF NOT EXISTS evidence_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0;

-- ============================================
-- 4. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE milestone_evidence ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create RLS Policies
-- ============================================

-- Policy: Freelancer can insert evidence for their own milestones
CREATE POLICY "Freelancer can upload evidence"
ON milestone_evidence
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id = milestone_evidence.milestone_id
    AND p.freelancer_id = auth.uid()
  )
);

-- Policy: Project participants can view evidence
CREATE POLICY "Project participants can view evidence"
ON milestone_evidence
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id = milestone_evidence.milestone_id
    AND (p.client_id = auth.uid() OR p.freelancer_id = auth.uid())
  )
);

-- Policy: Freelancer can update their own evidence (before approval)
CREATE POLICY "Freelancer can update own evidence"
ON milestone_evidence
FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM milestones m
    WHERE m.id = milestone_evidence.milestone_id
    AND m.status NOT IN ('Approved', 'Completed')
  )
)
WITH CHECK (
  uploaded_by = auth.uid()
);

-- Policy: Freelancer can soft-delete their own evidence (before approval)
CREATE POLICY "Freelancer can delete own evidence"
ON milestone_evidence
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM milestones m
    WHERE m.id = milestone_evidence.milestone_id
    AND m.status NOT IN ('Approved', 'Completed')
  )
);

-- ============================================
-- 6. Create function to update evidence count
-- ============================================

CREATE OR REPLACE FUNCTION update_milestone_evidence_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE milestones
    SET 
      evidence_count = evidence_count + 1,
      evidence_submitted_at = CASE 
        WHEN evidence_submitted_at IS NULL THEN NOW()
        ELSE evidence_submitted_at
      END
    WHERE id = NEW.milestone_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE milestones
    SET evidence_count = GREATEST(0, evidence_count - 1)
    WHERE id = OLD.milestone_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create trigger for evidence count
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_evidence_count ON milestone_evidence;

CREATE TRIGGER trigger_update_evidence_count
AFTER INSERT OR DELETE ON milestone_evidence
FOR EACH ROW
EXECUTE FUNCTION update_milestone_evidence_count();

-- ============================================
-- 8. Create function to get evidence with uploader info
-- ============================================

CREATE OR REPLACE FUNCTION get_milestone_evidence(p_milestone_id UUID)
RETURNS TABLE (
  id UUID,
  milestone_id UUID,
  evidence_type VARCHAR(10),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type VARCHAR(100),
  external_link TEXT,
  link_title TEXT,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  uploader_id UUID,
  uploader_name TEXT,
  uploader_role VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.milestone_id,
    e.evidence_type,
    e.file_url,
    e.file_name,
    e.file_size,
    e.file_type,
    e.external_link,
    e.link_title,
    e.description,
    e.uploaded_at,
    e.uploaded_by as uploader_id,
    p.full_name as uploader_name,
    p.role as uploader_role
  FROM milestone_evidence e
  JOIN profiles p ON e.uploaded_by = p.id
  WHERE e.milestone_id = p_milestone_id
  AND e.is_active = TRUE
  ORDER BY e.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Grant necessary permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON milestone_evidence TO authenticated;
GRANT EXECUTE ON FUNCTION get_milestone_evidence(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_milestone_evidence_count() TO authenticated;

-- ============================================
-- 10. Add comments for documentation
-- ============================================

COMMENT ON TABLE milestone_evidence IS 'Stores evidence (files and links) submitted by freelancers for milestone verification';
COMMENT ON COLUMN milestone_evidence.evidence_type IS 'Type of evidence: file (uploaded to storage) or link (external URL)';
COMMENT ON COLUMN milestone_evidence.submission_version IS 'Version number for tracking revisions';
COMMENT ON COLUMN milestone_evidence.is_active IS 'Soft delete flag - false means evidence was deleted';
COMMENT ON FUNCTION get_milestone_evidence(UUID) IS 'Retrieves all active evidence for a milestone with uploader information';
COMMENT ON FUNCTION update_milestone_evidence_count() IS 'Trigger function to maintain evidence_count in milestones table';

-- ============================================
-- Migration Complete
-- ============================================
