// Cooking history types for tracking when recipes are cooked

export interface CookingHistoryEntry {
  id: string;
  recipe_id: string;
  household_id: string;
  cooked_by: string | null; // user_id of who cooked it
  cooked_at: string; // ISO timestamp
  rating: number | null; // 1-5 star rating
  notes: string | null;
  modifications: string | null; // what the user changed in the recipe
  photo_url: string | null; // URL to uploaded photo
  created_at: string;
}

export interface CookingHistoryWithRecipe extends CookingHistoryEntry {
  recipe: {
    id: string;
    title: string;
    recipe_type: string;
    category: string | null;
    protein_type: string | null;
    image_url?: string | null;
  } | null;
  cooked_by_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface MarkAsCookedInput {
  recipe_id: string;
  cooked_at?: string;
  rating?: number;
  notes?: string;
  modifications?: string;
}
