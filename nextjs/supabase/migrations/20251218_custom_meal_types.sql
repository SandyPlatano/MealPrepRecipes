-- ============================================================================
-- CUSTOM MEAL TYPES
-- Allows users to create, modify, and delete their own meal types
-- (e.g., "Second Breakfast", "Pre-Workout", "Date Night")
-- ============================================================================

-- User-defined meal types (replaces hardcoded enum)
CREATE TABLE IF NOT EXISTS custom_meal_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- lowercase, for code references
  emoji TEXT DEFAULT '🍽️',
  color TEXT DEFAULT '#6366f1',
  default_time TIME DEFAULT '12:00',
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false, -- true for default types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_meal_types_household ON custom_meal_types(household_id);
CREATE INDEX IF NOT EXISTS idx_custom_meal_types_sort ON custom_meal_types(household_id, sort_order);

-- Enable RLS
ALTER TABLE custom_meal_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view meal types for their household"
  ON custom_meal_types FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal types for their household"
  ON custom_meal_types FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meal types for their household"
  ON custom_meal_types FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete non-system meal types for their household"
  ON custom_meal_types FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND is_system = false
  );

-- Function to seed default meal types for new households
CREATE OR REPLACE FUNCTION seed_default_meal_types()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO custom_meal_types (household_id, name, slug, emoji, color, default_time, sort_order, is_system)
  VALUES
    (NEW.id, 'Breakfast', 'breakfast', '🍳', '#f59e0b', '08:00', 0, true),
    (NEW.id, 'Lunch', 'lunch', '🥗', '#10b981', '12:00', 1, true),
    (NEW.id, 'Dinner', 'dinner', '🍽️', '#6366f1', '18:00', 2, true),
    (NEW.id, 'Snack', 'snack', '🍎', '#ec4899', '15:00', 3, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-seed meal types for new households
DROP TRIGGER IF EXISTS on_household_created_seed_meal_types ON households;
CREATE TRIGGER on_household_created_seed_meal_types
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION seed_default_meal_types();

-- Seed existing households that don't have meal types yet
INSERT INTO custom_meal_types (household_id, name, slug, emoji, color, default_time, sort_order, is_system)
SELECT h.id, 'Breakfast', 'breakfast', '🍳', '#f59e0b', '08:00', 0, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_meal_types cmt WHERE cmt.household_id = h.id AND cmt.slug = 'breakfast');

INSERT INTO custom_meal_types (household_id, name, slug, emoji, color, default_time, sort_order, is_system)
SELECT h.id, 'Lunch', 'lunch', '🥗', '#10b981', '12:00', 1, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_meal_types cmt WHERE cmt.household_id = h.id AND cmt.slug = 'lunch');

INSERT INTO custom_meal_types (household_id, name, slug, emoji, color, default_time, sort_order, is_system)
SELECT h.id, 'Dinner', 'dinner', '🍽️', '#6366f1', '18:00', 2, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_meal_types cmt WHERE cmt.household_id = h.id AND cmt.slug = 'dinner');

INSERT INTO custom_meal_types (household_id, name, slug, emoji, color, default_time, sort_order, is_system)
SELECT h.id, 'Snack', 'snack', '🍎', '#ec4899', '15:00', 3, true
FROM households h
WHERE NOT EXISTS (SELECT 1 FROM custom_meal_types cmt WHERE cmt.household_id = h.id AND cmt.slug = 'snack');

-- Add meal_type_id column to meal_assignments for future migration
-- (keeping existing meal_type column for backward compatibility during transition)
ALTER TABLE meal_assignments
  ADD COLUMN IF NOT EXISTS meal_type_id UUID REFERENCES custom_meal_types(id);

-- Create index on the new column
CREATE INDEX IF NOT EXISTS idx_meal_assignments_meal_type_id ON meal_assignments(meal_type_id);

-- Function to get meal type id from slug (for backward compatibility)
CREATE OR REPLACE FUNCTION get_meal_type_id(p_household_id UUID, p_slug TEXT)
RETURNS UUID AS $$
  SELECT id FROM custom_meal_types
  WHERE household_id = p_household_id AND slug = p_slug
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_custom_meal_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_meal_types_updated_at ON custom_meal_types;
CREATE TRIGGER custom_meal_types_updated_at
  BEFORE UPDATE ON custom_meal_types
  FOR EACH ROW EXECUTE FUNCTION update_custom_meal_types_updated_at();
