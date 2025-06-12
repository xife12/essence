-- Automatic Test Data Cleanup Function
-- Run this in your Supabase SQL Editor to create the cleanup function

-- Function to clean up expired test data
CREATE OR REPLACE FUNCTION cleanup_expired_test_data()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_submissions INT;
  deleted_leads INT;
BEGIN
  -- Delete expired test leads
  DELETE FROM public.leads 
  WHERE is_test_lead = TRUE 
  AND test_deletion_at <= NOW();
  
  GET DIAGNOSTICS deleted_leads = ROW_COUNT;
  
  -- Delete expired test submissions
  DELETE FROM public.form_submissions 
  WHERE is_test_submission = TRUE 
  AND test_deletion_at <= NOW();
  
  GET DIAGNOSTICS deleted_submissions = ROW_COUNT;
  
  -- Return cleanup summary
  RETURN format('Cleanup completed: %s test submissions and %s test leads deleted', 
                deleted_submissions, deleted_leads);
END;
$$;

-- Create a scheduled job to run cleanup every hour (if pg_cron is enabled)
-- SELECT cron.schedule('cleanup-test-data', '0 * * * *', 'SELECT cleanup_expired_test_data();');

-- Alternative: Manual cleanup query you can run periodically
-- SELECT cleanup_expired_test_data();

-- View current test data that will be cleaned up
SELECT 
  'form_submissions' as table_name,
  id,
  test_deletion_at,
  CASE 
    WHEN test_deletion_at <= NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM public.form_submissions 
WHERE is_test_submission = TRUE

UNION ALL

SELECT 
  'leads' as table_name,
  id::text,
  test_deletion_at,
  CASE 
    WHEN test_deletion_at <= NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM public.leads 
WHERE is_test_lead = TRUE

ORDER BY test_deletion_at DESC; 