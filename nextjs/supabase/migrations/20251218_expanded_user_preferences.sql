-- ============================================================================
-- EXPANDED USER PREFERENCES (preferences_v2)
-- Stores advanced customization options for power users
-- Includes: display settings, sounds, keyboard shortcuts, AI personality, etc.
-- ============================================================================

-- Add the new preferences_v2 column for expanded settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS preferences_v2 JSONB DEFAULT '{}'::jsonb;

-- Add custom CSS column for power users
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS custom_css TEXT;

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_settings_preferences_v2 ON user_settings USING GIN (preferences_v2);

-- Comment documenting the structure
COMMENT ON COLUMN user_settings.preferences_v2 IS 'Extended user preferences JSON structure:
{
  "display": {
    "weekStartDay": "monday", // monday|sunday|saturday|wednesday|etc
    "timeFormat": "12h", // 12h|24h
    "dateFormat": "MM/DD/YYYY", // MM/DD/YYYY|DD/MM/YYYY|YYYY-MM-DD
    "ratingScale": "5-star", // 5-star|10-star|thumbs|letter|emoji
    "customRatingEmojis": ["🤮","😕","😐","😊","🤩"],
    "theme": "system", // system|light|dark|forest|ocean|sunset|midnight
    "accentColor": "#6366f1",
    "seasonalThemes": false,
    "timeBasedThemes": false,
    "recipeCardLayout": "default" // default|photo-forward|data-dense|minimal|pinterest
  },
  "sounds": {
    "enabled": true,
    "timerComplete": "chime", // preset name or custom URL
    "notification": "ping",
    "achievement": "fanfare",
    "stepChange": "click",
    "volume": 0.8
  },
  "servingSizePresets": [
    {"name": "Just Me", "size": 1, "emoji": "👤"},
    {"name": "Date Night", "size": 2, "emoji": "💑"},
    {"name": "Family", "size": 4, "emoji": "👨‍👩‍👧‍👦"},
    {"name": "Meal Prep", "size": 8, "emoji": "📦"}
  ],
  "keyboard": {
    "enabled": true,
    "shortcuts": {
      "newRecipe": "n",
      "search": "/",
      "nextWeek": "ArrowRight",
      "prevWeek": "ArrowLeft",
      "toggleDarkMode": "d",
      "openSettings": ",",
      "goToPlanner": "p",
      "goToRecipes": "r",
      "goToShopping": "s"
    }
  },
  "aiPersonality": "friendly", // friendly|professional|grandma|gordon|custom
  "customAiPrompt": null, // custom system prompt for AI interactions
  "navigation": {
    "sidebarCollapsed": false,
    "pinnedPages": ["planner", "recipes"],
    "hiddenPages": []
  },
  "notifications": {
    "browserEnabled": true,
    "pantryExpiring": true,
    "mealPlanReminder": true,
    "cookingStreak": true
  }
}';

-- Function to get a specific preference with default fallback
CREATE OR REPLACE FUNCTION get_user_preference_v2(
  p_user_id UUID,
  p_path TEXT[], -- e.g., ARRAY['display', 'weekStartDay']
  p_default JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT preferences_v2 #> p_path INTO v_result
  FROM user_settings
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_result, p_default);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to set a specific preference (deep merge)
CREATE OR REPLACE FUNCTION set_user_preference_v2(
  p_user_id UUID,
  p_path TEXT[], -- e.g., ARRAY['display', 'weekStartDay']
  p_value JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_current JSONB;
  v_result JSONB;
BEGIN
  -- Get current preferences
  SELECT COALESCE(preferences_v2, '{}'::jsonb) INTO v_current
  FROM user_settings
  WHERE user_id = p_user_id;

  -- Deep set the value at path
  v_result := jsonb_set(v_current, p_path, p_value, true);

  -- Update the record
  UPDATE user_settings
  SET preferences_v2 = v_result
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge preferences (for bulk updates)
CREATE OR REPLACE FUNCTION merge_user_preferences_v2(
  p_user_id UUID,
  p_preferences JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE user_settings
  SET preferences_v2 = COALESCE(preferences_v2, '{}'::jsonb) || p_preferences
  WHERE user_id = p_user_id
  RETURNING preferences_v2 INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Default serving size presets function
CREATE OR REPLACE FUNCTION get_default_serving_presets()
RETURNS JSONB AS $$
BEGIN
  RETURN '[
    {"name": "Just Me", "size": 1, "emoji": "👤"},
    {"name": "Date Night", "size": 2, "emoji": "💑"},
    {"name": "Family Dinner", "size": 4, "emoji": "👨‍👩‍👧‍👦"},
    {"name": "Meal Prep", "size": 8, "emoji": "📦"}
  ]'::jsonb;
END;
$$ LANGUAGE sql IMMUTABLE;

-- Default keyboard shortcuts function
CREATE OR REPLACE FUNCTION get_default_keyboard_shortcuts()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "newRecipe": "n",
    "search": "/",
    "nextWeek": "ArrowRight",
    "prevWeek": "ArrowLeft",
    "toggleDarkMode": "d",
    "openSettings": ",",
    "goToPlanner": "p",
    "goToRecipes": "r",
    "goToShopping": "s",
    "goToNutrition": "m",
    "goToHistory": "h",
    "escape": "Escape"
  }'::jsonb;
