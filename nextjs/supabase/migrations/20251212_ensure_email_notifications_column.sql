-- Ensure email_notifications column exists in user_settings
-- This migration is idempotent and safe to run multiple times

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Update any existing rows that might have NULL values
UPDATE user_settings
SET email_notifications = true
WHERE email_notifications IS NULL;

COMMENT ON COLUMN user_settings.email_notifications IS 'Whether the user wants to receive email notifications for shopping lists and meal plan reminders';

