-- 1. Profiles -> Auth Users
-- This is the most common block. Deleting an auth user will now delete their public profile.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Projects -> Profiles
-- Deleting a profile will now delete all projects where they are client or freelancer.
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE public.projects 
  ADD CONSTRAINT projects_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_freelancer_id_fkey;
ALTER TABLE public.projects 
  ADD CONSTRAINT projects_freelancer_id_fkey 
  FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Messages -> Profiles
-- Deleting a profile will now delete all messages sent or received by them.
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Contacts -> Profiles
-- Deleting a profile will now delete all contact entries related to them.
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_client_id_fkey;
ALTER TABLE public.contacts 
  ADD CONSTRAINT contacts_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_freelancer_id_fkey;
ALTER TABLE public.contacts 
  ADD CONSTRAINT contacts_freelancer_id_fkey 
  FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_invited_by_fkey;
ALTER TABLE public.contacts 
  ADD CONSTRAINT contacts_invited_by_fkey 
  FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Milestones -> Projects/Profiles
-- Deleting a project or profile will now delete associated milestones.
-- Using DO block in case the table or constraints have different names
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'milestones') THEN
        ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;
        ALTER TABLE public.milestones 
          ADD CONSTRAINT milestones_project_id_fkey 
          FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

        ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_client_id_fkey;
        ALTER TABLE public.milestones 
          ADD CONSTRAINT milestones_client_id_fkey 
          FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

        ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_freelancer_id_fkey;
        ALTER TABLE public.milestones 
          ADD CONSTRAINT milestones_freelancer_id_fkey 
          FOREIGN KEY (freelancer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Ensure onboarding tables also have correct constraints (just in case)
ALTER TABLE public.onboarding_client DROP CONSTRAINT IF EXISTS onboarding_client_user_id_fkey;
ALTER TABLE public.onboarding_client 
  ADD CONSTRAINT onboarding_client_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.onboarding_freelancer DROP CONSTRAINT IF EXISTS onboarding_freelancer_user_id_fkey;
ALTER TABLE public.onboarding_freelancer 
  ADD CONSTRAINT onboarding_freelancer_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
