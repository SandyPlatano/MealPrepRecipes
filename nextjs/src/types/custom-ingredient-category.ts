/**
 * Custom Ingredient Category Types
 * Allows users to customize shopping list categories
 */

export interface CustomIngredientCategory {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  sortOrder: number;
  isSystem: boolean;
  parentCategoryId: string | null;
  defaultStoreId: string | null;
  createdAt: string;
}

export interface CustomIngredientCategoryFormData {
  name: string;
  emoji: string;
  color: string;
  parentCategoryId?: string | null;
  defaultStoreId?: string | null;
}
