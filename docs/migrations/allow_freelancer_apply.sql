-- ============================================================
-- Migration: Allow Freelancers to Apply for Published Projects
-- ============================================================

-- Add policy to allow freelancers to update 'published' projects that have no freelancer assigned
CREATE POLICY "Allow freelancers to apply for published projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
    (status = 'published' AND freelancer_id IS NULL) OR
    auth.uid() = client_id OR
    auth.uid() = freelancer_id
)
WITH CHECK (
    (status = 'pending_client' AND freelancer_id = auth.uid()) OR
    auth.uid() = client_id OR
    auth.uid() = freelancer_id
);

-- Note: Ensure that the 'projects' table has RLS enabled
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
