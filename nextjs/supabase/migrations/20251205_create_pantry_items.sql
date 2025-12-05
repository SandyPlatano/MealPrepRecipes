-- Create pantry_items table for tracking items users already have
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  normalized_ingredient TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, normalized_ingredient)
);

-- Enable RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view pantry items for their household
CREATE POLICY "Users can view own household pantry items"
  ON pantry_items FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert pantry items for their household
CREATE POLICY "Users can insert own household pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update pantry items for their household
CREATE POLICY "Users can update own household pantry items"
  ON pantry_items FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete pantry items for their household
CREATE POLICY "Users can delete own household pantry items"
  ON pantry_items FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_pantry_items_household ON pantry_items(household_id);
CREATE INDEX idx_pantry_items_normalized ON pantry_items(household_id, normalized_ingredient);

