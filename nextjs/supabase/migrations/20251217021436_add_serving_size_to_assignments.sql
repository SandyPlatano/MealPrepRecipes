-- Add serving_size column to meal_assignments for custom serving scaling
-- This enables users to specify how many servings they want for each meal plan assignment

ALTER TABLE meal_assignments
ADD COLUMN serving_size INTEGER DEFAULT NULL;

-- Add constraint to ensure positive values when specified
ALTER TABLE meal_assignments
ADD CONSTRAINT meal_assignments_serving_size_positive
CHECK (serving_size IS NULL OR serving_size > 0);

-- Add index for efficient filtering by serving size
CREATE INDEX idx_meal_assignments_serving_size ON meal_assignments(serving_size);

-- Add comment for documentation
COMMENT ON COLUMN meal_assignments.serving_size IS 'Custom serving size for this assignment. NULL means use recipe base_servings or user default setting.';
