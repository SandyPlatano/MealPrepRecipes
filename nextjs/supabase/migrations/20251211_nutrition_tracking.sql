-- =====================================================
-- Migration: Advanced Nutrition Tracking & Macro Planning
-- Date: 2025-12-11
-- Description: Add nutrition tracking capabilities to recipes and user settings
-- =====================================================

-- =====================================================
-- 1. RECIPE NUTRITION TABLE
-- =====================================================
-- Stores nutritional data per recipe (per serving)
-- Supports AI-extracted, manual, and imported nutrition data

CREATE TABLE IF NOT EXISTS recipe_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE UNIQUE,

  -- Nutritional data (per serving, in decimal for precision)
  calories DECIMAL(7,2),          -- e.g., 450.50 kcal
  protein_g DECIMAL(6,2),          -- e.g., 30.25 grams
  carbs_g DECIMAL(6,2),            -- e.g., 40.00 grams
  fat_g DECIMAL(6,2),              -- e.g., 15.75 grams
  fiber_g DECIMAL(6,2),            -- e.g., 5.00 grams
  sugar_g DECIMAL(6,2),            -- e.g., 8.50 grams
  sodium_mg DECIMAL(7,2),          -- e.g., 600.00 milligrams

  -- Data source and confidence
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('ai_extracted', 'manual', 'imported', 'usda')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  -- Confidence scale: 0.00-0.29 (low), 0.30-0.69 (medium), 0.70-1.00 (high)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast recipe nutrition lookups
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe_id ON recipe_nutrition(recipe_id);

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_source ON recipe_nutrition(source);

-- =====================================================
-- 2. EXTEND USER_SETTINGS TABLE
-- =====================================================
-- Add macro goal tracking and preferences

-- Add macro goals (stored as JSONB for flexibility)
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS macro_goals JSONB DEFAULT '{
  "calories": 2000,
  "protein_g": 150,
  "carbs_g": 200,
  "fat_g": 65,
  "fiber_g": 25
}'::jsonb;

-- Add tracking toggle
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS macro_tracking_enabled BOOLEAN DEFAULT false;

-- Add macro goal preset (for quick setup)
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS macro_goal_preset TEXT
  CHECK (macro_goal_preset IN ('weight_loss', 'muscle_building', 'maintenance', 'custom'));

-- =====================================================
-- 3. DAILY NUTRITION LOGS TABLE
-- =====================================================
-- Stores aggregated daily nutrition totals for historical tracking
-- Updated automatically when meal plans change

CREATE TABLE IF NOT EXISTS daily_nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  date DATE NOT NULL,

  -- Aggregated daily totals (sum of all meals for the day)
  total_calories DECIMAL(7,2),
  total_protein_g DECIMAL(6,2),
  total_carbs_g DECIMAL(6,2),
  total_fat_g DECIMAL(6,2),
  total_fiber_g DECIMAL(6,2),
  total_sugar_g DECIMAL(6,2),
  total_sodium_mg DECIMAL(7,2),

  -- Metadata
  meal_count INTEGER DEFAULT 0, -- Number of meals planned for this day
  recipes_with_nutrition INTEGER DEFAULT 0, -- How many meals have nutrition data
  data_completeness_pct DECIMAL(5,2), -- Percentage of meals with nutrition data

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Index for user date lookups
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_logs_user_date
  ON daily_nutrition_logs(user_id, date DESC);

-- Index for household tracking
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_logs_household
  ON daily_nutrition_logs(household_id, date DESC);

-- =====================================================
-- 4. WEEKLY NUTRITION SUMMARY TABLE
-- =====================================================
-- Pre-aggregated weekly summaries for performance
-- Updated when daily logs change

CREATE TABLE IF NOT EXISTS weekly_nutrition_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  week_start DATE NOT NULL, -- Monday of the week

  -- Weekly totals
  total_calories DECIMAL(8,2),
  total_protein_g DECIMAL(7,2),
  total_carbs_g DECIMAL(7,2),
  total_fat_g DECIMAL(7,2),
  total_fiber_g DECIMAL(7,2),

  -- Daily averages
  avg_calories DECIMAL(7,2),
  avg_protein_g DECIMAL(6,2),
  avg_carbs_g DECIMAL(6,2),
  avg_fat_g DECIMAL(6,2),
  avg_fiber_g DECIMAL(6,2),

  -- Daily breakdown (JSONB for flexibility)
  daily_breakdown JSONB, -- {Monday: {calories: x, protein: y, ...}, ...}

  -- Goal tracking
  user_goals_snapshot JSONB, -- Snapshot of user's macro goals at time of calculation
  days_on_target INTEGER DEFAULT 0, -- Number of days within ±10% of goals

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, week_start)
);

