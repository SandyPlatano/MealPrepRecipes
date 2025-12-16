-- Migration: Custom Nutrition Badges
-- Description: Allow users to create custom nutrition badges with custom criteria
-- This enables personalized badges like "Kid Friendly", "Post-Workout", etc.

-- =====================================================
-- CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_nutrition_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (household-level)
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Badge definition
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'coral' CHECK (color IN ('green', 'blue', 'purple', 'red', 'orange', 'coral')),

  -- Conditions stored as JSONB array
  -- Format: [{"nutrient": "protein_g", "operator": "gt", "value": 40}, ...]
  -- Operators: gt, lt, eq, gte, lte, between
  -- Nutrients: calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg
  conditions JSONB NOT NULL DEFAULT '[]',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT custom_badges_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  CONSTRAINT custom_badges_max_conditions CHECK (jsonb_array_length(conditions) <= 4),
  CONSTRAINT custom_badges_unique_name_per_household UNIQUE (household_id, name)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_custom_nutrition_badges_household_id ON custom_nutrition_badges(household_id);
CREATE INDEX idx_custom_nutrition_badges_active ON custom_nutrition_badges(household_id, is_active) WHERE is_active = true;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE custom_nutrition_badges ENABLE ROW LEVEL SECURITY;

-- Users can view badges from their household
CREATE POLICY "Users can view household badges"
  ON custom_nutrition_badges
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert badges for their household
CREATE POLICY "Users can create household badges"
  ON custom_nutrition_badges
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can update badges in their household
CREATE POLICY "Users can update household badges"
  ON custom_nutrition_badges
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can delete badges in their household
CREATE POLICY "Users can delete household badges"
  ON custom_nutrition_badges
  FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE TRIGGER update_custom_nutrition_badges_updated_at
  BEFORE UPDATE ON custom_nutrition_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE custom_nutrition_badges IS 'User-created nutrition badges with custom criteria';
COMMENT ON COLUMN custom_nutrition_badges.conditions IS 'JSONB array of conditions, e.g., [{"nutrient": "protein_g", "operator": "gt", "value": 40}]';
COMMENT ON COLUMN custom_nutrition_badges.color IS 'Badge color: green, blue, purple, red, orange, coral';
