-- Food Waste Tracking Feature Migration
-- Track waste reduction metrics and gamification

-- Weekly waste metrics table (computed/cached)
CREATE TABLE IF NOT EXISTS waste_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,

  -- Raw counts
  meals_planned INTEGER DEFAULT 0,
  meals_cooked INTEGER DEFAULT 0,
  shopping_items_total INTEGER DEFAULT 0,
  shopping_items_checked INTEGER DEFAULT 0,
  pantry_items_used INTEGER DEFAULT 0,

  -- Computed estimates (stored for historical accuracy)
  estimated_waste_prevented_kg DECIMAL(6,3) DEFAULT 0,
  estimated_money_saved_cents INTEGER DEFAULT 0,
  estimated_co2_saved_kg DECIMAL(6,3) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(household_id, week_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waste_metrics_household
  ON waste_metrics(household_id);
CREATE INDEX IF NOT EXISTS idx_waste_metrics_week
  ON waste_metrics(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_waste_metrics_household_week
  ON waste_metrics(household_id, week_start DESC);

-- Gamification: achievements/badges
CREATE TABLE IF NOT EXISTS waste_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  -- Each achievement can only be earned once per household
  UNIQUE(household_id, achievement_type)
);

-- Index for checking achievements
CREATE INDEX IF NOT EXISTS idx_waste_achievements_household
  ON waste_achievements(household_id);
CREATE INDEX IF NOT EXISTS idx_waste_achievements_type
  ON waste_achievements(achievement_type);

-- RLS policies for waste_metrics
ALTER TABLE waste_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own household waste metrics"
  ON waste_metrics FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert waste metrics for own household"
  ON waste_metrics FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own household waste metrics"
  ON waste_metrics FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- RLS policies for waste_achievements
ALTER TABLE waste_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own household achievements"
  ON waste_achievements FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert achievements for own household"
  ON waste_achievements FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Function to calculate and upsert waste metrics for a week
CREATE OR REPLACE FUNCTION calculate_waste_metrics(
  p_household_id UUID,
  p_week_start DATE
) RETURNS waste_metrics AS $$
DECLARE
  v_meals_planned INTEGER;
  v_meals_cooked INTEGER;
  v_shopping_total INTEGER;
  v_shopping_checked INTEGER;
  v_pantry_used INTEGER;
  v_utilization_rate DECIMAL;
  v_waste_prevented DECIMAL;
  v_money_saved INTEGER;
  v_co2_saved DECIMAL;
  v_result waste_metrics;
BEGIN
  -- Count meals planned for the week
  SELECT COUNT(*) INTO v_meals_planned
  FROM meal_assignments ma
  JOIN meal_plans mp ON ma.meal_plan_id = mp.id
  WHERE mp.household_id = p_household_id
  AND mp.week_start = p_week_start;

  -- Count meals cooked (from cooking_history)
  SELECT COUNT(*) INTO v_meals_cooked
  FROM cooking_history ch
  WHERE ch.household_id = p_household_id
  AND ch.cooked_at >= p_week_start
  AND ch.cooked_at < p_week_start + INTERVAL '7 days';

  -- Count shopping list items
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_checked = TRUE)
  INTO v_shopping_total, v_shopping_checked
  FROM shopping_list_items sli
  JOIN shopping_lists sl ON sli.shopping_list_id = sl.id
  JOIN meal_plans mp ON sl.meal_plan_id = mp.id
  WHERE mp.household_id = p_household_id
  AND mp.week_start = p_week_start;

  -- Count pantry items used (items that were in pantry and checked off)
  SELECT COUNT(*) INTO v_pantry_used
  FROM shopping_list_items sli
  JOIN shopping_lists sl ON sli.shopping_list_id = sl.id
  JOIN meal_plans mp ON sl.meal_plan_id = mp.id
  WHERE mp.household_id = p_household_id
  AND mp.week_start = p_week_start
  AND sli.is_in_pantry = TRUE
  AND sli.is_checked = TRUE;

  -- Calculate utilization rate
  IF v_meals_planned > 0 THEN
    v_utilization_rate := v_meals_cooked::DECIMAL / v_meals_planned;
  ELSE
    v_utilization_rate := 0;
  END IF;

  -- Calculate waste prevented (kg)
  -- Formula: cooked_meals * 0.15kg * utilization_rate * 0.65 (planning reduction factor)
  v_waste_prevented := v_meals_cooked * 0.15 * v_utilization_rate * 0.65;

  -- Calculate money saved (cents)
  -- Formula: waste_prevented * $5/kg * 100
  v_money_saved := (v_waste_prevented * 5.0 * 100)::INTEGER;

  -- Calculate CO2 saved (kg)
  -- Formula: waste_prevented * 2.5 kg CO2 per kg waste
  v_co2_saved := v_waste_prevented * 2.5;

  -- Upsert the metrics
  INSERT INTO waste_metrics (
    household_id,
    week_start,
    meals_planned,
    meals_cooked,
    shopping_items_total,
    shopping_items_checked,
    pantry_items_used,
    estimated_waste_prevented_kg,
    estimated_money_saved_cents,
    estimated_co2_saved_kg,
    updated_at
  ) VALUES (
    p_household_id,
    p_week_start,
    v_meals_planned,
    v_meals_cooked,
    v_shopping_total,
    v_shopping_checked,
    COALESCE(v_pantry_used, 0),
    v_waste_prevented,
    v_money_saved,
    v_co2_saved,
    NOW()
  )
  ON CONFLICT (household_id, week_start)
  DO UPDATE SET
    meals_planned = EXCLUDED.meals_planned,
    meals_cooked = EXCLUDED.meals_cooked,
    shopping_items_total = EXCLUDED.shopping_items_total,
    shopping_items_checked = EXCLUDED.shopping_items_checked,
    pantry_items_used = EXCLUDED.pantry_items_used,
    estimated_waste_prevented_kg = EXCLUDED.estimated_waste_prevented_kg,
    estimated_money_saved_cents = EXCLUDED.estimated_money_saved_cents,
    estimated_co2_saved_kg = EXCLUDED.estimated_co2_saved_kg,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get aggregate waste metrics
