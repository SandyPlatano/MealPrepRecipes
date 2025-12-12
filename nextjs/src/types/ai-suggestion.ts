export interface AISuggestionRecipe {
  day: string; // Monday, Tuesday, etc.
  recipe_id: string | null; // null if new AI-generated recipe
  title: string;
  cuisine: string;
  protein_type: string;
  prep_time: number; // minutes
  cook_time?: number;
  servings: number;
  ingredients: Array<{
    item: string;
    quantity: string;
    notes?: string;
  }>;
  instructions: string[];
  reason: string; // Why AI suggested this recipe
  tags?: string[];
  allergen_tags?: string[];
}

export interface AISuggestionResponse {
  suggestions: AISuggestionRecipe[];
  remaining_regenerations: number | null; // null = unlimited
  week_start: string;
}

export interface AISuggestionRequest {
  week_start: string;
  locked_days?: string[]; // Days user doesn't want to change
  preferences?: {
    max_complex_recipes?: number;
    preferred_cuisines?: string[];
    avoid_cuisines?: string[];
  };
}

export interface AISuggestionLog {
  id: string;
  household_id: string;
  week_start: string; // ISO date string (Monday)
  suggestions: AISuggestionRecipe[];
  accepted_count: number;
  regeneration_number: number; // Track which regeneration this was
  created_at: string;
}

export interface AISuggestionContext {
  user_recipes: Array<{
    id: string;
    title: string;
    cuisine: string;
    protein_type: string;
    prep_time: number;
    cook_time: number;
    rating: number | null;
    servings: number;
    base_servings: number;
    tags: string[];
  }>;
  recent_history: Array<{
    recipe_id: string;
    recipe_title: string;
    cooked_at: string;
    rating: number | null;
  }>;
  favorites: string[]; // recipe IDs
  allergen_alerts: string[];
  dietary_restrictions: string[];
  household_size: number;
  locked_days: string[];
}
