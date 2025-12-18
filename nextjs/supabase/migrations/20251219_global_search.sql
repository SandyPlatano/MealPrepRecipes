-- ============================================================================
-- Global Search Functions
-- ============================================================================
-- Provides server-side search for recipes and public profiles.
-- Uses ILIKE for case-insensitive matching with simple relevance scoring.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Search User Recipes
-- ----------------------------------------------------------------------------
-- Searches recipes accessible to the user (own + household shared)
-- Returns results ranked by relevance score
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_user_recipes(
  p_user_id UUID,
  p_household_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 8
) RETURNS TABLE (
  id UUID,
  title TEXT,
  recipe_type TEXT,
  category TEXT,
  image_url TEXT,
  protein_type TEXT,
  relevance REAL
) AS $$
DECLARE
  v_query TEXT;
BEGIN
  -- Sanitize and prepare query
  v_query := TRIM(p_query);

  -- Return empty if query is too short
  IF LENGTH(v_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.title::TEXT,
    r.recipe_type::TEXT,
    r.category::TEXT,
    r.image_url::TEXT,
    r.protein_type::TEXT,
    -- Simple relevance scoring:
    -- 1.0 = exact title match
    -- 0.9 = title starts with query
    -- 0.7 = title contains query
    -- 0.5 = other field match
    CASE
      WHEN LOWER(r.title) = LOWER(v_query) THEN 1.0
      WHEN LOWER(r.title) LIKE LOWER(v_query) || '%' THEN 0.9
      WHEN LOWER(r.title) LIKE '%' || LOWER(v_query) || '%' THEN 0.7
      ELSE 0.5
    END::REAL AS relevance
  FROM recipes r
  WHERE
    -- Access control: user's own recipes OR household shared recipes
    (
      r.user_id = p_user_id
      OR (
        p_household_id IS NOT NULL
        AND r.household_id = p_household_id
        AND r.is_shared_with_household = TRUE
      )
    )
    -- Search across multiple fields
    AND (
      r.title ILIKE '%' || v_query || '%'
      OR r.description ILIKE '%' || v_query || '%'
      OR r.protein_type ILIKE '%' || v_query || '%'
      OR r.recipe_type::TEXT ILIKE '%' || v_query || '%'
      OR r.category ILIKE '%' || v_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(r.tags) t WHERE t ILIKE '%' || v_query || '%'
      )
      OR EXISTS (
        SELECT 1 FROM unnest(r.ingredients) i WHERE i ILIKE '%' || v_query || '%'
      )
    )
  ORDER BY relevance DESC, r.title ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_user_recipes(UUID, UUID, TEXT, INTEGER) TO authenticated;

-- ----------------------------------------------------------------------------
-- Search Public Profiles
-- ----------------------------------------------------------------------------
-- Searches public profiles for social discovery
-- Prioritizes username prefix matches, then ranks by follower count
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_public_profiles(
  p_query TEXT,
  p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  public_recipe_count INTEGER
) AS $$
DECLARE
  v_query TEXT;
BEGIN
  -- Sanitize and prepare query
  v_query := TRIM(p_query);

  -- Return empty if query is too short
  IF LENGTH(v_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username::TEXT,
    p.first_name::TEXT,
    p.last_name::TEXT,
    p.avatar_url::TEXT,
    p.bio::TEXT,
    (
      SELECT COUNT(*)::INTEGER
      FROM recipes r
      WHERE r.user_id = p.id AND r.is_public = TRUE
    ) AS public_recipe_count
  FROM profiles p
  WHERE
    p.public_profile = TRUE
    AND p.username IS NOT NULL
    AND (
      p.username ILIKE '%' || v_query || '%'
      OR p.first_name ILIKE '%' || v_query || '%'
      OR p.last_name ILIKE '%' || v_query || '%'
      OR p.bio ILIKE '%' || v_query || '%'
      OR p.cooking_philosophy ILIKE '%' || v_query || '%'
    )
  ORDER BY
    -- Prioritize username prefix matches
    CASE WHEN p.username ILIKE v_query || '%' THEN 0 ELSE 1 END,
    -- Then by follower count
    p.follower_count DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_public_profiles(TEXT, INTEGER) TO authenticated;

-- ----------------------------------------------------------------------------
-- Add comment for documentation
-- ----------------------------------------------------------------------------

COMMENT ON FUNCTION search_user_recipes IS 'Search recipes accessible to user (own + household shared) with relevance ranking';
COMMENT ON FUNCTION search_public_profiles IS 'Search public profiles for social discovery';
