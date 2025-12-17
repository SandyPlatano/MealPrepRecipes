-- ============================================================================
-- CUSTOM RECIPE TYPES/CATEGORIES
-- Allows users to create custom recipe categories beyond the defaults
-- (e.g., "Comfort Food", "Party Appetizers", "Sick Day Soups")
-- ============================================================================

-- User-defined recipe types (extends/replaces hardcoded enum)
CREATE TABLE IF NOT EXISTS custom_recipe_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT DEFAULT '📖',
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_recipe_types_household ON custom_recipe_types(household_id);
CREATE INDEX IF NOT EXISTS idx_custom_recipe_types_sort ON custom_recipe_types(household_id, sort_order);

-- Enable RLS
ALTER TABLE custom_recipe_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view recipe types for their household"
  ON custom_recipe_types FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recipe types for their household"
  ON custom_recipe_types FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recipe types for their household"
  ON custom_recipe_types FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete non-system recipe types for their household"
  ON custom_recipe_types FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND is_system = false
  );

-- Function to seed default recipe types
CREATE OR REPLACE FUNCTION seed_default_recipe_types()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
  VALUES
    (NEW.id, 'Dinner', 'dinner', '🍽️', '#6366f1', 0, true),
    (NEW.id, 'Breakfast', 'breakfast', '🍳', '#f59e0b', 1, true),
    (NEW.id, 'Baking', 'baking', '🥐', '#ec4899', 2, true),
    (NEW.id, 'Dessert', 'dessert', '🍰', '#8b5cf6', 3, true),
    (NEW.id, 'Snack', 'snack', '🍿', '#10b981', 4, true),
    (NEW.id, 'Side Dish', 'side-dish', '🥗', '#14b8a6', 5, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-seed recipe types for new households
DROP TRIGGER IF EXISTS on_household_created_seed_recipe_types ON households;
CREATE TRIGGER on_household_created_seed_recipe_types
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION seed_default_recipe_types();

-- Seed existing households
INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Dinner', 'dinner', '🍽️', '#6366f1', 0, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'dinner');

INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Breakfast', 'breakfast', '🍳', '#f59e0b', 1, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'breakfast');

INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Baking', 'baking', '🥐', '#ec4899', 2, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'baking');

INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Dessert', 'dessert', '🍰', '#8b5cf6', 3, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'dessert');

INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Snack', 'snack', '🍿', '#10b981', 4, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'snack');

INSERT INTO custom_recipe_types (household_id, name, slug, emoji, color, sort_order, is_system)
SELECT h.id, 'Side Dish', 'side-dish', '🥗', '#14b8a6', 5, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_recipe_types crt WHERE crt.household_id = h.id AND crt.slug = 'side-dish');

-- Add recipe_type_id column to recipes (keeping existing recipe_type for backward compatibility)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS recipe_type_id UUID REFERENCES custom_recipe_types(id);

CREATE INDEX IF NOT EXISTS idx_recipes_recipe_type_id ON recipes(recipe_type_id);

-- Function to get recipe type id from name (for backward compatibility)
CREATE OR REPLACE FUNCTION get_recipe_type_id(p_household_id UUID, p_name TEXT)
RETURNS UUID AS $$
  SELECT id FROM custom_recipe_types
  WHERE household_id = p_household_id
    AND (LOWER(name) = LOWER(p_name) OR LOWER(slug) = LOWER(REPLACE(p_name, ' ', '-')))
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_custom_recipe_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_recipe_types_updated_at ON custom_recipe_types;
CREATE TRIGGER custom_recipe_types_updated_at
  BEFORE UPDATE ON custom_recipe_types
  FOR EACH ROW EXECUTE FUNCTION update_custom_recipe_types_updated_at();
