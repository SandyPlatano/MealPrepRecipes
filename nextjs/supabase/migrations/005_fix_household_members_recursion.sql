-- ============================================
-- FIX INFINITE RECURSION IN HOUSEHOLD_MEMBERS POLICY
-- The previous policy caused infinite recursion because
-- household_members SELECT policy referenced household_members itself
-- ============================================

-- Create a security definer function to check household membership
-- This bypasses RLS for the check, avoiding recursion
CREATE OR REPLACE FUNCTION public.get_user_household_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT household_id FROM household_members WHERE user_id = user_uuid;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_household_ids(UUID) TO authenticated;

-- ============================================
-- HOUSEHOLD MEMBERS POLICIES (FIXED)
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Owners can add household members" ON household_members;
DROP POLICY IF EXISTS "Owners can remove household members" ON household_members;

-- Users can view members of their households (using security definer function)
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- Household owners can add members
CREATE POLICY "Owners can add household members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
    OR user_id = auth.uid() -- Users can add themselves (for accepting invites)
  );

-- Household owners can remove members (except themselves)
CREATE POLICY "Owners can remove household members"
  ON household_members FOR DELETE
  USING (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
    OR user_id = auth.uid() -- Members can remove themselves
  );

-- ============================================
-- UPDATE OTHER POLICIES TO USE THE FUNCTION
-- This fixes potential recursion in other tables too
-- ============================================

-- RECIPES: Fix household recipes policy
DROP POLICY IF EXISTS "Users can view household recipes" ON recipes;
CREATE POLICY "Users can view household recipes"
  ON recipes FOR SELECT
  USING (
    is_shared_with_household = true
    AND household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- MEAL PLANS
DROP POLICY IF EXISTS "Household members can view meal plans" ON meal_plans;
CREATE POLICY "Household members can view meal plans"
  ON meal_plans FOR SELECT
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;
CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- SHOPPING LISTS
DROP POLICY IF EXISTS "Household members can view shopping lists" ON shopping_lists;
CREATE POLICY "Household members can view shopping lists"
  ON shopping_lists FOR SELECT
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can create shopping lists" ON shopping_lists;
CREATE POLICY "Household members can create shopping lists"
  ON shopping_lists FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can update shopping lists" ON shopping_lists;
CREATE POLICY "Household members can update shopping lists"
  ON shopping_lists FOR UPDATE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can delete shopping lists" ON shopping_lists;
CREATE POLICY "Household members can delete shopping lists"
  ON shopping_lists FOR DELETE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- MEAL PLAN TEMPLATES
DROP POLICY IF EXISTS "Household members can view templates" ON meal_plan_templates;
CREATE POLICY "Household members can view templates"
  ON meal_plan_templates FOR SELECT
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can create templates" ON meal_plan_templates;
CREATE POLICY "Household members can create templates"
  ON meal_plan_templates FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can update templates" ON meal_plan_templates;
CREATE POLICY "Household members can update templates"
  ON meal_plan_templates FOR UPDATE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Household members can delete templates" ON meal_plan_templates;
CREATE POLICY "Household members can delete templates"
  ON meal_plan_templates FOR DELETE
  USING (
    household_id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- HOUSEHOLDS: Fix view policy
DROP POLICY IF EXISTS "Users can view their households" ON households;
CREATE POLICY "Users can view their households"
  ON households FOR SELECT
  USING (
    id IN (SELECT public.get_user_household_ids(auth.uid()))
  );

-- PROFILES: Fix household member profiles policy
DROP POLICY IF EXISTS "Users can view household member profiles" ON profiles;
CREATE POLICY "Users can view household member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT hm.user_id
      FROM household_members hm
      WHERE hm.household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

-- MEAL ASSIGNMENTS: Update to use function
DROP POLICY IF EXISTS "Household members can view meal assignments" ON meal_assignments;
CREATE POLICY "Household members can view meal assignments"
  ON meal_assignments FOR SELECT
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can create meal assignments" ON meal_assignments;
CREATE POLICY "Household members can create meal assignments"
  ON meal_assignments FOR INSERT
  WITH CHECK (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can update meal assignments" ON meal_assignments;
CREATE POLICY "Household members can update meal assignments"
  ON meal_assignments FOR UPDATE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can delete meal assignments" ON meal_assignments;
CREATE POLICY "Household members can delete meal assignments"
  ON meal_assignments FOR DELETE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

-- SHOPPING LIST ITEMS: Update to use function
DROP POLICY IF EXISTS "Household members can view shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can view shopping list items"
  ON shopping_list_items FOR SELECT
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can create shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can create shopping list items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can update shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can update shopping list items"
  ON shopping_list_items FOR UPDATE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Household members can delete shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can delete shopping list items"
  ON shopping_list_items FOR DELETE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (SELECT public.get_user_household_ids(auth.uid()))
    )
  );
