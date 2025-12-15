import type { Recipe } from "./recipe";
import type { DayOfWeek } from "./meal-plan";

export interface CartItem {
  id: string;
  recipeId: string;
  recipe: Recipe;
  cook: string | null;
  day: DayOfWeek | null;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  weekStart: string; // ISO date string for Monday of the week
}

export function createCartItem(recipe: Recipe): CartItem {
  return {
    id: crypto.randomUUID(),
    recipeId: recipe.id,
    recipe,
    cook: null,
    day: null,
    addedAt: new Date().toISOString(),
  };
}

export function createCartItemWithAssignment(
  recipe: Recipe,
  day: DayOfWeek,
  cook: string | null
): CartItem {
  return {
    id: crypto.randomUUID(),
    recipeId: recipe.id,
    recipe,
    cook,
    day,
    addedAt: new Date().toISOString(),
  };
}

export function getAssignedItems(items: CartItem[]): CartItem[] {
  return items.filter((item) => item.cook !== null && item.day !== null);
}

export function isFullyAssigned(item: CartItem): boolean {
  return item.cook !== null && item.day !== null;
}
