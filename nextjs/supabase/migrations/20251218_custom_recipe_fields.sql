-- ============================================================================
-- CUSTOM RECIPE FIELDS (User-Defined Metadata)
-- Allows users to add any metadata fields to their recipes
-- (e.g., "Wine Pairing", "Spice Level", "Kid Approved", "Freezer Friendly")
-- ============================================================================

-- Create enum for field types
DO $$ BEGIN
  CREATE TYPE custom_field_type AS ENUM (
    'text',
    'number',
    'boolean',
    'date',
    'select',
    'multi_select',
    'url',
    'rating'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Field definitions table (what fields exist for a household)
CREATE TABLE IF NOT EXISTS custom_recipe_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  field_type custom_field_type NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  default_value JSONB, -- type-appropriate default
  options JSONB, -- for select/multi_select: [{value, label, color}]
  validation_rules JSONB, -- {min, max, pattern, etc}
  show_in_card BOOLEAN DEFAULT false, -- display on recipe cards
  show_in_filters BOOLEAN DEFAULT true, -- allow filtering by this field
  sort_order INTEGER DEFAULT 0,
  icon TEXT, -- optional icon/emoji for the field
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, slug)
);

-- Field values table (actual data per recipe)
CREATE TABLE IF NOT EXISTS custom_recipe_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES custom_recipe_field_definitions(id) ON DELETE CASCADE,
  value JSONB NOT NULL, -- stores the actual value (type depends on field_type)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, field_definition_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_household ON custom_recipe_field_definitions(household_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_sort ON custom_recipe_field_definitions(household_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_recipe ON custom_recipe_field_values(recipe_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_recipe_field_values(field_definition_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_value ON custom_recipe_field_values USING GIN (value);

-- Enable RLS
ALTER TABLE custom_recipe_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_recipe_field_values ENABLE ROW LEVEL SECURITY;

-- RLS for field definitions
CREATE POLICY "Users can view field definitions for their household"
  ON custom_recipe_field_definitions FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert field definitions for their household"
  ON custom_recipe_field_definitions FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update field definitions for their household"
  ON custom_recipe_field_definitions FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete field definitions for their household"
  ON custom_recipe_field_definitions FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- RLS for field values
CREATE POLICY "Users can view field values for their recipes"
  ON custom_recipe_field_values FOR SELECT
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert field values for their recipes"
  ON custom_recipe_field_values FOR INSERT
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update field values for their recipes"
  ON custom_recipe_field_values FOR UPDATE
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete field values for their recipes"
  ON custom_recipe_field_values FOR DELETE
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Helper function to get all custom field values for a recipe
CREATE OR REPLACE FUNCTION get_recipe_custom_fields(p_recipe_id UUID)
RETURNS TABLE (
  field_id UUID,
  field_name TEXT,
  field_slug TEXT,
  field_type custom_field_type,
  value JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.id,
    fd.name,
    fd.slug,
    fd.field_type,
    fv.value
  FROM custom_recipe_field_definitions fd
  LEFT JOIN custom_recipe_field_values fv ON fd.id = fv.field_definition_id AND fv.recipe_id = p_recipe_id
  WHERE fd.household_id = (SELECT household_id FROM recipes WHERE id = p_recipe_id)
  ORDER BY fd.sort_order;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to set a custom field value (upsert)
CREATE OR REPLACE FUNCTION set_recipe_custom_field(
  p_recipe_id UUID,
  p_field_slug TEXT,
  p_value JSONB
)
RETURNS UUID AS $$
DECLARE
  v_field_id UUID;
  v_value_id UUID;
BEGIN
  -- Get the field definition id
  SELECT fd.id INTO v_field_id
  FROM custom_recipe_field_definitions fd
  JOIN recipes r ON r.household_id = fd.household_id
  WHERE r.id = p_recipe_id AND fd.slug = p_field_slug;

  IF v_field_id IS NULL THEN
    RAISE EXCEPTION 'Field with slug % not found for this recipe', p_field_slug;
  END IF;

  -- Upsert the value
  INSERT INTO custom_recipe_field_values (recipe_id, field_definition_id, value)
  VALUES (p_recipe_id, v_field_id, p_value)
  ON CONFLICT (recipe_id, field_definition_id)
  DO UPDATE SET value = p_value, updated_at = NOW()
  RETURNING id INTO v_value_id;

  RETURN v_value_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_custom_field_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_field_definitions_updated_at ON custom_recipe_field_definitions;
CREATE TRIGGER custom_field_definitions_updated_at
  BEFORE UPDATE ON custom_recipe_field_definitions
  FOR EACH ROW EXECUTE FUNCTION update_custom_field_definitions_updated_at();

CREATE OR REPLACE FUNCTION update_custom_field_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_field_values_updated_at ON custom_recipe_field_values;
CREATE TRIGGER custom_field_values_updated_at
  BEFORE UPDATE ON custom_recipe_field_values
  FOR EACH ROW EXECUTE FUNCTION update_custom_field_values_updated_at();
