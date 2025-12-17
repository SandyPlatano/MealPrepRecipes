-- ============================================================================
-- RECIPE LIFECYCLE & MOODS
-- Allows users to track recipe journey stages and tag recipes with moods/occasions
-- ============================================================================

-- Recipe lifecycle stages table
CREATE TABLE IF NOT EXISTS recipe_lifecycle_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT DEFAULT '📝',
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false, -- which stage new recipes get
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Recipe moods/occasions table
CREATE TABLE IF NOT EXISTS recipe_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT DEFAULT '✨',
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Many-to-many: recipes <-> moods
CREATE TABLE IF NOT EXISTS recipe_mood_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES recipe_moods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, mood_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lifecycle_stages_household ON recipe_lifecycle_stages(household_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_stages_sort ON recipe_lifecycle_stages(household_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_recipe_moods_household ON recipe_moods(household_id);
CREATE INDEX IF NOT EXISTS idx_recipe_moods_sort ON recipe_moods(household_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_mood_assignments_recipe ON recipe_mood_assignments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_mood_assignments_mood ON recipe_mood_assignments(mood_id);

-- Enable RLS
ALTER TABLE recipe_lifecycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_mood_assignments ENABLE ROW LEVEL SECURITY;

-- RLS for lifecycle stages
CREATE POLICY "Users can view lifecycle stages for their household"
  ON recipe_lifecycle_stages FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert lifecycle stages for their household"
  ON recipe_lifecycle_stages FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update lifecycle stages for their household"
  ON recipe_lifecycle_stages FOR UPDATE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete non-system lifecycle stages"
  ON recipe_lifecycle_stages FOR DELETE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND is_system = false
  );

-- RLS for moods
CREATE POLICY "Users can view moods for their household"
  ON recipe_moods FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert moods for their household"
  ON recipe_moods FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update moods for their household"
  ON recipe_moods FOR UPDATE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete non-system moods"
  ON recipe_moods FOR DELETE
  USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    AND is_system = false
  );

-- RLS for mood assignments
CREATE POLICY "Users can view mood assignments for their recipes"
  ON recipe_mood_assignments FOR SELECT
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert mood assignments for their recipes"
  ON recipe_mood_assignments FOR INSERT
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete mood assignments for their recipes"
  ON recipe_mood_assignments FOR DELETE
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

-- Function to seed default lifecycle stages
CREATE OR REPLACE FUNCTION seed_default_lifecycle_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
  VALUES
    (NEW.id, 'Want to Try', 'want-to-try', '🤔', '#f59e0b', 0, true, true),
    (NEW.id, 'Tested - Needs Work', 'needs-work', '🔧', '#ef4444', 1, true, false),
    (NEW.id, 'Approved', 'approved', '✅', '#10b981', 2, true, false),
    (NEW.id, 'Family Favorite', 'favorite', '⭐', '#6366f1', 3, true, false),
    (NEW.id, 'Retired', 'retired', '📦', '#6b7280', 4, true, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new households
DROP TRIGGER IF EXISTS on_household_created_seed_lifecycle_stages ON households;
CREATE TRIGGER on_household_created_seed_lifecycle_stages
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION seed_default_lifecycle_stages();

-- Function to seed default moods
CREATE OR REPLACE FUNCTION seed_default_moods()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recipe_moods (household_id, name, slug, emoji, color, sort_order, is_system)
  VALUES
    (NEW.id, 'Comfort Food', 'comfort-food', '🛋️', '#f59e0b', 0, true),
    (NEW.id, 'Date Night', 'date-night', '💕', '#ec4899', 1, true),
    (NEW.id, 'Weeknight Quick', 'weeknight-quick', '⚡', '#10b981', 2, true),
    (NEW.id, 'Sunday Project', 'sunday-project', '👨‍🍳', '#6366f1', 3, true),
    (NEW.id, 'Entertaining', 'entertaining', '🎉', '#8b5cf6', 4, true),
    (NEW.id, 'Meal Prep Friendly', 'meal-prep', '📦', '#14b8a6', 5, true),
    (NEW.id, 'Kid Approved', 'kid-approved', '👶', '#f97316', 6, true),
    (NEW.id, 'Healthy', 'healthy', '🥗', '#22c55e', 7, true),
    (NEW.id, 'Indulgent', 'indulgent', '🍫', '#a855f7', 8, true),
    (NEW.id, 'Budget Friendly', 'budget', '💰', '#eab308', 9, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new households
DROP TRIGGER IF EXISTS on_household_created_seed_moods ON households;
CREATE TRIGGER on_household_created_seed_moods
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION seed_default_moods();

-- Seed existing households with lifecycle stages if they don't have any
INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
SELECT h.id, 'Want to Try', 'want-to-try', '🤔', '#f59e0b', 0, true, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_lifecycle_stages rls WHERE rls.household_id = h.id);

INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
SELECT h.id, 'Tested - Needs Work', 'needs-work', '🔧', '#ef4444', 1, true, false
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_lifecycle_stages rls WHERE rls.household_id = h.id AND rls.slug = 'needs-work');

INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
SELECT h.id, 'Approved', 'approved', '✅', '#10b981', 2, true, false
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_lifecycle_stages rls WHERE rls.household_id = h.id AND rls.slug = 'approved');

INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
SELECT h.id, 'Family Favorite', 'favorite', '⭐', '#6366f1', 3, true, false
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_lifecycle_stages rls WHERE rls.household_id = h.id AND rls.slug = 'favorite');

INSERT INTO recipe_lifecycle_stages (household_id, name, slug, emoji, color, sort_order, is_system, is_default)
SELECT h.id, 'Retired', 'retired', '📦', '#6b7280', 4, true, false
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_lifecycle_stages rls WHERE rls.household_id = h.id AND rls.slug = 'retired');

-- Seed existing households with moods
INSERT INTO recipe_moods (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Comfort Food', 'comfort-food', '🛋️', '#f59e0b', 0, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM recipe_moods rm WHERE rm.household_id = h.id);

-- Add lifecycle_stage_id to recipes table
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS lifecycle_stage_id UUID REFERENCES recipe_lifecycle_stages(id);

CREATE INDEX IF NOT EXISTS idx_recipes_lifecycle_stage ON recipes(lifecycle_stage_id);

-- Function to get moods for a recipe
CREATE OR REPLACE FUNCTION get_recipe_moods(p_recipe_id UUID)
RETURNS TABLE (
  mood_id UUID,
  mood_name TEXT,
  mood_slug TEXT,
  mood_emoji TEXT,
  mood_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT rm.id, rm.name, rm.slug, rm.emoji, rm.color
  FROM recipe_moods rm
  JOIN recipe_mood_assignments rma ON rm.id = rma.mood_id
  WHERE rma.recipe_id = p_recipe_id
  ORDER BY rm.sort_order;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to set moods for a recipe (replaces all)
CREATE OR REPLACE FUNCTION set_recipe_moods(p_recipe_id UUID, p_mood_ids UUID[])
RETURNS void AS $$
BEGIN
  -- Delete existing assignments
  DELETE FROM recipe_mood_assignments WHERE recipe_id = p_recipe_id;

  -- Insert new assignments
  INSERT INTO recipe_mood_assignments (recipe_id, mood_id)
  SELECT p_recipe_id, unnest(p_mood_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_lifecycle_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lifecycle_stages_updated_at ON recipe_lifecycle_stages;
CREATE TRIGGER lifecycle_stages_updated_at
  BEFORE UPDATE ON recipe_lifecycle_stages
  FOR EACH ROW EXECUTE FUNCTION update_lifecycle_stages_updated_at();

CREATE OR REPLACE FUNCTION update_recipe_moods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recipe_moods_updated_at ON recipe_moods;
CREATE TRIGGER recipe_moods_updated_at
  BEFORE UPDATE ON recipe_moods
  FOR EACH ROW EXECUTE FUNCTION update_recipe_moods_updated_at();

-- Ensure only one default lifecycle stage per household
CREATE OR REPLACE FUNCTION ensure_single_default_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE recipe_lifecycle_stages
    SET is_default = false
    WHERE household_id = NEW.household_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_default_stage_trigger ON recipe_lifecycle_stages;
CREATE TRIGGER ensure_single_default_stage_trigger
  BEFORE INSERT OR UPDATE ON recipe_lifecycle_stages
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_stage();
