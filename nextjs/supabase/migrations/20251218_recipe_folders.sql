-- Recipe Folders Feature
-- Allows users to organize recipes into folders and subfolders (max 2 levels)
-- Folders are shared with household members

-- ============================================
-- FOLDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Folder metadata
  name TEXT NOT NULL,
  emoji TEXT DEFAULT NULL,
  color TEXT DEFAULT NULL,

  -- Hierarchy (max 2 levels: parent -> child)
  parent_folder_id UUID REFERENCES recipe_folders(id) ON DELETE CASCADE,

  -- Cover image (uses a recipe's image_url)
  cover_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,

  -- Ordering within parent (null parent = root level)
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RECIPE-FOLDER JUNCTION TABLE (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_folder_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES recipe_folders(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  UNIQUE(folder_id, recipe_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipe_folders_household_id ON recipe_folders(household_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folders_parent_id ON recipe_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folders_created_by ON recipe_folders(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folder_members_folder_id ON recipe_folder_members(folder_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folder_members_recipe_id ON recipe_folder_members(recipe_id);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_recipe_folders_updated_at ON recipe_folders;
CREATE TRIGGER update_recipe_folders_updated_at
  BEFORE UPDATE ON recipe_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE recipe_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_folder_members ENABLE ROW LEVEL SECURITY;

-- Household members can view folders
DROP POLICY IF EXISTS "Household members can view folders" ON recipe_folders;
CREATE POLICY "Household members can view folders"
  ON recipe_folders FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create folders
DROP POLICY IF EXISTS "Household members can create folders" ON recipe_folders;
CREATE POLICY "Household members can create folders"
  ON recipe_folders FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND created_by_user_id = auth.uid()
  );

-- Household members can update folders
DROP POLICY IF EXISTS "Household members can update folders" ON recipe_folders;
CREATE POLICY "Household members can update folders"
  ON recipe_folders FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete folders
DROP POLICY IF EXISTS "Household members can delete folders" ON recipe_folders;
CREATE POLICY "Household members can delete folders"
  ON recipe_folders FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Recipe folder members policies (follows folder access)
DROP POLICY IF EXISTS "Household members can view folder memberships" ON recipe_folder_members;
CREATE POLICY "Household members can view folder memberships"
  ON recipe_folder_members FOR SELECT
  USING (
    folder_id IN (
      SELECT id FROM recipe_folders WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Household members can add recipes to folders" ON recipe_folder_members;
CREATE POLICY "Household members can add recipes to folders"
  ON recipe_folder_members FOR INSERT
  WITH CHECK (
    folder_id IN (
      SELECT id FROM recipe_folders WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Household members can remove recipes from folders" ON recipe_folder_members;
CREATE POLICY "Household members can remove recipes from folders"
  ON recipe_folder_members FOR DELETE
  USING (
    folder_id IN (
      SELECT id FROM recipe_folders WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- HELPER FUNCTION: Create default folders
-- ============================================

CREATE OR REPLACE FUNCTION create_default_folders_for_household(p_household_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Create "Weeknight Dinners" folder
  INSERT INTO recipe_folders (household_id, created_by_user_id, name, emoji, color, sort_order)
  VALUES (p_household_id, p_user_id, 'Weeknight Dinners', '🍽️', '#FF6B6B', 1);

  -- Create "Meal Prep" folder
  INSERT INTO recipe_folders (household_id, created_by_user_id, name, emoji, color, sort_order)
  VALUES (p_household_id, p_user_id, 'Meal Prep', '📦', '#4ECDC4', 2);

  -- Create "Family Favorites" folder
  INSERT INTO recipe_folders (household_id, created_by_user_id, name, emoji, color, sort_order)
  VALUES (p_household_id, p_user_id, 'Family Favorites', '❤️', '#FFE66D', 3);

  -- Create "Quick & Easy" folder
  INSERT INTO recipe_folders (household_id, created_by_user_id, name, emoji, color, sort_order)
  VALUES (p_household_id, p_user_id, 'Quick & Easy', '⚡', '#95E1D3', 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_default_folders_for_household TO authenticated;

-- ============================================
-- CREATE DEFAULT FOLDERS FOR EXISTING HOUSEHOLDS
-- ============================================

DO $$
DECLARE
  h RECORD;
BEGIN
  FOR h IN
    SELECT DISTINCT households.id, households.owner_id
    FROM households
    WHERE households.id NOT IN (SELECT DISTINCT household_id FROM recipe_folders)
  LOOP
    PERFORM create_default_folders_for_household(h.id, h.owner_id);
  END LOOP;
END $$;
