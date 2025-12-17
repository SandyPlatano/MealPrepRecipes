-- ============================================
-- Household Permission Model
-- Adds role-based permissions, contribution tracking, and security functions
-- ============================================

-- ============================================
-- 1. EXPAND ROLE ENUM ON HOUSEHOLD_MEMBERS
-- ============================================

-- Drop existing constraint and add new one with expanded roles
ALTER TABLE household_members
  DROP CONSTRAINT IF EXISTS household_members_role_check;

ALTER TABLE household_members
  ADD CONSTRAINT household_members_role_check
  CHECK (role IN ('owner', 'adult', 'member', 'child', 'guest'));

-- ============================================
-- 2. ADD PERMISSION MODE TO HOUSEHOLDS
-- ============================================

-- Add permission_mode column with default 'managed'
ALTER TABLE households
  ADD COLUMN IF NOT EXISTS permission_mode TEXT NOT NULL DEFAULT 'managed'
  CHECK (permission_mode IN ('equal', 'managed', 'family'));

COMMENT ON COLUMN households.permission_mode IS 'Permission strategy: equal (all edit), managed (owners/adults edit), family (parent controls)';

-- ============================================
-- 3. ADD HOUSEHOLD SETTINGS JSONB
-- ============================================

-- Add household_settings for flexible configuration storage
ALTER TABLE households
  ADD COLUMN IF NOT EXISTS household_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN households.household_settings IS 'Flexible settings storage for household preferences and configurations';

-- ============================================
-- 4. ADD CONTRIBUTION TRACKING TO MEAL_ASSIGNMENTS
-- ============================================

-- Add tracking fields for who planned meals and when
ALTER TABLE meal_assignments
  ADD COLUMN IF NOT EXISTS planned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS planned_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for contribution queries
CREATE INDEX IF NOT EXISTS idx_meal_assignments_planned_by ON meal_assignments(planned_by);
CREATE INDEX IF NOT EXISTS idx_meal_assignments_planned_at ON meal_assignments(planned_at DESC);

COMMENT ON COLUMN meal_assignments.planned_by IS 'User who added this meal to the plan';
COMMENT ON COLUMN meal_assignments.planned_at IS 'Timestamp when this meal was planned';

-- ============================================
-- 5. ADD CONTRIBUTION TRACKING TO SHOPPING_LIST_ITEMS
-- ============================================

-- Add tracking for who added shopping list items
ALTER TABLE shopping_list_items
  ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for contribution queries
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_added_by ON shopping_list_items(added_by);

COMMENT ON COLUMN shopping_list_items.added_by IS 'User who added this item to the shopping list';

-- ============================================
-- 6. PERMISSION CHECKING FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Function to check if user can edit meal plans based on household permission mode
CREATE OR REPLACE FUNCTION can_edit_meal_plans(p_user_id UUID, p_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT CASE
    -- Not a household member at all
    WHEN NOT EXISTS (
      SELECT 1 FROM household_members
      WHERE user_id = p_user_id AND household_id = p_household_id
    ) THEN false

    -- Get the household's permission mode and member's role
    ELSE (
      SELECT CASE h.permission_mode
        -- Equal mode: everyone can edit
        WHEN 'equal' THEN true

        -- Managed mode: owners and adults can edit
        WHEN 'managed' THEN hm.role IN ('owner', 'adult')

        -- Family mode: only owners can edit
        WHEN 'family' THEN hm.role = 'owner'

        -- Default to false for safety
        ELSE false
      END
      FROM households h
      INNER JOIN household_members hm ON hm.household_id = h.id
      WHERE h.id = p_household_id
        AND hm.user_id = p_user_id
    )
  END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION can_edit_meal_plans(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION can_edit_meal_plans IS 'Checks if user has permission to edit meal plans based on household permission mode and member role';

-- Function to check if user can manage household settings
CREATE OR REPLACE FUNCTION can_manage_household(p_user_id UUID, p_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE user_id = p_user_id
      AND household_id = p_household_id
      AND role = 'owner'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION can_manage_household(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION can_manage_household IS 'Checks if user is a household owner and can manage household settings';

-- ============================================
-- 7. CONTRIBUTION STATS VIEW
-- ============================================

-- Create view for household contribution statistics
CREATE OR REPLACE VIEW household_contribution_stats AS
SELECT
  hm.household_id,
  hm.user_id,
  p.first_name,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.planned_by = hm.user_id) AS meals_planned,
  COUNT(DISTINCT ch.id) AS meals_cooked,
  COUNT(DISTINCT sli.id) FILTER (WHERE sli.added_by = hm.user_id) AS items_added
FROM household_members hm
LEFT JOIN profiles p ON p.id = hm.user_id
LEFT JOIN meal_assignments ma ON ma.planned_by = hm.user_id
LEFT JOIN cooking_history ch ON ch.user_id = hm.user_id AND ch.household_id = hm.household_id
LEFT JOIN shopping_list_items sli ON sli.added_by = hm.user_id
GROUP BY hm.household_id, hm.user_id, p.first_name;

COMMENT ON VIEW household_contribution_stats IS 'Aggregated contribution statistics per household member';

-- ============================================
-- 8. UPDATE RLS POLICIES FOR MEAL_PLANS
-- ============================================

-- Drop old policies that allowed all household members to edit
DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;

-- Create new policies using the security definer function
CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    can_edit_meal_plans(auth.uid(), household_id)
  );

CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  USING (
    can_edit_meal_plans(auth.uid(), household_id)
  );

CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  USING (
    can_edit_meal_plans(auth.uid(), household_id)
  );

-- ============================================
-- 9. UPDATE RLS POLICIES FOR MEAL_ASSIGNMENTS
-- ============================================

-- Drop old policies for meal assignments
DROP POLICY IF EXISTS "Household members can create meal assignments" ON meal_assignments;
DROP POLICY IF EXISTS "Household members can update meal assignments" ON meal_assignments;
DROP POLICY IF EXISTS "Household members can delete meal assignments" ON meal_assignments;

-- Create new policies using the permission check
CREATE POLICY "Household members can create meal assignments"
  ON meal_assignments FOR INSERT
  WITH CHECK (
    meal_plan_id IN (
      SELECT id FROM meal_plans
      WHERE can_edit_meal_plans(auth.uid(), household_id)
    )
  );

CREATE POLICY "Household members can update meal assignments"
  ON meal_assignments FOR UPDATE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans
      WHERE can_edit_meal_plans(auth.uid(), household_id)
    )
  );

CREATE POLICY "Household members can delete meal assignments"
  ON meal_assignments FOR DELETE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans
      WHERE can_edit_meal_plans(auth.uid(), household_id)
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE household_members IS 'Household membership with role-based permissions (owner, adult, member, child, guest)';
COMMENT ON CONSTRAINT household_members_role_check ON household_members IS 'Valid roles: owner (full control), adult (can edit in managed mode), member (view/edit in equal mode), child (limited access), guest (view only)';
