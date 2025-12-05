-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can view profiles of household members
DROP POLICY IF EXISTS "Users can view household member profiles" ON profiles;
CREATE POLICY "Users can view household member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT hm2.user_id
      FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid()
    )
  );

-- ============================================
-- HOUSEHOLDS POLICIES
-- ============================================

-- Users can view households they belong to
DROP POLICY IF EXISTS "Users can view their households" ON households;
CREATE POLICY "Users can view their households"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Owners can update their households
DROP POLICY IF EXISTS "Owners can update households" ON households;
CREATE POLICY "Owners can update households"
  ON households FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can create households
DROP POLICY IF EXISTS "Users can create households" ON households;
CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Owners can delete their households
DROP POLICY IF EXISTS "Owners can delete households" ON households;
CREATE POLICY "Owners can delete households"
  ON households FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- HOUSEHOLD MEMBERS POLICIES
-- ============================================

-- Users can view members of their households
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household owners can add members
DROP POLICY IF EXISTS "Owners can add household members" ON household_members;
CREATE POLICY "Owners can add household members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- Users can add themselves (for accepting invites)
  );

-- Household owners can remove members (except themselves)
DROP POLICY IF EXISTS "Owners can remove household members" ON household_members;
CREATE POLICY "Owners can remove household members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- Members can remove themselves
  );

-- ============================================
-- HOUSEHOLD INVITATIONS POLICIES
-- ============================================

-- Inviters can view invitations they sent
DROP POLICY IF EXISTS "Users can view sent invitations" ON household_invitations;
CREATE POLICY "Users can view sent invitations"
  ON household_invitations FOR SELECT
  USING (invited_by = auth.uid());

-- Recipients can view invitations by email
DROP POLICY IF EXISTS "Recipients can view invitations" ON household_invitations;
CREATE POLICY "Recipients can view invitations"
  ON household_invitations FOR SELECT
  USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Anyone can view invitation by token (for accept flow)
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON household_invitations;
CREATE POLICY "Anyone can view invitation by token"
  ON household_invitations FOR SELECT
  USING (true); -- Token lookup handled in application

-- Household owners can create invitations
DROP POLICY IF EXISTS "Owners can create invitations" ON household_invitations;
CREATE POLICY "Owners can create invitations"
  ON household_invitations FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Inviter or recipient can update invitation status
