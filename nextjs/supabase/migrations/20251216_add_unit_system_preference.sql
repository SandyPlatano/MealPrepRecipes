-- Add unit system preference to user settings
-- Allows users to choose between imperial (US) and metric measurement systems
-- for displaying recipe ingredients

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'imperial'
CHECK (unit_system IN ('imperial', 'metric'));

COMMENT ON COLUMN user_settings.unit_system IS 'Preferred measurement system for ingredient display: imperial (cups, oz, lb) or metric (ml, g, kg)';
