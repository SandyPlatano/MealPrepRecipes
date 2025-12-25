-- Create a function to get recipe cook counts efficiently using SQL aggregation
-- This replaces the N+1 pattern of fetching all records and counting in JavaScript

CREATE OR REPLACE FUNCTION get_recipe_cook_counts(p_household_id uuid)
RETURNS TABLE (recipe_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT recipe_id, COUNT(*) as count
  FROM cooking_history
  WHERE household_id = p_household_id
  GROUP BY recipe_id;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_recipe_cook_counts(uuid) TO authenticated;

-- Add index to optimize this query (if not already exists)
CREATE INDEX IF NOT EXISTS idx_cooking_history_household_recipe
  ON cooking_history(household_id, recipe_id);
