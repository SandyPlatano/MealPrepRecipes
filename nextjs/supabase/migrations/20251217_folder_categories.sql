-- Folder Categories Feature
-- Allows users to create custom sections/categories to organize their folders
-- e.g., "Smart Folders", "My Folders", "Seasonal", "Cooking Style", etc.

-- ============================================
-- FOLDER CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS folder_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Category metadata
  name TEXT NOT NULL,
  emoji TEXT DEFAULT NULL,

  -- Is this a system category (like "Smart Folders") that can't be deleted?
  is_system BOOLEAN DEFAULT FALSE,

  -- Ordering in the sidebar
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD CATEGORY REFERENCE TO FOLDERS
-- ============================================

ALTER TABLE recipe_folders
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES folder_categories(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_folder_categories_household_id ON folder_categories(household_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folders_category_id ON recipe_folders(category_id);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_folder_categories_updated_at ON folder_categories;
CREATE TRIGGER update_folder_categories_updated_at
  BEFORE UPDATE ON folder_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE folder_categories ENABLE ROW LEVEL SECURITY;

-- Household members can view categories
DROP POLICY IF EXISTS "Household members can view folder categories" ON folder_categories;
CREATE POLICY "Household members can view folder categories"
  ON folder_categories FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create categories
DROP POLICY IF EXISTS "Household members can create folder categories" ON folder_categories;
CREATE POLICY "Household members can create folder categories"
  ON folder_categories FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND created_by_user_id = auth.uid()
  );

-- Household members can update non-system categories
DROP POLICY IF EXISTS "Household members can update folder categories" ON folder_categories;
CREATE POLICY "Household members can update folder categories"
  ON folder_categories FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete non-system categories
DROP POLICY IF EXISTS "Household members can delete folder categories" ON folder_categories;
CREATE POLICY "Household members can delete folder categories"
  ON folder_categories FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND is_system = FALSE
  );

-- ============================================
-- CREATE DEFAULT CATEGORIES FOR EXISTING HOUSEHOLDS
-- ============================================

-- Helper function to create default categories
CREATE OR REPLACE FUNCTION create_default_folder_categories_for_household(p_household_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_my_folders_id UUID;
BEGIN
  -- Create "My Folders" category (this is the default category for user folders)
  INSERT INTO folder_categories (household_id, created_by_user_id, name, emoji, is_system, sort_order)
  VALUES (p_household_id, p_user_id, 'My Folders', '📂', FALSE, 1)
  RETURNING id INTO v_my_folders_id;

  -- Update existing folders to use the new category
  UPDATE recipe_folders
  SET category_id = v_my_folders_id
  WHERE household_id = p_household_id AND category_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_default_folder_categories_for_household TO authenticated;

-- Run for all existing households that don't have categories yet
DO $$
DECLARE
  h RECORD;
BEGIN
  FOR h IN
    SELECT DISTINCT households.id, households.owner_id
    FROM households
    WHERE households.id NOT IN (SELECT DISTINCT household_id FROM folder_categories)
  LOOP
    PERFORM create_default_folder_categories_for_household(h.id, h.owner_id);
  END LOOP;
END $$;
