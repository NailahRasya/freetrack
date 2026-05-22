-- ==========================================
-- SQL Migration: Create Invoices Table
-- FreeTrack Project - Auto-Invoicing Feature
-- ==========================================

-- 1. Create the invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    freelancer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_title TEXT NOT NULL,
    milestone_title TEXT NOT NULL,
    milestone_description TEXT,
    client_name TEXT NOT NULL,
    freelancer_name TEXT NOT NULL,
    client_email TEXT,
    freelancer_email TEXT,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    activity_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy for Select (View invoices)
DROP POLICY IF EXISTS "Allow users to view their own invoices" ON public.invoices;
CREATE POLICY "Allow users to view their own invoices" ON public.invoices
    FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Policy for Update (Mark as Paid, update activity log, etc.)
DROP POLICY IF EXISTS "Allow users to update their own invoices" ON public.invoices;
CREATE POLICY "Allow users to update their own invoices" ON public.invoices
    FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = freelancer_id)
    WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- 4. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_milestone_id ON public.invoices(milestone_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer_id ON public.invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
