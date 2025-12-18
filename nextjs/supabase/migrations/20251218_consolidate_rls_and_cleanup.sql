-- ============================================
-- CONSOLIDATE RLS POLICIES & CLEAN UP INDEXES
-- Fixes multiple permissive policies warnings
-- Addresses security vulnerability in household_invitations
-- ============================================

-- ============================================
-- 1. FIX HOUSEHOLD_INVITATIONS (CRITICAL SECURITY)
-- ============================================
-- Current issue: USING (true) policy exposes ALL invitations to anyone
-- Solution: Consolidate into single authenticated policy + SECURITY DEFINER function for token lookup

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view sent invitations" ON household_invitations;
DROP POLICY IF EXISTS "Recipients can view invitations" ON household_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON household_invitations;

-- Create consolidated SELECT policy for authenticated users
-- Note: Wrap auth.uid() in (SELECT ...) to prevent re-evaluation per row
CREATE POLICY "Users can view invitations"
  ON household_invitations FOR SELECT
  TO authenticated
  USING (
    -- User sent the invitation
    invited_by = (SELECT auth.uid())
    -- OR invitation is addressed to user's email
    OR email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
  );

-- SECURITY DEFINER function for safe token lookup (bypasses RLS)
-- This allows authenticated users to look up a specific invitation by token
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  household_id UUID,
  email TEXT,
  invited_by UUID,
  status TEXT,
  expires_at TIMESTAMPTZ,
  household_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hi.id,
    hi.household_id,
    hi.email,
    hi.invited_by,
    hi.status,
    hi.expires_at,
    h.name as household_name
  FROM household_invitations hi
  JOIN households h ON h.id = hi.household_id
  WHERE hi.token = p_token
    AND hi.status = 'pending'
    AND hi.expires_at > NOW();
END;
$$;

-- Grant execute to authenticated users only (invite page requires auth)
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT) TO authenticated;

-- Revoke anon SELECT on household_invitations (was incorrectly granted)
REVOKE SELECT ON household_invitations FROM anon;

-- ============================================
-- 2. FIX MEAL_PLAN_TEMPLATES
-- ============================================
-- Current: 3 SELECT policies for same role causes multiple evaluations
-- Solution: Consolidate into single policy with OR conditions

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Household members can view templates" ON meal_plan_templates;
DROP POLICY IF EXISTS "Users can view household templates" ON meal_plan_templates;
DROP POLICY IF EXISTS "Users can view public templates" ON meal_plan_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON meal_plan_templates;

-- Create consolidated SELECT policy for authenticated users
-- Note: Wrap auth.uid() in (SELECT ...) to prevent re-evaluation per row
CREATE POLICY "Users can view templates"
  ON meal_plan_templates FOR SELECT
  TO authenticated
  USING (
    -- Own templates
    user_id = (SELECT auth.uid())
    -- Household templates
    OR household_id IN (
      SELECT household_id FROM household_members WHERE user_id = (SELECT auth.uid())
    )
    -- Public templates
    OR is_public = true
  );

-- Public templates viewable by anyone (anon users browsing public templates)
CREATE POLICY "Anyone can view public templates"
  ON meal_plan_templates FOR SELECT
  TO anon
  USING (is_public = true);

-- ============================================
-- 3. FIX MEMBER_DIETARY_PROFILES
-- ============================================
-- Current: FOR ALL policy + separate SELECT policy creates overlap
-- Solution: Replace with specific policies for each operation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own dietary profiles" ON member_dietary_profiles;
DROP POLICY IF EXISTS "Household members can view dietary profiles" ON member_dietary_profiles;

-- Consolidated SELECT policy (own + household members can view)
-- Note: Wrap auth.uid() in (SELECT ...) to prevent re-evaluation per row
CREATE POLICY "Users can view dietary profiles"
  ON member_dietary_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR household_id IN (
      SELECT household_id FROM household_members WHERE user_id = (SELECT auth.uid())
    )
  );

-- INSERT: Only own profiles
CREATE POLICY "Users can insert own dietary profiles"
  ON member_dietary_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE: Only own profiles
CREATE POLICY "Users can update own dietary profiles"
  ON member_dietary_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- DELETE: Only own profiles
CREATE POLICY "Users can delete own dietary profiles"
  ON member_dietary_profiles FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================
-- 4. DROP UNUSED INDEXES
-- ============================================
-- These indexes have never been used according to Supabase advisor
-- Removing them improves write performance

