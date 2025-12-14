-- Fix shopping list items incorrectly categorized as "Beverages"
-- due to regex matching "tea" in "teaspoon"
--
-- This migration recategorizes items that:
-- 1. Are currently in "Beverages" category
-- 2. Contain "teaspoon" or "tsp" in the ingredient text
-- 3. Don't actually contain beverage words like juice, soda, coffee, etc.

-- Create a function to properly categorize ingredients (mirrors TypeScript guessCategory)
CREATE OR REPLACE FUNCTION guess_ingredient_category(ingredient_text TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(ingredient_text);
BEGIN
  -- Produce
  IF lower_text ~* 'lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado' THEN
    RETURN 'Produce';
  END IF;

  -- Meat & Seafood
  IF lower_text ~* 'chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia' THEN
    RETURN 'Meat & Seafood';
  END IF;

  -- Dairy & Eggs
  IF lower_text ~* 'milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan' THEN
    RETURN 'Dairy & Eggs';
  END IF;

  -- Bakery
  IF lower_text ~* 'bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette' THEN
    RETURN 'Bakery';
  END IF;

  -- Pantry
  IF lower_text ~* 'flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha' THEN
    RETURN 'Pantry';
  END IF;

  -- Frozen
  IF lower_text ~* 'frozen|ice cream' THEN
    RETURN 'Frozen';
  END IF;

  -- Spices (includes fennel and other spices that might have been miscategorized)
  IF lower_text ~* 'salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning|fennel|cardamom|coriander|clove|allspice|anise|caraway|dill|mustard seed' THEN
    RETURN 'Spices';
  END IF;

  -- Condiments
  IF lower_text ~* 'ketchup|mustard|mayo|mayonnaise|relish|hot sauce|bbq|dressing|salsa' THEN
    RETURN 'Condiments';
  END IF;

  -- Beverages (using word boundaries to prevent "tea" matching "teaspoon")
  IF lower_text ~ '\y(juice|soda|water|coffee|tea|wine|beer)\y' THEN
    RETURN 'Beverages';
  END IF;

  RETURN 'Other';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update items that are incorrectly in Beverages category
-- These are items that contain "teaspoon" or "tsp" but don't have actual beverage words
UPDATE shopping_list_items
SET category = guess_ingredient_category(ingredient)
WHERE category = 'Beverages'
  AND (LOWER(ingredient) LIKE '%teaspoon%' OR LOWER(ingredient) LIKE '%tsp%')
  AND NOT (LOWER(ingredient) ~ '\y(juice|soda|water|coffee|tea|wine|beer)\y');

-- Log how many rows were affected (for verification)
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Fixed % shopping list items that were incorrectly categorized as Beverages', affected_count;
END $$;

-- Drop the helper function (optional - can keep it for future use)
-- DROP FUNCTION IF EXISTS guess_ingredient_category(TEXT);
