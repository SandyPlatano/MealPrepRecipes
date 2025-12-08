-- Make meal_plan_id nullable as a safety fallback
-- This allows shopping lists to exist independently if needed,
-- but they will typically be linked to the current week's meal plan
ALTER TABLE shopping_lists ALTER COLUMN meal_plan_id DROP NOT NULL;

