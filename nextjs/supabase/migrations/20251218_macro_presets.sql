-- =====================================================
-- Migration: Add macro_presets table
-- Purpose: Store user-customizable macro presets for quick nutrition logging
-- Features: One-tap adding, pinning, hiding system presets, custom presets
-- =====================================================

-- Create the macro_presets table
CREATE TABLE IF NOT EXISTS macro_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preset content
  name TEXT NOT NULL,
  emoji TEXT DEFAULT NULL,

  -- Nutrition values (same as nutrition_quick_adds)
  calories INTEGER,
  protein_g NUMERIC(6,1),
  carbs_g NUMERIC(6,1),
  fat_g NUMERIC(6,1),

  -- Preset behavior
  is_system BOOLEAN DEFAULT FALSE,  -- System presets are read-only templates
  is_pinned BOOLEAN DEFAULT FALSE,  -- Pinned presets appear first
  is_hidden BOOLEAN DEFAULT FALSE,  -- Hidden presets don't appear in quick add sheet

  -- Ordering
  sort_order INTEGER DEFAULT 0,
  pin_order INTEGER DEFAULT 0,      -- Order among pinned presets

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT macro_presets_at_least_one_value CHECK (
    calories IS NOT NULL OR
    protein_g IS NOT NULL OR
    carbs_g IS NOT NULL OR
    fat_g IS NOT NULL
  ),
  CONSTRAINT macro_presets_name_length CHECK (
    char_length(name) >= 1 AND char_length(name) <= 50
  ),
  CONSTRAINT macro_presets_unique_name_per_user UNIQUE (user_id, name)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_macro_presets_user_id
  ON macro_presets(user_id);

CREATE INDEX IF NOT EXISTS idx_macro_presets_user_pinned
  ON macro_presets(user_id, is_pinned DESC, pin_order ASC);

CREATE INDEX IF NOT EXISTS idx_macro_presets_user_hidden
  ON macro_presets(user_id, is_hidden);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_macro_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_macro_presets_updated_at ON macro_presets;
CREATE TRIGGER update_macro_presets_updated_at
  BEFORE UPDATE ON macro_presets
  FOR EACH ROW EXECUTE FUNCTION update_macro_presets_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE macro_presets ENABLE ROW LEVEL SECURITY;

-- Users can view their own presets
CREATE POLICY "Users can view their own macro presets"
  ON macro_presets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own presets (but not system presets)
CREATE POLICY "Users can insert their own macro presets"
  ON macro_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can update their own presets
-- For system presets, only is_hidden and is_pinned can be changed
CREATE POLICY "Users can update their own macro presets"
  ON macro_presets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own non-system presets
CREATE POLICY "Users can delete their own macro presets"
  ON macro_presets FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- =====================================================
-- SEED DEFAULT PRESETS FUNCTION
-- =====================================================

-- Function to seed default system presets for a user
CREATE OR REPLACE FUNCTION seed_default_macro_presets(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO macro_presets (user_id, name, emoji, calories, protein_g, carbs_g, fat_g, is_system, sort_order)
  VALUES
    (p_user_id, 'Snack', '🍪', 150, 3, 20, 7, TRUE, 1),
    (p_user_id, 'Protein Shake', '🥤', 200, 25, 10, 3, TRUE, 2),
    (p_user_id, 'Coffee', '☕', 50, 1, 5, 2, TRUE, 3)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION seed_default_macro_presets TO authenticated;

-- =====================================================
-- AUTO-SEED ON FIRST QUICK ADD (trigger)
-- =====================================================

-- Auto-seed presets when user first uses quick add
CREATE OR REPLACE FUNCTION auto_seed_macro_presets_on_quick_add()
RETURNS TRIGGER AS $$
BEGIN
  -- Only seed if user has no presets yet
  IF NOT EXISTS (SELECT 1 FROM macro_presets WHERE user_id = NEW.user_id) THEN
    PERFORM seed_default_macro_presets(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_seed_presets_on_quick_add ON nutrition_quick_adds;
CREATE TRIGGER auto_seed_presets_on_quick_add
  AFTER INSERT ON nutrition_quick_adds
  FOR EACH ROW EXECUTE FUNCTION auto_seed_macro_presets_on_quick_add();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE macro_presets IS 'User-created and system macro presets for quick nutrition logging';
COMMENT ON COLUMN macro_presets.is_system IS 'System presets are seeded defaults; users can hide but not delete them';
COMMENT ON COLUMN macro_presets.is_pinned IS 'Pinned presets appear at the top of the quick add list';
COMMENT ON COLUMN macro_presets.is_hidden IS 'Hidden presets are not shown in the quick add sheet (but visible in preset management)';
COMMENT ON COLUMN macro_presets.pin_order IS 'Order among pinned presets (lower values appear first)';
COMMENT ON COLUMN macro_presets.sort_order IS 'Default sort order for non-pinned presets';
