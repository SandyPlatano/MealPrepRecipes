-- Phase 3: Reviews and Following System
-- This migration adds reviews, helpful votes, responses, follows, and activity feed

-- ============================================
-- REVIEWS TABLES
-- ============================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  photo_url TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_recipe_id ON reviews(recipe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- Review responses (recipe owner can respond to reviews)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOLLOWING TABLES
-- ============================================

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- ============================================
-- ACTIVITY FEED TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_recipe', 'review', 'cook_logged')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_actor_id ON activity_feed_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed_events(is_public) WHERE is_public = TRUE;

-- ============================================
-- PROFILE EXTENSIONS FOR COUNTS
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Reviews: Anyone can read, only authenticated users can write their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews on public recipes"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id
      AND (r.is_public = TRUE OR r.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reviews on public recipes they don't own"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id
      AND r.is_public = TRUE
      AND r.user_id != auth.uid()
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review helpful votes
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on reviews"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM reviews r WHERE r.id = review_id AND r.user_id != auth.uid()
    )
  );

CREATE POLICY "Users can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can remove their own votes"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Review responses
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review responses"
  ON review_responses FOR SELECT
  USING (TRUE);

CREATE POLICY "Recipe owners can respond to reviews"
  ON review_responses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM reviews rv
      JOIN recipes r ON rv.recipe_id = r.id
      WHERE rv.id = review_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own responses"
  ON review_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON review_responses FOR DELETE
  USING (auth.uid() = user_id);

-- Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Activity feed events
ALTER TABLE activity_feed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public activity or from people they follow"
  ON activity_feed_events FOR SELECT
  USING (
    is_public = TRUE
    OR actor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid() AND following_id = actor_id
    )
  );

CREATE POLICY "Users can create their own activity events"
  ON activity_feed_events FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- ============================================
-- TRIGGERS FOR COUNT UPDATES
-- ============================================

-- Update helpful_count on reviews when votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_helpful_votes;
CREATE TRIGGER trigger_update_review_helpful_count
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Update follower/following counts when follows change
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Update recipe avg_rating and review_count when reviews change
CREATE OR REPLACE FUNCTION update_recipe_review_stats() RETURNS TRIGGER AS $$
DECLARE
  target_recipe_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_recipe_id := OLD.recipe_id;
  ELSE
    target_recipe_id := NEW.recipe_id;
  END IF;

  UPDATE recipes
  SET
    avg_rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE recipe_id = target_recipe_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE recipe_id = target_recipe_id)
  WHERE id = target_recipe_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_recipe_review_stats ON reviews;
CREATE TRIGGER trigger_update_recipe_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_review_stats();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get reviews for a recipe with author info
CREATE OR REPLACE FUNCTION get_recipe_reviews(
  p_recipe_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  recipe_id UUID,
  user_id UUID,
  rating INTEGER,
  title TEXT,
  content TEXT,
  photo_url TEXT,
  helpful_count INTEGER,
  is_helpful BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  author_username TEXT,
  author_avatar_url TEXT,
  response_content TEXT,
  response_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.recipe_id,
    r.user_id,
    r.rating,
    r.title,
    r.content,
    r.photo_url,
    r.helpful_count,
    CASE WHEN p_user_id IS NOT NULL
      THEN EXISTS (SELECT 1 FROM review_helpful_votes v WHERE v.review_id = r.id AND v.user_id = p_user_id)
      ELSE FALSE
    END as is_helpful,
    r.created_at,
    r.updated_at,
    p.id as author_id,
    p.username as author_username,
    p.avatar_url as author_avatar_url,
    rr.content as response_content,
    rr.created_at as response_created_at
  FROM reviews r
  JOIN profiles p ON r.user_id = p.id
  LEFT JOIN review_responses rr ON r.id = rr.review_id
  WHERE r.recipe_id = p_recipe_id
  ORDER BY r.helpful_count DESC, r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get activity feed for a user
CREATE OR REPLACE FUNCTION get_activity_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  actor_id UUID,
  event_type TEXT,
  recipe_id UUID,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  actor_username TEXT,
  actor_avatar_url TEXT,
  recipe_title TEXT,
  recipe_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.actor_id,
    a.event_type,
    a.recipe_id,
    a.is_public,
    a.created_at,
    p.username as actor_username,
    p.avatar_url as actor_avatar_url,
    r.title as recipe_title,
    r.image_url as recipe_image_url
  FROM activity_feed_events a
  JOIN profiles p ON a.actor_id = p.id
  LEFT JOIN recipes r ON a.recipe_id = r.id
  WHERE (
    a.actor_id = p_user_id  -- Own activity
    OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = p_user_id AND f.following_id = a.actor_id)  -- Following
    OR a.is_public = TRUE  -- Public activity
  )
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
