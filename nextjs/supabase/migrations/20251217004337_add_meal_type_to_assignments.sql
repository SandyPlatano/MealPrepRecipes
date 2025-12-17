-- Add meal_type column to meal_assignments for organizing meals by type (breakfast, lunch, dinner, snack)
-- This enables color-coded visual organization in the meal planner

ALTER TABLE meal_assignments
ADD COLUMN meal_type TEXT
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack') OR meal_type IS NULL);

-- Add index for efficient grouping/sorting by meal type
CREATE INDEX idx_meal_assignments_meal_type ON meal_assignments(meal_type);

-- Add comment for documentation
COMMENT ON COLUMN meal_assignments.meal_type IS 'Type of meal slot: breakfast, lunch, dinner, snack. Null means unassigned/other.';
