-- ============================================================================
-- Household Cooks Table
-- Stores custom cooks (non-user family members) with optional avatars
-- ============================================================================

-- Create table
CREATE TABLE IF NOT EXISTS household_cooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  color TEXT,  -- Hex color for fallback initials background
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique names within a household
  CONSTRAINT household_cooks_unique_name UNIQUE(household_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_household_cooks_household
  ON household_cooks(household_id);
CREATE INDEX IF NOT EXISTS idx_household_cooks_active
  ON household_cooks(household_id, is_active)
  WHERE is_active = true;

-- Enable RLS
ALTER TABLE household_cooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their household cooks"
  ON household_cooks FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert into their household"
  ON household_cooks FOR INSERT
  WITH CHECK (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their household cooks"
  ON household_cooks FOR UPDATE
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their household cooks"
  ON household_cooks FOR DELETE
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_household_cooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER household_cooks_updated_at
  BEFORE UPDATE ON household_cooks
  FOR EACH ROW
  EXECUTE FUNCTION update_household_cooks_updated_at();

-- ============================================================================
-- Migrate existing cook_names from user_settings to household_cooks
-- ============================================================================

-- Insert existing cook names (if user_settings has cook_names array)
INSERT INTO household_cooks (household_id, name, color, display_order)
SELECT DISTINCT ON (hm.household_id, cook_name)
  hm.household_id,
  cook_name,
  NULL as color,
  ROW_NUMBER() OVER (PARTITION BY hm.household_id ORDER BY cook_name) - 1 as display_order
FROM user_settings us
JOIN household_members hm ON hm.user_id = us.user_id
CROSS JOIN LATERAL unnest(
  CASE
    WHEN us.cook_names IS NOT NULL AND array_length(us.cook_names, 1) > 0
    THEN us.cook_names
    ELSE ARRAY[]::text[]
  END
) AS cook_name
WHERE cook_name IS NOT NULL AND cook_name != ''
ON CONFLICT (household_id, name) DO NOTHING;
