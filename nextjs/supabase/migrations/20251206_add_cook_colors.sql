-- Add cook_colors column to user_settings
-- This stores a JSONB object mapping cook names to their color codes
-- Example: {"You": "#3b82f6", "Partner": "#a855f7"}

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS cook_colors JSONB DEFAULT '{}'::jsonb;

-- Add a comment explaining the structure
COMMENT ON COLUMN user_settings.cook_colors IS 'JSONB object mapping cook names to hex color codes, e.g. {"You": "#3b82f6", "Partner": "#a855f7"}';

