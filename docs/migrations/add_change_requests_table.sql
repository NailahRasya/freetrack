-- ============================================================
-- Migration: Add Change Requests Table & Scope Creep Workflow
-- ============================================================

CREATE TABLE IF NOT EXISTS public.change_requests (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id     uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason         text NOT NULL,
  new_budget     text, -- Stored as text to match projects.budget formatting
  new_deadline   date,
  status         text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  client_note    text,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Select Policy: Both freelancer and client can view change requests they are part of
CREATE POLICY "Users can view their own change requests"
  ON public.change_requests FOR SELECT
  USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- Insert Policy: Only freelancers can create change requests
CREATE POLICY "Freelancers can insert change requests"
  ON public.change_requests FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

-- Update Policy: Both freelancer (for cancelling/editing if allowed) and client (for approving/rejecting) can update
CREATE POLICY "Users can update their own change requests"
  ON public.change_requests FOR UPDATE
  USING (auth.uid() = freelancer_id OR auth.uid() = client_id);
