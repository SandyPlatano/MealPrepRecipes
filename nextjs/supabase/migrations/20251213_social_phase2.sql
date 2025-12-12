-- Phase 2: Public Sharing + Community Gallery
-- This migration adds content moderation, saved recipes, and trending functionality

-- Content moderation: Recipe reports
CREATE TABLE IF NOT EXISTS recipe_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'copyright', 'misleading', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(recipe_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_reports_recipe_id ON recipe_reports(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reports_status ON recipe_reports(status) WHERE status = 'pending';

-- Saved public recipes (users can save recipes from community)
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);

-- Trending recipes cache (refreshed periodically)
CREATE TABLE IF NOT EXISTS trending_recipes_cache (
  recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_recipes_score ON trending_recipes_cache(score DESC);

-- Add hidden_from_public flag to recipes for moderation
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS hidden_from_public BOOLEAN DEFAULT FALSE;

-- RLS Policies

-- Recipe reports: Users can create reports for recipes they don't own
ALTER TABLE recipe_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report public recipes"
  ON recipe_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND EXISTS (
      SELECT 1 FROM recipes
      WHERE id = recipe_id
      AND is_public = TRUE
      AND user_id != auth.uid()
    )
  );

CREATE POLICY "Users can view their own reports"
  ON recipe_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Saved recipes: Users can save/unsave public recipes
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save public recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM recipes
      WHERE id = recipe_id
      AND is_public = TRUE
    )
  );

CREATE POLICY "Users can view their saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Trending cache: Public read access
ALTER TABLE trending_recipes_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trending recipes"
  ON trending_recipes_cache FOR SELECT
  USING (TRUE);

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_view_count INTEGER,
  p_save_count INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  age_days INTEGER;
  decay_factor DECIMAL;
BEGIN
  -- Calculate age in days
  age_days := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 86400;

  -- Decay factor: recipes lose 10% of their score each day
  decay_factor := POWER(0.9, age_days);

  -- Score formula: views + (saves * 5), with decay
  RETURN (COALESCE(p_view_count, 0) + (COALESCE(p_save_count, 0) * 5)) * decay_factor;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to refresh trending cache
CREATE OR REPLACE FUNCTION refresh_trending_cache() RETURNS void AS $$
BEGIN
  -- Clear existing cache
  DELETE FROM trending_recipes_cache;

  -- Insert top trending recipes
  INSERT INTO trending_recipes_cache (recipe_id, score, view_count, save_count, calculated_at)
  SELECT
    r.id,
    calculate_trending_score(r.view_count, COALESCE(s.save_count, 0), r.created_at),
    r.view_count,
    COALESCE(s.save_count, 0),
    NOW()
  FROM recipes r
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as save_count
    FROM saved_recipes
    GROUP BY recipe_id
  ) s ON r.id = s.recipe_id
  WHERE r.is_public = TRUE
    AND r.hidden_from_public = FALSE
    AND r.view_count > 0
  ORDER BY calculate_trending_score(r.view_count, COALESCE(s.save_count, 0), r.created_at) DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if recipe should be auto-hidden (3+ reports)
CREATE OR REPLACE FUNCTION check_recipe_reports() RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM recipe_reports
  WHERE recipe_id = NEW.recipe_id AND status = 'pending';

  IF report_count >= 3 THEN
    UPDATE recipes SET hidden_from_public = TRUE WHERE id = NEW.recipe_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-hide recipes with 3+ reports
DROP TRIGGER IF EXISTS auto_hide_reported_recipes ON recipe_reports;
CREATE TRIGGER auto_hide_reported_recipes
  AFTER INSERT ON recipe_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_recipe_reports();

-- Function to get public recipes with author info
CREATE OR REPLACE FUNCTION get_public_recipes(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_category TEXT DEFAULT NULL,
  p_recipe_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  title TEXT,
  recipe_type TEXT,
  category TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  image_url TEXT,
  view_count INTEGER,
  avg_rating DECIMAL,
  review_count INTEGER,
  created_at TIMESTAMPTZ,
  author_id UUID,
  author_username TEXT,
  author_avatar_url TEXT,
  is_saved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.recipe_type::TEXT,
    r.category,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.image_url,
    r.view_count,
    r.avg_rating,
    r.review_count,
    r.created_at,
    p.id as author_id,
    p.username as author_username,
    p.avatar_url as author_avatar_url,
    CASE WHEN p_user_id IS NOT NULL
      THEN EXISTS (SELECT 1 FROM saved_recipes sr WHERE sr.recipe_id = r.id AND sr.user_id = p_user_id)
      ELSE FALSE
    END as is_saved
  FROM recipes r
  JOIN profiles p ON r.user_id = p.id
  WHERE r.is_public = TRUE
    AND r.hidden_from_public = FALSE
    AND (p_category IS NULL OR r.category = p_category)
    AND (p_recipe_type IS NULL OR r.recipe_type::TEXT = p_recipe_type)
    AND (p_search IS NULL OR r.title ILIKE '%' || p_search || '%')
  ORDER BY r.view_count DESC, r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get trending recipes
CREATE OR REPLACE FUNCTION get_trending_recipes(
  p_limit INTEGER DEFAULT 10,
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  title TEXT,
  recipe_type TEXT,
  category TEXT,
  image_url TEXT,
  view_count INTEGER,
  save_count INTEGER,
  score DECIMAL,
  author_id UUID,
  author_username TEXT,
  author_avatar_url TEXT,
  is_saved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.recipe_type::TEXT,
    r.category,
    r.image_url,
    r.view_count,
    t.save_count::INTEGER,
    t.score,
    p.id as author_id,
    p.username as author_username,
    p.avatar_url as author_avatar_url,
    CASE WHEN p_user_id IS NOT NULL
      THEN EXISTS (SELECT 1 FROM saved_recipes sr WHERE sr.recipe_id = r.id AND sr.user_id = p_user_id)
      ELSE FALSE
    END as is_saved
  FROM trending_recipes_cache t
  JOIN recipes r ON t.recipe_id = r.id
  JOIN profiles p ON r.user_id = p.id
  WHERE r.is_public = TRUE
    AND r.hidden_from_public = FALSE
  ORDER BY t.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
