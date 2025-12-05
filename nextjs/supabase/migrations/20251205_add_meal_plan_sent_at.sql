-- Add sent_at field to track when a meal plan was sent/finalized
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Create index for querying sent plans
CREATE INDEX IF NOT EXISTS idx_meal_plans_sent_at ON meal_plans(sent_at) WHERE sent_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN meal_plans.sent_at IS 'Timestamp when the meal plan was sent via email, marking it as finalized';

