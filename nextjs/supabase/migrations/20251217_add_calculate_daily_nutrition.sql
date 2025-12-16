-- Migration: Add calculate_daily_nutrition function
-- This function calculates daily nutrition totals from meal assignments

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
    COALESCE(SUM(rn.calories), 0)::DECIMAL(7,2) as total_calories,
    COALESCE(SUM(rn.protein_g), 0)::DECIMAL(6,2) as total_protein_g,
    COALESCE(SUM(rn.carbs_g), 0)::DECIMAL(6,2) as total_carbs_g,
    COALESCE(SUM(rn.fat_g), 0)::DECIMAL(6,2) as total_fat_g,
    COALESCE(SUM(rn.fiber_g), 0)::DECIMAL(6,2) as total_fiber_g,
    COALESCE(SUM(rn.sugar_g), 0)::DECIMAL(6,2) as total_sugar_g,
    COALESCE(SUM(rn.sodium_mg), 0)::DECIMAL(7,2) as total_sodium_mg,
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
  AND mp.week_start = DATE_TRUNC('week', p_date)::DATE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_daily_nutrition(UUID, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION calculate_daily_nutrition IS 'Calculates total nutrition values for a user on a specific date based on their meal plan assignments';
