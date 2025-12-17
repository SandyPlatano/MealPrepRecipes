-- Quick Cook Logs Table
-- Stores history of "What Should I Cook Right Now?" suggestions for analytics
-- and to track daily usage quotas

CREATE TABLE IF NOT EXISTS quick_cook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- Request details
  request JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "timeAvailable": 15,
  --   "energyLevel": "zombie" | "meh" | "got_this",
  --   "ingredientsOnHand": ["chicken", "rice"],
  --   "servings": 4
  -- }

  -- AI Response
  suggestion JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "recipe_id": "uuid-or-null",
  --   "title": "Recipe Name",
  --   "cuisine": "Italian",
  --   "total_time": 25,
  --   "active_time": 15,
  --   "reason": "Why this recipe...",
  --   "ingredients": [...],
  --   "instructions": [...],
  --   "estimated_cost": "~$12",
  --   "difficulty": "brain-dead-simple",
  --   "servings": 4
  -- }

  -- User interaction tracking
  accepted BOOLEAN DEFAULT NULL, -- null = not yet decided, true = saved/cooked, false = rejected
  regeneration_count INT DEFAULT 0, -- How many times they clicked "try again"
  affiliate_clicked BOOLEAN DEFAULT FALSE, -- Did they click "Shop on Amazon"?

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_quick_cook_logs_user_id ON quick_cook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_cook_logs_household_id ON quick_cook_logs(household_id);
CREATE INDEX IF NOT EXISTS idx_quick_cook_logs_created_at ON quick_cook_logs(created_at DESC);

-- Index for daily quota checks (user + date)
CREATE INDEX IF NOT EXISTS idx_quick_cook_logs_user_daily
  ON quick_cook_logs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE quick_cook_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own quick cook logs
CREATE POLICY "Users can view own quick cook logs"
  ON quick_cook_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own quick cook logs
CREATE POLICY "Users can insert own quick cook logs"
  ON quick_cook_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own quick cook logs (for accepted/affiliate_clicked)
CREATE POLICY "Users can update own quick cook logs"
  ON quick_cook_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get quick cook usage for today
CREATE OR REPLACE FUNCTION get_quick_cook_usage_today(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_count INT;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM quick_cook_logs
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC');

  RETURN COALESCE(usage_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_quick_cook_usage_today(UUID) TO authenticated;

COMMENT ON TABLE quick_cook_logs IS 'Stores Quick Cook ("What Should I Cook Right Now?") suggestion history for analytics and quota tracking';
COMMENT ON COLUMN quick_cook_logs.request IS 'The user request: timeAvailable, energyLevel, ingredientsOnHand, servings';
COMMENT ON COLUMN quick_cook_logs.suggestion IS 'The AI-generated suggestion with full recipe details';
COMMENT ON COLUMN quick_cook_logs.accepted IS 'Whether user saved/cooked (true), rejected (false), or not decided (null)';
COMMENT ON COLUMN quick_cook_logs.regeneration_count IS 'Number of times user clicked "try again" for this session';
COMMENT ON COLUMN quick_cook_logs.affiliate_clicked IS 'Whether user clicked the grocery affiliate link';
