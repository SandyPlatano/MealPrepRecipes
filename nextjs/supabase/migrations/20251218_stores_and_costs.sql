-- ============================================================================
-- STORES & COST TRACKING
-- Allows users to track grocery stores and ingredient prices
-- Enables per-store shopping lists and recipe cost calculations
-- ============================================================================

-- Grocery stores table
CREATE TABLE IF NOT EXISTS grocery_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🏪',
  color TEXT DEFAULT '#6366f1',
  address TEXT,
  city TEXT,
  notes TEXT,
  website_url TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, name)
);

-- Ingredient prices per store
CREATE TABLE IF NOT EXISTS ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL, -- normalized ingredient name
  store_id UUID REFERENCES grocery_stores(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'each', -- "per lb", "each", "per oz", "per gallon"
  quantity DECIMAL(10,2) DEFAULT 1, -- quantity per unit (e.g., 2 for "2 lb bag")
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  is_sale_price BOOLEAN DEFAULT false,
  sale_expires_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe cost tracking
CREATE TABLE IF NOT EXISTS recipe_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  total_cost DECIMAL(10,2),
  cost_per_serving DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  ingredient_breakdown JSONB DEFAULT '[]'::jsonb, -- [{ingredient, cost, store_name, quantity, unit}]
  missing_prices TEXT[] DEFAULT '{}', -- ingredients without price data
  calculation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grocery_stores_household ON grocery_stores(household_id);
CREATE INDEX IF NOT EXISTS idx_grocery_stores_default ON grocery_stores(household_id, is_default);
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_household ON ingredient_prices(household_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_ingredient ON ingredient_prices(LOWER(ingredient_name));
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_store ON ingredient_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_recipe_costs_recipe ON recipe_costs(recipe_id);

-- Enable RLS
ALTER TABLE grocery_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_costs ENABLE ROW LEVEL SECURITY;

-- RLS for grocery stores
CREATE POLICY "Users can view stores for their household"
  ON grocery_stores FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert stores for their household"
  ON grocery_stores FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update stores for their household"
  ON grocery_stores FOR UPDATE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete stores for their household"
  ON grocery_stores FOR DELETE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- RLS for ingredient prices
CREATE POLICY "Users can view prices for their household"
  ON ingredient_prices FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert prices for their household"
  ON ingredient_prices FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update prices for their household"
  ON ingredient_prices FOR UPDATE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete prices for their household"
  ON ingredient_prices FOR DELETE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- RLS for recipe costs
CREATE POLICY "Users can view costs for their recipes"
  ON recipe_costs FOR SELECT
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert costs for their recipes"
  ON recipe_costs FOR INSERT
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can update costs for their recipes"
  ON recipe_costs FOR UPDATE
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete costs for their recipes"
  ON recipe_costs FOR DELETE
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));

-- Function to get best price for an ingredient
CREATE OR REPLACE FUNCTION get_best_ingredient_price(
  p_household_id UUID,
  p_ingredient_name TEXT
)
RETURNS TABLE (
  price DECIMAL(10,2),
  unit TEXT,
  store_id UUID,
  store_name TEXT,
  is_sale BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip.price,
    ip.unit,
    ip.store_id,
    gs.name,
    ip.is_sale_price
  FROM ingredient_prices ip
  LEFT JOIN grocery_stores gs ON ip.store_id = gs.id
  WHERE ip.household_id = p_household_id
    AND LOWER(ip.ingredient_name) = LOWER(p_ingredient_name)
    AND (ip.sale_expires_at IS NULL OR ip.sale_expires_at > NOW())
  ORDER BY ip.price ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to upsert ingredient price
CREATE OR REPLACE FUNCTION upsert_ingredient_price(
  p_household_id UUID,
  p_ingredient_name TEXT,
  p_store_id UUID,
  p_price DECIMAL(10,2),
  p_unit TEXT DEFAULT 'each',
  p_quantity DECIMAL(10,2) DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO ingredient_prices (household_id, ingredient_name, store_id, price, unit, quantity)
  VALUES (p_household_id, p_ingredient_name, p_store_id, p_price, p_unit, p_quantity)
  ON CONFLICT (household_id, ingredient_name, store_id)
    DO UPDATE SET
      price = EXCLUDED.price,
      unit = EXCLUDED.unit,
      quantity = EXCLUDED.quantity,
      last_updated = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unique constraint for ingredient prices per store
ALTER TABLE ingredient_prices
  DROP CONSTRAINT IF EXISTS ingredient_prices_unique_per_store;
ALTER TABLE ingredient_prices
  ADD CONSTRAINT ingredient_prices_unique_per_store
  UNIQUE (household_id, LOWER(ingredient_name), store_id);

-- Add store_id FK to custom_ingredient_categories now that grocery_stores exists
DO $$ BEGIN
  ALTER TABLE custom_ingredient_categories
    ADD CONSTRAINT fk_default_store
    FOREIGN KEY (default_store_id) REFERENCES grocery_stores(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_grocery_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grocery_stores_updated_at ON grocery_stores;
CREATE TRIGGER grocery_stores_updated_at
  BEFORE UPDATE ON grocery_stores
  FOR EACH ROW EXECUTE FUNCTION update_grocery_stores_updated_at();

-- Ensure only one default store per household
CREATE OR REPLACE FUNCTION ensure_single_default_store()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE grocery_stores
    SET is_default = false
    WHERE household_id = NEW.household_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_default_store_trigger ON grocery_stores;
CREATE TRIGGER ensure_single_default_store_trigger
  BEFORE INSERT OR UPDATE ON grocery_stores
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_store();