-- user_settings
DROP INDEX IF EXISTS idx_user_settings_macro_tracking;
DROP INDEX IF EXISTS idx_user_settings_preferences_v2;

-- recipe_folders
DROP INDEX IF EXISTS idx_recipe_folders_parent_id;
DROP INDEX IF EXISTS idx_recipe_folders_created_by;
DROP INDEX IF EXISTS idx_recipe_folders_is_smart;
DROP INDEX IF EXISTS idx_recipe_folders_category_id;
DROP INDEX IF EXISTS idx_recipe_folders_cover_recipe_id;

-- recipe_folder_members
DROP INDEX IF EXISTS idx_recipe_folder_members_recipe_id;
DROP INDEX IF EXISTS idx_recipe_folder_members_added_by_user_id;

-- cooking_history
DROP INDEX IF EXISTS idx_cooking_history_recipe_cooked;
DROP INDEX IF EXISTS idx_cooking_history_cooked_by;

-- custom_recipe_types
DROP INDEX IF EXISTS idx_custom_recipe_types_household;

-- recipes
DROP INDEX IF EXISTS idx_recipes_recipe_type_id;
DROP INDEX IF EXISTS idx_recipes_recipe_type;
DROP INDEX IF EXISTS idx_recipes_title;
DROP INDEX IF EXISTS idx_recipes_base_servings;
DROP INDEX IF EXISTS idx_recipes_is_public;
DROP INDEX IF EXISTS idx_recipes_original_recipe_id;
DROP INDEX IF EXISTS idx_recipes_lifecycle_stage;
DROP INDEX IF EXISTS idx_recipes_original_author_id;

-- meal_plans
DROP INDEX IF EXISTS idx_meal_plans_sent_at;
DROP INDEX IF EXISTS idx_meal_plans_household_id;
DROP INDEX IF EXISTS idx_meal_plans_week_start;

-- meal_assignments
DROP INDEX IF EXISTS idx_meal_assignments_day;
DROP INDEX IF EXISTS idx_meal_assignments_meal_type;
DROP INDEX IF EXISTS idx_meal_assignments_meal_type_id;
DROP INDEX IF EXISTS idx_meal_assignments_planned_by;
DROP INDEX IF EXISTS idx_meal_assignments_planned_at;
DROP INDEX IF EXISTS idx_meal_assignments_recipe_id;

-- macro_presets
DROP INDEX IF EXISTS idx_macro_presets_user_id;

-- custom_recipe_field_definitions
DROP INDEX IF EXISTS idx_custom_field_definitions_household;

-- custom_recipe_field_values
DROP INDEX IF EXISTS idx_custom_field_values_recipe;
DROP INDEX IF EXISTS idx_custom_field_values_field;
DROP INDEX IF EXISTS idx_custom_field_values_value;

-- pantry_items
DROP INDEX IF EXISTS idx_pantry_items_household;

-- pantry_scans
DROP INDEX IF EXISTS idx_pantry_scans_created_at;
DROP INDEX IF EXISTS idx_pantry_scans_status;

-- recipe_nutrition
DROP INDEX IF EXISTS idx_recipe_nutrition_source;
DROP INDEX IF EXISTS idx_recipe_nutrition_confidence;
DROP INDEX IF EXISTS idx_recipe_nutrition_cost;

-- nutrition_extraction_queue
DROP INDEX IF EXISTS idx_nutrition_extraction_queue_status_priority;

-- daily_nutrition_logs
DROP INDEX IF EXISTS idx_daily_logs_completeness;

-- profiles
DROP INDEX IF EXISTS idx_profiles_username;
DROP INDEX IF EXISTS idx_profiles_is_admin;
DROP INDEX IF EXISTS idx_profiles_public_profile;
DROP INDEX IF EXISTS idx_profiles_username_public;
DROP INDEX IF EXISTS idx_profiles_featured_recipe_id;

-- recipe_share_events
DROP INDEX IF EXISTS idx_recipe_share_events_created_at;
DROP INDEX IF EXISTS idx_recipe_share_events_viewer_id;

-- reviews
DROP INDEX IF EXISTS idx_reviews_rating;

-- recipe_reports
DROP INDEX IF EXISTS idx_recipe_reports_status;
DROP INDEX IF EXISTS idx_recipe_reports_reporter_id;
DROP INDEX IF EXISTS idx_recipe_reports_reviewed_by;

