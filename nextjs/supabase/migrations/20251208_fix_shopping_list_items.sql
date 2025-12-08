-- Fix shopping_list_items schema to match TypeScript types
-- Addresses column name and structure mismatches

-- 1. Rename 'checked' column to 'is_checked'
ALTER TABLE shopping_list_items RENAME COLUMN checked TO is_checked;

-- 2. Add 'unit' column for ingredient units (e.g., "cups", "tbsp", "oz")
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS unit TEXT;

-- 3. Add 'recipe_id' column (nullable, references a single recipe)
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

-- 4. Add 'recipe_title' column for display purposes (denormalized for convenience)
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS recipe_title TEXT;

-- 5. Migrate data from recipe_ids array to recipe_id (take first element if exists)
UPDATE shopping_list_items 
SET recipe_id = recipe_ids[1]
WHERE recipe_ids IS NOT NULL AND array_length(recipe_ids, 1) > 0;

-- 6. Drop the old recipe_ids array column
ALTER TABLE shopping_list_items DROP COLUMN IF EXISTS recipe_ids;

-- 7. Create index on recipe_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_recipe_id ON shopping_list_items(recipe_id);

