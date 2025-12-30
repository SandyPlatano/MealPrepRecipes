/**
 * Shopping List Actions Index
 *
 * Re-exports all shopping list actions from modular files.
 * Import from '@/app/actions/shopping-list' for all shopping list functionality.
 */

// Read operations
export { getOrCreateShoppingList, getShoppingListWithItems } from "./read";

// Item operations
export { addShoppingListItem, toggleShoppingListItem, removeShoppingListItem } from "./items";

// Bulk operations
export { clearCheckedItems, clearShoppingList, removeItemsByRecipeId } from "./bulk";

// Generation
export { generateFromMealPlan, generateMultiWeekShoppingList } from "./generation";