-- follows
DROP INDEX IF EXISTS idx_follows_follower_id;

-- activity_feed_events
DROP INDEX IF EXISTS idx_activity_feed_actor_id;
DROP INDEX IF EXISTS idx_activity_feed_created_at;
DROP INDEX IF EXISTS idx_activity_feed_public;
DROP INDEX IF EXISTS idx_activity_feed_events_recipe_id;

-- custom_ingredient_categories
DROP INDEX IF EXISTS idx_custom_ingredient_categories_parent;
DROP INDEX IF EXISTS idx_custom_ingredient_categories_household;

-- custom_meal_types
DROP INDEX IF EXISTS idx_custom_meal_types_household;

-- nutrition_quick_adds
DROP INDEX IF EXISTS idx_nutrition_quick_adds_date;

-- shopping_list_items
DROP INDEX IF EXISTS idx_shopping_list_items_category_id;
DROP INDEX IF EXISTS idx_shopping_list_items_added_by;
DROP INDEX IF EXISTS idx_shopping_items_substituted;
DROP INDEX IF EXISTS idx_shopping_list_items_substitution_log_id;

-- automation_rules
DROP INDEX IF EXISTS idx_automation_rules_household;
DROP INDEX IF EXISTS idx_automation_rules_trigger;
DROP INDEX IF EXISTS idx_automation_rules_enabled;

-- automation_runs
DROP INDEX IF EXISTS idx_automation_runs_rule;
DROP INDEX IF EXISTS idx_automation_runs_status;
DROP INDEX IF EXISTS idx_automation_runs_executed;

-- dashboard_layouts
DROP INDEX IF EXISTS idx_dashboard_layouts_user;
DROP INDEX IF EXISTS idx_dashboard_layouts_active;

-- recipe_lifecycle_stages
DROP INDEX IF EXISTS idx_lifecycle_stages_household;
DROP INDEX IF EXISTS idx_lifecycle_stages_sort;

-- recipe_moods
DROP INDEX IF EXISTS idx_recipe_moods_household;
DROP INDEX IF EXISTS idx_recipe_moods_sort;

-- recipe_mood_assignments
DROP INDEX IF EXISTS idx_mood_assignments_recipe;
DROP INDEX IF EXISTS idx_mood_assignments_mood;

-- grocery_stores
DROP INDEX IF EXISTS idx_grocery_stores_household;
DROP INDEX IF EXISTS idx_grocery_stores_default;

-- ingredient_prices
DROP INDEX IF EXISTS idx_ingredient_prices_household;
DROP INDEX IF EXISTS idx_ingredient_prices_ingredient;
DROP INDEX IF EXISTS idx_ingredient_prices_store;

-- recipe_costs
DROP INDEX IF EXISTS idx_recipe_costs_recipe;

-- meal_plan_templates
DROP INDEX IF EXISTS idx_meal_plan_templates_household;
DROP INDEX IF EXISTS idx_meal_plan_templates_user;
DROP INDEX IF EXISTS idx_meal_plan_templates_public;
DROP INDEX IF EXISTS idx_meal_plan_templates_tags;

-- meal_plan_template_ratings
DROP INDEX IF EXISTS idx_template_ratings_template;
DROP INDEX IF EXISTS idx_meal_plan_template_ratings_user_id;

-- meal_plan_template_usage
DROP INDEX IF EXISTS idx_template_usage_template;
DROP INDEX IF EXISTS idx_template_usage_user;

-- cooking_schedules
DROP INDEX IF EXISTS idx_cooking_schedules_household;
DROP INDEX IF EXISTS idx_cooking_schedules_assigned_user_id;

-- quick_cook_logs
DROP INDEX IF EXISTS idx_quick_cook_logs_user_id;
DROP INDEX IF EXISTS idx_quick_cook_logs_household_id;
DROP INDEX IF EXISTS idx_quick_cook_logs_created_at;

-- member_dietary_profiles
DROP INDEX IF EXISTS idx_member_dietary_profiles_household;

-- household_activities
DROP INDEX IF EXISTS idx_household_activities_feed;
DROP INDEX IF EXISTS idx_household_activities_user;

-- prep_sessions
DROP INDEX IF EXISTS idx_prep_sessions_user_status;

-- prep_session_recipes
DROP INDEX IF EXISTS idx_prep_session_recipes_recipe;
DROP INDEX IF EXISTS idx_prep_session_recipes_household_id;

