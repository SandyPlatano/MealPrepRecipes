-- ============================================================================
-- CUSTOM INGREDIENT CATEGORIES
-- Allows users to customize shopping list categories
-- (e.g., "Asian Grocery", "Costco Run", "Farmer's Market")
-- ============================================================================

-- User-defined ingredient categories for shopping lists
CREATE TABLE IF NOT EXISTS custom_ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT DEFAULT '🛒',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  parent_category_id UUID REFERENCES custom_ingredient_categories(id) ON DELETE SET NULL, -- for nesting
  default_store_id UUID, -- FK added after grocery_stores table exists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_ingredient_categories_household ON custom_ingredient_categories(household_id);
CREATE INDEX IF NOT EXISTS idx_custom_ingredient_categories_sort ON custom_ingredient_categories(household_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_custom_ingredient_categories_parent ON custom_ingredient_categories(parent_category_id);

-- Enable RLS
ALTER TABLE custom_ingredient_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view ingredient categories for their household"
  ON custom_ingredient_categories FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredient categories for their household"
  ON custom_ingredient_categories FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredient categories for their household"
  ON custom_ingredient_categories FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete non-system ingredient categories"
  ON custom_ingredient_categories FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND is_system = false
  );

-- Function to seed default ingredient categories
CREATE OR REPLACE FUNCTION seed_default_ingredient_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
  VALUES
    (NEW.id, 'Produce', 'produce', '🥬', 0, true),
    (NEW.id, 'Meat & Seafood', 'meat-seafood', '🥩', 1, true),
    (NEW.id, 'Dairy & Eggs', 'dairy-eggs', '🥛', 2, true),
    (NEW.id, 'Bakery', 'bakery', '🍞', 3, true),
    (NEW.id, 'Pantry', 'pantry', '🥫', 4, true),
    (NEW.id, 'Frozen', 'frozen', '🧊', 5, true),
    (NEW.id, 'Beverages', 'beverages', '🥤', 6, true),
    (NEW.id, 'Snacks', 'snacks', '🍿', 7, true),
    (NEW.id, 'Condiments', 'condiments', '🧴', 8, true),
    (NEW.id, 'Spices', 'spices', '🧂', 9, true),
    (NEW.id, 'Other', 'other', '📦', 10, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-seed for new households
DROP TRIGGER IF EXISTS on_household_created_seed_ingredient_categories ON households;
CREATE TRIGGER on_household_created_seed_ingredient_categories
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION seed_default_ingredient_categories();

-- Seed existing households (only if they don't have categories yet)
INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Produce', 'produce', '🥬', 0, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'produce');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Meat & Seafood', 'meat-seafood', '🥩', 1, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'meat-seafood');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Dairy & Eggs', 'dairy-eggs', '🥛', 2, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'dairy-eggs');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Bakery', 'bakery', '🍞', 3, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'bakery');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Pantry', 'pantry', '🥫', 4, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'pantry');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Frozen', 'frozen', '🧊', 5, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'frozen');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Beverages', 'beverages', '🥤', 6, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'beverages');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Snacks', 'snacks', '🍿', 7, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'snacks');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Condiments', 'condiments', '🧴', 8, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'condiments');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Spices', 'spices', '🧂', 9, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'spices');

INSERT INTO custom_ingredient_categories (household_id, name, slug, emoji, sort_order, is_system)
SELECT h.id, 'Other', 'other', '📦', 10, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_ingredient_categories cic WHERE cic.household_id = h.id AND cic.slug = 'other');

-- Add category_id to shopping_list_items (keeping existing category for backward compatibility)
ALTER TABLE shopping_list_items
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES custom_ingredient_categories(id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_category_id ON shopping_list_items(category_id);

-- Function to get category id from name
CREATE OR REPLACE FUNCTION get_ingredient_category_id(p_household_id UUID, p_name TEXT)
RETURNS UUID AS $$
  SELECT id FROM custom_ingredient_categories
  WHERE household_id = p_household_id
    AND (LOWER(name) = LOWER(p_name) OR LOWER(slug) = LOWER(REPLACE(p_name, ' ', '-')))
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_custom_ingredient_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_ingredient_categories_updated_at ON custom_ingredient_categories;
CREATE TRIGGER custom_ingredient_categories_updated_at
  BEFORE UPDATE ON custom_ingredient_categories
  FOR EACH ROW EXECUTE FUNCTION update_custom_ingredient_categories_updated_at();