DROP POLICY IF EXISTS "Users can update invitation status" ON household_invitations;
CREATE POLICY "Users can update invitation status"
  ON household_invitations FOR UPDATE
  USING (
    invited_by = auth.uid()
    OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Inviters can delete invitations
DROP POLICY IF EXISTS "Inviters can delete invitations" ON household_invitations;
CREATE POLICY "Inviters can delete invitations"
  ON household_invitations FOR DELETE
  USING (invited_by = auth.uid());

-- ============================================
-- RECIPES POLICIES
-- ============================================

-- Users can view their own recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (user_id = auth.uid());

-- Users can view shared household recipes
DROP POLICY IF EXISTS "Users can view household recipes" ON recipes;
CREATE POLICY "Users can view household recipes"
  ON recipes FOR SELECT
  USING (
    is_shared_with_household = true
    AND household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can create recipes
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own recipes
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own recipes
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FAVORITES POLICIES
-- ============================================

-- Users can view their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove favorites
DROP POLICY IF EXISTS "Users can remove favorites" ON favorites;
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- COOKING HISTORY POLICIES
-- ============================================

-- Users can view their own cooking history
DROP POLICY IF EXISTS "Users can view own cooking history" ON cooking_history;
CREATE POLICY "Users can view own cooking history"
  ON cooking_history FOR SELECT
  USING (user_id = auth.uid());

-- Users can add to cooking history
DROP POLICY IF EXISTS "Users can add cooking history" ON cooking_history;
CREATE POLICY "Users can add cooking history"
  ON cooking_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their cooking history
DROP POLICY IF EXISTS "Users can update cooking history" ON cooking_history;
CREATE POLICY "Users can update cooking history"
  ON cooking_history FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their cooking history
DROP POLICY IF EXISTS "Users can delete cooking history" ON cooking_history;
CREATE POLICY "Users can delete cooking history"
  ON cooking_history FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- MEAL PLANS POLICIES
-- ============================================

-- Household members can view meal plans
DROP POLICY IF EXISTS "Household members can view meal plans" ON meal_plans;
CREATE POLICY "Household members can view meal plans"
  ON meal_plans FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create meal plans
DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update meal plans
DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete meal plans
DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;
CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- MEAL ASSIGNMENTS POLICIES
-- ============================================

-- Household members can view meal assignments
DROP POLICY IF EXISTS "Household members can view meal assignments" ON meal_assignments;
CREATE POLICY "Household members can view meal assignments"
  ON meal_assignments FOR SELECT
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can create meal assignments
DROP POLICY IF EXISTS "Household members can create meal assignments" ON meal_assignments;
CREATE POLICY "Household members can create meal assignments"
  ON meal_assignments FOR INSERT
  WITH CHECK (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can update meal assignments
DROP POLICY IF EXISTS "Household members can update meal assignments" ON meal_assignments;
CREATE POLICY "Household members can update meal assignments"
  ON meal_assignments FOR UPDATE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can delete meal assignments
DROP POLICY IF EXISTS "Household members can delete meal assignments" ON meal_assignments;
CREATE POLICY "Household members can delete meal assignments"
  ON meal_assignments FOR DELETE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- SHOPPING LISTS POLICIES
-- ============================================

-- Household members can view shopping lists
DROP POLICY IF EXISTS "Household members can view shopping lists" ON shopping_lists;
CREATE POLICY "Household members can view shopping lists"
  ON shopping_lists FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create shopping lists
DROP POLICY IF EXISTS "Household members can create shopping lists" ON shopping_lists;
CREATE POLICY "Household members can create shopping lists"
  ON shopping_lists FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update shopping lists
DROP POLICY IF EXISTS "Household members can update shopping lists" ON shopping_lists;
CREATE POLICY "Household members can update shopping lists"
  ON shopping_lists FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete shopping lists
DROP POLICY IF EXISTS "Household members can delete shopping lists" ON shopping_lists;
CREATE POLICY "Household members can delete shopping lists"
  ON shopping_lists FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- SHOPPING LIST ITEMS POLICIES
-- ============================================

-- Household members can view shopping list items
DROP POLICY IF EXISTS "Household members can view shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can view shopping list items"
  ON shopping_list_items FOR SELECT
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can create shopping list items
DROP POLICY IF EXISTS "Household members can create shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can create shopping list items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can update shopping list items
DROP POLICY IF EXISTS "Household members can update shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can update shopping list items"
  ON shopping_list_items FOR UPDATE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can delete shopping list items
DROP POLICY IF EXISTS "Household members can delete shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can delete shopping list items"
  ON shopping_list_items FOR DELETE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- MEAL PLAN TEMPLATES POLICIES
-- ============================================

-- Household members can view templates
DROP POLICY IF EXISTS "Household members can view templates" ON meal_plan_templates;
CREATE POLICY "Household members can view templates"
  ON meal_plan_templates FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create templates
DROP POLICY IF EXISTS "Household members can create templates" ON meal_plan_templates;
CREATE POLICY "Household members can create templates"
  ON meal_plan_templates FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update templates
DROP POLICY IF EXISTS "Household members can update templates" ON meal_plan_templates;
CREATE POLICY "Household members can update templates"
  ON meal_plan_templates FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete templates
DROP POLICY IF EXISTS "Household members can delete templates" ON meal_plan_templates;
CREATE POLICY "Household members can delete templates"
  ON meal_plan_templates FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- USER SETTINGS POLICIES
-- ============================================

-- Users can view their own settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own settings
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables for authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limited access for anonymous users (for invite token lookup)
GRANT SELECT ON household_invitations TO anon;
