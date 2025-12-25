-- Performance optimization indexes
-- These indexes improve query performance for common access patterns

-- Index for filtering recipes by user
CREATE INDEX IF NOT EXISTS idx_recipes_user_id
  ON recipes(user_id);

-- Index for household member lookups (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_household_members_user_id
  ON household_members(user_id);

-- Compound index for household member lookups
CREATE INDEX IF NOT EXISTS idx_household_members_household_user
  ON household_members(household_id, user_id);

-- Index for meal plan queries by household and week
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_week
  ON meal_plans(household_id, week_start DESC);

-- Index for shopping list items by list
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list
  ON shopping_list_items(shopping_list_id);
