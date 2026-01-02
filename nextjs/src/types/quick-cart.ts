// ============================================================================
// Quick Cart Types
// Types for the global quick shopping cart bubble and panel (enhanced modal)
// ============================================================================

import type { ShoppingListItem, NewShoppingListItem } from "./shopping-list";
import type { UnitSystem } from "@/lib/ingredient-scaler";

export type ShoppingItemSource =
  | "meal_plan"
  | "quick_add"
  | "recipe_direct"
  | "manual";

export interface QuickCartState {
  isOpen: boolean;
  items: ShoppingListItem[];
  isLoading: boolean;
  error: string | null;
  // Enhanced modal state
  storeMode: boolean;
  showRecipeSources: boolean;
  expandedCategories: Set<string>;
  categoryOrder: string[] | null;
  pantryIngredients: Set<string>;
  substitutionItem: SubstitutionItem | null;
  userUnitSystem: UnitSystem;
}

export interface SubstitutionItem {
  id: string;
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

export interface QuickCartContextValue extends QuickCartState {
  // UI actions
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Item actions
  addItem: (
    item: NewShoppingListItem,
    source: ShoppingItemSource
  ) => Promise<void>;
  addItemsFromRecipe: (
    ingredients: string[],
    recipeId: string,
    recipeTitle: string
  ) => Promise<AddFromRecipeResult>;
  toggleItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  // Bulk actions
  clearCheckedItems: () => Promise<void>;
  clearAllItems: () => Promise<void>;
  removeRecipeItems: (recipeId: string, recipeTitle: string) => Promise<void>;
  refreshFromMealPlan: () => Promise<void>;

  // Enhanced modal actions
  toggleStoreMode: () => void;
  toggleRecipeSources: () => void;
  toggleCategoryExpanded: (category: string) => void;
  updateCategoryOrder: (order: string[]) => Promise<void>;
  togglePantryItem: (ingredient: string, isInPantry: boolean) => void;
  setSubstitutionItem: (item: SubstitutionItem | null) => void;
  copyToClipboard: () => Promise<void>;

  // Computed
  itemCount: number;
  checkedCount: number;
  uncheckedCount: number;

  // Refresh
  refresh: () => Promise<void>;
}

export interface AddFromRecipeResult {
  added: number;
  skipped: number;
  error: string | null;
}

export interface AddIngredientsPreview {
  newItems: string[];
  existingItems: string[];
  recipeTitle: string;
}
