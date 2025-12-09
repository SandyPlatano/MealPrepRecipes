"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";
import { useMemo } from "react";
import type { PantryItem } from "@/types/shopping-list";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
}

interface Assignment {
  id: string;
  recipe_id: string;
  recipe: Recipe;
}

interface CheckoutShoppingListProps {
  assignments: Assignment[];
  pantryItems: PantryItem[];
}

// Simple ingredient parser (reused from shopping-list actions)
function parseIngredient(ingredient: string): MergeableItem {
  // Pattern: "2 cups flour" or "1/2 lb chicken" or "3 large eggs"
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|oz|lb|lbs?|g|kg|ml|l|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim() || undefined,
      unit: quantityMatch[2]?.trim() || undefined,
      ingredient: quantityMatch[3]?.trim() || ingredient,
      category: guessCategory(ingredient),
    };
  }

  return {
    ingredient: ingredient.trim(),
    category: guessCategory(ingredient),
  };
}

// Guess ingredient category based on keywords
function guessCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  if (
    /milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  if (/bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette/i.test(lower)) {
    return "Bakery";
  }

  if (
    /flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  if (
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  if (
    /ketchup|mustard|mayo|mayonnaise|relish|hot sauce|bbq|dressing|salsa/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  if (/juice|soda|water|coffee|tea|wine|beer/i.test(lower)) {
    return "Beverages";
  }

  return "Other";
}

export function CheckoutShoppingList({
  assignments,
  pantryItems,
}: CheckoutShoppingListProps) {
  // Generate shopping list from all assignments
  const { groupedItems, totalCount, pantryCount } = useMemo(() => {
    const ingredientsToAdd: MergeableItem[] = [];

    // Collect all ingredients
    for (const assignment of assignments) {
      if (assignment.recipe && assignment.recipe.ingredients) {
        for (const ingredient of assignment.recipe.ingredients) {
          const parsed = parseIngredient(ingredient);
          ingredientsToAdd.push({
            ...parsed,
            recipe_id: assignment.recipe.id,
            recipe_title: assignment.recipe.title,
          });
        }
      }
    }

    // Merge duplicate ingredients
    const mergedItems = mergeShoppingItems(ingredientsToAdd);

    // Create pantry lookup
    const pantryLookup = new Set(
      pantryItems.map((p) => p.normalized_ingredient)
    );

    // Mark items in pantry and group by category
    const itemsWithPantryStatus = mergedItems.map((item) => ({
      ...item,
      is_in_pantry: pantryLookup.has(normalizeIngredientName(item.ingredient)),
    }));

    // Group by category
    const grouped: Record<string, typeof itemsWithPantryStatus> = {};
    for (const item of itemsWithPantryStatus) {
      const category = item.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }

    // Sort categories
    const categoryOrder = [
      "Produce",
      "Meat & Seafood",
      "Dairy & Eggs",
      "Bakery",
      "Frozen",
      "Pantry",
      "Spices",
      "Condiments",
      "Beverages",
      "Other",
    ];

    const sortedGrouped: Record<string, typeof itemsWithPantryStatus> = {};
    categoryOrder.forEach((cat) => {
      if (grouped[cat]) {
        sortedGrouped[cat] = grouped[cat];
      }
    });

    // Add any remaining categories not in the order
    Object.keys(grouped).forEach((cat) => {
      if (!sortedGrouped[cat]) {
        sortedGrouped[cat] = grouped[cat];
      }
    });

    const total = itemsWithPantryStatus.length;
    const inPantry = itemsWithPantryStatus.filter(
      (item) => item.is_in_pantry
    ).length;

    return {
      groupedItems: sortedGrouped,
      totalCount: total,
      pantryCount: inPantry,
    };
  }, [assignments, pantryItems]);

  const categories = Object.keys(groupedItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalCount} items</span>
            {pantryCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {pantryCount} in pantry
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No ingredients found
          </p>
        ) : (
          categories.map((category) => {
            const items = groupedItems[category];
            const categoryItemCount = items.length;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{category}</h3>
                  <Badge variant="outline" className="text-xs">
                    {categoryItemCount}
                  </Badge>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, index) => {
                    const displayText = [item.quantity, item.unit, item.ingredient]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <li
                        key={`${category}-${index}`}
                        className={`flex items-start gap-2 text-sm ${
                          item.is_in_pantry
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        <span className="mt-1.5 flex-shrink-0">
                          {item.is_in_pantry ? (
                            <Package className="h-3 w-3" />
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                          )}
                        </span>
                        <span className="flex-1">{displayText}</span>
                        {item.sources.length > 1 && !item.is_in_pantry && (
                          <Badge variant="secondary" className="text-xs">
                            {item.sources.length} recipes
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

