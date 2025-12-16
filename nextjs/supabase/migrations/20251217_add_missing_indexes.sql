-- ============================================
-- Add missing indexes for query performance
-- These indexes support common query patterns identified in the codebase
-- ============================================

-- Index for macro tracking queries (nutrition dashboard filters by enabled users)
CREATE INDEX IF NOT EXISTS idx_user_settings_macro_tracking
  ON user_settings(macro_tracking_enabled)
  WHERE macro_tracking_enabled = TRUE;

-- Composite index for recipe nutrition lookups by source (for AI extraction filtering)
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe_source
  ON recipe_nutrition(recipe_id, source);

-- Index for cooking history timeline queries (ordered by date)
CREATE INDEX IF NOT EXISTS idx_cooking_history_recipe_cooked
  ON cooking_history(recipe_id, cooked_at DESC);

-- Index for meal assignments daily lookups (meal planning views)
CREATE INDEX IF NOT EXISTS idx_meal_assignments_day
  ON meal_assignments(meal_plan_id, day_of_week);

-- Index for reviews by rating (for filtering/sorting community recipes)
CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON reviews(recipe_id, rating);

-- Index for activity feed queries (ordered by creation time)
CREATE INDEX IF NOT EXISTS idx_activity_feed_created
  ON activity_feed_events(actor_id, created_at DESC);

-- Index for follows lookup (check if user A follows user B)
CREATE INDEX IF NOT EXISTS idx_follows_pair
  ON follows(follower_id, following_id);
