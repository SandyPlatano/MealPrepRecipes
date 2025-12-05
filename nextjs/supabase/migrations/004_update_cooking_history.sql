-- ============================================
-- Update cooking_history to support households
-- ============================================

-- Add household_id and cooked_by columns
ALTER TABLE cooking_history
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS cooked_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Migrate existing data: set cooked_by from user_id and get household_id
UPDATE cooking_history ch
SET
  cooked_by = ch.user_id,
  household_id = (
    SELECT household_id
    FROM household_members hm
    WHERE hm.user_id = ch.user_id
    LIMIT 1
  )
WHERE cooked_by IS NULL;

-- Create index for household_id
CREATE INDEX IF NOT EXISTS idx_cooking_history_household_id ON cooking_history(household_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_cooked_by ON cooking_history(cooked_by);

-- Update RLS policies for cooking_history
DROP POLICY IF EXISTS "Users can view cooking history in their household" ON cooking_history;
CREATE POLICY "Users can view cooking history in their household"
ON cooking_history FOR SELECT
USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert cooking history" ON cooking_history;
CREATE POLICY "Users can insert cooking history"
ON cooking_history FOR INSERT
WITH CHECK (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own cooking history" ON cooking_history;
CREATE POLICY "Users can update their own cooking history"
ON cooking_history FOR UPDATE
USING (cooked_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own cooking history" ON cooking_history;
CREATE POLICY "Users can delete their own cooking history"
ON cooking_history FOR DELETE
USING (cooked_by = auth.uid());

-- Add email_notifications to user_settings if not exists
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
