-- Social Features Phase 1: Private Sharing (Token Links)
-- This migration adds support for recipe sharing via private links

-- ============================================
-- PROFILE EXTENSIONS
-- ============================================

-- Add username and public profile fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT FALSE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- Username validation: lowercase alphanumeric with underscores, 3-30 chars
ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    username ~ '^[a-z0-9_]{3,30}$' AND
    username !~ '^[0-9]' AND
    username NOT IN ('admin', 'moderator', 'support', 'help', 'system', 'official', 'staff', 'null', 'undefined')
  )
);

-- ============================================
-- RECIPE SHARING EXTENSIONS
-- ============================================

-- Add sharing columns to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS original_author_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_recipes_share_token ON recipes(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_original_recipe_id ON recipes(original_recipe_id) WHERE original_recipe_id IS NOT NULL;

-- ============================================
-- SHARE ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'share_link_created', 'copy_recipe', 'signup_from_share')),
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referrer TEXT,
  ip_hash TEXT, -- SHA256 hash for privacy, used for rate limiting
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_recipe_share_events_recipe_id ON recipe_share_events(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_share_events_created_at ON recipe_share_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_share_events_type ON recipe_share_events(event_type);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate secure share token (32 hex characters)
CREATE OR REPLACE FUNCTION generate_recipe_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count with rate limiting
-- Only counts one view per IP per recipe per hour
CREATE OR REPLACE FUNCTION increment_recipe_view(
  p_recipe_id UUID,
  p_ip_hash TEXT,
  p_viewer_id UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_should_count BOOLEAN;
BEGIN
  -- Check if we should count this view (no view from this IP in last hour)
  SELECT NOT EXISTS (
    SELECT 1 FROM recipe_share_events
    WHERE recipe_id = p_recipe_id
    AND ip_hash = p_ip_hash
    AND event_type = 'view'
    AND created_at > NOW() - INTERVAL '1 hour'
  ) INTO v_should_count;

  IF v_should_count THEN
    -- Log the view event
    INSERT INTO recipe_share_events (recipe_id, event_type, viewer_id, ip_hash, referrer, user_agent)
    VALUES (p_recipe_id, 'view', p_viewer_id, p_ip_hash, p_referrer, p_user_agent);

    -- Increment view count
    UPDATE recipes SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_recipe_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on recipe_share_events
ALTER TABLE recipe_share_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view public or token-shared recipes (for guest access)
-- This policy is added via a function to avoid conflicts with existing policies
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Anyone can view public or shared recipes" ON recipes;

  -- Create new policy for public/shared recipe viewing
  CREATE POLICY "Anyone can view public or shared recipes"
    ON recipes FOR SELECT
    USING (
      is_public = TRUE
      OR share_token IS NOT NULL
      OR user_id = auth.uid()
      OR (
        household_id IS NOT NULL
        AND is_shared_with_household = TRUE
        AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = auth.uid()
        )
      )
    );
END $$;

-- Recipe owners can view their share events
CREATE POLICY "Recipe owners can view share events"
  ON recipe_share_events FOR SELECT
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- Anyone can insert view events for viewable recipes (rate limited by function)
CREATE POLICY "Anyone can insert view events"
  ON recipe_share_events FOR INSERT
  WITH CHECK (
    event_type = 'view' AND
    recipe_id IN (
      SELECT id FROM recipes
      WHERE is_public = TRUE OR share_token IS NOT NULL
    )
  );

-- Users can insert their own share/copy events
CREATE POLICY "Users can insert own share events"
  ON recipe_share_events FOR INSERT
  WITH CHECK (
    viewer_id = auth.uid() AND
    event_type IN ('share_link_created', 'copy_recipe')
  );

-- ============================================
-- GRANT PERMISSIONS FOR ANON ACCESS
-- ============================================

-- Allow anonymous users to call view tracking function
GRANT EXECUTE ON FUNCTION increment_recipe_view TO anon;
GRANT EXECUTE ON FUNCTION increment_recipe_view TO authenticated;

-- Allow anonymous users to read public recipes
GRANT SELECT ON recipes TO anon;
