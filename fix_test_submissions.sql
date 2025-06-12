-- Fix Test Submissions Database Structure
-- Run this in your Supabase SQL Editor

-- Add missing columns to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS is_test_submission BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_deletion_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to leads table for test leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS is_test_lead BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_deletion_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS form_submission_id UUID REFERENCES public.form_submissions(id);

-- Create indexes for efficient test data cleanup
CREATE INDEX IF NOT EXISTS idx_form_submissions_test_cleanup 
ON public.form_submissions (is_test_submission, test_deletion_at) 
WHERE is_test_submission = TRUE;

CREATE INDEX IF NOT EXISTS idx_leads_test_cleanup 
ON public.leads (is_test_lead, test_deletion_at) 
WHERE is_test_lead = TRUE;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'form_submissions' 
AND column_name IN ('is_test_submission', 'test_deletion_at');

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('is_test_lead', 'test_deletion_at', 'form_submission_id'); 