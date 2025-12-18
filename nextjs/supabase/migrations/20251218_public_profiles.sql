-- ============================================================================
-- PUBLIC PROFILES - Quirky social cooking network
-- "Bonding over food" - customizable, fun user profiles
-- ============================================================================

-- Add public profile customization fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS cooking_philosophy TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS favorite_cuisine TEXT,
  ADD COLUMN IF NOT EXISTS cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'home_cook', 'enthusiast', 'semi_pro', 'professional')),
  ADD COLUMN IF NOT EXISTS cook_with_me_status TEXT DEFAULT 'not_set' CHECK (cook_with_me_status IN ('not_set', 'open', 'busy', 'looking_for_partner')),
  ADD COLUMN IF NOT EXISTS currently_craving TEXT,
  ADD COLUMN IF NOT EXISTS profile_theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS profile_emoji TEXT DEFAULT '👨‍🍳';

-- Add profile privacy toggles (what sections are visible on public profile)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_cooking_stats BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_badges BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_cook_photos BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_saved_recipes BOOLEAN DEFAULT FALSE;

-- Create indexes for profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_public_profile ON profiles(public_profile) WHERE public_profile = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_username_public ON profiles(username) WHERE username IS NOT NULL AND public_profile = TRUE;

-- ============================================================================
-- GET PUBLIC PROFILE FUNCTION
-- Returns full public profile data by username
-- ============================================================================

CREATE OR REPLACE FUNCTION get_public_profile(p_username TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  cooking_philosophy TEXT,
  location TEXT,
  website TEXT,
  favorite_cuisine TEXT,
  cooking_skill TEXT,
  cook_with_me_status TEXT,
  currently_craving TEXT,
  profile_theme TEXT,
  profile_emoji TEXT,
  follower_count INTEGER,
  following_count INTEGER,
  public_recipe_count INTEGER,
  total_cooks INTEGER,
  created_at TIMESTAMPTZ,
  show_cooking_stats BOOLEAN,
  show_badges BOOLEAN,
  show_cook_photos BOOLEAN,
  show_reviews BOOLEAN,
  show_saved_recipes BOOLEAN
) AS $$
DECLARE
  v_profile_id UUID;
  v_public_profile BOOLEAN;
BEGIN
  -- First check if profile exists and is public
  SELECT p.id, p.public_profile
  INTO v_profile_id, v_public_profile
  FROM profiles p
  WHERE p.username = p_username;

  -- Return empty if not found or not public
  IF v_profile_id IS NULL OR v_public_profile = FALSE THEN
    RETURN;
  END IF;

  -- Return full profile data
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.cover_image_url,
    p.bio,
    p.cooking_philosophy,
    p.location,
    p.website,
    p.favorite_cuisine,
    p.cooking_skill,
    COALESCE(p.cook_with_me_status, 'not_set') AS cook_with_me_status,
    p.currently_craving,
    COALESCE(p.profile_theme, 'default') AS profile_theme,
    COALESCE(p.profile_emoji, '👨‍🍳') AS profile_emoji,
    COALESCE(p.follower_count, 0) AS follower_count,
    COALESCE(p.following_count, 0) AS following_count,
    (
      SELECT COUNT(*)::INTEGER
      FROM recipes r
      WHERE r.user_id = v_profile_id
        AND r.is_public = TRUE
        AND r.hidden_from_public = FALSE
    ) AS public_recipe_count,
    (
      SELECT COUNT(*)::INTEGER
      FROM cooking_history ch
      WHERE ch.user_id = v_profile_id
    ) AS total_cooks,
    p.created_at,
    COALESCE(p.show_cooking_stats, TRUE) AS show_cooking_stats,
    COALESCE(p.show_badges, TRUE) AS show_badges,
    COALESCE(p.show_cook_photos, TRUE) AS show_cook_photos,
    COALESCE(p.show_reviews, TRUE) AS show_reviews,
    COALESCE(p.show_saved_recipes, FALSE) AS show_saved_recipes
  FROM profiles p
  WHERE p.id = v_profile_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- GET USER PUBLIC RECIPES
-- Returns public recipes for a profile page
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_public_recipes_for_profile(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 12,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  image_url TEXT,
  recipe_type TEXT,
  category TEXT,
  avg_rating NUMERIC,
  review_count INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.image_url,
    r.recipe_type,
    r.category,
    r.avg_rating,
    COALESCE(r.review_count, 0) AS review_count,
    COALESCE(r.view_count, 0) AS view_count,
    r.created_at
  FROM recipes r
  WHERE r.user_id = p_user_id
    AND r.is_public = TRUE
    AND r.hidden_from_public = FALSE
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- GET PROFILE COOK PHOTOS (I Made It photos with high ratings)
-- Returns cooking history entries with photos
-- ============================================================================

CREATE OR REPLACE FUNCTION get_profile_cook_photos(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  photo_url TEXT,
  caption TEXT,
  recipe_id UUID,
  recipe_title TEXT,
  recipe_image_url TEXT,
  created_at TIMESTAMPTZ,
  rating INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ch.id,
    ch.photo_url,
    ch.notes AS caption,
    ch.recipe_id,
    r.title AS recipe_title,
    r.image_url AS recipe_image_url,
    ch.cooked_at AS created_at,
    ch.rating
  FROM cooking_history ch
  INNER JOIN recipes r ON r.id = ch.recipe_id
  WHERE ch.user_id = p_user_id
    AND ch.photo_url IS NOT NULL
    AND r.is_public = TRUE -- Only show photos of public recipes
  ORDER BY ch.cooked_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- GET PROFILE REVIEWS
-- Returns reviews written by the user (for public recipes)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_profile_reviews(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  recipe_id UUID,
  recipe_title TEXT,
  recipe_image_url TEXT,
  rating INTEGER,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  helpful_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rr.id,
    rr.recipe_id,
    r.title AS recipe_title,
    r.image_url AS recipe_image_url,
    rr.rating,
    rr.title,
    rr.content,
    rr.created_at,
    COALESCE(rr.helpful_count, 0) AS helpful_count
  FROM recipe_reviews rr
  INNER JOIN recipes r ON r.id = rr.recipe_id
  WHERE rr.user_id = p_user_id
    AND r.is_public = TRUE
  ORDER BY rr.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN profiles.cooking_philosophy IS 'User cooking philosophy or motto (e.g., "Life is too short for boring food")';
COMMENT ON COLUMN profiles.cook_with_me_status IS 'Availability status for cooking together/meal swaps';
COMMENT ON COLUMN profiles.currently_craving IS 'What the user is currently craving (displayed with food emoji)';
COMMENT ON COLUMN profiles.profile_theme IS 'Color theme for profile page (default|forest|ocean|sunset|midnight)';
COMMENT ON COLUMN profiles.profile_emoji IS 'Profile emoji displayed with avatar';
COMMENT ON FUNCTION get_public_profile IS 'Fetches full public profile by username, returns empty if private';
COMMENT ON FUNCTION get_user_public_recipes_for_profile IS 'Gets public recipes for profile display';
COMMENT ON FUNCTION get_profile_cook_photos IS 'Gets I Made It photos for profile gallery';
COMMENT ON FUNCTION get_profile_reviews IS 'Gets user reviews for profile display';
