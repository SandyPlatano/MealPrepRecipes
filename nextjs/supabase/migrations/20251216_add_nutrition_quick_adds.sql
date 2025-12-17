-- =====================================================
-- Migration: Add nutrition_quick_adds table
-- Purpose: Store quick macro entries without requiring a recipe
-- =====================================================

-- Create the nutrition_quick_adds table
CREATE TABLE IF NOT EXISTS nutrition_quick_adds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Nutrition data (all optional, at least one should be non-null)
  calories INTEGER,
  protein_g NUMERIC(6,1),
  carbs_g NUMERIC(6,1),
  fat_g NUMERIC(6,1),

  -- Metadata
  note TEXT,
  preset TEXT, -- e.g., 'snack', 'shake', 'coffee', or null for custom

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_macro CHECK (
    calories IS NOT NULL OR
    protein_g IS NOT NULL OR
    carbs_g IS NOT NULL OR
    fat_g IS NOT NULL
  )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_nutrition_quick_adds_user_date
  ON nutrition_quick_adds(user_id, date);

CREATE INDEX IF NOT EXISTS idx_nutrition_quick_adds_date
  ON nutrition_quick_adds(date);

-- Enable RLS
ALTER TABLE nutrition_quick_adds ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own quick adds
CREATE POLICY "Users can view their own quick adds"
  ON nutrition_quick_adds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick adds"
  ON nutrition_quick_adds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick adds"
  ON nutrition_quick_adds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick adds"
  ON nutrition_quick_adds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE nutrition_quick_adds IS 'Quick macro entries without requiring a full recipe - for snacks, supplements, etc.';
COMMENT ON COLUMN nutrition_quick_adds.preset IS 'Preset identifier if used (snack, shake, coffee) or null for custom entries';
