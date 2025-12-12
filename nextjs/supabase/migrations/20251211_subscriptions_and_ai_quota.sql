-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Add AI suggestion quota columns to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_suggestions_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_suggestions_reset_at TIMESTAMPTZ;

-- Create ai_suggestion_logs table
CREATE TABLE IF NOT EXISTS ai_suggestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  suggestions JSONB NOT NULL,
  accepted_count INTEGER DEFAULT 0,
  regeneration_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ai_suggestion_logs
CREATE INDEX idx_ai_suggestion_logs_household ON ai_suggestion_logs(household_id);
CREATE INDEX idx_ai_suggestion_logs_week_start ON ai_suggestion_logs(week_start);
CREATE INDEX idx_ai_suggestion_logs_household_week ON ai_suggestion_logs(household_id, week_start);

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own subscription
CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policy: Users can't update subscriptions (only server can via service role)
CREATE POLICY subscriptions_no_update ON subscriptions
  FOR UPDATE
  USING (FALSE);

-- Enable RLS on ai_suggestion_logs table
ALTER TABLE ai_suggestion_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see logs for their household
CREATE POLICY ai_suggestion_logs_household_policy ON ai_suggestion_logs
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Function to decrement AI quota
CREATE OR REPLACE FUNCTION decrement_ai_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_settings
  SET ai_suggestions_remaining = GREATEST(ai_suggestions_remaining - 1, 0)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Create default free tier subscription for existing users
INSERT INTO subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Initialize AI quota for existing users based on their tier (free = 0, pro = 5, premium = unlimited)
UPDATE user_settings us
SET
  ai_suggestions_remaining = CASE
    WHEN s.tier = 'pro' THEN 5
    WHEN s.tier = 'premium' THEN 999  -- Use high number for "unlimited"
    ELSE 0
  END,
  ai_suggestions_reset_at = date_trunc('week', NOW() + interval '1 week')  -- Next Monday
FROM subscriptions s
WHERE us.user_id = s.user_id
AND us.ai_suggestions_remaining IS NULL;

COMMENT ON TABLE subscriptions IS 'Stores user subscription information and Stripe data';
COMMENT ON TABLE ai_suggestion_logs IS 'Logs all AI meal suggestion generations for analytics and debugging';
COMMENT ON COLUMN user_settings.ai_suggestions_remaining IS 'Number of AI meal suggestion regenerations remaining this week (5 for Pro, unlimited for Premium)';
COMMENT ON COLUMN user_settings.ai_suggestions_reset_at IS 'Timestamp when the AI suggestion quota resets (every Monday)';
