-- ============================================================================
-- MEAL PLAN TEMPLATES
-- Allows users to save, share, and reuse meal plan structures
-- (e.g., "Keto Week", "Budget Week", "Holiday Week")
-- ============================================================================

-- Meal plan templates table
CREATE TABLE IF NOT EXISTS meal_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE, -- null = community template
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📋',
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  -- Template structure (day -> meal_type -> recipe_id or recipe_criteria)
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Metadata
  dietary_info JSONB DEFAULT '{}'::jsonb, -- {isVegetarian, isKeto, etc.}
  estimated_cost DECIMAL(10,2),
  average_daily_calories INTEGER,
  -- Stats
  times_used INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) GENERATED ALWAYS AS (
    CASE WHEN total_ratings > 0 THEN rating_sum::DECIMAL / total_ratings ELSE NULL END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template ratings table
CREATE TABLE IF NOT EXISTS meal_plan_template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Template usage history
CREATE TABLE IF NOT EXISTS meal_plan_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applied_to_week DATE NOT NULL, -- the monday of the week it was applied to
  mode TEXT NOT NULL CHECK (mode IN ('replace', 'merge')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_household ON meal_plan_templates(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_user ON meal_plan_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_public ON meal_plan_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_tags ON meal_plan_templates USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_rating ON meal_plan_templates(average_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template ON meal_plan_template_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON meal_plan_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON meal_plan_template_usage(user_id);

-- Enable RLS
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_template_usage ENABLE ROW LEVEL SECURITY;

-- RLS for templates
CREATE POLICY "Users can view public templates"
  ON meal_plan_templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own templates"
  ON meal_plan_templates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view household templates"
  ON meal_plan_templates FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert templates"
  ON meal_plan_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON meal_plan_templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON meal_plan_templates FOR DELETE
  USING (user_id = auth.uid());

-- RLS for ratings
CREATE POLICY "Users can view all ratings"
  ON meal_plan_template_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert ratings"
  ON meal_plan_template_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ratings"
  ON meal_plan_template_ratings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own ratings"
  ON meal_plan_template_ratings FOR DELETE
  USING (user_id = auth.uid());

-- RLS for usage
CREATE POLICY "Users can view their own usage"
  ON meal_plan_template_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert usage"
  ON meal_plan_template_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Template data structure documentation
COMMENT ON COLUMN meal_plan_templates.template_data IS 'Template structure:
{
  "monday": {
    "breakfast": {"recipe_id": "uuid"}, // specific recipe
    "lunch": {"tags": ["quick", "healthy"], "random": true}, // random from matching
    "dinner": {"folder_id": "uuid", "random": true} // random from folder
  },
  "tuesday": {
    "breakfast": {"recipe_id": "uuid"},
    "lunch": {"tags": ["low-carb"]},
    "dinner": {"recipe_id": "uuid"}
  },
  // ... etc for all 7 days
}

Each slot can have:
- recipe_id: specific recipe
- folder_id: pick from folder (with optional "random": true)
- tags: pick recipe matching tags
- protein_type: pick recipe with protein type
- empty/null: leave unassigned
';

-- Function to record template usage
CREATE OR REPLACE FUNCTION record_template_usage(
  p_template_id UUID,
  p_user_id UUID,
  p_week DATE,
  p_mode TEXT
)
RETURNS void AS $$
BEGIN
  -- Insert usage record
  INSERT INTO meal_plan_template_usage (template_id, user_id, applied_to_week, mode)
  VALUES (p_template_id, p_user_id, p_week, p_mode);

  -- Increment usage count
  UPDATE meal_plan_templates
  SET times_used = times_used + 1, updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rate a template
CREATE OR REPLACE FUNCTION rate_template(
  p_template_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_review TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_rating INTEGER;
BEGIN
  -- Get existing rating if any
  SELECT rating INTO v_old_rating
  FROM meal_plan_template_ratings
  WHERE template_id = p_template_id AND user_id = p_user_id;

  -- Upsert the rating
  INSERT INTO meal_plan_template_ratings (template_id, user_id, rating, review)
  VALUES (p_template_id, p_user_id, p_rating, p_review)
  ON CONFLICT (template_id, user_id)
  DO UPDATE SET rating = p_rating, review = COALESCE(p_review, meal_plan_template_ratings.review);

  -- Update template stats
  IF v_old_rating IS NULL THEN
    -- New rating
    UPDATE meal_plan_templates
    SET total_ratings = total_ratings + 1, rating_sum = rating_sum + p_rating
    WHERE id = p_template_id;
  ELSE
    -- Updated rating
    UPDATE meal_plan_templates
    SET rating_sum = rating_sum - v_old_rating + p_rating
    WHERE id = p_template_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_meal_plan_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_plan_templates_updated_at ON meal_plan_templates;
CREATE TRIGGER meal_plan_templates_updated_at
  BEFORE UPDATE ON meal_plan_templates
  FOR EACH ROW EXECUTE FUNCTION update_meal_plan_templates_updated_at();
