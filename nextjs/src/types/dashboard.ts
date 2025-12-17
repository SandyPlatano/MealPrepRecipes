// Dashboard Widget Types
// For customizable home dashboard with drag-and-drop widgets

export type WidgetType =
  | 'todays_meals'
  | 'weeks_macros'
  | 'shopping_preview'
  | 'cooking_streak'
  | 'random_recipe'
  | 'expiring_soon'
  | 'recent_recipes'
  | 'favorites'
  | 'quick_add'
  | 'weather_meals'
  | 'upcoming_meals'
  | 'nutrition_summary'
  | 'folder_preview'
  | 'cooking_history'
  | 'custom_query';

export interface WidgetPosition {
  x: number;  // column position (0-11 in 12-column grid)
  y: number;  // row position (0+)
  w: number;  // width in columns (1-12)
  h: number;  // height in rows (1+)
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  config: WidgetConfig;
}

// Union type for all widget configs
export type WidgetConfig =
  | TodaysMealsConfig
  | WeeksMacrosConfig
  | ShoppingPreviewConfig
  | CookingStreakConfig
  | RandomRecipeConfig
  | ExpiringSoonConfig
  | RecentRecipesConfig
  | FavoritesConfig
  | QuickAddConfig
  | WeatherMealsConfig
  | UpcomingMealsConfig
  | NutritionSummaryConfig
  | FolderPreviewConfig
  | CookingHistoryConfig
  | CustomQueryConfig;

// Individual widget config types
export interface TodaysMealsConfig {
  showMacros?: boolean;
  showCooks?: boolean;
}

export interface WeeksMacrosConfig {
  showGoals?: boolean;
  chartType?: 'bar' | 'ring';
}

export interface ShoppingPreviewConfig {
  maxItems?: number;
  showCategories?: boolean;
}

export interface CookingStreakConfig {
  showHistory?: boolean;
}

export interface RandomRecipeConfig {
  folderId?: string | null;
  tags?: string[];
}

export interface ExpiringSoonConfig {
  daysAhead?: number;
}

export interface RecentRecipesConfig {
  limit?: number;
  showRating?: boolean;
}

export interface FavoritesConfig {
  limit?: number;
  randomize?: boolean;
}

export interface QuickAddConfig {
  presets?: ('macro' | 'recipe' | 'shopping')[];
}

export interface WeatherMealsConfig {
  location?: 'auto' | string; // 'auto' or city name
}

export interface UpcomingMealsConfig {
  daysAhead?: number;
}

export interface NutritionSummaryConfig {
  period?: 'day' | 'week';
  showTrends?: boolean;
}

export interface FolderPreviewConfig {
  folderId?: string;
  limit?: number;
}

export interface CookingHistoryConfig {
  limit?: number;
  showNotes?: boolean;
}

export interface CustomQueryConfig {
  query?: string;
  displayType?: 'list' | 'count' | 'chart';
}

// Dashboard layout (user's saved configuration)
export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  widgets: WidgetInstance[];
  createdAt: string;
  updatedAt: string;
}

// Widget preset (pre-made widget configurations)
export interface DashboardWidgetPreset {
  id: string;
  name: string;
  description: string | null;
  widgetType: WidgetType;
  defaultConfig: WidgetConfig;
  defaultSize: { w: number; h: number };
  icon: string; // emoji
  isSystem: boolean;
  createdAt: string;
}

// Widget metadata for display in picker
export interface WidgetMeta {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
}

// Widget definitions with metadata
export const WIDGET_METADATA: Record<WidgetType, WidgetMeta> = {
  todays_meals: {
    type: 'todays_meals',
    name: "Today's Meals",
    description: 'Shows meals planned for today',
    icon: '📅',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 4 },
  },
  weeks_macros: {
    type: 'weeks_macros',
    name: 'Weekly Macros',
    description: 'Macro progress for the week',
    icon: '📊',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
  },
  shopping_preview: {
    type: 'shopping_preview',
    name: 'Shopping Preview',
    description: 'Quick view of shopping list',
    icon: '🛒',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 6 },
  },
  cooking_streak: {
    type: 'cooking_streak',
    name: 'Cooking Streak',
    description: 'Track your cooking consistency',
    icon: '🔥',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 3, h: 3 },
  },
  random_recipe: {
    type: 'random_recipe',
    name: 'Random Recipe',
    description: 'Discover a random recipe',
    icon: '🎲',
    defaultSize: { w: 2, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 },
  },
  expiring_soon: {
    type: 'expiring_soon',
    name: 'Expiring Soon',
    description: 'Pantry items expiring soon',
    icon: '⏰',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 },
  },
  recent_recipes: {
    type: 'recent_recipes',
    name: 'Recent Recipes',
    description: 'Recently added recipes',
    icon: '🆕',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 5 },
  },
  favorites: {
    type: 'favorites',
    name: 'Favorites',
    description: 'Your favorite recipes',
    icon: '❤️',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 5 },
  },
  quick_add: {
    type: 'quick_add',
    name: 'Quick Add',
    description: 'Quick action buttons',
    icon: '⚡',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 2 },
  },
  weather_meals: {
    type: 'weather_meals',
    name: 'Weather Meals',
    description: 'Meal suggestions based on weather',
    icon: '🌤️',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 },
  },
  upcoming_meals: {
    type: 'upcoming_meals',
    name: 'Upcoming Meals',
    description: 'Meals for the next few days',
    icon: '📆',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
  },
  nutrition_summary: {
    type: 'nutrition_summary',
    name: 'Nutrition Summary',
    description: 'Daily/weekly nutrition overview',
    icon: '🥗',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
  },
  folder_preview: {
    type: 'folder_preview',
    name: 'Folder Preview',
    description: 'Preview recipes from a folder',
    icon: '📁',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 },
  },
  cooking_history: {
    type: 'cooking_history',
    name: 'Cooking History',
    description: 'Recent cooking activity',
    icon: '📜',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    maxSize: { w: 4, h: 6 },
  },
  custom_query: {
    type: 'custom_query',
    name: 'Custom Query',
    description: 'Advanced: custom data query',
    icon: '🔮',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 6 },
  },
};

// Default dashboard layout for new users
export const DEFAULT_DASHBOARD_WIDGETS: WidgetInstance[] = [
  {
    id: 'w1',
    type: 'todays_meals',
    position: { x: 0, y: 0, w: 4, h: 3 },
    config: { showMacros: true, showCooks: true },
  },
  {
    id: 'w2',
    type: 'weeks_macros',
    position: { x: 4, y: 0, w: 4, h: 3 },
    config: { chartType: 'ring', showGoals: true },
  },
  {
    id: 'w3',
    type: 'cooking_streak',
    position: { x: 8, y: 0, w: 2, h: 2 },
    config: { showHistory: true },
  },
  {
    id: 'w4',
    type: 'shopping_preview',
    position: { x: 0, y: 3, w: 3, h: 3 },
    config: { maxItems: 8, showCategories: true },
  },
  {
    id: 'w5',
    type: 'favorites',
    position: { x: 3, y: 3, w: 3, h: 3 },
    config: { limit: 4, randomize: false },
  },
];
