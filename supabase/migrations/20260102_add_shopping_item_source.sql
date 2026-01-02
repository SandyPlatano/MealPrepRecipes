-- ============================================================================
-- Add source tracking to shopping_list_items
-- Tracks how items were added: meal_plan, quick_add, recipe_direct, or manual
-- ============================================================================

-- Add source column with default 'manual' for existing items
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
CHECK (source IN ('meal_plan', 'quick_add', 'recipe_direct', 'manual'));

-- Index for filtering by source (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_source
  ON shopping_list_items(source);

-- Add comment for documentation
COMMENT ON COLUMN shopping_list_items.source IS
  'Tracks how the item was added: meal_plan (from generation), quick_add (from quick cart input), recipe_direct (from recipe page), manual (from full shopping page)';
