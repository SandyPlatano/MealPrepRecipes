// Recipe Lifecycle & Moods Types
// For tracking recipe journey stages and tagging recipes with moods/occasions

export interface RecipeLifecycleStage {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  description: string | null;
  sortOrder: number;
  isSystem: boolean;
  isDefault: boolean; // which stage new recipes get
  createdAt: string;
  updatedAt: string;
}

export interface RecipeLifecycleStageFormData {
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
  isDefault?: boolean;
}

export interface RecipeMood {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  description: string | null;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeMoodFormData {
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
}

export interface RecipeMoodAssignment {
  id: string;
  recipeId: string;
  moodId: string;
  createdAt: string;
}

// For displaying a recipe's moods
export interface RecipeMoodInfo {
  moodId: string;
  moodName: string;
  moodSlug: string;
  moodEmoji: string;
  moodColor: string;
}

// Default lifecycle stages
export const DEFAULT_LIFECYCLE_STAGES: Omit<RecipeLifecycleStage, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Want to Try',
    slug: 'want-to-try',
    emoji: '🤔',
    color: '#f59e0b',
    description: 'Recipes saved but not yet tested',
    sortOrder: 0,
    isSystem: true,
    isDefault: true,
  },
  {
    name: 'Tested - Needs Work',
    slug: 'needs-work',
    emoji: '🔧',
    color: '#ef4444',
    description: 'Tried it, needs recipe adjustments',
    sortOrder: 1,
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Approved',
    slug: 'approved',
    emoji: '✅',
    color: '#10b981',
    description: 'Tested and approved for regular rotation',
    sortOrder: 2,
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Family Favorite',
    slug: 'favorite',
    emoji: '⭐',
    color: '#6366f1',
    description: 'A household favorite, make often',
    sortOrder: 3,
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Retired',
    slug: 'retired',
    emoji: '📦',
    color: '#6b7280',
    description: 'No longer making this recipe',
    sortOrder: 4,
    isSystem: true,
    isDefault: false,
  },
];

// Default moods
export const DEFAULT_MOODS: Omit<RecipeMood, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Comfort Food',
    slug: 'comfort-food',
    emoji: '🛋️',
    color: '#f59e0b',
    description: 'Cozy, soul-satisfying meals',
    sortOrder: 0,
    isSystem: true,
  },
  {
    name: 'Date Night',
    slug: 'date-night',
    emoji: '💕',
    color: '#ec4899',
    description: 'Romantic, special occasion meals',
    sortOrder: 1,
    isSystem: true,
  },
  {
    name: 'Weeknight Quick',
    slug: 'weeknight-quick',
    emoji: '⚡',
    color: '#10b981',
    description: 'Fast meals for busy weeknights',
    sortOrder: 2,
    isSystem: true,
  },
  {
    name: 'Sunday Project',
    slug: 'sunday-project',
    emoji: '👨‍🍳',
    color: '#6366f1',
    description: 'Recipes worth spending time on',
    sortOrder: 3,
    isSystem: true,
  },
  {
    name: 'Entertaining',
    slug: 'entertaining',
    emoji: '🎉',
    color: '#8b5cf6',
    description: 'Great for hosting guests',
    sortOrder: 4,
    isSystem: true,
  },
  {
    name: 'Meal Prep Friendly',
    slug: 'meal-prep',
    emoji: '📦',
    color: '#14b8a6',
    description: 'Stores and reheats well',
    sortOrder: 5,
    isSystem: true,
  },
  {
    name: 'Kid Approved',
    slug: 'kid-approved',
    emoji: '👶',
    color: '#f97316',
    description: 'Recipes the kids love',
    sortOrder: 6,
    isSystem: true,
  },
  {
    name: 'Healthy',
    slug: 'healthy',
    emoji: '🥗',
    color: '#22c55e',
    description: 'Nutritious and balanced',
    sortOrder: 7,
    isSystem: true,
  },
  {
    name: 'Indulgent',
    slug: 'indulgent',
    emoji: '🍫',
    color: '#a855f7',
    description: 'Treat yourself meals',
    sortOrder: 8,
    isSystem: true,
  },
  {
    name: 'Budget Friendly',
    slug: 'budget',
    emoji: '💰',
    color: '#eab308',
    description: 'Easy on the wallet',
    sortOrder: 9,
    isSystem: true,
  },
];

// Color palette for lifecycle stages and moods
export const LIFECYCLE_COLOR_PALETTE = [
  { key: 'amber', color: '#f59e0b', label: 'Amber' },
  { key: 'red', color: '#ef4444', label: 'Red' },
  { key: 'emerald', color: '#10b981', label: 'Emerald' },
  { key: 'indigo', color: '#6366f1', label: 'Indigo' },
  { key: 'gray', color: '#6b7280', label: 'Gray' },
  { key: 'orange', color: '#f97316', label: 'Orange' },
  { key: 'pink', color: '#ec4899', label: 'Pink' },
  { key: 'violet', color: '#8b5cf6', label: 'Violet' },
  { key: 'teal', color: '#14b8a6', label: 'Teal' },
  { key: 'green', color: '#22c55e', label: 'Green' },
  { key: 'purple', color: '#a855f7', label: 'Purple' },
  { key: 'yellow', color: '#eab308', label: 'Yellow' },
  { key: 'cyan', color: '#06b6d4', label: 'Cyan' },
  { key: 'blue', color: '#3b82f6', label: 'Blue' },
  { key: 'rose', color: '#f43f5e', label: 'Rose' },
  { key: 'lime', color: '#84cc16', label: 'Lime' },
] as const;

// Mood emoji suggestions by category
export const MOOD_EMOJI_SUGGESTIONS = {
  feelings: ['😊', '🥰', '😌', '🤗', '😋', '🤤', '😍', '🥺'],
  occasions: ['🎉', '🎂', '🎄', '🎃', '❤️', '💕', '🌟', '✨'],
  cooking: ['👨‍🍳', '👩‍🍳', '🍳', '🔥', '⚡', '⏰', '📦', '🥡'],
  food: ['🍕', '🍔', '🌮', '🍜', '🥗', '🍰', '🍫', '🍪'],
  weather: ['☀️', '❄️', '🌧️', '🍂', '🌸', '🏖️', '⛷️', '🏕️'],
  health: ['💪', '🧘', '🏃', '💚', '🌱', '🥬', '🥑', '🍎'],
};
