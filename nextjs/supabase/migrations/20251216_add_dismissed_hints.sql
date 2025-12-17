-- Add dismissed_hints column to user_settings for tracking which contextual hints users have dismissed
-- This stores an array of hint IDs (e.g., ["meal-planner-intro", "recipes-intro"])

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS dismissed_hints TEXT[] DEFAULT '{}';

COMMENT ON COLUMN user_settings.dismissed_hints IS
  'Array of hint IDs that user has dismissed (e.g., ["meal-planner-intro", "recipes-intro"])';
