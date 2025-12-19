-- Migration: Drop all review-related tables and functions
-- Reviews have been consolidated into cooking_history

-- Drop functions first (CASCADE will handle triggers)
DROP FUNCTION IF EXISTS get_profile_reviews CASCADE;
DROP FUNCTION IF EXISTS get_recipe_reviews CASCADE;
DROP FUNCTION IF EXISTS notify_on_new_review CASCADE;
DROP FUNCTION IF EXISTS update_review_helpful_count CASCADE;

-- Drop tables (CASCADE will handle policies and foreign keys)
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS review_responses CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
