-- ============================================
-- DROP EXISTING TABLES (if migrating from old schema)
-- Run this FIRST if you have existing tables
-- ============================================

-- WARNING: This will delete all existing data!
-- Only run this if you're starting fresh or have backed up your data.

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS shopping_list_items CASCADE;
DROP TABLE IF EXISTS shopping_lists CASCADE;
DROP TABLE IF EXISTS meal_assignments CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS meal_plan_templates CASCADE;
DROP TABLE IF EXISTS cooking_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS household_invitations CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_household_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_household_member(UUID, UUID) CASCADE;

-- Now you can run 001_initial_schema.sql
