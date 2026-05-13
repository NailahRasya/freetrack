-- Migration: Add Storage Bucket and Policies for Milestone Evidence
-- Description: Create the milestone-evidence bucket and set up RLS policies
-- Date: 2026-05-13

-- ============================================
-- 1. Create storage bucket (if not exists)
-- ============================================
-- Note: In some Supabase versions, this must be done via the dashboard or API.
-- This SQL assumes the storage schema is available.

INSERT INTO storage.buckets (id, name, public)
VALUES ('milestone-evidence', 'milestone-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Enable RLS on the bucket
-- ============================================
-- Storage RLS is usually enabled by default, but we ensure policies exist.

-- ============================================
-- 3. Create Storage Policies
-- ============================================

-- Policy: Freelancer can upload files to their project folder
CREATE POLICY "Freelancers can upload evidence files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'milestone-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p
    WHERE p.freelancer_id = auth.uid()
  )
);

-- Policy: Project participants can view files
CREATE POLICY "Project participants can view evidence files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'milestone-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p
    WHERE p.client_id = auth.uid() OR p.freelancer_id = auth.uid()
  )
);

-- Policy: Freelancers can delete their own files (before approval)
CREATE POLICY "Freelancers can delete own evidence files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'milestone-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p
    WHERE p.freelancer_id = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM milestones m
    WHERE m.project_id::text = (storage.foldername(storage.objects.name))[1]
    AND m.status NOT IN ('Approved', 'Completed')
  )
);

-- Policy: Freelancers can update their own files
CREATE POLICY "Freelancers can update own evidence files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'milestone-evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p
    WHERE p.freelancer_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'milestone-evidence'
);
