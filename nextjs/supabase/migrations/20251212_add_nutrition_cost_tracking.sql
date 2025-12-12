-- Add cost tracking fields to recipe_nutrition table
-- Tracks API usage and cost for AI-extracted nutrition data

ALTER TABLE recipe_nutrition
ADD COLUMN IF NOT EXISTS input_tokens INTEGER,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER,
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 6); -- Cost in USD (e.g., 0.001234)

-- Add index for cost analysis queries
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_cost 
  ON recipe_nutrition(cost_usd) 
  WHERE cost_usd IS NOT NULL;

-- Add comment explaining the cost calculation
COMMENT ON COLUMN recipe_nutrition.cost_usd IS 
  'Cost in USD for AI extraction. Calculated as: (input_tokens * $3/1M) + (output_tokens * $15/1M) for Claude Sonnet 4.5';

