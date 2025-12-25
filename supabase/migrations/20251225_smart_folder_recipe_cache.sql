-- Smart Folder Recipe Cache
-- Precomputes smart folder memberships to eliminate client-side filtering

-- Create the cache table
CREATE TABLE IF NOT EXISTS smart_folder_recipe_cache (
  smart_folder_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (smart_folder_id, recipe_id)
);

-- Index for fast lookups by folder
CREATE INDEX IF NOT EXISTS idx_smart_folder_cache_folder
  ON smart_folder_recipe_cache(smart_folder_id);

-- Index for fast invalidation by recipe
CREATE INDEX IF NOT EXISTS idx_smart_folder_cache_recipe
  ON smart_folder_recipe_cache(recipe_id);

-- Index for household scoping
CREATE INDEX IF NOT EXISTS idx_smart_folder_cache_household
  ON smart_folder_recipe_cache(household_id);

-- RLS policies
ALTER TABLE smart_folder_recipe_cache ENABLE ROW LEVEL SECURITY;

-- Users can read cache entries for their household
CREATE POLICY "Users can read smart folder cache for their household"
  ON smart_folder_recipe_cache
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert cache entries for their household
CREATE POLICY "Users can insert smart folder cache for their household"
  ON smart_folder_recipe_cache
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can delete cache entries for their household
CREATE POLICY "Users can delete smart folder cache for their household"
  ON smart_folder_recipe_cache
  FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Function to clear cache for a household (called on invalidation)
CREATE OR REPLACE FUNCTION clear_smart_folder_cache(p_household_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM smart_folder_recipe_cache WHERE household_id = p_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear cache for a specific folder
CREATE OR REPLACE FUNCTION clear_smart_folder_cache_for_folder(p_folder_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM smart_folder_recipe_cache WHERE smart_folder_id = p_folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to invalidate cache when a recipe changes
CREATE OR REPLACE FUNCTION invalidate_smart_folder_cache_on_recipe_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear all smart folder cache entries for this recipe's household
  IF TG_OP = 'DELETE' THEN
    DELETE FROM smart_folder_recipe_cache WHERE household_id = OLD.household_id;
    RETURN OLD;
  ELSE
    DELETE FROM smart_folder_recipe_cache WHERE household_id = NEW.household_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on recipe changes
DROP TRIGGER IF EXISTS trigger_invalidate_smart_cache_on_recipe ON recipes;
CREATE TRIGGER trigger_invalidate_smart_cache_on_recipe
  AFTER INSERT OR UPDATE OR DELETE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_smart_folder_cache_on_recipe_change();

-- Trigger function to invalidate cache when cooking history changes
CREATE OR REPLACE FUNCTION invalidate_smart_folder_cache_on_cooking_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear all smart folder cache entries for this household
  IF TG_OP = 'DELETE' THEN
    DELETE FROM smart_folder_recipe_cache WHERE household_id = OLD.household_id;
    RETURN OLD;
  ELSE
    DELETE FROM smart_folder_recipe_cache WHERE household_id = NEW.household_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on cooking history changes (for time-based smart folders)
DROP TRIGGER IF EXISTS trigger_invalidate_smart_cache_on_cooking ON cooking_history;
CREATE TRIGGER trigger_invalidate_smart_cache_on_cooking
  AFTER INSERT OR UPDATE OR DELETE ON cooking_history
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_smart_folder_cache_on_cooking_history();

-- Trigger function to invalidate cache when smart folder criteria changes
CREATE OR REPLACE FUNCTION invalidate_smart_folder_cache_on_folder_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for smart folders (is_smart = true)
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_smart = true THEN
      DELETE FROM smart_folder_recipe_cache WHERE smart_folder_id = OLD.id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If smart_filters changed or is_smart changed, invalidate
    IF OLD.smart_filters IS DISTINCT FROM NEW.smart_filters OR OLD.is_smart IS DISTINCT FROM NEW.is_smart THEN
      DELETE FROM smart_folder_recipe_cache WHERE smart_folder_id = NEW.id;
    END IF;
    RETURN NEW;
  ELSE
    -- INSERT - no action needed, cache will be built on first access
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on folder changes
DROP TRIGGER IF EXISTS trigger_invalidate_smart_cache_on_folder ON recipe_folders;
CREATE TRIGGER trigger_invalidate_smart_cache_on_folder
  AFTER UPDATE OR DELETE ON recipe_folders
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_smart_folder_cache_on_folder_change();
