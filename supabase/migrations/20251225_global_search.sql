-- Global Search RPC Functions
-- Provides fast server-side search for recipes and public profiles

-- =====================================================
-- SEARCH USER RECIPES
-- =====================================================
-- Searches recipes accessible by the user (own + household shared)
-- Uses ILIKE for case-insensitive matching with relevance scoring

CREATE OR REPLACE FUNCTION search_user_recipes(
  p_user_id UUID,
  p_household_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  recipe_type TEXT,
  protein_type TEXT,
  category TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings INT,
  image_url TEXT,
  tags TEXT[],
  relevance_score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.description,
    r.recipe_type,
    r.protein_type,
    r.category,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.image_url,
    r.tags,
    -- Relevance scoring: exact title > prefix > contains > other fields
    CASE
      WHEN LOWER(r.title) = LOWER(p_query) THEN 100
      WHEN LOWER(r.title) LIKE LOWER(p_query) || '%' THEN 80
      WHEN LOWER(r.title) LIKE '%' || LOWER(p_query) || '%' THEN 60
      WHEN LOWER(r.description) LIKE '%' || LOWER(p_query) || '%' THEN 40
      WHEN LOWER(r.protein_type) LIKE '%' || LOWER(p_query) || '%' THEN 30
      WHEN LOWER(r.recipe_type) LIKE '%' || LOWER(p_query) || '%' THEN 30
      WHEN LOWER(r.category) LIKE '%' || LOWER(p_query) || '%' THEN 30
      WHEN EXISTS (SELECT 1 FROM unnest(r.tags) t WHERE LOWER(t) LIKE '%' || LOWER(p_query) || '%') THEN 20
      WHEN EXISTS (SELECT 1 FROM unnest(r.ingredients) i WHERE LOWER(i) LIKE '%' || LOWER(p_query) || '%') THEN 10
      ELSE 0
    END AS relevance_score
  FROM recipes r
  WHERE
    r.household_id = p_household_id
    AND (
      LOWER(r.title) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(r.description) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(r.protein_type) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(r.recipe_type) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(r.category) LIKE '%' || LOWER(p_query) || '%'
      OR EXISTS (SELECT 1 FROM unnest(r.tags) t WHERE LOWER(t) LIKE '%' || LOWER(p_query) || '%')
      OR EXISTS (SELECT 1 FROM unnest(r.ingredients) i WHERE LOWER(i) LIKE '%' || LOWER(p_query) || '%')
    )
  ORDER BY relevance_score DESC, r.title ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEARCH PUBLIC PROFILES
-- =====================================================
-- Searches public user profiles
-- Prioritizes username prefix matches, then by follower count

CREATE OR REPLACE FUNCTION search_public_profiles(
  p_query TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  cooking_philosophy TEXT,
  public_recipe_count BIGINT,
  relevance_score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.bio,
    p.cooking_philosophy,
    (SELECT COUNT(*) FROM recipes r WHERE r.created_by_user_id = p.id AND r.is_public = true) AS public_recipe_count,
    -- Relevance scoring: username prefix > username contains > name matches > bio
    CASE
      WHEN LOWER(p.username) LIKE LOWER(p_query) || '%' THEN 100
      WHEN LOWER(p.username) LIKE '%' || LOWER(p_query) || '%' THEN 80
      WHEN LOWER(p.first_name) LIKE LOWER(p_query) || '%' THEN 60
      WHEN LOWER(p.last_name) LIKE LOWER(p_query) || '%' THEN 60
      WHEN LOWER(p.first_name) LIKE '%' || LOWER(p_query) || '%' THEN 40
      WHEN LOWER(p.last_name) LIKE '%' || LOWER(p_query) || '%' THEN 40
      WHEN LOWER(p.bio) LIKE '%' || LOWER(p_query) || '%' THEN 20
      WHEN LOWER(p.cooking_philosophy) LIKE '%' || LOWER(p_query) || '%' THEN 10
      ELSE 0
    END AS relevance_score
  FROM profiles p
  WHERE
    p.public_profile = true
    AND p.username IS NOT NULL
    AND (
      LOWER(p.username) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.first_name) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.last_name) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.bio) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.cooking_philosophy) LIKE '%' || LOWER(p_query) || '%'
    )
  ORDER BY relevance_score DESC, public_recipe_count DESC, p.username ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_user_recipes TO authenticated;
GRANT EXECUTE ON FUNCTION search_public_profiles TO authenticated;
