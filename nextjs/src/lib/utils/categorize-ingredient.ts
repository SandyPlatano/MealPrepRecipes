/**
 * Ingredient Categorization Utility
 *
 * Smart categorization of ingredients based on keywords.
 * Shared between email templates and markdown exports.
 */

export type IngredientCategory =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Bakery"
  | "Pantry"
  | "Frozen"
  | "Beverages"
  | "Condiments"
  | "Spices"
  | "Other";

/**
 * Category display order for shopping lists
 */
export const CATEGORY_ORDER: IngredientCategory[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Condiments",
  "Spices",
  "Other",
];

/**
 * Categorize an ingredient based on keywords
 */
export function categorizeIngredient(ingredient: string): IngredientCategory {
  const lower = ingredient.toLowerCase();

  // Produce
  if (
    /(lettuce|spinach|kale|arugula|cabbage|tomato|pepper|onion|garlic|carrot|celery|cucumber|zucchini|squash|broccoli|cauliflower|potato|sweet potato|apple|banana|orange|lemon|lime|berry|berries|avocado|mushroom|herb|cilantro|parsley|basil|thyme|rosemary|green|salad|fruit|vegetable)/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  // Meat & Seafood
  if (
    /(chicken|beef|pork|turkey|lamb|fish|salmon|tuna|shrimp|crab|lobster|steak|ground|sausage|bacon|ham|meat|seafood)/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  // Dairy & Eggs
  if (
    /(milk|cream|butter|cheese|yogurt|egg|sour cream|cottage cheese|mozzarella|cheddar|parmesan|dairy)/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  // Bakery
  if (/(bread|bun|roll|bagel|tortilla|pita|croissant|baguette|bakery)/i.test(lower)) {
    return "Bakery";
  }

  // Frozen
  if (/(frozen|ice cream)/i.test(lower)) {
    return "Frozen";
  }

  // Beverages
  if (/(juice|soda|water|coffee|tea|wine|beer|drink|beverage)/i.test(lower)) {
    return "Beverages";
  }

  // Condiments
  if (
    /(sauce|ketchup|mustard|mayo|mayonnaise|dressing|vinegar|soy sauce|hot sauce|salsa|condiment)/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  // Spices
  if (
    /(spice|pepper|salt|cumin|paprika|cinnamon|nutmeg|ginger|turmeric|curry|oregano|bay leaf|seasoning)/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  // Pantry (flour, rice, pasta, etc.)
  if (
    /(flour|sugar|rice|pasta|noodle|oil|olive oil|vegetable oil|honey|syrup|beans|lentils|chickpeas|oats|cereal|quinoa|stock|broth|can|canned)/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  // Default to Other
  return "Other";
}

/**
 * Group ingredients by category
 */
export function groupIngredientsByCategory(
  ingredients: string[]
): Record<IngredientCategory, string[]> {
  const grouped: Record<IngredientCategory, string[]> = {
    Produce: [],
    "Meat & Seafood": [],
    "Dairy & Eggs": [],
    Bakery: [],
    Pantry: [],
    Frozen: [],
    Beverages: [],
    Condiments: [],
    Spices: [],
    Other: [],
  };

  ingredients.forEach((ingredient) => {
    const category = categorizeIngredient(ingredient);
    grouped[category].push(ingredient);
  });

  return grouped;
}

/**
 * Sort categories by the standard display order
 */
export function sortCategoriesByOrder(
  categories: IngredientCategory[]
): IngredientCategory[] {
  return [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}
