// ============================================================================
// Meal Prep Types
// ============================================================================
// TypeScript types for Feature 2: Meal Prep Specific Workflows
// Including batch cooking, prep sessions, and container planning.
// ============================================================================

import type { Recipe } from "./recipe";

// ============================================================================
// Recipe Prep Data (JSONB column on recipes table)
// ============================================================================

/**
 * Prep-specific metadata stored in recipes.prep_data JSONB column.
 * This allows flexible meal prep information without schema changes.
 */
export interface RecipePrepData {
  /** Step-by-step reheating instructions */
  reheating_instructions?: string | null;

  /** How to store the prepared meal */
  storage_instructions?: string | null;

  /** Preferred container type for this recipe */
  container_type?: ContainerType | null;

  /** Whether this recipe freezes well */
  freezer_friendly?: boolean | null;

  /** How many days this keeps in the fridge */
  shelf_life_days?: number | null;

  /** General prep notes (e.g., "Sauce keeps separately") */
  prep_notes?: string | null;

  /** Default batch multiplier for meal prep */
  batch_multiplier?: number | null;

  /** Best day to eat (for meal rotation) */
  best_eat_by_day?: number | null; // 1-7 (days after prep)

  /** Components that should be stored separately */
  separate_components?: string[] | null;
}

// ============================================================================
// Prep Sessions
// ============================================================================

/**
 * Status of a prep session
 */
export type PrepSessionStatus = "planned" | "in_progress" | "completed" | "cancelled";

/**
 * A batch cooking session - e.g., "Sunday Meal Prep"
 */
export interface PrepSession {
  id: string;
  household_id: string;
  user_id: string;

  // Session metadata
  name: string;
  scheduled_date: string; // ISO date
  status: PrepSessionStatus;

  // Timing
  estimated_total_time_minutes: number | null;
  actual_start_time: string | null; // ISO timestamp
  actual_end_time: string | null; // ISO timestamp

