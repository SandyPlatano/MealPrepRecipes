// Recipe types matching the database schema

import type { RecipeNutrition } from "./nutrition";

export type RecipeType =
  | "Dinner"
  | "Baking"
  | "Breakfast"
  | "Dessert"
  | "Snack"
  | "Side Dish";

export interface Recipe {
  id: string;
  title: string;
  recipe_type: RecipeType;
  category: string | null;
  protein_type: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  base_servings: number | null; // Numeric servings for scaling
  ingredients: string[];
  instructions: string[];
  tags: string[];
  notes: string | null;
  source_url: string | null;
  image_url: string | null;
  rating: number | null;
  allergen_tags: string[]; // Manual allergen tags
  user_id: string;
  household_id: string | null;
  is_shared_with_household: boolean;
  created_at: string;
  updated_at: string;
}

// Recipe with nutrition data
export interface RecipeWithNutrition extends Recipe {
  nutrition?: RecipeNutrition | null;
}

// Form data for creating/editing recipes
export interface RecipeFormData {
  title: string;
  recipe_type: RecipeType;
  category?: string;
  protein_type?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: string;
  base_servings?: number; // Numeric servings for scaling
  ingredients: string[];
  instructions: string[];
  tags: string[];
  notes?: string;
  source_url?: string;
  image_url?: string;
  allergen_tags?: string[]; // Manual allergen tags
  is_shared_with_household?: boolean;
}

// Recipe with favorite status for display
export interface RecipeWithFavorite extends Recipe {
  is_favorite: boolean;
}

// Filters for recipe list
export interface RecipeFilters {
  search?: string;
  recipe_type?: RecipeType | "all";
  category?: string;
  tags?: string[];
  favorites_only?: boolean;
}
