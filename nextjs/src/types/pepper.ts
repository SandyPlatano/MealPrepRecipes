// Pepper: Conversational Recipe Assistant Types

// ─────────────────────────────────────────────────────────────
// Database Types
// ─────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  household_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: ChatMessageMetadata;
  created_at: string;
}

export interface ChatMessageMetadata {
  recipes_mentioned?: string[];
  actions_taken?: PepperAction[];
  tool_calls?: PepperToolCall[];
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Tool Types
// ─────────────────────────────────────────────────────────────

export type PepperToolName =
  | 'search_recipes'
  | 'add_to_meal_plan'
  | 'add_to_shopping_list'
  | 'get_recipe_details'
  | 'get_pantry_items';

export interface PepperToolCall {
  name: PepperToolName;
  input: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export interface PepperAction {
  type: 'recipe_suggested' | 'added_to_plan' | 'added_to_shopping' | 'recipe_opened';
  entity_id?: string;
  entity_name?: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────
// Context Types (what Pepper knows about the user)
// ─────────────────────────────────────────────────────────────

export interface PepperContext {
  // User's recipe collection
  recipes: PepperRecipeSummary[];

  // Pantry inventory
  pantry: PepperPantryItem[];

  // User preferences
  preferences: PepperPreferences;

  // Recent meal history (last 30 days)
  mealHistory: PepperMealHistory[];

  // Current week's meal plan
  currentMealPlan: PepperMealPlanSummary | null;

  // Conversation context
  recentMessages: ChatMessage[];
}

export interface PepperRecipeSummary {
  id: string;
  title: string;
  ingredients: string[]; // Just ingredient names for matching
  tags: string[];
  cuisine?: string;
  protein_type?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  rating?: number;
  times_cooked: number;
  last_cooked?: string;
}

export interface PepperPantryItem {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  expires_at?: string;
}

export interface PepperPreferences {
  dietary_restrictions: string[];
  allergens: string[];
  favorite_cuisines: string[];
  disliked_ingredients: string[];
  household_size: number;
  cooking_skill_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface PepperMealHistory {
  recipe_id: string;
  recipe_title: string;
  cooked_at: string;
  rating?: number;
}

export interface PepperMealPlanSummary {
  week_start: string;
  assignments: {
    day: string;
    meal_type: string;
    recipe_title: string;
    recipe_id: string;
  }[];
}

// ─────────────────────────────────────────────────────────────
// API Types
// ─────────────────────────────────────────────────────────────

export interface PepperChatRequest {
  message: string;
  session_id?: string; // Optional - creates new session if not provided
}

export interface PepperChatResponse {
  session_id: string;
  message: ChatMessage;
  suggested_recipes?: PepperRecipeSuggestion[];
  actions_taken?: PepperAction[];
}

export interface PepperRecipeSuggestion {
  id: string;
  title: string;
  match_reason: string; // "You have 90% of ingredients"
  prep_time: number;
  cook_time: number;
  missing_ingredients?: string[];
  pantry_match_percentage: number;
}

// ─────────────────────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────────────────────

export interface PepperUIState {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  currentSessionId: string | null;
  messages: ChatMessage[];
  unreadCount: number;
}

export type PepperQuickAction =
  | 'plan_week'
  | 'shopping_help'
  | 'what_can_i_make'
  | 'cooking_tips';

export interface PepperQuickActionConfig {
  id: PepperQuickAction;
  label: string;
  emoji: string;
  prompt: string;
}

export const PEPPER_QUICK_ACTIONS: PepperQuickActionConfig[] = [
  {
    id: 'what_can_i_make',
    label: 'What can I make?',
    emoji: '🍳',
    prompt: "What can I make with what's in my pantry?"
  },
  {
    id: 'plan_week',
    label: 'Plan my week',
    emoji: '🥗',
    prompt: 'Help me plan meals for this week'
  },
  {
    id: 'shopping_help',
    label: 'Shopping help',
    emoji: '🛒',
    prompt: "What do I need to buy for this week's meals?"
  },
  {
    id: 'cooking_tips',
    label: 'Cooking tips',
    emoji: '❓',
    prompt: 'I have a cooking question'
  }
];
