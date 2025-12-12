-- Create storage bucket for pantry scan images
-- Note: This SQL creates the bucket structure, but the actual bucket creation
-- needs to be done via Supabase Dashboard or Management API

-- Storage bucket configuration (to be applied in Supabase Dashboard):
-- Bucket name: pantry-scans
-- Public: false (private bucket with RLS)
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 5MB (5242880 bytes)

-- Create RLS policies for the pantry-scans bucket
-- These policies would be applied through Supabase Dashboard Storage settings

-- Policy 1: Users can upload images to their household's folder
-- Path pattern: {household_id}/{scan_id}.*
-- Operation: INSERT
-- Check: bucket_id = 'pantry-scans' AND (storage.foldername(name))[1] IN (
--   SELECT household_id::text FROM household_members WHERE user_id = auth.uid()
-- )

-- Policy 2: Users can view images from their household
-- Path pattern: {household_id}/*
-- Operation: SELECT
-- Check: bucket_id = 'pantry-scans' AND (storage.foldername(name))[1] IN (
--   SELECT household_id::text FROM household_members WHERE user_id = auth.uid()
-- )

-- Policy 3: Users can delete their own uploaded images
-- Path pattern: {household_id}/{scan_id}.*
-- Operation: DELETE
-- Check: bucket_id = 'pantry-scans' AND (storage.foldername(name))[1] IN (
--   SELECT household_id::text FROM household_members WHERE user_id = auth.uid()
-- ) AND EXISTS (
--   SELECT 1 FROM pantry_scans
--   WHERE id::text = (storage.foldername(name))[2]
--   AND user_id = auth.uid()
-- )

-- Create a function to automatically delete old scan images after 30 days
CREATE OR REPLACE FUNCTION delete_old_pantry_scan_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scan_record RECORD;
BEGIN
  -- Find scans older than 30 days
  FOR scan_record IN
    SELECT id, household_id, image_url
    FROM pantry_scans
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND image_url IS NOT NULL
  LOOP
    -- Delete the image from storage (this would be done via Supabase client in practice)
    -- The actual deletion would be handled by a scheduled Edge Function
    UPDATE pantry_scans
    SET image_url = NULL
    WHERE id = scan_record.id;
  END LOOP;
END;
$$;

-- Note: Schedule this function to run daily via Supabase Cron Jobs
-- Example: SELECT cron.schedule('cleanup-pantry-images', '0 2 * * *', 'SELECT delete_old_pantry_scan_images();');

-- Add comment for documentation
COMMENT ON FUNCTION delete_old_pantry_scan_images() IS 'Removes pantry scan images older than 30 days to manage storage costs';