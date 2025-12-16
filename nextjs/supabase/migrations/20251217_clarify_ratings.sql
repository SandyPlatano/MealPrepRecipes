-- ============================================
-- Document rating semantics to prevent confusion
-- Ratings exist in 3 places with distinct meanings:
-- 1. recipes.rating - Owner's personal rating of their own recipe
-- 2. cooking_history.rating - User's rating from a specific cook session
-- 3. reviews.rating - Public community review rating (aggregated to avg_rating)
-- ============================================

COMMENT ON COLUMN recipes.rating IS
  'Recipe owner personal rating (1-5). This is the creator''s own assessment of their recipe, distinct from public reviews.';

COMMENT ON COLUMN recipes.avg_rating IS
  'Computed average from reviews.rating. Updated by trigger when reviews are added/modified.';

COMMENT ON COLUMN recipes.review_count IS
  'Number of public reviews for this recipe. Updated by trigger.';

COMMENT ON COLUMN cooking_history.rating IS
  'User''s rating from this specific cook session (1-5). Records satisfaction when a recipe was actually cooked.';

COMMENT ON COLUMN reviews.rating IS
  'Public review rating (1-5). Used to calculate recipes.avg_rating for community recipes.';
