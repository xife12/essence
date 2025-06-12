-- Migration: Formbuilder Test Features
-- Adds test submission tracking and auto-deletion capabilities
-- Date: 2025-01-01

-- Add test submission tracking to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS is_test_submission BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_deletion_at TIMESTAMP WITH TIME ZONE;

-- Add test lead tracking to leads table  
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS is_test_lead BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_deletion_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS form_submission_id UUID REFERENCES public.form_submissions(id);

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_test_cleanup 
ON public.form_submissions (is_test_submission, test_deletion_at) 
WHERE is_test_submission = TRUE;

CREATE INDEX IF NOT EXISTS idx_leads_test_cleanup 
ON public.leads (is_test_lead, test_deletion_at) 
WHERE is_test_lead = TRUE;

-- Create function for automated test data cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_test_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_submissions INTEGER := 0;
  deleted_leads INTEGER := 0;
BEGIN
  -- Delete expired test submissions
  DELETE FROM public.form_submissions 
  WHERE is_test_submission = TRUE 
    AND test_deletion_at < NOW();
  
  GET DIAGNOSTICS deleted_submissions = ROW_COUNT;
  
  -- Delete expired test leads
  DELETE FROM public.leads 
  WHERE is_test_lead = TRUE 
    AND test_deletion_at < NOW();
  
  GET DIAGNOSTICS deleted_leads = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO public.system_logs (event_type, details, created_at)
  VALUES ('test_data_cleanup', 
          jsonb_build_object(
            'deleted_submissions', deleted_submissions,
            'deleted_leads', deleted_leads
          ),
          NOW())
  ON CONFLICT DO NOTHING; -- In case system_logs table doesn't exist
  
  RETURN deleted_submissions + deleted_leads;
END;
$$;

-- Create system_logs table if it doesn't exist (for cleanup logging)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_test_data() TO service_role;
GRANT INSERT ON public.system_logs TO service_role;

-- Comment the changes
COMMENT ON COLUMN public.form_submissions.is_test_submission IS 'Marks submission as test data for automatic cleanup';
COMMENT ON COLUMN public.form_submissions.test_deletion_at IS 'Timestamp when test submission should be automatically deleted';
COMMENT ON COLUMN public.leads.is_test_lead IS 'Marks lead as test data for automatic cleanup';
COMMENT ON COLUMN public.leads.test_deletion_at IS 'Timestamp when test lead should be automatically deleted';
COMMENT ON COLUMN public.leads.form_submission_id IS 'References the form submission that created this lead';
COMMENT ON FUNCTION cleanup_expired_test_data() IS 'Automatically deletes expired test submissions and leads';

-- Example usage (can be called manually or via cron):
-- SELECT cleanup_expired_test_data(); 