END;
$$ LANGUAGE sql IMMUTABLE;

-- Available sound presets
CREATE OR REPLACE FUNCTION get_available_sounds()
RETURNS JSONB AS $$
BEGIN
  RETURN '[
    {"id": "chime", "name": "Chime", "category": "timer"},
    {"id": "bell", "name": "Bell", "category": "timer"},
    {"id": "ding", "name": "Ding", "category": "timer"},
    {"id": "ping", "name": "Ping", "category": "notification"},
    {"id": "pop", "name": "Pop", "category": "notification"},
    {"id": "whoosh", "name": "Whoosh", "category": "notification"},
    {"id": "fanfare", "name": "Fanfare", "category": "achievement"},
    {"id": "success", "name": "Success", "category": "achievement"},
    {"id": "tada", "name": "Tada", "category": "achievement"},
    {"id": "click", "name": "Click", "category": "ui"},
    {"id": "tick", "name": "Tick", "category": "ui"},
    {"id": "none", "name": "None (Silent)", "category": "all"}
  ]'::jsonb;
END;
$$ LANGUAGE sql IMMUTABLE;

-- AI personality presets
CREATE OR REPLACE FUNCTION get_ai_personality_presets()
RETURNS JSONB AS $$
BEGIN
  RETURN '[
    {
      "id": "friendly",
      "name": "Friendly Assistant",
      "description": "Warm, encouraging, and helpful",
      "prompt": "You are a friendly and encouraging cooking assistant. Be supportive and positive."
    },
    {
      "id": "professional",
      "name": "Professional Chef",
      "description": "Technical, precise, and formal",
      "prompt": "You are a professional chef. Be precise, use proper culinary terminology, and provide expert guidance."
    },
    {
      "id": "grandma",
      "name": "Grandma",
      "description": "Warm, traditional, with family wisdom",
      "prompt": "You are like a loving grandmother sharing family recipes and cooking wisdom. Be warm and nostalgic."
    },
    {
      "id": "gordon",
      "name": "Gordon Ramsay",
      "description": "Blunt, passionate, high standards",
      "prompt": "You are passionate about cooking with high standards. Be direct and demanding of quality, but ultimately supportive."
    },
    {
      "id": "custom",
      "name": "Custom",
      "description": "Define your own AI personality",
      "prompt": null
    }
  ]'::jsonb;
END;
$$ LANGUAGE sql IMMUTABLE;

-- Theme presets
CREATE OR REPLACE FUNCTION get_theme_presets()
RETURNS JSONB AS $$
BEGIN
  RETURN '[
    {"id": "system", "name": "System Default", "type": "auto"},
    {"id": "light", "name": "Light", "type": "light"},
    {"id": "dark", "name": "Dark", "type": "dark"},
    {"id": "forest", "name": "Forest", "type": "dark", "accent": "#22c55e"},
    {"id": "ocean", "name": "Ocean", "type": "dark", "accent": "#0ea5e9"},
    {"id": "sunset", "name": "Sunset", "type": "light", "accent": "#f97316"},
    {"id": "midnight", "name": "Midnight", "type": "dark", "accent": "#8b5cf6"},
    {"id": "high-contrast", "name": "High Contrast", "type": "light", "accessibility": true}
  ]'::jsonb;
END;
$$ LANGUAGE sql IMMUTABLE;
