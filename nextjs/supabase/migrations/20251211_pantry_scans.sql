-- Create pantry_scans table for storing fridge/pantry camera scan history
CREATE TABLE IF NOT EXISTS pantry_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  scan_type TEXT DEFAULT 'fridge' CHECK (scan_type IN ('fridge', 'pantry', 'other')),
  detected_items JSONB DEFAULT '[]'::JSONB,
  confirmed_items JSONB DEFAULT '[]'::JSONB,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  CONSTRAINT valid_detected_items CHECK (jsonb_typeof(detected_items) = 'array'),
  CONSTRAINT valid_confirmed_items CHECK (jsonb_typeof(confirmed_items) = 'array')
);

-- Create indexes for better performance
CREATE INDEX idx_pantry_scans_household ON pantry_scans(household_id);
CREATE INDEX idx_pantry_scans_user ON pantry_scans(user_id);
CREATE INDEX idx_pantry_scans_status ON pantry_scans(processing_status);
CREATE INDEX idx_pantry_scans_created_at ON pantry_scans(created_at DESC);

-- Add RLS policies for pantry_scans
ALTER TABLE pantry_scans ENABLE ROW LEVEL SECURITY;

-- Allow users to view scans from their household
CREATE POLICY "Users can view pantry scans from their household"
  ON pantry_scans FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert scans for their household
CREATE POLICY "Users can create pantry scans for their household"
  ON pantry_scans FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Allow users to update their own scans
CREATE POLICY "Users can update their own pantry scans"
  ON pantry_scans FOR UPDATE
  USING (
    user_id = auth.uid()
    AND household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to delete their own scans
CREATE POLICY "Users can delete their own pantry scans"
  ON pantry_scans FOR DELETE
  USING (
    user_id = auth.uid()
    AND household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Add scan quota columns to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS pantry_scans_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pantry_scans_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month');

-- Create function to reset monthly scan quotas
CREATE OR REPLACE FUNCTION reset_pantry_scan_quotas()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_settings
  SET pantry_scans_used = 0,
      pantry_scans_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
  WHERE pantry_scans_reset_at <= NOW();
END;
$$;

-- Create a scheduled job to reset quotas (run daily to catch any that need resetting)
-- Note: This would typically be set up as a cron job in Supabase Dashboard
-- Example: SELECT cron.schedule('reset-pantry-quotas', '0 0 * * *', 'SELECT reset_pantry_scan_quotas();');

-- Add comment for documentation
COMMENT ON TABLE pantry_scans IS 'Stores fridge and pantry camera scan history with AI-detected ingredients';
COMMENT ON COLUMN pantry_scans.detected_items IS 'JSON array of AI-detected items: [{ingredient, quantity, category, confidence}]';
COMMENT ON COLUMN pantry_scans.confirmed_items IS 'JSON array of user-confirmed items after review';