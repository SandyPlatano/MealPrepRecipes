-- ============================================
-- Household Coordination Features
-- Adds cooking schedules, dietary profiles, and activity tracking
-- ============================================

-- ============================================
-- COOKING SCHEDULES (Who cooks when)
-- ============================================

CREATE TABLE IF NOT EXISTS cooking_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Monday, 6=Sunday
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_cook_name TEXT, -- For non-user cooks (kids, guests, etc.)
  is_rotating BOOLEAN DEFAULT false, -- Auto-rotate weekly
  rotation_order INTEGER, -- Position in rotation (if rotating)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, day_of_week, meal_type)
);

-- Index for fast household lookups
CREATE INDEX IF NOT EXISTS idx_cooking_schedules_household
  ON cooking_schedules(household_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cooking_schedules_updated_at ON cooking_schedules;
CREATE TRIGGER update_cooking_schedules_updated_at
  BEFORE UPDATE ON cooking_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MEMBER DIETARY PROFILES
-- Per-member dietary restrictions, allergens, preferences
-- ============================================

CREATE TABLE IF NOT EXISTS member_dietary_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.
  allergens TEXT[] DEFAULT '{}', -- nuts, dairy, shellfish, eggs, etc.
  dislikes TEXT[] DEFAULT '{}', -- foods they won't eat
  preferences TEXT[] DEFAULT '{}', -- foods they love
  spice_tolerance TEXT CHECK (spice_tolerance IN ('none', 'mild', 'medium', 'hot', 'extra-hot')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, household_id)
);

-- Index for household aggregation queries
CREATE INDEX IF NOT EXISTS idx_member_dietary_profiles_household
  ON member_dietary_profiles(household_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_member_dietary_profiles_updated_at ON member_dietary_profiles;
CREATE TRIGGER update_member_dietary_profiles_updated_at
  BEFORE UPDATE ON member_dietary_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HOUSEHOLD ACTIVITIES (Activity Feed)
-- Track actions for notifications and sync awareness
-- ============================================

CREATE TABLE IF NOT EXISTS household_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'meal_planned',
    'meal_removed',
    'recipe_added',
    'recipe_shared',
    'shopping_item_added',
    'shopping_item_checked',
    'shopping_list_generated',
    'schedule_updated',
    'member_joined',
    'member_left',
    'dietary_updated',
    'meal_cooked'
  )),
  entity_type TEXT, -- 'meal_assignment', 'recipe', 'shopping_item', etc.
  entity_id UUID,
  entity_title TEXT, -- Human-readable title (recipe name, etc.)
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast activity feed queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_household_activities_feed
  ON household_activities(household_id, created_at DESC);

-- Index for user-specific activity queries
CREATE INDEX IF NOT EXISTS idx_household_activities_user
  ON household_activities(user_id, created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE cooking_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_dietary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_activities ENABLE ROW LEVEL SECURITY;

-- Cooking Schedules: Household members can view and manage
CREATE POLICY "Household members can view cooking schedules"
  ON cooking_schedules FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can manage cooking schedules"
  ON cooking_schedules FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Member Dietary Profiles: Users can manage their own, household can view
CREATE POLICY "Users can manage their own dietary profiles"
  ON member_dietary_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Household members can view dietary profiles"
  ON member_dietary_profiles FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household Activities: Household members can view, system inserts
CREATE POLICY "Household members can view activities"
  ON household_activities FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can insert activities"
  ON household_activities FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get aggregated dietary restrictions for a household
CREATE OR REPLACE FUNCTION get_household_dietary_aggregate(p_household_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'all_restrictions', COALESCE(array_agg(DISTINCT restriction), '{}'),
    'all_allergens', COALESCE(array_agg(DISTINCT allergen), '{}'),
    'all_dislikes', COALESCE(array_agg(DISTINCT dislike), '{}'),
    'member_count', COUNT(DISTINCT mdp.user_id)
  )
  INTO result
  FROM member_dietary_profiles mdp
  LEFT JOIN LATERAL unnest(mdp.dietary_restrictions) AS restriction ON true
  LEFT JOIN LATERAL unnest(mdp.allergens) AS allergen ON true
  LEFT JOIN LATERAL unnest(mdp.dislikes) AS dislike ON true
  WHERE mdp.household_id = p_household_id;

  RETURN COALESCE(result, '{"all_restrictions":[],"all_allergens":[],"all_dislikes":[],"member_count":0}'::jsonb);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get today's cook for a household
CREATE OR REPLACE FUNCTION get_todays_cook(p_household_id UUID, p_meal_type TEXT DEFAULT 'dinner')
RETURNS TABLE (
  assigned_user_id UUID,
  assigned_cook_name TEXT,
  user_first_name TEXT,
  user_avatar_url TEXT
) AS $$
DECLARE
  today_dow INTEGER;
BEGIN
  -- Get day of week (0=Monday in our schema, PostgreSQL EXTRACT gives 0=Sunday)
  today_dow := (EXTRACT(ISODOW FROM CURRENT_DATE) - 1)::INTEGER; -- Convert to 0=Monday

  RETURN QUERY
  SELECT
    cs.assigned_user_id,
    cs.assigned_cook_name,
    p.first_name,
    p.avatar_url
  FROM cooking_schedules cs
  LEFT JOIN profiles p ON p.id = cs.assigned_user_id
  WHERE cs.household_id = p_household_id
    AND cs.day_of_week = today_dow
    AND cs.meal_type = p_meal_type;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE cooking_schedules IS 'Weekly cooking schedule - who cooks on which days';
COMMENT ON TABLE member_dietary_profiles IS 'Per-member dietary restrictions and preferences';
COMMENT ON TABLE household_activities IS 'Activity feed for household coordination and notifications';

COMMENT ON COLUMN cooking_schedules.day_of_week IS '0=Monday, 1=Tuesday, ..., 6=Sunday';
COMMENT ON COLUMN cooking_schedules.is_rotating IS 'If true, automatically rotate cooks weekly';
COMMENT ON COLUMN member_dietary_profiles.spice_tolerance IS 'Spice preference level for the member';
COMMENT ON COLUMN household_activities.entity_title IS 'Human-readable title for the entity (avoids joins in feed)';
