-- Recipe Enhancement Features Migration
-- Adds allergen tracking, ingredient substitutions, and enhanced cooking notes

-- Add allergen_tags to recipes table for manual allergen overrides
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS allergen_tags TEXT[] DEFAULT '{}';

-- Add allergen_alerts to user_settings for personal allergen tracking
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS allergen_alerts TEXT[] DEFAULT '{}';

-- Enhance cooking_history with modifications and photo support
ALTER TABLE cooking_history 
ADD COLUMN IF NOT EXISTS modifications TEXT;

ALTER TABLE cooking_history 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create substitutions table for built-in common substitutions
CREATE TABLE IF NOT EXISTS substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_ingredient TEXT NOT NULL,
  substitute_ingredient TEXT NOT NULL,
  notes TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_substitutions table for user-defined preferences
CREATE TABLE IF NOT EXISTS user_substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_ingredient TEXT NOT NULL,
  substitute_ingredient TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, original_ingredient, substitute_ingredient)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_substitutions_user_id ON user_substitutions(user_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_original ON substitutions(original_ingredient);
CREATE INDEX IF NOT EXISTS idx_substitutions_default ON substitutions(is_default) WHERE is_default = true;

-- Add trigger for user_substitutions updated_at
DROP TRIGGER IF EXISTS update_user_substitutions_updated_at ON user_substitutions;
CREATE TRIGGER update_user_substitutions_updated_at
  BEFORE UPDATE ON user_substitutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert common default substitutions
INSERT INTO substitutions (original_ingredient, substitute_ingredient, notes, is_default) VALUES
  ('butter', 'coconut oil', 'Use 1:1 ratio. Great for vegan baking.', true),
  ('butter', 'olive oil', 'Use 3/4 cup oil for 1 cup butter in baking.', true),
  ('milk', 'oat milk', 'Use 1:1 ratio. Works well in most recipes.', true),
  ('milk', 'almond milk', 'Use 1:1 ratio. Slightly nutty flavor.', true),
  ('milk', 'coconut milk', 'Use 1:1 ratio. Rich and creamy.', true),
  ('eggs', 'flax eggs', 'Mix 1 tbsp ground flaxseed with 3 tbsp water per egg. Let sit 5 min.', true),
  ('eggs', 'applesauce', 'Use 1/4 cup per egg in baking. Adds moisture.', true),
  ('flour', 'almond flour', 'Use 1:1 ratio but may need more liquid.', true),
  ('flour', 'coconut flour', 'Use 1/4 cup coconut flour for 1 cup regular flour.', true),
  ('sugar', 'honey', 'Use 3/4 cup honey for 1 cup sugar. Reduce liquid by 1/4 cup.', true),
  ('sugar', 'maple syrup', 'Use 3/4 cup syrup for 1 cup sugar. Reduce liquid by 3 tbsp.', true),
  ('sour cream', 'greek yogurt', 'Use 1:1 ratio. Tangy and protein-rich.', true),
  ('heavy cream', 'coconut cream', 'Use 1:1 ratio. Great for dairy-free recipes.', true),
  ('cream cheese', 'cashew cream cheese', 'Soak cashews overnight, blend until smooth.', true),
  ('mayonnaise', 'avocado', 'Mash avocado for a creamy, healthy alternative.', true)
ON CONFLICT DO NOTHING;

