// AI-Powered Ingredient Substitution Types

/**
 * Reason for requesting a substitution
 */
export type SubstitutionReason =
  | 'unavailable'      // Item not available at store
  | 'dietary'          // Conflicts with dietary restrictions
  | 'budget'           // Looking for cheaper alternative
  | 'pantry_first'     // Prefer using what's already in pantry
  | 'preference';      // Personal preference

/**
 * Budget tier comparison for substitution suggestions
 */
export type BudgetTier = 'cheaper' | 'same' | 'pricier';

/**
 * Feedback for substitution quality (for learning)
 */
export type SubstitutionFeedback = 'worked' | 'ok' | 'poor';

/**
 * Request payload for AI substitution suggestions
 */
export interface SubstitutionRequest {
  item_id: string;
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
  reason: SubstitutionReason;
}

/**
 * Individual substitution suggestion from AI
 */
export interface SubstitutionSuggestion {
  substitute: string;
  quantity: string;
  unit?: string;
  match_score: number;          // 0-100, higher is better match
  reason: string;               // Why this substitution works
  preparation_note?: string;    // Any special prep needed
  dietary_flags: string[];      // e.g., ['dairy-free', 'vegan']
  in_pantry: boolean;           // User already has this
  budget_tier: BudgetTier;
  nutritional_note?: string;    // Nutritional comparison
}

/**
 * Full context for generating substitution suggestions
 */
export interface SubstitutionContext {
  original_ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  recipe_title?: string | null;
  recipe_role?: string;           // e.g., "binding agent", "primary protein"
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  pantry_items: string[];
  reason: SubstitutionReason;
}

/**
 * API response for substitution suggestions
 */
export interface SubstitutionResponse {
  suggestions: SubstitutionSuggestion[];
  original_ingredient: string;
  context: {
    recipe_title?: string;
    allergens_avoided: string[];
    dietary_restrictions_honored: string[];
  };
  quota_remaining: number | null;  // null for unlimited (Premium)
}

/**
 * Error response for substitution API
 */
export interface SubstitutionError {
  type: 'quota_exceeded' | 'rate_limited' | 'no_substitutes' | 'ai_error' | 'unauthorized';
  message: string;
  retry_after?: number;         // seconds until retry (for rate limiting)
  reset_at?: string;            // ISO date when quota resets
}

/**
 * Input for accepting a substitution
 */
export interface AcceptSubstitutionInput {
  item_id: string;
  original_ingredient: string;
  substitute: SubstitutionSuggestion;
  action: 'replace' | 'add_new' | 'mark_unavailable';
}

/**
 * Substitution log entry (for learning and analytics)
 */
export interface SubstitutionLog {
  id: string;
  household_id: string;
  user_id: string;
  original_ingredient: string;
  original_quantity?: string | null;
  original_unit?: string | null;
  chosen_substitute: string;
  substitute_quantity?: string | null;
  substitute_unit?: string | null;
  reason: SubstitutionReason;
  recipe_id?: string | null;
  match_score: number;
  feedback?: SubstitutionFeedback | null;
  ai_suggestions?: SubstitutionSuggestion[];  // All suggestions for learning
  created_at: string;
}

/**
 * Quota information for substitutions
 */
export interface SubstitutionQuota {
  remaining: number | null;      // null = unlimited
  limit: number | null;          // null = unlimited
  reset_at: string | null;       // ISO date
  tier: 'free' | 'pro' | 'premium';
}

/**
 * UI state for substitution sheet
 */
export interface SubstitutionSheetState {
  isOpen: boolean;
  item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null;
  reason: SubstitutionReason;
  suggestions: SubstitutionSuggestion[];
  isLoading: boolean;
  error: SubstitutionError | null;
}

// Error messages for UI
export const SUBSTITUTION_ERROR_MESSAGES: Record<SubstitutionError['type'], string> = {
  quota_exceeded: 'Weekly substitution limit reached. Upgrade to Premium or wait until Monday.',
  rate_limited: 'Too many requests. Please wait a moment.',
  no_substitutes: 'No suitable substitutes found for your dietary needs.',
  ai_error: 'Unable to generate suggestions. Please try again.',
  unauthorized: 'Please log in to use AI substitutions.',
};

// Default quota by tier
export const SUBSTITUTION_QUOTA_BY_TIER = {
  free: 0,
  pro: 20,
  premium: null,  // unlimited
} as const;
