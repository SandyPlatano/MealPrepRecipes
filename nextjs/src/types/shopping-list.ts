// Shopping List Types

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  is_checked: boolean;
  recipe_id?: string | null;
  recipe_title?: string | null;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  household_id: string;
  meal_plan_id?: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

// Grouped items by category for display
export interface GroupedShoppingItems {
  [category: string]: ShoppingListItem[];
}

// For creating new items
export interface NewShoppingListItem {
  ingredient: string;
  quantity?: string;
  unit?: string;
  category?: string;
  recipe_id?: string;
  recipe_title?: string;
}

// Common ingredient categories
export const INGREDIENT_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments",
  "Spices",
  "Other",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

// Helper to group items by category
export function groupItemsByCategory(
  items: ShoppingListItem[]
): GroupedShoppingItems {
  return items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedShoppingItems);
}

// Helper to sort categories in a logical order
export function sortCategories(categories: string[]): string[] {
  const order = INGREDIENT_CATEGORIES as readonly string[];
  return categories.sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}