-- Index for user week lookups
CREATE INDEX IF NOT EXISTS idx_weekly_nutrition_summary_user_week
  ON weekly_nutrition_summary(user_id, week_start DESC);

-- Index for household tracking
CREATE INDEX IF NOT EXISTS idx_weekly_nutrition_summary_household
  ON weekly_nutrition_summary(household_id, week_start DESC);

-- =====================================================
-- 5. NUTRITION EXTRACTION QUEUE TABLE
-- =====================================================
-- Tracks background jobs for nutrition extraction
-- Used for bulk processing existing recipes

CREATE TABLE IF NOT EXISTS nutrition_extraction_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Processing metadata
  priority INTEGER DEFAULT 0, -- Higher = processed first
  attempts INTEGER DEFAULT 0,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  UNIQUE(recipe_id)
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_nutrition_extraction_queue_status_priority
  ON nutrition_extraction_queue(status, priority DESC, created_at);

-- =====================================================
-- 6. DATABASE FUNCTIONS
-- =====================================================

-- Function to update weekly summary when daily log changes
CREATE OR REPLACE FUNCTION update_weekly_nutrition_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_week_start DATE;
  v_user_id UUID;
  v_household_id UUID;
BEGIN
  -- Determine the week start (Monday) for the changed date
  v_week_start := DATE_TRUNC('week', NEW.date)::DATE;
  v_user_id := NEW.user_id;
  v_household_id := NEW.household_id;

  -- Upsert weekly summary
  INSERT INTO weekly_nutrition_summary (
    user_id,
    household_id,
    week_start,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    avg_calories,
    avg_protein_g,
    avg_carbs_g,
    avg_fat_g,
    avg_fiber_g,
    daily_breakdown,
    updated_at
  )
  SELECT
    v_user_id,
    v_household_id,
    v_week_start,
    SUM(total_calories),
    SUM(total_protein_g),
    SUM(total_carbs_g),
    SUM(total_fat_g),
    SUM(total_fiber_g),
    AVG(total_calories),
    AVG(total_protein_g),
    AVG(total_carbs_g),
    AVG(total_fat_g),
    AVG(total_fiber_g),
    jsonb_object_agg(
      TO_CHAR(date, 'Day'),
      jsonb_build_object(
        'calories', total_calories,
        'protein_g', total_protein_g,
        'carbs_g', total_carbs_g,
        'fat_g', total_fat_g,
        'fiber_g', total_fiber_g
      )
    ),
    NOW()
  FROM daily_nutrition_logs
  WHERE user_id = v_user_id
    AND date >= v_week_start
    AND date < v_week_start + INTERVAL '7 days'
  GROUP BY v_user_id, v_household_id, v_week_start
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fat_g = EXCLUDED.total_fat_g,
    total_fiber_g = EXCLUDED.total_fiber_g,
    avg_calories = EXCLUDED.avg_calories,
    avg_protein_g = EXCLUDED.avg_protein_g,
    avg_carbs_g = EXCLUDED.avg_carbs_g,
    avg_fat_g = EXCLUDED.avg_fat_g,
    avg_fiber_g = EXCLUDED.avg_fiber_g,
    daily_breakdown = EXCLUDED.daily_breakdown,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update weekly summary
CREATE TRIGGER trigger_update_weekly_nutrition_summary
AFTER INSERT OR UPDATE ON daily_nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION update_weekly_nutrition_summary();

