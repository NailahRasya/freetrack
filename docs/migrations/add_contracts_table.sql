-- ============================================================
-- Migration: Add Contracts Table & Approval Workflow
-- ============================================================

-- 1. Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id          uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  initiation_details  text,
  deliverables        text,
  timeline            text,
  payment_breakdown   text,
  status              text DEFAULT 'pending', -- pending, approved, rejected
  locked              boolean DEFAULT false,
  created_at          timestamp with time zone DEFAULT now(),
  updated_at          timestamp with time zone DEFAULT now()
);

-- 2. Add negotiation_count if missing (referenced in API but maybe not in SQL yet)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'negotiation_count') THEN
        ALTER TABLE public.projects ADD COLUMN negotiation_count int DEFAULT 0;
    END IF;
END $$;

-- 3. Add contract_id to projects for quick reference (optional but helpful)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL;

-- 4. Enable RLS for contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Freelancers can insert contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = freelancer_id OR auth.uid() = client_id);
