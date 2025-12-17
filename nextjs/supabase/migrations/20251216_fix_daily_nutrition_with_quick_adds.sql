-- =====================================================
-- Migration: Fix calculate_daily_nutrition to include quick adds
-- Purpose: Include nutrition_quick_adds in daily/weekly calculations
-- =====================================================

-- Drop and recreate the function to include quick adds
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
  WITH meal_nutrition AS (
    -- Get nutrition from meal plan assignments (existing logic)
    SELECT
      COALESCE(SUM(rn.calories), 0) as calories,
      COALESCE(SUM(rn.protein_g), 0) as protein_g,
      COALESCE(SUM(rn.carbs_g), 0) as carbs_g,
      COALESCE(SUM(rn.fat_g), 0) as fat_g,
      COALESCE(SUM(rn.fiber_g), 0) as fiber_g,
      COALESCE(SUM(rn.sugar_g), 0) as sugar_g,
      COALESCE(SUM(rn.sodium_mg), 0) as sodium_mg,
      COUNT(ma.id)::INTEGER as meal_count,
      COUNT(rn.id)::INTEGER as recipes_with_nutrition
    FROM meal_plans mp
    JOIN meal_assignments ma ON ma.meal_plan_id = mp.id
    JOIN recipes r ON r.id = ma.recipe_id
    LEFT JOIN recipe_nutrition rn ON rn.recipe_id = r.id
    WHERE mp.household_id IN (
      SELECT household_id FROM profiles WHERE id = p_user_id
    )
    AND TRIM(ma.day_of_week) = TRIM(TO_CHAR(p_date, 'Day'))
    AND mp.week_start = DATE_TRUNC('week', p_date)::DATE
  ),
  quick_add_nutrition AS (
    -- Get nutrition from quick adds for this user and date
    SELECT
      COALESCE(SUM(qa.calories), 0) as calories,
      COALESCE(SUM(qa.protein_g), 0) as protein_g,
      COALESCE(SUM(qa.carbs_g), 0) as carbs_g,
      COALESCE(SUM(qa.fat_g), 0) as fat_g,
      0::DECIMAL as fiber_g,  -- Quick adds don't track fiber
      0::DECIMAL as sugar_g,  -- Quick adds don't track sugar
      0::DECIMAL as sodium_mg -- Quick adds don't track sodium
    FROM nutrition_quick_adds qa
    WHERE qa.user_id = p_user_id
    AND qa.date = p_date
  )
  SELECT
    (COALESCE(mn.calories, 0) + COALESCE(qn.calories, 0))::DECIMAL(7,2) as total_calories,
    (COALESCE(mn.protein_g, 0) + COALESCE(qn.protein_g, 0))::DECIMAL(6,2) as total_protein_g,
    (COALESCE(mn.carbs_g, 0) + COALESCE(qn.carbs_g, 0))::DECIMAL(6,2) as total_carbs_g,
    (COALESCE(mn.fat_g, 0) + COALESCE(qn.fat_g, 0))::DECIMAL(6,2) as total_fat_g,
    COALESCE(mn.fiber_g, 0)::DECIMAL(6,2) as total_fiber_g,
    COALESCE(mn.sugar_g, 0)::DECIMAL(6,2) as total_sugar_g,
    COALESCE(mn.sodium_mg, 0)::DECIMAL(7,2) as total_sodium_mg,
    COALESCE(mn.meal_count, 0) as meal_count,
    COALESCE(mn.recipes_with_nutrition, 0) as recipes_with_nutrition
  FROM meal_nutrition mn
  CROSS JOIN quick_add_nutrition qn;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_daily_nutrition(UUID, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION calculate_daily_nutrition IS 'Calculates total nutrition values for a user on a specific date, combining meal plan assignments AND quick add entries';
