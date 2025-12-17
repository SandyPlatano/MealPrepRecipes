/**
 * Quick Cook Types
 * "What Should I Cook Right Now?" feature
 *
 * Chaos-friendly, just-in-time meal suggestions for neurodivergent users
 * and budget-conscious families.
 */

export type TimeAvailable = 5 | 15 | 30 | 45 | 60;

export type EnergyLevel = 'zombie' | 'meh' | 'got_this';

export type Difficulty = 'brain-dead-simple' | 'doable' | 'ambitious';

export interface QuickCookRequest {
  timeAvailable: TimeAvailable;
  energyLevel: EnergyLevel;
  ingredientsOnHand?: string[];
  servings?: number;
}

export interface QuickCookIngredient {
  item: string;
  quantity: string;
  notes?: string;
  affiliate_search_term?: string; // For grocery linking (more specific search term)
}

export interface QuickCookSuggestion {
  recipe_id: string | null; // null if AI-generated new recipe
  title: string;
  cuisine: string;
  total_time: number; // minutes (prep + cook)
  active_time: number; // minutes of actual work
  reason: string; // Chaos-friendly, empathetic reasoning
  ingredients: QuickCookIngredient[];
  instructions: string[];
  estimated_cost?: string; // "~$12 for 4 servings"
  difficulty: Difficulty;
  servings: number;
  protein_type?: string;
  tags?: string[];
}

export interface QuickCookResponse {
  suggestion: QuickCookSuggestion;
  remaining_uses: number | null; // null = unlimited
  uses_today: number;
}

export interface QuickCookLog {
  id: string;
  user_id: string;
  household_id: string;
  request: QuickCookRequest;
  suggestion: QuickCookSuggestion;
  accepted: boolean | null; // null = not yet decided
  regeneration_count: number;
  affiliate_clicked: boolean;
  created_at: string;
}

/**
 * Energy level configuration
 * Maps energy levels to recipe constraints
 */
export const ENERGY_LEVEL_CONFIG: Record<
  EnergyLevel,
  {
    label: string;
    emoji: string;
    description: string;
    maxIngredients: number;
    maxActiveTime: number; // minutes
    preferredTypes: string[];
    avoidTypes: string[];
  }
> = {
  zombie: {
    label: 'Zombie Mode',
    emoji: '🧟',
    description: "I can barely function. Give me something brain-dead simple.",
    maxIngredients: 5,
    maxActiveTime: 10,
    preferredTypes: ['one-pot', 'sheet-pan', 'microwave', 'no-cook', 'assembly'],
    avoidTypes: ['complex', 'multi-step', 'precise-timing'],
  },
  meh: {
    label: 'Meh, I Guess',
    emoji: '😐',
    description: "I have some energy. Nothing too fancy though.",
    maxIngredients: 8,
    maxActiveTime: 20,
    preferredTypes: ['quick', 'simple', 'weeknight'],
    avoidTypes: ['complex', 'labor-intensive'],
  },
  got_this: {
    label: 'I Got This',
    emoji: '💪',
    description: "Feeling capable. Bring on a real recipe!",
    maxIngredients: 15,
    maxActiveTime: 45,
    preferredTypes: [], // No restrictions
    avoidTypes: [],
  },
};

/**
 * Time options for the selector
 */
export const TIME_OPTIONS: Array<{
  value: TimeAvailable;
  label: string;
  description: string;
}> = [
  { value: 5, label: '5 min', description: 'Basically instant' },
  { value: 15, label: '15 min', description: 'Quick bite' },
  { value: 30, label: '30 min', description: 'Standard weeknight' },
  { value: 45, label: '45 min', description: 'Taking my time' },
  { value: 60, label: '60+ min', description: 'No rush today' },
];

/**
 * Quick cook quota configuration by subscription tier
 */
export const QUICK_COOK_QUOTA: Record<
  'free' | 'pro' | 'premium',
  { daily: number | null; label: string }
> = {
  free: { daily: 5, label: '5 per day' },
  pro: { daily: 20, label: '20 per day' },
  premium: { daily: null, label: 'Unlimited' },
};
