-- ============================================================================
-- CUSTOM DASHBOARD WIDGETS
-- Allows users to customize their home dashboard with drag-and-drop widgets
-- ============================================================================

-- Enum for widget types
DO $$ BEGIN
  CREATE TYPE widget_type AS ENUM (
    'todays_meals',
    'weeks_macros',
    'shopping_preview',
    'cooking_streak',
    'random_recipe',
    'expiring_soon',
    'recent_recipes',
    'favorites',
    'quick_add',
    'weather_meals',
    'upcoming_meals',
    'nutrition_summary',
    'folder_preview',
    'cooking_history',
    'custom_query'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dashboard layouts table
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Default',
  is_active BOOLEAN DEFAULT false,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of widget configs with positions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget presets (pre-made widget configurations)
CREATE TABLE IF NOT EXISTS dashboard_widget_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  widget_type widget_type NOT NULL,
  default_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_size JSONB NOT NULL DEFAULT '{"w": 2, "h": 2}'::jsonb, -- {w, h} grid units
  icon TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user ON dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_active ON dashboard_layouts(user_id, is_active);

-- Enable RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widget_presets ENABLE ROW LEVEL SECURITY;

-- RLS for dashboard layouts
CREATE POLICY "Users can view their own layouts"
  ON dashboard_layouts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own layouts"
  ON dashboard_layouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own layouts"
  ON dashboard_layouts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own layouts"
  ON dashboard_layouts FOR DELETE
  USING (user_id = auth.uid());

-- RLS for presets (everyone can read)
CREATE POLICY "Everyone can view presets"
  ON dashboard_widget_presets FOR SELECT
  USING (true);

-- Widget config structure documentation
COMMENT ON COLUMN dashboard_layouts.widgets IS 'Array of widget configurations:
[
  {
    "id": "widget-uuid",
    "type": "todays_meals",
    "position": {"x": 0, "y": 0, "w": 2, "h": 2},
    "config": {
      // Widget-specific config
    }
  }
]

Position uses a 12-column grid system:
- x: column position (0-11)
- y: row position (0+)
- w: width in columns (1-12)
- h: height in rows (1+)

Widget-specific configs:
- todays_meals: {"showMacros": true, "showCooks": true}
- weeks_macros: {"showGoals": true, "chartType": "bar"|"ring"}
- shopping_preview: {"maxItems": 10, "showCategories": true}
- cooking_streak: {"showHistory": true}
- random_recipe: {"folderId": "uuid"|null, "tags": []}
- expiring_soon: {"daysAhead": 7}
- recent_recipes: {"limit": 5, "showRating": true}
- favorites: {"limit": 5, "randomize": false}
- quick_add: {"presets": ["macro"|"recipe"|"shopping"]}
- weather_meals: {"location": "auto"|"city"}
- upcoming_meals: {"daysAhead": 3}
- nutrition_summary: {"period": "day"|"week", "showTrends": true}
- folder_preview: {"folderId": "uuid", "limit": 4}
- cooking_history: {"limit": 10, "showNotes": true}
- custom_query: {"query": "SQL query", "displayType": "list"|"count"|"chart"}
';

-- Insert default widget presets
INSERT INTO dashboard_widget_presets (name, description, widget_type, default_config, default_size, icon)
VALUES
  ('Today''s Meals', 'Shows meals planned for today', 'todays_meals', '{"showMacros": true, "showCooks": true}'::jsonb, '{"w": 4, "h": 3}'::jsonb, '📅'),
  ('Weekly Macros', 'Macro progress for the week', 'weeks_macros', '{"showGoals": true, "chartType": "ring"}'::jsonb, '{"w": 4, "h": 3}'::jsonb, '📊'),
  ('Shopping Preview', 'Quick view of shopping list', 'shopping_preview', '{"maxItems": 8, "showCategories": true}'::jsonb, '{"w": 3, "h": 4}'::jsonb, '🛒'),
  ('Cooking Streak', 'Track your cooking consistency', 'cooking_streak', '{"showHistory": true}'::jsonb, '{"w": 2, "h": 2}'::jsonb, '🔥'),
  ('Random Recipe', 'Discover a random recipe', 'random_recipe', '{"folderId": null, "tags": []}'::jsonb, '{"w": 2, "h": 3}'::jsonb, '🎲'),
  ('Expiring Soon', 'Pantry items expiring soon', 'expiring_soon', '{"daysAhead": 7}'::jsonb, '{"w": 3, "h": 2}'::jsonb, '⏰'),
  ('Recent Recipes', 'Recently added recipes', 'recent_recipes', '{"limit": 5, "showRating": true}'::jsonb, '{"w": 3, "h": 3}'::jsonb, '🆕'),
  ('Favorites', 'Your favorite recipes', 'favorites', '{"limit": 5, "randomize": false}'::jsonb, '{"w": 3, "h": 3}'::jsonb, '❤️'),
  ('Quick Add', 'Quick action buttons', 'quick_add', '{"presets": ["macro", "recipe", "shopping"]}'::jsonb, '{"w": 2, "h": 2}'::jsonb, '⚡'),
  ('Weather Meals', 'Meal suggestions based on weather', 'weather_meals', '{"location": "auto"}'::jsonb, '{"w": 3, "h": 2}'::jsonb, '🌤️'),
  ('Upcoming Meals', 'Meals for the next few days', 'upcoming_meals', '{"daysAhead": 3}'::jsonb, '{"w": 4, "h": 2}'::jsonb, '📆'),
  ('Nutrition Summary', 'Daily/weekly nutrition overview', 'nutrition_summary', '{"period": "day", "showTrends": true}'::jsonb, '{"w": 4, "h": 3}'::jsonb, '🥗'),
  ('Folder Preview', 'Preview recipes from a folder', 'folder_preview', '{"limit": 4}'::jsonb, '{"w": 3, "h": 3}'::jsonb, '📁'),
  ('Cooking History', 'Recent cooking activity', 'cooking_history', '{"limit": 10, "showNotes": true}'::jsonb, '{"w": 3, "h": 4}'::jsonb, '📜')
ON CONFLICT DO NOTHING;

-- Function to get or create default dashboard layout for user
CREATE OR REPLACE FUNCTION get_or_create_dashboard_layout(p_user_id UUID)
RETURNS dashboard_layouts AS $$
DECLARE
  v_layout dashboard_layouts;
BEGIN
  -- Try to get existing active layout
  SELECT * INTO v_layout
  FROM dashboard_layouts
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;

  -- If no layout exists, create default
  IF v_layout IS NULL THEN
    INSERT INTO dashboard_layouts (user_id, name, is_active, widgets)
    VALUES (
      p_user_id,
      'Default',
      true,
      '[
        {"id": "w1", "type": "todays_meals", "position": {"x": 0, "y": 0, "w": 4, "h": 3}, "config": {"showMacros": true}},
        {"id": "w2", "type": "weeks_macros", "position": {"x": 4, "y": 0, "w": 4, "h": 3}, "config": {"chartType": "ring"}},
        {"id": "w3", "type": "cooking_streak", "position": {"x": 8, "y": 0, "w": 2, "h": 2}, "config": {}},
        {"id": "w4", "type": "shopping_preview", "position": {"x": 0, "y": 3, "w": 3, "h": 3}, "config": {"maxItems": 8}},
        {"id": "w5", "type": "favorites", "position": {"x": 3, "y": 3, "w": 3, "h": 3}, "config": {"limit": 4}}
      ]'::jsonb
    )
    RETURNING * INTO v_layout;
  END IF;

  RETURN v_layout;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure only one active layout per user
CREATE OR REPLACE FUNCTION ensure_single_active_layout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE dashboard_layouts
    SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_active_layout_trigger ON dashboard_layouts;
CREATE TRIGGER ensure_single_active_layout_trigger
  BEFORE INSERT OR UPDATE ON dashboard_layouts
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_layout();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_dashboard_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dashboard_layouts_updated_at ON dashboard_layouts;
CREATE TRIGGER dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW EXECUTE FUNCTION update_dashboard_layouts_updated_at();
