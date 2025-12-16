-- ============================================
-- Add household_id to cooking_history for consistent household-level queries
-- Currently cooking_history only has user_id, making household stats difficult
-- ============================================

-- Add household_id column (nullable for backwards compatibility)
ALTER TABLE cooking_history
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE SET NULL;

-- Backfill household_id from user's current household membership
UPDATE cooking_history ch
SET household_id = (
  SELECT hm.household_id
  FROM household_members hm
  WHERE hm.user_id = ch.user_id
  LIMIT 1
)
WHERE ch.household_id IS NULL;

-- Create index for household-level cooking history queries
CREATE INDEX IF NOT EXISTS idx_cooking_history_household
  ON cooking_history(household_id, cooked_at DESC);

-- Add comment documenting the relationship
COMMENT ON COLUMN cooking_history.household_id IS
  'Household context for this cook session. Enables household-level statistics and filtering.';
