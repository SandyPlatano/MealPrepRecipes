-- Add category_order column to user_settings for custom shopping route
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS category_order JSONB DEFAULT NULL;

-- Comment explaining the field
COMMENT ON COLUMN user_settings.category_order IS 'Custom order for shopping list categories (JSON array of category names)';

