-- Add base_servings column for ingredient scaling
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipes' AND column_name = 'base_servings'
  ) THEN
    ALTER TABLE recipes ADD COLUMN base_servings INTEGER;
  END IF;
END $$;

-- Create index for filtering recipes with scalable servings
CREATE INDEX IF NOT EXISTS idx_recipes_base_servings ON recipes(base_servings) WHERE base_servings IS NOT NULL;

-- Populate base_servings from existing servings where possible
-- Extracts leading numeric value from servings text field
UPDATE recipes
SET base_servings = (
  SELECT CASE
    WHEN servings ~ '^[0-9]+' THEN (regexp_match(servings, '^([0-9]+)'))[1]::INTEGER
    ELSE NULL
  END
)
WHERE servings IS NOT NULL;