  // Notes
  notes: string | null;
  metadata: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating/editing a prep session
 */
export interface PrepSessionFormData {
  name: string;
  scheduled_date: string;
  estimated_total_time_minutes?: number;
  notes?: string;
}

/**
 * Prep session with user info for display
 */
export interface PrepSessionWithUser extends PrepSession {
  user?: {
    id: string;
    first_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Prep session with recipes included
 */
export interface PrepSessionWithRecipes extends PrepSession {
  recipes: PrepSessionRecipeWithDetails[];
}

// ============================================================================
// Prep Session Recipes (Junction Table)
// ============================================================================

/**
 * Status of a recipe within a prep session
 */
export type PrepRecipeStatus = "pending" | "prepping" | "cooking" | "cooling" | "portioned" | "done";

/**
 * A recipe included in a prep session with batch configuration
 */
export interface PrepSessionRecipe {
  id: string;
  prep_session_id: string;
  recipe_id: string;
  household_id: string;

  // Batch configuration
  batch_multiplier: number;
  servings_to_prep: number;

  // Prep order and timing
  prep_order: number;
  estimated_prep_minutes: number | null;
  estimated_cook_minutes: number | null;

  // Container planning
  containers_needed: number;
  container_type: string | null;

  // Status tracking
  status: PrepRecipeStatus;
  completed_at: string | null;

  // Ingredient overlap
  shared_ingredients: string[];

  // Notes
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Prep session recipe with full recipe details
 */
export interface PrepSessionRecipeWithDetails extends PrepSessionRecipe {
  recipe: Pick<Recipe, "id" | "title" | "image_url" | "prep_time" | "cook_time" | "ingredients">;
}

/**
 * Form data for adding a recipe to a prep session
 */
export interface PrepSessionRecipeFormData {
  recipe_id: string;
  batch_multiplier?: number;
  servings_to_prep: number;
  prep_order?: number;
  containers_needed?: number;
  container_type?: string;
  notes?: string;
}

// ============================================================================
// Container Inventory
// ============================================================================

/**
 * Types of meal prep containers
 */
export type ContainerType =
  | "glass"
  | "plastic"
  | "silicone"
  | "mason_jar"
  | "stasher_bag"
  | "bento"
  | "other";

/**
 * A container in the household inventory
 */
export interface ContainerInventory {
  id: string;
  household_id: string;

  // Container details
  name: string;
  container_type: ContainerType;
  size_oz: number | null;
  size_ml: number | null;
  size_label: string | null; // "Small", "Medium", "Large", "32oz"

  // Inventory count
  total_count: number;
  available_count: number;

  // Features
  is_microwave_safe: boolean;
  is_freezer_safe: boolean;
  is_dishwasher_safe: boolean;
  has_dividers: boolean;

  // Visual
  color: string | null;
  brand: string | null;
  image_url: string | null;

  // Notes
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Form data for adding/editing a container
 */
export interface ContainerFormData {
  name: string;
  container_type: ContainerType;
  size_oz?: number;
  size_ml?: number;
  size_label?: string;
  total_count: number;
  is_microwave_safe?: boolean;
  is_freezer_safe?: boolean;
  is_dishwasher_safe?: boolean;
  has_dividers?: boolean;
  color?: string;
  brand?: string;
  notes?: string;
}

// ============================================================================
// Week Variety Score
// ============================================================================

/**
 * Cached variety score for a week's meal plan
 */
export interface WeekVarietyScore {
  id: string;
  household_id: string;
  week_start: string; // ISO date

  // Scores (0-100)
  protein_variety_score: number | null;
  cuisine_variety_score: number | null;
  category_variety_score: number | null;
  overall_score: number | null;

  // Breakdown
  proteins_used: string[];
  cuisines_used: string[];
  categories_used: string[];

  // Suggestions for improvement
  suggestions: VarietySuggestion[];

  // Timestamp
  calculated_at: string;
}

/**
 * A suggestion for improving meal variety
 */
export interface VarietySuggestion {
  type: "protein" | "cuisine" | "category" | "general";
  message: string;
  priority: "low" | "medium" | "high";
}

// ============================================================================
// Ingredient Overlap Analysis
// ============================================================================

/**
 * Ingredient overlap between recipes in a prep session
 */
export interface IngredientOverlap {
  ingredient: string;
  normalized: string; // Lowercase, trimmed
  recipes: {
    recipe_id: string;
    recipe_title: string;
    quantity: string;
  }[];
  total_quantity_hint: string | null; // Combined estimate
}

/**
 * Full overlap analysis for a prep session
 */
export interface PrepSessionOverlapAnalysis {
  session_id: string;
  overlapping_ingredients: IngredientOverlap[];
  unique_ingredients_count: number;
  overlap_savings_estimate: string | null; // "~15% ingredient overlap"
}

// ============================================================================
// Prep Timeline
// ============================================================================

/**
 * A step in the prep timeline
 */
export interface PrepTimelineStep {
  time_offset_minutes: number; // From start
  duration_minutes: number;
  recipe_id: string;
  recipe_title: string;
  action: "prep" | "cook" | "rest" | "portion";
  description: string;
  is_passive: boolean; // Can do other things (e.g., baking in oven)
}

/**
 * Full prep timeline for a session
 */
export interface PrepTimeline {
  session_id: string;
  total_duration_minutes: number;
  active_time_minutes: number;
  passive_time_minutes: number;
  steps: PrepTimelineStep[];
  parallel_opportunities: string[]; // Suggestions for doing things in parallel
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Recipe extended with prep data
 */
export interface RecipeWithPrepData extends Recipe {
  prep_data: RecipePrepData | null;
}

/**
 * Batch scaling result
 */
export interface BatchScaledIngredients {
  original_servings: number;
  target_servings: number;
  multiplier: number;
  ingredients: {
    original: string;
    scaled: string;
    quantity_changed: boolean;
  }[];
}

/**
 * Container recommendation for a recipe
 */
export interface ContainerRecommendation {
  recipe_id: string;
  servings: number;
  recommended_type: ContainerType;
  recommended_count: number;
  size_recommendation: string; // "Medium (32oz)"
  notes: string | null; // "Sauce in separate small container"
}
