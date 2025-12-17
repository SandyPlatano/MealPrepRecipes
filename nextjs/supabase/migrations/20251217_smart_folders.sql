-- Smart Folders Feature
-- Allows users to create smart folders with saved filter criteria
-- that automatically populate with matching recipes

-- ============================================
-- ADD SMART FOLDER COLUMNS TO RECIPE_FOLDERS
-- ============================================

ALTER TABLE recipe_folders
ADD COLUMN IF NOT EXISTS is_smart BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS smart_filters JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN recipe_folders.is_smart IS 'True if this folder is a smart folder with auto-populated recipes based on filters';
COMMENT ON COLUMN recipe_folders.smart_filters IS 'JSONB filter criteria for smart folders: {conditions: [{field, operator, value}]}';

-- Index for smart folder queries
CREATE INDEX IF NOT EXISTS idx_recipe_folders_is_smart ON recipe_folders(household_id, is_smart) WHERE is_smart = TRUE;

-- ============================================
-- SYSTEM SMART FOLDERS TABLE
-- Built-in read-only smart folders
-- ============================================

CREATE TABLE IF NOT EXISTS system_smart_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  smart_filters JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE system_smart_folders IS 'Built-in system smart folders that all users can access (read-only)';

-- ============================================
-- INSERT BUILT-IN SYSTEM SMART FOLDERS
-- ============================================

INSERT INTO system_smart_folders (id, name, emoji, color, description, smart_filters, sort_order) VALUES
(
  'quick_meals',
  'Quick Meals',
  '???',
  '#4ECDC4',
  'Recipes ready in under 30 minutes',
  '{"conditions":[{"field":"total_time","operator":"lt","value":30}]}',
  1
),
(
  'highly_rated',
  'Highly Rated',
  '???',
  '#FFE66D',
  '4+ star recipes',
  '{"conditions":[{"field":"rating","operator":"gte","value":4}]}',
  2
),
(
  'recently_added',
  'Recently Added',
  '????',
  '#6366F1',
  'Added in the last 30 days',
  '{"conditions":[{"field":"created_at","operator":"within_days","value":30}]}',
  3
),
(
  'never_cooked',
  'Never Cooked',
  '????',
  '#FF6B6B',
  'Recipes you haven''t tried yet',
  '{"conditions":[{"field":"cook_count","operator":"eq","value":0}]}',
  4
),
(
  'frequently_cooked',
  'Frequently Cooked',
  '????',
  '#F97316',
  'Your most cooked recipes',
  '{"conditions":[{"field":"cook_count","operator":"gte","value":3}]}',
  5
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  smart_filters = EXCLUDED.smart_filters,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- ROW LEVEL SECURITY FOR SYSTEM SMART FOLDERS
-- ============================================

ALTER TABLE system_smart_folders ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view system smart folders (read-only)
DROP POLICY IF EXISTS "Anyone can view system smart folders" ON system_smart_folders;
CREATE POLICY "Anyone can view system smart folders"
  ON system_smart_folders FOR SELECT
  TO authenticated
  USING (true);

-- No insert/update/delete policies - system smart folders are read-only