-- substitution_logs
DROP INDEX IF EXISTS idx_substitution_logs_household;
DROP INDEX IF EXISTS idx_substitution_logs_ingredient;
DROP INDEX IF EXISTS idx_substitution_logs_created_at;
DROP INDEX IF EXISTS idx_substitution_logs_user_created;
DROP INDEX IF EXISTS idx_substitution_logs_recipe_id;

-- container_inventory
DROP INDEX IF EXISTS idx_container_inventory_household;
DROP INDEX IF EXISTS idx_container_inventory_type;

-- week_variety_scores
DROP INDEX IF EXISTS idx_week_variety_scores_lookup;

-- waste_metrics
DROP INDEX IF EXISTS idx_waste_metrics_household;
DROP INDEX IF EXISTS idx_waste_metrics_week;

-- waste_achievements
DROP INDEX IF EXISTS idx_waste_achievements_type;

-- social_notifications
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_notifications_user_all;
DROP INDEX IF EXISTS idx_notifications_group;
DROP INDEX IF EXISTS idx_social_notifications_actor_id;

-- user_feedback
DROP INDEX IF EXISTS idx_user_feedback_user_id;
DROP INDEX IF EXISTS idx_user_feedback_created_at;

-- voice_cooking_sessions
DROP INDEX IF EXISTS idx_voice_sessions_recipe;
DROP INDEX IF EXISTS idx_voice_sessions_household;
DROP INDEX IF EXISTS idx_voice_cooking_sessions_cooking_history_id;

-- voice_session_timers
DROP INDEX IF EXISTS idx_session_timers_session;
DROP INDEX IF EXISTS idx_session_timers_active;

-- voice_session_events
DROP INDEX IF EXISTS idx_voice_events_session;
DROP INDEX IF EXISTS idx_voice_events_type;
DROP INDEX IF EXISTS idx_voice_events_errors;
DROP INDEX IF EXISTS idx_voice_session_events_timer_id;

-- cooking_streaks
DROP INDEX IF EXISTS idx_cooking_streaks_current;
DROP INDEX IF EXISTS idx_cooking_streaks_longest;
DROP INDEX IF EXISTS idx_cooking_streaks_total;

-- user_badges
DROP INDEX IF EXISTS idx_user_badges_user;
DROP INDEX IF EXISTS idx_user_badges_featured;
DROP INDEX IF EXISTS idx_user_badges_earned;
DROP INDEX IF EXISTS idx_user_badges_badge_id;

-- cook_photos
DROP INDEX IF EXISTS idx_cook_photos_recipe;
DROP INDEX IF EXISTS idx_cook_photos_user;
DROP INDEX IF EXISTS idx_cook_photos_public;
DROP INDEX IF EXISTS idx_cook_photos_cooking_history_id;

-- cook_photo_likes
DROP INDEX IF EXISTS idx_cook_photo_likes_user_id;

-- cooking_buddies
DROP INDEX IF EXISTS idx_cooking_buddies_buddy_id;

-- favorites
DROP INDEX IF EXISTS idx_favorites_recipe_id;

-- folder_categories
DROP INDEX IF EXISTS idx_folder_categories_created_by_user_id;

-- household_invitations
DROP INDEX IF EXISTS idx_household_invitations_household_id;
DROP INDEX IF EXISTS idx_household_invitations_invited_by;

-- households
DROP INDEX IF EXISTS idx_households_owner_id;

-- public_collections
DROP INDEX IF EXISTS idx_public_collections_user;
DROP INDEX IF EXISTS idx_public_collections_popular;

-- public_collection_recipes
DROP INDEX IF EXISTS idx_public_collection_recipes_recipe_id;

-- custom_nutrition_badges
DROP INDEX IF EXISTS idx_custom_nutrition_badges_created_by;

-- review_helpful_votes
DROP INDEX IF EXISTS idx_review_helpful_votes_user_id;

-- review_responses
DROP INDEX IF EXISTS idx_review_responses_user_id;

-- saved_collections
DROP INDEX IF EXISTS idx_saved_collections_collection_id;

-- shopping_lists
DROP INDEX IF EXISTS idx_shopping_lists_household_id;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION get_invitation_by_token(TEXT) IS 'Safely retrieves invitation by token for authenticated users. Uses SECURITY DEFINER to bypass RLS.';
