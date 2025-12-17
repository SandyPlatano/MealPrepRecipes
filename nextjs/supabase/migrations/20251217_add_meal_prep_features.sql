-- ============================================================================
-- Feature 2: Meal Prep Specific Workflows
-- ============================================================================
-- This migration adds tables for batch cooking mode, prep sessions, and
-- container planning. These features support meal preppers who cook 4+
-- servings to portion out for the week.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add prep_data column to recipes table
-- ----------------------------------------------------------------------------
-- Stores meal prep metadata: reheating instructions, storage, container type,
-- freezer-friendliness, and prep notes.

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS prep_data jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN recipes.prep_data IS
'Meal prep metadata: {reheating_instructions, storage_instructions, container_type, freezer_friendly, shelf_life_days, prep_notes, batch_multiplier}';

-- ----------------------------------------------------------------------------
-- 2. Create prep_sessions table
-- ----------------------------------------------------------------------------
-- A prep session represents a batch cooking event (e.g., "Sunday Meal Prep")
-- where a user prepares multiple recipes at once.

CREATE TABLE IF NOT EXISTS prep_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session metadata
  name text NOT NULL DEFAULT 'Meal Prep Session',
  scheduled_date date NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),

  -- Timing
  estimated_total_time_minutes integer,
  actual_start_time timestamptz,
  actual_end_time timestamptz,

  -- Notes and metadata
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_prep_sessions_household_date
  ON prep_sessions(household_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_prep_sessions_user_status
  ON prep_sessions(user_id, status);

COMMENT ON TABLE prep_sessions IS
'Batch cooking sessions where users prepare multiple recipes at once';

-- ----------------------------------------------------------------------------
-- 3. Create prep_session_recipes junction table
-- ----------------------------------------------------------------------------
-- Links recipes to prep sessions with prep-specific overrides like
-- batch multiplier and container allocation.

CREATE TABLE IF NOT EXISTS prep_session_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prep_session_id uuid NOT NULL REFERENCES prep_sessions(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- Batch configuration
  batch_multiplier numeric DEFAULT 1 CHECK (batch_multiplier > 0),
  servings_to_prep integer NOT NULL DEFAULT 4 CHECK (servings_to_prep > 0),

  -- Prep order and timing
  prep_order integer DEFAULT 0,
  estimated_prep_minutes integer,
  estimated_cook_minutes integer,

  -- Container planning
  containers_needed integer DEFAULT 1 CHECK (containers_needed >= 0),
  container_type text, -- 'glass', 'plastic', 'mason_jar', etc.

  -- Status tracking
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'prepping', 'cooking', 'cooling', 'portioned', 'done')),
  completed_at timestamptz,

  -- Ingredient overlap tracking (computed)
  shared_ingredients jsonb DEFAULT '[]'::jsonb,

  -- Notes for this specific prep
  notes text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Prevent duplicate recipes in same session
  UNIQUE(prep_session_id, recipe_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prep_session_recipes_session
  ON prep_session_recipes(prep_session_id);
CREATE INDEX IF NOT EXISTS idx_prep_session_recipes_recipe
  ON prep_session_recipes(recipe_id);

COMMENT ON TABLE prep_session_recipes IS
'Recipes included in a prep session with batch configuration and status';

-- ----------------------------------------------------------------------------
-- 4. Create container_inventory table
-- ----------------------------------------------------------------------------
-- Track household container inventory for meal prep planning.

CREATE TABLE IF NOT EXISTS container_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- Container details
  name text NOT NULL,
  container_type text NOT NULL
    CHECK (container_type IN ('glass', 'plastic', 'silicone', 'mason_jar', 'stasher_bag', 'bento', 'other')),
  size_oz integer, -- Size in ounces
  size_ml integer, -- Size in milliliters
  size_label text, -- Human-readable: "Small", "Medium", "Large", "32oz"

  -- Inventory count
  total_count integer NOT NULL DEFAULT 1 CHECK (total_count >= 0),
  available_count integer NOT NULL DEFAULT 1 CHECK (available_count >= 0),

  -- Features
  is_microwave_safe boolean DEFAULT true,
  is_freezer_safe boolean DEFAULT true,
  is_dishwasher_safe boolean DEFAULT true,
  has_dividers boolean DEFAULT false,

  -- Visual
  color text,
  brand text,
  image_url text,

  -- Notes
  notes text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_container_inventory_household
  ON container_inventory(household_id);
CREATE INDEX IF NOT EXISTS idx_container_inventory_type
  ON container_inventory(household_id, container_type);

COMMENT ON TABLE container_inventory IS
'Household container inventory for meal prep planning';

-- ----------------------------------------------------------------------------
-- 5. Create week_variety_scores table (optional - for caching)
-- ----------------------------------------------------------------------------
-- Cache weekly variety analysis to avoid recomputation.

CREATE TABLE IF NOT EXISTS week_variety_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start date NOT NULL,

  -- Variety metrics
  protein_variety_score numeric CHECK (protein_variety_score >= 0 AND protein_variety_score <= 100),
  cuisine_variety_score numeric CHECK (cuisine_variety_score >= 0 AND cuisine_variety_score <= 100),
  category_variety_score numeric CHECK (category_variety_score >= 0 AND category_variety_score <= 100),
  overall_score numeric CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Detailed breakdown
  proteins_used text[] DEFAULT '{}',
  cuisines_used text[] DEFAULT '{}',
  categories_used text[] DEFAULT '{}',

  -- Suggestions
  suggestions jsonb DEFAULT '[]'::jsonb,

  -- Timestamps
  calculated_at timestamptz DEFAULT now(),

  UNIQUE(household_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_week_variety_scores_lookup
  ON week_variety_scores(household_id, week_start DESC);

COMMENT ON TABLE week_variety_scores IS
'Cached variety scores for weekly meal plans';

-- ----------------------------------------------------------------------------
-- 6. Row Level Security Policies
-- ----------------------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE prep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_session_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_variety_scores ENABLE ROW LEVEL SECURITY;

-- prep_sessions policies
CREATE POLICY "Users can view their household prep sessions"
  ON prep_sessions FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prep sessions in their household"
  ON prep_sessions FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their household prep sessions"
  ON prep_sessions FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their household prep sessions"
  ON prep_sessions FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- prep_session_recipes policies
CREATE POLICY "Users can view their household prep session recipes"
  ON prep_session_recipes FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prep session recipes in their household"
  ON prep_session_recipes FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their household prep session recipes"
  ON prep_session_recipes FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their household prep session recipes"
  ON prep_session_recipes FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- container_inventory policies
CREATE POLICY "Users can view their household container inventory"
  ON container_inventory FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create containers in their household"
  ON container_inventory FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their household containers"
  ON container_inventory FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their household containers"
  ON container_inventory FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- week_variety_scores policies
CREATE POLICY "Users can view their household variety scores"
  ON week_variety_scores FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their household variety scores"
  ON week_variety_scores FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. Triggers for updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers (skip if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_prep_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_prep_sessions_updated_at
      BEFORE UPDATE ON prep_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_prep_session_recipes_updated_at'
  ) THEN
    CREATE TRIGGER update_prep_session_recipes_updated_at
      BEFORE UPDATE ON prep_session_recipes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_container_inventory_updated_at'
  ) THEN
    CREATE TRIGGER update_container_inventory_updated_at
      BEFORE UPDATE ON container_inventory
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- Migration complete!
-- Tables created:
--   - prep_sessions: Batch cooking session planning
--   - prep_session_recipes: Recipes in each session with batch config
--   - container_inventory: Household container tracking
--   - week_variety_scores: Cached variety analysis
-- Columns added:
--   - recipes.prep_data: JSONB for meal prep metadata
-- ============================================================================
