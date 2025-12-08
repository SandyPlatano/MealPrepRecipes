-- Add custom dietary restrictions to user settings
-- Allows users to add their own custom dietary restrictions beyond standard FDA allergens

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS custom_dietary_restrictions TEXT[] DEFAULT '{}';

COMMENT ON COLUMN user_settings.custom_dietary_restrictions IS 'User-defined dietary restrictions beyond standard allergens (e.g., nightshades, MSG, sulfites)';