-- Function to calculate daily nutrition from meal assignments
CREATE OR REPLACE FUNCTION calculate_daily_nutrition(
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE (
  total_calories DECIMAL(7,2),
  total_protein_g DECIMAL(6,2),
  total_carbs_g DECIMAL(6,2),
  total_fat_g DECIMAL(6,2),
  total_fiber_g DECIMAL(6,2),
  total_sugar_g DECIMAL(6,2),
  total_sodium_mg DECIMAL(7,2),
  meal_count INTEGER,
  recipes_with_nutrition INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(rn.calories)::DECIMAL(7,2) as total_calories,
    SUM(rn.protein_g)::DECIMAL(6,2) as total_protein_g,
    SUM(rn.carbs_g)::DECIMAL(6,2) as total_carbs_g,
    SUM(rn.fat_g)::DECIMAL(6,2) as total_fat_g,
    SUM(rn.fiber_g)::DECIMAL(6,2) as total_fiber_g,
    SUM(rn.sugar_g)::DECIMAL(6,2) as total_sugar_g,
    SUM(rn.sodium_mg)::DECIMAL(7,2) as total_sodium_mg,
    COUNT(ma.id)::INTEGER as meal_count,
    COUNT(rn.id)::INTEGER as recipes_with_nutrition
  FROM meal_plans mp
  JOIN meal_assignments ma ON ma.meal_plan_id = mp.id
  JOIN recipes r ON r.id = ma.recipe_id
  LEFT JOIN recipe_nutrition rn ON rn.recipe_id = r.id
  WHERE mp.household_id IN (
    SELECT household_id FROM profiles WHERE id = p_user_id
  )
  AND ma.day_of_week = TO_CHAR(p_date, 'Day')
  AND mp.week_start = DATE_TRUNC('week', p_date)::DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create daily nutrition log
CREATE OR REPLACE FUNCTION upsert_daily_nutrition_log(
  p_user_id UUID,
  p_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_household_id UUID;
  v_nutrition RECORD;
BEGIN
  -- Get user's household
  SELECT household_id INTO v_household_id
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate nutrition for the day
  SELECT * INTO v_nutrition
  FROM calculate_daily_nutrition(p_user_id, p_date);

  -- Upsert daily log
  INSERT INTO daily_nutrition_logs (
    user_id,
    household_id,
    date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    total_sugar_g,
    total_sodium_mg,
    meal_count,
    recipes_with_nutrition,
    data_completeness_pct,
    updated_at
  ) VALUES (
    p_user_id,
    v_household_id,
    p_date,
    v_nutrition.total_calories,
    v_nutrition.total_protein_g,
    v_nutrition.total_carbs_g,
    v_nutrition.total_fat_g,
    v_nutrition.total_fiber_g,
    v_nutrition.total_sugar_g,
    v_nutrition.total_sodium_mg,
    v_nutrition.meal_count,
    v_nutrition.recipes_with_nutrition,
    CASE
      WHEN v_nutrition.meal_count > 0
      THEN (v_nutrition.recipes_with_nutrition::DECIMAL / v_nutrition.meal_count * 100)
      ELSE 0
    END,
    NOW()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fat_g = EXCLUDED.total_fat_g,
    total_fiber_g = EXCLUDED.total_fiber_g,
    total_sugar_g = EXCLUDED.total_sugar_g,
    total_sodium_mg = EXCLUDED.total_sodium_mg,
    meal_count = EXCLUDED.meal_count,
    recipes_with_nutrition = EXCLUDED.recipes_with_nutrition,
    data_completeness_pct = EXCLUDED.data_completeness_pct,
    updated_at = NOW()
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_nutrition_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_extraction_queue ENABLE ROW LEVEL SECURITY;

-- recipe_nutrition: Users can view nutrition for recipes they can access
CREATE POLICY "Users can view recipe nutrition for accessible recipes"
  ON recipe_nutrition FOR SELECT
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE user_id = auth.uid()
        OR (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()) AND is_shared_with_household = true)
    )
  );

-- recipe_nutrition: Users can insert/update nutrition for their own recipes
CREATE POLICY "Users can manage nutrition for their own recipes"
  ON recipe_nutrition FOR ALL
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- daily_nutrition_logs: Users can view their own logs
CREATE POLICY "Users can view their own nutrition logs"
  ON daily_nutrition_logs FOR SELECT
  USING (user_id = auth.uid());

-- daily_nutrition_logs: System can insert/update logs
CREATE POLICY "System can manage nutrition logs"
  ON daily_nutrition_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- weekly_nutrition_summary: Users can view their own summaries
CREATE POLICY "Users can view their own weekly summaries"
  ON weekly_nutrition_summary FOR SELECT
  USING (user_id = auth.uid());

-- weekly_nutrition_summary: System can manage summaries
CREATE POLICY "System can manage weekly summaries"
  ON weekly_nutrition_summary FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- nutrition_extraction_queue: Service role only
CREATE POLICY "Service role can manage extraction queue"
  ON nutrition_extraction_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. SEED DATA FOR TESTING
-- =====================================================
-- Add macro goal presets configuration
-- This can be used by the frontend for quick macro goal setup

COMMENT ON COLUMN user_settings.macro_goal_preset IS
  'Preset options:
  - weight_loss: 1800 cal, 140g protein, 150g carbs, 60g fat
  - muscle_building: 2500 cal, 180g protein, 250g carbs, 80g fat
  - maintenance: 2000 cal, 150g protein, 200g carbs, 65g fat
  - custom: User-defined values';

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_confidence
  ON recipe_nutrition(confidence_score DESC)
  WHERE confidence_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_daily_logs_completeness
  ON daily_nutrition_logs(data_completeness_pct DESC, date DESC);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251211_nutrition_tracking completed successfully';
  RAISE NOTICE 'Created tables: recipe_nutrition, daily_nutrition_logs, weekly_nutrition_summary, nutrition_extraction_queue';
  RAISE NOTICE 'Extended table: user_settings (added macro_goals, macro_tracking_enabled, macro_goal_preset)';
  RAISE NOTICE 'Created functions: update_weekly_nutrition_summary, calculate_daily_nutrition, upsert_daily_nutrition_log';
  RAISE NOTICE 'Applied RLS policies for all new tables';
END $$;