CREATE OR REPLACE FUNCTION get_aggregate_waste_metrics(
  p_household_id UUID,
  p_period TEXT DEFAULT 'all_time'  -- 'week', 'month', 'year', 'all_time'
) RETURNS TABLE (
  total_meals_planned BIGINT,
  total_meals_cooked BIGINT,
  total_waste_prevented_kg DECIMAL,
  total_money_saved_cents BIGINT,
  total_co2_saved_kg DECIMAL,
  average_utilization_rate DECIMAL,
  average_shopping_efficiency DECIMAL,
  weeks_tracked BIGINT
) AS $$
DECLARE
  v_start_date DATE;
BEGIN
  -- Determine start date based on period
  CASE p_period
    WHEN 'week' THEN v_start_date := date_trunc('week', CURRENT_DATE)::DATE;
    WHEN 'month' THEN v_start_date := date_trunc('month', CURRENT_DATE)::DATE;
    WHEN 'year' THEN v_start_date := date_trunc('year', CURRENT_DATE)::DATE;
    ELSE v_start_date := '1970-01-01'::DATE;  -- all_time
  END CASE;

  RETURN QUERY
  SELECT
    COALESCE(SUM(wm.meals_planned), 0)::BIGINT,
    COALESCE(SUM(wm.meals_cooked), 0)::BIGINT,
    COALESCE(SUM(wm.estimated_waste_prevented_kg), 0)::DECIMAL,
    COALESCE(SUM(wm.estimated_money_saved_cents), 0)::BIGINT,
    COALESCE(SUM(wm.estimated_co2_saved_kg), 0)::DECIMAL,
    CASE
      WHEN SUM(wm.meals_planned) > 0
      THEN (SUM(wm.meals_cooked)::DECIMAL / SUM(wm.meals_planned))
      ELSE 0
    END,
    CASE
      WHEN SUM(wm.shopping_items_total) > 0
      THEN (SUM(wm.shopping_items_checked)::DECIMAL / SUM(wm.shopping_items_total))
      ELSE 0
    END,
    COUNT(*)::BIGINT
  FROM waste_metrics wm
  WHERE wm.household_id = p_household_id
  AND wm.week_start >= v_start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_waste_achievements(p_household_id UUID)
RETURNS SETOF waste_achievements AS $$
DECLARE
  v_aggregate RECORD;
  v_streak INTEGER;
  v_new_achievement waste_achievements;
BEGIN
  -- Get aggregate metrics
  SELECT * INTO v_aggregate
  FROM get_aggregate_waste_metrics(p_household_id, 'all_time');

  -- Check waste prevention milestones
  IF v_aggregate.total_waste_prevented_kg >= 1 THEN
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'first_kg', jsonb_build_object('kg', v_aggregate.total_waste_prevented_kg))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  IF v_aggregate.total_waste_prevented_kg >= 5 THEN
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'five_kg', jsonb_build_object('kg', v_aggregate.total_waste_prevented_kg))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  IF v_aggregate.total_waste_prevented_kg >= 10 THEN
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'ten_kg', jsonb_build_object('kg', v_aggregate.total_waste_prevented_kg))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  -- Check money saved milestones
  IF v_aggregate.total_money_saved_cents >= 1000 THEN  -- $10
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'first_ten_dollars', jsonb_build_object('cents', v_aggregate.total_money_saved_cents))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  IF v_aggregate.total_money_saved_cents >= 5000 THEN  -- $50
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'fifty_dollars', jsonb_build_object('cents', v_aggregate.total_money_saved_cents))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  -- Check weeks tracked milestones
  IF v_aggregate.weeks_tracked >= 1 THEN
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'first_plan', jsonb_build_object('weeks', v_aggregate.weeks_tracked))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  IF v_aggregate.weeks_tracked >= 10 THEN
    INSERT INTO waste_achievements (household_id, achievement_type, metadata)
    VALUES (p_household_id, 'ten_weeks', jsonb_build_object('weeks', v_aggregate.weeks_tracked))
    ON CONFLICT (household_id, achievement_type) DO NOTHING
    RETURNING * INTO v_new_achievement;
    IF v_new_achievement IS NOT NULL THEN RETURN NEXT v_new_achievement; END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE waste_metrics IS
  'Weekly food waste reduction metrics computed from meal planning and cooking data';
COMMENT ON TABLE waste_achievements IS
  'Gamification badges earned by households for waste reduction milestones';
COMMENT ON FUNCTION calculate_waste_metrics IS
  'Calculate and upsert waste metrics for a given household and week';
COMMENT ON FUNCTION get_aggregate_waste_metrics IS
  'Get aggregated waste metrics over a time period';
COMMENT ON FUNCTION check_waste_achievements IS
  'Check and award any newly earned achievements';
