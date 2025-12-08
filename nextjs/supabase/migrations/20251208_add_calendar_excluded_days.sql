-- Add calendar_excluded_days column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS calendar_excluded_days TEXT[] DEFAULT '{}';

COMMENT ON COLUMN user_settings.calendar_excluded_days IS 'Days of the week to exclude from calendar sync (e.g., ["Friday", "Saturday"])';

