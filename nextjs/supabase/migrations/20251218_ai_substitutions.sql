-- AI Substitutions Feature Migration
-- Track substitution history for learning and analytics

-- Substitution logs table
CREATE TABLE IF NOT EXISTS substitution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_ingredient TEXT NOT NULL,
  original_quantity TEXT,
  original_unit TEXT,
  chosen_substitute TEXT NOT NULL,
  substitute_quantity TEXT,
  substitute_unit TEXT,
  reason TEXT NOT NULL CHECK (reason IN (
    'unavailable', 'dietary', 'budget', 'pantry_first', 'preference'
  )),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  feedback TEXT CHECK (feedback IS NULL OR feedback IN ('worked', 'ok', 'poor')),
  ai_suggestions JSONB,  -- Store all suggestions for learning
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_substitution_logs_household
  ON substitution_logs(household_id);
CREATE INDEX IF NOT EXISTS idx_substitution_logs_ingredient
  ON substitution_logs(original_ingredient);
CREATE INDEX IF NOT EXISTS idx_substitution_logs_created_at
  ON substitution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_substitution_logs_user_week
  ON substitution_logs(user_id, date_trunc('week', created_at));

-- RLS policies
ALTER TABLE substitution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own household substitution logs"
  ON substitution_logs FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert substitution logs for own household"
  ON substitution_logs FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own substitution logs"
  ON substitution_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add substitution tracking to shopping list items
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS substituted_from TEXT,
ADD COLUMN IF NOT EXISTS substitution_log_id UUID REFERENCES substitution_logs(id) ON DELETE SET NULL;

-- Index for finding substituted items
CREATE INDEX IF NOT EXISTS idx_shopping_items_substituted
  ON shopping_list_items(substituted_from)
  WHERE substituted_from IS NOT NULL;

-- Add AI substitution quota to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_substitutions_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_substitutions_reset_at TIMESTAMPTZ;

-- Function to check and decrement substitution quota
CREATE OR REPLACE FUNCTION check_substitution_quota(p_user_id UUID)
RETURNS TABLE (
  can_use BOOLEAN,
  remaining INTEGER,
  tier TEXT,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_tier TEXT;
  v_used INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Get user's subscription tier
  SELECT COALESCE(s.tier, 'free') INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- Get current usage
  SELECT
    COALESCE(us.ai_substitutions_used, 0),
    us.ai_substitutions_reset_at
  INTO v_used, v_reset_at
  FROM user_settings us
  WHERE us.user_id = p_user_id;

  -- Check if quota should be reset (weekly on Monday)
  IF v_reset_at IS NULL OR v_reset_at < date_trunc('week', NOW()) THEN
    UPDATE user_settings
    SET
      ai_substitutions_used = 0,
      ai_substitutions_reset_at = date_trunc('week', NOW() + INTERVAL '1 week')
    WHERE user_id = p_user_id;

    v_used := 0;
    v_reset_at := date_trunc('week', NOW() + INTERVAL '1 week');
  END IF;

  -- Determine limit based on tier
  CASE v_tier
    WHEN 'free' THEN v_limit := 0;
    WHEN 'pro' THEN v_limit := 20;
    WHEN 'premium' THEN v_limit := 999999;  -- Effectively unlimited
    ELSE v_limit := 0;
  END CASE;

  RETURN QUERY SELECT
    (v_used < v_limit) AS can_use,
    GREATEST(v_limit - v_used, 0) AS remaining,
    v_tier AS tier,
    v_reset_at AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment substitution usage
CREATE OR REPLACE FUNCTION use_substitution_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_can_use BOOLEAN;
BEGIN
  -- Check if can use
  SELECT can_use INTO v_can_use FROM check_substitution_quota(p_user_id);

  IF v_can_use THEN
    UPDATE user_settings
    SET ai_substitutions_used = COALESCE(ai_substitutions_used, 0) + 1
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE substitution_logs IS
  'Tracks all AI ingredient substitutions for learning and analytics';
COMMENT ON COLUMN shopping_list_items.substituted_from IS
  'Original ingredient name before AI substitution was applied';
COMMENT ON COLUMN user_settings.ai_substitutions_used IS
  'Number of AI substitution requests used this week';
COMMENT ON COLUMN user_settings.ai_substitutions_reset_at IS
  'When the weekly substitution quota resets (Monday)';
