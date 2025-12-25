# MealPrepRecipes Codebase Context

Generated: Mon Dec 22 17:06:22 EST 2025

## Project Structure
```
src/app/(app)/app/confirmation/page.tsx
src/app/(app)/app/history/page.tsx
src/app/(app)/app/impact/page.tsx
src/app/(app)/app/nutrition/costs/nutrition-costs-client.tsx
src/app/(app)/app/nutrition/costs/page.tsx
src/app/(app)/app/nutrition/help/page.tsx
src/app/(app)/app/nutrition/loading.tsx
src/app/(app)/app/nutrition/page.tsx
src/app/(app)/app/page.tsx
src/app/(app)/app/pantry/page.tsx
src/app/(app)/app/plan/page.tsx
src/app/(app)/app/recipes/[id]/cook/page.tsx
src/app/(app)/app/recipes/[id]/edit/page.tsx
src/app/(app)/app/recipes/[id]/page.tsx
src/app/(app)/app/recipes/[id]/print/page.tsx
src/app/(app)/app/recipes/discover/page.tsx
src/app/(app)/app/recipes/new/page.tsx
src/app/(app)/app/recipes/page.tsx
src/app/(app)/app/review/page.tsx
src/app/(app)/app/settings/appearance/page.tsx
src/app/(app)/app/settings/billing/page.tsx
src/app/(app)/app/settings/cooking-mode/content.tsx
src/app/(app)/app/settings/cooking-mode/page.tsx
src/app/(app)/app/settings/data/page.tsx
src/app/(app)/app/settings/dietary/page.tsx
src/app/(app)/app/settings/difficulty/page.tsx
src/app/(app)/app/settings/feedback/page.tsx
src/app/(app)/app/settings/household/page.tsx
src/app/(app)/app/settings/layout.tsx
src/app/(app)/app/settings/meal-planning/page.tsx
src/app/(app)/app/settings/page.tsx
src/app/(app)/app/settings/profile/page.tsx
src/app/(app)/app/settings/recipe-layout/page.tsx
src/app/(app)/app/settings/shortcuts/page.tsx
src/app/(app)/app/settings/sidebar/page.tsx
src/app/(app)/app/shop/page.tsx
src/app/(app)/app/stats/impact/page.tsx
src/app/(app)/app/stats/layout.tsx
src/app/(app)/app/stats/nutrition/costs/nutrition-costs-client.tsx
src/app/(app)/app/stats/nutrition/costs/page.tsx
src/app/(app)/app/stats/nutrition/help/page.tsx
src/app/(app)/app/stats/nutrition/page.tsx
src/app/(app)/app/stats/page.tsx
src/app/(app)/app/u/[username]/page.tsx
src/app/(app)/error.tsx
src/app/(app)/layout.tsx
src/app/(app)/loading.tsx
src/app/(app)/profile/[username]/page.tsx
src/app/(marketing)/about/page.tsx
src/app/(marketing)/landing-a/page.tsx
src/app/(marketing)/landing-b/page.tsx
src/app/(marketing)/layout.tsx
src/app/(marketing)/pricing/page.tsx
src/app/(marketing)/pricing/pricing-cards-client.tsx
src/app/(marketing)/privacy/page.tsx
src/app/(marketing)/terms/page.tsx
src/app/auth/callback/route.ts
src/app/auth/google/callback/page.tsx
src/app/invite/[token]/page.tsx
src/app/opengraph-image.tsx
src/app/robots.ts
src/app/sitemap.ts
src/contexts/difficulty-thresholds-context.tsx
src/contexts/global-search-context.tsx
src/contexts/settings-context.tsx
src/types/ai-suggestion.ts
src/types/automation.ts
src/types/barcode.ts
src/types/cooking-history.ts
src/types/custom-fields.ts
src/types/custom-ingredient-category.ts
src/types/custom-meal-type.ts
src/types/custom-recipe-type.ts
src/types/dashboard.ts
src/types/export.ts
src/types/folder.ts
src/types/global-search.ts
src/types/household-permissions.ts
src/types/household.ts
src/types/lifecycle.ts
src/types/macro-preset.ts
src/types/meal-plan.ts
src/types/nutrition.ts
src/types/profile.ts
src/types/quick-cook.ts
src/types/recipe-layout.ts
src/types/recipe.ts
src/types/settings-history.ts
src/types/settings.ts
src/types/shopping-list.ts
src/types/sidebar-customization.ts
src/types/smart-folder.ts
src/types/social.ts
src/types/stores.ts
src/types/subscription.ts
src/types/substitution.ts
src/types/templates.ts
src/types/user-preferences-v2.ts
src/types/voice-cooking.ts
src/types/waste-tracking.ts
```

## Package.json
```json
{
  "name": "nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "clean": "rm -rf .next",
    "predev": "lsof -ti :3001 | xargs kill -9 2>/dev/null; sleep 0.5; lsof -ti :3001 | xargs kill -9 2>/dev/null || true",
    "dev": "next dev -p 3001",
    "dev:fresh": "npm run clean && npm run dev",
    "monitor:start": "launchctl load ~/Library/LaunchAgents/com.mealpreprecipes.devmonitor.plist 2>/dev/null || echo 'Already running'",
    "monitor:stop": "launchctl unload ~/Library/LaunchAgents/com.mealpreprecipes.devmonitor.plist 2>/dev/null; npm run kill:port",
    "monitor:restart": "npm run monitor:stop && sleep 1 && npm run monitor:start",
    "monitor:status": "launchctl list | grep mealpreprecipes && echo '✅ Monitor is running' || echo '❌ Monitor is not running'",
    "monitor:logs": "tail -f dev-monitor.log",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "kill:port": "lsof -ti :3001 | xargs kill -9 2>/dev/null || echo 'Port 3001 is free'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.71.2",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@emoji-mart/data": "^1.2.1",
    "@emoji-mart/react": "^1.1.1",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@sentry/nextjs": "^10.32.0",
    "@stripe/stripe-js": "^8.5.3",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "@tailwindcss/cli": "^4.1.18",
    "@tailwindcss/postcss": "^4.1.18",
    "@tailwindcss/typography": "^0.5.19",
    "@uiw/react-md-editor": "^4.0.11",
    "@upstash/ratelimit": "^2.0.7",
    "@upstash/redis": "^1.35.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "emoji-mart": "^5.6.0",
    "html-to-image": "^1.11.13",
    "html5-qrcode": "^2.3.8",
    "jspdf": "^3.0.4",
    "jszip": "^3.10.1",
    "lucide-react": "^0.555.0",
    "next": "^16.1.0",
    "next-themes": "^0.4.6",
    "pako": "^2.1.0",
    "react": "^19.2.3",
    "react-day-picker": "^9.11.3",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.68.0",
    "react-markdown": "^10.1.0",
    "react-resizable-panels": "^4.0.7",
    "remark-gfm": "^4.0.1",
    "resend": "^6.5.2",
    "sonner": "^2.0.7",
    "stripe": "^20.0.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@types/node": "^20",
    "@types/pako": "^2.0.4",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "dotenv": "^17.2.3",
    "eslint": "^9.39.2",
    "eslint-config-next": "^16.1.0",
    "postcss": "^8",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}

```

## TypeScript Config
```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

## Type Definitions
### ai-suggestion.ts
```typescript
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
```

### automation.ts
```typescript
// Automation Rules Types
// IFTTT-style automation system for the meal prep app

export type AutomationTrigger =
  | 'recipe_rated'
  | 'recipe_cooked'
  | 'recipe_created'
  | 'recipe_added_to_folder'
  | 'recipe_removed_from_folder'
  | 'meal_assigned'
  | 'meal_unassigned'
  | 'shopping_list_generated'
  | 'shopping_item_checked'
  | 'macro_logged'
  | 'pantry_item_added'
  | 'pantry_item_expiring'
  | 'pantry_item_expired'
  | 'scheduled';

export type AutomationAction =
  | 'add_to_folder'
  | 'remove_from_folder'
  | 'add_tag'
  | 'remove_tag'
  | 'set_favorite'
  | 'unset_favorite'
  | 'set_lifecycle_stage'
  | 'send_email'
  | 'send_notification'
  | 'add_to_shopping_list'
  | 'add_to_pantry'
  | 'webhook'
  | 'run_script';

export type ConditionOperator =
  | 'eq'      // equals
  | 'neq'     // not equals
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'contains'
  | 'not_contains'
  | 'matches'     // regex
  | 'is_null'
  | 'is_not_null';

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export type AutomationRunStatus = 'success' | 'failed' | 'skipped';

export interface AutomationRule {
  id: string;
  householdId: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  triggerType: AutomationTrigger;
  triggerConditions: TriggerCondition[];
  actionType: AutomationAction;
  actionConfig: Record<string, unknown>;
  schedule: string | null; // cron expression for scheduled triggers
  lastRunAt: string | null;
  runCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  triggeredBy: Record<string, unknown> | null;
  status: AutomationRunStatus;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  executionTimeMs: number | null;
  executedAt: string;
}

export interface AutomationRuleFormData {
  name: string;
  description?: string;
  isEnabled?: boolean;
  triggerType: AutomationTrigger;
  triggerConditions: TriggerCondition[];
  actionType: AutomationAction;
  actionConfig: Record<string, unknown>;
  schedule?: string;
}

// Action config schemas for each action type
export interface AddToFolderConfig {
  folderId: string;
}

export interface RemoveFromFolderConfig {
  folderId: string;
}

export interface AddTagConfig {
  tag: string;
}

export interface RemoveTagConfig {
  tag: string;
}

export interface SetLifecycleStageConfig {
  stageId: string;
}

export interface SendEmailConfig {
  template: string;
  subject: string;
}

export interface SendNotificationConfig {
  title: string;
  body: string;
}

export interface AddToShoppingListConfig {
  items: Array<{
    ingredient: string;
    quantity: string;
  }>;
}

export interface AddToPantryConfig {
  ingredient: string;
  quantity: number;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface RunScriptConfig {
  script: string; // JavaScript code
}

// Trigger field schemas - what fields are available for each trigger
export const TRIGGER_FIELDS: Record<AutomationTrigger, string[]> = {
  recipe_rated: ['rating', 'recipe_id', 'recipe_title', 'recipe_type'],
  recipe_cooked: ['recipe_id', 'recipe_title', 'servings_cooked', 'cook_name'],
  recipe_created: ['recipe_id', 'recipe_title', 'recipe_type', 'source_url'],
  recipe_added_to_folder: ['recipe_id', 'recipe_title', 'folder_id', 'folder_name'],
  recipe_removed_from_folder: ['recipe_id', 'recipe_title', 'folder_id', 'folder_name'],
  meal_assigned: ['recipe_id', 'recipe_title', 'meal_type', 'date', 'servings'],
  meal_unassigned: ['recipe_id', 'recipe_title', 'meal_type', 'date'],
  shopping_list_generated: ['item_count', 'week_start'],
  shopping_item_checked: ['ingredient', 'quantity', 'category'],
  macro_logged: ['calories', 'protein', 'carbs', 'fat', 'date'],
  pantry_item_added: ['ingredient', 'quantity', 'expiry_date'],
  pantry_item_expiring: ['ingredient', 'quantity', 'days_until_expiry'],
  pantry_item_expired: ['ingredient', 'quantity', 'expired_days_ago'],
  scheduled: [], // No fields - just runs on schedule
};

// Display labels for triggers and actions
export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  recipe_rated: 'When a recipe is rated',
  recipe_cooked: 'When a recipe is cooked',
  recipe_created: 'When a recipe is created',
  recipe_added_to_folder: 'When a recipe is added to a folder',
  recipe_removed_from_folder: 'When a recipe is removed from a folder',
  meal_assigned: 'When a meal is assigned to the planner',
  meal_unassigned: 'When a meal is removed from the planner',
  shopping_list_generated: 'When a shopping list is generated',
  shopping_item_checked: 'When a shopping item is checked off',
  macro_logged: 'When macros are logged',
  pantry_item_added: 'When a pantry item is added',
  pantry_item_expiring: 'When a pantry item is expiring soon',
  pantry_item_expired: 'When a pantry item has expired',
  scheduled: 'On a schedule',
};

export const ACTION_LABELS: Record<AutomationAction, string> = {
  add_to_folder: 'Add recipe to folder',
  remove_from_folder: 'Remove recipe from folder',
  add_tag: 'Add tag to recipe',
  remove_tag: 'Remove tag from recipe',
  set_favorite: 'Mark recipe as favorite',
  unset_favorite: 'Remove recipe from favorites',
  set_lifecycle_stage: 'Set recipe lifecycle stage',
  send_email: 'Send email notification',
  send_notification: 'Send push notification',
  add_to_shopping_list: 'Add items to shopping list',
  add_to_pantry: 'Add item to pantry',
  webhook: 'Call webhook',
  run_script: 'Run custom script',
};

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: 'equals',
  neq: 'does not equal',
  gt: 'is greater than',
  gte: 'is greater than or equal to',
  lt: 'is less than',
  lte: 'is less than or equal to',
  contains: 'contains',
  not_contains: 'does not contain',
  matches: 'matches pattern',
  is_null: 'is empty',
  is_not_null: 'is not empty',
};
```

### barcode.ts
```typescript
/**
 * Types for barcode scanning and Open Food Facts API integration
 */

// Nutrition data from Open Food Facts (per 100g)
export interface BarcodeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// Scanned product data (normalized from Open Food Facts)
export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  quantity?: string;
  imageUrl?: string;
  nutrition?: BarcodeNutrition;
}

// API response from /api/pantry/lookup-barcode
export interface BarcodeLookupResponse {
  found: boolean;
  product?: ScannedProduct;
  error?: string;
}

// Open Food Facts API response types
export interface OpenFoodFactsNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories_tags?: string[];
  nutriscore_grade?: string;
  nutriments?: OpenFoodFactsNutriments;
  image_url?: string;
  image_front_url?: string;
  quantity?: string;
}

export interface OpenFoodFactsResponse {
  status: 0 | 1;
  status_verbose?: string;
  product?: OpenFoodFactsProduct;
}

// Barcode scanner component props
export interface BarcodeScannerProps {
  onScanComplete: (product: ScannedProduct) => void;
  onNotFound: (barcode: string) => void;
  subscriptionTier: 'free' | 'pro' | 'premium';
}

// Barcode result review component props
export interface BarcodeResultReviewProps {
  product: ScannedProduct;
  onConfirm: (item: { ingredient: string; category: string }) => void;
  onCancel: () => void;
  onScanAnother: () => void;
}

// Supported barcode formats for food products
export const FOOD_BARCODE_FORMATS = [
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'UPC_E',
  'CODE_128',
] as const;

export type FoodBarcodeFormat = typeof FOOD_BARCODE_FORMATS[number];
```

### cooking-history.ts
```typescript
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
```

### custom-fields.ts
```typescript
export type CustomFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'url'
  | 'rating';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  fieldType: CustomFieldType;
  description: string | null;
  isRequired: boolean;
  defaultValue: unknown;
  options: SelectOption[] | null; // for select types
  validationRules: ValidationRules | null;
  showInCard: boolean;
  showInFilters: boolean;
  sortOrder: number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  recipeId: string;
  fieldDefinitionId: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldDefinitionFormData {
  name: string;
  fieldType: CustomFieldType;
  description?: string;
  isRequired?: boolean;
  defaultValue?: unknown;
  options?: SelectOption[];
  validationRules?: ValidationRules;
  showInCard?: boolean;
  showInFilters?: boolean;
  icon?: string;
}
```

### custom-ingredient-category.ts
```typescript
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
```

### custom-meal-type.ts
```typescript
export interface CustomMealType {
  id: string;
  householdId: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  defaultTime: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
}

export interface CustomMealTypeFormData {
  name: string;
  emoji: string;
  color: string;
  defaultTime: string;
}
```

### custom-recipe-type.ts
```typescript
export interface CustomRecipeType {
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
}

export interface CustomRecipeTypeFormData {
  name: string;
  emoji: string;
  color: string;
  description?: string;
}
```

### dashboard.ts
```typescript
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
```

### export.ts
```typescript
/**
 * Export & Import Types
 *
 * Type definitions for the recipe export/import system.
 */

import type { Recipe, RecipeWithNutrition } from "./recipe";
import type { RecipeNutrition } from "./nutrition";

// =============================================================================
// Export Format Types
// =============================================================================

export type ExportFormat = "png" | "jpeg" | "markdown" | "json" | "pdf";

export type BulkExportFormat = "json" | "markdown";

export interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: string;
  description: string;
  extension: string;
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    format: "png",
    label: "PNG",
    icon: "image",
    description: "High-quality image",
    extension: ".png",
  },
  {
    format: "jpeg",
    label: "JPEG",
    icon: "image",
    description: "Compressed image",
    extension: ".jpeg",
  },
  {
    format: "markdown",
    label: "Markdown",
    icon: "file-text",
    description: "Text with formatting",
    extension: ".md",
  },
  {
    format: "json",
    label: "JSON",
    icon: "braces",
    description: "Data backup format",
    extension: ".json",
  },
  {
    format: "pdf",
    label: "PDF",
    icon: "file",
    description: "Print-ready document",
    extension: ".pdf",
  },
];

// =============================================================================
// JSON Export Types
// =============================================================================

/**
 * Recipe data exported in JSON format
 * Includes all recipe fields plus optional nutrition
 */
export interface RecipeExportData {
  /** Export metadata */
  _export: {
    version: "1.0";
    exported_at: string;
    source: "mealpreprecipes";
  };
  /** Recipe data */
  recipe: Recipe;
  /** Nutrition data if available */
  nutrition: RecipeNutrition | null;
}

/**
 * Bulk export manifest included in ZIP
 */
export interface BulkExportManifest {
  version: "1.0";
  exported_at: string;
  source: "mealpreprecipes";
  format: BulkExportFormat;
  recipe_count: number;
  recipes: Array<{
    id: string;
    title: string;
    filename: string;
  }>;
}

// =============================================================================
// Bulk Export Types
// =============================================================================

export interface BulkExportOptions {
  recipeIds: string[];
  format: BulkExportFormat;
}

export interface BulkExportResult {
  success: boolean;
  zipBlob?: Blob;
  filename?: string;
  error?: string;
}

// =============================================================================
// Import Types
// =============================================================================

export type ImportFormat = "json" | "paprika";

export type DuplicateHandling = "skip" | "replace" | "keep_both";

export interface ImportOptions {
  file: File;
  duplicateHandling: DuplicateHandling;
}

/**
 * Result of validating a single recipe for import
 */
export interface ImportValidationResult {
  index: number;
  title: string;
  isValid: boolean;
  isDuplicate: boolean;
  existingRecipeId?: string;
  errors: string[];
  warnings: string[];
  /** Parsed recipe data ready for import */
  parsedRecipe: Partial<Recipe> | null;
}

/**
 * Result of parsing an import file
 */
export interface ImportParseResult {
  success: boolean;
  format: ImportFormat;
  recipes: ImportValidationResult[];
  totalCount: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  error?: string;
}

/**
 * Result of executing the import
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  replaced: number;
  failed: number;
  errors: Array<{
    title: string;
    error: string;
  }>;
}

// =============================================================================
// Paprika Format Types
// =============================================================================

/**
 * Paprika recipe format (from .paprikarecipes files)
 * Based on Paprika 3 export format
 */
export interface PaprikaRecipe {
  uid?: string;
  name: string;
  ingredients?: string;
  directions?: string;
  description?: string;
  notes?: string;
  nutritional_info?: string;
  servings?: string;
  source?: string;
  source_url?: string;
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  difficulty?: string;
  rating?: number;
  photo?: string; // Base64 encoded image
  photo_hash?: string;
  photo_large?: string;
  scale?: string;
  hash?: string;
  categories?: string[];
  image_url?: string;
  on_favorites?: boolean;
  created?: string;
  in_trash?: boolean;
}

/**
 * Paprika archive structure (gzipped)
 */
export interface PaprikaArchive {
  recipes: PaprikaRecipe[];
}
```

### folder.ts
```typescript
/**
 * Recipe Folder Types
 * Organize recipes into folders and subfolders (max 2 levels)
 * Includes smart folder support with filter criteria
 */

import type { SmartFilterCriteria } from "./smart-folder";

// =====================================================
// FOLDER CATEGORY TYPES
// =====================================================

/**
 * Folder category from database
 * Categories are like sections in the sidebar (e.g., "My Folders", "Seasonal", etc.)
 */
export interface FolderCategory {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  emoji: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Category with its folders attached
 */
export interface FolderCategoryWithFolders extends FolderCategory {
  folders: FolderWithChildren[];
}

/**
 * Form data for creating/editing categories
 */
export interface FolderCategoryFormData {
  name: string;
  emoji?: string | null;
}

// =====================================================
// CORE FOLDER TYPES
// =====================================================

/**
 * Recipe folder from database
 * May be a regular folder or a smart folder with filter criteria
 */
export interface RecipeFolder {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  parent_folder_id: string | null;
  cover_recipe_id: string | null;
  category_id: string | null;
  sort_order: number;
  // Smart folder fields
  is_smart: boolean;
  smart_filters: SmartFilterCriteria | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Folder with nested children and computed fields
 */
export interface FolderWithChildren extends RecipeFolder {
  children: FolderWithChildren[];
  recipe_count: number;
  cover_image_url: string | null;
}

/**
 * Folder-recipe junction record
 */
export interface RecipeFolderMember {
  id: string;
  folder_id: string;
  recipe_id: string;
  added_at: string;
  added_by_user_id: string | null;
}

// =====================================================
// SMART FOLDER TYPES (Re-exported from smart-folder.ts)
// =====================================================

// Smart folder types are defined in @/types/smart-folder.ts
// Import from there for SmartFilterCriteria, SystemSmartFolder, etc.

// =====================================================
// FORM TYPES
// =====================================================

/**
 * Form data for creating/editing folders
 */
export interface FolderFormData {
  name: string;
  emoji?: string | null;
  color?: string | null;
  parent_folder_id?: string | null;
  cover_recipe_id?: string | null;
  category_id?: string | null;
}

// =====================================================
// FILTER TYPES
// =====================================================

/**
 * Active folder filter state
 * - "all": Show all recipes (no filter)
 * - "folder": Filter by a regular folder
 * - "smart": Filter by a smart folder (system or user-created)
 */
export type ActiveFolderFilter =
  | { type: "all" }
  | { type: "folder"; id: string }
  | { type: "smart"; id: string; isSystem: boolean };

// =====================================================
// UI CONSTANTS
// =====================================================

export const FOLDER_COLORS = [
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#DDA0DD", // Plum
  "#87CEEB", // Sky Blue
  "#F4A460", // Sandy Brown
  "#98D8C8", // Seafoam
] as const;

export const FOLDER_EMOJIS = [
  "🍽️",
  "🥗",
  "🍕",
  "🍰",
  "🥘",
  "🍜",
  "🥪",
  "🌮",
  "🍳",
  "🥞",
  "🧁",
  "🍪",
  "🥡",
  "🍝",
  "🌯",
  "🥙",
  "❤️",
  "⭐",
  "📦",
  "⚡",
  "🔥",
  "🏠",
  "👨‍👩‍👧",
  "🎉",
] as const;

export const CATEGORY_EMOJIS = [
  "📂",
  "🗂️",
  "📁",
  "🗃️",
  "🏷️",
  "📋",
  "📑",
  "🍽️",
  "🌿",
  "🌞",
  "❄️",
  "🎃",
  "🎄",
  "🌸",
  "🍂",
  "⚡",
  "💪",
  "🌱",
  "🏆",
  "✨",
] as const;
```

### global-search.ts
```typescript
/**
 * Global Search Types
 *
 * Types for the Notion-style global search feature.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Result Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecipeSearchResult {
  id: string;
  title: string;
  recipe_type: string | null;
  category: string | null;
  image_url: string | null;
  protein_type: string | null;
  relevance: number;
}

export interface ProfileSearchResult {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_recipe_count: number;
}

export interface SearchResults {
  recipes: RecipeSearchResult[];
  profiles: ProfileSearchResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export type ActionCategory = "navigation" | "create" | "utility";
export type ActionBehavior = "navigate" | "function";

export interface SearchableAction {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: ActionCategory;
  icon: string; // Lucide icon name
  behavior: ActionBehavior;
  href?: string; // For navigation actions
  functionId?: string; // For function actions
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Items Types
// ─────────────────────────────────────────────────────────────────────────────

export type RecentItemType = "recipe" | "page" | "profile";

export interface RecentItem {
  type: RecentItemType;
  id: string;
  label: string;
  href: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string; // Lucide icon name for pages
  visitedAt: number; // timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Result Item (for keyboard navigation)
// ─────────────────────────────────────────────────────────────────────────────

export type SearchResultItemType = "recipe" | "action" | "profile";

export interface SearchResultItem {
  type: SearchResultItemType;
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string;
  href?: string;
  action?: SearchableAction;
  recipe?: RecipeSearchResult;
  profile?: ProfileSearchResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GlobalSearchContextValue {
  // Modal state
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Search state
  query: string;
  setQuery: (query: string) => void;

  // Results
  results: SearchResults | null;
  matchedActions: SearchableAction[];
  isLoading: boolean;
  error: string | null;

  // Keyboard navigation
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  flatResults: SearchResultItem[];

  // Recent items
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, "visitedAt">) => void;
  clearRecentItems: () => void;

  // Selection handler
  handleSelect: (item: SearchResultItem) => void;
}
```

### household-permissions.ts
```typescript
// ============================================================================
// Household Permission System Types
// ============================================================================

// Permission modes
export type PermissionMode = 'equal' | 'managed' | 'family';

// Household roles
export type HouseholdRole = 'owner' | 'adult' | 'member' | 'child' | 'guest';

// Role hierarchy (higher = more permissions)
export const ROLE_HIERARCHY: Record<HouseholdRole, number> = {
  owner: 100,
  adult: 80,
  member: 60,
  child: 40,
  guest: 20,
};

// Role display configuration
export const ROLE_CONFIG: Record<HouseholdRole, {
  label: string;
  description: string;
  color: string;
}> = {
  owner: {
    label: 'Owner',
    description: 'Full control over household settings and permissions',
    color: '#6366f1',
  },
  adult: {
    label: 'Adult',
    description: 'Can manage meals and recipes, limited settings access',
    color: '#8b5cf6',
  },
  member: {
    label: 'Member',
    description: 'Can view and contribute to household planning',
    color: '#10b981',
  },
  child: {
    label: 'Child',
    description: 'Limited permissions based on household settings',
    color: '#f59e0b',
  },
  guest: {
    label: 'Guest',
    description: 'View-only access to shared content',
    color: '#6b7280',
  },
};

// Permission mode configuration
export const PERMISSION_MODE_CONFIG: Record<PermissionMode, {
  label: string;
  description: string;
  availableRoles: HouseholdRole[];
}> = {
  equal: {
    label: 'Equal Partners',
    description: 'Everyone has equal access to manage meals and recipes',
    availableRoles: ['owner', 'member'],
  },
  managed: {
    label: 'Managed Household',
    description: 'Owner and adults manage planning, members can contribute',
    availableRoles: ['owner', 'adult', 'member', 'guest'],
  },
  family: {
    label: 'Family Mode',
    description: 'Full family structure with child-specific permissions',
    availableRoles: ['owner', 'adult', 'member', 'child', 'guest'],
  },
};

// Child permission settings
export interface ChildPermissions {
  canViewRecipes: boolean;
  canViewMealPlan: boolean;
  canViewShoppingList: boolean;
  canCheckShoppingItems: boolean;
  canLogCooking: boolean;
  canRateRecipes: boolean;
  canSuggestRecipes: boolean;
}

// Full household settings
export interface HouseholdSettings {
  childPermissions: ChildPermissions;
  guestCanViewShoppingList: boolean;
  showContributionBadges: boolean;
}

export const DEFAULT_CHILD_PERMISSIONS: ChildPermissions = {
  canViewRecipes: true,
  canViewMealPlan: true,
  canViewShoppingList: false,
  canCheckShoppingItems: false,
  canLogCooking: false,
  canRateRecipes: true,
  canSuggestRecipes: true,
};

export const DEFAULT_HOUSEHOLD_SETTINGS: HouseholdSettings = {
  childPermissions: DEFAULT_CHILD_PERMISSIONS,
  guestCanViewShoppingList: false,
  showContributionBadges: true,
};

// Permission types
export type Permission =
  | 'view_recipes'
  | 'edit_recipes'
  | 'delete_recipes'
  | 'view_meal_plan'
  | 'edit_meal_plan'
  | 'view_shopping_list'
  | 'edit_shopping_list'
  | 'check_shopping_items'
  | 'manage_household'
  | 'invite_members'
  | 'remove_members'
  | 'change_roles'
  | 'change_settings';

// Permission checking function
export function hasPermission(
  permission: Permission,
  role: HouseholdRole,
  mode: PermissionMode,
  settings?: HouseholdSettings
): boolean {
  const actualSettings = settings || DEFAULT_HOUSEHOLD_SETTINGS;

  // Owner always has all permissions
  if (role === 'owner') {
    return true;
  }

  // Guest permissions
  if (role === 'guest') {
    switch (permission) {
      case 'view_recipes':
        return true;
      case 'view_meal_plan':
        return true;
      case 'view_shopping_list':
        return actualSettings.guestCanViewShoppingList;
      default:
        return false;
    }
  }

  // Child permissions (family mode only)
  if (role === 'child') {
    switch (permission) {
      case 'view_recipes':
        return actualSettings.childPermissions.canViewRecipes;
      case 'view_meal_plan':
        return actualSettings.childPermissions.canViewMealPlan;
      case 'view_shopping_list':
        return actualSettings.childPermissions.canViewShoppingList;
      case 'check_shopping_items':
        return actualSettings.childPermissions.canCheckShoppingItems;
      default:
        return false;
    }
  }

  // Equal mode - everyone is equal (owner/member only)
  // Note: owner is already handled at the top, so at this point role is 'adult' or 'member'
  if (mode === 'equal') {
    switch (permission) {
      case 'view_recipes':
      case 'edit_recipes':
      case 'delete_recipes':
      case 'view_meal_plan':
      case 'edit_meal_plan':
      case 'view_shopping_list':
      case 'edit_shopping_list':
      case 'check_shopping_items':
        return true;
      case 'manage_household':
      case 'invite_members':
      case 'remove_members':
      case 'change_roles':
      case 'change_settings':
        return false; // Only owner has these permissions (handled at top)
      default:
        return false;
    }
  }

  // Managed mode - differentiated roles
  if (mode === 'managed') {
    if (role === 'adult') {
      switch (permission) {
        case 'view_recipes':
        case 'edit_recipes':
        case 'delete_recipes':
        case 'view_meal_plan':
        case 'edit_meal_plan':
        case 'view_shopping_list':
        case 'edit_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }

    if (role === 'member') {
      switch (permission) {
        case 'view_recipes':
        case 'view_meal_plan':
        case 'view_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'edit_recipes':
        case 'delete_recipes':
        case 'edit_meal_plan':
        case 'edit_shopping_list':
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }
  }

  // Family mode - full hierarchy
  if (mode === 'family') {
    if (role === 'adult') {
      switch (permission) {
        case 'view_recipes':
        case 'edit_recipes':
        case 'delete_recipes':
        case 'view_meal_plan':
        case 'edit_meal_plan':
        case 'view_shopping_list':
        case 'edit_shopping_list':
        case 'check_shopping_items':
        case 'invite_members':
          return true;
        case 'manage_household':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }

    if (role === 'member') {
      switch (permission) {
        case 'view_recipes':
        case 'view_meal_plan':
        case 'view_shopping_list':
        case 'check_shopping_items':
          return true;
        case 'edit_recipes':
        case 'delete_recipes':
        case 'edit_meal_plan':
        case 'edit_shopping_list':
        case 'manage_household':
        case 'invite_members':
        case 'remove_members':
        case 'change_roles':
        case 'change_settings':
          return false;
        default:
          return false;
      }
    }
  }

  // Default deny
  return false;
}
```

### household.ts
```typescript
// ============================================================================
// Household Coordination Types
// Types for cooking schedules, dietary profiles, and household activities
// ============================================================================

// ============================================================================
// Day of Week
// ============================================================================

export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_OF_WEEK_NAMES: Record<DayOfWeekIndex, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeekIndex, string> = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun",
};

// ============================================================================
// Cooking Schedule
// ============================================================================

export type ScheduleMealType = "breakfast" | "lunch" | "dinner";

export interface CookingSchedule {
  id: string;
  household_id: string;
  day_of_week: DayOfWeekIndex;
  meal_type: ScheduleMealType;
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  is_rotating: boolean;
  rotation_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface CookingScheduleWithUser extends CookingSchedule {
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CookingScheduleFormData {
  day_of_week: DayOfWeekIndex;
  meal_type: ScheduleMealType;
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  is_rotating?: boolean;
}

// Helper to get display name for a schedule entry
export function getScheduleDisplayName(schedule: CookingScheduleWithUser): string {
  if (schedule.assigned_cook_name) {
    return schedule.assigned_cook_name;
  }
  if (schedule.user?.first_name) {
    return schedule.user.first_name;
  }
  return "Unassigned";
}

// ============================================================================
// Spice Tolerance
// ============================================================================

export type SpiceTolerance = "none" | "mild" | "medium" | "hot" | "extra-hot";

export const SPICE_TOLERANCE_LABELS: Record<SpiceTolerance, string> = {
  none: "No spice",
  mild: "Mild",
  medium: "Medium",
  hot: "Hot",
  "extra-hot": "Extra Hot",
};

export const SPICE_TOLERANCE_EMOJIS: Record<SpiceTolerance, string> = {
  none: "🧊",
  mild: "🌶️",
  medium: "🌶️🌶️",
  hot: "🌶️🌶️🌶️",
  "extra-hot": "🔥",
};

// ============================================================================
// Member Dietary Profile
// ============================================================================

export interface MemberDietaryProfile {
  id: string;
  user_id: string;
  household_id: string;
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  preferences: string[];
  spice_tolerance: SpiceTolerance | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberDietaryProfileFormData {
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  preferences: string[];
  spice_tolerance: SpiceTolerance | null;
  notes: string | null;
}

// Common dietary restrictions
export const COMMON_DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Low-Sodium",
  "Halal",
  "Kosher",
] as const;

// Common allergens (FDA Big 9)
export const COMMON_ALLERGENS = [
  "Milk/Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soybeans",
  "Sesame",
] as const;

// ============================================================================
// Aggregated Dietary Data
// ============================================================================

export interface AggregatedDietaryRestrictions {
  all_restrictions: string[];
  all_allergens: string[];
  all_dislikes: string[];
  member_count: number;
}

// ============================================================================
// Household Activity
// ============================================================================

export type HouseholdActivityType =
  | "meal_planned"
  | "meal_removed"
  | "recipe_added"
  | "recipe_shared"
  | "shopping_item_added"
  | "shopping_item_checked"
  | "shopping_list_generated"
  | "schedule_updated"
  | "member_joined"
  | "member_left"
  | "dietary_updated"
  | "meal_cooked";

export interface HouseholdActivity {
  id: string;
  household_id: string;
  user_id: string;
  activity_type: HouseholdActivityType;
  entity_type: string | null;
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HouseholdActivityWithUser extends HouseholdActivity {
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Activity type display configuration
export const ACTIVITY_TYPE_CONFIG: Record<
  HouseholdActivityType,
  { icon: string; label: string; verb: string }
> = {
  meal_planned: { icon: "📅", label: "Meal Planned", verb: "planned" },
  meal_removed: { icon: "🗑️", label: "Meal Removed", verb: "removed" },
  recipe_added: { icon: "📝", label: "Recipe Added", verb: "added" },
  recipe_shared: { icon: "🔗", label: "Recipe Shared", verb: "shared" },
  shopping_item_added: { icon: "🛒", label: "Item Added", verb: "added to list" },
  shopping_item_checked: { icon: "✅", label: "Item Checked", verb: "checked off" },
  shopping_list_generated: { icon: "📋", label: "List Generated", verb: "generated shopping list" },
  schedule_updated: { icon: "👨‍🍳", label: "Schedule Updated", verb: "updated cooking schedule" },
  member_joined: { icon: "👋", label: "Member Joined", verb: "joined the household" },
  member_left: { icon: "👋", label: "Member Left", verb: "left the household" },
  dietary_updated: { icon: "🥗", label: "Dietary Updated", verb: "updated dietary preferences" },
  meal_cooked: { icon: "🍳", label: "Meal Cooked", verb: "cooked" },
};

// ============================================================================
// Household Member (Extended)
// ============================================================================

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface HouseholdMemberWithProfile extends HouseholdMember {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  dietary_profile: MemberDietaryProfile | null;
}

// ============================================================================
// Household (Extended)
// ============================================================================

export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMemberWithProfile[];
  cooking_schedules: CookingScheduleWithUser[];
  aggregated_dietary: AggregatedDietaryRestrictions;
}

// ============================================================================
// Today's Cook
// ============================================================================

export interface TodaysCook {
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  user_first_name: string | null;
  user_avatar_url: string | null;
  meal_type: ScheduleMealType;
}

export function getTodaysCookDisplayName(cook: TodaysCook | null): string {
  if (!cook) return "No one assigned";
  if (cook.assigned_cook_name) return cook.assigned_cook_name;
  if (cook.user_first_name) return cook.user_first_name;
  return "No one assigned";
}

// ============================================================================
// Real-time Sync Types
// ============================================================================

export type HouseholdRealtimeEvent =
  | { type: "meal_assignment_change"; payload: unknown }
  | { type: "shopping_list_change"; payload: unknown }
  | { type: "activity_added"; payload: HouseholdActivity }
  | { type: "schedule_change"; payload: unknown }
  | { type: "dietary_change"; payload: unknown };

export interface HouseholdRealtimeState {
  lastUpdate: Date;
  isConnected: boolean;
  pendingChanges: number;
}
```

### lifecycle.ts
```typescript
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
```

### macro-preset.ts
```typescript
/**
 * Macro Preset Type Definitions
 * Custom macro presets for quick nutrition logging
 */

// =====================================================
// CORE TYPES
// =====================================================

/**
 * Macro values for a preset (shared structure)
 */
export interface MacroValues {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

/**
 * Macro preset from database
 */
export interface MacroPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  is_system: boolean;
  is_pinned: boolean;
  is_hidden: boolean;
  sort_order: number;
  pin_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating/editing presets
 */
export interface MacroPresetFormData {
  name: string;
  emoji?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

/**
 * Quick add with customization (before adding to log)
 */
export interface CustomizedQuickAdd {
  presetId: string;
  presetName: string;
  values: MacroValues;
  note?: string;
}

/**
 * Result of preset operations
 */
export interface PresetActionResult {
  success: boolean;
  error: string | null;
  data?: MacroPreset | null;
}

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Available emojis for preset selection
 */
export const PRESET_EMOJIS = [
  // Food
  "🍪", "🥤", "☕", "🍎", "🥜", "🧀", "🥛", "🍌",
  "🥚", "🍞", "🥗", "🍗", "🥩", "🐟", "🥑", "🍇",
  "🥕", "🍫", "🧁", "🍩", "🥯", "🥣", "🍵", "🧃",
  // Supplements/Health
  "💊", "🧪", "⚡", "💪", "🏃", "🔥",
] as const;

/**
 * Default emojis for system presets
 */
export const DEFAULT_PRESET_EMOJIS: Record<string, string> = {
  "Snack": "🍪",
  "Protein Shake": "🥤",
  "Coffee": "☕",
};

/**
 * Helper to format macro summary for display
 * e.g., "150cal · 25g P"
 */
export function formatMacroSummary(preset: MacroPreset): string {
  const parts: string[] = [];

  if (preset.calories !== null) {
    parts.push(`${preset.calories}cal`);
  }
  if (preset.protein_g !== null) {
    parts.push(`${preset.protein_g}g P`);
  }
  if (preset.carbs_g !== null && parts.length < 2) {
    parts.push(`${preset.carbs_g}g C`);
  }
  if (preset.fat_g !== null && parts.length < 2) {
    parts.push(`${preset.fat_g}g F`);
  }

  return parts.join(" · ") || "No values";
}

/**
 * Helper to get display emoji (with fallback)
 */
export function getPresetEmoji(preset: MacroPreset): string {
  if (preset.emoji) return preset.emoji;
  return DEFAULT_PRESET_EMOJIS[preset.name] || "📝";
}

/**
 * Check if preset has any macro values
 */
export function hasAnyMacroValue(values: MacroValues): boolean {
  return (
    values.calories !== null ||
    values.protein_g !== null ||
    values.carbs_g !== null ||
    values.fat_g !== null
  );
}

/**
 * Extract macro values from a preset
 */
export function extractMacroValues(preset: MacroPreset): MacroValues {
  return {
    calories: preset.calories,
    protein_g: preset.protein_g,
    carbs_g: preset.carbs_g,
    fat_g: preset.fat_g,
  };
}
```

### meal-plan.ts
```typescript
// Meal planning types matching the database schema

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Meal type for organizing meals by time of day
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// Display order for meal types (breakfast → lunch → dinner → snack → other)
export const MEAL_TYPE_ORDER: (MealType | null)[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  null, // "Other" at the end
];

// Configuration for each meal type (colors, labels, emojis)
export const MEAL_TYPE_CONFIG: Record<
  MealType | "other",
  {
    label: string;
    emoji: string;
    borderColor: string; // Tailwind border color class
    bgColor: string; // Tailwind background tint class
    accentColor: string; // Raw color for inline styles
  }
> = {
  breakfast: {
    label: "Breakfast",
    emoji: "🌅",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    accentColor: "#fbbf24", // amber-400
  },
  lunch: {
    label: "Lunch",
    emoji: "🥗",
    borderColor: "border-l-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    accentColor: "#34d399", // emerald-400
  },
  dinner: {
    label: "Dinner",
    emoji: "🍽️",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    accentColor: "#f97316", // orange-500 (brand coral)
  },
  snack: {
    label: "Snack",
    emoji: "🍿",
    borderColor: "border-l-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    accentColor: "#a78bfa", // violet-400
  },
  other: {
    label: "Other",
    emoji: "📋",
    borderColor: "border-l-gray-300 dark:border-l-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
    accentColor: "#9ca3af", // gray-400
  },
};

export interface MealPlan {
  id: string;
  household_id: string;
  week_start: string; // ISO date string (Monday)
  created_at: string;
  updated_at: string;
}

export interface MealAssignment {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  meal_type: MealType | null;
  serving_size: number | null;
  created_at: string;
}

// Extended assignment with recipe details for display
export interface MealAssignmentWithRecipe extends MealAssignment {
  recipe: {
    id: string;
    title: string;
    recipe_type: string;
    prep_time: string | null;
    cook_time: string | null;
  };
}

// Form data for creating/updating assignments
export interface AssignmentFormData {
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook?: string;
}

// Week view data structure
export interface WeekPlanData {
  meal_plan: MealPlan | null;
  assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]>;
}

// Meal plan template types
export interface MealPlanTemplate {
  id: string;
  household_id: string;
  name: string;
  assignments: TemplateAssignment[];
  created_at: string;
}

export interface TemplateAssignment {
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  meal_type: MealType | null;
  serving_size: number | null;
}

// Helper to get the Monday of a given week
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format date for display
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

// Group meals by type and sort within each group by created_at
export function groupMealsByType<T extends { meal_type: MealType | null; created_at: string }>(
  meals: T[]
): Map<MealType | null, T[]> {
  const grouped = new Map<MealType | null, T[]>();

  // Initialize in display order
  for (const type of MEAL_TYPE_ORDER) {
    grouped.set(type, []);
  }

  // Group meals by type
  for (const meal of meals) {
    const type = meal.meal_type;
    const group = grouped.get(type);
    if (group) {
      group.push(meal);
    } else {
      // Handle unexpected type by putting in "other" (null)
      grouped.get(null)?.push(meal);
    }
  }

  // Sort within each group by created_at (oldest first)
  grouped.forEach((typeMeals) => {
    typeMeals.sort(
      (a: T, b: T) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  return grouped;
}

// Get meal type config, defaulting to "other" for null
export function getMealTypeConfig(mealType: MealType | null) {
  return MEAL_TYPE_CONFIG[mealType ?? "other"];
}
```

### nutrition.ts
```typescript
/**
 * Nutrition Type Definitions
 * Advanced Nutrition Tracking & Macro Planning Feature
 */

// =====================================================
// CORE NUTRITION DATA TYPES
// =====================================================

/**
 * Nutritional data per serving
 * All values are optional as nutrition data may be incomplete
 */
export interface NutritionData {
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
}

/**
 * Complete nutrition record from database
 * Includes metadata about data source and confidence
 */
export interface RecipeNutrition extends NutritionData {
  id: string;
  recipe_id: string;
  source: NutritionSource;
  confidence_score?: number | null; // 0.00 to 1.00
  input_tokens?: number | null; // API usage tracking
  output_tokens?: number | null; // API usage tracking
  cost_usd?: number | null; // Cost in USD for AI extraction
  created_at: string;
  updated_at: string;
}

/**
 * Source of nutrition data
 * - ai_extracted: Extracted by Claude API from ingredients
 * - manual: Manually entered by user
 * - imported: Imported from external source (e.g., recipe URL)
 * - usda: From USDA FoodData Central (future enhancement)
 */
export type NutritionSource = 'ai_extracted' | 'manual' | 'imported' | 'usda';

/**
 * Confidence level categories
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Helper to categorize confidence score
 */
export function getConfidenceLevel(score?: number | null): ConfidenceLevel {
  if (score === null || score === undefined) return 'unknown';
  if (score < 0.3) return 'low';
  if (score < 0.7) return 'medium';
  return 'high';
}

// =====================================================
// MACRO GOALS TYPES
// =====================================================

/**
 * User's daily macro goals
 */
export interface MacroGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number; // Optional
}

/**
 * Macro goal preset options
 */
export type MacroGoalPreset = 'weight_loss' | 'muscle_building' | 'maintenance' | 'custom';

/**
 * Predefined macro goal presets
 * Used for quick setup in settings
 */
export const MACRO_GOAL_PRESETS: Record<Exclude<MacroGoalPreset, 'custom'>, MacroGoals> = {
  weight_loss: {
    calories: 1800,
    protein_g: 140,
    carbs_g: 150,
    fat_g: 60,
    fiber_g: 25,
  },
  muscle_building: {
    calories: 2500,
    protein_g: 180,
    carbs_g: 250,
    fat_g: 80,
    fiber_g: 30,
  },
  maintenance: {
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
    fiber_g: 25,
  },
};

/**
 * User's nutrition tracking settings
 * This extends the existing user_settings table
 */
export interface NutritionSettings {
  macro_goals: MacroGoals;
  macro_tracking_enabled: boolean;
  macro_goal_preset?: MacroGoalPreset | null;
}

// =====================================================
// DAILY & WEEKLY SUMMARY TYPES
// =====================================================

/**
 * Daily nutrition log entry
 * Aggregated totals for a single day
 */
export interface DailyNutritionLog extends NutritionData {
  id: string;
  user_id: string;
  household_id?: string | null;
  date: string; // ISO date string (YYYY-MM-DD)

  // Metadata
  meal_count: number;
  recipes_with_nutrition: number;
  data_completeness_pct: number; // 0-100

  created_at: string;
  updated_at: string;
}

/**
 * Single day breakdown in weekly summary
 */
export interface DayNutritionBreakdown extends NutritionData {
  day: string; // e.g., "Monday", "Tuesday"
  date: string; // ISO date string
}

/**
 * Weekly nutrition summary
 * Pre-aggregated for performance
 */
export interface WeeklyNutritionSummary {
  id: string;
  user_id: string;
  household_id?: string | null;
  week_start: string; // ISO date string (Monday)

  // Weekly totals
  total_calories?: number | null;
  total_protein_g?: number | null;
  total_carbs_g?: number | null;
  total_fat_g?: number | null;
  total_fiber_g?: number | null;

  // Daily averages
  avg_calories?: number | null;
  avg_protein_g?: number | null;
  avg_carbs_g?: number | null;
  avg_fat_g?: number | null;
  avg_fiber_g?: number | null;

  // Daily breakdown (parsed from JSONB)
  daily_breakdown?: Record<string, NutritionData>;

  // Goal tracking
  user_goals_snapshot?: MacroGoals | null;
  days_on_target?: number | null; // 0-7

  created_at: string;
  updated_at: string;
}

// =====================================================
// UI DISPLAY TYPES
// =====================================================

/**
 * Macro progress for a single macro nutrient
 * Used for progress bars and visual indicators
 */
export interface MacroProgress {
  name: string;
  actual: number | null;
  target: number;
  percentage: number; // 0-100+
  remaining: number; // How much left to hit target (0 if achieved/exceeded)
  status: 'remaining' | 'achieved' | 'exceeded'; // Non-judgmental terminology
  color: 'sage' | 'muted' | 'coral'; // Soft brand colors, not traffic lights
}

/**
 * Daily macro summary with goal comparison
 */
export interface DailyMacroSummary {
  date: string;
  day_of_week: string; // e.g., "Monday"
  nutrition: NutritionData;
  goals: MacroGoals;
  progress: {
    calories: MacroProgress;
    protein: MacroProgress;
    carbs: MacroProgress;
    fat: MacroProgress;
    fiber?: MacroProgress;
  };
  meal_count: number;
  data_completeness_pct: number;
}

/**
 * Weekly macro dashboard data
 */
export interface WeeklyMacroDashboard {
  week_start: string;
  week_end: string;
  days: DailyMacroSummary[];
  weekly_totals: NutritionData;
  weekly_averages: NutritionData;
  goals: MacroGoals;
  overall_progress: {
    calories: MacroProgress;
    protein: MacroProgress;
    carbs: MacroProgress;
    fat: MacroProgress;
    fiber?: MacroProgress;
  };
  days_on_target: number; // 0-7
}

// =====================================================
// NUTRITION EXTRACTION TYPES
// =====================================================

/**
 * Request for AI nutrition extraction
 */
export interface NutritionExtractionRequest {
  recipe_id: string;
  ingredients: string[];
  servings: number;
  title?: string; // Optional recipe title for better context
  instructions?: string[]; // Optional instructions for better context
  force_reextract?: boolean; // Override existing nutrition data
}

/**
 * Response from AI nutrition extraction
 */
export interface NutritionExtractionResponse {
  success: boolean;
  nutrition?: RecipeNutrition;
  error?: string;
  confidence_level?: ConfidenceLevel;
}

/**
 * Nutrition extraction queue entry
 */
export interface NutritionExtractionQueueItem {
  id: string;
  recipe_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  last_error?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

// =====================================================
// RECIPE WITH NUTRITION TYPES
// =====================================================

/**
 * Recipe with nutrition data included
 * Extends base recipe type
 */
export interface RecipeWithNutrition {
  id: string;
  title: string;
  servings: string;
  base_servings: number;
  nutrition?: RecipeNutrition | null;
  // ... other recipe fields
}

// =====================================================
// VALIDATION & CALCULATION HELPERS
// =====================================================

/**
 * Check if nutrition data is complete
 */
export function isNutritionComplete(nutrition: NutritionData): boolean {
  return !!(
    nutrition.calories &&
    nutrition.protein_g &&
    nutrition.carbs_g &&
    nutrition.fat_g
  );
}

/**
 * Check if nutrition data is valid (has at least one value)
 */
export function hasNutritionData(nutrition?: NutritionData | null): boolean {
  if (!nutrition) return false;
  return !!(
    nutrition.calories ||
    nutrition.protein_g ||
    nutrition.carbs_g ||
    nutrition.fat_g ||
    nutrition.fiber_g ||
    nutrition.sugar_g ||
    nutrition.sodium_mg
  );
}

/**
 * Calculate macro progress with non-judgmental soft colors
 * Returns percentage, remaining amount, and soft status
 */
export function calculateMacroProgress(
  actual: number | null | undefined,
  target: number,
  name: string
): MacroProgress {
  if (actual === null || actual === undefined) {
    return {
      name,
      actual: null,
      target,
      percentage: 0,
      remaining: target,
      status: 'remaining',
      color: 'muted',
    };
  }

  const percentage = (actual / target) * 100;
  const remaining = Math.max(0, target - actual);

  // Non-judgmental status: achieved (within ±10%), exceeded, or remaining
  let status: 'remaining' | 'achieved' | 'exceeded';
  let color: 'sage' | 'muted' | 'coral';

  if (percentage >= 90 && percentage <= 110) {
    // Within ±10% of target = achieved
    status = 'achieved';
    color = 'sage';
  } else if (percentage > 110) {
    // Exceeded target (soft coral, not harsh red)
    status = 'exceeded';
    color = 'coral';
  } else {
    // Still working toward goal
    status = 'remaining';
    color = 'muted';
  }

  return {
    name,
    actual,
    target,
    percentage: Math.round(percentage),
    remaining: Math.round(remaining),
    status,
    color,
  };
}

/**
 * Sum nutrition data from multiple sources
 */
export function sumNutrition(items: (NutritionData | null | undefined)[]): NutritionData {
  const result: NutritionData = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  };

  items.forEach((item) => {
    if (!item) return;

    if (item.calories) result.calories = (result.calories || 0) + item.calories;
    if (item.protein_g) result.protein_g = (result.protein_g || 0) + item.protein_g;
    if (item.carbs_g) result.carbs_g = (result.carbs_g || 0) + item.carbs_g;
    if (item.fat_g) result.fat_g = (result.fat_g || 0) + item.fat_g;
    if (item.fiber_g) result.fiber_g = (result.fiber_g || 0) + item.fiber_g;
    if (item.sugar_g) result.sugar_g = (result.sugar_g || 0) + item.sugar_g;
    if (item.sodium_mg) result.sodium_mg = (result.sodium_mg || 0) + item.sodium_mg;
  });

  return result;
}

/**
 * Scale nutrition data by servings
 */
export function scaleNutrition(
  nutrition: NutritionData,
  baseServings: number,
  targetServings: number
): NutritionData {
  const scale = targetServings / baseServings;

  return {
    calories: nutrition.calories ? Math.round(nutrition.calories * scale) : null,
    protein_g: nutrition.protein_g ? Math.round(nutrition.protein_g * scale * 10) / 10 : null,
    carbs_g: nutrition.carbs_g ? Math.round(nutrition.carbs_g * scale * 10) / 10 : null,
    fat_g: nutrition.fat_g ? Math.round(nutrition.fat_g * scale * 10) / 10 : null,
    fiber_g: nutrition.fiber_g ? Math.round(nutrition.fiber_g * scale * 10) / 10 : null,
    sugar_g: nutrition.sugar_g ? Math.round(nutrition.sugar_g * scale * 10) / 10 : null,
    sodium_mg: nutrition.sodium_mg ? Math.round(nutrition.sodium_mg * scale) : null,
  };
}

/**
 * Format nutrition value for display
 */
export function formatNutritionValue(
  value: number | null | undefined,
  unit: string,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}${unit}`;
}

/**
 * Get color for progress status
 * Returns Tailwind CSS color class - soft, non-judgmental colors
 */
export function getProgressColor(status: MacroProgress['status']): string {
  switch (status) {
    case 'achieved':
      return 'text-brand-sage';
    case 'remaining':
      return 'text-muted-foreground';
    case 'exceeded':
      return 'text-brand-coral/80';
  }
}

/**
 * Get background color for progress bar
 * Uses soft brand colors instead of traffic light colors
 */
export function getProgressBgColor(color: MacroProgress['color']): string {
  switch (color) {
    case 'sage':
      return 'bg-brand-sage';
    case 'muted':
      return 'bg-muted-foreground/40';
    case 'coral':
      return 'bg-brand-coral/60';
  }
}
```

### profile.ts
```typescript
// Public profile type definitions
// For the quirky, fun cooking social network "bonding over food"

// ============================================
// PUBLIC PROFILE TYPES
// ============================================

export type CookingSkillLevel = 'beginner' | 'home_cook' | 'enthusiast' | 'semi_pro' | 'professional';
export type CookWithMeStatus = 'not_set' | 'open' | 'busy' | 'looking_for_partner';

export interface PublicProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  cooking_philosophy: string | null;
  location: string | null;
  website: string | null;
  favorite_cuisine: string | null;
  cooking_skill: CookingSkillLevel | null;
  cook_with_me_status: CookWithMeStatus;
  currently_craving: string | null;
  profile_theme: string;
  profile_emoji: string;
  follower_count: number;
  following_count: number;
  public_recipe_count: number;
  total_cooks: number;
  created_at: string;
  is_following?: boolean; // Whether current user follows this profile

  // Privacy toggles
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
}

// ============================================
// COOKING STATS TYPES
// ============================================

export interface CookingStreak {
  current_streak_days: number;
  longest_streak_days: number;
  total_meals_cooked: number;
  total_recipes_tried: number;
  weekly_target: number;
  current_week_count: number;
}

// ============================================
// BADGE TYPES (Future feature placeholder)
// ============================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'cooking' | 'social' | 'collection' | 'achievement' | 'special';

export interface UserBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  earned_at: string;
  is_featured: boolean;
}

// ============================================
// COOK PHOTO TYPES
// ============================================

export interface CookPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  recipe_id: string;
  recipe_title: string;
  recipe_image_url: string | null;
  like_count: number;
  created_at: string;
  is_liked?: boolean; // Whether current user liked this photo
}

// ============================================
// COLLECTION TYPES
// ============================================

export interface PublicCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  emoji: string;
  recipe_count: number;
  save_count: number;
  is_public: boolean;
  created_at: string;
}

// ============================================
// REVIEW TYPES (for profile display)
// ============================================

export interface ProfileReview {
  id: string;
  recipe_id: string;
  recipe_title: string;
  recipe_image_url: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  helpful_count: number;
}
```

### quick-cook.ts
```typescript
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
```

### recipe-layout.ts
```typescript
// ============================================================================
// Recipe Layout Customization Types
// ============================================================================

/**
 * Recipe section identifiers - matches sections in recipe-detail.tsx
 */
export type RecipeSectionId =
  | "ingredients"
  | "instructions"
  | "nutrition"
  | "notes"
  | "cooking-history"
  | "reviews";

/**
 * Width options for sections in grid layout
 */
export type RecipeSectionWidth = "full" | "half";

/**
 * Configuration for a single recipe section
 */
export interface RecipeSectionConfig {
  /** Section identifier */
  id: RecipeSectionId;

  /** Whether section is visible */
  visible: boolean;

  /** Width in grid layout (full-width or half-width) */
  width: RecipeSectionWidth;

  /** Display order (lower = higher position) */
  sortOrder: number;
}

/**
 * Full recipe layout preferences
 */
export interface RecipeLayoutPreferences {
  /** Individual section configurations */
  sections: Record<RecipeSectionId, RecipeSectionConfig>;

  /** Section order as array of IDs (for rendering) */
  sectionOrder: RecipeSectionId[];

  /** Schema version for future migrations */
  schemaVersion: number;
}

// ============================================================================
// Constants & Defaults
// ============================================================================

export const RECIPE_SECTION_LABELS: Record<RecipeSectionId, string> = {
  ingredients: "Ingredients",
  instructions: "Instructions",
  nutrition: "Nutrition Facts",
  notes: "Notes",
  "cooking-history": "Cooking History",
  reviews: "Community Reviews",
};

export const RECIPE_SECTION_DESCRIPTIONS: Record<RecipeSectionId, string> = {
  ingredients: "List of ingredients with scaling options",
  instructions: "Step-by-step cooking instructions",
  nutrition: "Nutritional information per serving",
  notes: "Personal notes and tips",
  "cooking-history": "Your past cooking sessions",
  reviews: "Community reviews and ratings",
};

export const DEFAULT_RECIPE_SECTION_ORDER: RecipeSectionId[] = [
  "ingredients",
  "instructions",
  "nutrition",
  "notes",
  "cooking-history",
  "reviews",
];

export const DEFAULT_RECIPE_SECTIONS: Record<RecipeSectionId, RecipeSectionConfig> = {
  ingredients: {
    id: "ingredients",
    visible: true,
    width: "half",
    sortOrder: 0,
  },
  instructions: {
    id: "instructions",
    visible: true,
    width: "half",
    sortOrder: 1,
  },
  nutrition: {
    id: "nutrition",
    visible: true,
    width: "full",
    sortOrder: 2,
  },
  notes: {
    id: "notes",
    visible: true,
    width: "full",
    sortOrder: 3,
  },
  "cooking-history": {
    id: "cooking-history",
    visible: true,
    width: "full",
    sortOrder: 4,
  },
  reviews: {
    id: "reviews",
    visible: true,
    width: "full",
    sortOrder: 5,
  },
};

export const CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION = 1;

export const DEFAULT_RECIPE_LAYOUT_PREFERENCES: RecipeLayoutPreferences = {
  sections: { ...DEFAULT_RECIPE_SECTIONS },
  sectionOrder: [...DEFAULT_RECIPE_SECTION_ORDER],
  schemaVersion: CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ordered sections based on preferences
 */
export function getOrderedSections(
  prefs: RecipeLayoutPreferences
): RecipeSectionConfig[] {
  return prefs.sectionOrder.map((id) => prefs.sections[id]);
}

/**
 * Get visible sections in order
 */
export function getVisibleSections(
  prefs: RecipeLayoutPreferences
): RecipeSectionConfig[] {
  return getOrderedSections(prefs).filter((section) => section.visible);
}

/**
 * Update section order after drag-and-drop
 */
export function reorderSections(
  prefs: RecipeLayoutPreferences,
  oldIndex: number,
  newIndex: number
): RecipeLayoutPreferences {
  const newOrder = [...prefs.sectionOrder];
  const [removed] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, removed);

  // Update sortOrder for all sections
  const newSections = { ...prefs.sections };
  newOrder.forEach((id, index) => {
    newSections[id] = { ...newSections[id], sortOrder: index };
  });

  return {
    ...prefs,
    sectionOrder: newOrder,
    sections: newSections,
  };
}

/**
 * Toggle section visibility
 */
export function toggleSectionVisibility(
  prefs: RecipeLayoutPreferences,
  sectionId: RecipeSectionId
): RecipeLayoutPreferences {
  return {
    ...prefs,
    sections: {
      ...prefs.sections,
      [sectionId]: {
        ...prefs.sections[sectionId],
        visible: !prefs.sections[sectionId].visible,
      },
    },
  };
}

/**
 * Update section width
 */
export function updateSectionWidth(
  prefs: RecipeLayoutPreferences,
  sectionId: RecipeSectionId,
  width: RecipeSectionWidth
): RecipeLayoutPreferences {
  return {
    ...prefs,
    sections: {
      ...prefs.sections,
      [sectionId]: {
        ...prefs.sections[sectionId],
        width,
      },
    },
  };
}

/**
 * Reset to default layout (returns deep copy to prevent mutations)
 */
export function resetToDefaultLayout(): RecipeLayoutPreferences {
  return {
    sections: Object.fromEntries(
      Object.entries(DEFAULT_RECIPE_SECTIONS).map(([key, value]) => [
        key,
        { ...value },
      ])
    ) as Record<RecipeSectionId, RecipeSectionConfig>,
    sectionOrder: [...DEFAULT_RECIPE_SECTION_ORDER],
    schemaVersion: CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION,
  };
}
```

### recipe.ts
```typescript
// Recipe types matching the database schema

import type { RecipeNutrition } from "./nutrition";

/**
 * RecipeType is now a string to support custom recipe types.
 * Default system types are: "Dinner", "Baking", "Breakfast", "Dessert", "Snack", "Side Dish"
 * Custom types can be any string defined by the user.
 */
export type RecipeType = string;

/** Default system recipe types for fallback/display when custom types aren't loaded */
export const DEFAULT_RECIPE_TYPES = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
] as const;

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
  // Social features (Phase 1)
  is_public: boolean;
  share_token: string | null;
  view_count: number;
  original_recipe_id: string | null;
  original_author_id: string | null;
  // Reviews aggregate (Phase 3)
  avg_rating: number | null;
  review_count: number;
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
  // Social features
  is_public?: boolean;
}

// Recipe with favorite status for display
export interface RecipeWithFavorite extends Recipe {
  is_favorite: boolean;
}

// Recipe with favorite status and nutrition data for browse page
export interface RecipeWithFavoriteAndNutrition extends RecipeWithFavorite {
  nutrition?: RecipeNutrition | null;
}

// Filters for recipe list
export interface RecipeFilters {
  search?: string;
  recipe_type?: RecipeType | "all";
  category?: string;
  tags?: string[];
  favorites_only?: boolean;
  rating_filter?: number[]; // Array of star levels to include [1, 2, 3, 4, 5]
  rated_filter?: "all" | "rated" | "unrated"; // Filter by rated status
}
```

### settings-history.ts
```typescript
// ============================================================================
// Settings History Types for Undo Functionality
// ============================================================================

export type SettingsChangeCategory =
  | "settings"
  | "displayPrefs"
  | "soundPrefs"
  | "keyboardPrefs"
  | "privacyPrefs"
  | "aiPersonality"
  | "servingPresets"
  | "plannerSettings";

export interface SettingsChange {
  id: string;
  timestamp: Date;
  settingPath: string;       // e.g., "settings.dark_mode" or "preferencesV2.privacy.analyticsEnabled"
  settingLabel: string;      // Human-readable: "Dark Mode" or "Usage Analytics"
  oldValue: unknown;
  newValue: unknown;
  category: SettingsChangeCategory;
}

export interface SettingsHistoryState {
  changes: SettingsChange[];  // Most recent first
  maxChanges: number;         // Default: 10
}

export const DEFAULT_SETTINGS_HISTORY: SettingsHistoryState = {
  changes: [],
  maxChanges: 10,
};
```

### settings.ts
```typescript
// User Settings Types

import type { MacroGoals, MacroGoalPreset } from "./nutrition";

export type UnitSystem = "imperial" | "metric";

/**
 * Recipe export preferences
 * Controls which sections are included in markdown exports
 */
export interface RecipeExportPreferences {
  include_ingredients: boolean;
  include_instructions: boolean;
  include_nutrition: boolean;
  include_tags: boolean;
  include_times: boolean;
  include_notes: boolean;
  include_servings: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  cook_names: string[];
  cook_colors?: Record<string, string>;
  email_notifications: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;

  // Onboarding hints
  dismissed_hints?: string[];

  // Nutrition tracking
  macro_goals?: MacroGoals;
  macro_tracking_enabled?: boolean;
  macro_goal_preset?: MacroGoalPreset | null;

  // Unit preferences
  unit_system?: UnitSystem;

  // Export preferences
  recipe_export_preferences?: RecipeExportPreferences;

  created_at: string;
  updated_at: string;
}

export interface UserSettingsFormData {
  dark_mode: boolean;
  cook_names: string[];
  cook_colors?: Record<string, string>;
  email_notifications: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;

  // Nutrition tracking (new)
  macro_goals?: MacroGoals;
  macro_tracking_enabled?: boolean;
  macro_goal_preset?: MacroGoalPreset | null;

  // Unit preferences
  unit_system?: UnitSystem;

  // Export preferences
  recipe_export_preferences?: RecipeExportPreferences;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  username: string | null;
  bio: string | null;
  cooking_philosophy: string | null;
  profile_emoji: string | null;
  currently_craving: string | null;
  cook_with_me_status: CookWithMeStatus | null;
  favorite_cuisine: string | null;
  cooking_skill: CookingSkillLevel | null;
  location: string | null;
  website_url: string | null;
  public_profile: boolean;
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
  profile_accent_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
}

// ============================================================================
// Profile Customization Types
// ============================================================================

export type CookWithMeStatus = "not_set" | "open" | "busy" | "looking";
export type CookingSkillLevel = "beginner" | "home_cook" | "enthusiast" | "semi_pro" | "professional";

export interface ProfileCustomizationSettings {
  bio: string;
  cooking_philosophy: string;
  profile_emoji: string;
  currently_craving: string;
  cook_with_me_status: CookWithMeStatus;
  favorite_cuisine: string;
  cooking_skill: CookingSkillLevel;
  location: string;
  website_url: string;
  profile_accent_color: string;
}

export interface ProfilePrivacySettings {
  public_profile: boolean;
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
}

export const DEFAULT_PROFILE_CUSTOMIZATION: ProfileCustomizationSettings = {
  bio: "",
  cooking_philosophy: "",
  profile_emoji: "👨‍🍳",
  currently_craving: "",
  cook_with_me_status: "not_set",
  favorite_cuisine: "",
  cooking_skill: "home_cook",
  location: "",
  website_url: "",
  profile_accent_color: "#f97316",
};

export const DEFAULT_PROFILE_PRIVACY: ProfilePrivacySettings = {
  public_profile: false,
  show_cooking_stats: true,
  show_badges: true,
  show_cook_photos: true,
  show_reviews: true,
  show_saved_recipes: true,
};

export const FOOD_EMOJIS = [
  "👨‍🍳", "👩‍🍳", "🍕", "🍔", "🌮", "🍣",
  "🍜", "🥘", "🍰", "🧁", "🥗", "🍱"
] as const;

export const COOK_WITH_ME_STATUS_LABELS: Record<CookWithMeStatus, string> = {
  not_set: "Not set",
  open: "Open to cook together",
  busy: "Busy cooking",
  looking: "Looking for cooking partner",
};

export const COOKING_SKILL_LABELS: Record<CookingSkillLevel, string> = {
  beginner: "Beginner",
  home_cook: "Home Cook",
  enthusiast: "Enthusiast",
  semi_pro: "Semi-Pro",
  professional: "Professional",
};

// ============================================================================
// Cook Mode Settings Types
// ============================================================================

export type CookModeFontSize = "small" | "medium" | "large" | "extra-large";
export type CookModeTheme = "system" | "light" | "dark";
export type CookModeNavigationMode = "step-by-step" | "scrollable";
export type VoiceReadoutSpeed = "slow" | "normal" | "fast";

// ============================================================================
// Enhanced Cook Mode Types
// ============================================================================

// Voice command action types
export type VoiceCommandAction =
  | "nextStep"
  | "prevStep"
  | "setTimer"
  | "stopTimer"
  | "repeat"
  | "readIngredients"
  | "pause"
  | "resume";

// Voice command customization - maps actions to trigger phrases
export interface VoiceCommandMapping {
  nextStep: string[];
  prevStep: string[];
  setTimer: string[];
  stopTimer: string[];
  repeat: string[];
  readIngredients: string[];
  pause: string[];
  resume: string[];
}

// Audio/TTS settings
export type AcknowledgmentSound = "beep" | "chime" | "ding" | "silent";
export type TimerSoundType = "classic" | "gentle" | "urgent" | "melody";

export interface CookModeAudioSettings {
  ttsVoice: string;
  ttsPitch: number;        // 0.5 - 2.0
  ttsRate: number;         // 0.5 - 2.0
  ttsVolume: number;       // 0 - 1
  acknowledgmentSound: AcknowledgmentSound;
  timerSound: TimerSoundType;
}

// Ingredient highlight styles
export type IngredientHighlightStyle = "bold" | "underline" | "background" | "badge";
export type StepTransition = "none" | "fade" | "slide";

// Gesture action types
export type GestureAction = "none" | "repeat" | "timer" | "ingredients" | "voice" | "fullscreen" | "settings" | "exit";

// Timer settings
export interface CookModeTimerSettings {
  quickTimerPresets: number[];
  autoDetectTimers: boolean;
  showTimerInTitle: boolean;
  vibrationOnComplete: boolean;
  repeatTimerAlert: boolean;
}

// Custom user preset
export interface CustomCookModePreset {
  id: string;
  name: string;
  icon: string;
  settings: CookModeSettings;
  createdAt: string;
  isDefault?: boolean;
}

export interface CookModeDisplaySettings {
  fontSize: CookModeFontSize;
  themeOverride: CookModeTheme;
  highContrast: boolean;
  accentColor: string;
  ingredientHighlightStyle: IngredientHighlightStyle;
  stepTransition: StepTransition;
  showStepNumbers: boolean;
  showEstimatedTime: boolean;
}

export interface CookModeVoiceSettings {
  enabled: boolean;
  wakeWords: string[];              // Changed from single wakeWord
  autoReadSteps: boolean;
  readoutSpeed: VoiceReadoutSpeed;
  commandMappings: VoiceCommandMapping;
  commandTimeout: number;
  confirmCommands: boolean;
}

export interface CookModeGestureSettings {
  swipeEnabled: boolean;
  tapToAdvance: boolean;
  hapticFeedback: boolean;
  doubleTapAction: GestureAction;
  longPressAction: GestureAction;
  swipeUpAction: GestureAction;
  swipeDownAction: GestureAction;
}

export interface CookModeVisibilitySettings {
  showIngredients: boolean;
  showTimers: boolean;
  showProgress: boolean;
}

export interface CookModeBehaviorSettings {
  keepScreenAwake: boolean;
  timerSounds: boolean;
  autoAdvance: boolean;
}

export interface CookModeNavigationSettings {
  mode: CookModeNavigationMode;
}

export interface CookModeSettings {
  display: CookModeDisplaySettings;
  visibility: CookModeVisibilitySettings;
  behavior: CookModeBehaviorSettings;
  navigation: CookModeNavigationSettings;
  voice: CookModeVoiceSettings;
  gestures: CookModeGestureSettings;
  audio: CookModeAudioSettings;
  timers: CookModeTimerSettings;
}

export const DEFAULT_COOK_MODE_SETTINGS: CookModeSettings = {
  display: {
    fontSize: "medium",
    themeOverride: "system",
    highContrast: false,
    accentColor: "#f97316",
    ingredientHighlightStyle: "bold",
    stepTransition: "fade",
    showStepNumbers: true,
    showEstimatedTime: true,
  },
  visibility: {
    showIngredients: true,
    showTimers: true,
    showProgress: true,
  },
  behavior: {
    keepScreenAwake: true,
    timerSounds: true,
    autoAdvance: false,
  },
  navigation: {
    mode: "step-by-step",
  },
  voice: {
    enabled: false,
    wakeWords: ["hey chef", "okay chef", "yo chef"],
    autoReadSteps: false,
    readoutSpeed: "normal",
    commandMappings: {
      nextStep: ["next", "next step", "continue", "forward", "go", "next one"],
      prevStep: ["back", "previous", "go back", "previous step", "last step", "before"],
      setTimer: ["timer", "set timer", "start timer", "timer for"],
      stopTimer: ["stop timer", "cancel timer", "stop", "clear timer"],
      repeat: ["repeat", "say again", "what", "again", "huh", "pardon", "one more time"],
      readIngredients: ["ingredients", "what do I need", "read ingredients", "list ingredients", "what ingredients"],
      pause: ["pause", "hold", "wait", "hold on", "stop talking"],
      resume: ["resume", "continue", "go ahead", "okay", "keep going", "go on"],
    },
    commandTimeout: 3000,
    confirmCommands: true,
  },
  gestures: {
    swipeEnabled: true,
    tapToAdvance: false,
    hapticFeedback: true,
    doubleTapAction: "repeat",
    longPressAction: "ingredients",
    swipeUpAction: "none",
    swipeDownAction: "none",
  },
  audio: {
    ttsVoice: "",
    ttsPitch: 1.0,
    ttsRate: 1.0,
    ttsVolume: 1.0,
    acknowledgmentSound: "beep",
    timerSound: "classic",
  },
  timers: {
    quickTimerPresets: [1, 3, 5, 10, 15, 20, 30],
    autoDetectTimers: true,
    showTimerInTitle: true,
    vibrationOnComplete: true,
    repeatTimerAlert: false,
  },
};

// Cook Mode Preset Types
export type CookModePresetKey = "minimal" | "full" | "hands-free" | "focus";

export interface CookModePreset {
  key: CookModePresetKey;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  settings: CookModeSettings;
}

// ============================================================================
// Meal Type Customization Settings Types
// ============================================================================

export type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack" | "other";

/**
 * @deprecated Use MealTypeCustomization instead
 * Kept for backward compatibility during migration
 */
export interface MealTypeEmojiSettings {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  other: string;
}

/**
 * @deprecated Use DEFAULT_MEAL_TYPE_SETTINGS instead
 */
export const DEFAULT_MEAL_TYPE_EMOJIS: MealTypeEmojiSettings = {
  breakfast: "🌅",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍿",
  other: "📋",
};

/**
 * Settings for a single meal type
 */
export interface MealTypeSettings {
  emoji: string;           // Emoji to display (e.g., "🌅")
  color: string;           // Hex color (e.g., "#fbbf24")
  calendarTime: string;    // Time in HH:MM format (e.g., "08:00")
  duration: number;        // Duration in minutes (e.g., 60)
  excludedDays: string[];  // Days to skip for this meal type (e.g., ["Saturday", "Sunday"])
}

/**
 * Full customization settings for all meal types
 */
export interface MealTypeCustomization {
  breakfast: MealTypeSettings;
  lunch: MealTypeSettings;
  dinner: MealTypeSettings;
  snack: MealTypeSettings;
  other: MealTypeSettings;
}

/**
 * Default settings for all meal types
 */
export const DEFAULT_MEAL_TYPE_SETTINGS: MealTypeCustomization = {
  breakfast: { emoji: "🌅", color: "#fbbf24", calendarTime: "08:00", duration: 30, excludedDays: [] },
  lunch: { emoji: "🥗", color: "#34d399", calendarTime: "12:00", duration: 60, excludedDays: [] },
  dinner: { emoji: "🍽️", color: "#f97316", calendarTime: "18:00", duration: 60, excludedDays: [] },
  snack: { emoji: "🍿", color: "#a78bfa", calendarTime: "15:00", duration: 15, excludedDays: [] },
  other: { emoji: "📋", color: "#9ca3af", calendarTime: "12:00", duration: 60, excludedDays: [] },
};

/**
 * Predefined color palette for meal types
 */
export const MEAL_TYPE_COLOR_PALETTE = [
  { key: "amber", color: "#fbbf24", label: "Amber" },
  { key: "emerald", color: "#34d399", label: "Emerald" },
  { key: "orange", color: "#f97316", label: "Orange" },
  { key: "violet", color: "#a78bfa", label: "Violet" },
  { key: "gray", color: "#9ca3af", label: "Gray" },
  { key: "blue", color: "#3b82f6", label: "Blue" },
  { key: "red", color: "#ef4444", label: "Red" },
  { key: "pink", color: "#ec4899", label: "Pink" },
  { key: "cyan", color: "#06b6d4", label: "Cyan" },
  { key: "lime", color: "#84cc16", label: "Lime" },
  { key: "rose", color: "#f43f5e", label: "Rose" },
  { key: "indigo", color: "#6366f1", label: "Indigo" },
  { key: "teal", color: "#14b8a6", label: "Teal" },
  { key: "yellow", color: "#eab308", label: "Yellow" },
  { key: "sky", color: "#0ea5e9", label: "Sky" },
  { key: "fuchsia", color: "#d946ef", label: "Fuchsia" },
] as const;

// ============================================================================
// Planner View Settings Types
// ============================================================================

export type PlannerViewDensity = "compact" | "comfortable" | "spacious";

/**
 * Settings for controlling the meal planner view display and visibility
 */
export interface PlannerViewSettings {
  /** View density affects spacing and padding throughout the planner */
  density: PlannerViewDensity;
  /** Show meal type section headers (Breakfast, Lunch, etc.) */
  showMealTypeHeaders: boolean;
  /** Show nutrition badges (calories, protein) on recipe cards */
  showNutritionBadges: boolean;
  /** Show prep time on recipe cards */
  showPrepTime: boolean;
}

export const DEFAULT_PLANNER_VIEW_SETTINGS: PlannerViewSettings = {
  density: "comfortable",
  showMealTypeHeaders: true,
  showNutritionBadges: true,
  showPrepTime: true,
};

// ============================================================================
// Recipe Preferences Settings Types
// ============================================================================

/**
 * Recipe-related user preferences (default serving size, etc.)
 */
export interface RecipePreferences {
  /** Default serving size when adding recipes to meal plans */
  defaultServingSize: number;
}

export const DEFAULT_RECIPE_PREFERENCES: RecipePreferences = {
  defaultServingSize: 2,
};

// ============================================================================
// Difficulty Thresholds Settings Types
// ============================================================================

/**
 * Configurable thresholds for recipe difficulty calculation
 * Each factor has two breakpoints: Easy < medium, Medium <= hard
 */
export interface DifficultyThresholds {
  /** Time thresholds in minutes */
  time: {
    easyMax: number;   // Below this = Easy (default: 30)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 60)
  };
  /** Ingredient count thresholds */
  ingredients: {
    easyMax: number;   // Below this = Easy (default: 8)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 15)
  };
  /** Instruction step count thresholds */
  steps: {
    easyMax: number;   // Below this = Easy (default: 6)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 12)
  };
}

export const DEFAULT_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  time: {
    easyMax: 30,
    mediumMax: 60,
  },
  ingredients: {
    easyMax: 8,
    mediumMax: 15,
  },
  steps: {
    easyMax: 6,
    mediumMax: 12,
  },
};

// ============================================================================
// Calendar Preferences Settings Types
// ============================================================================

/**
 * Calendar-related user preferences (event time, duration, excluded days)
 */
export interface CalendarPreferences {
  /** Default time for calendar events in HH:MM format (e.g., "12:00") */
  eventTime: string;
  /** Default duration for calendar events in minutes */
  eventDurationMinutes: number;
  /** Days of the week to exclude when creating events */
  excludedDays: string[];
}

export const DEFAULT_CALENDAR_PREFERENCES: CalendarPreferences = {
  eventTime: "12:00",
  eventDurationMinutes: 60,
  excludedDays: [],
};

/**
 * Structure for user_settings.preferences JSONB column
 */
export interface UserSettingsPreferences {
  cookMode?: CookModeSettings;
  cookModePresets?: CustomCookModePreset[];
  /** @deprecated Use mealTypeSettings instead */
  mealTypeEmojis?: MealTypeEmojiSettings;
  mealTypeSettings?: MealTypeCustomization;
  plannerView?: PlannerViewSettings;
  recipe?: RecipePreferences;
  recipeExport?: RecipeExportPreferences;
  calendar?: CalendarPreferences;
  /** Customizable thresholds for recipe difficulty calculation */
  difficultyThresholds?: DifficultyThresholds;
}

/**
 * Default recipe export preferences
 */
export const DEFAULT_RECIPE_EXPORT_PREFERENCES: RecipeExportPreferences = {
  include_ingredients: true,
  include_instructions: true,
  include_nutrition: true,
  include_tags: true,
  include_times: true,
  include_notes: true,
  include_servings: true,
};
```

### shopping-list.ts
```typescript
// Shopping List Types

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  is_checked: boolean;
  recipe_id?: string | null;
  recipe_title?: string | null;
  created_at: string;
  // Substitution tracking
  substituted_from?: string | null;
  substitution_log_id?: string | null;
  // Computed field for pantry check
  is_in_pantry?: boolean;
}

// Pantry item for tracking what users already have
export interface PantryItem {
  id: string;
  household_id: string;
  ingredient: string;
  normalized_ingredient: string;
  category?: string | null;
  last_restocked?: string | null;
  source?: 'manual' | 'scan' | 'barcode' | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  household_id: string;
  meal_plan_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

// Grouped items by category for display
export interface GroupedShoppingItems {
  [category: string]: ShoppingListItem[];
}

// For creating new items
export interface NewShoppingListItem {
  ingredient: string;
  quantity?: string;
  unit?: string;
  category?: string;
  recipe_id?: string;
  recipe_title?: string;
}

// Common ingredient categories
export const INGREDIENT_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments",
  "Spices",
  "Other",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

// Helper to group items by category
export function groupItemsByCategory(
  items: ShoppingListItem[]
): GroupedShoppingItems {
  return items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedShoppingItems);
}

// Helper to sort categories in a logical order
// Accepts optional custom order from user settings
export function sortCategories(
  categories: string[],
  customOrder?: string[] | null
): string[] {
  const order = customOrder && customOrder.length > 0
    ? customOrder
    : (INGREDIENT_CATEGORIES as readonly string[]);
    
  return [...categories].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}
```

### sidebar-customization.ts
```typescript
// ============================================================================
// Sidebar Customization Types
// Full customization for sidebar sections, items, and custom sections
// ============================================================================

import type { PinnedItem, SidebarMode } from "./user-preferences-v2";

// ============================================================================
// Icon System - Using Lucide icon names as strings for JSON serialization
// ============================================================================

/**
 * Available icon names from Lucide React.
 * Using string literals for JSON serialization in JSONB column.
 */
export type SidebarIconName =
  // Navigation
  | "Home"
  | "Calendar"
  | "CalendarDays"
  | "Search"
  | "Plus"
  // Food & Cooking
  | "UtensilsCrossed"
  | "CookingPot"
  | "Soup"
  | "Pizza"
  | "Apple"
  | "Beef"
  | "Coffee"
  | "Salad"
  | "Cherry"
  | "Egg"
  | "Fish"
  | "IceCream"
  | "Sandwich"
  // Organization
  | "Folder"
  | "FolderOpen"
  | "Folders"
  | "BookOpen"
  | "Archive"
  | "Library"
  | "Tag"
  | "Tags"
  | "Bookmark"
  | "FileText"
  // Shopping & Lists
  | "ShoppingCart"
  | "ShoppingBag"
  | "ListTodo"
  | "ListChecks"
  | "ClipboardList"
  | "Receipt"
  // Stats & Analytics
  | "BarChart3"
  | "TrendingUp"
  | "Activity"
  | "PieChart"
  | "Target"
  // User & Social
  | "Heart"
  | "Star"
  | "Users"
  | "User"
  | "Sparkles"
  | "Crown"
  | "Award"
  | "Trophy"
  // Misc
  | "Settings"
  | "Link"
  | "ExternalLink"
  | "Pin"
  | "Clock"
  | "History"
  | "Zap"
  | "Flame"
  | "Leaf"
  | "Sun"
  | "Moon"
  | "Lightbulb"
  | "Compass"
  | "Map"
  | "Globe";

// ============================================================================
// Section Identifiers
// ============================================================================

/**
 * Built-in section IDs that cannot be deleted (only hidden/reordered/customized).
 */
export type BuiltInSectionId =
  | "quick-nav"
  | "pinned"
  | "meal-planning"
  | "collections";

/**
 * Section types for distinguishing built-in vs custom sections.
 */
export type SectionType = "builtin" | "custom";

/**
 * Built-in item IDs within the Meal Planning section.
 */
export type MealPlanningItemId =
  | "plan"
  | "shopping-list"
  | "recipes"
  | "favorites"
  | "stats";

// ============================================================================
// Section Item Configuration (for built-in sections)
// ============================================================================

/**
 * Configuration for a single item within a built-in section.
 * Allows hiding, renaming, and changing icons for built-in items.
 */
export interface SectionItemConfig {
  /** The built-in item ID (e.g., "plan", "recipes") */
  id: string;

  /** Custom display name. null = use default name */
  customName: string | null;

  /** Custom icon name. null = use default icon */
  customIcon: SidebarIconName | null;

  /** Custom emoji to use instead of icon. Takes precedence over customIcon */
  customEmoji: string | null;

  /** Whether this item is hidden */
  hidden: boolean;
}

// ============================================================================
// Custom Section Items (for custom sections)
// ============================================================================

/**
 * Type of item that can be added to a custom section.
 */
export type CustomItemType =
  | "internal-link"
  | "external-link"
  | "recipe-link"
  | "folder-link"
  | "divider";

/**
 * Base interface for all custom section items.
 */
interface CustomItemBase {
  /** Unique identifier for this item (UUID) */
  id: string;

  /** Type of the custom item */
  type: CustomItemType;

  /** Display order within the section */
  sortOrder: number;
}

/**
 * Internal link item - links to an app page.
 */
export interface InternalLinkItem extends CustomItemBase {
  type: "internal-link";

  /** Display label */
  label: string;

  /** App-relative path (e.g., "/app/recipes") */
  href: string;

  /** Icon name from Lucide */
  icon: SidebarIconName | null;

  /** Emoji to display (takes precedence over icon) */
  emoji: string | null;
}

/**
 * External link item - links to external URL.
 */
export interface ExternalLinkItem extends CustomItemBase {
  type: "external-link";

  /** Display label */
  label: string;

  /** Full external URL */
  url: string;

  /** Icon name from Lucide */
  icon: SidebarIconName | null;

  /** Emoji to display (takes precedence over icon) */
  emoji: string | null;

  /** Whether to open in new tab (default: true for external) */
  openInNewTab: boolean;
}

/**
 * Recipe link item - direct link to a specific recipe.
 */
export interface RecipeLinkItem extends CustomItemBase {
  type: "recipe-link";

  /** Recipe ID (UUID) */
  recipeId: string;

  /** Custom display name (null = use recipe name) */
  customLabel: string | null;

  /** Custom emoji (null = use recipe emoji or default) */
  customEmoji: string | null;
}

/**
 * Folder link item - links to a folder filter.
 */
export interface FolderLinkItem extends CustomItemBase {
  type: "folder-link";

  /** Folder ID (UUID) */
  folderId: string;

  /** Is this a smart folder? */
  isSmartFolder: boolean;

  /** Custom display name (null = use folder name) */
  customLabel: string | null;

  /** Custom emoji (null = use folder emoji) */
  customEmoji: string | null;
}

/**
 * Divider item - visual separator.
 */
export interface DividerItem extends CustomItemBase {
  type: "divider";

  /** Optional label for the divider */
  label: string | null;
}

/**
 * Union type for all custom section items.
 */
export type CustomSectionItem =
  | InternalLinkItem
  | ExternalLinkItem
  | RecipeLinkItem
  | FolderLinkItem
  | DividerItem;

// ============================================================================
// Section Configuration
// ============================================================================

/**
 * Configuration for a built-in section.
 */
export interface BuiltInSectionConfig {
  /** Section ID */
  id: BuiltInSectionId;

  /** Section type marker */
  type: "builtin";

  /** Custom display title (null = use default) */
  customTitle: string | null;

  /** Custom icon (null = use default) */
  customIcon: SidebarIconName | null;

  /** Custom emoji (takes precedence over customIcon) */
  customEmoji: string | null;

  /** Whether section is hidden entirely */
  hidden: boolean;

  /** Whether section is collapsed by default */
  defaultCollapsed: boolean;

  /** Display order (lower = higher position) */
  sortOrder: number;

  /**
   * Item configurations within this section.
   * Only applicable for sections with customizable items (meal-planning).
   */
  items: Record<string, SectionItemConfig>;

  /**
   * Order of items within the section.
   * Array of item IDs in display order.
   * Can include both built-in item IDs (e.g., "plan", "recipes") and
   * custom item UUIDs, allowing users to interleave custom links.
   */
  itemOrder: string[];

  /**
   * Custom items added by the user to this built-in section.
   * These are user-added links that can be interleaved with built-in items.
   * The itemOrder array contains both built-in IDs and custom item UUIDs.
   */
  customItems: CustomSectionItem[];
}

/**
 * Configuration for a custom user-created section.
 */
export interface CustomSectionConfig {
  /** Unique section ID (UUID) */
  id: string;

  /** Section type marker */
  type: "custom";

  /** Section title */
  title: string;

  /** Icon for the section header */
  icon: SidebarIconName | null;

  /** Emoji for the section header (takes precedence over icon) */
  emoji: string | null;

  /** Whether section is hidden */
  hidden: boolean;

  /** Whether section is collapsed by default */
  defaultCollapsed: boolean;

  /** Display order (lower = higher position) */
  sortOrder: number;

  /** Items within this custom section */
  items: CustomSectionItem[];

  /** When this section was created */
  createdAt: string;
}

/**
 * Union type for all section configurations.
 */
export type SectionConfig = BuiltInSectionConfig | CustomSectionConfig;

// ============================================================================
// Sidebar Preferences V2 (Enhanced)
// ============================================================================

/**
 * Enhanced sidebar preferences with section customization.
 * Backwards compatible with existing SidebarPreferences.
 */
export interface SidebarPreferencesV2 {
  /** Sidebar display mode */
  mode: SidebarMode;

  /** Sidebar width in pixels */
  width: number;

  /** Pinned items (existing functionality) */
  pinnedItems: PinnedItem[];

  /** Whether pinned section is expanded */
  pinnedSectionExpanded: boolean;

  /**
   * Section configurations indexed by section ID.
   * Includes both built-in and custom sections.
   */
  sections: Record<string, SectionConfig>;

  /**
   * Global section order.
   * Array of section IDs in display order.
   */
  sectionOrder: string[];

  /**
   * Schema version for migration support.
   * Increment when making breaking changes.
   */
  schemaVersion: number;

  /**
   * Reduce motion for neurodivergent-friendly UX.
   * When true, disables transitions and animations.
   */
  reducedMotion: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isBuiltInSection(
  section: SectionConfig
): section is BuiltInSectionConfig {
  return section.type === "builtin";
}

export function isCustomSection(
  section: SectionConfig
): section is CustomSectionConfig {
  return section.type === "custom";
}

export function isBuiltInSectionId(id: string): id is BuiltInSectionId {
  return ["quick-nav", "pinned", "meal-planning", "collections"].includes(id);
}

export function isInternalLinkItem(
  item: CustomSectionItem
): item is InternalLinkItem {
  return item.type === "internal-link";
}

export function isExternalLinkItem(
  item: CustomSectionItem
): item is ExternalLinkItem {
  return item.type === "external-link";
}

export function isRecipeLinkItem(
  item: CustomSectionItem
): item is RecipeLinkItem {
  return item.type === "recipe-link";
}

export function isFolderLinkItem(
  item: CustomSectionItem
): item is FolderLinkItem {
  return item.type === "folder-link";
}

export function isDividerItem(item: CustomSectionItem): item is DividerItem {
  return item.type === "divider";
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_MEAL_PLANNING_ITEM_ORDER: MealPlanningItemId[] = [
  "plan",
  "shopping-list",
  "recipes",
  "favorites",
  "stats",
];

export const DEFAULT_MEAL_PLANNING_ITEMS: Record<string, SectionItemConfig> = {
  plan: {
    id: "plan",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  "shopping-list": {
    id: "shopping-list",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  recipes: {
    id: "recipes",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  favorites: {
    id: "favorites",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  stats: {
    id: "stats",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
};

export const DEFAULT_BUILTIN_SECTIONS: Record<
  BuiltInSectionId,
  BuiltInSectionConfig
> = {
  "quick-nav": {
    id: "quick-nav",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 0,
    items: {},
    itemOrder: [],
    customItems: [],
  },
  pinned: {
    id: "pinned",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 1,
    items: {},
    itemOrder: [],
    customItems: [],
  },
  "meal-planning": {
    id: "meal-planning",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 2,
    items: DEFAULT_MEAL_PLANNING_ITEMS,
    itemOrder: [...DEFAULT_MEAL_PLANNING_ITEM_ORDER],
    customItems: [],
  },
  collections: {
    id: "collections",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 3,
    items: {},
    itemOrder: [],
    customItems: [],
  },
};

export const DEFAULT_SECTION_ORDER: string[] = [
  "quick-nav",
  "pinned",
  "meal-planning",
  "collections",
];

export const CURRENT_SIDEBAR_SCHEMA_VERSION = 2;

export const DEFAULT_SIDEBAR_PREFERENCES_V2: SidebarPreferencesV2 = {
  mode: "expanded",
  width: 260,
  pinnedItems: [],
  pinnedSectionExpanded: true,
  sections: { ...DEFAULT_BUILTIN_SECTIONS },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  schemaVersion: CURRENT_SIDEBAR_SCHEMA_VERSION,
  reducedMotion: false,
};
```

### smart-folder.ts
```typescript
/**
 * Smart Folders Type Definitions
 *
 * Smart folders automatically populate with recipes matching filter criteria.
 * Uses a condition-based filtering pattern similar to badge-calculator.ts
 */

// ============================================
// FILTER OPERATORS
// ============================================

export type SmartFilterOperator =
  | "eq"           // equals
  | "neq"          // not equals
  | "gt"           // greater than
  | "gte"          // greater than or equal
  | "lt"           // less than
  | "lte"          // less than or equal
  | "in"           // value in array
  | "not_in"       // value not in array
  | "contains"     // array contains value
  | "not_contains" // array does not contain value
  | "within_days"  // date within N days of now
  | "is_null"      // value is null/empty
  | "is_not_null"; // value is not null/empty

// ============================================
// FILTER FIELDS
// ============================================

export type SmartFilterField =
  // Recipe metadata
  | "recipe_type"
  | "protein_type"
  | "tags"
  | "rating"
  | "is_favorite"
  // Time-based
  | "created_at"
  | "prep_time"
  | "cook_time"
  | "total_time"
  // Cooking history
  | "cook_count"
  | "last_cooked_at"
  // Dietary/allergens
  | "allergen_tags"
  // Nutrition
  | "has_nutrition"
  | "calories"
  | "protein_g"
  | "carbs_g"
  | "fat_g"
  | "fiber_g"
  | "sugar_g"
  | "sodium_mg";

// ============================================
// FILTER CONDITION
// ============================================

export interface SmartFilterCondition {
  field: SmartFilterField;
  operator: SmartFilterOperator;
  value: string | number | boolean | string[] | number[] | null;
}

export interface SmartFilterCriteria {
  conditions: SmartFilterCondition[];
}

// ============================================
// SMART FOLDER TYPES
// ============================================

export interface SystemSmartFolder {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  description: string;
  smart_filters: SmartFilterCriteria;
  sort_order: number;
  created_at: string;
}

export interface UserSmartFolder {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  is_smart: true;
  smart_filters: SmartFilterCriteria;
  parent_folder_id: string | null;
  category_id: string | null;
  household_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// FIELD METADATA (for UI)
// ============================================

export type FieldType = "text" | "number" | "enum" | "tags" | "boolean" | "date";

export interface SmartFilterFieldMeta {
  field: SmartFilterField;
  label: string;
  type: FieldType;
  category: "metadata" | "time" | "history" | "dietary" | "nutrition";
  operators: SmartFilterOperator[];
  enumOptions?: { value: string; label: string }[];
  unit?: string;
  description?: string;
}

export const SMART_FILTER_FIELDS: SmartFilterFieldMeta[] = [
  // Metadata category
  {
    field: "recipe_type",
    label: "Recipe Type",
    type: "enum",
    category: "metadata",
    operators: ["eq", "neq", "in", "not_in"],
    enumOptions: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "snack", label: "Snack" },
      { value: "dessert", label: "Dessert" },
      { value: "side", label: "Side" },
      { value: "appetizer", label: "Appetizer" },
      { value: "beverage", label: "Beverage" },
    ],
  },
  {
    field: "protein_type",
    label: "Protein Type",
    type: "enum",
    category: "metadata",
    operators: ["eq", "neq", "in", "not_in", "is_null", "is_not_null"],
    enumOptions: [
      { value: "chicken", label: "Chicken" },
      { value: "beef", label: "Beef" },
      { value: "pork", label: "Pork" },
      { value: "fish", label: "Fish" },
      { value: "seafood", label: "Seafood" },
      { value: "turkey", label: "Turkey" },
      { value: "lamb", label: "Lamb" },
      { value: "tofu", label: "Tofu" },
      { value: "tempeh", label: "Tempeh" },
      { value: "eggs", label: "Eggs" },
      { value: "none", label: "None" },
    ],
  },
  {
    field: "tags",
    label: "Tags",
    type: "tags",
    category: "metadata",
    operators: ["contains", "not_contains"],
    description: "Recipe tags (e.g., quick, healthy, comfort food)",
  },
  {
    field: "rating",
    label: "Rating",
    type: "number",
    category: "metadata",
    operators: ["eq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
    unit: "stars",
  },
  {
    field: "is_favorite",
    label: "Is Favorite",
    type: "boolean",
    category: "metadata",
    operators: ["eq"],
  },
  // Time category
  {
    field: "created_at",
    label: "Date Added",
    type: "date",
    category: "time",
    operators: ["within_days"],
    description: "When the recipe was added",
  },
  {
    field: "prep_time",
    label: "Prep Time",
    type: "number",
    category: "time",
    operators: ["eq", "gt", "gte", "lt", "lte"],
    unit: "minutes",
  },
  {
    field: "cook_time",
    label: "Cook Time",
    type: "number",
    category: "time",
    operators: ["eq", "gt", "gte", "lt", "lte"],
    unit: "minutes",
  },
  {
    field: "total_time",
    label: "Total Time",
    type: "number",
    category: "time",
    operators: ["eq", "gt", "gte", "lt", "lte"],
    unit: "minutes",
  },
  // History category
  {
    field: "cook_count",
    label: "Times Cooked",
    type: "number",
    category: "history",
    operators: ["eq", "gt", "gte", "lt", "lte"],
    description: "Number of times you've cooked this recipe",
  },
  {
    field: "last_cooked_at",
    label: "Last Cooked",
    type: "date",
    category: "history",
    operators: ["within_days", "is_null", "is_not_null"],
    description: "When you last cooked this recipe",
  },
  // Dietary category
  {
    field: "allergen_tags",
    label: "Allergens",
    type: "tags",
    category: "dietary",
    operators: ["contains", "not_contains"],
    description: "Allergen warnings (e.g., gluten, dairy, nuts)",
  },
  // Nutrition category
  {
    field: "has_nutrition",
    label: "Has Nutrition Data",
    type: "boolean",
    category: "nutrition",
    operators: ["eq"],
  },
  {
    field: "calories",
    label: "Calories",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "kcal",
  },
  {
    field: "protein_g",
    label: "Protein",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "g",
  },
  {
    field: "carbs_g",
    label: "Carbs",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "g",
  },
  {
    field: "fat_g",
    label: "Fat",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "g",
  },
  {
    field: "fiber_g",
    label: "Fiber",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "g",
  },
  {
    field: "sugar_g",
    label: "Sugar",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "g",
  },
  {
    field: "sodium_mg",
    label: "Sodium",
    type: "number",
    category: "nutrition",
    operators: ["gt", "gte", "lt", "lte"],
    unit: "mg",
  },
];

// ============================================
// OPERATOR LABELS (for UI)
// ============================================

export const OPERATOR_LABELS: Record<SmartFilterOperator, string> = {
  eq: "equals",
  neq: "does not equal",
  gt: "is greater than",
  gte: "is at least",
  lt: "is less than",
  lte: "is at most",
  in: "is one of",
  not_in: "is not one of",
  contains: "contains",
  not_contains: "does not contain",
  within_days: "within the last",
  is_null: "is empty",
  is_not_null: "is not empty",
};

// ============================================
// PRESETS (quick-create options)
// ============================================

export interface SmartFolderPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  filters: SmartFilterCriteria;
}

export const SMART_FOLDER_PRESETS: SmartFolderPreset[] = [
  {
    id: "quick_weeknight",
    name: "Quick Weeknight Dinners",
    emoji: "🌙",
    description: "Dinner recipes under 30 minutes",
    filters: {
      conditions: [
        { field: "recipe_type", operator: "eq", value: "dinner" },
        { field: "total_time", operator: "lt", value: 30 },
      ],
    },
  },
  {
    id: "high_protein",
    name: "High Protein",
    emoji: "💪",
    description: "Recipes with 30g+ protein",
    filters: {
      conditions: [
        { field: "protein_g", operator: "gte", value: 30 },
      ],
    },
  },
  {
    id: "low_carb",
    name: "Low Carb",
    emoji: "🥗",
    description: "Recipes with under 20g carbs",
    filters: {
      conditions: [
        { field: "carbs_g", operator: "lt", value: 20 },
      ],
    },
  },
  {
    id: "vegetarian",
    name: "Vegetarian",
    emoji: "🥬",
    description: "Recipes without meat protein",
    filters: {
      conditions: [
        { field: "protein_type", operator: "in", value: ["tofu", "tempeh", "eggs", "none"] },
      ],
    },
  },
  {
    id: "chicken_dinners",
    name: "Chicken Dinners",
    emoji: "🍗",
    description: "Dinner recipes with chicken",
    filters: {
      conditions: [
        { field: "recipe_type", operator: "eq", value: "dinner" },
        { field: "protein_type", operator: "eq", value: "chicken" },
      ],
    },
  },
  {
    id: "top_rated",
    name: "Top Rated",
    emoji: "⭐",
    description: "5-star recipes only",
    filters: {
      conditions: [
        { field: "rating", operator: "eq", value: 5 },
      ],
    },
  },
  {
    id: "untried",
    name: "Recipes to Try",
    emoji: "🆕",
    description: "Recipes you haven't cooked yet",
    filters: {
      conditions: [
        { field: "cook_count", operator: "eq", value: 0 },
      ],
    },
  },
  {
    id: "favorites_uncooked",
    name: "Favorite But Never Made",
    emoji: "💝",
    description: "Favorited recipes you haven't tried",
    filters: {
      conditions: [
        { field: "is_favorite", operator: "eq", value: true },
        { field: "cook_count", operator: "eq", value: 0 },
      ],
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFieldMeta(field: SmartFilterField): SmartFilterFieldMeta | undefined {
  return SMART_FILTER_FIELDS.find((f) => f.field === field);
}

export function getFieldsByCategory(category: SmartFilterFieldMeta["category"]): SmartFilterFieldMeta[] {
  return SMART_FILTER_FIELDS.filter((f) => f.category === category);
}

export function getOperatorLabel(operator: SmartFilterOperator): string {
  return OPERATOR_LABELS[operator];
}
```

### social.ts
```typescript
// Social features type definitions

import type { Recipe } from "./recipe";

// ============================================
// SHARING TYPES
// ============================================

export interface ShareableRecipe extends Recipe {
  is_public: boolean;
  share_token: string | null;
  view_count: number;
  original_recipe_id: string | null;
  original_author_id: string | null;
}

export interface RecipeShareEvent {
  id: string;
  recipe_id: string;
  event_type: "view" | "share_link_created" | "copy_recipe" | "signup_from_share";
  viewer_id: string | null;
  referrer: string | null;
  created_at: string;
}

export interface ShareAnalytics {
  total_views: number;
  unique_views: number;
  copies: number;
  signups_from_share: number;
}

// ============================================
// PUBLIC RECIPE TYPES
// ============================================

export interface RecipeAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface OriginalAuthor {
  id: string;
  username: string;
}

export interface PublicRecipe extends Recipe {
  is_public: boolean;
  share_token: string | null;
  view_count: number;
  original_recipe_id: string | null;
  original_author_id: string | null;
  author: RecipeAuthor;
  avg_rating: number | null;
  review_count: number;
  is_saved?: boolean;
  original_author?: OriginalAuthor | null;
}

export interface PublicRecipeFilters {
  search?: string;
  recipe_type?: string;
  category?: string;
  sort?: "trending" | "recent" | "rating" | "views";
  page?: number;
  limit?: number;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  photo_url: string | null;
  helpful_count: number;
  is_helpful?: boolean; // Whether current user marked it helpful
  created_at: string;
  updated_at: string;
  author: RecipeAuthor;
  response?: ReviewResponse | null;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  content?: string;
  photo?: File;
}

export interface ReviewWithAuthor extends Review {
  author: RecipeAuthor;
}

// ============================================
// USER PROFILE TYPES
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  public_profile: boolean;
  follower_count: number;
  following_count: number;
  public_recipe_count?: number;
  is_following?: boolean; // Whether current user follows this user
  created_at: string;
}

export interface ProfileFormData {
  username: string;
  bio?: string;
  public_profile: boolean;
}

// ============================================
// FOLLOWING TYPES
// ============================================

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  profile: UserProfile;
}

// ============================================
// ACTIVITY FEED TYPES
// ============================================

export type ActivityEventType = "new_recipe" | "review" | "cook_logged";

export interface ActivityFeedItem {
  id: string;
  actor_id: string;
  event_type: ActivityEventType;
  recipe_id: string | null;
  is_public: boolean;
  created_at: string;
  actor: RecipeAuthor;
  recipe?: {
    id: string;
    title: string;
    image_url: string | null;
  } | null;
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportReason = "inappropriate" | "spam" | "copyright" | "misleading" | "other";
export type RecipeReportReason = ReportReason; // Alias for use in actions
export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface RecipeReport {
  id: string;
  recipe_id: string;
  reporter_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ReportFormData {
  reason: ReportReason;
  description?: string;
}

// ============================================
// SAVED RECIPES TYPES
// ============================================

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

// Simplified type for saved recipe list display (doesn't need all Recipe fields)
export interface SavedRecipeListItem {
  id: string;
  title: string;
  recipe_type: string;
  category: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  image_url: string | null;
  view_count: number;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  author: RecipeAuthor;
  is_saved: boolean;
}

// ============================================
// TRENDING TYPES
// ============================================

export interface TrendingRecipe {
  id: string;
  title: string;
  recipe_type: string;
  category: string | null;
  image_url: string | null;
  view_count: number;
  save_count: number;
  score: number;
  author: RecipeAuthor;
  is_saved: boolean;
}

export interface TrendingCacheEntry {
  recipe_id: string;
  score: number;
  view_count: number;
  save_count: number;
  calculated_at: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | "new_follower"
  | "recipe_liked"
  | "recipe_saved"
  | "review_received"
  | "review_helpful"
  | "review_response"
  | "recipe_cooked"
  | "mention"
  | "system";

export interface SocialNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  actor: RecipeAuthor | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ShareLinkResponse {
  share_token: string;
  share_url: string;
}

export interface PublicRecipesResponse {
  recipes: PublicRecipe[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  avg_rating: number | null;
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[];
  has_more: boolean;
  cursor: string | null;
}
```

### stores.ts
```typescript
// Stores & Cost Tracking Types
// For managing grocery stores and ingredient price tracking

export interface GroceryStore {
  id: string;
  householdId: string;
  name: string;
  emoji: string;
  color: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  websiteUrl: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryStoreFormData {
  name: string;
  emoji?: string;
  color?: string;
  address?: string;
  city?: string;
  notes?: string;
  websiteUrl?: string;
  isDefault?: boolean;
}

export interface IngredientPrice {
  id: string;
  householdId: string;
  ingredientName: string;
  storeId: string | null;
  price: number;
  unit: string; // "per lb", "each", "per oz", "per gallon"
  quantity: number; // e.g., 2 for "2 lb bag"
  currency: string;
  notes: string | null;
  isSalePrice: boolean;
  saleExpiresAt: string | null;
  lastUpdated: string;
  createdAt: string;
}

export interface IngredientPriceFormData {
  ingredientName: string;
  storeId?: string;
  price: number;
  unit?: string;
  quantity?: number;
  currency?: string;
  notes?: string;
  isSalePrice?: boolean;
  saleExpiresAt?: string;
}

export interface RecipeCost {
  id: string;
  recipeId: string;
  totalCost: number | null;
  costPerServing: number | null;
  currency: string;
  lastCalculated: string;
  ingredientBreakdown: IngredientCostBreakdown[];
  missingPrices: string[];
  calculationNotes: string | null;
  createdAt: string;
}

export interface IngredientCostBreakdown {
  ingredient: string;
  cost: number;
  storeName: string | null;
  quantity: string;
  unit: string;
}

// For displaying best price info
export interface BestPriceInfo {
  price: number;
  unit: string;
  storeId: string | null;
  storeName: string | null;
  isSale: boolean;
}

// Unit options for ingredient pricing
export const PRICE_UNITS = [
  { value: 'each', label: 'Each' },
  { value: 'per lb', label: 'Per Pound' },
  { value: 'per oz', label: 'Per Ounce' },
  { value: 'per kg', label: 'Per Kilogram' },
  { value: 'per g', label: 'Per Gram' },
  { value: 'per gallon', label: 'Per Gallon' },
  { value: 'per liter', label: 'Per Liter' },
  { value: 'per quart', label: 'Per Quart' },
  { value: 'per pint', label: 'Per Pint' },
  { value: 'per cup', label: 'Per Cup' },
  { value: 'per dozen', label: 'Per Dozen' },
  { value: 'per bunch', label: 'Per Bunch' },
  { value: 'per bag', label: 'Per Bag' },
  { value: 'per box', label: 'Per Box' },
  { value: 'per can', label: 'Per Can' },
  { value: 'per jar', label: 'Per Jar' },
  { value: 'per bottle', label: 'Per Bottle' },
] as const;

// Currency options
export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'MXN', label: 'Mexican Peso ($)', symbol: '$' },
  { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
] as const;

// Default store color palette
export const STORE_COLOR_PALETTE = [
  { key: 'red', color: '#ef4444', label: 'Red' },
  { key: 'orange', color: '#f97316', label: 'Orange' },
  { key: 'amber', color: '#f59e0b', label: 'Amber' },
  { key: 'yellow', color: '#eab308', label: 'Yellow' },
  { key: 'lime', color: '#84cc16', label: 'Lime' },
  { key: 'green', color: '#22c55e', label: 'Green' },
  { key: 'emerald', color: '#10b981', label: 'Emerald' },
  { key: 'teal', color: '#14b8a6', label: 'Teal' },
  { key: 'cyan', color: '#06b6d4', label: 'Cyan' },
  { key: 'sky', color: '#0ea5e9', label: 'Sky' },
  { key: 'blue', color: '#3b82f6', label: 'Blue' },
  { key: 'indigo', color: '#6366f1', label: 'Indigo' },
  { key: 'violet', color: '#8b5cf6', label: 'Violet' },
  { key: 'purple', color: '#a855f7', label: 'Purple' },
  { key: 'fuchsia', color: '#d946ef', label: 'Fuchsia' },
  { key: 'pink', color: '#ec4899', label: 'Pink' },
] as const;

// Store emoji suggestions
export const STORE_EMOJI_SUGGESTIONS = [
  '🏪', '🛒', '🏬', '🏢', '🏠', '🌽', '🥬', '🍎', '🥩', '🧀',
  '🍞', '🐟', '🌿', '💊', '🎯', '💰', '⭐', '🔵', '🟢', '🔴',
];
```

### subscription.ts
```typescript
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  aiSuggestionsPerWeek: number | 'unlimited';
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Free',
    tier: 'free',
    price: 0,
    interval: 'month',
    stripePriceId: '',
    aiSuggestionsPerWeek: 0,
    features: [
      'Unlimited recipes',
      'Basic meal planning',
      'Shopping list generation',
      'Recipe import',
      'Cooking history tracking',
    ],
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: 7,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
    aiSuggestionsPerWeek: 5,
    popular: true,
    features: [
      'Everything in Free',
      '5 AI meal suggestions per week',
      'Multi-week meal planning',
      'Multi-week shopping lists',
      'Household sharing',
      'Google Calendar sync',
      'Email shopping lists',
      'Recipe scaling',
      'Priority support',
    ],
  },
  {
    name: 'Premium',
    tier: 'premium',
    price: 12,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || '',
    aiSuggestionsPerWeek: 'unlimited',
    features: [
      'Everything in Pro',
      'Unlimited AI meal suggestions',
      'Advanced meal planning',
      'Custom integrations',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export function getQuotaForTier(tier: SubscriptionTier): number | null {
  if (tier === 'free') return 0;
  if (tier === 'pro') return 5;
  if (tier === 'premium') return null; // unlimited
  return 0;
}

export type SubscriptionFeature =
  | 'ai_suggestions'
  | 'household_sharing'
  | 'google_calendar'
  | 'email_lists'
  | 'multi_week_planning';

export function hasFeatureAccess(
  tier: SubscriptionTier,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _feature: SubscriptionFeature
): boolean {
  if (tier === 'free') return false;
  if (tier === 'pro' || tier === 'premium') return true;
  return false;
}
```

### substitution.ts
```typescript
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
```

### templates.ts
```typescript
// Meal Plan Templates Types
// For saving and reusing meal plan structures

export interface MealPlanTemplate {
  id: string;
  householdId: string | null; // null = community template
  userId: string;
  name: string;
  description: string | null;
  emoji: string;
  isPublic: boolean;
  tags: string[];
  templateData: TemplateWeekData;
  dietaryInfo: DietaryInfo;
  estimatedCost: number | null;
  averageDailyCalories: number | null;
  timesUsed: number;
  totalRatings: number;
  ratingSum: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateWeekData {
  monday?: TemplateDayData;
  tuesday?: TemplateDayData;
  wednesday?: TemplateDayData;
  thursday?: TemplateDayData;
  friday?: TemplateDayData;
  saturday?: TemplateDayData;
  sunday?: TemplateDayData;
}

export interface TemplateDayData {
  [mealType: string]: TemplateMealSlot;
}

// Each slot can specify a recipe, criteria for random selection, or be empty
export interface TemplateMealSlot {
  recipeId?: string;      // specific recipe
  folderId?: string;      // pick from folder
  tags?: string[];        // pick recipe matching tags
  proteinType?: string;   // pick recipe with protein type
  random?: boolean;       // randomize selection when applying
}

export interface DietaryInfo {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isKeto?: boolean;
  isLowCarb?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isPaleo?: boolean;
  isWhole30?: boolean;
}

export interface MealPlanTemplateRating {
  id: string;
  templateId: string;
  userId: string;
  rating: number; // 1-5
  review: string | null;
  createdAt: string;
}

export interface MealPlanTemplateUsage {
  id: string;
  templateId: string;
  userId: string;
  appliedToWeek: string; // ISO date of Monday
  mode: 'replace' | 'merge';
  createdAt: string;
}

export interface MealPlanTemplateFormData {
  name: string;
  description?: string;
  emoji?: string;
  isPublic?: boolean;
  tags?: string[];
  templateData: TemplateWeekData;
  dietaryInfo?: DietaryInfo;
  estimatedCost?: number;
  averageDailyCalories?: number;
}

// Template application modes
export type TemplateApplyMode = 'replace' | 'merge';

export interface ApplyTemplateOptions {
  templateId: string;
  weekStart: string; // ISO date string of Monday
  mode: TemplateApplyMode;
}

// For displaying template cards
export interface TemplatePreview {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  isPublic: boolean;
  tags: string[];
  timesUsed: number;
  averageRating: number | null;
  totalRatings: number;
  authorName?: string;
  dietaryInfo: DietaryInfo;
  mealCount: number; // Total meals in template
}

// Dietary tag display info
export const DIETARY_TAGS: Array<{
  key: keyof DietaryInfo;
  label: string;
  emoji: string;
  color: string;
}> = [
  { key: 'isVegetarian', label: 'Vegetarian', emoji: '🥬', color: '#22c55e' },
  { key: 'isVegan', label: 'Vegan', emoji: '🌱', color: '#16a34a' },
  { key: 'isKeto', label: 'Keto', emoji: '🥑', color: '#84cc16' },
  { key: 'isLowCarb', label: 'Low Carb', emoji: '🥗', color: '#65a30d' },
  { key: 'isGlutenFree', label: 'Gluten-Free', emoji: '🌾', color: '#f59e0b' },
  { key: 'isDairyFree', label: 'Dairy-Free', emoji: '🥛', color: '#0ea5e9' },
  { key: 'isPaleo', label: 'Paleo', emoji: '🦴', color: '#a16207' },
  { key: 'isWhole30', label: 'Whole30', emoji: '30', color: '#dc2626' },
];

// Popular template tags
export const TEMPLATE_TAG_SUGGESTIONS = [
  'budget-friendly',
  'meal-prep',
  'quick-meals',
  'family-friendly',
  'date-night',
  'comfort-food',
  'healthy',
  'high-protein',
  'batch-cooking',
  'weeknight-easy',
  'weekend-project',
  'entertaining',
  'seasonal',
  'holiday',
  'summer',
  'winter',
  'grilling',
  'slow-cooker',
  'instant-pot',
  'one-pot',
];

// Days of week for template
export const TEMPLATE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type TemplateDay = typeof TEMPLATE_DAYS[number];
```

### user-preferences-v2.ts
```typescript
// ============================================================================
// Expanded User Preferences (V2)
// Comprehensive display settings, sounds, keyboard shortcuts, AI personality
// ============================================================================

import {
  RecipeLayoutPreferences,
  DEFAULT_RECIPE_LAYOUT_PREFERENCES,
} from "./recipe-layout";

// Display Preferences
export type WeekStartDay = "monday" | "sunday" | "saturday";
export type TimeFormat = "12h" | "24h";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type RatingScale = "5-star" | "10-star" | "thumbs" | "letter" | "emoji";
export type ThemeMode = "system" | "light" | "dark" | "custom";

export interface DisplayPreferences {
  weekStartDay: WeekStartDay;
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  ratingScale: RatingScale;
  customRatingEmojis: string[]; // 5 emojis when ratingScale is "emoji"
  theme: ThemeMode;
  accentColor: string; // hex color
  seasonalThemes: boolean;
}

// Sound Preferences
export type SoundPreset =
  | "chime"
  | "bell"
  | "ding"
  | "ping"
  | "pop"
  | "whoosh"
  | "fanfare"
  | "success"
  | "tada"
  | "click"
  | "tick"
  | "none";

export interface SoundPreferences {
  enabled: boolean;
  timerComplete: SoundPreset;
  notification: SoundPreset;
  achievement: SoundPreset;
}

// Serving Size Presets
export interface ServingSizePreset {
  name: string;
  size: number;
}

// Keyboard Shortcuts
export interface KeyboardPreferences {
  enabled: boolean;
  shortcuts: Record<string, string>; // action -> key mapping
}

// AI Personality
export type AiPersonalityType = "friendly" | "professional" | "grandma" | "gordon" | "custom";

// Privacy Preferences (all OFF by default - opt-in model per research findings)
export interface PrivacyPreferences {
  analyticsEnabled: boolean;          // Share anonymous usage data
  crashReporting: boolean;            // Send crash reports to help fix bugs
  personalizedRecommendations: boolean; // AI-powered recipe suggestions based on history
  consentTimestamp: string | null;    // ISO timestamp when user explicitly opted in
}

// Full V2 Preferences Structure
export interface UserPreferencesV2 {
  display: DisplayPreferences;
  sounds: SoundPreferences;
  servingSizePresets: ServingSizePreset[];
  keyboard: KeyboardPreferences;
  aiPersonality: AiPersonalityType;
  customAiPrompt: string | null;
  privacy: PrivacyPreferences;
  sidebar: SidebarPreferences;
  recipeLayout: RecipeLayoutPreferences;
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  weekStartDay: "monday",
  timeFormat: "12h",
  dateFormat: "MM/DD/YYYY",
  ratingScale: "5-star",
  customRatingEmojis: ["🤮", "😕", "😐", "😊", "🤩"],
  theme: "system",
  accentColor: "#6366f1",
  seasonalThemes: false,
};

export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: true,
  timerComplete: "chime",
  notification: "ping",
  achievement: "fanfare",
};

export const DEFAULT_SERVING_SIZE_PRESETS: ServingSizePreset[] = [
  { name: "Just Me", size: 1 },
  { name: "Date Night", size: 2 },
  { name: "Family", size: 4 },
  { name: "Meal Prep", size: 8 },
];

export const DEFAULT_KEYBOARD_SHORTCUTS: Record<string, string> = {
  newRecipe: "n",
  search: "/",
  nextWeek: "ArrowRight",
  prevWeek: "ArrowLeft",
  toggleDarkMode: "d",
  openSettings: ",",
  goToPlanner: "p",
  goToRecipes: "r",
  goToShopping: "s",
};

export const DEFAULT_KEYBOARD_PREFERENCES: KeyboardPreferences = {
  enabled: true,
  shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

// Privacy defaults: ALL OFF by default (opt-in model)
export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  analyticsEnabled: false,           // OFF by default
  crashReporting: false,             // OFF by default
  personalizedRecommendations: false, // OFF by default
  consentTimestamp: null,
};

// Sidebar Preferences
export type SidebarMode = "expanded" | "collapsed";

export const DEFAULT_SIDEBAR_PREFERENCES: SidebarPreferences = {
  mode: "expanded",
  width: 260,
  pinnedItems: [],
  hiddenItems: [],
  pinnedSectionExpanded: true,
};

export const DEFAULT_USER_PREFERENCES_V2: UserPreferencesV2 = {
  display: DEFAULT_DISPLAY_PREFERENCES,
  sounds: DEFAULT_SOUND_PREFERENCES,
  servingSizePresets: DEFAULT_SERVING_SIZE_PRESETS,
  keyboard: DEFAULT_KEYBOARD_PREFERENCES,
  aiPersonality: "friendly",
  customAiPrompt: null,
  privacy: DEFAULT_PRIVACY_PREFERENCES,
  sidebar: DEFAULT_SIDEBAR_PREFERENCES,
  recipeLayout: DEFAULT_RECIPE_LAYOUT_PREFERENCES,
};

// ============================================================================
// Helper Types for Component Props
// ============================================================================

export interface AiPersonalityPreset {
  id: AiPersonalityType;
  name: string;
  description: string;
  prompt: string;
}

export const AI_PERSONALITY_PRESETS: AiPersonalityPreset[] = [
  {
    id: "friendly",
    name: "Friendly Assistant",
    description: "Casual, encouraging, and supportive",
    prompt:
      "You are a friendly and encouraging cooking assistant. Be supportive, positive, and casual in your tone.",
  },
  {
    id: "professional",
    name: "Professional Chef",
    description: "Formal, efficient, and precise",
    prompt:
      "You are a professional chef. Be precise, use proper culinary terminology, and provide expert guidance with a formal tone.",
  },
  {
    id: "grandma",
    name: "Grandma",
    description: "Warm, nurturing, with family wisdom",
    prompt:
      "You are like a loving grandmother sharing family recipes and cooking wisdom. Be warm, nostalgic, and nurturing.",
  },
  {
    id: "gordon",
    name: "Gordon Ramsay",
    description: "Critical, demanding, passionate",
    prompt:
      "You are passionate about cooking with high standards. Be direct, demanding of quality, and occasionally critical, but ultimately supportive.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Define your own AI personality",
    prompt: "",
  },
];

export interface SoundOption {
  id: SoundPreset;
  name: string;
  category: "timer" | "notification" | "achievement" | "ui" | "all";
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "chime", name: "Chime", category: "timer" },
  { id: "bell", name: "Bell", category: "timer" },
  { id: "ding", name: "Ding", category: "timer" },
  { id: "ping", name: "Ping", category: "notification" },
  { id: "pop", name: "Pop", category: "notification" },
  { id: "whoosh", name: "Whoosh", category: "notification" },
  { id: "fanfare", name: "Fanfare", category: "achievement" },
  { id: "success", name: "Success", category: "achievement" },
  { id: "tada", name: "Tada", category: "achievement" },
  { id: "click", name: "Click", category: "ui" },
  { id: "tick", name: "Tick", category: "ui" },
  { id: "none", name: "None (Silent)", category: "all" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY" as DateFormat, label: "MM/DD/YYYY", example: "12/31/2025" },
  { value: "DD/MM/YYYY" as DateFormat, label: "DD/MM/YYYY", example: "31/12/2025" },
  { value: "YYYY-MM-DD" as DateFormat, label: "YYYY-MM-DD", example: "2025-12-31" },
];

export const ACCENT_COLOR_PALETTE = [
  { key: "indigo", color: "#6366f1", label: "Indigo" },
  { key: "blue", color: "#3b82f6", label: "Blue" },
  { key: "sky", color: "#0ea5e9", label: "Sky" },
  { key: "cyan", color: "#06b6d4", label: "Cyan" },
  { key: "teal", color: "#14b8a6", label: "Teal" },
  { key: "emerald", color: "#10b981", label: "Emerald" },
  { key: "green", color: "#22c55e", label: "Green" },
  { key: "lime", color: "#84cc16", label: "Lime" },
  { key: "yellow", color: "#eab308", label: "Yellow" },
  { key: "amber", color: "#f59e0b", label: "Amber" },
  { key: "orange", color: "#f97316", label: "Orange" },
  { key: "red", color: "#ef4444", label: "Red" },
  { key: "rose", color: "#f43f5e", label: "Rose" },
  { key: "pink", color: "#ec4899", label: "Pink" },
  { key: "fuchsia", color: "#d946ef", label: "Fuchsia" },
  { key: "purple", color: "#a855f7", label: "Purple" },
  { key: "violet", color: "#8b5cf6", label: "Violet" },
] as const;

// ============================================================================
// Sidebar Preferences (Phase 6 Enhancement)
// ============================================================================

export type PinnableItemType =
  | "page"
  | "recipe"
  | "folder"
  | "smart_folder"
  | "category"
  | "custom_link";

export interface PinnedItem {
  type: PinnableItemType;
  id: string;
  name?: string;        // For recipes, custom links
  emoji?: string;       // For folders
  url?: string;         // For custom links
  icon?: string;        // Custom icon name
  addedAt: string;      // ISO timestamp
}

export interface SidebarPreferences {
  mode: SidebarMode;
  width: number;
  pinnedItems: PinnedItem[];
  hiddenItems: string[];
  pinnedSectionExpanded: boolean;
}

// Re-export recipe layout types for convenience
export type {
  RecipeLayoutPreferences,
  RecipeSectionId,
  RecipeSectionWidth,
  RecipeSectionConfig,
} from "./recipe-layout";
export {
  DEFAULT_RECIPE_LAYOUT_PREFERENCES,
  RECIPE_SECTION_LABELS,
  RECIPE_SECTION_DESCRIPTIONS,
  getOrderedSections,
  getVisibleSections,
  reorderSections,
  toggleSectionVisibility,
  updateSectionWidth,
  resetToDefaultLayout,
} from "./recipe-layout";
```

### voice-cooking.ts
```typescript
// Voice Cooking Mode types

export type CookingSessionStatus = "active" | "paused" | "completed" | "abandoned";
export type TimerStatus = "active" | "paused" | "completed" | "cancelled";
export type NavigationDirection = "next" | "back" | "repeat";

export interface VoiceCookingSession {
  id: string;
  user_id: string;
  recipe_id: string;
  current_step: number;
  total_steps: number;
  status: CookingSessionStatus;
  servings_multiplier: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceSessionTimer {
  id: string;
  session_id: string;
  label: string;
  duration_seconds: number;
  remaining_seconds: number;
  status: TimerStatus;
  step_index: number | null;
  alert_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveCookingSession extends VoiceCookingSession {
  recipe_title: string;
  recipe_servings: string | null;
  current_instruction: string;
  instructions: string[];
  ingredients: string[];
}

export interface NavigationResult {
  new_step: number;
  total_steps: number;
  is_complete: boolean;
  instruction: string;
}

export interface CompleteCookingData {
  rating?: number;
  notes?: string;
  photo_url?: string;
}

export interface CreateTimerData {
  label: string;
  durationSeconds: number;
  stepIndex?: number;
  alertMessage?: string;
}
```

### waste-tracking.ts
```typescript
// Food Waste Tracking Types

/**
 * Weekly waste metrics (computed from existing data)
 */
export interface WasteMetrics {
  id: string;
  household_id: string;
  week_start: string;  // ISO date (Monday)

  // Raw counts
  meals_planned: number;
  meals_cooked: number;
  shopping_items_total: number;
  shopping_items_checked: number;
  pantry_items_used: number;

  // Computed metrics
  estimated_waste_prevented_kg: number;
  estimated_money_saved_cents: number;
  estimated_co2_saved_kg: number;

  created_at: string;
  updated_at: string;
}

/**
 * Calculated rates from waste metrics
 */
export interface WasteRates {
  utilization_rate: number;       // meals_cooked / meals_planned (0-1)
  shopping_efficiency: number;    // items_checked / items_total (0-1)
  pantry_usage_rate: number;      // pantry_items_used / items_total (0-1)
}

/**
 * Combined metrics with rates for display
 */
export interface WasteMetricsWithRates extends WasteMetrics, WasteRates {}

/**
 * Aggregate metrics over time period
 */
export interface AggregateWasteMetrics {
  period: 'week' | 'month' | 'year' | 'all_time';
  total_meals_planned: number;
  total_meals_cooked: number;
  total_waste_prevented_kg: number;
  total_money_saved_cents: number;
  total_co2_saved_kg: number;
  average_utilization_rate: number;
  average_shopping_efficiency: number;
  weeks_tracked: number;
}

/**
 * Achievement types for gamification
 */
export type AchievementType =
  // Streaks
  | 'week_warrior'        // Cooked all planned meals for a week
  | 'month_master'        // 4-week cooking streak
  | 'quarter_champion'    // 12-week cooking streak

  // Milestones - Waste Prevention
  | 'first_kg'            // Prevented 1kg of food waste
  | 'five_kg'             // Prevented 5kg of food waste
  | 'ten_kg'              // Prevented 10kg of food waste
  | 'fifty_kg'            // Prevented 50kg of food waste

  // Milestones - Money Saved
  | 'first_ten_dollars'   // Saved $10
  | 'fifty_dollars'       // Saved $50
  | 'hundred_dollars'     // Saved $100

  // Efficiency
  | 'perfect_list'        // Checked off 100% of shopping list
  | 'pantry_pro'          // Used 5+ pantry items in one week
  | 'zero_waste_week'     // 100% meal utilization for a week

  // Consistency
  | 'first_plan'          // Created first meal plan
  | 'ten_weeks'           // 10 weeks of meal planning
  | 'six_months'          // 6 months of meal planning;

/**
 * Achievement definition
 */
export interface Achievement {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;  // Lucide icon name or emoji
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * Earned achievement record
 */
export interface EarnedAchievement {
  id: string;
  household_id: string;
  achievement_type: AchievementType;
  achieved_at: string;
  metadata: Record<string, unknown>;  // e.g., { week_count: 4 }
}

/**
 * Streak information
 */
export interface StreakInfo {
  current_streak: number;          // weeks
  longest_streak: number;          // weeks
  streak_start_date: string | null;
  last_completed_week: string | null;
  is_at_risk: boolean;             // Current week not yet completed
}

/**
 * Input for calculating waste metrics
 */
export interface WeekDataInput {
  household_id: string;
  week_start: string;  // ISO date
  meals_planned: number;
  meals_cooked: number;
  items_total: number;
  items_checked: number;
  pantry_items_used: number;
}

/**
 * Dashboard data structure
 */
export interface WasteDashboardData {
  current_week: WasteMetricsWithRates | null;
  weekly_trend: WasteMetrics[];     // Last 12 weeks
  aggregate: AggregateWasteMetrics;
  streak: StreakInfo;
  achievements: EarnedAchievement[];
  next_achievement: Achievement | null;  // Next achievable
}

// Achievement definitions
export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  // Streaks
  week_warrior: {
    type: 'week_warrior',
    name: 'Week Warrior',
    description: 'Cooked all planned meals for a week',
    icon: 'Flame',
    tier: 'bronze',
  },
  month_master: {
    type: 'month_master',
    name: 'Month Master',
    description: '4-week cooking streak',
    icon: 'Calendar',
    tier: 'silver',
  },
  quarter_champion: {
    type: 'quarter_champion',
    name: 'Quarter Champion',
    description: '12-week cooking streak',
    icon: 'Trophy',
    tier: 'gold',
  },

  // Waste Prevention Milestones
  first_kg: {
    type: 'first_kg',
    name: 'First Kilo',
    description: 'Prevented 1kg of food waste',
    icon: 'Leaf',
    tier: 'bronze',
  },
  five_kg: {
    type: 'five_kg',
    name: 'Eco Starter',
    description: 'Prevented 5kg of food waste',
    icon: 'Sprout',
    tier: 'silver',
  },
  ten_kg: {
    type: 'ten_kg',
    name: 'Waste Warrior',
    description: 'Prevented 10kg of food waste',
    icon: 'TreeDeciduous',
    tier: 'gold',
  },
  fifty_kg: {
    type: 'fifty_kg',
    name: 'Eco Champion',
    description: 'Prevented 50kg of food waste',
    icon: 'Trees',
    tier: 'platinum',
  },

  // Money Saved Milestones
  first_ten_dollars: {
    type: 'first_ten_dollars',
    name: 'Smart Saver',
    description: 'Saved $10 through meal planning',
    icon: 'PiggyBank',
    tier: 'bronze',
  },
  fifty_dollars: {
    type: 'fifty_dollars',
    name: 'Budget Boss',
    description: 'Saved $50 through meal planning',
    icon: 'Wallet',
    tier: 'silver',
  },
  hundred_dollars: {
    type: 'hundred_dollars',
    name: 'Savings Pro',
    description: 'Saved $100 through meal planning',
    icon: 'BadgeDollarSign',
    tier: 'gold',
  },

  // Efficiency
  perfect_list: {
    type: 'perfect_list',
    name: 'Perfect List',
    description: 'Checked off 100% of shopping list',
    icon: 'CheckCheck',
    tier: 'bronze',
  },
  pantry_pro: {
    type: 'pantry_pro',
    name: 'Pantry Pro',
    description: 'Used 5+ pantry items in one week',
    icon: 'UtensilsCrossed',
    tier: 'silver',
  },
  zero_waste_week: {
    type: 'zero_waste_week',
    name: 'Zero Waste Week',
    description: '100% meal utilization for a week',
    icon: 'Recycle',
    tier: 'gold',
  },

  // Consistency
  first_plan: {
    type: 'first_plan',
    name: 'First Steps',
    description: 'Created your first meal plan',
    icon: 'ClipboardList',
    tier: 'bronze',
  },
  ten_weeks: {
    type: 'ten_weeks',
    name: 'Dedicated Planner',
    description: '10 weeks of meal planning',
    icon: 'CalendarDays',
    tier: 'silver',
  },
  six_months: {
    type: 'six_months',
    name: 'Half Year Hero',
    description: '6 months of consistent meal planning',
    icon: 'Award',
    tier: 'gold',
  },
};

// Industry average constants for calculations
export const WASTE_CONSTANTS = {
  // Average food waste per meal without planning (kg)
  AVG_WASTE_PER_UNPLANNED_MEAL_KG: 0.15,

  // Average cost per kg of food waste (USD)
  AVG_COST_PER_KG_WASTE: 5.00,

  // CO2 emissions per kg of food waste (kg CO2)
  CO2_PER_KG_FOOD_WASTE: 2.5,

  // Baseline waste reduction from meal planning (multiplier)
  PLANNING_WASTE_REDUCTION_FACTOR: 0.65,  // 65% reduction vs unplanned
} as const;
```

## Database Schema (Initial)
```sql
-- ============================================
-- "Babe, What's for Dinner?" Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Households (for family/couple sharing)
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Household',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household membership
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Household invitations
CREATE TABLE IF NOT EXISTS household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes (one row per recipe, not JSONB array)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  recipe_type TEXT NOT NULL DEFAULT 'Dinner' CHECK (recipe_type IN ('Dinner', 'Baking', 'Breakfast', 'Dessert', 'Snack', 'Side Dish')),
  category TEXT,
  protein_type TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  source_url TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),

  -- Ownership
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  is_shared_with_household BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites (user-recipe junction)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Cooking history
CREATE TABLE IF NOT EXISTS cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TIMESTAMPTZ DEFAULT NOW(),
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  notes TEXT
);

-- Meal plans (weekly, tied to household)
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, week_start)
);

-- Meal assignments (recipe to day)
CREATE TABLE IF NOT EXISTS meal_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  cook TEXT, -- Name of person cooking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE UNIQUE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  custom_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping list items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  quantity TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  checked BOOLEAN DEFAULT false,
  recipe_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plan templates
CREATE TABLE IF NOT EXISTS meal_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assignments JSONB NOT NULL DEFAULT '[]', -- Array of {recipe_id, day_of_week, cook}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  dark_mode BOOLEAN DEFAULT false,
  cook_names TEXT[] DEFAULT ARRAY['You', 'Partner'],
  email_address TEXT,
  additional_emails TEXT[] DEFAULT '{}',

  -- Google Calendar tokens (encrypted in production)
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_connected_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_household_id ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_recipes_recipe_type ON recipes(recipe_type);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_user_id ON cooking_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_cooked_at ON cooking_history(cooked_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_id ON meal_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week_start ON meal_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_meal_assignments_meal_plan_id ON meal_assignments(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_email ON household_invitations(email);
CREATE INDEX IF NOT EXISTS idx_household_invitations_token ON household_invitations(token);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_households_updated_at ON households;
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON shopping_lists;
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PROFILE & HOUSEHOLD AUTO-CREATION ON SIGNUP
-- ============================================

-- Function to create profile and household when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Create default household
  INSERT INTO households (name, owner_id)
  VALUES ('My Household', NEW.id)
  RETURNING id INTO new_household_id;

  -- Add user as household owner
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.id, 'owner');

  -- Create default user settings
  INSERT INTO user_settings (user_id, email_address)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's household ID
CREATE OR REPLACE FUNCTION get_user_household_id(p_user_id UUID)
RETURNS UUID AS $$
  SELECT household_id
  FROM household_members
  WHERE user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user is household member
CREATE OR REPLACE FUNCTION is_household_member(p_user_id UUID, p_household_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE user_id = p_user_id AND household_id = p_household_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

```

## RLS Policies
```sql
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can view profiles of household members
DROP POLICY IF EXISTS "Users can view household member profiles" ON profiles;
CREATE POLICY "Users can view household member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT hm2.user_id
      FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid()
    )
  );

-- ============================================
-- HOUSEHOLDS POLICIES
-- ============================================

-- Users can view households they belong to
DROP POLICY IF EXISTS "Users can view their households" ON households;
CREATE POLICY "Users can view their households"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Owners can update their households
DROP POLICY IF EXISTS "Owners can update households" ON households;
CREATE POLICY "Owners can update households"
  ON households FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can create households
DROP POLICY IF EXISTS "Users can create households" ON households;
CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Owners can delete their households
DROP POLICY IF EXISTS "Owners can delete households" ON households;
CREATE POLICY "Owners can delete households"
  ON households FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- HOUSEHOLD MEMBERS POLICIES
-- ============================================

-- Users can view members of their households
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household owners can add members
DROP POLICY IF EXISTS "Owners can add household members" ON household_members;
CREATE POLICY "Owners can add household members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- Users can add themselves (for accepting invites)
  );

-- Household owners can remove members (except themselves)
DROP POLICY IF EXISTS "Owners can remove household members" ON household_members;
CREATE POLICY "Owners can remove household members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- Members can remove themselves
  );

-- ============================================
-- HOUSEHOLD INVITATIONS POLICIES
-- ============================================

-- Inviters can view invitations they sent
DROP POLICY IF EXISTS "Users can view sent invitations" ON household_invitations;
CREATE POLICY "Users can view sent invitations"
  ON household_invitations FOR SELECT
  USING (invited_by = auth.uid());

-- Recipients can view invitations by email
DROP POLICY IF EXISTS "Recipients can view invitations" ON household_invitations;
CREATE POLICY "Recipients can view invitations"
  ON household_invitations FOR SELECT
  USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Anyone can view invitation by token (for accept flow)
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON household_invitations;
CREATE POLICY "Anyone can view invitation by token"
  ON household_invitations FOR SELECT
  USING (true); -- Token lookup handled in application

-- Household owners can create invitations
DROP POLICY IF EXISTS "Owners can create invitations" ON household_invitations;
CREATE POLICY "Owners can create invitations"
  ON household_invitations FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Inviter or recipient can update invitation status
DROP POLICY IF EXISTS "Users can update invitation status" ON household_invitations;
CREATE POLICY "Users can update invitation status"
  ON household_invitations FOR UPDATE
  USING (
    invited_by = auth.uid()
    OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Inviters can delete invitations
DROP POLICY IF EXISTS "Inviters can delete invitations" ON household_invitations;
CREATE POLICY "Inviters can delete invitations"
  ON household_invitations FOR DELETE
  USING (invited_by = auth.uid());

-- ============================================
-- RECIPES POLICIES
-- ============================================

-- Users can view their own recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (user_id = auth.uid());

-- Users can view shared household recipes
DROP POLICY IF EXISTS "Users can view household recipes" ON recipes;
CREATE POLICY "Users can view household recipes"
  ON recipes FOR SELECT
  USING (
    is_shared_with_household = true
    AND household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Users can create recipes
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own recipes
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own recipes
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FAVORITES POLICIES
-- ============================================

-- Users can view their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove favorites
DROP POLICY IF EXISTS "Users can remove favorites" ON favorites;
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- COOKING HISTORY POLICIES
-- ============================================

-- Users can view their own cooking history
DROP POLICY IF EXISTS "Users can view own cooking history" ON cooking_history;
CREATE POLICY "Users can view own cooking history"
  ON cooking_history FOR SELECT
  USING (user_id = auth.uid());

-- Users can add to cooking history
DROP POLICY IF EXISTS "Users can add cooking history" ON cooking_history;
CREATE POLICY "Users can add cooking history"
  ON cooking_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their cooking history
DROP POLICY IF EXISTS "Users can update cooking history" ON cooking_history;
CREATE POLICY "Users can update cooking history"
  ON cooking_history FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their cooking history
DROP POLICY IF EXISTS "Users can delete cooking history" ON cooking_history;
CREATE POLICY "Users can delete cooking history"
  ON cooking_history FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- MEAL PLANS POLICIES
-- ============================================

-- Household members can view meal plans
DROP POLICY IF EXISTS "Household members can view meal plans" ON meal_plans;
CREATE POLICY "Household members can view meal plans"
  ON meal_plans FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create meal plans
DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update meal plans
DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete meal plans
DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;
CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- MEAL ASSIGNMENTS POLICIES
-- ============================================

-- Household members can view meal assignments
DROP POLICY IF EXISTS "Household members can view meal assignments" ON meal_assignments;
CREATE POLICY "Household members can view meal assignments"
  ON meal_assignments FOR SELECT
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can create meal assignments
DROP POLICY IF EXISTS "Household members can create meal assignments" ON meal_assignments;
CREATE POLICY "Household members can create meal assignments"
  ON meal_assignments FOR INSERT
  WITH CHECK (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can update meal assignments
DROP POLICY IF EXISTS "Household members can update meal assignments" ON meal_assignments;
CREATE POLICY "Household members can update meal assignments"
  ON meal_assignments FOR UPDATE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can delete meal assignments
DROP POLICY IF EXISTS "Household members can delete meal assignments" ON meal_assignments;
CREATE POLICY "Household members can delete meal assignments"
  ON meal_assignments FOR DELETE
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- SHOPPING LISTS POLICIES
-- ============================================

-- Household members can view shopping lists
DROP POLICY IF EXISTS "Household members can view shopping lists" ON shopping_lists;
CREATE POLICY "Household members can view shopping lists"
  ON shopping_lists FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create shopping lists
DROP POLICY IF EXISTS "Household members can create shopping lists" ON shopping_lists;
CREATE POLICY "Household members can create shopping lists"
  ON shopping_lists FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update shopping lists
DROP POLICY IF EXISTS "Household members can update shopping lists" ON shopping_lists;
CREATE POLICY "Household members can update shopping lists"
  ON shopping_lists FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete shopping lists
DROP POLICY IF EXISTS "Household members can delete shopping lists" ON shopping_lists;
CREATE POLICY "Household members can delete shopping lists"
  ON shopping_lists FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- SHOPPING LIST ITEMS POLICIES
-- ============================================

-- Household members can view shopping list items
DROP POLICY IF EXISTS "Household members can view shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can view shopping list items"
  ON shopping_list_items FOR SELECT
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can create shopping list items
DROP POLICY IF EXISTS "Household members can create shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can create shopping list items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can update shopping list items
DROP POLICY IF EXISTS "Household members can update shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can update shopping list items"
  ON shopping_list_items FOR UPDATE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Household members can delete shopping list items
DROP POLICY IF EXISTS "Household members can delete shopping list items" ON shopping_list_items;
CREATE POLICY "Household members can delete shopping list items"
  ON shopping_list_items FOR DELETE
  USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- MEAL PLAN TEMPLATES POLICIES
-- ============================================

-- Household members can view templates
DROP POLICY IF EXISTS "Household members can view templates" ON meal_plan_templates;
CREATE POLICY "Household members can view templates"
  ON meal_plan_templates FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can create templates
DROP POLICY IF EXISTS "Household members can create templates" ON meal_plan_templates;
CREATE POLICY "Household members can create templates"
  ON meal_plan_templates FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can update templates
DROP POLICY IF EXISTS "Household members can update templates" ON meal_plan_templates;
CREATE POLICY "Household members can update templates"
  ON meal_plan_templates FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household members can delete templates
DROP POLICY IF EXISTS "Household members can delete templates" ON meal_plan_templates;
CREATE POLICY "Household members can delete templates"
  ON meal_plan_templates FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- USER SETTINGS POLICIES
-- ============================================

-- Users can view their own settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own settings
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables for authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limited access for anonymous users (for invite token lookup)
GRANT SELECT ON household_invitations TO anon;

```

## Core Libraries
### allergen-detector.ts
```typescript
/**
 * Allergen detection and management utilities
 * Auto-detects allergens from recipe ingredients and manages allergen tags
 */

// Common allergen categories (FDA Big 9 + sesame)
export const ALLERGEN_TYPES = [
  "gluten",
  "dairy",
  "eggs",
  "tree nuts",
  "peanuts",
  "shellfish",
  "soy",
  "fish",
  "sesame",
] as const;

export type AllergenType = (typeof ALLERGEN_TYPES)[number];

// Mapping of ingredient keywords to allergens
const INGREDIENT_TO_ALLERGEN_MAP: Record<string, AllergenType[]> = {
  // Gluten
  flour: ["gluten"],
  wheat: ["gluten"],
  barley: ["gluten"],
  rye: ["gluten"],
  oats: ["gluten"], // Unless certified gluten-free
  bread: ["gluten"],
  pasta: ["gluten"],
  noodles: ["gluten"],
  couscous: ["gluten"],
  semolina: ["gluten"],
  bulgur: ["gluten"],
  farro: ["gluten"],
  spelt: ["gluten"],
  seitan: ["gluten"],
  soy_sauce: ["gluten", "soy"],
  worcestershire: ["gluten", "fish"],

  // Dairy
  milk: ["dairy"],
  cream: ["dairy"],
  cheese: ["dairy"],
  butter: ["dairy"],
  yogurt: ["dairy"],
  sour_cream: ["dairy"],
  buttermilk: ["dairy"],
  whey: ["dairy"],
  casein: ["dairy"],
  lactose: ["dairy"],
  ghee: ["dairy"], // Clarified butter still contains dairy proteins
  ricotta: ["dairy"],
  mozzarella: ["dairy"],
  parmesan: ["dairy"],
  cheddar: ["dairy"],

  // Eggs
  egg: ["eggs"],
  eggs: ["eggs"],
  egg_whites: ["eggs"],
  egg_yolks: ["eggs"],
  mayonnaise: ["eggs"],
  aioli: ["eggs"],

  // Tree Nuts
  almond: ["tree nuts"],
  almonds: ["tree nuts"],
  walnut: ["tree nuts"],
  walnuts: ["tree nuts"],
  cashew: ["tree nuts"],
  cashews: ["tree nuts"],
  pistachio: ["tree nuts"],
  pistachios: ["tree nuts"],
  hazelnut: ["tree nuts"],
  hazelnuts: ["tree nuts"],
  macadamia: ["tree nuts"],
  macadamias: ["tree nuts"],
  pecan: ["tree nuts"],
  pecans: ["tree nuts"],
  brazil_nut: ["tree nuts"],
  brazil_nuts: ["tree nuts"],
  pine_nut: ["tree nuts"],
  pine_nuts: ["tree nuts"],
  marzipan: ["tree nuts"],
  praline: ["tree nuts"],

  // Peanuts
  peanut: ["peanuts"],
  peanuts: ["peanuts"],
  peanut_butter: ["peanuts"],
  peanut_oil: ["peanuts"],

  // Shellfish
  shrimp: ["shellfish"],
  prawn: ["shellfish"],
  crab: ["shellfish"],
  lobster: ["shellfish"],
  crayfish: ["shellfish"],
  crawfish: ["shellfish"],
  scallop: ["shellfish"],
  scallops: ["shellfish"],
  mussel: ["shellfish"],
  mussels: ["shellfish"],
  clam: ["shellfish"],
  clams: ["shellfish"],
  oyster: ["shellfish"],
  oysters: ["shellfish"],
  squid: ["shellfish"],
  octopus: ["shellfish"],

  // Soy
  soy: ["soy"],
  soybean: ["soy"],
  soybeans: ["soy"],
  tofu: ["soy"],
  tempeh: ["soy"],
  miso: ["soy"],
  edamame: ["soy"],
  soy_milk: ["soy"],
  tamari: ["soy"], // Gluten-free soy sauce

  // Fish
  salmon: ["fish"],
  tuna: ["fish"],
  cod: ["fish"],
  halibut: ["fish"],
  sardine: ["fish"],
  sardines: ["fish"],
  anchovy: ["fish"],
  anchovies: ["fish"],
  mackerel: ["fish"],
  trout: ["fish"],
  bass: ["fish"],
  snapper: ["fish"],
  tilapia: ["fish"],
  fish_sauce: ["fish"],

  // Sesame
  sesame: ["sesame"],
  sesame_seed: ["sesame"],
  sesame_seeds: ["sesame"],
  sesame_oil: ["sesame"],
  tahini: ["sesame"],
  halva: ["sesame"],
};

/**
 * Normalize ingredient name for matching
 * Removes common descriptors and normalizes to lowercase
 */
function normalizeIngredientName(ingredient: string): string {
  let normalized = ingredient.toLowerCase().trim();

  // Remove common descriptors
  const descriptorsToRemove = [
    /\bfresh\b/gi,
    /\bfrozen\b/gi,
    /\bdried\b/gi,
    /\bchopped\b/gi,
    /\bdiced\b/gi,
    /\bsliced\b/gi,
    /\bminced\b/gi,
    /\bcrushed\b/gi,
    /\bground\b/gi,
    /\bshredded\b/gi,
    /\bgrated\b/gi,
    /\bpeeled\b/gi,
    /\bboneless\b/gi,
    /\bskinless\b/gi,
    /\braw\b/gi,
    /\bcooked\b/gi,
    /\bwhole\b/gi,
    /\bpieces\b/gi,
    /\bchunks\b/gi,
    /\(.*?\)/g, // Remove parenthetical notes
    /,.*$/, // Remove everything after comma
  ];

  for (const pattern of descriptorsToRemove) {
    normalized = normalized.replace(pattern, "");
  }

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Extract base ingredient name from ingredient string
 * Handles patterns like "2 cups flour", "1 lb chicken breast", etc.
 */
function extractBaseIngredient(ingredient: string): string {
  const normalized = normalizeIngredientName(ingredient);

  // Remove quantity and unit patterns from the start
  // Pattern: [number] [unit] [ingredient]
  const withoutQuantity = normalized.replace(
    /^[\d\s\/\.-]+\s+(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|can|cans|package|packages|pkg|bunch|bunches|head|heads|large|medium|small|slice|slices|piece|pieces|clove|cloves)\s+/i,
    ""
  );

  // Split by common separators and take the first meaningful word
  const words = withoutQuantity.split(/[\s,]+/);
  const baseWord = words.find((w) => w.length > 2) || words[0] || "";

  return baseWord.toLowerCase();
}

/**
 * Detect allergens from a list of ingredients
 * Returns a Set of detected allergen types
 */
export function detectAllergens(ingredients: string[]): Set<AllergenType> {
  const detectedAllergens = new Set<AllergenType>();

  for (const ingredient of ingredients) {
    const baseIngredient = extractBaseIngredient(ingredient);
    const normalized = normalizeIngredientName(ingredient);

    // Check direct matches
    for (const [key, allergens] of Object.entries(INGREDIENT_TO_ALLERGEN_MAP)) {
      const keyNormalized = key.replace(/_/g, " ");
      if (
        normalized.includes(keyNormalized) ||
        baseIngredient === keyNormalized ||
        normalized.includes(key)
      ) {
        allergens.forEach((allergen) => detectedAllergens.add(allergen));
      }
    }

    // Check for partial matches (e.g., "almond milk" contains "almond")
    for (const [key, allergens] of Object.entries(INGREDIENT_TO_ALLERGEN_MAP)) {
      const keyNormalized = key.replace(/_/g, " ");
      if (normalized.includes(keyNormalized) || normalized.includes(key)) {
        allergens.forEach((allergen) => detectedAllergens.add(allergen));
      }
    }
  }

  return detectedAllergens;
}

/**
 * Get allergen display name with proper capitalization
 */
export function getAllergenDisplayName(allergen: AllergenType): string {
  return allergen
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get allergen badge color (for UI)
 * Returns className with important modifiers to override Badge defaults
 * For a cleaner approach, consider using variant="warning" on Badge component instead
 */
export function getAllergenBadgeColor(): string {
  // Unified warning style - light red/rose with good contrast
  // Using !important to override Badge component's default variant styles
  // Using solid lighter red colors that work reliably
  // Note: If this doesn't work, use variant="warning" on Badge component instead
  return "!bg-red-100 !text-red-800 !border !border-red-300 !shadow-none dark:!bg-red-900 dark:!text-red-200 dark:!border dark:!border-red-700";
}

/**
 * Merge detected allergens with manual tags
 * Manual tags take precedence (if manually removed, don't show it)
 */
export function mergeAllergens(
  detected: Set<AllergenType>,
  manualTags: string[]
): AllergenType[] {
  const merged = new Set<AllergenType>();

  // Add all detected allergens
  detected.forEach((allergen) => merged.add(allergen));

  // Add all manual tags (user can add allergens not detected)
  manualTags.forEach((tag) => {
    if (ALLERGEN_TYPES.includes(tag as AllergenType)) {
      merged.add(tag as AllergenType);
    }
  });

  return Array.from(merged).sort();
}

/**
 * Check if recipe contains any of the user's allergen alerts
 */
export function hasUserAllergens(
  recipeAllergens: AllergenType[],
  userAllergenAlerts: string[]
): boolean {
  const userAllergenSet = new Set(userAllergenAlerts);
  return recipeAllergens.some((allergen) => userAllergenSet.has(allergen));
}

/**
 * Check if recipe contains any custom dietary restrictions
 * Returns array of matching restrictions found in the recipe
 */
export function hasCustomRestrictions(
  ingredients: string[],
  customRestrictions: string[]
): string[] {
  const matchingRestrictions: string[] = [];
  
  customRestrictions.forEach((restriction) => {
    const restrictionLower = restriction.toLowerCase();
    const found = ingredients.some((ingredient) => 
      ingredient.toLowerCase().includes(restrictionLower)
    );
    if (found) {
      matchingRestrictions.push(restriction);
    }
  });
  
  return matchingRestrictions;
}

```

### cook-mode-presets.ts
```typescript
/**
 * Cook Mode Presets
 * Pre-configured settings profiles for different cooking styles
 */

import type { CookModePreset, CookModeSettings } from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";

/**
 * Smart presets for cook mode customization
 * Each preset optimizes for a different cooking style/scenario
 */
export const COOK_MODE_PRESETS: CookModePreset[] = [
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean view with just instructions. No distractions.",
    icon: "Minus",
    settings: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        fontSize: "medium",
        themeOverride: "system",
        highContrast: false,
      },
      visibility: { showIngredients: false, showTimers: false, showProgress: false },
      behavior: { keepScreenAwake: true, timerSounds: false, autoAdvance: false },
      navigation: { mode: "step-by-step" },
      voice: { ...DEFAULT_COOK_MODE_SETTINGS.voice, enabled: false },
      gestures: { ...DEFAULT_COOK_MODE_SETTINGS.gestures },
      audio: { ...DEFAULT_COOK_MODE_SETTINGS.audio },
      timers: { ...DEFAULT_COOK_MODE_SETTINGS.timers },
    },
  },
  {
    key: "full",
    name: "Full Featured",
    description: "Everything visible. All the bells and whistles.",
    icon: "Sparkles",
    settings: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        fontSize: "medium",
        themeOverride: "system",
        highContrast: false,
      },
      visibility: { showIngredients: true, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: false },
      navigation: { mode: "step-by-step" },
      voice: { ...DEFAULT_COOK_MODE_SETTINGS.voice, enabled: true },
      gestures: { ...DEFAULT_COOK_MODE_SETTINGS.gestures, swipeEnabled: true },
      audio: { ...DEFAULT_COOK_MODE_SETTINGS.audio },
      timers: { ...DEFAULT_COOK_MODE_SETTINGS.timers },
    },
  },
  {
    key: "hands-free",
    name: "Hands-Free",
    description: "Voice-controlled with auto-advance. Perfect for messy hands.",
    icon: "Hand",
    settings: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        fontSize: "large",
        themeOverride: "system",
        highContrast: false,
      },
      visibility: { showIngredients: true, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: true },
      navigation: { mode: "step-by-step" },
      voice: {
        ...DEFAULT_COOK_MODE_SETTINGS.voice,
        enabled: true,
        autoReadSteps: true,
        readoutSpeed: "normal",
      },
      gestures: {
        ...DEFAULT_COOK_MODE_SETTINGS.gestures,
        swipeEnabled: true,
        tapToAdvance: true,
        hapticFeedback: true,
      },
      audio: { ...DEFAULT_COOK_MODE_SETTINGS.audio },
      timers: { ...DEFAULT_COOK_MODE_SETTINGS.timers },
    },
  },
  {
    key: "focus",
    name: "Focus",
    description: "Large text, dark theme. Maximum readability in the kitchen.",
    icon: "Focus",
    settings: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        fontSize: "large",
        themeOverride: "dark",
        highContrast: true,
      },
      visibility: { showIngredients: false, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: false },
      navigation: { mode: "step-by-step" },
      voice: { ...DEFAULT_COOK_MODE_SETTINGS.voice, enabled: false },
      gestures: { ...DEFAULT_COOK_MODE_SETTINGS.gestures, swipeEnabled: true },
      audio: { ...DEFAULT_COOK_MODE_SETTINGS.audio },
      timers: { ...DEFAULT_COOK_MODE_SETTINGS.timers },
    },
  },
];

/**
 * Get a preset by its key
 */
export function getPresetByKey(key: string): CookModePreset | undefined {
  return COOK_MODE_PRESETS.find((preset) => preset.key === key);
}

/**
 * Check if current settings match a preset
 * Returns the matching preset key or null
 */
export function getMatchingPreset(settings: CookModeSettings): string | null {
  for (const preset of COOK_MODE_PRESETS) {
    if (settingsMatch(settings, preset.settings)) {
      return preset.key;
    }
  }
  return null;
}

/**
 * Deep compare two CookModeSettings objects
 */
function settingsMatch(a: CookModeSettings, b: CookModeSettings): boolean {
  return (
    a.display.fontSize === b.display.fontSize &&
    a.display.themeOverride === b.display.themeOverride &&
    a.visibility.showIngredients === b.visibility.showIngredients &&
    a.visibility.showTimers === b.visibility.showTimers &&
    a.visibility.showProgress === b.visibility.showProgress &&
    a.behavior.keepScreenAwake === b.behavior.keepScreenAwake &&
    a.behavior.timerSounds === b.behavior.timerSounds &&
    a.behavior.autoAdvance === b.behavior.autoAdvance &&
    a.navigation.mode === b.navigation.mode
  );
}
```

### default-voice-commands.ts
```typescript
/**
 * Default Voice Command Mappings
 * Users can customize these phrases to match their preferences
 */

import type {
  VoiceCommandMapping,
  VoiceCommandAction,
  CookModeAudioSettings,
  CookModeTimerSettings
} from "@/types/settings";

export const DEFAULT_VOICE_COMMANDS: VoiceCommandMapping = {
  nextStep: ["next", "next step", "continue", "forward", "go", "next one"],
  prevStep: ["back", "previous", "go back", "previous step", "last step", "before"],
  setTimer: ["timer", "set timer", "start timer", "timer for"],
  stopTimer: ["stop timer", "cancel timer", "stop", "clear timer"],
  repeat: ["repeat", "say again", "what", "again", "huh", "pardon", "one more time"],
  readIngredients: ["ingredients", "what do I need", "read ingredients", "list ingredients", "what ingredients"],
  pause: ["pause", "hold", "wait", "hold on", "stop talking"],
  resume: ["resume", "continue", "go ahead", "okay", "keep going", "go on"]
};

/**
 * Check if a transcript matches any phrase in a command's phrase list
 */
export function matchesCommand(
  transcript: string,
  phrases: string[]
): boolean {
  const normalized = transcript.toLowerCase().trim();
  return phrases.some(phrase =>
    normalized.includes(phrase.toLowerCase()) ||
    phrase.toLowerCase().includes(normalized)
  );
}

/**
 * Finds a matching command action from a transcript
 * Uses fuzzy matching to handle natural speech variations
 *
 * @param transcript - The voice transcript to match against
 * @param mappings - Custom command mappings (defaults to DEFAULT_VOICE_COMMANDS)
 * @returns The matched VoiceCommandAction or null if no match
 */
export function findMatchingCommand(
  transcript: string,
  mappings: VoiceCommandMapping = DEFAULT_VOICE_COMMANDS
): VoiceCommandAction | null {
  const normalized = transcript.toLowerCase().trim();

  // Check each command action
  for (const [action, phrases] of Object.entries(mappings) as Array<
    [VoiceCommandAction, string[]]
  >) {
    // Special handling for timer commands - extract minutes
    if (action === "setTimer") {
      // Match patterns like "timer 5 minutes" or "set timer 10"
      const timerMatch = normalized.match(
        /(?:timer|set timer|start timer)\s+(\d+)\s*(?:minute|minutes|min|mins)?/i
      );
      if (timerMatch) {
        return "setTimer";
      }
      continue; // Skip exact phrase matching for timer
    }

    // Check if any phrase matches
    if (matchesCommand(normalized, phrases)) {
      return action;
    }
  }

  return null;
}

/**
 * Extracts minutes from a timer command
 *
 * @param transcript - The voice transcript containing timer command
 * @returns The number of minutes, or null if not found
 */
export function extractTimerMinutes(transcript: string): number | null {
  const normalized = transcript.toLowerCase().trim();

  const timerMatch = normalized.match(
    /(?:timer|set timer|start timer)\s+(\d+)\s*(?:minute|minutes|min|mins)?/i
  );

  if (timerMatch) {
    const minutes = parseInt(timerMatch[1], 10);
    if (!isNaN(minutes) && minutes > 0) {
      return minutes;
    }
  }

  return null;
}

/**
 * Default wake words - users can add their own
 */
export const DEFAULT_WAKE_WORDS = ["hey chef", "okay chef", "yo chef"];

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS: CookModeAudioSettings = {
  ttsVoice: "",           // Empty = use system default
  ttsPitch: 1.0,
  ttsRate: 1.0,
  ttsVolume: 1.0,
  acknowledgmentSound: "beep",
  timerSound: "classic",
};

/**
 * Default timer settings
 */
export const DEFAULT_TIMER_SETTINGS: CookModeTimerSettings = {
  quickTimerPresets: [1, 3, 5, 10, 15, 20, 30],
  autoDetectTimers: true,
  showTimerInTitle: true,
  vibrationOnComplete: true,
  repeatTimerAlert: false,
};
```

### google-calendar.ts
```typescript
/**
 * Google Calendar API service for Next.js
 */

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_API = "https://www.googleapis.com/oauth2/v2/userinfo";

export interface CalendarEvent {
  cook: string;
  recipe: string;
  recipeData?: {
    prepTime?: string;
    cookTime?: string;
    servings?: string | number;
    ingredients: string[];
    instructions: string[];
    sourceUrl?: string;
  };
  startDateTime: string;
  endDateTime: string;
}

/**
 * Generate Google OAuth URL
 */
export function getGoogleOAuthURL(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error_description || "Failed to exchange code for tokens"
    );
  }

  return await response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  return await response.json();
}

/**
 * Get user info (email) from Google
 */
export async function getUserInfo(
  accessToken: string
): Promise<{ email: string; verified_email: boolean }> {
  const response = await fetch(GOOGLE_USERINFO_API, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch user info");
  }

  return await response.json();
}

/**
 * Create calendar event
 */
export async function createCalendarEvent({
  accessToken,
  summary,
  description,
  startDateTime,
  endDateTime,
  attendeeEmails,
  timeZone,
}: {
  accessToken: string;
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmails?: string[];
  timeZone?: string;
}): Promise<Record<string, unknown>> {
  // Use provided timezone or fall back to server timezone
  const eventTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const event: Record<string, unknown> = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: eventTimeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: eventTimeZone,
    },
  };

  if (attendeeEmails && attendeeEmails.length > 0) {
    event.attendees = attendeeEmails.map((email) => ({ email }));
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create calendar event");
  }

  return await response.json();
}

/**
 * Create multiple calendar events (for meal plan)
 */
export async function createMealPlanEvents({
  accessToken,
  events,
  attendeeEmails,
  timeZone,
}: {
  accessToken: string;
  events: CalendarEvent[];
  attendeeEmails?: string[];
  timeZone?: string;
}): Promise<{
  successful: number;
  failed: number;
  total: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    events.map((event) =>
      createCalendarEvent({
        accessToken,
        summary: `${event.cook}: ${event.recipe}`,
        description: formatRecipeDescription(event.recipeData),
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        attendeeEmails,
        timeZone,
      })
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  return {
    successful: successful.length,
    failed: failed.length,
    total: events.length,
    errors: failed.map((f: { reason?: { message?: string } }) => f.reason?.message || "Unknown error"),
  };
}

/**
 * Format recipe data as description for calendar event
 */
function formatRecipeDescription(recipe: CalendarEvent["recipeData"]): string {
  if (!recipe) return "Cooking time.";

  let desc = `Prep Time: ${recipe.prepTime || "N/A"} | Cook Time: ${recipe.cookTime || "N/A"} | Servings: ${recipe.servings || "N/A"}\n\n`;

  desc += "INGREDIENTS:\n";
  recipe.ingredients.forEach((ing) => {
    desc += `- ${ing}\n`;
  });

  desc += "\nINSTRUCTIONS:\n";
  recipe.instructions.forEach((inst, index) => {
    desc += `${index + 1}. ${inst}\n`;
  });

  if (recipe.sourceUrl) {
    desc += `\nSource: ${recipe.sourceUrl}`;
  }

  return desc;
}
```

### haptics.ts
```typescript
/**
 * Haptic feedback utility for mobile devices
 * Uses the Web Vibration API when available
 */

type HapticType = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  error: [50, 30, 50],
  selection: 5,
};

/**
 * Trigger haptic feedback on supported devices
 * @param type - The type of haptic feedback to trigger
 * @returns boolean indicating if haptic was triggered
 */
export function triggerHaptic(type: HapticType = "light"): boolean {
  if (typeof window === "undefined") return false;

  // Check if vibration API is available
  if (!("vibrate" in navigator)) return false;

  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if haptic feedback is supported on this device
 */
export function isHapticSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "vibrate" in navigator;
}

/**
 * Hook-friendly wrapper for haptic feedback
 * Returns a stable function that can be called to trigger haptics
 */
export function createHapticHandler(type: HapticType = "light") {
  return () => triggerHaptic(type);
}
```

### hints.ts
```typescript
// Contextual hint system constants and types

export const HINT_IDS = {
  MEAL_PLANNER_INTRO: "meal-planner-intro",
  RECIPES_INTRO: "recipes-intro",
  SHOPPING_LIST_INTRO: "shopping-list-intro",
  PANTRY_INTRO: "pantry-intro",
  COOK_MODE_WIZARD: "cook-mode-wizard",
} as const;

export type HintId = (typeof HINT_IDS)[keyof typeof HINT_IDS];

export interface HintContent {
  title: string;
  description: string;
}

export const HINT_CONTENT: Record<HintId, HintContent> = {
  [HINT_IDS.MEAL_PLANNER_INTRO]: {
    title: "Plan Your Week",
    description:
      "Click 'Add Meal' to select recipes for each day. Assign cooks to balance responsibilities.",
  },
  [HINT_IDS.RECIPES_INTRO]: {
    title: "Find Recipes Fast",
    description:
      "Use filters to search by tag, ingredient, or cook time. Star favorites for quick access.",
  },
  [HINT_IDS.SHOPPING_LIST_INTRO]: {
    title: "Smart Shopping",
    description:
      "Your list auto-generates from planned meals. Pantry items are excluded automatically.",
  },
  [HINT_IDS.PANTRY_INTRO]: {
    title: "Scan Your Pantry",
    description:
      "Use AI to scan photos of your fridge or pantry. Items update your inventory automatically.",
  },
  [HINT_IDS.COOK_MODE_WIZARD]: {
    title: "Set Up Cook Mode",
    description:
      "Customize your cooking experience with font sizes, themes, and helpful features.",
  },
};

// Helper to check if a hint is dismissed (server-side check)
export function isHintDismissed(
  hintId: HintId,
  dismissedHints: string[] | undefined
): boolean {
  return dismissedHints?.includes(hintId) ?? false;
}

// localStorage-based hint persistence (client-side)
const STORAGE_KEY = "dismissed_hints";

function getDismissedHintsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function dismissHintLocally(hintId: HintId): void {
  if (typeof window === "undefined") return;
  const dismissed = getDismissedHintsFromStorage();
  if (!dismissed.includes(hintId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, hintId]));
  }
}

export function isHintDismissedLocally(hintId: HintId): boolean {
  if (typeof window === "undefined") return false;
  return getDismissedHintsFromStorage().includes(hintId);
}
```

### ingredient-matcher.ts
```typescript
/**
 * Ingredient Matcher Utility
 * Matches ingredients mentioned in recipe step text to highlight relevant ingredients
 */

/**
 * Common cooking verbs that often precede ingredients
 */
const COOKING_VERBS = [
  "add",
  "mix",
  "stir",
  "pour",
  "combine",
  "fold",
  "whisk",
  "blend",
  "toss",
  "sprinkle",
  "drizzle",
  "season",
  "coat",
  "dip",
  "marinate",
  "rub",
  "brush",
  "spread",
  "top",
  "garnish",
];

/**
 * Words to ignore when matching (common filler words)
 */
const IGNORE_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "to",
  "with",
  "for",
  "of",
  "some",
  "more",
  "remaining",
  "rest",
  "half",
  "other",
  "additional",
  "extra",
]);

/**
 * Parse an ingredient string to extract the main ingredient name
 * e.g., "2 cups all-purpose flour" → "flour"
 * e.g., "1 lb chicken breast, cubed" → "chicken breast"
 */
export function extractIngredientName(ingredientString: string): string {
  // Remove quantity (numbers, fractions, ranges)
  let cleaned = ingredientString
    .toLowerCase()
    // Remove fractions like "1/2", "3/4"
    .replace(/\d+\/\d+/g, "")
    // Remove numbers and decimals
    .replace(/\d+\.?\d*/g, "")
    // Remove common units
    .replace(
      /\b(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pinch|dash|bunch|cloves?|cans?|packages?|sticks?|slices?|pieces?)\b/gi,
      ""
    )
    // Remove preparation instructions in parentheses
    .replace(/\([^)]*\)/g, "")
    // Remove preparation instructions after comma
    .replace(/,.*$/, "")
    // Remove common descriptors
    .replace(
      /\b(fresh|dried|ground|minced|chopped|diced|sliced|crushed|whole|large|medium|small|thin|thick|boneless|skinless|raw|cooked|melted|softened|room temperature|cold|warm|hot|optional)\b/gi,
      ""
    )
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Tokenize text into words for matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // Keep hyphens for compound words
    .split(/\s+/)
    .filter((word) => word.length > 1 && !IGNORE_WORDS.has(word));
}

/**
 * Calculate similarity between two strings using word overlap
 */
function calculateSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  // Convert Sets to arrays for iteration (compatible with older TS targets)
  const tokens1Array = Array.from(tokens1);
  const tokens2Array = Array.from(tokens2);

  let matches = 0;
  for (const token of tokens1Array) {
    if (tokens2.has(token)) {
      matches++;
    }
    // Also check for partial matches (e.g., "garlic" matches "garlicky")
    for (const token2 of tokens2Array) {
      if (token !== token2 && (token.includes(token2) || token2.includes(token))) {
        matches += 0.5;
      }
    }
  }

  return matches / Math.max(tokens1.size, tokens2.size);
}

/**
 * Check if a step mentions an ingredient
 */
function stepMentionsIngredient(stepText: string, ingredientName: string): boolean {
  const stepLower = stepText.toLowerCase();
  const ingredientLower = ingredientName.toLowerCase();

  // Direct substring match
  if (stepLower.includes(ingredientLower)) {
    return true;
  }

  // Check individual words from ingredient name
  const ingredientWords = tokenize(ingredientName);
  const stepWords = tokenize(stepText);

  // If any significant ingredient word appears in the step
  for (const word of ingredientWords) {
    if (word.length > 3 && stepWords.includes(word)) {
      return true;
    }
  }

  // Check similarity score
  const similarity = calculateSimilarity(stepText, ingredientName);
  return similarity > 0.3;
}

export interface IngredientMatch {
  index: number;
  ingredient: string;
  relevance: "high" | "medium" | "low";
}

/**
 * Find ingredients that are relevant to a specific recipe step
 *
 * @param stepText - The text of the current recipe step
 * @param ingredients - Array of ingredient strings
 * @returns Array of ingredient indices and their relevance level
 */
export function matchIngredientsToStep(
  stepText: string,
  ingredients: string[]
): IngredientMatch[] {
  const matches: IngredientMatch[] = [];
  const stepLower = stepText.toLowerCase();

  ingredients.forEach((ingredient, index) => {
    const ingredientName = extractIngredientName(ingredient);

    if (!ingredientName) return;

    // Check for direct mention (high relevance)
    if (stepLower.includes(ingredientName)) {
      matches.push({ index, ingredient, relevance: "high" });
      return;
    }

    // Check if step mentions the ingredient using broader matching
    if (stepMentionsIngredient(stepText, ingredientName)) {
      matches.push({ index, ingredient, relevance: "medium" });
      return;
    }

    // Check for partial word matches (e.g., "onion" in "onions")
    const ingredientWords = tokenize(ingredientName);
    for (const word of ingredientWords) {
      if (word.length > 3 && stepLower.includes(word)) {
        matches.push({ index, ingredient, relevance: "low" });
        return;
      }
    }
  });

  // Sort by relevance (high first)
  const relevanceOrder = { high: 0, medium: 1, low: 2 };
  matches.sort((a, b) => relevanceOrder[a.relevance] - relevanceOrder[b.relevance]);

  return matches;
}

/**
 * Get ingredient indices that should be highlighted for a step
 *
 * @param stepText - The text of the current recipe step
 * @param ingredients - Array of ingredient strings
 * @returns Set of ingredient indices to highlight
 */
export function getHighlightedIngredientIndices(
  stepText: string,
  ingredients: string[]
): Set<number> {
  const matches = matchIngredientsToStep(stepText, ingredients);
  return new Set(matches.map((m) => m.index));
}

/**
 * Check if an ingredient is needed for the current step
 */
export function isIngredientNeededForStep(
  stepText: string,
  ingredient: string
): boolean {
  const ingredientName = extractIngredientName(ingredient);
  return stepMentionsIngredient(stepText, ingredientName);
}
```

### ingredient-scaler.ts
```typescript
/**
 * Utility functions for parsing and scaling recipe ingredients
 */

import type { IngredientCategory } from "@/types/shopping-list";

export interface ParsedIngredient {
  quantity: number | null;
  unit: string;
  ingredient: string;
  original: string;
}

// Unit conversion tables
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  "fl oz": 29.574,
  "fluid oz": 29.574,
  cup: 236.588,
  cups: 236.588,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  gallon: 3785.41,
  gallons: 3785.41,
};

const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

// Common unit aliases for normalization
const UNIT_ALIASES: Record<string, string> = {
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  "t.": "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  "T.": "tbsp",
  "tbs.": "tbsp",
  cup: "cup",
  cups: "cup",
  c: "cup",
  "c.": "cup",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
  package: "package",
  packages: "package",
  pkg: "package",
  bunch: "bunch",
  bunches: "bunch",
  head: "head",
  heads: "head",
  large: "large",
  medium: "medium",
  small: "small",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
};

// Common fractions and their decimal equivalents
const FRACTIONS: Record<string, number> = {
  "1/8": 0.125,
  "1/4": 0.25,
  "1/3": 0.333,
  "1/2": 0.5,
  "2/3": 0.667,
  "3/4": 0.75,
};

// Regex patterns for parsing quantities
const FRACTION_PATTERN = /(\d+\/\d+)/;
const MIXED_NUMBER_PATTERN = /(\d+)\s+(\d+\/\d+)/;
const DECIMAL_PATTERN = /(\d+\.?\d*)/;
const RANGE_PATTERN = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;

/**
 * Parse a fraction string to decimal
 */
function parseFraction(fraction: string): number {
  if (FRACTIONS[fraction]) {
    return FRACTIONS[fraction];
  }
  const parts = fraction.split("/");
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return numerator / denominator;
  }
  return 0;
}

/**
 * Parse quantity from ingredient string
 * Handles: "2", "1/2", "1 1/2", "2.5", "2-3"
 */
function parseQuantity(text: string): number | null {
  // Mixed number (e.g., "1 1/2")
  const mixedMatch = text.match(MIXED_NUMBER_PATTERN);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const fraction = parseFraction(mixedMatch[2]);
    return whole + fraction;
  }

  // Fraction only (e.g., "1/2")
  const fractionMatch = text.match(FRACTION_PATTERN);
  if (fractionMatch) {
    return parseFraction(fractionMatch[1]);
  }

  // Range (e.g., "2-3") - use midpoint
  const rangeMatch = text.match(RANGE_PATTERN);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return (low + high) / 2;
  }

  // Decimal or whole number
  const decimalMatch = text.match(DECIMAL_PATTERN);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }

  return null;
}

/**
 * Format a decimal number as a fraction when appropriate
 */
function formatQuantity(value: number): string {
  // Check if it's close to a common fraction
  for (const [fraction, decimal] of Object.entries(FRACTIONS)) {
    if (Math.abs(value - decimal) < 0.01) {
      return fraction;
    }
  }

  // Check if it's a whole number
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return Math.round(value).toString();
  }

  // Check if it's a mixed number
  const whole = Math.floor(value);
  const remainder = value - whole;
  for (const [fraction, decimal] of Object.entries(FRACTIONS)) {
    if (Math.abs(remainder - decimal) < 0.01) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }

  // Round to 2 decimal places
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Parse an ingredient string into its components
 */
export function parseIngredient(ingredient: string): ParsedIngredient {
  const trimmed = ingredient.trim();
  
  // Try to extract quantity and unit from the beginning
  // Pattern: [quantity] [unit] [ingredient]
  const quantityMatch = trimmed.match(/^([\d\s\/\.-]+)\s+/);
  
  if (!quantityMatch) {
    // No quantity found (e.g., "Salt to taste")
    return {
      quantity: null,
      unit: "",
      ingredient: trimmed,
      original: ingredient,
    };
  }

  const quantityStr = quantityMatch[1].trim();
  const quantity = parseQuantity(quantityStr);
  const afterQuantity = trimmed.slice(quantityMatch[0].length).trim();

  // Try to extract unit (next word after quantity)
  const unitMatch = afterQuantity.match(/^([a-zA-Z]+\.?)\s+/);
  
  if (unitMatch) {
    const unit = unitMatch[1];
    const ingredientName = afterQuantity.slice(unitMatch[0].length).trim();
    return {
      quantity,
      unit,
      ingredient: ingredientName,
      original: ingredient,
    };
  }

  // No unit found
  return {
    quantity,
    unit: "",
    ingredient: afterQuantity,
    original: ingredient,
  };
}

/**
 * Scale an ingredient by a given ratio
 */
export function scaleIngredient(ingredient: string, ratio: number): string {
  const parsed = parseIngredient(ingredient);

  // If no quantity, return original
  if (parsed.quantity === null) {
    return ingredient;
  }

  const scaledQuantity = parsed.quantity * ratio;
  const formattedQuantity = formatQuantity(scaledQuantity);

  // Reconstruct the ingredient string
  if (parsed.unit) {
    return `${formattedQuantity} ${parsed.unit} ${parsed.ingredient}`;
  } else {
    return `${formattedQuantity} ${parsed.ingredient}`;
  }
}

/**
 * Scale all ingredients in a list
 */
export function scaleIngredients(
  ingredients: string[],
  originalServings: number,
  newServings: number
): string[] {
  const ratio = newServings / originalServings;
  return ingredients.map((ing) => scaleIngredient(ing, ratio));
}

/**
 * Normalize a unit to its canonical form
 */
export function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim().replace(/\.$/, "");
  return UNIT_ALIASES[lower] || lower;
}

/**
 * Check if two units are in the same measurement system and can be converted
 */
export function areUnitsConvertible(unit1: string, unit2: string): boolean {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);
  
  // Same unit after normalization
  if (norm1 === norm2) return true;
  
  // Both are volume units
  if (VOLUME_TO_ML[norm1] && VOLUME_TO_ML[norm2]) return true;
  
  // Both are weight units
  if (WEIGHT_TO_GRAMS[norm1] && WEIGHT_TO_GRAMS[norm2]) return true;
  
  return false;
}

/**
 * Convert a quantity from one unit to another
 * Returns null if conversion is not possible
 */
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  
  // Same unit
  if (from === to) return quantity;
  
  // Volume conversion
  if (VOLUME_TO_ML[from] && VOLUME_TO_ML[to]) {
    const ml = quantity * VOLUME_TO_ML[from];
    return ml / VOLUME_TO_ML[to];
  }
  
  // Weight conversion
  if (WEIGHT_TO_GRAMS[from] && WEIGHT_TO_GRAMS[to]) {
    const grams = quantity * WEIGHT_TO_GRAMS[from];
    return grams / WEIGHT_TO_GRAMS[to];
  }
  
  return null;
}

/**
 * Normalize an ingredient name for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove common descriptors
 * - Singularize basic plurals
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove common descriptors that don't affect the core ingredient
  const descriptorsToRemove = [
    /\bfresh\b/gi,
    /\bfrozen\b/gi,
    /\bdried\b/gi,
    /\bchopped\b/gi,
    /\bdiced\b/gi,
    /\bsliced\b/gi,
    /\bminced\b/gi,
    /\bcrushed\b/gi,
    /\bground\b/gi,
    /\bshredded\b/gi,
    /\bgrated\b/gi,
    /\bpeeled\b/gi,
    /\bboneless\b/gi,
    /\bskinless\b/gi,
    /\braw\b/gi,
    /\bcooked\b/gi,
    /\buncooked\b/gi,
    /\borganic\b/gi,
    /\b(finely|roughly|coarsely)\b/gi,
    /,.*$/, // Remove everything after comma (e.g., "chicken breast, boneless")
    /\(.*?\)/g, // Remove parenthetical notes
  ];
  
  for (const pattern of descriptorsToRemove) {
    normalized = normalized.replace(pattern, "");
  }
  
  // Basic singularization (handles common cases)
  const pluralRules: Array<[RegExp, string]> = [
    [/ies$/, "y"],      // berries -> berry
    [/ves$/, "f"],      // leaves -> leaf
    [/oes$/, "o"],      // tomatoes -> tomato
    [/ses$/, "s"],      // molasses -> molasses (no change needed)
    [/([^s])s$/, "$1"], // apples -> apple
  ];
  
  for (const [pattern, replacement] of pluralRules) {
    if (pattern.test(normalized)) {
      normalized = normalized.replace(pattern, replacement);
      break;
    }
  }
  
  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();
  
  return normalized;
}

/**
 * Get the preferred display unit for a quantity
 * Converts to more readable units (e.g., 48 tsp -> 1 cup)
 */
export function getPreferredUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  const norm = normalizeUnit(unit);
  
  // Volume: convert to cups if >= 1 cup, otherwise tablespoons if >= 1 tbsp
  if (VOLUME_TO_ML[norm]) {
    const ml = quantity * VOLUME_TO_ML[norm];
    
    if (ml >= 236.588) {
      // >= 1 cup
      return { quantity: ml / 236.588, unit: "cup" };
    } else if (ml >= 14.787) {
      // >= 1 tbsp
      return { quantity: ml / 14.787, unit: "tbsp" };
    } else {
      return { quantity: ml / 4.929, unit: "tsp" };
    }
  }
  
  // Weight: convert to lbs if >= 1 lb, otherwise oz if >= 1 oz
  if (WEIGHT_TO_GRAMS[norm]) {
    const grams = quantity * WEIGHT_TO_GRAMS[norm];
    
    if (grams >= 453.592) {
      // >= 1 lb
      return { quantity: grams / 453.592, unit: "lb" };
    } else if (grams >= 28.3495) {
      // >= 1 oz
      return { quantity: grams / 28.3495, unit: "oz" };
    } else {
      return { quantity: grams, unit: "g" };
    }
  }
  
  return { quantity, unit: norm };
}

export interface MergeableItem {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

export interface MergedItem {
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  sources: Array<{ recipe_id?: string | null; recipe_title?: string | null }>;
}

/**
 * Merge a list of shopping items, combining duplicates
 */
export function mergeShoppingItems(items: MergeableItem[]): MergedItem[] {
  const merged = new Map<string, MergedItem>();
  
  for (const item of items) {
    const normalizedName = normalizeIngredientName(item.ingredient);
    const existing = merged.get(normalizedName);
    
    if (!existing) {
      // First occurrence
      merged.set(normalizedName, {
        ingredient: item.ingredient, // Keep original casing from first occurrence
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category: item.category || null,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
      });
    } else {
      // Merge with existing
      const newQuantity = parseQuantity(item.quantity || "");
      const existingQuantity = parseQuantity(existing.quantity || "");
      
      // Add source
      if (item.recipe_id || item.recipe_title) {
        const alreadyHasSource = existing.sources.some(
          (s) => s.recipe_id === item.recipe_id && s.recipe_title === item.recipe_title
        );
        if (!alreadyHasSource) {
          existing.sources.push({
            recipe_id: item.recipe_id,
            recipe_title: item.recipe_title,
          });
        }
      }
      
      // Try to merge quantities
      if (newQuantity !== null && existingQuantity !== null) {
        const newUnit = item.unit ? normalizeUnit(item.unit) : null;
        const existingUnit = existing.unit;
        
        if (newUnit === existingUnit || (!newUnit && !existingUnit)) {
          // Same unit, just add
          const total = existingQuantity + newQuantity;
          const preferred = existingUnit 
            ? getPreferredUnit(total, existingUnit)
            : { quantity: total, unit: null };
          existing.quantity = formatQuantity(preferred.quantity);
          existing.unit = preferred.unit;
        } else if (newUnit && existingUnit && areUnitsConvertible(newUnit, existingUnit)) {
          // Convertible units - convert to existing unit then add
          const converted = convertUnit(newQuantity, newUnit, existingUnit);
          if (converted !== null) {
            const total = existingQuantity + converted;
            const preferred = getPreferredUnit(total, existingUnit);
            existing.quantity = formatQuantity(preferred.quantity);
            existing.unit = preferred.unit;
          }
        }
        // If not convertible, we keep the existing quantity (conservative approach)
      } else if (newQuantity !== null && existingQuantity === null) {
        // Existing had no quantity, use new one
        existing.quantity = item.quantity || null;
        existing.unit = item.unit ? normalizeUnit(item.unit) : null;
      }
      // If new has no quantity but existing does, keep existing (do nothing)
    }
  }
  
  return Array.from(merged.values());
}

// ============================================================================
// Unit System Conversion (Metric <-> Imperial)
// ============================================================================

export type UnitSystem = "imperial" | "metric";

/**
 * Round metric values to kitchen-friendly numbers
 * Makes measurements practical for actual cooking (e.g., 29.57ml → 30ml)
 */
function roundMetricValue(value: number, unit: string): number {
  const normalizedUnit = normalizeUnit(unit);

  // For milliliters
  if (normalizedUnit === "ml") {
    if (value < 5) {
      // Very small amounts: round up to 5ml minimum
      return 5;
    } else if (value <= 15) {
      // Small amounts: round to nearest 5
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      // Medium amounts: round to nearest 5
      return Math.round(value / 5) * 5;
    } else if (value <= 500) {
      // Larger amounts: round to nearest 25
      return Math.round(value / 25) * 25;
    } else {
      // Very large amounts: round to nearest 50
      return Math.round(value / 50) * 50;
    }
  }

  // For liters
  if (normalizedUnit === "l") {
    // Round to nearest 0.25L (250ml increments)
    return Math.round(value * 4) / 4;
  }

  // For grams
  if (normalizedUnit === "g") {
    if (value < 5) {
      // Very small amounts: round up to 5g minimum
      return 5;
    } else if (value <= 25) {
      // Small amounts: round to nearest 5
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      // Medium amounts: round to nearest 10
      return Math.round(value / 10) * 10;
    } else if (value <= 500) {
      // Larger amounts: round to nearest 25
      return Math.round(value / 25) * 25;
    } else {
      // Very large amounts: round to nearest 50
      return Math.round(value / 50) * 50;
    }
  }

  // For kilograms
  if (normalizedUnit === "kg") {
    // Round to nearest 0.1kg (100g increments)
    return Math.round(value * 10) / 10;
  }

  return value;
}

// Define which units belong to which system
const IMPERIAL_VOLUME_UNITS = ["tsp", "tbsp", "cup", "fl oz", "pint", "quart", "gallon"];
const METRIC_VOLUME_UNITS = ["ml", "l"];
const IMPERIAL_WEIGHT_UNITS = ["oz", "lb"];
const METRIC_WEIGHT_UNITS = ["g", "kg"];

/**
 * Check if a unit belongs to a specific system
 */
function isUnitInSystem(unit: string, system: UnitSystem): boolean {
  const normalized = normalizeUnit(unit);

  if (system === "imperial") {
    return IMPERIAL_VOLUME_UNITS.includes(normalized) || IMPERIAL_WEIGHT_UNITS.includes(normalized);
  } else {
    return METRIC_VOLUME_UNITS.includes(normalized) || METRIC_WEIGHT_UNITS.includes(normalized);
  }
}

/**
 * Get the target unit for conversion based on system preference
 * Returns null if unit is already in the target system or can't be converted
 */
export function getTargetUnit(unit: string, targetSystem: UnitSystem): string | null {
  const normalized = normalizeUnit(unit);

  // Check if already in target system
  if (isUnitInSystem(normalized, targetSystem)) {
    return null;
  }

  // Volume units
  if (VOLUME_TO_ML[normalized]) {
    // Converting to metric: use ml as base target
    if (targetSystem === "metric") {
      return "ml";
    } else {
      // Converting to imperial: use cup as base target
      return "cup";
    }
  }

  // Weight units
  if (WEIGHT_TO_GRAMS[normalized]) {
    // Converting to metric: use g as base target
    if (targetSystem === "metric") {
      return "g";
    } else {
      // Converting to imperial: use oz as base target
      return "oz";
    }
  }

  // Unit is not convertible (count units like "clove", "can")
  return null;
}

/**
 * Get preferred display unit within a system based on quantity
 * For metric: uses ml/l for volume, g/kg for weight based on magnitude
 *             and rounds to kitchen-friendly numbers
 * For imperial: uses existing getPreferredUnit logic
 */
function getPreferredUnitForSystem(
  quantity: number,
  unit: string,
  system: UnitSystem
): { quantity: number; unit: string } {
  const normalized = normalizeUnit(unit);

  if (system === "metric") {
    // Volume: use ml for small amounts, l for large
    if (VOLUME_TO_ML[normalized]) {
      const ml = quantity * VOLUME_TO_ML[normalized];
      if (ml >= 1000) {
        const liters = ml / 1000;
        return { quantity: roundMetricValue(liters, "l"), unit: "l" };
      }
      return { quantity: roundMetricValue(ml, "ml"), unit: "ml" };
    }

    // Weight: use g for small amounts, kg for large
    if (WEIGHT_TO_GRAMS[normalized]) {
      const g = quantity * WEIGHT_TO_GRAMS[normalized];
      if (g >= 1000) {
        const kg = g / 1000;
        return { quantity: roundMetricValue(kg, "kg"), unit: "kg" };
      }
      return { quantity: roundMetricValue(g, "g"), unit: "g" };
    }
  } else {
    // Imperial: use existing getPreferredUnit logic
    return getPreferredUnit(quantity, unit);
  }

  return { quantity, unit: normalized };
}

/**
 * Convert an ingredient string to the preferred unit system
 * Returns the original string if conversion is not possible
 */
export function convertIngredientToSystem(
  ingredient: string,
  targetSystem: UnitSystem
): string {
  const parsed = parseIngredient(ingredient);

  // No quantity found (e.g., "Salt to taste") - return original
  if (parsed.quantity === null) {
    return ingredient;
  }

  // No unit found (e.g., "3 eggs") - return original
  if (!parsed.unit) {
    return ingredient;
  }

  // Determine target unit for conversion
  const targetUnit = getTargetUnit(parsed.unit, targetSystem);

  // Already in correct system or unconvertible - return original
  if (!targetUnit) {
    return ingredient;
  }

  // Perform the conversion
  const convertedQty = convertUnit(parsed.quantity, parsed.unit, targetUnit);

  // Conversion failed - return original
  if (convertedQty === null) {
    return ingredient;
  }

  // Get the preferred display unit (e.g., 1000ml → 1l, or 48tsp → 1cup)
  const preferred = getPreferredUnitForSystem(convertedQty, targetUnit, targetSystem);

  // Format the quantity (handles fractions for imperial)
  const formattedQty = formatQuantity(preferred.quantity);

  // Reconstruct the ingredient string
  return `${formattedQty} ${preferred.unit} ${parsed.ingredient}`;
}

/**
 * Convert all ingredients in a list to the preferred unit system
 */
export function convertIngredientsToSystem(
  ingredients: string[],
  targetSystem: UnitSystem
): string[] {
  return ingredients.map((ing) => convertIngredientToSystem(ing, targetSystem));
}

// ============================================================================
// Enhanced Ingredient Intelligence
// ============================================================================


/**
 * Expanded descriptor lists for ingredient normalization
 */
const PREPARATION_DESCRIPTORS = [
  "chopped", "diced", "sliced", "minced", "crushed", "ground",
  "shredded", "grated", "peeled", "julienned", "cubed", "quartered",
  "halved", "torn", "crumbled", "mashed", "pureed", "zested",
  "trimmed", "deveined", "pitted", "seeded", "cored", "deboned",
  "butterflied", "thinly", "thickly", "roughly", "finely", "coarsely",
];

const STATE_DESCRIPTORS = [
  "fresh", "frozen", "dried", "canned", "raw", "cooked",
  "softened", "melted", "room temperature", "cold", "warm", "hot",
  "chilled", "thawed", "refrigerated", "ripe", "unripe", "rinsed",
  "drained", "packed", "loosely packed", "firmly packed",
];

const QUALITY_DESCRIPTORS = [
  "organic", "free-range", "grass-fed", "low-sodium", "reduced-fat",
  "extra-virgin", "virgin", "light", "dark", "unsalted", "salted",
  "sweetened", "unsweetened", "plain", "vanilla", "whole", "skim",
  "fat-free", "low-fat", "nonfat", "2%", "1%", "boneless", "skinless",
  "bone-in", "skin-on", "lean", "extra-lean", "kosher", "gluten-free",
];

/**
 * Category keyword map for intelligent categorization
 */
const CATEGORY_KEYWORDS: Record<IngredientCategory | string, string[]> = {
  "Produce": [
    // Vegetables
    "lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "celery",
    "potato", "spinach", "kale", "broccoli", "cauliflower", "zucchini",
    "squash", "mushroom", "cucumber", "cabbage", "asparagus", "artichoke",
    "eggplant", "beet", "radish", "turnip", "parsnip", "leek", "shallot",
    "scallion", "green onion", "chive", "corn", "pea", "bean sprout",
    "bok choy", "brussels sprout", "fennel", "arugula", "watercress",
    "endive", "radicchio", "swiss chard", "collard", "mustard green",
    // Fruits
    "apple", "banana", "orange", "lemon", "lime", "grapefruit", "avocado",
    "grape", "strawberry", "blueberry", "raspberry", "blackberry", "cherry",
    "peach", "plum", "nectarine", "apricot", "mango", "pineapple", "papaya",
    "kiwi", "melon", "watermelon", "cantaloupe", "honeydew", "pomegranate",
    "fig", "date", "pear", "coconut", "passion fruit", "dragon fruit",
    // Herbs
    "basil", "cilantro", "parsley", "mint", "thyme", "rosemary", "oregano",
    "dill", "sage", "tarragon", "chervil", "marjoram", "bay leaf", "lemongrass",
  ],
  "Meat & Seafood": [
    // Meat
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "veal", "venison",
    "bison", "rabbit", "goat", "bacon", "sausage", "ham", "prosciutto",
    "pancetta", "chorizo", "salami", "pepperoni", "hot dog", "bratwurst",
    "steak", "ground beef", "ground turkey", "ground pork", "ground chicken",
    "roast", "chop", "rib", "tenderloin", "sirloin", "filet", "brisket",
    "flank", "skirt", "breast", "thigh", "drumstick", "wing", "liver",
    // Seafood
    "salmon", "tuna", "cod", "tilapia", "halibut", "trout", "bass",
    "snapper", "mahi", "swordfish", "mackerel", "sardine", "anchovy",
    "shrimp", "prawn", "crab", "lobster", "scallop", "mussel", "clam",
    "oyster", "squid", "calamari", "octopus", "fish", "seafood",
  ],
  "Dairy & Eggs": [
    "milk", "cream", "half-and-half", "buttermilk", "evaporated milk",
    "condensed milk", "heavy cream", "whipping cream", "sour cream",
    "creme fraiche", "yogurt", "greek yogurt", "kefir",
    "butter", "margarine", "ghee",
    "cheese", "cheddar", "mozzarella", "parmesan", "feta", "gouda",
    "swiss", "provolone", "brie", "camembert", "blue cheese", "gorgonzola",
    "ricotta", "cottage cheese", "cream cheese", "mascarpone", "goat cheese",
    "gruyere", "manchego", "pecorino", "asiago", "havarti", "monterey jack",
    "colby", "american cheese", "velveeta", "queso",
    "egg", "eggs", "egg white", "egg yolk",
  ],
  "Pantry": [
    // Grains & Starches
    "flour", "bread flour", "cake flour", "whole wheat flour", "almond flour",
    "rice", "white rice", "brown rice", "jasmine rice", "basmati rice",
    "arborio rice", "wild rice", "quinoa", "couscous", "bulgur", "farro",
    "barley", "oat", "oats", "oatmeal", "cornmeal", "polenta", "grits",
    "pasta", "spaghetti", "penne", "rigatoni", "fettuccine", "linguine",
    "macaroni", "lasagna", "orzo", "noodle", "ramen", "udon", "soba",
    "bread crumb", "panko", "crouton",
    // Legumes
    "bean", "black bean", "kidney bean", "pinto bean", "navy bean",
    "cannellini", "chickpea", "garbanzo", "lentil", "split pea",
    // Oils & Vinegars
    "oil", "olive oil", "vegetable oil", "canola oil", "coconut oil",
    "sesame oil", "peanut oil", "avocado oil", "grapeseed oil",
    "vinegar", "balsamic", "red wine vinegar", "white wine vinegar",
    "apple cider vinegar", "rice vinegar", "sherry vinegar",
    // Sauces & Stocks
    "soy sauce", "tamari", "fish sauce", "worcestershire", "oyster sauce",
    "hoisin", "teriyaki", "broth", "stock", "bouillon", "tomato paste",
    "tomato sauce", "marinara", "alfredo",
    // Baking
    "sugar", "brown sugar", "powdered sugar", "confectioners sugar",
    "honey", "maple syrup", "molasses", "corn syrup", "agave",
    "baking powder", "baking soda", "yeast", "cornstarch", "arrowroot",
    "gelatin", "vanilla extract", "almond extract", "cocoa powder",
    "chocolate chip", "chocolate", "nut", "almond", "walnut", "pecan",
    "cashew", "peanut", "pistachio", "hazelnut", "macadamia", "pine nut",
    "seed", "sesame seed", "sunflower seed", "pumpkin seed", "flax seed",
    "chia seed", "poppy seed",
  ],
  "Spices": [
    "salt", "pepper", "black pepper", "white pepper", "sea salt", "kosher salt",
    "cumin", "paprika", "smoked paprika", "cayenne", "chili powder",
    "cinnamon", "nutmeg", "allspice", "clove", "cardamom", "coriander",
    "turmeric", "ginger", "curry powder", "garam masala", "five spice",
    "oregano", "thyme", "rosemary", "sage", "basil", "bay leaf", "dill",
    "tarragon", "marjoram", "parsley flakes", "chives",
    "garlic powder", "onion powder", "mustard powder", "celery salt",
    "red pepper flake", "crushed red pepper", "chili flake",
    "saffron", "sumac", "za'atar", "ras el hanout", "herbes de provence",
    "italian seasoning", "poultry seasoning", "old bay", "taco seasoning",
    "everything bagel seasoning",
  ],
  "Condiments": [
    "ketchup", "mustard", "yellow mustard", "dijon", "whole grain mustard",
    "mayonnaise", "mayo", "aioli", "hot sauce", "sriracha", "tabasco",
    "bbq sauce", "barbecue sauce", "ranch", "blue cheese dressing",
    "salsa", "pico de gallo", "guacamole", "hummus", "tahini",
    "pesto", "chimichurri", "tzatziki", "harissa", "gochujang",
    "relish", "pickle", "olive", "caper", "sun-dried tomato",
    "jam", "jelly", "preserves", "marmalade", "peanut butter", "almond butter",
    "nutella", "chutney", "horseradish", "wasabi",
  ],
  "Frozen": [
    "frozen", "ice cream", "gelato", "sorbet", "frozen yogurt",
    "frozen vegetable", "frozen fruit", "frozen pizza", "frozen dinner",
    "frozen waffle", "frozen pie", "frozen dough",
  ],
  "Beverages": [
    "water", "sparkling water", "soda", "cola", "sprite", "ginger ale",
    "juice", "orange juice", "apple juice", "grape juice", "cranberry juice",
    "lemonade", "iced tea", "sweet tea",
    "coffee", "espresso", "cold brew", "tea", "green tea", "black tea",
    "herbal tea", "chamomile", "matcha",
    "milk", "oat milk", "almond milk", "soy milk", "coconut milk",
    "wine", "red wine", "white wine", "rose", "champagne", "prosecco",
    "beer", "ale", "lager", "stout", "cider",
    "vodka", "rum", "tequila", "whiskey", "bourbon", "gin", "brandy",
  ],
  "Bakery": [
    "bread", "white bread", "wheat bread", "sourdough", "rye bread",
    "baguette", "ciabatta", "focaccia", "brioche", "challah",
    "bagel", "english muffin", "croissant", "danish", "muffin", "scone",
    "roll", "dinner roll", "hamburger bun", "hot dog bun", "slider bun",
    "tortilla", "flour tortilla", "corn tortilla", "wrap", "pita", "naan",
    "flatbread", "lavash", "cracker", "breadstick",
    "cake", "cupcake", "brownie", "cookie", "pie", "tart", "pastry",
    "donut", "doughnut", "cinnamon roll",
  ],
  "Snacks": [
    "chip", "potato chip", "tortilla chip", "corn chip", "pita chip",
    "cracker", "pretzel", "popcorn", "nut", "trail mix",
    "granola bar", "protein bar", "energy bar", "fruit snack",
    "beef jerky", "cheese puff", "cheeto", "dorito",
  ],
};

/**
 * Extract the core ingredient name, removing all modifiers
 * More aggressive than normalizeIngredientName - for comparison purposes
 */
export function extractCoreIngredient(name: string): string {
  let core = name.toLowerCase().trim();

  // Remove all preparation descriptors
  for (const desc of PREPARATION_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove all state descriptors
  for (const desc of STATE_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove all quality descriptors
  for (const desc of QUALITY_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove common phrases
  core = core.replace(/,.*$/, "");           // After comma
  core = core.replace(/\(.*?\)/g, "");       // Parenthetical
  core = core.replace(/for .*$/i, "");       // "for garnish"
  core = core.replace(/to taste/i, "");      // "to taste"
  core = core.replace(/as needed/i, "");     // "as needed"
  core = core.replace(/optional/i, "");      // "optional"

  // Clean up whitespace
  core = core.replace(/\s+/g, " ").trim();

  return core;
}

/**
 * Calculate similarity between two ingredient names (0-1)
 * Uses Levenshtein distance ratio
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Simple Levenshtein distance implementation
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

/**
 * Check if two ingredients are similar enough to merge
 * Returns true if they should be considered the same ingredient
 */
export function areIngredientsSimilar(
  a: string,
  b: string,
  threshold: number = 0.85
): boolean {
  // First, try exact match on core ingredients
  const coreA = extractCoreIngredient(a);
  const coreB = extractCoreIngredient(b);

  if (coreA === coreB) return true;

  // Check if one contains the other (after normalization)
  if (coreA.includes(coreB) || coreB.includes(coreA)) {
    // But avoid matching things like "chicken" with "chicken broth"
    const shorter = coreA.length < coreB.length ? coreA : coreB;
    const longer = coreA.length < coreB.length ? coreB : coreA;

    // If the longer one has significantly more words, don't match
    const shorterWords = shorter.split(/\s+/).length;
    const longerWords = longer.split(/\s+/).length;

    if (longerWords > shorterWords + 1) {
      return false;
    }

    return true;
  }

  // Calculate similarity score
  const similarity = calculateSimilarity(coreA, coreB);
  return similarity >= threshold;
}

/**
 * Guess the category of an ingredient based on keyword matching
 */
export function guessCategory(ingredient: string): IngredientCategory {
  const lower = ingredient.toLowerCase();
  const core = extractCoreIngredient(lower);

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (core.includes(keyword) || lower.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return "Other";
}

/**
 * Merged item with confidence scoring
 */
export interface MergedItemWithConfidence extends MergedItem {
  confidence: number;  // 0-1, how confident we are in the merge
  needs_review: boolean;  // Flag for user to review
}

/**
 * Merge shopping items with confidence scoring
 * Groups items that are likely the same ingredient
 */
export function mergeWithConfidence(
  items: MergeableItem[],
  similarityThreshold: number = 0.85
): MergedItemWithConfidence[] {
  const merged = new Map<string, MergedItemWithConfidence>();
  const processedIndices = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (processedIndices.has(i)) continue;

    const item = items[i];
    const normalizedName = normalizeIngredientName(item.ingredient);
    const coreName = extractCoreIngredient(item.ingredient);

    // Check if this matches any existing merged item
    let foundMatch = false;
    for (const [key, existing] of Array.from(merged.entries())) {
      const existingCore = extractCoreIngredient(existing.ingredient);

      if (areIngredientsSimilar(coreName, existingCore, similarityThreshold)) {
        // Merge with existing
        foundMatch = true;

        const newQuantity = parseQuantity(item.quantity || "");
        const existingQuantity = parseQuantity(existing.quantity || "");

        // Track confidence based on how similar the names are
        const similarity = calculateSimilarity(coreName, existingCore);
        existing.confidence = Math.min(existing.confidence, similarity);
        existing.needs_review = existing.confidence < 0.9;

        // Add source
        if (item.recipe_id || item.recipe_title) {
          const alreadyHasSource = existing.sources.some(
            (s: { recipe_id?: string | null; recipe_title?: string | null }) =>
              s.recipe_id === item.recipe_id && s.recipe_title === item.recipe_title
          );
          if (!alreadyHasSource) {
            existing.sources.push({
              recipe_id: item.recipe_id,
              recipe_title: item.recipe_title,
            });
          }
        }

        // Try to merge quantities
        if (newQuantity !== null && existingQuantity !== null) {
          const newUnit = item.unit ? normalizeUnit(item.unit) : null;
          const existingUnit = existing.unit;

          if (newUnit === existingUnit || (!newUnit && !existingUnit)) {
            const total = existingQuantity + newQuantity;
            const preferred = existingUnit
              ? getPreferredUnit(total, existingUnit)
              : { quantity: total, unit: null };
            existing.quantity = formatQuantity(preferred.quantity);
            existing.unit = preferred.unit;
          } else if (newUnit && existingUnit && areUnitsConvertible(newUnit, existingUnit)) {
            const converted = convertUnit(newQuantity, newUnit, existingUnit);
            if (converted !== null) {
              const total = existingQuantity + converted;
              const preferred = getPreferredUnit(total, existingUnit);
              existing.quantity = formatQuantity(preferred.quantity);
              existing.unit = preferred.unit;
            }
          } else {
            // Units not compatible - lower confidence
            existing.confidence *= 0.8;
            existing.needs_review = true;
          }
        }

        processedIndices.add(i);
        break;
      }
    }

    if (!foundMatch) {
      // Create new entry
      const category = item.category || guessCategory(item.ingredient);

      merged.set(normalizedName, {
        ingredient: item.ingredient,
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
        confidence: 1.0,
        needs_review: false,
      });

      processedIndices.add(i);
    }
  }

  // Find any items that weren't processed (shouldn't happen, but safety check)
  for (let i = 0; i < items.length; i++) {
    if (!processedIndices.has(i)) {
      const item = items[i];
      const normalizedName = normalizeIngredientName(item.ingredient);
      const category = item.category || guessCategory(item.ingredient);

      merged.set(`${normalizedName}_${i}`, {
        ingredient: item.ingredient,
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
        confidence: 1.0,
        needs_review: false,
      });
    }
  }

  return Array.from(merged.values());
}

/**
 * Get a list of items that need user review (low confidence merges)
 */
export function getItemsNeedingReview(
  items: MergedItemWithConfidence[]
): MergedItemWithConfidence[] {
  return items.filter((item) => item.needs_review);
}

```

### logger.ts
```typescript
/**
 * Structured logging utility for MealPrepRecipes
 *
 * In production: Outputs JSON for log aggregation (Vercel, etc.)
 * In development: Human-readable colored output
 * Integrates with Sentry for error reporting
 */

import * as Sentry from "@sentry/nextjs";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  householdId?: string;
  requestId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  data?: Record<string, unknown>;
}

const isProduction = process.env.NODE_ENV === "production";

class Logger {
  private context: LogContext = {};

  /**
   * Create a child logger with additional context
   */
  withContext(ctx: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...ctx };
    return childLogger;
  }

  /**
   * Create a logger with user context (common pattern)
   */
  forUser(userId: string, householdId?: string): Logger {
    return this.withContext({ userId, householdId });
  }

  /**
   * Create a logger with request context
   */
  forRequest(requestId: string): Logger {
    return this.withContext({ requestId });
  }

  private formatEntry(entry: LogEntry): string {
    if (isProduction) {
      // JSON for log aggregation
      return JSON.stringify(entry);
    }

    // Human-readable for development
    const levelColors: Record<LogLevel, string> = {
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m", // green
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.data && Object.keys(entry.data).length > 0) {
      output += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && !isProduction) {
        output += `\n  ${entry.error.stack}`;
      }
    }

    return output;
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error | unknown
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (Object.keys(this.context).length > 0) {
      entry.context = this.context;
    }

    if (data && Object.keys(data).length > 0) {
      entry.data = data;
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = {
          name: "UnknownError",
          message: String(error),
        };
      }
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        if (!isProduction) console.debug(formatted);
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.log(formatted);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(formatted);
        break;
      case "error":
        // eslint-disable-next-line no-console
        console.error(formatted);
        break;
    }
  }

  /**
   * Debug level - only shown in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Warning level - potential issues
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Error level - captures error and sends to Sentry in production
   */
  error(
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.log("error", message, data, error);

    // Send to Sentry in production
    if (isProduction && error instanceof Error) {
      Sentry.withScope((scope) => {
        // Add context to Sentry
        if (this.context.userId) {
          scope.setUser({ id: this.context.userId });
        }
        if (this.context.requestId) {
          scope.setTag("request_id", this.context.requestId);
        }
        if (this.context.action) {
          scope.setTag("action", this.context.action);
        }

        // Add extra data
        scope.setExtras({
          ...this.context,
          ...data,
        });

        Sentry.captureException(error);
      });
    }
  }

  /**
   * Log an action start (useful for tracing)
   */
  actionStart(action: string, data?: Record<string, unknown>): void {
    this.info(`Starting: ${action}`, { ...data, action });
  }

  /**
   * Log an action completion
   */
  actionComplete(
    action: string,
    durationMs?: number,
    data?: Record<string, unknown>
  ): void {
    this.info(`Completed: ${action}`, {
      ...data,
      action,
      durationMs,
    });
  }

  /**
   * Log an action failure
   */
  actionFailed(
    action: string,
    error: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.error(`Failed: ${action}`, error, { ...data, action });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating child loggers
export { Logger };
```

### meal-type-inference.ts
```typescript
import type { MealType } from "@/types/meal-plan";

/**
 * Recipe types that can be mapped to meal types.
 * These match the recipe_type values in the recipes table.
 */
type RecipeType = "Dinner" | "Breakfast" | "Snack" | "Baking" | "Dessert" | "Side Dish" | string;

/**
 * Infer meal type from a recipe's recipe_type field.
 *
 * Mapping:
 * - Breakfast → breakfast
 * - Dinner → dinner
 * - Snack → snack
 * - Baking, Dessert, Side Dish → null (user picks)
 *
 * @param recipeType - The recipe_type from the recipe
 * @returns The inferred meal type or null if ambiguous
 */
export function inferMealType(recipeType: RecipeType | null | undefined): MealType | null {
  if (!recipeType) return null;

  switch (recipeType) {
    case "Breakfast":
      return "breakfast";
    case "Dinner":
      return "dinner";
    case "Snack":
      return "snack";
    // Ambiguous types — let user decide
    case "Baking":
    case "Dessert":
    case "Side Dish":
    default:
      return null;
  }
}

/**
 * Get a friendly display name for the meal type inference result.
 * Useful for showing users why a certain meal type was auto-selected.
 */
export function getInferenceReason(recipeType: RecipeType | null | undefined): string | null {
  if (!recipeType) return null;

  switch (recipeType) {
    case "Breakfast":
      return "Auto-selected based on recipe type";
    case "Dinner":
      return "Auto-selected based on recipe type";
    case "Snack":
      return "Auto-selected based on recipe type";
    default:
      return null;
  }
}
```

### open-food-facts.ts
```typescript
/**
 * Open Food Facts API client
 * https://world.openfoodfacts.org/api/v2
 */

import {
  OpenFoodFactsResponse,
  ScannedProduct,
  BarcodeNutrition,
} from '@/types/barcode';

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'MealPrepRecipes/1.0 (https://github.com/mealprep)';

/**
 * Map Open Food Facts categories to app ingredient categories
 */
const CATEGORY_MAP: Record<string, string> = {
  'en:beverages': 'Beverages',
  'en:drinks': 'Beverages',
  'en:waters': 'Beverages',
  'en:sodas': 'Beverages',
  'en:juices': 'Beverages',
  'en:dairy': 'Dairy & Eggs',
  'en:dairies': 'Dairy & Eggs',
  'en:milks': 'Dairy & Eggs',
  'en:cheeses': 'Dairy & Eggs',
  'en:yogurts': 'Dairy & Eggs',
  'en:eggs': 'Dairy & Eggs',
  'en:meats': 'Meat & Seafood',
  'en:meat': 'Meat & Seafood',
  'en:poultry': 'Meat & Seafood',
  'en:beef': 'Meat & Seafood',
  'en:pork': 'Meat & Seafood',
  'en:seafood': 'Meat & Seafood',
  'en:fish': 'Meat & Seafood',
  'en:frozen-foods': 'Frozen',
  'en:frozen': 'Frozen',
  'en:ice-creams': 'Frozen',
  'en:snacks': 'Snacks',
  'en:chips': 'Snacks',
  'en:crackers': 'Snacks',
  'en:nuts': 'Snacks',
  'en:sauces': 'Condiments',
  'en:condiments': 'Condiments',
  'en:dressings': 'Condiments',
  'en:mayonnaises': 'Condiments',
  'en:ketchups': 'Condiments',
  'en:mustards': 'Condiments',
  'en:cereals': 'Pantry',
  'en:breakfast-cereals': 'Pantry',
  'en:canned-foods': 'Pantry',
  'en:canned': 'Pantry',
  'en:pasta': 'Pantry',
  'en:rice': 'Pantry',
  'en:grains': 'Pantry',
  'en:oils': 'Pantry',
  'en:vinegars': 'Pantry',
  'en:breads': 'Bakery',
  'en:bread': 'Bakery',
  'en:pastries': 'Bakery',
  'en:baked-goods': 'Bakery',
  'en:fruits': 'Produce',
  'en:fresh-fruits': 'Produce',
  'en:vegetables': 'Produce',
  'en:fresh-vegetables': 'Produce',
  'en:salads': 'Produce',
  'en:herbs': 'Produce',
  'en:spices': 'Spices',
  'en:seasonings': 'Spices',
};

/**
 * Map OFF categories array to a single app category
 */
function mapCategory(categoriesTags?: string[]): string {
  if (!categoriesTags || categoriesTags.length === 0) {
    return 'Other';
  }

  // Check each category tag against our mapping
  for (const tag of categoriesTags) {
    const normalizedTag = tag.toLowerCase();

    // Direct match
    if (CATEGORY_MAP[normalizedTag]) {
      return CATEGORY_MAP[normalizedTag];
    }

    // Partial match (e.g., "en:organic-milks" should match "en:milks")
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (normalizedTag.includes(key.replace('en:', ''))) {
        return value;
      }
    }
  }

  return 'Other';
}

/**
 * Extract nutrition data from OFF nutriments
 */
function extractNutrition(
  nutriments?: OpenFoodFactsResponse['product']
): BarcodeNutrition | undefined {
  if (!nutriments?.nutriments) {
    return undefined;
  }

  const n = nutriments.nutriments;

  // Only return if we have at least calories
  if (!n['energy-kcal_100g']) {
    return undefined;
  }

  return {
    calories: n['energy-kcal_100g'],
    protein: n.proteins_100g,
    carbs: n.carbohydrates_100g,
    fat: n.fat_100g,
    fiber: n.fiber_100g,
    sugar: n.sugars_100g,
    sodium: n.sodium_100g ? n.sodium_100g * 1000 : undefined, // Convert to mg
  };
}

/**
 * Look up a product by barcode from Open Food Facts
 */
export async function lookupBarcode(
  barcode: string
): Promise<{ found: boolean; product?: ScannedProduct; error?: string }> {
  // Validate barcode format (should be numeric, 8-14 digits)
  const cleanBarcode = barcode.replace(/\D/g, '');
  if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
    return { found: false, error: 'Invalid barcode format' };
  }

  try {
    const response = await fetch(`${OFF_API_BASE}/product/${cleanBarcode}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      // Cache for 1 hour (OFF data doesn't change frequently)
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false };
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    // Status 0 means product not found
    if (data.status === 0 || !data.product) {
      return { found: false };
    }

    const product = data.product;

    // Get the best available product name
    const name = product.product_name || product.product_name_en || 'Unknown Product';

    const scannedProduct: ScannedProduct = {
      barcode: cleanBarcode,
      name,
      brand: product.brands,
      category: mapCategory(product.categories_tags),
      quantity: product.quantity,
      imageUrl: product.image_front_url || product.image_url,
      nutrition: extractNutrition(product),
    };

    return { found: true, product: scannedProduct };
  } catch (error) {
    console.error('Open Food Facts API error:', error);
    return {
      found: false,
      error: error instanceof Error ? error.message : 'Failed to look up product',
    };
  }
}
```

### rate-limit-redis.ts
```typescript
/**
 * Production-ready rate limiting with Upstash Redis
 * Falls back to in-memory if Redis is not configured
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitOptions {
  /**
   * Unique identifier (usually IP address or user ID)
   */
  identifier: string;
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Initialize Redis client if credentials are available
let redis: Redis | null = null;
const rateLimiters: Map<string, Ratelimit> = new Map();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Get or create a rate limiter for a specific limit/window combination
 */
function getRateLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;

  const key = `${limit}-${windowMs}`;
  
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
    analytics: true,
    prefix: "ratelimit",
  });

  rateLimiters.set(key, limiter);
  return limiter;
}

/**
 * In-memory fallback for development or when Redis is not configured
 */
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    inMemoryStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => inMemoryStore.delete(key));
  }, 10 * 60 * 1000);
}

function rateLimitInMemory(options: RateLimitOptions): RateLimitResult {
  const { identifier, limit, windowMs } = options;
  const now = Date.now();
  
  const entry = inMemoryStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    inMemoryStore.set(identifier, { count: 1, resetTime });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }
  
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis in production, falls back to in-memory for development
 */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { identifier, limit, windowMs } = options;
  
  const limiter = getRateLimiter(limit, windowMs);
  
  // Use Redis if available
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      // Redis failed, fall back to in-memory
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Rate Limit] Redis failed, using in-memory fallback:', error);
      }
    }
  }
  
  // Fallback to in-memory
  return rateLimitInMemory(options);
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string {
  const headers = request.headers;

  // Vercel-specific headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Get current rate limit status without consuming a request
 * Useful for showing users how many requests they have remaining
 */
export async function getRateLimitStatus(options: RateLimitOptions): Promise<RateLimitResult> {
  const { identifier, limit, windowMs } = options;

  // Check in-memory store first
  const entry = inMemoryStore.get(identifier);
  const now = Date.now();

  if (!entry || now > entry.resetTime) {
    // No rate limit consumed yet or window expired
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }

  // Return current status from in-memory
  // Note: This may not be perfectly accurate with Redis,
  // but it's good enough for display purposes
  return {
    success: entry.count < limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetTime,
  };
}

```

### rate-limit.ts
```typescript
/**
 * Simple rate limiting utility
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  /**
   * Unique identifier (usually IP address or user ID)
   */
  identifier: string;
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 */
export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { identifier, limit, windowMs } = options;
  const now = Date.now();
  
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers;
  
  // Vercel-specific headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return 'unknown';
}

```

### recipe-schema-extractor.ts
```typescript
/**
 * Extracts Recipe schema information from HTML using JSON-LD format
 * Many modern recipe websites embed structured data for better SEO
 */

// HowToStep or HowToSection from schema.org
export interface RecipeInstructionItem {
  "@type"?: "HowToStep" | "HowToSection";
  text?: string;
  name?: string;
  itemListElement?: RecipeInstructionItem[]; // For HowToSection
}

// Nutrition from JSON-LD (maps to schema.org/NutritionInformation)
export interface SchemaNutrition {
  "@type"?: "NutritionInformation";
  calories?: string;
  proteinContent?: string;
  carbohydrateContent?: string;
  fatContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  sodiumContent?: string;
  servingSize?: string;
}

export interface RecipeSchema {
  // Core identification
  name?: string;
  description?: string;
  author?: { name?: string } | string;

  // Timing (ISO 8601 duration format)
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;

  // Servings
  recipeYield?: string | string[] | number;

  // CRITICAL: Use correct field name from JSON-LD spec (not "ingredients")
  recipeIngredient?: string[];

  // Instructions - can be strings, HowToStep objects, or HowToSection
  recipeInstructions?: RecipeInstructionItem[] | string | string[];

  // Categorization
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string;

  // Media
  image?: string | string[] | { url?: string }[];

  // Nutrition (optional but valuable)
  nutrition?: SchemaNutrition;

  // Metadata
  datePublished?: string;
  aggregateRating?: {
    ratingValue?: string | number;
    ratingCount?: string | number;
    reviewCount?: string | number;
  };
}

/**
 * Extracts Recipe JSON-LD schema from HTML content
 * Returns the first Recipe schema found, or null if none exists
 */
export function extractRecipeSchema(html: string): RecipeSchema | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdPattern = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = jsonLdPattern.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);

        // Check if this is a Recipe schema or has Recipe in @graph
        if (jsonData["@type"] === "Recipe") {
          return jsonData as RecipeSchema;
        }

        // Check for @graph format (sometimes recipes are nested)
        if (jsonData["@graph"] && Array.isArray(jsonData["@graph"])) {
          const recipe = jsonData["@graph"].find(
            (item: any) => item["@type"] === "Recipe"
          );
          if (recipe) {
            return recipe as RecipeSchema;
          }
        }

        // Check if it's wrapped in another type but has Recipe info
        if (jsonData["@type"] === "WebPage" && jsonData.mainEntity?.["@type"] === "Recipe") {
          return jsonData.mainEntity as RecipeSchema;
        }
      } catch {
        // Continue searching if JSON parsing fails
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes recipe schema ingredients to a consistent format
 */
export function normalizeIngredientsFromSchema(
  ingredients: string[] | undefined
): string[] {
  if (!ingredients) return [];
  return Array.isArray(ingredients) ? ingredients : [ingredients];
}

/**
 * Normalizes recipe schema instructions to a consistent format
 * Handles: string[], string, HowToStep[], HowToSection[]
 */
export function normalizeInstructionsFromSchema(
  instructions: RecipeSchema["recipeInstructions"]
): string[] {
  if (!instructions) return [];

  // Single string
  if (typeof instructions === "string") {
    return [instructions];
  }

  // Array of items
  if (Array.isArray(instructions)) {
    const result: string[] = [];

    for (const item of instructions) {
      if (typeof item === "string") {
        result.push(item);
      } else if (item && typeof item === "object") {
        // HowToSection with nested steps
        if (item["@type"] === "HowToSection" && item.itemListElement) {
          // Optionally prefix with section name
          if (item.name) {
            result.push(`**${item.name}**`);
          }
          // Recursively extract nested steps
          const nestedSteps = normalizeInstructionsFromSchema(item.itemListElement);
          result.push(...nestedSteps);
        } else {
          // HowToStep - prefer 'text' over 'name' (text is usually more detailed)
          const stepText = item.text || item.name;
          if (stepText) {
            result.push(stepText);
          }
        }
      }
    }

    return result.filter((inst) => inst.length > 0);
  }

  return [];
}

/**
 * Extracts timing information from ISO 8601 duration format
 * PT30M -> "30 minutes"
 * PT2H30M -> "2 hours 30 minutes"
 */
export function parseDuration(iso8601Duration: string): string {
  if (!iso8601Duration) return "";

  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = iso8601Duration.match(regex);

  if (!match) return iso8601Duration;

  const hours = match[1];
  const minutes = match[2];
  const seconds = match[3];

  const parts: string[] = [];

  if (hours) parts.push(`${hours} hour${hours !== "1" ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes !== "1" ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds !== "1" ? "s" : ""}`);

  return parts.join(" ");
}

/**
 * Converts recipe yield/servings to a readable format
 */
export function normalizeServings(
  recipeYield: string | string[] | number | undefined
): string {
  if (!recipeYield) return "";

  if (typeof recipeYield === "number") {
    return `${recipeYield} servings`;
  }

  if (Array.isArray(recipeYield)) {
    return recipeYield[0] || "";
  }

  return recipeYield;
}

/**
 * Normalizes author field which can be string or object
 */
export function normalizeAuthor(
  author: RecipeSchema["author"]
): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  return author.name;
}

/**
 * Normalizes category which can be string or array
 */
export function normalizeCategory(
  category: string | string[] | undefined
): string | undefined {
  if (!category) return undefined;
  return Array.isArray(category) ? category[0] : category;
}

/**
 * Normalizes cuisine which can be string or array
 */
export function normalizeCuisine(
  cuisine: string | string[] | undefined
): string | undefined {
  if (!cuisine) return undefined;
  return Array.isArray(cuisine) ? cuisine[0] : cuisine;
}

/**
 * Normalizes keywords from comma-separated string
 */
export function normalizeKeywords(keywords: string | undefined): string[] {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/**
 * Normalizes image to single URL string
 */
export function normalizeImage(
  image: RecipeSchema["image"]
): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.url) return first.url;
  }
  return undefined;
}

/**
 * Parses nutrition string values to numbers
 * Handles formats like "350 calories", "25g", "100mg"
 */
function parseNutritionValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Normalizes schema.org NutritionInformation to our format
 */
export function normalizeNutrition(
  nutrition: SchemaNutrition | undefined
): {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
} | undefined {
  if (!nutrition) return undefined;

  const result = {
    calories: parseNutritionValue(nutrition.calories),
    protein_g: parseNutritionValue(nutrition.proteinContent),
    carbs_g: parseNutritionValue(nutrition.carbohydrateContent),
    fat_g: parseNutritionValue(nutrition.fatContent),
    fiber_g: parseNutritionValue(nutrition.fiberContent),
    sugar_g: parseNutritionValue(nutrition.sugarContent),
    sodium_mg: parseNutritionValue(nutrition.sodiumContent),
  };

  // Only return if at least one value exists
  const hasData = Object.values(result).some((v) => v !== undefined);
  return hasData ? result : undefined;
}

/**
 * Main function to convert JSON-LD recipe schema to our recipe format
 */
export function schemaToRecipeFormat(schema: RecipeSchema) {
  return {
    title: schema.name || "Untitled Recipe",
    description: schema.description,
    prepTime: schema.prepTime ? parseDuration(schema.prepTime) : undefined,
    cookTime: schema.cookTime ? parseDuration(schema.cookTime) : undefined,
    totalTime: schema.totalTime ? parseDuration(schema.totalTime) : undefined,
    servings: normalizeServings(schema.recipeYield),
    // CRITICAL FIX: Use recipeIngredient (correct JSON-LD field name)
    ingredients: normalizeIngredientsFromSchema(schema.recipeIngredient),
    instructions: normalizeInstructionsFromSchema(schema.recipeInstructions),
    author: normalizeAuthor(schema.author),
    // Additional fields
    category: normalizeCategory(schema.recipeCategory),
    cuisine: normalizeCuisine(schema.recipeCuisine),
    keywords: normalizeKeywords(schema.keywords),
    image: normalizeImage(schema.image),
    nutrition: normalizeNutrition(schema.nutrition),
    rating: schema.aggregateRating
      ? {
          value:
            parseFloat(String(schema.aggregateRating.ratingValue)) || undefined,
          count:
            parseInt(String(schema.aggregateRating.ratingCount)) || undefined,
        }
      : undefined,
  };
}

/**
 * Type for the normalized recipe format
 */
export type NormalizedRecipeSchema = ReturnType<typeof schemaToRecipeFormat>;
```

### sounds.ts
```typescript
/**
 * Web Audio API sound generator for UI feedback sounds
 * Generates sounds programmatically without requiring audio files
 */

import type { SoundPreset } from "@/types/user-preferences-v2";

// Singleton AudioContext (created lazily to comply with autoplay policies)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a sound preset at system volume
 * @param sound - The sound preset to play
 */
export function playSound(sound: SoundPreset): void {
  if (sound === "none" || typeof window === "undefined") return;

  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 1.0; // Full volume - uses system volume
  masterGain.connect(ctx.destination);

  switch (sound) {
    case "pop":
      playPop(ctx, masterGain);
      break;
    case "click":
      playClick(ctx, masterGain);
      break;
    case "tick":
      playTick(ctx, masterGain);
      break;
    case "ping":
      playPing(ctx, masterGain);
      break;
    case "ding":
      playDing(ctx, masterGain);
      break;
    case "chime":
      playChime(ctx, masterGain);
      break;
    case "bell":
      playBell(ctx, masterGain);
      break;
    case "whoosh":
      playWhoosh(ctx, masterGain);
      break;
    case "success":
      playSuccess(ctx, masterGain);
      break;
    case "fanfare":
      playFanfare(ctx, masterGain);
      break;
    case "tada":
      playTada(ctx, masterGain);
      break;
    default:
      // Unknown sound, play a simple beep
      playPing(ctx, masterGain);
  }
}

// ============================================================================
// Individual Sound Implementations
// ============================================================================

/** Short bubble pop sound */
function playPop(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** Quick click sound */
function playClick(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(1000, ctx.currentTime);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
}

/** Soft tick sound */
function playTick(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/** High-pitched ping notification */
function playPing(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

/** Classic ding sound (two tones) */
function playDing(ctx: AudioContext, output: GainNode): void {
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.4);
  });
}

/** Musical chime (three ascending notes) */
function playChime(ctx: AudioContext, output: GainNode): void {
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.5);
  });
}

/** Rich bell sound with harmonics */
function playBell(ctx: AudioContext, output: GainNode): void {
  const fundamental = 440;
  const harmonics = [1, 2, 2.4, 3, 4.2, 5.4];
  const amplitudes = [1, 0.6, 0.4, 0.25, 0.2, 0.15];

  harmonics.forEach((harmonic, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamental * harmonic, ctx.currentTime);

    gain.gain.setValueAtTime(amplitudes[i] * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  });
}

/** Swoosh/whoosh sound using filtered noise */
function playWhoosh(ctx: AudioContext, output: GainNode): void {
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  noise.start(ctx.currentTime);
}

/** Success sound (ascending arpeggio) */
function playSuccess(ctx: AudioContext, output: GainNode): void {
  // C major arpeggio
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.3);
  });
}

/** Fanfare sound (triumphant brass-like) */
function playFanfare(ctx: AudioContext, output: GainNode): void {
  // Triumphant chord progression
  const notes = [
    { freq: 261.63, time: 0 },     // C
    { freq: 329.63, time: 0 },     // E
    { freq: 392.00, time: 0 },     // G
    { freq: 523.25, time: 0.15 },  // C (octave)
    { freq: 659.25, time: 0.15 },  // E (octave)
    { freq: 783.99, time: 0.15 },  // G (octave)
  ];

  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sawtooth for brassy sound
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    // Filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    gain.gain.setValueAtTime(0, ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + 0.8);
  });
}

/** Tada celebration sound */
function playTada(ctx: AudioContext, output: GainNode): void {
  // Quick ascending flourish followed by a chord
  const flourish = [392, 440, 493.88, 523.25]; // G, A, B, C

  flourish.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.15);
  });

  // Final chord
  const chordTime = 0.25;
  [523.25, 659.25, 783.99].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + chordTime);

    gain.gain.setValueAtTime(0, ctx.currentTime + chordTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + chordTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + chordTime + 0.6);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + chordTime);
    osc.stop(ctx.currentTime + chordTime + 0.6);
  });
}
```

### substitutions.ts
```typescript
/**
 * Ingredient substitution type definitions
 * Database functions have been moved to @/app/actions/substitutions
 */

export interface Substitution {
  id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
  is_default: boolean;
}

export interface UserSubstitution {
  id: string;
  user_id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
}
```

### timer-detector.ts
```typescript
// Timer detection utility for cooking mode
// Detects time patterns in recipe instructions and converts to minutes

export interface DetectedTimer {
  minutes: number;
  originalText: string;
  displayText: string;
}

/**
 * Detects time patterns in instruction text and returns timer information
 * Patterns supported:
 * - "10 minutes" / "10 mins" / "10 min"
 * - "1 hour" / "1 hr"
 * - "30-45 minutes" (returns middle value)
 * - "1 hour 30 minutes"
 */
export function detectTimers(instruction: string): DetectedTimer[] {
  const timers: DetectedTimer[] = [];

  // Pattern for minutes only: "10 minutes", "15 mins", "5-10 min"
  const minutePattern = /(\d+)(?:\s*-\s*(\d+))?\s*(?:minutes?|mins?)\b/gi;

  // Pattern for hours only: "2 hours", "1 hr"
  const hourPattern = /(\d+)(?:\s*-\s*(\d+))?\s*(?:hours?|hrs?)\b/gi;

  // Pattern for hours and minutes: "1 hour 30 minutes", "2 hrs 15 min"
  const hourMinutePattern = /(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)\s*(?:minutes?|mins?)\b/gi;

  // Check for hour+minute combinations first
  let match: RegExpExecArray | null;
  while ((match = hourMinutePattern.exec(instruction)) !== null) {
    const hours = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const totalMinutes = hours * 60 + mins;

    timers.push({
      minutes: totalMinutes,
      originalText: match[0],
      displayText: formatDuration(totalMinutes)
    });
  }

  // Check for hours only
  while ((match = hourPattern.exec(instruction)) !== null) {
    // Skip if this was already captured as part of hour+minute
    if (timers.some(t => t.originalText.includes(match![0]))) {
      continue;
    }

    const hours1 = parseInt(match[1]);
    const hours2 = match[2] ? parseInt(match[2]) : null;

    // If range (e.g., "2-3 hours"), use middle value
    const hours = hours2 ? Math.ceil((hours1 + hours2) / 2) : hours1;
    const minutes = hours * 60;

    timers.push({
      minutes,
      originalText: match[0],
      displayText: formatDuration(minutes)
    });
  }

  // Check for minutes only
  while ((match = minutePattern.exec(instruction)) !== null) {
    // Skip if this was already captured as part of hour+minute
    if (timers.some(t => t.originalText.includes(match![0]))) {
      continue;
    }

    const mins1 = parseInt(match[1]);
    const mins2 = match[2] ? parseInt(match[2]) : null;

    // If range (e.g., "30-45 minutes"), use middle value
    const minutes = mins2 ? Math.ceil((mins1 + mins2) / 2) : mins1;

    timers.push({
      minutes,
      originalText: match[0],
      displayText: formatDuration(minutes)
    });
  }

  // Remove duplicates and sort by minutes
  const uniqueTimers = timers.filter((timer, index, self) =>
    index === self.findIndex(t => t.minutes === timer.minutes)
  );

  return uniqueTimers.sort((a, b) => a.minutes - b.minutes);
}

/**
 * Formats duration in minutes to human-readable string
 * Examples: "5 min", "1 hr 30 min", "2 hrs"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }

  const hourText = hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hourText} ${minutes} min`;
}
```

### upload-cooking-photo.ts
```typescript
import { createClient } from "@/lib/supabase/client";

/**
 * Upload a cooking history photo to Supabase storage (client-side).
 * Returns the public URL of the uploaded photo.
 */
export async function uploadCookingPhoto(file: File): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("cooking-history-photos")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading photo:", uploadError);
    throw new Error("Failed to upload photo");
  }

  const { data: urlData } = supabase.storage
    .from("cooking-history-photos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Delete a cooking history photo from Supabase storage (client-side).
 */
export async function deleteCookingPhoto(photoUrl: string): Promise<void> {
  const supabase = createClient();

  const urlParts = photoUrl.split("/cooking-history-photos/");
  if (!urlParts[1]) return;

  const { error } = await supabase.storage
    .from("cooking-history-photos")
    .remove([urlParts[1]]);

  if (error) {
    console.error("Error deleting photo:", error);
  }
}
```

### use-debounce.ts
```typescript
import { useState, useEffect } from "react";

/**
 * Hook that debounces a value by the specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### use-offline.ts
```typescript
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOffline() {
  // Start with null to indicate we haven't checked yet (avoids false positive on SSR)
  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("[App] Service worker registered:", registration.scope);
          }
          setIsServiceWorkerReady(true);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  if (process.env.NODE_ENV === 'development') {
                    console.log("[App] New service worker available");
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error("[App] Service worker registration failed:", error);
          }
        });
    }
  }, []);

  // Return false if we haven't checked yet (null) to avoid showing offline banner prematurely
  return { isOffline: isOffline === true, isServiceWorkerReady };
}

// Local storage helper for offline data persistence
const SHOPPING_LIST_CACHE_KEY = "offline_shopping_list";

export interface CachedShoppingList {
  items: Array<{
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    category?: string | null;
    is_checked: boolean;
    recipe_title?: string | null;
  }>;
  lastUpdated: string;
  pendingChanges: Array<{
    type: "toggle" | "add" | "remove";
    itemId?: string;
    item?: {
      ingredient: string;
      quantity?: string;
      unit?: string;
      category?: string;
    };
    timestamp: string;
  }>;
}

export function getCachedShoppingList(): CachedShoppingList | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(SHOPPING_LIST_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[Offline] Failed to read cache:", error);
    }
  }
  return null;
}

export function setCachedShoppingList(data: CachedShoppingList): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(SHOPPING_LIST_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[Offline] Failed to write cache:", error);
    }
  }
}

export function addPendingChange(
  change: CachedShoppingList["pendingChanges"][0]
): void {
  const cached = getCachedShoppingList();
  if (cached) {
    cached.pendingChanges.push(change);
    setCachedShoppingList(cached);
  }
}

export function clearPendingChanges(): void {
  const cached = getCachedShoppingList();
  if (cached) {
    cached.pendingChanges = [];
    setCachedShoppingList(cached);
  }
}

export function useSyncOnReconnect(
  onSync: () => Promise<void>
): { syncNow: () => Promise<void> } {
  const syncNow = useCallback(async () => {
    const cached = getCachedShoppingList();
    if (cached && cached.pendingChanges.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          "[Offline] Syncing",
          cached.pendingChanges.length,
          "pending changes"
        );
      }
      await onSync();
      clearPendingChanges();
    }
  }, [onSync]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("[Offline] Back online, syncing changes...");
      syncNow();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow]);

  return { syncNow };
}

```

### use-swipe.ts
```typescript
"use client";

import { useState, useCallback, useRef, TouchEvent } from "react";
import { triggerHaptic } from "./haptics";

interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enableHaptics?: boolean;
}

interface SwipeState {
  swiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  offset: { x: number; y: number };
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

export function useSwipe(config: SwipeConfig = {}): [SwipeState, SwipeHandlers] {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enableHaptics = true,
  } = config;

  const [state, setState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    offset: { x: 0, y: 0 },
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    hasTriggeredHaptic.current = false;
    setState({ swiping: true, direction: null, offset: { x: 0, y: 0 } });
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startPos.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      // Determine direction based on larger delta
      let direction: "left" | "right" | "up" | "down" | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      // Trigger haptic when threshold is crossed for the first time
      if (
        enableHaptics &&
        !hasTriggeredHaptic.current &&
        (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)
      ) {
        triggerHaptic("selection");
        hasTriggeredHaptic.current = true;
      }

      setState({
        swiping: true,
        direction,
        offset: { x: deltaX, y: deltaY },
      });
    },
    [threshold, enableHaptics]
  );

  const handleTouchEnd = useCallback(() => {
    if (!startPos.current) return;

    const { offset, direction } = state;

    // Check if swipe exceeded threshold
    if (Math.abs(offset.x) > threshold && (direction === "left" || direction === "right")) {
      if (direction === "left" && onSwipeLeft) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeLeft();
      } else if (direction === "right" && onSwipeRight) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeRight();
      }
    }

    if (Math.abs(offset.y) > threshold && (direction === "up" || direction === "down")) {
      if (direction === "up" && onSwipeUp) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeUp();
      } else if (direction === "down" && onSwipeDown) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeDown();
      }
    }

    // Reset state
    startPos.current = null;
    setState({ swiping: false, direction: null, offset: { x: 0, y: 0 } });
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, enableHaptics]);

  const handlers: SwipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return [state, handlers];
}

/**
 * Simple horizontal swipe hook for common use cases
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options?: { threshold?: number; enableHaptics?: boolean }
) {
  return useSwipe({
    onSwipeLeft,
    onSwipeRight,
    ...options,
  });
}
```

### utils.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if an error is a network failure
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed")
    );
  }
  return false;
}

/**
 * Get a user-friendly error message for network failures
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
```

## Server Actions
### ai-meal-suggestions.ts
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';
import { checkAISuggestionQuota } from '@/lib/stripe/subscription';
import type { AISuggestionRecipe, AISuggestionResponse } from '@/types/ai-suggestion';

/**
 * Generate AI meal suggestions for a week
 */
export async function generateAIMealSuggestions(
  weekStart: string,
  lockedDays: string[] = [],
  preferences?: { max_complex_recipes?: number }
) {
  try {
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return { error: 'You must be logged in' };
    }

    // Make API request
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/suggest-meals`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: '', // Will be set by server
        },
        body: JSON.stringify({
          week_start: weekStart,
          locked_days: lockedDays,
          preferences,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to generate suggestions' };
    }

    const data: AISuggestionResponse = await response.json();
    return { data };
  } catch (error) {
    console.error('Error generating AI meal suggestions:', error);
    return { error: 'Failed to generate suggestions' };
  }
}

/**
 * Accept all AI suggestions and add them to the meal plan
 */
export async function acceptAllSuggestions(
  suggestions: AISuggestionRecipe[],
  weekStart: string
) {
  try {
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return { error: 'You must be logged in' };
    }

    const supabase = await createClient();

    // First, save any new (AI-generated) recipes to the library
    const newRecipes: Record<string, string> = {}; // Map temp title to real recipe_id

    for (const suggestion of suggestions) {
      if (suggestion.recipe_id === null) {
        // This is a new AI-generated recipe, save it
        const { data: newRecipe, error } = await supabase
          .from('recipes')
          .insert({
            title: suggestion.title,
            recipe_type: 'Dinner',
            category: suggestion.cuisine || 'Other',
            protein_type: suggestion.protein_type || 'Other',
            prep_time: suggestion.prep_time,
            cook_time: suggestion.cook_time || 30,
            servings: suggestion.servings,
            base_servings: suggestion.servings,
            ingredients: suggestion.ingredients,
            instructions: suggestion.instructions,
            tags: [...(suggestion.tags || []), 'AI Generated'],
            allergen_tags: suggestion.allergen_tags || [],
            household_id: household.household_id,
            user_id: user.id,
            is_shared_with_household: true,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error saving new recipe:', error);
          continue;
        }

        if (newRecipe) {
          newRecipes[suggestion.title] = newRecipe.id;
        }
      }
    }

    // Get or create meal plan for the week
    const { data: existingPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('household_id', household.household_id)
      .eq('week_start', weekStart)
      .single();

    let mealPlanId: string;

    if (existingPlan) {
      mealPlanId = existingPlan.id;
    } else {
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          household_id: household.household_id,
          week_start: weekStart,
        })
        .select('id')
        .single();

      if (planError || !newPlan) {
        return { error: 'Failed to create meal plan' };
      }

      mealPlanId = newPlan.id;
    }

    // Delete existing assignments for suggested days
    const suggestedDays = suggestions.map((s) => s.day);
    await supabase
      .from('meal_assignments')
      .delete()
      .eq('meal_plan_id', mealPlanId)
      .in('day_of_week', suggestedDays);

    // Add new meal assignments
    const assignments = suggestions.map((suggestion) => ({
      meal_plan_id: mealPlanId,
      recipe_id: suggestion.recipe_id || newRecipes[suggestion.title],
      day_of_week: suggestion.day,
      cook: null, // User can assign later
    }));

    const { error: assignError } = await supabase
      .from('meal_assignments')
      .insert(assignments);

    if (assignError) {
      return { error: 'Failed to add meals to plan' };
    }

    // Update suggestion log with accepted count
    await supabase
      .from('ai_suggestion_logs')
      .update({ accepted_count: suggestions.length })
      .eq('household_id', household.household_id)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: false })
      .limit(1);

    revalidatePath('/app/plan');
    return { data: { success: true, meal_plan_id: mealPlanId } };
  } catch (error) {
    console.error('Error accepting suggestions:', error);
    return { error: 'Failed to accept suggestions' };
  }
}

/**
 * Swap a single day's suggestion
 */
export async function swapSingleSuggestion(
  day: string,
  weekStart: string,
  currentSuggestions: AISuggestionRecipe[]
) {
  try {
    const { user } = await getCachedUserWithHousehold();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    // For now, just call the full API with only this day unlocked
    const lockedDays = currentSuggestions
      .filter((s) => s.day !== day)
      .map((s) => s.day);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/suggest-meals`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start: weekStart,
          locked_days: lockedDays,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to swap suggestion' };
    }

    const data: AISuggestionResponse = await response.json();

    // Return just the new suggestion for this day
    const newSuggestion = data.suggestions.find((s) => s.day === day);
    return { data: newSuggestion };
  } catch (error) {
    console.error('Error swapping suggestion:', error);
    return { error: 'Failed to swap suggestion' };
  }
}

/**
 * Check AI suggestion quota
 */
export async function checkAIQuota() {
  try {
    const { user } = await getCachedUserWithHousehold();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    const quota = await checkAISuggestionQuota(user.id);
    return { data: quota };
  } catch (error) {
    console.error('Error checking quota:', error);
    return { error: 'Failed to check quota' };
  }
}
```

### ai-substitutions.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  SubstitutionSuggestion,
  SubstitutionReason,
  SubstitutionFeedback,
  AcceptSubstitutionInput,
} from "@/types/substitution";

/**
 * Accept a substitution suggestion and update the shopping list
 */
export async function acceptSubstitution(
  input: AcceptSubstitutionInput
): Promise<{ error: string | null; newItemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const { item_id, original_ingredient, substitute, action } = input;

  // First, log the substitution
  const { data: log, error: logError } = await supabase
    .from("substitution_logs")
    .insert({
      household_id: membership.household_id,
      user_id: user.id,
      original_ingredient,
      original_quantity: null, // Could be added to input
      original_unit: null,
      chosen_substitute: substitute.substitute,
      substitute_quantity: substitute.quantity,
      substitute_unit: substitute.unit || null,
      reason: "unavailable" as SubstitutionReason, // Default, could be passed
      match_score: substitute.match_score,
      ai_suggestions: substitute as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (logError) {
    console.error("Error logging substitution:", logError);
    // Continue anyway - logging shouldn't block the action
  }

  // Now handle the shopping list based on action type
  switch (action) {
    case "replace": {
      // Replace the original item with the substitute
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          ingredient: substitute.substitute,
          quantity: substitute.quantity,
          unit: substitute.unit || null,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item_id);

      if (error) {
        return { error: error.message };
      }
      break;
    }

    case "add_new": {
      // Keep original, add substitute as new item
      // First get the original item's shopping list
      const { data: originalItem } = await supabase
        .from("shopping_list_items")
        .select("shopping_list_id, category")
        .eq("id", item_id)
        .single();

      if (!originalItem) {
        return { error: "Original item not found" };
      }

      const { data: newItem, error } = await supabase
        .from("shopping_list_items")
        .insert({
          shopping_list_id: originalItem.shopping_list_id,
          ingredient: substitute.substitute,
          quantity: substitute.quantity,
          unit: substitute.unit || null,
          category: originalItem.category,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          is_checked: false,
        })
        .select("id")
        .single();

      if (error) {
        return { error: error.message };
      }

      revalidatePath("/app/shopping-list");
      return { error: null, newItemId: newItem?.id };
    }

    case "mark_unavailable": {
      // Mark original as unavailable (checked with note)
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          is_checked: true,
          notes: `Unavailable - substitute: ${substitute.substitute}`,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item_id);

      if (error) {
        return { error: error.message };
      }
      break;
    }
  }

  revalidatePath("/app/shopping-list");
  return { error: null };
}

/**
 * Submit feedback for a substitution
 */
export async function submitSubstitutionFeedback(
  logId: string,
  feedback: SubstitutionFeedback
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("substitution_logs")
    .update({ feedback })
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get substitution history for the household
 */
export async function getSubstitutionHistory(
  limit = 20
): Promise<{
  error: string | null;
  data: Array<{
    id: string;
    original_ingredient: string;
    chosen_substitute: string;
    reason: SubstitutionReason;
    match_score: number | null;
    feedback: SubstitutionFeedback | null;
    created_at: string;
  }> | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase
    .from("substitution_logs")
    .select(
      "id, original_ingredient, chosen_substitute, reason, match_score, feedback, created_at"
    )
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Array<{
    id: string;
    original_ingredient: string;
    chosen_substitute: string;
    reason: SubstitutionReason;
    match_score: number | null;
    feedback: SubstitutionFeedback | null;
    created_at: string;
  }> };
}

/**
 * Get common substitutions (most frequently used)
 */
export async function getCommonSubstitutions(): Promise<{
  error: string | null;
  data: Array<{
    original_ingredient: string;
    chosen_substitute: string;
    count: number;
    avg_score: number;
  }> | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // This would ideally be a database view/function for efficiency
  const { data, error } = await supabase
    .from("substitution_logs")
    .select("original_ingredient, chosen_substitute, match_score")
    .eq("household_id", membership.household_id);

  if (error) {
    return { error: error.message, data: null };
  }

  // Aggregate in JS (in production, this should be a DB function)
  const aggregated = new Map<
    string,
    { count: number; totalScore: number }
  >();

  for (const log of data || []) {
    const key = `${log.original_ingredient}|${log.chosen_substitute}`;
    const existing = aggregated.get(key) || { count: 0, totalScore: 0 };
    aggregated.set(key, {
      count: existing.count + 1,
      totalScore: existing.totalScore + (log.match_score || 0),
    });
  }

  const result = Array.from(aggregated.entries())
    .map(([key, value]) => {
      const [original, substitute] = key.split("|");
      return {
        original_ingredient: original,
        chosen_substitute: substitute,
        count: value.count,
        avg_score: Math.round(value.totalScore / value.count),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { error: null, data: result };
}
```

### auth.ts
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Return error message with brand voice
    if (error.message.includes("Invalid login") || error.message.includes("Invalid login credentials")) {
      return { error: "Hmm, that doesn't look right. Check your email and password?" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Check your inbox! You need to verify your email first." };
    }
    if (error.message.includes("User not found")) {
      return { error: "We couldn't find an account with that email. Want to sign up instead?" };
    }
    if (error.message.includes("Too many requests")) {
      return { error: "Too many login attempts. Please wait a moment and try again." };
    }
    return { error: error.message || "Something went wrong. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name: name || email.split("@")[0],
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`,
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      return { error: "Looks like you already have an account. Try logging in?" };
    }
    return { error: error.message };
  }

  return { success: "Check your email! We sent you a magic link to confirm your account." };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app/settings`,
  });

  if (error) {
    return { error: "Something went wrong. Try again?" };
  }

  return { success: "If that email exists, you'll get a reset link. Check your inbox!" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`;
  console.log("Google OAuth redirect URL:", redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    return { error: "Google auth failed. Try again?" };
  }

  console.log("Google OAuth data:", data);

  if (data.url) {
    return { url: data.url };
  }

  return { error: "Failed to get Google auth URL" };
}
```

### bulk-tag-recipes.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface BulkTagResult {
  success: boolean;
  updatedCount: number;
  error?: string;
}

/**
 * Add a tag to multiple recipes at once.
 * If a recipe already has the tag, it's skipped (no duplicates).
 */
export async function bulkAddTagToRecipes(
  recipeIds: string[],
  tag: string
): Promise<BulkTagResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, updatedCount: 0, error: "Not authenticated" };
  }

  if (recipeIds.length === 0) {
    return { success: false, updatedCount: 0, error: "No recipes selected" };
  }

  if (!tag.trim()) {
    return { success: false, updatedCount: 0, error: "Tag cannot be empty" };
  }

  const normalizedTag = tag.trim();

  try {
    // Fetch current tags for all selected recipes
    const { data: recipes, error: fetchError } = await supabase
      .from("recipes")
      .select("id, tags")
      .in("id", recipeIds)
      .eq("user_id", user.id);

    if (fetchError) {
      throw fetchError;
    }

    if (!recipes || recipes.length === 0) {
      return { success: false, updatedCount: 0, error: "No recipes found" };
    }

    // Update each recipe that doesn't already have the tag
    let updatedCount = 0;
    const updatePromises = recipes
      .filter((recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        // Check if tag already exists (case-insensitive)
        return !existingTags.some(
          (t) => t.toLowerCase() === normalizedTag.toLowerCase()
        );
      })
      .map(async (recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        const newTags = [...existingTags, normalizedTag];

        const { error } = await supabase
          .from("recipes")
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq("id", recipe.id)
          .eq("user_id", user.id);

        if (!error) {
          updatedCount++;
        }
        return error;
      });

    await Promise.all(updatePromises);

    // Revalidate the recipes page
    revalidatePath("/app/recipes");

    return {
      success: true,
      updatedCount,
    };
  } catch (error) {
    console.error("Bulk tag error:", error);
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Failed to update recipes",
    };
  }
}

/**
 * Remove a tag from multiple recipes at once.
 */
export async function bulkRemoveTagFromRecipes(
  recipeIds: string[],
  tag: string
): Promise<BulkTagResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, updatedCount: 0, error: "Not authenticated" };
  }

  if (recipeIds.length === 0) {
    return { success: false, updatedCount: 0, error: "No recipes selected" };
  }

  const normalizedTag = tag.trim().toLowerCase();

  try {
    // Fetch current tags for all selected recipes
    const { data: recipes, error: fetchError } = await supabase
      .from("recipes")
      .select("id, tags")
      .in("id", recipeIds)
      .eq("user_id", user.id);

    if (fetchError) {
      throw fetchError;
    }

    if (!recipes || recipes.length === 0) {
      return { success: false, updatedCount: 0, error: "No recipes found" };
    }

    // Update each recipe that has the tag
    let updatedCount = 0;
    const updatePromises = recipes
      .filter((recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        return existingTags.some((t) => t.toLowerCase() === normalizedTag);
      })
      .map(async (recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        const newTags = existingTags.filter(
          (t) => t.toLowerCase() !== normalizedTag
        );

        const { error } = await supabase
          .from("recipes")
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq("id", recipe.id)
          .eq("user_id", user.id);

        if (!error) {
          updatedCount++;
        }
        return error;
      });

    await Promise.all(updatePromises);

    revalidatePath("/app/recipes");

    return {
      success: true,
      updatedCount,
    };
  } catch (error) {
    console.error("Bulk tag removal error:", error);
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Failed to update recipes",
    };
  }
}
```

### community.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PublicRecipe,
  TrendingRecipe,
  RecipeReportReason,
  SavedRecipeListItem,
} from "@/types/social";

// Get public recipes with filtering
export async function getPublicRecipes(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  recipeType?: string;
  search?: string;
}): Promise<{ data: PublicRecipe[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_public_recipes", {
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_category: options?.category ?? null,
    p_recipe_type: options?.recipeType ?? null,
    p_search: options?.search ?? null,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("Error fetching public recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform database response to PublicRecipe type
  const recipes: PublicRecipe[] = (data || []).map((r: {
    id: string;
    title: string;
    recipe_type: string;
    category: string | null;
    prep_time: string | null;
    cook_time: string | null;
    servings: string | null;
    image_url: string | null;
    view_count: number;
    avg_rating: number | null;
    review_count: number;
    created_at: string;
    author_id: string;
    author_username: string;
    author_avatar_url: string | null;
    is_saved: boolean;
  }) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    category: r.category,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    servings: r.servings,
    image_url: r.image_url,
    view_count: r.view_count,
    avg_rating: r.avg_rating,
    review_count: r.review_count,
    created_at: r.created_at,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar_url: r.author_avatar_url,
    },
    is_saved: r.is_saved,
  }));

  return { data: recipes, error: null };
}

// Get trending recipes
export async function getTrendingRecipes(
  limit: number = 10
): Promise<{ data: TrendingRecipe[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_trending_recipes", {
    p_limit: limit,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("Error fetching trending recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform database response to TrendingRecipe type
  const recipes: TrendingRecipe[] = (data || []).map((r: {
    id: string;
    title: string;
    recipe_type: string;
    category: string | null;
    image_url: string | null;
    view_count: number;
    save_count: number;
    score: number;
    author_id: string;
    author_username: string;
    author_avatar_url: string | null;
    is_saved: boolean;
  }) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    category: r.category,
    image_url: r.image_url,
    view_count: r.view_count,
    save_count: r.save_count,
    score: r.score,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar_url: r.author_avatar_url,
    },
    is_saved: r.is_saved,
  }));

  return { data: recipes, error: null };
}

// Save a public recipe
export async function saveRecipe(
  recipeId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to save recipes" };
  }

  const { error } = await supabase.from("saved_recipes").insert({
    user_id: user.id,
    recipe_id: recipeId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Recipe already saved" };
    }
    console.error("Error saving recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Unsave a recipe
export async function unsaveRecipe(
  recipeId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("Error unsaving recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get user's saved recipes
export async function getSavedRecipes(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: SavedRecipeListItem[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in" };
  }

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("saved_recipes")
    .select(
      `
      recipe:recipes!inner (
        id,
        title,
        recipe_type,
        category,
        prep_time,
        cook_time,
        servings,
        image_url,
        view_count,
        avg_rating,
        review_count,
        created_at,
        user:profiles!recipes_user_id_fkey (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform to SavedRecipeListItem type
  const recipes: SavedRecipeListItem[] = (data || []).map((item) => {
    const r = item.recipe as unknown as {
      id: string;
      title: string;
      recipe_type: string;
      category: string | null;
      prep_time: string | null;
      cook_time: string | null;
      servings: string | null;
      image_url: string | null;
      view_count: number;
      avg_rating: number | null;
      review_count: number;
      created_at: string;
      user: { id: string; username: string; avatar_url: string | null };
    };
    return {
      id: r.id,
      title: r.title,
      recipe_type: r.recipe_type,
      category: r.category,
      prep_time: r.prep_time,
      cook_time: r.cook_time,
      servings: r.servings,
      image_url: r.image_url,
      view_count: r.view_count,
      avg_rating: r.avg_rating,
      review_count: r.review_count,
      created_at: r.created_at,
      author: {
        id: r.user.id,
        username: r.user.username,
        avatar_url: r.user.avatar_url,
      },
      is_saved: true,
    };
  });

  return { data: recipes, error: null };
}

// Report a recipe
export async function reportRecipe(
  recipeId: string,
  reason: RecipeReportReason,
  description?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to report recipes" };
  }

  // Check that recipe exists and is public
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, user_id, is_public")
    .eq("id", recipeId)
    .single();

  if (!recipe) {
    return { success: false, error: "Recipe not found" };
  }

  if (!recipe.is_public) {
    return { success: false, error: "Can only report public recipes" };
  }

  if (recipe.user_id === user.id) {
    return { success: false, error: "Cannot report your own recipe" };
  }

  const { error } = await supabase.from("recipe_reports").insert({
    recipe_id: recipeId,
    reporter_id: user.id,
    reason,
    description: description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You have already reported this recipe" };
    }
    console.error("Error reporting recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get available categories from public recipes
export async function getPublicCategories(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("category")
    .eq("is_public", true)
    .eq("hidden_from_public", false)
    .not("category", "is", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return { data: null, error: error.message };
  }

  // Get unique categories
  const categories = Array.from(new Set(data.map((r) => r.category).filter(Boolean))) as string[];
  return { data: categories.sort(), error: null };
}

// Get available recipe types from public recipes
export async function getPublicRecipeTypes(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("recipe_type")
    .eq("is_public", true)
    .eq("hidden_from_public", false);

  if (error) {
    console.error("Error fetching recipe types:", error);
    return { data: null, error: error.message };
  }

  // Get unique recipe types
  const types = Array.from(new Set(data.map((r) => r.recipe_type).filter(Boolean))) as string[];
  return { data: types.sort(), error: null };
}

// Refresh trending cache (called by cron)
export async function refreshTrendingCache(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("refresh_trending_cache");

  if (error) {
    console.error("Error refreshing trending cache:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
```

### cooking-history.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CookingHistoryEntry,
  CookingHistoryWithRecipe,
  MarkAsCookedInput,
} from "@/types/cooking-history";

export async function markAsCooked(input: MarkAsCookedInput & {
  modifications?: string | null;
  photo_url?: string | null;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: input.recipe_id,
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: input.cooked_at || new Date().toISOString(),
      rating: input.rating || null,
      notes: input.notes || null,
      modifications: input.modifications || null,
      photo_url: input.photo_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error marking as cooked:", error);
    return { error: "Failed to mark recipe as cooked" };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${input.recipe_id}`);
  return { data: data as CookingHistoryEntry };
}

export async function updateCookingHistoryEntry(
  id: string,
  updates: {
    rating?: number | null;
    notes?: string | null;
    modifications?: string | null;
    cooked_at?: string;
    photo_url?: string | null;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify user can edit this entry (must be in same household)
  const { data: entry } = await supabase
    .from("cooking_history")
    .select("household_id, cooked_by, photo_url, recipe_id")
    .eq("id", id)
    .single();

  if (!entry) {
    return { error: "Entry not found" };
  }

  if (entry.household_id !== membership.household_id) {
    return { error: "Not authorized to edit this entry" };
  }

  // Build update object with only defined values
  const updateData: Record<string, unknown> = {};
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.modifications !== undefined) updateData.modifications = updates.modifications;
  if (updates.cooked_at !== undefined) updateData.cooked_at = updates.cooked_at;
  if (updates.photo_url !== undefined) updateData.photo_url = updates.photo_url;

  const { data, error } = await supabase
    .from("cooking_history")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cooking history:", error);
    return { error: "Failed to update entry" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/history");
  revalidatePath(`/app/recipes/${entry.recipe_id}`);
  return { data: data as CookingHistoryEntry };
}

export async function deleteCookingHistoryEntry(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify user can delete this entry (must be in same household)
  const { data: entry } = await supabase
    .from("cooking_history")
    .select("household_id")
    .eq("id", id)
    .single();

  if (!entry) {
    return { error: "Entry not found" };
  }

  if (entry.household_id !== membership.household_id) {
    return { error: "Not authorized to delete this entry" };
  }

  const { error } = await supabase
    .from("cooking_history")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting cooking history:", error);
    return { error: "Failed to delete entry" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/history");
  return { success: true };
}

export async function getCookingHistory(limit?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: [] };
  }

  let query = supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

export async function getRecipeHistory(recipeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipe history:", error);
    return { error: "Failed to fetch recipe history", data: [] };
  }

  return { data };
}

/**
 * Quick rate a recipe - creates a cooking history entry with just a rating.
 * This also updates the recipe's rating field to the new rating.
 */
export async function quickRate(recipeId: string, rating: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be an integer between 1 and 5" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Create cooking history entry with rating
  const { error: historyError } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: new Date().toISOString(),
      rating: rating,
      notes: null,
    });

  if (historyError) {
    console.error("Error creating cooking history:", historyError);
    return { error: "Failed to save rating" };
  }

  // Update recipe's rating field to the new rating
  const { error: recipeError } = await supabase
    .from("recipes")
    .update({ rating: rating })
    .eq("id", recipeId);

  if (recipeError) {
    console.error("Error updating recipe rating:", recipeError);
    // Don't return error - history was saved successfully
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { data: { rating } };
}

export async function rateRecipeWithNotes(
  recipeId: string,
  rating: number,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be an integer between 1 and 5" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Create cooking history entry with rating and notes
  const { error: historyError } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: new Date().toISOString(),
      rating: rating,
      notes: notes || null,
    });

  if (historyError) {
    console.error("Error creating cooking history:", historyError);
    return { error: "Failed to save rating" };
  }

  // Update recipe's rating field to the new rating
  const { error: recipeError } = await supabase
    .from("recipes")
    .update({ rating: rating })
    .eq("id", recipeId);

  if (recipeError) {
    console.error("Error updating recipe rating:", recipeError);
    // Don't return error - history was saved successfully
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { data: { rating, notes } };
}

/**
 * Bulk delete multiple cooking history entries.
 * All entries must belong to the user's household.
 */
export async function bulkDeleteCookingHistory(ids: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!ids.length) {
    return { error: "No entries selected" };
  }

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify all entries belong to user's household and get their photo URLs
  const { data: entries } = await supabase
    .from("cooking_history")
    .select("id, household_id, photo_url")
    .in("id", ids);

  if (!entries) {
    return { error: "Entries not found" };
  }

  // Check authorization for all entries
  const unauthorizedEntries = entries.filter(
    (e) => e.household_id !== membership.household_id
  );
  if (unauthorizedEntries.length > 0) {
    return { error: "Not authorized to delete some entries" };
  }

  // Delete photos from storage
  const photosToDelete = entries
    .filter((e) => e.photo_url)
    .map((e) => {
      const urlParts = e.photo_url!.split("/cooking-history-photos/");
      return urlParts[1];
    })
    .filter(Boolean);

  if (photosToDelete.length > 0) {
    await supabase.storage.from("cooking-history-photos").remove(photosToDelete);
  }

  // Delete the entries
  const { error } = await supabase
    .from("cooking_history")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error bulk deleting cooking history:", error);
    return { error: "Failed to delete entries" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/history");

  return { success: true, deletedCount: ids.length };
}

/**
 * Get cooking history for a specific user (for profile display).
 * Shows entries where the user was the cook.
 */
export async function getUserCookingHistory(userId: string, limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type, image_url),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("cooked_by", userId)
    .order("cooked_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

/**
 * Get most recent cooking history entry for a recipe.
 * Used to determine if user has cooked before (for rating click behavior).
 */
export async function getMostRecentCookingEntry(recipeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("recipe_id", recipeId)
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // Not finding an entry is not an error
    return { data: null };
  }

  return { data };
}
```

### custom-badges.ts
```typescript
"use server";

/**
 * Server Actions for Custom Nutrition Badges
 * Handles CRUD operations for user-defined nutrition badges
 */

import { createClient } from "@/lib/supabase/server";
import type { BadgeCondition, BadgeColor, CustomBadge } from "@/lib/nutrition/badge-calculator";

/**
 * Get the household ID for the current user
 */
async function getUserHouseholdId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  return membership?.household_id || null;
}

// =====================================================
// TYPES
// =====================================================

export interface CreateCustomBadgeInput {
  name: string;
  color: BadgeColor;
  conditions: BadgeCondition[];
}

export interface UpdateCustomBadgeInput {
  id: string;
  name?: string;
  color?: BadgeColor;
  conditions?: BadgeCondition[];
  is_active?: boolean;
}

interface ActionResult<T> {
  data?: T;
  error?: string;
}

// =====================================================
// GET CUSTOM BADGES
// =====================================================

/**
 * Get all custom badges for the current user's household
 */
export async function getCustomBadges(): Promise<ActionResult<CustomBadge[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching custom badges:", error);
    return { error: error.message };
  }

  // Transform to match CustomBadge type
  const badges: CustomBadge[] = (data || []).map((row) => ({
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    color: row.color as BadgeColor,
    conditions: row.conditions as BadgeCondition[],
    is_active: row.is_active,
    created_at: row.created_at,
  }));

  return { data: badges };
}

/**
 * Get only active custom badges for the current user's household
 */
export async function getActiveCustomBadges(): Promise<ActionResult<CustomBadge[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .select("*")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active custom badges:", error);
    return { error: error.message };
  }

  const badges: CustomBadge[] = (data || []).map((row) => ({
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    color: row.color as BadgeColor,
    conditions: row.conditions as BadgeCondition[],
    is_active: row.is_active,
    created_at: row.created_at,
  }));

  return { data: badges };
}

// =====================================================
// CREATE CUSTOM BADGE
// =====================================================

/**
 * Create a new custom badge
 */
export async function createCustomBadge(
  input: CreateCustomBadgeInput
): Promise<ActionResult<CustomBadge>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  // Validate input
  if (!input.name || input.name.trim().length === 0) {
    return { error: "Badge name is required" };
  }

  if (input.name.length > 50) {
    return { error: "Badge name must be 50 characters or less" };
  }

  if (!input.conditions || input.conditions.length === 0) {
    return { error: "At least one condition is required" };
  }

  if (input.conditions.length > 4) {
    return { error: "Maximum 4 conditions allowed" };
  }

  // Validate each condition
  for (const condition of input.conditions) {
    if (!isValidCondition(condition)) {
      return { error: `Invalid condition: ${JSON.stringify(condition)}` };
    }
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .insert({
      household_id: householdId,
      created_by: user.id,
      name: input.name.trim(),
      color: input.color,
      conditions: input.conditions,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A badge with this name already exists" };
    }
    console.error("Error creating custom badge:", error);
    return { error: error.message };
  }

  const badge: CustomBadge = {
    id: data.id,
    household_id: data.household_id,
    name: data.name,
    color: data.color as BadgeColor,
    conditions: data.conditions as BadgeCondition[],
    is_active: data.is_active,
    created_at: data.created_at,
  };

  return { data: badge };
}

// =====================================================
// UPDATE CUSTOM BADGE
// =====================================================

/**
 * Update an existing custom badge
 */
export async function updateCustomBadge(
  input: UpdateCustomBadgeInput
): Promise<ActionResult<CustomBadge>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  // Build update object
  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      return { error: "Badge name cannot be empty" };
    }
    if (input.name.length > 50) {
      return { error: "Badge name must be 50 characters or less" };
    }
    updates.name = input.name.trim();
  }

  if (input.color !== undefined) {
    updates.color = input.color;
  }

  if (input.conditions !== undefined) {
    if (input.conditions.length === 0) {
      return { error: "At least one condition is required" };
    }
    if (input.conditions.length > 4) {
      return { error: "Maximum 4 conditions allowed" };
    }
    for (const condition of input.conditions) {
      if (!isValidCondition(condition)) {
        return { error: `Invalid condition: ${JSON.stringify(condition)}` };
      }
    }
    updates.conditions = input.conditions;
  }

  if (input.is_active !== undefined) {
    updates.is_active = input.is_active;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "No updates provided" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .update(updates)
    .eq("id", input.id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A badge with this name already exists" };
    }
    console.error("Error updating custom badge:", error);
    return { error: error.message };
  }

  if (!data) {
    return { error: "Badge not found" };
  }

  const badge: CustomBadge = {
    id: data.id,
    household_id: data.household_id,
    name: data.name,
    color: data.color as BadgeColor,
    conditions: data.conditions as BadgeCondition[],
    is_active: data.is_active,
    created_at: data.created_at,
  };

  return { data: badge };
}

// =====================================================
// DELETE CUSTOM BADGE
// =====================================================

/**
 * Delete a custom badge
 */
export async function deleteCustomBadge(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { error } = await supabase
    .from("custom_nutrition_badges")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error deleting custom badge:", error);
    return { error: error.message };
  }

  return {};
}

// =====================================================
// TOGGLE BADGE ACTIVE STATE
// =====================================================

/**
 * Toggle a badge's active state
 */
export async function toggleBadgeActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<CustomBadge>> {
  return updateCustomBadge({ id, is_active: isActive });
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

const VALID_NUTRIENTS = [
  "calories",
  "protein_g",
  "carbs_g",
  "fat_g",
  "fiber_g",
  "sugar_g",
  "sodium_mg",
];

const VALID_OPERATORS = ["gt", "lt", "eq", "gte", "lte", "between"];

/**
 * Validate a badge condition
 */
function isValidCondition(condition: BadgeCondition): boolean {
  if (!condition.nutrient || !VALID_NUTRIENTS.includes(condition.nutrient)) {
    return false;
  }

  if (!condition.operator || !VALID_OPERATORS.includes(condition.operator)) {
    return false;
  }

  if (typeof condition.value !== "number" || condition.value < 0) {
    return false;
  }

  if (condition.operator === "between") {
    if (typeof condition.value2 !== "number" || condition.value2 < 0) {
      return false;
    }
    if (condition.value2 <= condition.value) {
      return false;
    }
  }

  return true;
}
```

### custom-fields.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
  CustomFieldValue,
} from "@/types/custom-fields";

// ============================================================================
// Field Definitions
// ============================================================================

/**
 * Get all custom field definitions for a household
 */
export async function getCustomFieldDefinitions(householdId: string): Promise<{
  data: CustomFieldDefinition[] | null;
  error: string | null;
}> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_field_definitions")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Map snake_case to camelCase
  const mappedData: CustomFieldDefinition[] = (data || []).map((row) => ({
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    slug: row.slug,
    fieldType: row.field_type,
    description: row.description,
    isRequired: row.is_required,
    defaultValue: row.default_value,
    options: row.options,
    validationRules: row.validation_rules,
    showInCard: row.show_in_card,
    showInFilters: row.show_in_filters,
    sortOrder: row.sort_order,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: mappedData, error: null };
}

/**
 * Create a new custom field definition
 */
export async function createFieldDefinition(
  householdId: string,
  formData: CustomFieldDefinitionFormData
): Promise<{ data: CustomFieldDefinition | null; error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Generate slug from name
  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // Get the next sort_order
  const { data: existingFields } = await supabase
    .from("custom_recipe_field_definitions")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingFields?.[0]?.sort_order
    ? existingFields[0].sort_order + 1
    : 0;

  const { data, error } = await supabase
    .from("custom_recipe_field_definitions")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      field_type: formData.fieldType,
      description: formData.description || null,
      is_required: formData.isRequired || false,
      default_value: formData.defaultValue || null,
      options: formData.options || null,
      validation_rules: formData.validationRules || null,
      show_in_card: formData.showInCard || false,
      show_in_filters: formData.showInFilters || true,
      sort_order: nextSortOrder,
      icon: formData.icon || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomFieldDefinition = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    fieldType: data.field_type,
    description: data.description,
    isRequired: data.is_required,
    defaultValue: data.default_value,
    options: data.options,
    validationRules: data.validation_rules,
    showInCard: data.show_in_card,
    showInFilters: data.show_in_filters,
    sortOrder: data.sort_order,
    icon: data.icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { data: mappedData, error: null };
}

/**
 * Update an existing custom field definition
 */
export async function updateFieldDefinition(
  id: string,
  formData: Partial<CustomFieldDefinitionFormData>
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (formData.name !== undefined) {
    updateData.name = formData.name;
    // Update slug if name changes
    updateData.slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  if (formData.fieldType !== undefined) updateData.field_type = formData.fieldType;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.isRequired !== undefined) updateData.is_required = formData.isRequired;
  if (formData.defaultValue !== undefined) updateData.default_value = formData.defaultValue;
  if (formData.options !== undefined) updateData.options = formData.options;
  if (formData.validationRules !== undefined) updateData.validation_rules = formData.validationRules;
  if (formData.showInCard !== undefined) updateData.show_in_card = formData.showInCard;
  if (formData.showInFilters !== undefined) updateData.show_in_filters = formData.showInFilters;
  if (formData.icon !== undefined) updateData.icon = formData.icon;

  const { error } = await supabase
    .from("custom_recipe_field_definitions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Delete a custom field definition (cascades to all values)
 */
export async function deleteFieldDefinition(id: string): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("custom_recipe_field_definitions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reorder field definitions
 */
export async function reorderFieldDefinitions(
  householdId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Update sort_order for each field
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_recipe_field_definitions")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return { error: firstError.error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

// ============================================================================
// Field Values
// ============================================================================

/**
 * Get all custom field values for a recipe
 */
export async function getFieldValues(recipeId: string): Promise<{
  data: CustomFieldValue[] | null;
  error: string | null;
}> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_field_values")
    .select("*")
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomFieldValue[] = (data || []).map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    fieldDefinitionId: row.field_definition_id,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: mappedData, error: null };
}

/**
 * Set a custom field value for a recipe (upsert)
 */
export async function setFieldValue(
  recipeId: string,
  fieldDefinitionId: string,
  value: unknown
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("custom_recipe_field_values").upsert(
    {
      recipe_id: recipeId,
      field_definition_id: fieldDefinitionId,
      value,
    },
    {
      onConflict: "recipe_id,field_definition_id",
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { error: null };
}

/**
 * Bulk set field values for a recipe
 */
export async function bulkSetFieldValues(
  recipeId: string,
  values: { fieldDefinitionId: string; value: unknown }[]
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const rows = values.map((v) => ({
    recipe_id: recipeId,
    field_definition_id: v.fieldDefinitionId,
    value: v.value,
  }));

  const { error } = await supabase
    .from("custom_recipe_field_values")
    .upsert(rows, {
      onConflict: "recipe_id,field_definition_id",
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { error: null };
}
```

### custom-ingredient-categories.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CustomIngredientCategory,
  CustomIngredientCategoryFormData,
} from "@/types/custom-ingredient-category";

/**
 * Convert database row to CustomIngredientCategory
 */
function mapDbToCategory(dbRow: Record<string, unknown>): CustomIngredientCategory {
  return {
    id: dbRow.id as string,
    householdId: dbRow.household_id as string,
    name: dbRow.name as string,
    slug: dbRow.slug as string,
    emoji: dbRow.emoji as string,
    color: dbRow.color as string,
    sortOrder: dbRow.sort_order as number,
    isSystem: dbRow.is_system as boolean,
    parentCategoryId: (dbRow.parent_category_id as string | null) || null,
    defaultStoreId: (dbRow.default_store_id as string | null) || null,
    createdAt: dbRow.created_at as string,
  };
}

/**
 * Generate a URL-safe slug from a category name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Get all custom ingredient categories for a household with hierarchy support
 */
export async function getCustomIngredientCategories(householdId: string): Promise<{
  data: CustomIngredientCategory[] | null;
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated", data: null };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_ingredient_categories")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  const categories = data.map(mapDbToCategory);

  return { error: null, data: categories };
}

/**
 * Create a new custom ingredient category
 */
export async function createCustomIngredientCategory(
  householdId: string,
  formData: CustomIngredientCategoryFormData
): Promise<{
  data: CustomIngredientCategory | null;
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated", data: null };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household", data: null };
  }

  const supabase = await createClient();

  // Generate slug from name
  const slug = generateSlug(formData.name);

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from("custom_ingredient_categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: "A category with this name already exists", data: null };
  }

  // Get max sort_order
  const { data: maxSortData } = await supabase
    .from("custom_ingredient_categories")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = maxSortData ? (maxSortData.sort_order as number) + 1 : 0;

  // Create the category
  const { data, error } = await supabase
    .from("custom_ingredient_categories")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      parent_category_id: formData.parentCategoryId || null,
      default_store_id: formData.defaultStoreId || null,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null, data: mapDbToCategory(data) };
}

/**
 * Update an existing custom ingredient category
 */
export async function updateCustomIngredientCategory(
  id: string,
  formData: Partial<CustomIngredientCategoryFormData>
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Get the existing category to verify ownership and check if system
  const { data: existing, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("household_id, is_system, slug, name")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { error: "Category not found" };
  }

  // Verify household access
  if (existing.household_id !== household.household_id) {
    return { error: "Unauthorized access to this category" };
  }

  // Build update object
  const updates: Record<string, unknown> = {};

  if (formData.name !== undefined) {
    updates.name = formData.name;
    // Regenerate slug if name changes
    const newSlug = generateSlug(formData.name);
    if (newSlug !== existing.slug) {
      // Check for duplicate slug
      const { data: duplicate } = await supabase
        .from("custom_ingredient_categories")
        .select("id")
        .eq("household_id", existing.household_id)
        .eq("slug", newSlug)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return { error: "A category with this name already exists" };
      }
      updates.slug = newSlug;
    }
  }

  if (formData.emoji !== undefined) updates.emoji = formData.emoji;
  if (formData.color !== undefined) updates.color = formData.color;
  if (formData.parentCategoryId !== undefined) {
    updates.parent_category_id = formData.parentCategoryId || null;
  }
  if (formData.defaultStoreId !== undefined) {
    updates.default_store_id = formData.defaultStoreId || null;
  }

  if (Object.keys(updates).length === 0) {
    return { error: null };
  }

  const { error } = await supabase
    .from("custom_ingredient_categories")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Delete a custom ingredient category (non-system only)
 * Note: Child categories will have their parent_category_id set to null (ON DELETE SET NULL)
 */
export async function deleteCustomIngredientCategory(id: string): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Get the category to verify it's not a system category
  const { data: category, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("household_id, is_system")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { error: "Category not found" };
  }

  // Verify household access
  if (category.household_id !== household.household_id) {
    return { error: "Unauthorized access to this category" };
  }

  // Prevent deletion of system categories
  if (category.is_system) {
    return { error: "Cannot delete system categories" };
  }

  // Delete the category (RLS policy ensures only non-system categories can be deleted)
  const { error } = await supabase
    .from("custom_ingredient_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Reorder custom ingredient categories
 */
export async function reorderCustomIngredientCategories(
  householdId: string,
  orderedIds: string[]
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household" };
  }

  const supabase = await createClient();

  // Update sort_order for each category
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_ingredient_categories")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  // Check for errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return { error: "Failed to reorder categories" };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Reassign shopping list items from one category to another
 */
export async function reassignItemsToCategory(
  fromCategoryId: string,
  toCategoryId: string
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify both categories belong to the user's household
  const { data: categories, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("id, household_id")
    .in("id", [fromCategoryId, toCategoryId]);

  if (fetchError || !categories || categories.length !== 2) {
    return { error: "Invalid categories" };
  }

  const allBelongToHousehold = categories.every(
    (c) => c.household_id === household.household_id
  );

  if (!allBelongToHousehold) {
    return { error: "Unauthorized access to categories" };
  }

  // Update all shopping list items
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ category_id: toCategoryId })
    .eq("category_id", fromCategoryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");

  return { error: null };
}
```

### custom-meal-types.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { CustomMealType, CustomMealTypeFormData } from "@/types/custom-meal-type";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapDbRowToMealType(row: {
  id: string;
  household_id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  default_time: string;
  sort_order: number;
  is_system: boolean;
  created_at: string;
}): CustomMealType {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    color: row.color,
    defaultTime: row.default_time,
    sortOrder: row.sort_order,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

export async function getCustomMealTypes(householdId: string): Promise<{
  error: string | null;
  data: CustomMealType[] | null;
}> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("custom_meal_types")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data.map(mapDbRowToMealType) };
}

export async function createCustomMealType(
  householdId: string,
  formData: CustomMealTypeFormData
): Promise<{ error: string | null; data: CustomMealType | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const slug = slugify(formData.name);

  if (!slug) {
    return { error: "Invalid meal type name", data: null };
  }

  const { data: existing } = await supabase
    .from("custom_meal_types")
    .select("id")
    .eq("household_id", householdId)
    .eq("slug", slug)
    .single();

  if (existing) {
    return { error: "A meal type with this name already exists", data: null };
  }

  const { data: maxSortOrder } = await supabase
    .from("custom_meal_types")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (maxSortOrder?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("custom_meal_types")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      default_time: formData.defaultTime,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null, data: mapDbRowToMealType(data) };
}

export async function updateCustomMealType(
  id: string,
  updates: Partial<CustomMealTypeFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
    updateData.slug = slugify(updates.name);

    if (!updateData.slug) {
      return { error: "Invalid meal type name" };
    }

    const { data: mealType } = await supabase
      .from("custom_meal_types")
      .select("household_id")
      .eq("id", id)
      .single();

    if (!mealType) {
      return { error: "Meal type not found" };
    }

    const { data: existing } = await supabase
      .from("custom_meal_types")
      .select("id")
      .eq("household_id", mealType.household_id)
      .eq("slug", updateData.slug)
      .neq("id", id)
      .single();

    if (existing) {
      return { error: "A meal type with this name already exists" };
    }
  }

  if (updates.emoji !== undefined) {
    updateData.emoji = updates.emoji;
  }

  if (updates.color !== undefined) {
    updateData.color = updates.color;
  }

  if (updates.defaultTime !== undefined) {
    updateData.default_time = updates.defaultTime;
  }

  const { error } = await supabase
    .from("custom_meal_types")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

export async function deleteCustomMealType(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: mealType } = await supabase
    .from("custom_meal_types")
    .select("is_system")
    .eq("id", id)
    .single();

  if (!mealType) {
    return { error: "Meal type not found" };
  }

  if (mealType.is_system) {
    return { error: "Cannot delete system meal types" };
  }

  const { error } = await supabase
    .from("custom_meal_types")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

export async function reorderCustomMealTypes(
  householdId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates = orderedIds.map((id, index) => ({
    id,
    household_id: householdId,
    sort_order: index,
  }));

  const { error } = await supabase.from("custom_meal_types").upsert(updates, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}
```

### custom-recipe-types.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { CustomRecipeType, CustomRecipeTypeFormData } from "@/types/custom-recipe-type";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";

const CUSTOM_RECIPE_TYPE_LIMIT = SUBSCRIPTION_TIERS.free.limits.customRecipeTypes;

/**
 * Get the current usage of custom recipe types for a household
 * Returns the count of custom (non-system) types and the limit
 */
export async function getCustomRecipeTypeUsage(householdId: string): Promise<{
  data: { count: number; limit: number } | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("custom_recipe_types")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("is_system", false);

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      count: count ?? 0,
      limit: CUSTOM_RECIPE_TYPE_LIMIT,
    },
  };
}

/**
 * Get all custom recipe types for a household
 */
export async function getCustomRecipeTypes(householdId: string): Promise<{
  data: CustomRecipeType[] | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Map database columns to camelCase
  const mappedData: CustomRecipeType[] = (data || []).map((item) => ({
    id: item.id,
    householdId: item.household_id,
    name: item.name,
    slug: item.slug,
    emoji: item.emoji,
    color: item.color,
    description: item.description,
    sortOrder: item.sort_order,
    isSystem: item.is_system,
    createdAt: item.created_at,
  }));

  return { error: null, data: mappedData };
}

/**
 * Create a new custom recipe type
 */
export async function createCustomRecipeType(
  householdId: string,
  formData: CustomRecipeTypeFormData
): Promise<{
  data: CustomRecipeType | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Check limit before creating
  const { count: existingCount, error: countError } = await supabase
    .from("custom_recipe_types")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("is_system", false);

  if (countError) {
    return { error: countError.message, data: null };
  }

  if ((existingCount ?? 0) >= CUSTOM_RECIPE_TYPE_LIMIT) {
    return {
      error: `You've reached the maximum of ${CUSTOM_RECIPE_TYPE_LIMIT} custom recipe types. Delete an existing type to add a new one.`,
      data: null,
    };
  }

  // Generate slug from name
  const slug = formData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Get the max sort_order to append new type at the end
  const { data: existingTypes } = await supabase
    .from("custom_recipe_types")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingTypes && existingTypes.length > 0
    ? existingTypes[0].sort_order + 1
    : 0;

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      description: formData.description || null,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomRecipeType = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    emoji: data.emoji,
    color: data.color,
    description: data.description,
    sortOrder: data.sort_order,
    isSystem: data.is_system,
    createdAt: data.created_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null, data: mappedData };
}

/**
 * Update an existing custom recipe type
 */
export async function updateCustomRecipeType(
  id: string,
  updates: Partial<CustomRecipeTypeFormData>
): Promise<{
  data: CustomRecipeType | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Build update object with snake_case keys
  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
    // Regenerate slug if name changes
    updateData.slug = updates.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  if (updates.emoji !== undefined) updateData.emoji = updates.emoji;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.description !== undefined) updateData.description = updates.description || null;

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomRecipeType = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    emoji: data.emoji,
    color: data.color,
    description: data.description,
    sortOrder: data.sort_order,
    isSystem: data.is_system,
    createdAt: data.created_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null, data: mappedData };
}

/**
 * Delete a custom recipe type (only non-system types)
 */
export async function deleteCustomRecipeType(id: string): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // First check if it's a system type
  const { data: recipeType } = await supabase
    .from("custom_recipe_types")
    .select("is_system")
    .eq("id", id)
    .single();

  if (recipeType?.is_system) {
    return { error: "Cannot delete system recipe types" };
  }

  const { error } = await supabase
    .from("custom_recipe_types")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reorder custom recipe types
 */
export async function reorderCustomRecipeTypes(
  householdId: string,
  orderedIds: string[]
): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Update sort_order for each type
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_recipe_types")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  const firstError = results.find((result) => result.error);
  if (firstError?.error) {
    return { error: firstError.error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reassign all recipes from one type to another (useful when deleting)
 */
export async function reassignRecipesToType(
  fromTypeId: string,
  toTypeId: string
): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ recipe_type_id: toTypeId })
    .eq("recipe_type_id", fromTypeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");

  return { error: null };
}
```

### export.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/types/recipe";
import type {
  ImportValidationResult,
  ImportResult,
  DuplicateHandling,
} from "@/types/export";

/**
 * Import recipes from parsed validation results
 */
export async function importRecipes(
  validationResults: ImportValidationResult[],
  duplicateHandling: DuplicateHandling
): Promise<ImportResult> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      replaced: 0,
      failed: 0,
      errors: [{ title: "Authentication", error: "Not authenticated" }],
    };
  }

  // Get user's household for shared recipes
  const { data: memberData } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  const householdId = memberData?.household_id || null;

  // Get existing recipe titles for duplicate handling
  const { data: existingRecipes } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("user_id", user.id);

  const existingRecipeMap = new Map(
    (existingRecipes || []).map((r) => [r.title.toLowerCase().trim(), r.id])
  );

  let imported = 0;
  let skipped = 0;
  let replaced = 0;
  let failed = 0;
  const errors: ImportResult["errors"] = [];

  for (const result of validationResults) {
    // Skip invalid recipes
    if (!result.isValid || !result.parsedRecipe) {
      failed++;
      errors.push({
        title: result.title,
        error: result.errors.join(", "),
      });
      continue;
    }

    const normalizedTitle = result.title.toLowerCase().trim();
    const existingId = existingRecipeMap.get(normalizedTitle);
    const isDuplicate = !!existingId;

    try {
      if (isDuplicate) {
        switch (duplicateHandling) {
          case "skip":
            skipped++;
            continue;

          case "replace":
            // Delete existing and insert new
            await supabase.from("recipes").delete().eq("id", existingId);

            const { error: replaceError } = await supabase
              .from("recipes")
              .insert({
                ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
                title: result.title,
              });

            if (replaceError) {
              failed++;
              errors.push({ title: result.title, error: replaceError.message });
            } else {
              replaced++;
            }
            break;

          case "keep_both":
            // Insert with modified title
            const { error: keepBothError } = await supabase
              .from("recipes")
              .insert({
                ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
                title: `${result.title} (imported)`,
              });

            if (keepBothError) {
              failed++;
              errors.push({ title: result.title, error: keepBothError.message });
            } else {
              imported++;
            }
            break;
        }
      } else {
        // Insert new recipe
        const { error: insertError } = await supabase.from("recipes").insert({
          ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
          title: result.title,
        });

        if (insertError) {
          failed++;
          errors.push({ title: result.title, error: insertError.message });
        } else {
          imported++;
        }
      }
    } catch (error) {
      failed++;
      errors.push({
        title: result.title,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    success: failed === 0 || imported + replaced > 0,
    imported,
    skipped,
    replaced,
    failed,
    errors,
  };
}

/**
 * Prepare a parsed recipe for database insertion
 */
function prepareRecipeForInsert(
  recipe: Partial<Recipe>,
  userId: string,
  householdId: string | null
): Omit<Recipe, "id" | "created_at" | "updated_at"> {
  return {
    title: recipe.title || "Untitled Recipe",
    recipe_type: recipe.recipe_type || "Dinner",
    category: recipe.category || null,
    protein_type: recipe.protein_type || null,
    prep_time: recipe.prep_time || null,
    cook_time: recipe.cook_time || null,
    servings: recipe.servings || null,
    base_servings: recipe.base_servings || null,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    tags: recipe.tags || [],
    notes: recipe.notes || null,
    source_url: recipe.source_url || null,
    image_url: recipe.image_url || null,
    rating: recipe.rating || null,
    allergen_tags: recipe.allergen_tags || [],
    user_id: userId,
    household_id: householdId,
    is_shared_with_household: true,
    is_public: false,
    share_token: null,
    view_count: 0,
    original_recipe_id: null,
    original_author_id: null,
    avg_rating: null,
    review_count: 0,
  };
}

/**
 * Get all recipe titles for the current user (for duplicate detection)
 */
export async function getExistingRecipeTitles(): Promise<{
  titles: string[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { titles: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("title")
    .eq("user_id", user.id);

  if (error) {
    return { titles: [], error: error.message };
  }

  return {
    titles: (data || []).map((r) => r.title.toLowerCase().trim()),
  };
}

/**
 * Get all recipes with nutrition for bulk export
 */
export async function getRecipesForExport(): Promise<{
  recipes: Recipe[];
  nutritionMap: Record<string, Record<string, unknown>>;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { recipes: [], nutritionMap: {}, error: "Not authenticated" };
  }

  // Get all user's recipes
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("title", { ascending: true });

  if (recipesError) {
    return { recipes: [], nutritionMap: {}, error: recipesError.message };
  }

  // Get nutrition for all recipes
  const recipeIds = (recipes || []).map((r) => r.id);
  const { data: nutritionData } = await supabase
    .from("recipe_nutrition")
    .select("*")
    .in("recipe_id", recipeIds);

  // Build nutrition map
  const nutritionMap: Record<string, Record<string, unknown>> = {};
  for (const nutrition of nutritionData || []) {
    nutritionMap[nutrition.recipe_id] = nutrition;
  }

  return {
    recipes: recipes || [],
    nutritionMap,
  };
}
```

### feedback.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubmitFeedbackData {
  content: string;
}

export interface FeedbackResult {
  data: { id: string } | null;
  error: string | null;
}

/**
 * Submit user feedback
 * Simple, low-friction submission with minimal fields
 */
export async function submitFeedback(
  data: SubmitFeedbackData
): Promise<FeedbackResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in to submit feedback" };
  }

  // Validate content length
  const content = data.content.trim();
  if (content.length < 10) {
    return { data: null, error: "Feedback must be at least 10 characters" };
  }
  if (content.length > 2000) {
    return { data: null, error: "Feedback must be less than 2000 characters" };
  }

  const { data: feedback, error } = await supabase
    .from("user_feedback")
    .insert({
      user_id: user.id,
      content,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error submitting feedback:", error);
    return { data: null, error: "Failed to submit feedback. Please try again." };
  }

  return { data: { id: feedback.id }, error: null };
}
```

### folders.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  RecipeFolder,
  FolderWithChildren,
  FolderFormData,
  FolderCategory,
  FolderCategoryWithFolders,
  FolderCategoryFormData,
} from "@/types/folder";

// =====================================================
// GET OPERATIONS
// =====================================================

/**
 * Get all folders for the current household (with children nested)
 */
export async function getFolders(): Promise<{
  error: string | null;
  data: FolderWithChildren[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all folders for household with cover recipe image
  const { data: folders, error } = await supabase
    .from("recipe_folders")
    .select(
      `
      *,
      cover_recipe:recipes!recipe_folders_cover_recipe_id_fkey(image_url)
    `
    )
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get recipe counts per folder
  const { data: memberCounts } = await supabase
    .from("recipe_folder_members")
    .select("folder_id")
    .in(
      "folder_id",
      folders.map((f) => f.id)
    );

  const countMap = new Map<string, number>();
  memberCounts?.forEach((m) => {
    countMap.set(m.folder_id, (countMap.get(m.folder_id) || 0) + 1);
  });

  // Build tree structure
  const folderMap = new Map<string, FolderWithChildren>();
  const rootFolders: FolderWithChildren[] = [];

  // First pass: create folder objects
  folders.forEach((folder) => {
    const coverRecipe = folder.cover_recipe as { image_url: string | null } | null;
    const folderWithChildren: FolderWithChildren = {
      id: folder.id,
      household_id: folder.household_id,
      created_by_user_id: folder.created_by_user_id,
      name: folder.name,
      emoji: folder.emoji,
      color: folder.color,
      parent_folder_id: folder.parent_folder_id,
      cover_recipe_id: folder.cover_recipe_id,
      category_id: folder.category_id,
      sort_order: folder.sort_order,
      is_smart: folder.is_smart ?? false,
      smart_filters: folder.smart_filters ?? null,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      children: [],
      recipe_count: countMap.get(folder.id) || 0,
      cover_image_url: coverRecipe?.image_url || null,
    };
    folderMap.set(folder.id, folderWithChildren);
  });

  // Second pass: build tree
  folders.forEach((folder) => {
    const folderWithChildren = folderMap.get(folder.id)!;
    if (folder.parent_folder_id) {
      const parent = folderMap.get(folder.parent_folder_id);
      if (parent) {
        parent.children.push(folderWithChildren);
      }
    } else {
      rootFolders.push(folderWithChildren);
    }
  });

  return { error: null, data: rootFolders };
}

/**
 * Get a single folder by ID
 */
export async function getFolder(
  id: string
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folders")
    .select("*")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as RecipeFolder };
}

/**
 * Get all recipe IDs in a folder
 */
export async function getFolderRecipeIds(
  folderId: string
): Promise<{ error: string | null; data: string[] }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folder_members")
    .select("recipe_id")
    .eq("folder_id", folderId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((m) => m.recipe_id) };
}

/**
 * Get all folder IDs that contain a recipe
 */
export async function getRecipeFolderIds(
  recipeId: string
): Promise<{ error: string | null; data: string[] }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folder_members")
    .select("folder_id")
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((m) => m.folder_id) };
}

// =====================================================
// CREATE/UPDATE/DELETE OPERATIONS
// =====================================================

/**
 * Create a new folder
 */
export async function createFolder(
  formData: FolderFormData
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Validate max depth (parent cannot have a parent)
  if (formData.parent_folder_id) {
    const parentResult = await getFolder(formData.parent_folder_id);
    if (parentResult.data?.parent_folder_id) {
      return { error: "Maximum folder depth is 2 levels", data: null };
    }
  }

  const supabase = await createClient();

  // Get max sort_order for new folder position
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .is("parent_folder_id", formData.parent_folder_id ?? null)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existingFolders?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("recipe_folders")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: formData.name,
      emoji: formData.emoji || null,
      color: formData.color || null,
      parent_folder_id: formData.parent_folder_id || null,
      cover_recipe_id: formData.cover_recipe_id || null,
      category_id: formData.category_id || null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: data as RecipeFolder };
}

/**
 * Update an existing folder
 */
export async function updateFolder(
  id: string,
  formData: Partial<FolderFormData>
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
  if (formData.color !== undefined) updateData.color = formData.color || null;
  if (formData.cover_recipe_id !== undefined) {
    updateData.cover_recipe_id = formData.cover_recipe_id || null;
  }
  if (formData.category_id !== undefined) {
    updateData.category_id = formData.category_id || null;
  }

  const { data, error } = await supabase
    .from("recipe_folders")
    .update(updateData)
    .eq("id", id)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: data as RecipeFolder };
}

/**
 * Duplicate a folder (creates a copy with same properties and recipes)
 */
export async function duplicateFolder(
  folderId: string
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get the folder to duplicate
  const { data: originalFolder, error: fetchError } = await supabase
    .from("recipe_folders")
    .select("*")
    .eq("id", folderId)
    .eq("household_id", household.household_id)
    .single();

  if (fetchError || !originalFolder) {
    return { error: "Folder not found", data: null };
  }

  // Get recipe members from the original folder
  const { data: recipeMembers } = await supabase
    .from("recipe_folder_members")
    .select("recipe_id")
    .eq("folder_id", folderId);

  // Generate unique name for copy
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("name")
    .eq("household_id", household.household_id)
    .like("name", `${originalFolder.name}%`);

  let copyNumber = 1;
  let newName = `${originalFolder.name} (Copy)`;

  // Check for existing copies and increment number
  while (existingFolders?.some(f => f.name === newName)) {
    copyNumber++;
    newName = `${originalFolder.name} (Copy ${copyNumber})`;
  }

  // Get max sort_order for new folder
  const { data: sortOrderFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .is("parent_folder_id", originalFolder.parent_folder_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = sortOrderFolders?.[0]?.sort_order ?? 0;

  // Create the duplicate folder
  const { data: newFolder, error: createError } = await supabase
    .from("recipe_folders")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: newName,
      emoji: originalFolder.emoji,
      color: originalFolder.color,
      parent_folder_id: originalFolder.parent_folder_id,
      category_id: originalFolder.category_id,
      cover_recipe_id: originalFolder.cover_recipe_id,
      sort_order: maxOrder + 1,
      is_smart: false, // Duplicates are always regular folders
      smart_filters: null,
    })
    .select()
    .single();

  if (createError || !newFolder) {
    return { error: createError?.message || "Failed to create folder", data: null };
  }

  // Copy recipe memberships if there are any
  if (recipeMembers && recipeMembers.length > 0) {
    const memberInserts = recipeMembers.map(member => ({
      folder_id: newFolder.id,
      recipe_id: member.recipe_id,
    }));

    await supabase
      .from("recipe_folder_members")
      .insert(memberInserts);
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: newFolder as RecipeFolder };
}

/**
 * Delete a folder (cascade deletes children and memberships)
 */
export async function deleteFolder(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipe_folders")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null };
}

// =====================================================
// RECIPE-FOLDER MEMBERSHIP OPERATIONS
// =====================================================

/**
 * Add a recipe to a folder
 */
export async function addRecipeToFolder(
  recipeId: string,
  folderId: string
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("recipe_folder_members").insert({
    folder_id: folderId,
    recipe_id: recipeId,
    added_by_user_id: user.id,
  });

  if (error) {
    // Handle unique constraint violation (already in folder)
    if (error.code === "23505") {
      return { error: null }; // Silently succeed if already in folder
    }
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

/**
 * Remove a recipe from a folder
 */
export async function removeRecipeFromFolder(
  recipeId: string,
  folderId: string
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipe_folder_members")
    .delete()
    .eq("folder_id", folderId)
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

/**
 * Set all folders for a recipe (replaces existing memberships)
 */
export async function setRecipeFolders(
  recipeId: string,
  folderIds: string[]
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Remove all existing memberships for this recipe
  await supabase
    .from("recipe_folder_members")
    .delete()
    .eq("recipe_id", recipeId);

  // Add new memberships
  if (folderIds.length > 0) {
    const { error } = await supabase.from("recipe_folder_members").insert(
      folderIds.map((folderId) => ({
        folder_id: folderId,
        recipe_id: recipeId,
        added_by_user_id: user.id,
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

// =====================================================
// DEFAULT FOLDER CREATION
// =====================================================

/**
 * Create default folders for a household (called on signup or first access)
 */
export async function createDefaultFolders(): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Check if folders already exist
  const { count } = await supabase
    .from("recipe_folders")
    .select("id", { count: "exact", head: true })
    .eq("household_id", household.household_id);

  if (count && count > 0) {
    return { error: null }; // Folders already exist
  }

  // Call the database function to create defaults
  const { error } = await supabase.rpc("create_default_folders_for_household", {
    p_household_id: household.household_id,
    p_user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

// =====================================================
// FOLDER CATEGORY OPERATIONS
// =====================================================

/**
 * Get all folder categories with their folders
 */
export async function getFolderCategories(): Promise<{
  error: string | null;
  data: FolderCategoryWithFolders[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from("folder_categories")
    .select("*")
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: true });

  if (catError) {
    return { error: catError.message, data: null };
  }

  // Get all folders (reuse existing getFolders logic)
  const foldersResult = await getFolders();
  if (foldersResult.error) {
    return { error: foldersResult.error, data: null };
  }

  const allFolders = foldersResult.data || [];

  // Group folders by category
  const categoriesWithFolders: FolderCategoryWithFolders[] = categories.map((cat) => ({
    ...cat,
    folders: allFolders.filter((f) => f.category_id === cat.id),
  }));

  // Add uncategorized folders to a virtual "Uncategorized" group at the end
  const uncategorizedFolders = allFolders.filter((f) => f.category_id === null);
  if (uncategorizedFolders.length > 0) {
    categoriesWithFolders.push({
      id: "uncategorized",
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: "Uncategorized",
      emoji: null,
      is_system: true, // Can't delete
      sort_order: 9999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      folders: uncategorizedFolders,
    });
  }

  return { error: null, data: categoriesWithFolders };
}

/**
 * Create a new folder category
 */
export async function createFolderCategory(
  formData: FolderCategoryFormData
): Promise<{ error: string | null; data: FolderCategory | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get max sort_order
  const { data: existingCats } = await supabase
    .from("folder_categories")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existingCats?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("folder_categories")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: formData.name,
      emoji: formData.emoji || null,
      is_system: false,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`);
  return { error: null, data: data as FolderCategory };
}

/**
 * Update a folder category
 */
export async function updateFolderCategory(
  id: string,
  formData: Partial<FolderCategoryFormData>
): Promise<{ error: string | null; data: FolderCategory | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Can't update the virtual "uncategorized" category
  if (id === "uncategorized") {
    return { error: "Cannot update this category", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;

  const { data, error } = await supabase
    .from("folder_categories")
    .update(updateData)
    .eq("id", id)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`);
  return { error: null, data: data as FolderCategory };
}

/**
 * Delete a folder category (moves folders to uncategorized)
 */
export async function deleteFolderCategory(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  // Can't delete the virtual "uncategorized" category
  if (id === "uncategorized") {
    return { error: "Cannot delete this category" };
  }

  const supabase = await createClient();

  // Check if it's a system category
  const { data: category } = await supabase
    .from("folder_categories")
    .select("is_system")
    .eq("id", id)
    .single();

  if (category?.is_system) {
    return { error: "Cannot delete system categories" };
  }

  // Move all folders in this category to uncategorized (null)
  await supabase
    .from("recipe_folders")
    .update({ category_id: null })
    .eq("category_id", id);

  // Delete the category
  const { error } = await supabase
    .from("folder_categories")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`);
  return { error: null };
}

/**
 * Create default categories for a household
 */
export async function createDefaultFolderCategories(): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Check if categories already exist
  const { count } = await supabase
    .from("folder_categories")
    .select("id", { count: "exact", head: true })
    .eq("household_id", household.household_id);

  if (count && count > 0) {
    return { error: null }; // Categories already exist
  }

  // Call the database function to create defaults
  const { error } = await supabase.rpc("create_default_folder_categories_for_household", {
    p_household_id: household.household_id,
    p_user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}
```

### follows.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserProfile, ActivityFeedItem } from "@/types/social";

// Follow a user
export async function followUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to follow users" };
  }

  if (user.id === userId) {
    return { success: false, error: "Cannot follow yourself" };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Already following this user" };
    }
    console.error("Error following user:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Unfollow a user
export async function unfollowUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);

  if (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Check if following a user
export async function isFollowingUser(
  userId: string
): Promise<{ isFollowing: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isFollowing: false, error: null };
  }

  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking follow status:", error);
    return { isFollowing: false, error: error.message };
  }

  return { isFollowing: !!data, error: null };
}

// Get followers of a user
export async function getFollowers(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      follower:profiles!follows_follower_id_fkey (
        id,
        username,
        first_name,
        last_name,
        bio,
        avatar_url,
        public_profile,
        follower_count,
        following_count
      )
    `
    )
    .eq("following_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching followers:", error);
    return { data: null, error: error.message };
  }

  // Transform to UserProfile type with is_following check
  const followingSet = new Set<string>();

  if (user) {
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (following) {
      following.forEach((f) => followingSet.add(f.following_id));
    }
  }

  const profiles: UserProfile[] = (data || []).map((item) => {
    const f = item.follower as unknown as {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      public_profile: boolean;
      follower_count: number;
      following_count: number;
    };
    return {
      id: f.id,
      username: f.username,
      name: [f.first_name, f.last_name].filter(Boolean).join(" ") || null,
      first_name: f.first_name,
      last_name: f.last_name,
      bio: f.bio,
      avatar_url: f.avatar_url,
      public_profile: f.public_profile,
      follower_count: f.follower_count,
      following_count: f.following_count,
      is_following: followingSet.has(f.id),
      created_at: "",
    };
  });

  return { data: profiles, error: null };
}

// Get users that a user is following
export async function getFollowing(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      following:profiles!follows_following_id_fkey (
        id,
        username,
        first_name,
        last_name,
        bio,
        avatar_url,
        public_profile,
        follower_count,
        following_count
      )
    `
    )
    .eq("follower_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching following:", error);
    return { data: null, error: error.message };
  }

  // Transform to UserProfile type
  const followingSet = new Set<string>();

  if (user) {
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (following) {
      following.forEach((f) => followingSet.add(f.following_id));
    }
  }

  const profiles: UserProfile[] = (data || []).map((item) => {
    const f = item.following as unknown as {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      public_profile: boolean;
      follower_count: number;
      following_count: number;
    };
    return {
      id: f.id,
      username: f.username,
      name: [f.first_name, f.last_name].filter(Boolean).join(" ") || null,
      first_name: f.first_name,
      last_name: f.last_name,
      bio: f.bio,
      avatar_url: f.avatar_url,
      public_profile: f.public_profile,
      follower_count: f.follower_count,
      following_count: f.following_count,
      is_following: followingSet.has(f.id),
      created_at: "",
    };
  });

  return { data: profiles, error: null };
}

// Get activity feed
export async function getActivityFeed(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: ActivityFeedItem[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in to view the feed" };
  }

  const { data, error } = await supabase.rpc("get_activity_feed", {
    p_user_id: user.id,
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
  });

  if (error) {
    console.error("Error fetching activity feed:", error);
    return { data: null, error: error.message };
  }

  // Transform to ActivityFeedItem type
  const items: ActivityFeedItem[] = (data || []).map((item: {
    id: string;
    actor_id: string;
    event_type: "new_recipe" | "review" | "cook_logged";
    recipe_id: string | null;
    is_public: boolean;
    created_at: string;
    actor_username: string;
    actor_avatar_url: string | null;
    recipe_title: string | null;
    recipe_image_url: string | null;
  }) => ({
    id: item.id,
    actor_id: item.actor_id,
    event_type: item.event_type,
    recipe_id: item.recipe_id,
    is_public: item.is_public,
    created_at: item.created_at,
    actor: {
      id: item.actor_id,
      username: item.actor_username,
      avatar_url: item.actor_avatar_url,
    },
    recipe: item.recipe_id
      ? {
          id: item.recipe_id,
          title: item.recipe_title || "",
          image_url: item.recipe_image_url,
        }
      : null,
  }));

  return { data: items, error: null };
}

// Get user profile by username
export async function getUserByUsername(
  username: string
): Promise<{ data: UserProfile | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      first_name,
      last_name,
      bio,
      avatar_url,
      public_profile,
      follower_count,
      following_count,
      created_at
    `
    )
    .eq("username", username)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { data: null, error: "User not found" };
    }
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }

  // Check if current user is following
  let isFollowing = false;
  if (user && user.id !== data.id) {
    const { data: follow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", data.id)
      .single();

    isFollowing = !!follow;
  }

  // Get public recipe count
  const { count } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.id)
    .eq("is_public", true);

  const profile: UserProfile = {
    id: data.id,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    bio: data.bio,
    avatar_url: data.avatar_url,
    public_profile: data.public_profile,
    follower_count: data.follower_count,
    following_count: data.following_count,
    public_recipe_count: count || 0,
    is_following: isFollowing,
    created_at: data.created_at,
  };

  return { data: profile, error: null };
}

// Get public recipes by a user
export async function getUserPublicRecipes(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  data: { id: string; title: string; image_url: string | null; view_count: number }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, view_count")
    .eq("user_id", userId)
    .eq("is_public", true)
    .eq("hidden_from_public", false)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user recipes:", error);
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}
```

### household-invitations.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import {
  generateInvitationHTML,
  generateInvitationText,
} from "@/lib/email/invitation-template";

// Initialize Resend lazily to avoid errors during build
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  email: string;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "declined";
  expires_at: string;
  created_at: string;
}

export interface HouseholdInvitationWithInviter extends HouseholdInvitation {
  inviter: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

/**
 * Send a household invitation to an email address
 */
export async function sendHouseholdInvitation(email: string): Promise<{
  error: string | null;
  data: HouseholdInvitation | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Only owners can invite new members
  if (membership?.role !== "owner") {
    return { error: "Only household owners can invite members", data: null };
  }

  // Validate email format with stricter regex
  // Requires: local part, @ symbol, domain with at least one dot, TLD of 2+ chars
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format", data: null };
  }

  // Additional check: email length should be reasonable
  if (email.length > 254) {
    return { error: "Email address too long", data: null };
  }

  const supabase = await createClient();

  // Check if user is already a member of this household
  // Use maybeSingle since user might not exist yet
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existingProfile) {
    // Use maybeSingle since they might not be a member yet
    const { data: existingMember } = await supabase
      .from("household_members")
      .select("id")
      .eq("household_id", householdId)
      .eq("user_id", existingProfile.id)
      .maybeSingle();

    if (existingMember) {
      return { error: "This user is already a member of your household", data: null };
    }
  }

  // Check for existing pending invitation (might not exist - use maybeSingle)
  const { data: existingInvite } = await supabase
    .from("household_invitations")
    .select("id, status")
    .eq("household_id", householdId)
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return { error: "An invitation has already been sent to this email", data: null };
  }

  // Generate secure token and set expiration (7 days)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create the invitation
  const { data: invitation, error } = await supabase
    .from("household_invitations")
    .insert({
      household_id: householdId,
      email: email.toLowerCase(),
      invited_by: user.id,
      token,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    return { error: error.message, data: null };
  }

  // Get inviter's profile for the email (should exist but use maybeSingle for safety)
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const inviterName =
    inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : inviterProfile?.first_name || inviterProfile?.email || "Someone";

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const inviteLink = `${baseUrl}/invite/${token}`;

  // Send email notification
  try {
    const resend = getResendClient();
    const html = generateInvitationHTML({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });
    const text = generateInvitationText({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });

    // Personalized from name with reply-to for direct responses
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const personalizedFrom = `${inviterName} via Babe What's For Dinner <${fromEmail.includes("<") ? fromEmail.match(/<(.+)>/)?.[1] || "noreply@babewfd.com" : fromEmail}>`;

    const { error: emailError } = await resend.emails.send({
      from: personalizedFrom,
      to: email.toLowerCase(),
      subject: `${inviterName} invited you to join their household`,
      replyTo: inviterProfile?.email || undefined,
      html,
      text,
    });

    if (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the invitation creation, just log the error
      // The user can still use the copy link feature
    }
  } catch (emailErr) {
    console.error("Failed to send invitation email:", emailErr);
    // Don't fail the invitation creation
  }

  revalidatePath("/app/settings/household");

  return { error: null, data: invitation };
}

/**
 * Get all pending invitations for the household
 */
export async function getHouseholdInvitations(): Promise<{
  error: string | null;
  data: HouseholdInvitationWithInviter[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_invitations")
    .select(`
      *,
      inviter:invited_by(
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as HouseholdInvitationWithInviter[] };
}

/**
 * Cancel a pending invitation
 */
export async function cancelHouseholdInvitation(invitationId: string): Promise<{
  error: string | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  // Only owners can cancel invitations
  if (membership?.role !== "owner") {
    return { error: "Only household owners can cancel invitations" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("household_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId)
    .eq("household_id", householdId)
    .eq("status", "pending");

  if (error) {
    console.error("Error cancelling invitation:", error);
    return { error: error.message };
  }

  revalidatePath("/app/settings/household");

  return { error: null };
}

/**
 * Resend an invitation (creates a new token and extends expiration)
 */
export async function resendHouseholdInvitation(invitationId: string): Promise<{
  error: string | null;
  data: HouseholdInvitation | null;
}> {
  const { user, householdId, membership } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Only owners can resend invitations
  if (membership?.role !== "owner") {
    return { error: "Only household owners can resend invitations", data: null };
  }

  const supabase = await createClient();

  // Generate new token and extend expiration
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("household_invitations")
    .update({
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .eq("id", invitationId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error resending invitation:", error);
    return { error: error.message, data: null };
  }

  // Get inviter's profile for the email (should exist but use maybeSingle for safety)
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const inviterName =
    inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : inviterProfile?.first_name || inviterProfile?.email || "Someone";

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const inviteLink = `${baseUrl}/invite/${token}`;

  // Send email notification
  try {
    const resend = getResendClient();
    const html = generateInvitationHTML({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });
    const text = generateInvitationText({
      inviterName,
      inviteLink,
      expiresInDays: 7,
    });

    // Personalized from name with reply-to for direct responses
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const personalizedFrom = `${inviterName} via Babe What's For Dinner <${fromEmail.includes("<") ? fromEmail.match(/<(.+)>/)?.[1] || "noreply@babewfd.com" : fromEmail}>`;

    const { error: emailError } = await resend.emails.send({
      from: personalizedFrom,
      to: data.email,
      subject: `${inviterName} invited you to join their household`,
      replyTo: inviterProfile?.email || undefined,
      html,
      text,
    });

    if (emailError) {
      console.error("Error resending invitation email:", emailError);
    }
  } catch (emailErr) {
    console.error("Failed to resend invitation email:", emailErr);
  }

  revalidatePath("/app/settings/household");

  return { error: null, data };
}

/**
 * Accept a household invitation (called when a user clicks the invite link)
 */
export async function acceptHouseholdInvitation(token: string): Promise<{
  error: string | null;
  householdId: string | null;
}> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to accept an invitation", householdId: null };
  }

  // Find the invitation using SECURITY DEFINER function
  // This function only returns pending, non-expired invitations
  const { data: invitations, error: inviteError } = await supabase
    .rpc("get_invitation_by_token", { p_token: token });

  if (inviteError) {
    console.error("Error looking up invitation:", inviteError);
    return { error: "Invalid or expired invitation", householdId: null };
  }

  const invitation = invitations?.[0];
  if (!invitation) {
    return { error: "Invalid or expired invitation", householdId: null };
  }

  // Check if user is already in a household (might not be - use maybeSingle)
  const { data: existingMembership } = await supabase
    .from("household_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    return { error: "You are already a member of a household", householdId: null };
  }

  // Add user to household
  const { error: memberError } = await supabase
    .from("household_members")
    .insert({
      household_id: invitation.household_id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    console.error("Error adding member:", memberError);
    return { error: memberError.message, householdId: null };
  }

  // Mark invitation as accepted
  await supabase
    .from("household_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  revalidatePath("/app");
  revalidatePath("/app/settings/household");

  return { error: null, householdId: invitation.household_id };
}

/**
 * Get the invitation link URL for sharing
 */
export async function getInvitationLink(token: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  return `${baseUrl}/invite/${token}`;
}
```

### household-permissions.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { PermissionMode, HouseholdRole, HouseholdSettings } from "@/types/household-permissions";

// ============================================================================
// Get Household Permissions
// ============================================================================

export async function getHouseholdPermissions() {
  const { user, household, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !householdId || !membership) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  const { data: householdData, error } = await supabase
    .from("households")
    .select("id, name, permission_mode, household_settings")
    .eq("id", householdId)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      householdId: householdData.id,
      householdName: householdData.name,
      permissionMode: householdData.permission_mode as PermissionMode,
      settings: householdData.household_settings as HouseholdSettings,
      userRole: membership.role as HouseholdRole,
    },
  };
}

// ============================================================================
// Update Permission Mode
// ============================================================================

export async function updatePermissionMode(mode: PermissionMode) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change permission mode
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change permission mode" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ permission_mode: mode })
    .eq("id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Update Member Role
// ============================================================================

export async function updateMemberRole(memberId: string, role: HouseholdRole) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change member roles
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change member roles" };
  }

  // Cannot change the owner's role
  const supabase = await createClient();

  const { data: targetMember } = await supabase
    .from("household_members")
    .select("user_id, role")
    .eq("id", memberId)
    .eq("household_id", householdId)
    .single();

  if (targetMember?.role === "owner") {
    return { error: "Cannot change the owner's role" };
  }

  const { error } = await supabase
    .from("household_members")
    .update({ role })
    .eq("id", memberId)
    .eq("household_id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Update Household Settings
// ============================================================================

export async function updateHouseholdSettings(settings: HouseholdSettings) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change household settings
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change household settings" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ household_settings: settings })
    .eq("id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Get Household Contribution Stats
// ============================================================================

export async function getHouseholdContributionStats() {
  const { user, householdId, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get member contributions from various sources
  const { data: members } = await supabase
    .from("household_members")
    .select(`
      user_id,
      role,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq("household_id", householdId);

  if (!members) {
    return { error: "Failed to fetch members", data: null };
  }

  // Get cooking history counts
  const { data: cookingStats } = await supabase
    .from("cooking_history")
    .select("cooked_by")
    .eq("household_id", householdId);

  // Get recipe creation counts
  const { data: recipeStats } = await supabase
    .from("recipes")
    .select("user_id")
    .eq("household_id", householdId);

  // Get meal plan assignment counts
  const { data: mealPlanStats } = await supabase
    .from("meal_assignments")
    .select(`
      cook,
      meal_plan_id,
      meal_plans!inner (household_id)
    `)
    .eq("meal_plans.household_id", householdId);

  // Aggregate stats by user
  const stats = members.map((member) => {
    const userId = member.user_id;
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

    return {
      userId,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      email: profile?.email,
      role: member.role,
      recipesCreated: recipeStats?.filter((r) => r.user_id === userId).length || 0,
      mealsCooked: cookingStats?.filter((c) => c.cooked_by === userId).length || 0,
      mealsPlanned: mealPlanStats?.filter((m) => m.cook === userId).length || 0,
    };
  });

  return {
    error: null,
    data: stats,
  };
}
```

### household.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CookingSchedule,
  CookingScheduleFormData,
  CookingScheduleWithUser,
  MemberDietaryProfile,
  MemberDietaryProfileFormData,
  HouseholdActivity,
  HouseholdActivityWithUser,
  HouseholdActivityType,
  AggregatedDietaryRestrictions,
  HouseholdMemberWithProfile,
  TodaysCook,
  ScheduleMealType,
} from "@/types/household";

// ============================================================================
// COOKING SCHEDULES
// ============================================================================

/**
 * Get all cooking schedules for the user's household
 */
export async function getCookingSchedules(): Promise<{
  error: string | null;
  data: CookingScheduleWithUser[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_schedules")
    .select(`
      *,
      user:assigned_user_id(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .order("day_of_week")
    .order("meal_type");

  if (error) {
    console.error("Error fetching cooking schedules:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as CookingScheduleWithUser[] };
}

/**
 * Update or create a cooking schedule entry
 */
export async function upsertCookingSchedule(
  formData: CookingScheduleFormData
): Promise<{ error: string | null; data: CookingSchedule | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_schedules")
    .upsert(
      {
        household_id: householdId,
        day_of_week: formData.day_of_week,
        meal_type: formData.meal_type,
        assigned_user_id: formData.assigned_user_id,
        assigned_cook_name: formData.assigned_cook_name,
        is_rotating: formData.is_rotating ?? false,
      },
      {
        onConflict: "household_id,day_of_week,meal_type",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting cooking schedule:", error);
    return { error: error.message, data: null };
  }

  // Log activity
  await logHouseholdActivity({
    activity_type: "schedule_updated",
    entity_type: "cooking_schedule",
    entity_id: data.id,
    metadata: {
      day_of_week: formData.day_of_week,
      meal_type: formData.meal_type,
    },
  });

  revalidatePath("/app/settings/household");
  revalidatePath("/app/plan");
  revalidatePath("/app");

  return { error: null, data };
}

/**
 * Delete a cooking schedule entry
 */
export async function deleteCookingSchedule(
  dayOfWeek: number,
  mealType: ScheduleMealType
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("cooking_schedules")
    .delete()
    .eq("household_id", householdId)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType);

  if (error) {
    console.error("Error deleting cooking schedule:", error);
    return { error: error.message };
  }

  revalidatePath("/app/settings/household");
  revalidatePath("/app/plan");

  return { error: null };
}

/**
 * Get today's cook for the household
 */
export async function getTodaysCook(
  mealType: ScheduleMealType = "dinner"
): Promise<{ error: string | null; data: TodaysCook | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Calculate today's day of week (0 = Monday)
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  const { data, error } = await supabase
    .from("cooking_schedules")
    .select(`
      assigned_user_id,
      assigned_cook_name,
      meal_type,
      user:assigned_user_id(
        first_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine
    console.error("Error fetching today's cook:", error);
    return { error: error.message, data: null };
  }

  if (!data) {
    return { error: null, data: null };
  }

  // Supabase joins can return arrays - handle both cases
  const rawUser = data.user;
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

  return {
    error: null,
    data: {
      assigned_user_id: data.assigned_user_id,
      assigned_cook_name: data.assigned_cook_name,
      user_first_name: userData?.first_name ?? null,
      user_avatar_url: userData?.avatar_url ?? null,
      meal_type: data.meal_type as ScheduleMealType,
    },
  };
}

// ============================================================================
// MEMBER DIETARY PROFILES
// ============================================================================

/**
 * Get the current user's dietary profile
 */
export async function getMyDietaryProfile(): Promise<{
  error: string | null;
  data: MemberDietaryProfile | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("household_id", householdId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching dietary profile:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

/**
 * Update or create the current user's dietary profile
 */
export async function upsertMyDietaryProfile(
  formData: MemberDietaryProfileFormData
): Promise<{ error: string | null; data: MemberDietaryProfile | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_dietary_profiles")
    .upsert(
      {
        user_id: user.id,
        household_id: householdId,
        dietary_restrictions: formData.dietary_restrictions,
        allergens: formData.allergens,
        dislikes: formData.dislikes,
        preferences: formData.preferences,
        spice_tolerance: formData.spice_tolerance,
        notes: formData.notes,
      },
      {
        onConflict: "user_id,household_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting dietary profile:", error);
    return { error: error.message, data: null };
  }

  // Log activity
  await logHouseholdActivity({
    activity_type: "dietary_updated",
    entity_type: "dietary_profile",
    entity_id: data.id,
  });

  revalidatePath("/app/settings/dietary");
  revalidatePath("/app/settings/household");

  return { error: null, data };
}

/**
 * Get aggregated dietary restrictions for the household
 */
export async function getHouseholdDietaryAggregate(): Promise<{
  error: string | null;
  data: AggregatedDietaryRestrictions | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get all dietary profiles for the household
  const { data: profiles, error } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("household_id", householdId);

  if (error) {
    console.error("Error fetching dietary profiles:", error);
    return { error: error.message, data: null };
  }

  // Aggregate
  const allRestrictions = new Set<string>();
  const allAllergens = new Set<string>();
  const allDislikes = new Set<string>();

  profiles?.forEach((profile) => {
    profile.dietary_restrictions?.forEach((r: string) => allRestrictions.add(r));
    profile.allergens?.forEach((a: string) => allAllergens.add(a));
    profile.dislikes?.forEach((d: string) => allDislikes.add(d));
  });

  return {
    error: null,
    data: {
      all_restrictions: Array.from(allRestrictions),
      all_allergens: Array.from(allAllergens),
      all_dislikes: Array.from(allDislikes),
      member_count: profiles?.length ?? 0,
    },
  };
}

// ============================================================================
// HOUSEHOLD ACTIVITIES
// ============================================================================

/**
 * Log a household activity
 */
export async function logHouseholdActivity(params: {
  activity_type: HouseholdActivityType;
  entity_type?: string;
  entity_id?: string;
  entity_title?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("household_activities").insert({
    household_id: householdId,
    user_id: user.id,
    activity_type: params.activity_type,
    entity_type: params.entity_type ?? null,
    entity_id: params.entity_id ?? null,
    entity_title: params.entity_title ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("Error logging household activity:", error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get recent household activities
 */
export async function getHouseholdActivities(
  limit: number = 20
): Promise<{ error: string | null; data: HouseholdActivityWithUser[] | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_activities")
    .select(`
      *,
      user:user_id(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching household activities:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as HouseholdActivityWithUser[] };
}

// ============================================================================
// HOUSEHOLD MEMBERS
// ============================================================================

/**
 * Get all members of the user's household with their profiles and dietary info
 */
export async function getHouseholdMembers(): Promise<{
  error: string | null;
  data: HouseholdMemberWithProfile[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_members")
    .select(`
      *,
      profile:user_id(
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error fetching household members:", error);
    return { error: error.message, data: null };
  }

  // Get dietary profiles separately to avoid complex join
  const { data: dietaryProfiles } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("household_id", householdId);

  // Map dietary profiles to members
  const membersWithDietary = data?.map((member) => {
    const dietaryProfile = dietaryProfiles?.find(
      (dp) => dp.user_id === member.user_id
    );
    return {
      ...member,
      profile: member.profile as HouseholdMemberWithProfile["profile"],
      dietary_profile: dietaryProfile ?? null,
    };
  });

  return { error: null, data: membersWithDietary as HouseholdMemberWithProfile[] };
}

/**
 * Get full household data including members, schedules, and dietary aggregate
 */
export async function getHouseholdFull(): Promise<{
  error: string | null;
  data: {
    household: { id: string; name: string; owner_id: string };
    members: HouseholdMemberWithProfile[];
    schedules: CookingScheduleWithUser[];
    dietaryAggregate: AggregatedDietaryRestrictions;
  } | null;
}> {
  const { user, householdId, household } = await getCachedUserWithHousehold();

  if (!user || !householdId || !household) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Fetch all data in parallel
  const [membersResult, schedulesResult, dietaryResult] = await Promise.all([
    getHouseholdMembers(),
    getCookingSchedules(),
    getHouseholdDietaryAggregate(),
  ]);

  if (membersResult.error || schedulesResult.error || dietaryResult.error) {
    return {
      error: membersResult.error || schedulesResult.error || dietaryResult.error,
      data: null,
    };
  }

  return {
    error: null,
    data: {
      household: {
        id: household.id,
        name: household.name,
        owner_id: household.owner_id,
      },
      members: membersResult.data ?? [],
      schedules: schedulesResult.data ?? [],
      dietaryAggregate: dietaryResult.data ?? {
        all_restrictions: [],
        all_allergens: [],
        all_dislikes: [],
        member_count: 0,
      },
    },
  };
}
```

### macro-presets.ts
```typescript
"use server";

/**
 * Server Actions for Macro Presets
 * CRUD operations for user-customizable macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  MacroPreset,
  MacroPresetFormData,
  PresetActionResult,
} from "@/types/macro-preset";

// =====================================================
// GET OPERATIONS
// =====================================================

/**
 * Get all presets for current user
 * @param includeHidden - Whether to include hidden presets (for preset manager)
 */
export async function getMacroPresets(includeHidden = false): Promise<{
  data: MacroPreset[];
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const supabase = await createClient();

    let query = supabase
      .from("macro_presets")
      .select("*")
      .eq("user_id", user.id);

    if (!includeHidden) {
      query = query.eq("is_hidden", false);
    }

    // Order: pinned first (by pin_order), then by sort_order, then by created_at
    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("pin_order", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching macro presets:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getMacroPresets:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch presets",
    };
  }
}

/**
 * Get a single preset by ID
 */
export async function getMacroPreset(id: string): Promise<{
  data: MacroPreset | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("macro_presets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: "Preset not found" };
      }
      console.error("Error fetching macro preset:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getMacroPreset:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch preset",
    };
  }
}

// =====================================================
// CREATE/UPDATE/DELETE OPERATIONS
// =====================================================

/**
 * Create a new custom preset
 */
export async function createMacroPreset(
  formData: MacroPresetFormData
): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      return { success: false, error: "Name is required" };
    }

    if (formData.name.trim().length > 50) {
      return { success: false, error: "Name must be 50 characters or less" };
    }

    // Validate at least one macro value
    if (
      formData.calories == null &&
      formData.protein_g == null &&
      formData.carbs_g == null &&
      formData.fat_g == null
    ) {
      return { success: false, error: "At least one macro value is required" };
    }

    const supabase = await createClient();

    // Get max sort_order for new preset
    const { data: existingPresets } = await supabase
      .from("macro_presets")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxOrder = existingPresets?.[0]?.sort_order ?? 0;

    const { data, error } = await supabase
      .from("macro_presets")
      .insert({
        user_id: user.id,
        name: formData.name.trim(),
        emoji: formData.emoji || null,
        calories: formData.calories ?? null,
        protein_g: formData.protein_g ?? null,
        carbs_g: formData.carbs_g ?? null,
        fat_g: formData.fat_g ?? null,
        is_system: false,
        is_pinned: false,
        is_hidden: false,
        sort_order: maxOrder + 1,
        pin_order: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A preset with this name already exists" };
      }
      console.error("Error creating macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in createMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create preset",
    };
  }
}

/**
 * Update an existing preset
 * System presets cannot have their name/values changed (only pin/hide status)
 */
export async function updateMacroPreset(
  id: string,
  formData: Partial<MacroPresetFormData>
): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Check if it's a system preset
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_system")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    if (existing.is_system) {
      return { success: false, error: "Cannot edit system presets. Create a custom preset instead." };
    }

    // Validate name if provided
    if (formData.name !== undefined) {
      if (!formData.name || formData.name.trim().length === 0) {
        return { success: false, error: "Name is required" };
      }
      if (formData.name.trim().length > 50) {
        return { success: false, error: "Name must be 50 characters or less" };
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (formData.name !== undefined) updateData.name = formData.name.trim();
    if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
    if (formData.calories !== undefined) updateData.calories = formData.calories;
    if (formData.protein_g !== undefined) updateData.protein_g = formData.protein_g;
    if (formData.carbs_g !== undefined) updateData.carbs_g = formData.carbs_g;
    if (formData.fat_g !== undefined) updateData.fat_g = formData.fat_g;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No changes provided" };
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A preset with this name already exists" };
      }
      console.error("Error updating macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in updateMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preset",
    };
  }
}

/**
 * Delete a preset (cannot delete system presets - use hide instead)
 */
export async function deleteMacroPreset(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Check if it's a system preset first
    const { data: existing } = await supabase
      .from("macro_presets")
      .select("is_system, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return { success: false, error: "Preset not found" };
    }

    if (existing.is_system) {
      return { success: false, error: "Cannot delete system presets. Use 'Hide' instead." };
    }

    const { error } = await supabase
      .from("macro_presets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete preset",
    };
  }
}

// =====================================================
// PIN/HIDE OPERATIONS
// =====================================================

/**
 * Toggle pin status for a preset
 */
export async function togglePresetPinned(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get current pin status
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_pinned")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    const newPinnedStatus = !existing.is_pinned;

    // Get next pin_order if pinning
    let pinOrder = 0;
    if (newPinnedStatus) {
      const { data: pinnedPresets } = await supabase
        .from("macro_presets")
        .select("pin_order")
        .eq("user_id", user.id)
        .eq("is_pinned", true)
        .order("pin_order", { ascending: false })
        .limit(1);

      pinOrder = (pinnedPresets?.[0]?.pin_order ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update({
        is_pinned: newPinnedStatus,
        pin_order: newPinnedStatus ? pinOrder : 0,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling preset pinned:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in togglePresetPinned:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle pin status",
    };
  }
}

/**
 * Toggle hidden status for a preset (works for system presets too)
 */
export async function togglePresetHidden(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get current hidden status
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_hidden")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update({ is_hidden: !existing.is_hidden })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling preset hidden:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in togglePresetHidden:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle hidden status",
    };
  }
}

/**
 * Reorder pinned presets
 */
export async function reorderPinnedPresets(
  orderedIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Update pin_order for each preset
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("macro_presets")
        .update({ pin_order: index })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("is_pinned", true)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      console.error("Error reordering presets:", results.filter((r) => r.error));
      return { success: false, error: "Failed to reorder presets" };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in reorderPinnedPresets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder presets",
    };
  }
}

// =====================================================
// SEED/INIT OPERATIONS
// =====================================================

/**
 * Seed default presets for current user (if none exist)
 * Called automatically on first quick add, but can be triggered manually
 */
export async function seedDefaultPresets(): Promise<{
  success: boolean;
  error: string | null;
  seeded: boolean;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated", seeded: false };
    }

    const supabase = await createClient();

    // Check if user already has presets
    const { data: existing } = await supabase
      .from("macro_presets")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      // Already has presets, no need to seed
      return { success: true, error: null, seeded: false };
    }

    // Seed defaults using the database function
    const { error } = await supabase.rpc("seed_default_macro_presets", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error seeding default presets:", error);
      return { success: false, error: error.message, seeded: false };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, seeded: true };
  } catch (error) {
    console.error("Error in seedDefaultPresets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to seed presets",
      seeded: false,
    };
  }
}

// =====================================================
// QUICK ADD FROM PRESET
// =====================================================

/**
 * One-tap add from preset - adds preset values directly to nutrition log
 */
export async function quickAddFromPreset(
  presetId: string,
  date: string,
  customNote?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get preset values
    const { data: preset, error: presetError } = await supabase
      .from("macro_presets")
      .select("*")
      .eq("id", presetId)
      .eq("user_id", user.id)
      .single();

    if (presetError || !preset) {
      return { success: false, error: "Preset not found" };
    }

    // Insert into nutrition_quick_adds
    const { error } = await supabase.from("nutrition_quick_adds").insert({
      user_id: user.id,
      date,
      calories: preset.calories,
      protein_g: preset.protein_g,
      carbs_g: preset.carbs_g,
      fat_g: preset.fat_g,
      note: customNote || null,
      preset: preset.name, // Store preset name for reference
    });

    if (error) {
      console.error("Error adding quick macro from preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in quickAddFromPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add from preset",
    };
  }
}
```

### meal-plan-suggestions.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

interface RecipeSuggestion {
  id: string;
  title: string;
  recipe_type: string;
  prep_time: string | null;
  cook_time: string | null;
  image_url: string | null;
  category: string | null;
}

// Get recipes recently cooked in the last 2 weeks (Make Again)
export async function getRecentlyCooked(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      recipe:recipes(id, title, recipe_type, prep_time, cook_time, image_url, category)
    `)
    .eq("household_id", household.household_id)
    .gte("cooked_at", twoWeeksAgo.toISOString())
    .order("cooked_at", { ascending: false })
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  // Deduplicate by recipe id and extract recipe data
  const seen = new Set<string>();
  const recipes: RecipeSuggestion[] = [];
  
  for (const entry of data || []) {
    // Supabase returns nested relations - handle both single object and array
    const recipeData = entry.recipe;
    const recipe = (Array.isArray(recipeData) ? recipeData[0] : recipeData) as RecipeSuggestion | null;
    if (recipe && !seen.has(recipe.id)) {
      seen.add(recipe.id);
      recipes.push(recipe);
    }
  }

  return { error: null, data: recipes.slice(0, 5) };
}

// Get user's favorite recipes
export async function getFavoriteRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: authError?.message || "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      recipe:recipes(id, title, recipe_type, prep_time, cook_time, image_url, category)
    `)
    .eq("user_id", user.id)
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  const recipes: RecipeSuggestion[] = (data || [])
    .map((entry) => {
      const recipeData = entry.recipe;
      return (Array.isArray(recipeData) ? recipeData[0] : recipeData) as RecipeSuggestion | null;
    })
    .filter((r): r is RecipeSuggestion => r !== null)
    .slice(0, 5);

  return { error: null, data: recipes };
}

// Get quick recipes (under 30 min total time)
export async function getQuickRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: authError?.message || "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  // Get recipes where prep_time contains common quick indicators
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household?.household_id},is_shared_with_household.eq.true)`
    )
    .or(
      `prep_time.ilike.%5 min%,prep_time.ilike.%10 min%,prep_time.ilike.%15 min%,prep_time.ilike.%20 min%,prep_time.ilike.%25 min%`
    )
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: (data || []).slice(0, 5) };
}

// Get recipes never cooked (Try Something New)
export async function getNeverCookedRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get all recipe IDs that have been cooked
  const { data: cookedData } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household.household_id);

  const cookedIds = new Set((cookedData || []).map((c) => c.recipe_id));

  // Get all available recipes
  const { data: allRecipes, error } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message, data: [] };
  }

  // Filter to recipes never cooked
  const neverCooked = (allRecipes || [])
    .filter((r) => !cookedIds.has(r.id))
    .slice(0, 5);

  return { error: null, data: neverCooked };
}

// Copy previous week's meal plan to current week
export async function copyPreviousWeek(
  fromWeekStart: string,
  toWeekStart: string
): Promise<{ error: string | null; copiedCount: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", copiedCount: 0 };
  }

  const supabase = await createClient();

  // Get the source week's meal plan
  const { data: sourcePlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", fromWeekStart)
    .single();

  if (!sourcePlan) {
    return { error: "No meal plan found for previous week", copiedCount: 0 };
  }

  // Get assignments from source week
  const { data: sourceAssignments } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook")
    .eq("meal_plan_id", sourcePlan.id);

  if (!sourceAssignments || sourceAssignments.length === 0) {
    return { error: "No meals to copy from previous week", copiedCount: 0 };
  }

  // Get or create target meal plan
  let { data: targetPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", toWeekStart)
    .single();

  if (!targetPlan) {
    const { data: newPlan, error: createError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household.household_id,
        week_start: toWeekStart,
      })
      .select("id")
      .single();

    if (createError) {
      return { error: createError.message, copiedCount: 0 };
    }
    targetPlan = newPlan;
  }

  // Insert new assignments (don't clear existing - user might want to add to what's there)
  const newAssignments = sourceAssignments.map((a) => ({
    meal_plan_id: targetPlan!.id,
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
  }));

  const { error: insertError } = await supabase
    .from("meal_assignments")
    .insert(newAssignments);

  if (insertError) {
    return { error: insertError.message, copiedCount: 0 };
  }

  return { error: null, copiedCount: sourceAssignments.length };
}

// Get the number of meals in the previous week (for copy button UI)
export async function getPreviousWeekMealCount(
  previousWeekStart: string
): Promise<{ error: string | null; count: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", count: 0 };
  }

  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", previousWeekStart)
    .single();

  if (!plan) {
    return { error: null, count: 0 };
  }

  const { count } = await supabase
    .from("meal_assignments")
    .select("id", { count: "exact", head: true })
    .eq("meal_plan_id", plan.id);

  return { error: null, count: count || 0 };
}

// Get smart recipe suggestions based on:
// 1. Recipes not cooked in 30+ days
// 2. Favorites not used recently
// 3. Recipe types not yet planned for the current week (variety)
export async function getSmartSuggestions(weekStart: string): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all recipes user has access to
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    )
    .limit(100);

  if (!allRecipes) {
    return { error: null, data: [] };
  }

  // Get cooking history for last 30 days
  const { data: recentHistory } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household.household_id)
    .gte("cooked_at", thirtyDaysAgo.toISOString());

  const recentlyCookedIds = new Set((recentHistory || []).map((h) => h.recipe_id));

  // Get current week's meal plan to check for variety
  const { data: currentPlan } = await supabase
    .from("meal_plans")
    .select(`
      id,
      meal_assignments (
        recipe:recipes (
          recipe_type
        )
      )
    `)
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  const plannedTypes = new Set<string>();
  if (currentPlan?.meal_assignments) {
    for (const assignment of currentPlan.meal_assignments) {
      const recipeData = (assignment as Record<string, unknown>).recipe;
      const recipe = Array.isArray(recipeData) ? recipeData[0] : recipeData;
      if (recipe?.recipe_type) {
        plannedTypes.add(recipe.recipe_type);
      }
    }
  }

  // Get user's favorites
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  const favoriteIds = new Set((favoritesData || []).map((f) => f.recipe_id));

  // Score recipes
  const scoredRecipes = allRecipes.map((recipe) => {
    let score = 0;

    // Not cooked in 30+ days: +3 points
    if (!recentlyCookedIds.has(recipe.id)) {
      score += 3;
    }

    // Favorite but not cooked recently: +2 points
    if (favoriteIds.has(recipe.id) && !recentlyCookedIds.has(recipe.id)) {
      score += 2;
    }

    // Recipe type not yet planned for this week: +2 points
    if (!plannedTypes.has(recipe.recipe_type)) {
      score += 2;
    }

    // Has prep time info (quality indicator): +1 point
    if (recipe.prep_time) {
      score += 1;
    }

    return { recipe, score };
  });

  // Sort by score descending and take top 10
  const suggestions = scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.recipe);

  return { error: null, data: suggestions };
}

```

### meal-plans.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  MealPlan,
  MealAssignmentWithRecipe,
  DayOfWeek,
  WeekPlanData,
  MealPlanTemplate,
  TemplateAssignment,
  MealType,
} from "@/types/meal-plan";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";

// Helper to parse ingredient string into components
function parseIngredient(ingredient: string): {
  quantity?: string;
  unit?: string;
  ingredient: string;
  category: string;
} {
  // Try to extract quantity and unit from beginning
  // Pattern: "2 cups flour" or "1/2 lb chicken" or "3 large eggs"
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|oz|lb|lbs?|g|kg|ml|l|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim() || undefined,
      unit: quantityMatch[2]?.trim() || undefined,
      ingredient: quantityMatch[3]?.trim() || ingredient,
      category: guessCategory(ingredient),
    };
  }

  return {
    ingredient: ingredient.trim(),
    category: guessCategory(ingredient),
  };
}

// Guess ingredient category based on keywords
function guessCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  if (
    /milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  if (/bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette/i.test(lower)) {
    return "Bakery";
  }

  if (
    /flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  if (
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning|fennel|cardamom|coriander|clove|allspice|anise|caraway|dill|mustard seed/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  if (
    /ketchup|mustard|mayo|mayonnaise|relish|hot sauce|bbq|dressing|salsa/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  // Beverages (using word boundaries to prevent "tea" matching "teaspoon")
  if (/\b(juice|soda|water|coffee|tea|wine|beer)\b/i.test(lower)) {
    return "Beverages";
  }

  return "Other";
}

// Helper to scale a quantity string by a multiplier
function scaleQuantity(quantity: string | undefined, scale: number): string | undefined {
  if (!quantity || scale === 1) return quantity;

  // Parse the quantity (handles fractions like "1/2", decimals like "1.5", and whole numbers)
  const trimmed = quantity.trim();

  // Handle fraction format (e.g., "1/2", "3/4")
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    const value = (numerator / denominator) * scale;
    // Return as decimal if not a clean fraction
    return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  }

  // Handle mixed number format (e.g., "1 1/2")
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    const value = (whole + numerator / denominator) * scale;
    return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  }

  // Handle simple number (integer or decimal)
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    const scaled = num * scale;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, '');
  }

  // Return original if we can't parse it
  return quantity;
}

// Helper to add recipe ingredients to shopping list
async function addRecipeToShoppingList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  mealPlanId: string,
  recipeId: string,
  recipeTitle: string,
  ingredients: string[],
  servingSize?: number | null,
  recipeBaseServings?: number | null
) {
  // Get or create shopping list for this meal plan
  let { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlanId)
    .maybeSingle();

  if (!shoppingList) {
    const { data: newList, error: createError } = await supabase
      .from("shopping_lists")
      .insert({
        household_id: householdId,
        meal_plan_id: mealPlanId,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Failed to create shopping list:", createError);
      return;
    }
    shoppingList = newList;
  }

  // Calculate scaling ratio based on serving size
  const scale = (servingSize && recipeBaseServings && recipeBaseServings > 0)
    ? servingSize / recipeBaseServings
    : 1;

  // Parse and prepare ingredients for merging
  const ingredientsToAdd: MergeableItem[] = ingredients.map((ing) => {
    const parsed = parseIngredient(ing);
    return {
      ...parsed,
      // Scale the quantity if we have a valid scale factor
      quantity: scaleQuantity(parsed.quantity, scale),
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    };
  });

  // Merge ingredients (combines duplicates within this recipe)
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Insert items into shopping list
  if (mergedItems.length > 0) {
    const itemsToInsert = mergedItems.map((item) => ({
      shopping_list_id: shoppingList!.id,
      ingredient: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      category: item.category || "Other",
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      is_checked: false,
    }));

    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (insertError) {
      console.error("Failed to insert shopping list items:", insertError);
    }
  }
}

// Helper to remove recipe ingredients from shopping list
async function removeRecipeFromShoppingList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mealPlanId: string,
  recipeId: string
) {
  // Get shopping list for this meal plan
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlanId)
    .maybeSingle();

  if (!shoppingList) return;

  // Delete items from this recipe
  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", shoppingList.id)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("Failed to remove shopping list items:", error);
  }
}

// Get or create a meal plan for a specific week
export async function getOrCreateMealPlan(weekStart: string) {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();
  
  if (!household) {
    return { error: "Please create or join a household to use meal planning", data: null };
  }

  const supabase = await createClient();

  // Use upsert with ON CONFLICT to prevent race conditions
  // This atomically either inserts or returns existing row
  const { data: mealPlan, error } = await supabase
    .from("meal_plans")
    .upsert(
      {
        household_id: household!.household_id,
        week_start: weekStart,
      },
      {
        onConflict: "household_id,week_start",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: mealPlan as MealPlan };
}

// Get week plan data with all assignments
export async function getWeekPlan(weekStart: string): Promise<{
  error: string | null;
  data: WeekPlanData | null;
}> {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();
  
  if (!household) {
    return { error: "Please create or join a household to use meal planning", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household!.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  // Initialize empty assignments for each day
  const assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  if (mealPlan) {
    // Get assignments with recipe details
    const { data: assignmentData } = await supabase
      .from("meal_assignments")
      .select(
        `
        *,
        recipe:recipes(id, title, recipe_type, prep_time, cook_time)
      `
      )
      .eq("meal_plan_id", mealPlan.id);

    if (assignmentData) {
      for (const assignment of assignmentData) {
        const day = assignment.day_of_week as DayOfWeek;
        if (assignments[day]) {
          assignments[day].push(assignment as MealAssignmentWithRecipe);
        }
      }
    }
  }

  return {
    error: null,
    data: {
      meal_plan: mealPlan as MealPlan | null,
      assignments,
    },
  };
}

// Add a recipe to a day
export async function addMealAssignment(
  weekStart: string,
  recipeId: string,
  dayOfWeek: DayOfWeek,
  cook?: string,
  mealType?: MealType | null,
  servingSize?: number | null
) {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();

  if (!household) {
    return { error: "Please create or join a household to use meal planning" };
  }

  const supabase = await createClient();

  // Get or create meal plan
  const planResult = await getOrCreateMealPlan(weekStart);
  if (planResult.error || !planResult.data) {
    return { error: planResult.error || "Failed to get meal plan" };
  }

  // Add assignment with serving_size
  const { error } = await supabase.from("meal_assignments").insert({
    meal_plan_id: planResult.data.id,
    recipe_id: recipeId,
    day_of_week: dayOfWeek,
    cook: cook || null,
    meal_type: mealType ?? null,
    serving_size: servingSize ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  // Auto-add recipe ingredients to shopping list (with scaling)
  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, ingredients, base_servings")
    .eq("id", recipeId)
    .single();

  if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
    await addRecipeToShoppingList(
      supabase,
      household!.household_id,
      planResult.data.id,
      recipeId,
      recipe.title,
      recipe.ingredients,
      servingSize,
      recipe.base_servings
    );
  }

  revalidateTag(`meal-plan-${household!.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Remove an assignment
export async function removeMealAssignment(assignmentId: string) {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();
  
  if (!household) {
    return { error: "Please create or join a household to use meal planning" };
  }

  const supabase = await createClient();

  // First get the assignment details before deleting (might already be deleted)
  const { data: assignment } = await supabase
    .from("meal_assignments")
    .select("meal_plan_id, recipe_id")
    .eq("id", assignmentId)
    .maybeSingle();

  // Delete the assignment
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { error: error.message };
  }

  // Remove recipe ingredients from shopping list
  if (assignment) {
    // Check if this recipe is still assigned elsewhere in this meal plan
    const { data: otherAssignments } = await supabase
      .from("meal_assignments")
      .select("id")
      .eq("meal_plan_id", assignment.meal_plan_id)
      .eq("recipe_id", assignment.recipe_id);

    // Only remove from shopping list if no other assignments for this recipe
    if (!otherAssignments || otherAssignments.length === 0) {
      await removeRecipeFromShoppingList(
        supabase,
        assignment.meal_plan_id,
        assignment.recipe_id
      );
    }
  }

  revalidateTag(`meal-plan-${household!.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Update assignment (change day, cook, meal type, or serving size)
export async function updateMealAssignment(
  assignmentId: string,
  updates: { day_of_week?: DayOfWeek; cook?: string | null; meal_type?: MealType | null; serving_size?: number | null }
) {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_assignments")
    .update(updates)
    .eq("id", assignmentId);

  if (error) {
    return { error: error.message };
  }

  // Get household for cache tag
  const { household } = await getCachedUserWithHousehold();
  if (household) {
    revalidateTag(`meal-plan-${household.household_id}`);
  }
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Move assignment to a different day (for drag and drop)
export async function moveAssignment(
  assignmentId: string,
  newDay: DayOfWeek
) {
  return updateMealAssignment(assignmentId, { day_of_week: newDay });
}

// Get recipes available for planning (user's + household shared)
export async function getRecipesForPlanning() {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: [] };
  }

  // Get household separately (optional - user can have recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

  // Build query: user's own recipes OR shared household recipes
  // If user has no household, only get their own recipes
  let query = supabase
    .from("recipes")
    .select("id, title, recipe_type, category, prep_time, cook_time, tags, protein_type");

  if (household?.household_id) {
    // User has household - get own recipes + shared household recipes
    query = query.or(
      `user_id.eq.${authUser.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    );
  } else {
    // User has no household - only get their own recipes
    query = query.eq("user_id", authUser.id);
  }

  const { data, error } = await query.order("title");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

// Clear all assignments for a day
export async function clearDayAssignments(weekStart: string, dayOfWeek: DayOfWeek) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the meal plan (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: null }; // No plan means nothing to clear
  }

  // Get recipes being cleared from this day
  const { data: assignmentsToRemove } = await supabase
    .from("meal_assignments")
    .select("recipe_id")
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek);

  // Delete assignments for that day
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    return { error: error.message };
  }

  // Remove ingredients for recipes that are no longer in the plan (batched check)
  if (assignmentsToRemove && assignmentsToRemove.length > 0) {
    const removedRecipeIds = Array.from(new Set(assignmentsToRemove.map(a => a.recipe_id)));

    // Batch query: get all recipes that are still assigned in this meal plan
    const { data: remainingAssignments } = await supabase
      .from("meal_assignments")
      .select("recipe_id")
      .eq("meal_plan_id", mealPlan.id)
      .in("recipe_id", removedRecipeIds);

    const stillAssignedRecipeIds = new Set(remainingAssignments?.map(a => a.recipe_id) || []);

    // Remove from shopping list only recipes that are no longer assigned anywhere
    for (const recipeId of removedRecipeIds) {
      if (!stillAssignedRecipeIds.has(recipeId)) {
        await removeRecipeFromShoppingList(supabase, mealPlan.id, recipeId);
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Mark a meal plan as sent (finalized)
export async function markMealPlanAsSent(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    console.error("[markMealPlanAsSent] Auth error:", authError?.message || "No household found");
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // First, check if meal plan exists
  const { data: existingPlans, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, week_start, sent_at")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart);

  if (fetchError) {
    console.error("[markMealPlanAsSent] Fetch error:", fetchError.message);
    return { error: fetchError.message };
  }

  if (!existingPlans || existingPlans.length === 0) {
    console.error("[markMealPlanAsSent] No meal plan found for week:", weekStart, "household:", household.household_id);
    return { error: "No meal plan found for this week" };
  }

  const existingPlan = existingPlans[0];
  console.log("[markMealPlanAsSent] Found meal plan:", existingPlan.id, "for week:", weekStart);

  // Update the meal plan to mark it as sent
  const { data: updatedPlans, error } = await supabase
    .from("meal_plans")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", existingPlan.id)
    .select();

  if (error) {
    console.error("[markMealPlanAsSent] Update error:", error.message);
    return { error: error.message };
  }

  if (!updatedPlans || updatedPlans.length === 0) {
    console.error("[markMealPlanAsSent] Update returned no data");
    return { error: "Failed to update meal plan" };
  }

  console.log("[markMealPlanAsSent] Successfully updated meal plan:", updatedPlans[0].id, "sent_at:", updatedPlans[0].sent_at);

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/history");
  return { error: null, data: updatedPlans[0] };
}

// Get all past meal plans that were sent
export async function getSentMealPlans() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get all meal plans that were sent, with their assignments
  const { data: mealPlans, error } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      meal_assignments (
        *,
        recipe:recipes(id, title, recipe_type)
      )
    `
    )
    .eq("household_id", household.household_id)
    .not("sent_at", "is", null)
    .order("week_start", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: mealPlans };
}

// Get week plan with full recipe details (including ingredients) for finalize page
export async function getWeekPlanWithFullRecipes(weekStart: string) {
  // Match the auth pattern of getWeekPlan for consistency
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    console.error("[getWeekPlanWithFullRecipes] Auth error:", authError?.message || "Not authenticated");
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();

  if (!household) {
    console.error("[getWeekPlanWithFullRecipes] No household found");
    return { error: "Please create or join a household to use meal planning", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  // Note: .single() returns PGRST116 error if no rows found - this is expected for new weeks
  if (mealPlanError && mealPlanError.code !== "PGRST116") {
    console.error("[getWeekPlanWithFullRecipes] Meal plan error:", mealPlanError);
  }

  // Initialize empty assignments for each day
  const assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  if (mealPlan) {
    // Get assignments with full recipe details including ingredients
    // Select specific fields instead of (*) to avoid potential RLS issues
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("meal_assignments")
      .select(
        `
        *,
        recipe:recipes(id, title, recipe_type, prep_time, cook_time, ingredients, instructions)
      `
      )
      .eq("meal_plan_id", mealPlan.id);

    if (assignmentError) {
      console.error("[getWeekPlanWithFullRecipes] Assignment error:", assignmentError);
      return { error: assignmentError.message, data: null };
    }

    if (assignmentData) {
      for (const assignment of assignmentData) {
        const day = assignment.day_of_week as DayOfWeek;
        if (assignments[day]) {
          assignments[day].push(assignment);
        }
      }
    }
  }

  return {
    error: null,
    data: {
      meal_plan: mealPlan,
      assignments,
    },
  };
}

// Get week plan with minimal recipe data for shopping list (optimized query)
export async function getWeekPlanForShoppingList(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: null, data: null };
  }

  // Get assignments with only the fields needed for shopping list display
  const { data: assignmentData } = await supabase
    .from("meal_assignments")
    .select(`
      id,
      day_of_week,
      cook,
      recipe:recipes(id, title)
    `)
    .eq("meal_plan_id", mealPlan.id);

  // Group by day for easier consumption
  const assignments: Record<string, typeof assignmentData> = {};
  if (assignmentData) {
    for (const assignment of assignmentData) {
      const day = assignment.day_of_week;
      if (!assignments[day]) {
        assignments[day] = [];
      }
      assignments[day].push(assignment);
    }
  }

  return {
    error: null,
    data: {
      assignments,
    },
  };
}

// ============================================
// MEAL PLAN TEMPLATE FUNCTIONS
// ============================================

// Get all templates for the household
export async function getMealPlanTemplates() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plan_templates")
    .select("*")
    .eq("household_id", household.household_id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data as MealPlanTemplate[] };
}

// Create a template from the current week's meal plan
export async function createMealPlanTemplate(
  name: string,
  weekStart: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the meal plan for this week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: "No meal plan found for this week" };
  }

  // Get all assignments for this meal plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook, meal_type, serving_size")
    .eq("meal_plan_id", mealPlan.id);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  // Convert assignments to template format
  const templateAssignments: TemplateAssignment[] = (assignments || []).map(
    (a) => ({
      recipe_id: a.recipe_id,
      day_of_week: a.day_of_week as DayOfWeek,
      cook: a.cook,
      meal_type: a.meal_type as MealType | null,
      serving_size: a.serving_size as number | null,
    })
  );

  // Create the template
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .insert({
      household_id: household.household_id,
      name: name.trim(),
      assignments: templateAssignments,
    })
    .select()
    .single();

  if (templateError) {
    return { error: templateError.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null, data: template as MealPlanTemplate };
}

// Update a template
export async function updateMealPlanTemplate(
  templateId: string,
  updates: { name?: string; assignments?: TemplateAssignment[] }
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  const updateData: Partial<MealPlanTemplate> = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  if (updates.assignments !== undefined) {
    updateData.assignments = updates.assignments;
  }

  const { data: template, error } = await supabase
    .from("meal_plan_templates")
    .update(updateData)
    .eq("id", templateId)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null, data: template as MealPlanTemplate };
}

// Delete a template
export async function deleteMealPlanTemplate(templateId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_plan_templates")
    .delete()
    .eq("id", templateId)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null };
}

// Apply a template to a specific week
export async function applyMealPlanTemplate(
  templateId: string,
  weekStart: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the template (might not exist - use maybeSingle)
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .select("*")
    .eq("id", templateId)
    .eq("household_id", household.household_id)
    .maybeSingle();

  if (templateError) {
    return { error: templateError.message };
  }

  if (!template) {
    return { error: "Template not found" };
  }

  // Get or create meal plan for the week
  const planResult = await getOrCreateMealPlan(weekStart);
  if (planResult.error || !planResult.data) {
    return { error: planResult.error || "Failed to get meal plan" };
  }

  // Clear existing assignments for this week
  const { error: clearError } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", planResult.data.id);

  if (clearError) {
    return { error: clearError.message };
  }

  // Apply template assignments
  const assignments = template.assignments as TemplateAssignment[];
  if (assignments.length > 0) {
    // Verify all recipes still exist and are accessible
    const recipeIds = Array.from(new Set(assignments.map((a) => a.recipe_id)));
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id")
      .in("id", recipeIds)
      .or(
        `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
      );

    const validRecipeIds = new Set((recipes || []).map((r) => r.id));

    // Filter out assignments with invalid recipes
    const validAssignments = assignments.filter((a) =>
      validRecipeIds.has(a.recipe_id)
    );

    if (validAssignments.length > 0) {
      const assignmentsToInsert = validAssignments.map((a) => ({
        meal_plan_id: planResult.data.id,
        recipe_id: a.recipe_id,
        day_of_week: a.day_of_week,
        cook: a.cook,
        meal_type: a.meal_type ?? null,
        serving_size: a.serving_size ?? null,
      }));

      const { error: insertError } = await supabase
        .from("meal_assignments")
        .insert(assignmentsToInsert);

      if (insertError) {
        return { error: insertError.message };
      }

      // Add ingredients to shopping list for all recipes (batched query, with scaling)
      const assignmentRecipeIds = Array.from(new Set(validAssignments.map(a => a.recipe_id)));
      const { data: recipesWithIngredients } = await supabase
        .from("recipes")
        .select("id, title, ingredients, base_servings")
        .in("id", assignmentRecipeIds);

      if (recipesWithIngredients) {
        const recipeMap = new Map(recipesWithIngredients.map(r => [r.id, r]));

        for (const assignment of validAssignments) {
          const recipe = recipeMap.get(assignment.recipe_id);
          if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
            await addRecipeToShoppingList(
              supabase,
              household.household_id,
              planResult.data.id,
              assignment.recipe_id,
              recipe.title,
              recipe.ingredients,
              assignment.serving_size,
              recipe.base_servings
            );
          }
        }
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Clear all meal assignments for an entire week
export async function clearWeekMealPlan(weekStart: string): Promise<{
  error: string | null;
  clearedCount: number;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", clearedCount: 0 };
  }

  const supabase = await createClient();

  // Get the meal plan (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: null, clearedCount: 0 }; // No plan means nothing to clear
  }

  // Count assignments before clearing
  const { count } = await supabase
    .from("meal_assignments")
    .select("id", { count: "exact", head: true })
    .eq("meal_plan_id", mealPlan.id);

  const clearedCount = count || 0;

  // Delete all assignments for this week
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", mealPlan.id);

  if (error) {
    return { error: error.message, clearedCount: 0 };
  }

  // Clear the shopping list for this meal plan (might not exist - use maybeSingle)
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlan.id)
    .maybeSingle();

  if (shoppingList) {
    await supabase
      .from("shopping_list_items")
      .delete()
      .eq("shopping_list_id", shoppingList.id);
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null, clearedCount };
}

// Get meal counts for multiple weeks (for multi-week shopping list selector)
export async function getWeeksMealCounts(weekStarts: string[]): Promise<{
  error: string | null;
  data: Array<{ weekStart: string; mealCount: number }>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get meal plans for the requested weeks
  const { data: mealPlans, error: plansError } = await supabase
    .from("meal_plans")
    .select("id, week_start")
    .eq("household_id", household.household_id)
    .in("week_start", weekStarts);

  if (plansError) {
    return { error: plansError.message, data: [] };
  }

  // Get assignment counts for each meal plan
  const result: Array<{ weekStart: string; mealCount: number }> = [];

  for (const weekStart of weekStarts) {
    const mealPlan = mealPlans?.find((mp) => mp.week_start === weekStart);

    if (mealPlan) {
      const { count } = await supabase
        .from("meal_assignments")
        .select("id", { count: "exact", head: true })
        .eq("meal_plan_id", mealPlan.id);

      result.push({ weekStart, mealCount: count || 0 });
    } else {
      result.push({ weekStart, mealCount: 0 });
    }
  }

  return { error: null, data: result };
}

// Get recipe repetition warnings across weeks (shows recipes that appear multiple times)
export async function getRecipeRepetitionWarnings(weekStarts: string[]): Promise<{
  error: string | null;
  data: Array<{ recipeId: string; recipeTitle: string; count: number; weeks: string[] }>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  if (!weekStarts || weekStarts.length === 0) {
    return { error: null, data: [] };
  }

  const supabase = await createClient();

  // Get meal plans for the requested weeks
  const { data: mealPlans, error: plansError } = await supabase
    .from("meal_plans")
    .select("id, week_start")
    .eq("household_id", household.household_id)
    .in("week_start", weekStarts);

  if (plansError) {
    return { error: plansError.message, data: [] };
  }

  if (!mealPlans || mealPlans.length === 0) {
    return { error: null, data: [] };
  }

  const mealPlanIds = mealPlans.map((mp) => mp.id);
  const mealPlanIdToWeek = new Map(mealPlans.map((mp) => [mp.id, mp.week_start]));

  // Get all assignments with recipe details
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select(`
      recipe_id,
      meal_plan_id,
      recipe:recipes(id, title)
    `)
    .in("meal_plan_id", mealPlanIds);

  if (assignmentsError) {
    return { error: assignmentsError.message, data: [] };
  }

  // Count recipe occurrences across weeks
  const recipeCounts = new Map<string, { title: string; count: number; weeks: Set<string> }>();

  for (const assignment of assignments || []) {
    const recipe = assignment.recipe as unknown as { id: string; title: string } | null;
    if (!recipe) continue;

    const week = mealPlanIdToWeek.get(assignment.meal_plan_id) || "";

    if (recipeCounts.has(recipe.id)) {
      const existing = recipeCounts.get(recipe.id)!;
      existing.count++;
      existing.weeks.add(week);
    } else {
      recipeCounts.set(recipe.id, {
        title: recipe.title,
        count: 1,
        weeks: new Set([week]),
      });
    }
  }

  // Filter to recipes that appear 3+ times (warning threshold)
  const warnings = Array.from(recipeCounts.entries())
    .filter(([, data]) => data.count >= 3)
    .map(([recipeId, data]) => ({
      recipeId,
      recipeTitle: data.title,
      count: data.count,
      weeks: Array.from(data.weeks).sort(),
    }))
    .sort((a, b) => b.count - a.count);

  return { error: null, data: warnings };
}

// Delete a meal plan from history
export async function deleteMealPlan(planId: string): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Verify the meal plan belongs to this household (might not exist - use maybeSingle)
  const { data: mealPlan, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, household_id")
    .eq("id", planId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!mealPlan) {
    return { error: "Meal plan not found" };
  }

  if (mealPlan.household_id !== household.household_id) {
    return { error: "Not authorized to delete this meal plan" };
  }

  // Delete assignments first (foreign key constraint)
  const { error: assignmentError } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", planId);

  if (assignmentError) {
    return { error: assignmentError.message };
  }

  // Delete the meal plan
  const { error: deleteError } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", planId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/history");
  return { error: null };
}

// Create a template from an existing meal plan (by plan ID)
export async function createMealPlanTemplateFromPlan(
  planId: string,
  templateName: string
): Promise<{
  error: string | null;
  data?: MealPlanTemplate;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  if (!templateName.trim()) {
    return { error: "Template name is required" };
  }

  const supabase = await createClient();

  // Get the meal plan and verify ownership (might not exist - use maybeSingle)
  const { data: mealPlan, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, household_id")
    .eq("id", planId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!mealPlan) {
    return { error: "Meal plan not found" };
  }

  if (mealPlan.household_id !== household.household_id) {
    return { error: "Not authorized to access this meal plan" };
  }

  // Get all assignments for this plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook, meal_type, serving_size")
    .eq("meal_plan_id", planId);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  if (!assignments || assignments.length === 0) {
    return { error: "No meals to save as template" };
  }

  // Create the template
  const templateAssignments = assignments.map((a) => ({
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
    meal_type: a.meal_type as MealType | null,
    serving_size: a.serving_size as number | null,
  }));

  const { data: template, error: createError } = await supabase
    .from("meal_plan_templates")
    .insert({
      household_id: household.household_id,
      name: templateName.trim(),
      assignments: templateAssignments,
    })
    .select()
    .single();

  if (createError) {
    return { error: createError.message };
  }

  return { error: null, data: template as MealPlanTemplate };
}
```

### notifications.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type { SocialNotification } from "@/types/social";

export async function getNotifications(
  limit: number = 20
): Promise<{ data: SocialNotification[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("social_notifications")
    .select(
      `
      id,
      notification_type,
      title,
      body,
      action_url,
      is_read,
      read_at,
      created_at,
      actor:profiles!social_notifications_actor_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { data: null, error: error.message };
  }

  // Transform to SocialNotification type
  const notifications: SocialNotification[] = (data || []).map((n) => {
    const actor = n.actor as unknown as {
      id: string;
      username: string;
      avatar_url: string | null;
    } | null;

    return {
      id: n.id,
      notification_type: n.notification_type,
      title: n.title,
      body: n.body,
      action_url: n.action_url,
      is_read: n.is_read,
      read_at: n.read_at,
      created_at: n.created_at,
      actor: actor
        ? {
            id: actor.id,
            username: actor.username,
            avatar_url: actor.avatar_url,
          }
        : null,
    };
  });

  return { data: notifications, error: null };
}

export async function getUnreadCount(): Promise<{
  count: number;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, error: null };
  }

  const { data, error } = await supabase.rpc("get_unread_notification_count");

  if (error) {
    console.error("Error fetching unread count:", error);
    return { count: 0, error: error.message };
  }

  return { count: data || 0, error: null };
}

export async function markAsRead(
  notificationIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase.rpc("mark_notifications_read", {
    notification_ids: notificationIds,
    mark_all: false,
  });

  if (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function markAllAsRead(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase.rpc("mark_notifications_read", {
    notification_ids: [],
    mark_all: true,
  });

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
```

### nutrition.ts
```typescript
"use server";

/**
 * Server Actions for Nutrition Tracking
 * Handles CRUD operations for recipe nutrition data, daily logs, and weekly summaries
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  RecipeNutrition,
  NutritionData,
  MacroGoals,
  WeeklyNutritionSummary,
  DailyMacroSummary,
  WeeklyMacroDashboard,
} from "@/types/nutrition";
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";
import {
  calculateDailyMacroSummary,
  calculateWeeklyMacroDashboard,
  getWeekDays,
} from "@/lib/nutrition/calculations";
import {
  buildNutritionExtractionPrompt,
  parseNutritionResponse,
  validateNutritionRanges,
} from "@/lib/ai/nutrition-extraction-prompt";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// =====================================================
// RECIPE NUTRITION ACTIONS
// =====================================================

/**
 * Get nutrition data for a specific recipe
 */
export async function getRecipeNutrition(recipeId: string): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // maybeSingle returns null if not found, which is expected
    if (!data) {
      return { data: null, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

/**
 * Manually update or create nutrition data for a recipe
 * Used when user wants to override AI-extracted data or add manual data
 */
export async function updateRecipeNutrition(
  recipeId: string,
  nutrition: NutritionData
): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { data: null, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { data: null, error: "You don't have permission to modify this recipe" };
    }

    // Upsert nutrition data (marked as manual source)
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .upsert(
        {
          recipe_id: recipeId,
          ...nutrition,
          source: "manual",
          confidence_score: 1.0, // Manual entries are 100% confident
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "recipe_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`);

    // Also revalidate meal plans that might use this recipe
    revalidatePath("/app/plan");

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update nutrition",
    };
  }
}

/**
 * Delete nutrition data for a recipe
 */
export async function deleteRecipeNutrition(recipeId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { success: false, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { success: false, error: "You don't have permission to modify this recipe" };
    }

    const { error } = await supabase
      .from("recipe_nutrition")
      .delete()
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error deleting recipe nutrition:", error);
      return { success: false, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`);
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteRecipeNutrition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete nutrition",
    };
  }
}

/**
 * Bulk fetch nutrition data for multiple recipes
 * Useful for meal plan page where we need nutrition for many recipes at once
 */
export async function getBulkRecipeNutrition(recipeIds: string[]): Promise<{
  data: Record<string, RecipeNutrition>;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: {}, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .in("recipe_id", recipeIds);

    if (error) {
      console.error("Error fetching bulk recipe nutrition:", error);
      return { data: {}, error: error.message };
    }

    // Convert array to record keyed by recipe_id
    const nutritionMap: Record<string, RecipeNutrition> = {};
    data.forEach((nutrition) => {
      nutritionMap[nutrition.recipe_id] = nutrition;
    });

    return { data: nutritionMap, error: null };
  } catch (error) {
    console.error("Error in getBulkRecipeNutrition:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

// =====================================================
// MACRO GOALS ACTIONS
// =====================================================

/**
 * Get user's macro goals from settings
 */
export async function getMacroGoals(): Promise<{
  data: MacroGoals | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("macro_goals")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching macro goals:", error);
      return { data: null, error: error.message };
    }

    return { data: data.macro_goals || null, error: null };
  } catch (error) {
    console.error("Error in getMacroGoals:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch macro goals",
    };
  }
}

/**
 * Update user's macro goals
 */
export async function updateMacroGoals(goals: MacroGoals): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { error } = await supabase
      .from("user_settings")
      .update({
        macro_goals: goals,
        macro_goal_preset: "custom", // Mark as custom when manually set
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating macro goals:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/settings");
    revalidatePath("/app/plan");
    revalidatePath("/app/nutrition");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in updateMacroGoals:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update macro goals",
    };
  }
}

/**
 * Toggle nutrition tracking on/off
 * When enabled, automatically queues all recipes without nutrition for extraction
 */
export async function toggleNutritionTracking(enabled: boolean): Promise<{
  success: boolean;
  error: string | null;
  queuedRecipes?: number;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { error } = await supabase
      .from("user_settings")
      .update({
        macro_tracking_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error toggling nutrition tracking:", error);
      return { success: false, error: error.message };
    }

    let queuedRecipes = 0;

    // When enabling, queue all recipes without nutrition for background extraction
    if (enabled) {
      queuedRecipes = await queueRecipesForNutritionExtraction(user.id);
    }

    revalidatePath("/app/settings");
    revalidatePath("/app/plan");

    return { success: true, error: null, queuedRecipes };
  } catch (error) {
    console.error("Error in toggleNutritionTracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle nutrition tracking",
    };
  }
}

/**
 * Queue all user's recipes without nutrition data for background extraction
 * Called when user enables nutrition tracking
 */
async function queueRecipesForNutritionExtraction(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    // Get all user's recipes
    const { data: recipes, error: recipesError } = await supabase
      .from("recipes")
      .select("id")
      .eq("user_id", userId);

    if (recipesError || !recipes || recipes.length === 0) {
      return 0;
    }

    const recipeIds = recipes.map((r) => r.id);

    // Get recipes that already have nutrition data
    const { data: existingNutrition } = await supabase
      .from("recipe_nutrition")
      .select("recipe_id")
      .in("recipe_id", recipeIds);

    const existingIds = new Set(existingNutrition?.map((n) => n.recipe_id) || []);

    // Filter to recipes without nutrition
    const recipesToQueue = recipeIds.filter((id) => !existingIds.has(id));

    if (recipesToQueue.length === 0) {
      return 0;
    }

    // Insert into queue (upsert to avoid duplicates)
    const { error: queueError } = await supabase.from("nutrition_extraction_queue").upsert(
      recipesToQueue.map((recipeId) => ({
        recipe_id: recipeId,
        status: "pending",
        priority: 0,
        attempts: 0,
      })),
      { onConflict: "recipe_id" }
    );

    if (queueError) {
      console.error("Error queueing recipes for extraction:", queueError);
      return 0;
    }

    console.log(`[Nutrition] Queued ${recipesToQueue.length} recipes for extraction`);
    return recipesToQueue.length;
  } catch (error) {
    console.error("Error in queueRecipesForNutritionExtraction:", error);
    return 0;
  }
}

/**
 * Internal function to extract nutrition for a recipe
 * Called directly from server actions (no HTTP overhead, no auth required)
 * This bypasses the API route to avoid authentication issues with server-to-server calls
 */
export async function extractNutritionForRecipeInternal(
  recipeId: string,
  recipeData: {
    title: string;
    ingredients: string[];
    servings: number;
    instructions?: string[];
  }
): Promise<{
  success: boolean;
  error?: string;
  warnings?: string[];
}> {
  try {
    const supabase = await createClient();

    // Get Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      console.error("[Nutrition] Anthropic API key not configured");
      return { success: false, error: "Anthropic API key not configured" };
    }

    // Build prompt
    const prompt = buildNutritionExtractionPrompt(
      recipeData.ingredients,
      recipeData.servings,
      recipeData.title,
      recipeData.instructions
    );

    // Call Claude API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Nutrition] Anthropic API error:", errorData);
      return {
        success: false,
        error: errorData.error?.message || `Anthropic API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract usage and calculate cost
    // Claude Sonnet 4.5 pricing: $3 per 1M input tokens, $15 per 1M output tokens
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costUsd =
      inputTokens > 0 || outputTokens > 0
        ? (inputTokens * 3) / 1_000_000 + (outputTokens * 15) / 1_000_000
        : null;

    // Parse nutrition response
    const nutritionData = parseNutritionResponse(content);

    if (!nutritionData) {
      console.error("[Nutrition] Failed to parse AI response:", content);
      return {
        success: false,
        error: "Failed to parse nutrition data from AI response",
      };
    }

    // Validate nutrition ranges
    const warnings = validateNutritionRanges(nutritionData);
    if (warnings.length > 0) {
      console.warn(`[Nutrition] Validation warnings for recipe ${recipeId}:`, warnings);
    }

    // Save to database
    const { error: saveError } = await supabase.from("recipe_nutrition").upsert(
      {
        recipe_id: recipeId,
        calories: nutritionData.calories,
        protein_g: nutritionData.protein_g,
        carbs_g: nutritionData.carbs_g,
        fat_g: nutritionData.fat_g,
        fiber_g: nutritionData.fiber_g,
        sugar_g: nutritionData.sugar_g,
        sodium_mg: nutritionData.sodium_mg,
        source: "ai_extracted" as const,
        confidence_score: nutritionData.confidence_score,
        input_tokens: inputTokens > 0 ? inputTokens : null,
        output_tokens: outputTokens > 0 ? outputTokens : null,
        cost_usd: costUsd,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "recipe_id",
      }
    );

    if (saveError) {
      console.error("[Nutrition] Failed to save nutrition data:", saveError);
      return {
        success: false,
        error: "Failed to save nutrition data to database",
      };
    }

    console.log(`[Nutrition] Successfully extracted nutrition for recipe ${recipeId}`);
    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error(`[Nutrition] Error extracting nutrition for recipe ${recipeId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract nutrition",
    };
  }
}

// =====================================================
// DAILY & WEEKLY SUMMARY ACTIONS
// =====================================================

/**
 * Get daily nutrition summary for a specific date
 * Calculates from meal plan assignments
 */
export async function getDailyNutritionSummary(date: string): Promise<{
  data: DailyMacroSummary | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Get macro goals (use maintenance preset as fallback if not set)
    const { data: userGoals } = await getMacroGoals();
    const goals = userGoals || MACRO_GOAL_PRESETS.maintenance;

    // Call database function to calculate daily nutrition
    const { data, error } = await supabase.rpc("calculate_daily_nutrition", {
      p_user_id: user.id,
      p_date: date,
    });

    if (error) {
      console.error("Error calculating daily nutrition:", error);
      return { data: null, error: error.message };
    }

    // Use ?? instead of || to preserve 0 values (0 is valid data, not missing)
    const nutritionData: NutritionData = {
      calories: data[0]?.total_calories ?? null,
      protein_g: data[0]?.total_protein_g ?? null,
      carbs_g: data[0]?.total_carbs_g ?? null,
      fat_g: data[0]?.total_fat_g ?? null,
      fiber_g: data[0]?.total_fiber_g ?? null,
      sugar_g: data[0]?.total_sugar_g ?? null,
      sodium_mg: data[0]?.total_sodium_mg ?? null,
    };

    const mealCount = data[0]?.meal_count || 0;
    const recipesWithNutrition = data[0]?.recipes_with_nutrition || 0;
    const dataCompletenessPct =
      mealCount > 0 ? Math.round((recipesWithNutrition / mealCount) * 100) : 0;

    const summary = calculateDailyMacroSummary(
      date,
      nutritionData,
      goals,
      mealCount,
      dataCompletenessPct
    );

    return { data: summary, error: null };
  } catch (error) {
    console.error("Error in getDailyNutritionSummary:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get daily summary",
    };
  }
}

/**
 * Get weekly nutrition dashboard
 * Aggregates all 7 days of the week
 */
export async function getWeeklyNutritionDashboard(weekStart: string): Promise<{
  data: WeeklyMacroDashboard | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    // Get macro goals (use maintenance preset as fallback if not set)
    const { data: userGoals } = await getMacroGoals();
    const goals = userGoals || MACRO_GOAL_PRESETS.maintenance;

    // Get all 7 days of the week
    const weekDays = getWeekDays(weekStart);

    // Fetch daily summaries for each day
    const dailySummaries: DailyMacroSummary[] = [];
    for (const day of weekDays) {
      const { data: summary, error } = await getDailyNutritionSummary(day);
      if (error) {
        console.error(`Error fetching summary for ${day}:`, error);
        // Continue with other days even if one fails
        continue;
      }
      if (summary) {
        dailySummaries.push(summary);
      }
    }

    // Calculate weekly dashboard
    const dashboard = calculateWeeklyMacroDashboard(weekStart, dailySummaries, goals);

    return { data: dashboard, error: null };
  } catch (error) {
    console.error("Error in getWeeklyNutritionDashboard:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get weekly dashboard",
    };
  }
}

/**
 * Save/update daily nutrition log
 * Called after meal plan changes to persist the snapshot
 */
export async function saveDailyNutritionLog(date: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Call database function to upsert daily log
    const { error } = await supabase.rpc("upsert_daily_nutrition_log", {
      p_user_id: user.id,
      p_date: date,
    });

    if (error) {
      console.error("Error saving daily nutrition log:", error);
      return { success: false, error: error.message };
    }

    // Revalidate nutrition pages
    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in saveDailyNutritionLog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save daily log",
    };
  }
}

/**
 * Get nutrition history (past weeks)
 * Used for trends and historical analysis
 */
export async function getNutritionHistory(weeks: number = 4): Promise<{
  data: WeeklyNutritionSummary[];
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - weeks * 7);

    const { data, error } = await supabase
      .from("weekly_nutrition_summary")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", startDate.toISOString().split("T")[0])
      .order("week_start", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition history:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getNutritionHistory:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch history",
    };
  }
}

/**
 * Check if user has nutrition tracking enabled
 */
export async function isNutritionTrackingEnabled(): Promise<{
  enabled: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { enabled: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("macro_tracking_enabled")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error checking nutrition tracking status:", error);
      return { enabled: false, error: error.message };
    }

    return { enabled: data.macro_tracking_enabled || false, error: null };
  } catch (error) {
    console.error("Error in isNutritionTrackingEnabled:", error);
    return {
      enabled: false,
      error: error instanceof Error ? error.message : "Failed to check tracking status",
    };
  }
}

// =====================================================
// QUICK ADD MACROS ACTIONS
// =====================================================

/**
 * Quick add nutrition entry (without a recipe)
 * Stores as a standalone entry for the day
 */
export async function addQuickMacros(data: {
  date: string;
  nutrition: {
    calories?: number | null;
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
  };
  note?: string;
  preset?: string;
}): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Insert into nutrition_quick_adds table
    const { error } = await supabase.from("nutrition_quick_adds").insert({
      user_id: user.id,
      date: data.date,
      calories: data.nutrition.calories,
      protein_g: data.nutrition.protein_g,
      carbs_g: data.nutrition.carbs_g,
      fat_g: data.nutrition.fat_g,
      note: data.note,
      preset: data.preset,
    });

    if (error) {
      console.error("Error adding quick macros:", error);
      return { success: false, error: error.message };
    }

    // Revalidate nutrition pages
    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in addQuickMacros:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add quick macros",
    };
  }
}

/**
 * Get quick add entries for a date
 */
export async function getQuickAddsForDate(date: string): Promise<{
  data: Array<{
    id: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
    note: string | null;
    preset: string | null;
    created_at: string;
  }>;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("nutrition_quick_adds")
      .select("id, calories, protein_g, carbs_g, fat_g, note, preset, created_at")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching quick adds:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getQuickAddsForDate:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch quick adds",
    };
  }
}

/**
 * Delete a quick add entry
 */
export async function deleteQuickAdd(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("nutrition_quick_adds")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting quick add:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteQuickAdd:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quick add",
    };
  }
}

// =====================================================
// NUTRITION EXTRACTION COSTS
// =====================================================

/**
 * Get nutrition extraction cost summary
 * Returns total cost and cost breakdown by recipe
 */
export async function getNutritionExtractionCosts(): Promise<{
  data: {
    totalCost: number;
    totalRecipes: number;
    averageCostPerRecipe: number;
    recipes: Array<{
      recipe_id: string;
      recipe_title: string;
      cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      extracted_at: string;
    }>;
  } | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get all nutrition extractions with costs for user's recipes
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select(`
        recipe_id,
        cost_usd,
        input_tokens,
        output_tokens,
        created_at,
        recipes!inner (
          id,
          title,
          user_id
        )
      `)
      .eq("recipes.user_id", user.id)
      .not("cost_usd", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition costs:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCost: 0,
          totalRecipes: 0,
          averageCostPerRecipe: 0,
          recipes: [],
        },
        error: null,
      };
    }

    const recipes = data.map((item) => ({
      recipe_id: item.recipe_id,
      recipe_title: (item.recipes as { title?: string } | null)?.title || "Unknown Recipe",
      cost_usd: Number(item.cost_usd),
      input_tokens: item.input_tokens || 0,
      output_tokens: item.output_tokens || 0,
      extracted_at: item.created_at,
    }));

    const totalCost = recipes.reduce((sum, r) => sum + r.cost_usd, 0);
    const totalRecipes = recipes.length;
    const averageCostPerRecipe = totalRecipes > 0 ? totalCost / totalRecipes : 0;

    return {
      data: {
        totalCost,
        totalRecipes,
        averageCostPerRecipe,
        recipes,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getNutritionExtractionCosts:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch costs",
    };
  }
}
```

### pantry-scan.ts
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PantryScan {
  id: string;
  household_id: string;
  user_id: string;
  image_url: string;
  scan_type: 'fridge' | 'pantry' | 'other';
  detected_items: unknown[];
  confirmed_items: unknown[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface ScanQuota {
  used: number;
  limit: number | 'unlimited';
  resetDate: Date | null;
}

/**
 * Get the user's pantry scan quota
 */
export async function getPantryScanQuota(): Promise<ScanQuota> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Premium users have unlimited scans
  if (profile.subscription_tier === 'premium') {
    return {
      used: 0,
      limit: 'unlimited',
      resetDate: null
    };
  }

  // Free users don't have access
  if (profile.subscription_tier === 'free') {
    return {
      used: 0,
      limit: 0,
      resetDate: null
    };
  }

  // Pro users have 10 scans per month
  const { data: settings } = await supabase
    .from('user_settings')
    .select('pantry_scans_used, pantry_scans_reset_at')
    .eq('user_id', user.id)
    .single();

  if (!settings) {
    // Create default settings if they don't exist
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        pantry_scans_used: 0,
        pantry_scans_reset_at: resetDate.toISOString()
      });

    return {
      used: 0,
      limit: 10,
      resetDate: resetDate
    };
  }

  // Check if quota should be reset
  const resetDate = new Date(settings.pantry_scans_reset_at);
  const now = new Date();

  if (now >= resetDate) {
    // Reset the quota
    const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase
      .from('user_settings')
      .update({
        pantry_scans_used: 0,
        pantry_scans_reset_at: newResetDate.toISOString()
      })
      .eq('user_id', user.id);

    return {
      used: 0,
      limit: 10,
      resetDate: newResetDate
    };
  }

  return {
    used: settings.pantry_scans_used || 0,
    limit: 10,
    resetDate: resetDate
  };
}

/**
 * Get pantry scan history for the user's household
 * Returns empty array if no household found or no scans exist
 */
export async function getPantryScanHistory(limit = 10): Promise<PantryScan[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Return empty array instead of throwing - component handles empty state
    return [];
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  // If no household found, return empty array (user hasn't set up household yet)
  if (!member) {
    return [];
  }

  const { data: scans, error } = await supabase
    .from('pantry_scans')
    .select('*')
    .eq('household_id', member.household_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching scan history:', error);
    // Return empty array instead of throwing - component handles empty state gracefully
    return [];
  }

  return scans || [];
}

/**
 * Get a specific pantry scan by ID
 */
export async function getPantryScan(scanId: string): Promise<PantryScan | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    throw new Error('No household found');
  }

  const { data: scan, error } = await supabase
    .from('pantry_scans')
    .select('*')
    .eq('id', scanId)
    .eq('household_id', member.household_id)
    .single();

  if (error) {
    console.error('Error fetching scan:', error);
    return null;
  }

  return scan;
}

/**
 * Delete a pantry scan
 */
export async function deletePantryScan(scanId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the scan to verify ownership and get image URL
  const { data: scan } = await supabase
    .from('pantry_scans')
    .select('image_url, user_id')
    .eq('id', scanId)
    .single();

  if (!scan) {
    return { success: false, error: 'Scan not found' };
  }

  if (scan.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Delete the image from storage if it exists
  if (scan.image_url) {
    try {
      // Extract the file path from the URL
      const urlParts = scan.image_url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // household_id/scan_id.ext

      await supabase.storage
        .from('pantry-scans')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Continue even if image deletion fails
    }
  }

  // Delete the scan record
  const { error } = await supabase
    .from('pantry_scans')
    .delete()
    .eq('id', scanId);

  if (error) {
    console.error('Error deleting scan:', error);
    return { success: false, error: 'Failed to delete scan' };
  }

  revalidatePath('/pantry');
  return { success: true };
}

/**
 * Get suggested recipes based on pantry items
 */
export async function getSuggestedRecipesFromPantry(limit = 5) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    throw new Error('No household found');
  }

  // Get pantry items
  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select('ingredient_name')
    .eq('household_id', member.household_id);

  if (!pantryItems || pantryItems.length === 0) {
    return [];
  }

  const ingredientNames = pantryItems.map(item => item.ingredient_name.toLowerCase());

  // Get all recipes for the household
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, ingredients, prep_time, cook_time, image_url, difficulty')
    .eq('household_id', member.household_id);

  if (!recipes) {
    return [];
  }

  // Calculate match score for each recipe
  const scoredRecipes = recipes
    .map(recipe => {
      const recipeIngredients = recipe.ingredients || [];
      let matchingIngredients = 0;
      const totalIngredients = recipeIngredients.length;

      recipeIngredients.forEach((ing: { name?: string }) => {
        const ingName = (ing.name || '').toLowerCase();
        if (ingredientNames.some(pantryIng =>
          ingName.includes(pantryIng) || pantryIng.includes(ingName)
        )) {
          matchingIngredients++;
        }
      });

      const matchPercentage = totalIngredients > 0
        ? (matchingIngredients / totalIngredients) * 100
        : 0;

      return {
        ...recipe,
        matching_ingredients: matchingIngredients,
        total_ingredients: totalIngredients,
        missing_ingredients: totalIngredients - matchingIngredients,
        match_percentage: Math.round(matchPercentage)
      };
    })
    .filter(recipe => recipe.matching_ingredients > 0)
    .sort((a, b) => b.match_percentage - a.match_percentage)
    .slice(0, limit);

  return scoredRecipes;
}```

### pantry.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PantryItem } from "@/types/shopping-list";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";

// Get all pantry items for the user's household
export async function getPantryItems(): Promise<{
  error: string | null;
  data: PantryItem[] | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data: items, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("category")
    .order("ingredient");

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: items as PantryItem[] };
}

// Get normalized pantry item names for quick lookup
export async function getPantryLookup(): Promise<{
  error: string | null;
  data: Set<string> | null;
}> {
  const result = await getPantryItems();
  if (result.error || !result.data) {
    return { error: result.error, data: null };
  }

  const lookup = new Set(result.data.map((item) => item.normalized_ingredient));
  return { error: null, data: lookup };
}

// Add an item to pantry
export async function addToPantry(
  ingredient: string,
  category?: string,
  source?: 'manual' | 'scan' | 'barcode'
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const normalizedIngredient = normalizeIngredientName(ingredient);

  const { error } = await supabase.from("pantry_items").upsert(
    {
      household_id: membership.household_id,
      ingredient: ingredient.trim(),
      normalized_ingredient: normalizedIngredient,
      category: category || "Other",
      source: source || 'manual',
      last_restocked: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "household_id,normalized_ingredient",
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  return { error: null };
}

// Remove an item from pantry
export async function removeFromPantry(
  ingredient: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const normalizedIngredient = normalizeIngredientName(ingredient);

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", membership.household_id)
    .eq("normalized_ingredient", normalizedIngredient);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove pantry item by ID
export async function removePantryItemById(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Check if an ingredient is in the pantry
export async function isInPantry(ingredient: string): Promise<boolean> {
  const result = await getPantryLookup();
  if (!result.data) return false;

  const normalized = normalizeIngredientName(ingredient);
  return result.data.has(normalized);
}

// Bulk add items to pantry (e.g., after shopping trip)
export async function bulkAddToPantry(
  items: Array<{ ingredient: string; category?: string }>
): Promise<{ error: string | null; count: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", count: 0 };
  }

  const itemsToInsert = items.map((item) => ({
    household_id: membership.household_id,
    ingredient: item.ingredient.trim(),
    normalized_ingredient: normalizeIngredientName(item.ingredient),
    category: item.category || "Other",
    last_restocked: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("pantry_items").upsert(itemsToInsert, {
    onConflict: "household_id,normalized_ingredient",
  });

  if (error) {
    return { error: error.message, count: 0 };
  }

  revalidatePath("/app/shop");
  return { error: null, count: items.length };
}

// Clear all pantry items
export async function clearPantry(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", membership.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

```

### profile-settings.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  ProfileCustomizationSettings,
  ProfilePrivacySettings,
  CookWithMeStatus,
  CookingSkillLevel,
} from "@/types/settings";

// Get profile customization settings
export async function getProfileCustomization() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      bio,
      cooking_philosophy,
      profile_emoji,
      currently_craving,
      cook_with_me_status,
      favorite_cuisine,
      cooking_skill,
      location,
      website_url,
      profile_accent_color,
      avatar_url,
      cover_image_url
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update profile customization settings
export async function updateProfileCustomization(
  settings: Partial<ProfileCustomizationSettings>
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      bio: settings.bio,
      cooking_philosophy: settings.cooking_philosophy,
      profile_emoji: settings.profile_emoji,
      currently_craving: settings.currently_craving,
      cook_with_me_status: settings.cook_with_me_status as CookWithMeStatus,
      favorite_cuisine: settings.favorite_cuisine,
      cooking_skill: settings.cooking_skill as CookingSkillLevel,
      location: settings.location,
      website_url: settings.website_url,
      profile_accent_color: settings.profile_accent_color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null };
}

// Get privacy settings
export async function getProfilePrivacy() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      public_profile,
      show_cooking_stats,
      show_badges,
      show_cook_photos,
      show_reviews,
      show_saved_recipes
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update privacy settings
export async function updateProfilePrivacy(settings: Partial<ProfilePrivacySettings>) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      public_profile: settings.public_profile,
      show_cooking_stats: settings.show_cooking_stats,
      show_badges: settings.show_badges,
      show_cook_photos: settings.show_cook_photos,
      show_reviews: settings.show_reviews,
      show_saved_recipes: settings.show_saved_recipes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null };
}

// Upload avatar image
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  const file = formData.get("avatar") as File;
  if (!file) {
    return { error: "No file provided", url: null };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image", url: null };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB", url: null };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, url: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, url: null };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null, url: publicUrl };
}

// Upload cover image
export async function uploadCoverImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  const file = formData.get("cover") as File;
  if (!file) {
    return { error: "No file provided", url: null };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image", url: null };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be less than 10MB", url: null };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, url: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(filePath);

  // Update profile with new cover image URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      cover_image_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, url: null };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null, url: publicUrl };
}
```

### public-profile.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PublicProfile,
  CookingStreak,
  CookPhoto,
  ProfileReview,
  PublicCollection,
} from "@/types/profile";

// ============================================
// PUBLIC PROFILE
// ============================================

export async function getPublicProfile(
  username: string
): Promise<{ data: PublicProfile | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error) {
    console.error("Error fetching public profile:", error);
    return { data: null, error: error.message };
  }

  if (!data || data.length === 0) {
    return { data: null, error: "Profile not found or not public" };
  }

  const profileData = data[0];

  // Check if current user is following this profile
  let isFollowing = false;
  if (user && user.id !== profileData.id) {
    const { data: followData } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profileData.id)
      .single();

    isFollowing = !!followData;
  }

  const profile: PublicProfile = {
    id: profileData.id,
    username: profileData.username,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    avatar_url: profileData.avatar_url,
    cover_image_url: profileData.cover_image_url,
    bio: profileData.bio,
    cooking_philosophy: profileData.cooking_philosophy,
    location: profileData.location,
    website: profileData.website,
    favorite_cuisine: profileData.favorite_cuisine,
    cooking_skill: profileData.cooking_skill,
    cook_with_me_status: profileData.cook_with_me_status,
    currently_craving: profileData.currently_craving,
    profile_theme: profileData.profile_theme,
    profile_emoji: profileData.profile_emoji,
    follower_count: profileData.follower_count,
    following_count: profileData.following_count,
    public_recipe_count: profileData.public_recipe_count,
    total_cooks: profileData.total_cooks,
    created_at: profileData.created_at,
    show_cooking_stats: profileData.show_cooking_stats,
    show_badges: profileData.show_badges,
    show_cook_photos: profileData.show_cook_photos,
    show_reviews: profileData.show_reviews,
    show_saved_recipes: profileData.show_saved_recipes,
    is_following: isFollowing,
  };

  return { data: profile, error: null };
}

// ============================================
// COOKING STATS
// ============================================

export async function getProfileStats(
  userId: string
): Promise<{ data: CookingStreak | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No streak data yet
      return {
        data: {
          current_streak_days: 0,
          longest_streak_days: 0,
          total_meals_cooked: 0,
          total_recipes_tried: 0,
          weekly_target: 0,
          current_week_count: 0,
        },
        error: null,
      };
    }
    console.error("Error fetching cooking stats:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ============================================
// COOK PHOTOS (I Made It Gallery)
// ============================================

export async function getCookPhotos(
  userId: string,
  limit: number = 12
): Promise<{ data: CookPhoto[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_cook_photos", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error("Error fetching cook photos:", error);
    return { data: null, error: error.message };
  }

  const photos: CookPhoto[] = (data || []).map((photo: {
    id: string;
    photo_url: string;
    caption: string | null;
    recipe_id: string;
    recipe_title: string;
    recipe_image_url: string | null;
    created_at: string;
    rating: number | null;
  }) => ({
    id: photo.id,
    photo_url: photo.photo_url,
    caption: photo.caption,
    recipe_id: photo.recipe_id,
    recipe_title: photo.recipe_title,
    recipe_image_url: photo.recipe_image_url,
    like_count: 0, // Placeholder for future feature
    created_at: photo.created_at,
  }));

  return { data: photos, error: null };
}

// ============================================
// PUBLIC COLLECTIONS
// ============================================

export async function getPublicCollections(
  userId: string
): Promise<{ data: PublicCollection[] | null; error: string | null }> {
  const supabase = await createClient();

  // For now, returning empty array as collections are a future feature
  // This would query recipe_collections table when implemented
  return { data: [], error: null };
}

// ============================================
// PROFILE REVIEWS (Deprecated - use cooking history instead)
// ============================================

export async function getProfileReviews(
  userId: string,
  limit: number = 10
): Promise<{ data: ProfileReview[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_reviews", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error("Error fetching profile reviews:", error);
    return { data: null, error: error.message };
  }

  const reviews: ProfileReview[] = (data || []).map((review: {
    id: string;
    recipe_id: string;
    recipe_title: string;
    recipe_image_url: string | null;
    rating: number;
    title: string | null;
    content: string | null;
    created_at: string;
    helpful_count: number;
  }) => ({
    id: review.id,
    recipe_id: review.recipe_id,
    recipe_title: review.recipe_title,
    recipe_image_url: review.recipe_image_url,
    rating: review.rating,
    title: review.title,
    content: review.content,
    created_at: review.created_at,
    helpful_count: review.helpful_count,
  }));

  return { data: reviews, error: null };
}

// ============================================
// PROFILE COOKING HISTORY (Replaces reviews)
// ============================================

export interface ProfileCookingEntry {
  id: string;
  recipe_id: string;
  recipe_title: string;
  recipe_image_url: string | null;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url: string | null;
  cooked_at: string;
}

export async function getProfileCookingHistory(
  userId: string,
  limit: number = 10
): Promise<{ data: ProfileCookingEntry[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      id,
      recipe_id,
      rating,
      notes,
      modifications,
      photo_url,
      cooked_at,
      recipe:recipes(title, image_url)
    `)
    .eq("cooked_by", userId)
    .order("cooked_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching profile cooking history:", error);
    return { data: null, error: error.message };
  }

  const entries: ProfileCookingEntry[] = (data || []).map((entry) => {
    const recipe = entry.recipe as unknown as { title: string; image_url: string | null } | null;
    return {
      id: entry.id,
      recipe_id: entry.recipe_id,
      recipe_title: recipe?.title || "Unknown Recipe",
      recipe_image_url: recipe?.image_url || null,
      rating: entry.rating,
      notes: entry.notes,
      modifications: entry.modifications,
      photo_url: entry.photo_url,
      cooked_at: entry.cooked_at,
    };
  });

  return { data: entries, error: null };
}

// ============================================
// PUBLIC RECIPES
// ============================================

export async function getPublicRecipes(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  data: {
    id: string;
    title: string;
    image_url: string | null;
    recipe_type: string;
    category: string | null;
    avg_rating: number | null;
    review_count: number;
    view_count: number;
    created_at: string;
  }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_user_public_recipes_for_profile",
    {
      p_user_id: userId,
      p_limit: options?.limit ?? 12,
      p_offset: options?.offset ?? 0,
    }
  );

  if (error) {
    console.error("Error fetching public recipes:", error);
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}
```

### recipes.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";
import type { QuickCookSuggestion } from "@/types/quick-cook";
import { randomUUID } from "crypto";
import { isNutritionTrackingEnabled, extractNutritionForRecipeInternal } from "./nutrition";

// Get all recipes for the current user (own + shared household recipes)
export async function getRecipes() {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (optional - user can have recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

  // Build query: user's own recipes OR shared household recipes
  // If user has no household, only get their own recipes
  let query = supabase
    .from("recipes")
    .select("*");

  if (household?.household_id) {
    // User has household - get own recipes + shared household recipes
    query = query.or(
      `user_id.eq.${authUser.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    );
  } else {
    // User has no household - only get their own recipes
    query = query.eq("user_id", authUser.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Recipe[] };
}

// Get a single recipe by ID
export async function getRecipe(id: string) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { error: error.message, data: null };
  }

  if (!data) {
    return { error: "Recipe not found", data: null };
  }

  return { error: null, data: data as Recipe };
}

// Create a new recipe
export async function createRecipe(formData: RecipeFormData) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (optional - user can create recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      title: formData.title,
      recipe_type: formData.recipe_type,
      category: formData.category || null,
      protein_type: formData.protein_type || null,
      prep_time: formData.prep_time || null,
      cook_time: formData.cook_time || null,
      servings: formData.servings || null,
      base_servings: formData.base_servings || null,
      ingredients: formData.ingredients,
      instructions: formData.instructions,
      tags: formData.tags,
      notes: formData.notes || null,
      source_url: formData.source_url || null,
      image_url: formData.image_url || null,
      allergen_tags: formData.allergen_tags || [],
      user_id: authUser.id,
      household_id: household?.household_id || null,
      is_shared_with_household: formData.is_shared_with_household ?? true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Background task: Auto-extract nutrition if tracking is enabled
  // This runs asynchronously and doesn't block the response
  const nutritionCheck = await isNutritionTrackingEnabled();
  if (nutritionCheck.enabled && data) {
    // Fire and forget - don't await to avoid blocking recipe creation
    extractNutritionForRecipeInternal(data.id, {
      title: data.title,
      ingredients: data.ingredients,
      servings: data.base_servings || 4,
      instructions: data.instructions,
    }).catch((err: Error) => {
      // Log error but don't fail recipe creation
      console.error("Background nutrition extraction failed:", err);
    });
  }

  revalidatePath("/app/recipes");
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null, data: data as Recipe };
}

// Save a Quick Cook AI suggestion as a recipe
export async function saveQuickCookRecipe(suggestion: QuickCookSuggestion) {
  // Convert QuickCookSuggestion to RecipeFormData
  const formData: RecipeFormData = {
    title: suggestion.title,
    recipe_type: "Dinner", // Default type for AI suggestions
    category: suggestion.cuisine || undefined,
    protein_type: suggestion.protein_type || undefined,
    prep_time: suggestion.active_time ? `${suggestion.active_time} min` : undefined,
    cook_time: suggestion.total_time && suggestion.active_time
      ? `${suggestion.total_time - suggestion.active_time} min`
      : undefined,
    servings: `${suggestion.servings}`,
    base_servings: suggestion.servings,
    ingredients: suggestion.ingredients.map(
      (i) => `${i.quantity} ${i.item}${i.notes ? ` (${i.notes})` : ""}`
    ),
    instructions: suggestion.instructions,
    tags: suggestion.tags || [],
    notes: `AI-suggested recipe: "${suggestion.reason}"`,
    allergen_tags: [],
  };

  return createRecipe(formData);
}

// Update an existing recipe
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Build update object, only including fields that are provided
  const updateData: Record<string, unknown> = {};

  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.recipe_type !== undefined) updateData.recipe_type = formData.recipe_type;
  if (formData.category !== undefined) updateData.category = formData.category || null;
  if (formData.protein_type !== undefined) updateData.protein_type = formData.protein_type || null;
  if (formData.prep_time !== undefined) updateData.prep_time = formData.prep_time || null;
  if (formData.cook_time !== undefined) updateData.cook_time = formData.cook_time || null;
  if (formData.servings !== undefined) updateData.servings = formData.servings || null;
  if (formData.base_servings !== undefined) updateData.base_servings = formData.base_servings || null;
  if (formData.ingredients !== undefined) updateData.ingredients = formData.ingredients;
  if (formData.instructions !== undefined) updateData.instructions = formData.instructions;
  if (formData.tags !== undefined) updateData.tags = formData.tags;
  if (formData.notes !== undefined) updateData.notes = formData.notes || null;
  if (formData.source_url !== undefined) updateData.source_url = formData.source_url || null;
  if (formData.image_url !== undefined) updateData.image_url = formData.image_url || null;
  if (formData.allergen_tags !== undefined) updateData.allergen_tags = formData.allergen_tags || [];
  if (formData.is_shared_with_household !== undefined) {
    updateData.is_shared_with_household = formData.is_shared_with_household;
  }

  const { data, error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", authUser.id) // Only owner can update
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Background task: Re-extract nutrition if ingredients were updated and tracking is enabled
  const ingredientsUpdated = formData.ingredients !== undefined;
  if (ingredientsUpdated && data) {
    const nutritionCheck = await isNutritionTrackingEnabled();
    if (nutritionCheck.enabled) {
      // Fire and forget - don't await to avoid blocking recipe update
      extractNutritionForRecipeInternal(data.id, {
        title: data.title,
        ingredients: data.ingredients,
        servings: data.base_servings || 4,
        instructions: data.instructions,
      }).catch((err: Error) => {
        // Log error but don't fail recipe update
        console.error("Background nutrition re-extraction failed:", err);
      });
    }
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null, data: data as Recipe };
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", authUser.id); // Only owner can delete

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null };
}

// Update recipe rating
export async function updateRecipeRating(id: string, rating: number) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ rating })
    .eq("id", id)
    .eq("user_id", authUser.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null };
}

// Toggle favorite status
export async function toggleFavorite(recipeId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", isFavorite: false };
  }

  const supabase = await createClient();

  // Check if already favorited (use maybeSingle since it might not exist)
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);

    if (error) {
      return { error: error.message, isFavorite: true };
    }

    revalidatePath("/app/recipes");
    revalidatePath("/app/history");
    return { error: null, isFavorite: false };
  } else {
    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      recipe_id: recipeId,
    });

    if (error) {
      return { error: error.message, isFavorite: false };
    }

    revalidatePath("/app/recipes");
    revalidatePath("/app/history");
    return { error: null, isFavorite: true };
  }
}

// Get user's favorite recipe IDs
export async function getFavorites() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((f) => f.recipe_id) };
}

// Get user's favorite recipes with full recipe details
export async function getFavoriteRecipes() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  // Join favorites with recipes to get full recipe data
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      recipe_id,
      created_at,
      recipe:recipes(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  // Transform to include favorited_at timestamp
  // Supabase returns recipe as a single object for this foreign key relation
  const favorites = data
    .filter((f): f is typeof f & { recipe: Record<string, unknown> } =>
      f.recipe !== null && typeof f.recipe === 'object' && !Array.isArray(f.recipe))
    .map((f) => ({
      ...(f.recipe as unknown as Recipe),
      favorited_at: f.created_at,
    }));

  return { error: null, data: favorites };
}

// Mark recipe as cooked (add to history)
export async function markAsCooked(
  recipeId: string,
  rating?: number,
  notes?: string,
  modifications?: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("cooking_history").insert({
    recipe_id: recipeId,
    user_id: user.id,
    household_id: household?.household_id || null,
    cooked_by: user.id,
    rating: rating || null,
    notes: notes || null,
    modifications: modifications || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);
  return { error: null };
}

// Get cooking history for a recipe
export async function getRecipeHistory(recipeId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `)
    .eq("household_id", household?.household_id)
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

// Get cook counts for all recipes in the household
export async function getRecipeCookCounts() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: {} };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household?.household_id);

  if (error) {
    return { error: error.message, data: {} };
  }

  // Count occurrences of each recipe_id
  const counts: Record<string, number> = {};
  data.forEach((entry) => {
    counts[entry.recipe_id] = (counts[entry.recipe_id] || 0) + 1;
  });

  return { error: null, data: counts };
}

// Upload recipe image to Supabase Storage
export async function uploadRecipeImage(formData: FormData) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", data: null };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.", data: null };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: "File too large. Maximum size is 5MB.", data: null };
  }

  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);

  return { error: null, data: { path: data.path, url: publicUrl } };
}

// Delete recipe image from Supabase Storage
export async function deleteRecipeImage(imagePath: string) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("recipe-images")
    .remove([imagePath]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
```

### settings.ts
```typescript
"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// Get user profile
export async function getProfile() {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - authError might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update user profile
export async function updateProfile(firstName: string, lastName: string) {
  // Use direct auth check instead of getCachedUserWithHousehold since user might not have a household yet
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Get user settings (from user_settings table, or create default)
export async function getSettings() {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - authError might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Try to get existing settings
  // Explicitly select columns to avoid schema cache issues with missing columns
  // eslint-disable-next-line prefer-const -- selectError is not reassigned but settings is
  let { data: settings, error: selectError } = await supabase
    .from("user_settings")
    .select(`
      id,
      user_id,
      dark_mode,
      cook_names,
      cook_colors,
      allergen_alerts,
      custom_dietary_restrictions,
      category_order,
      calendar_event_time,
      calendar_event_duration_minutes,
      calendar_excluded_days,
      google_connected_account,
      dismissed_hints,
      preferences,
      unit_system,
      created_at,
      updated_at,
      email_notifications
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  // If select failed due to missing column, try without email_notifications
  if (selectError && selectError.message?.includes("email_notifications")) {
    const { data: settingsWithoutEmail, error: retryError } = await supabase
      .from("user_settings")
      .select(`
        id,
        user_id,
        dark_mode,
        cook_names,
        cook_colors,
        allergen_alerts,
        custom_dietary_restrictions,
        category_order,
        calendar_event_time,
        calendar_event_duration_minutes,
        calendar_excluded_days,
        google_connected_account,
        dismissed_hints,
        preferences,
        unit_system,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (retryError) {
      // If still fails, return defaults
      return {
        error: null,
        data: {
          id: "",
          user_id: user.id,
          dark_mode: false,
          cook_names: ["Me"],
          cook_colors: {} as Record<string, string>,
          email_notifications: true,
          allergen_alerts: [],
          custom_dietary_restrictions: [],
          category_order: null as string[] | null,
          calendar_event_time: null as string | null,
          calendar_event_duration_minutes: null as number | null,
          calendar_excluded_days: [],
          dismissed_hints: [],
          unit_system: "imperial" as const,
          preferences: {} as Record<string, unknown>,
          google_connected_account: null as string | null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    // Add default email_notifications and ensure dismissed_hints, unit_system, and preferences exist
    settings = settingsWithoutEmail ? {
      ...settingsWithoutEmail,
      email_notifications: true,
      dismissed_hints: settingsWithoutEmail.dismissed_hints || [],
      unit_system: settingsWithoutEmail.unit_system || "imperial",
      preferences: settingsWithoutEmail.preferences || {},
    } : null;
  } else if (selectError) {
    // Other error - return defaults
    return {
      error: null,
      data: {
        id: "",
        user_id: user.id,
        dark_mode: false,
        cook_names: ["Me"],
        cook_colors: {} as Record<string, string>,
        email_notifications: true,
        allergen_alerts: [],
        custom_dietary_restrictions: [],
        category_order: null as string[] | null,
        calendar_event_time: null as string | null,
        calendar_event_duration_minutes: null as number | null,
        calendar_excluded_days: [],
        dismissed_hints: [],
        unit_system: "imperial" as const,
        preferences: {} as Record<string, unknown>,
        google_connected_account: null as string | null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  // Ensure email_notifications has a default value if missing
  if (settings && settings.email_notifications === undefined) {
    settings.email_notifications = true;
  }

  // Ensure array fields are never null - convert to empty arrays
  if (settings) {
    if (!settings.allergen_alerts || !Array.isArray(settings.allergen_alerts)) {
      settings.allergen_alerts = [];
    }
    if (!settings.custom_dietary_restrictions || !Array.isArray(settings.custom_dietary_restrictions)) {
      settings.custom_dietary_restrictions = [];
    }
    if (!settings.calendar_excluded_days || !Array.isArray(settings.calendar_excluded_days)) {
      settings.calendar_excluded_days = [];
    }
    if (!settings.dismissed_hints || !Array.isArray(settings.dismissed_hints)) {
      settings.dismissed_hints = [];
    }
    if (!settings.cook_names || !Array.isArray(settings.cook_names)) {
      settings.cook_names = ["Me"];
    }
    if (!settings.unit_system) {
      settings.unit_system = "imperial";
    }
    if (!settings.preferences) {
      settings.preferences = {};
    }
  }

  // Create default settings if none exist
  if (!settings) {
    const { data: newSettings, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        dark_mode: false,
        cook_names: ["Me"],
        email_notifications: true,
        allergen_alerts: [],
        custom_dietary_restrictions: [],
        calendar_excluded_days: [],
      })
      .select()
      .single();

    if (error) {
      // Table might not exist or column missing - return defaults
      return {
        error: null,
        data: {
          id: "",
          user_id: user.id,
          dark_mode: false,
          cook_names: ["Me"],
          cook_colors: {} as Record<string, string>,
          email_notifications: true,
          allergen_alerts: [],
          custom_dietary_restrictions: [],
          category_order: null as string[] | null,
          calendar_event_time: null as string | null,
          calendar_event_duration_minutes: null as number | null,
          calendar_excluded_days: [],
          dismissed_hints: [],
          unit_system: "imperial" as const,
          preferences: {} as Record<string, unknown>,
          google_connected_account: null as string | null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    settings = newSettings;

    // Ensure array fields are arrays after insert
    if (settings) {
      if (!settings.allergen_alerts || !Array.isArray(settings.allergen_alerts)) {
        settings.allergen_alerts = [];
      }
      if (!settings.custom_dietary_restrictions || !Array.isArray(settings.custom_dietary_restrictions)) {
        settings.custom_dietary_restrictions = [];
      }
      if (!settings.calendar_excluded_days || !Array.isArray(settings.calendar_excluded_days)) {
        settings.calendar_excluded_days = [];
      }
    }
  }

  return { error: null, data: settings };
}

// Update user settings
export async function updateSettings(settings: {
  dark_mode?: boolean;
  cook_names?: string[];
  cook_colors?: Record<string, string>;
  email_notifications?: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;
  unit_system?: "imperial" | "metric";
}) {
  // Use direct auth check instead of getCachedUserWithHousehold since user might not have a household yet
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // First, get existing settings to merge with new values
  const { data: existingSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Prepare settings for save - merge existing with new, ensure array fields are arrays (never null)
  const settingsToSave: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
    // Start with existing settings if they exist
    ...(existingSettings || {}),
  };

  // Override with new values that are explicitly provided
  // Always ensure arrays are arrays (never null or undefined)
  if (settings.dark_mode !== undefined) settingsToSave.dark_mode = settings.dark_mode;
  if (settings.cook_names !== undefined) settingsToSave.cook_names = settings.cook_names || ["Me"];
  if (settings.cook_colors !== undefined) settingsToSave.cook_colors = settings.cook_colors;
  if (settings.email_notifications !== undefined) settingsToSave.email_notifications = settings.email_notifications;
  
  // Array fields - always ensure they're arrays
  if (settings.allergen_alerts !== undefined) {
    settingsToSave.allergen_alerts = Array.isArray(settings.allergen_alerts) ? settings.allergen_alerts : [];
  }
  if (settings.custom_dietary_restrictions !== undefined) {
    settingsToSave.custom_dietary_restrictions = Array.isArray(settings.custom_dietary_restrictions) 
      ? settings.custom_dietary_restrictions 
      : [];
  }
  if (settings.calendar_excluded_days !== undefined) {
    settingsToSave.calendar_excluded_days = Array.isArray(settings.calendar_excluded_days) 
      ? settings.calendar_excluded_days 
      : [];
  }
  
  if (settings.category_order !== undefined) settingsToSave.category_order = settings.category_order;
  if (settings.calendar_event_time !== undefined) settingsToSave.calendar_event_time = settings.calendar_event_time;
  if (settings.calendar_event_duration_minutes !== undefined) settingsToSave.calendar_event_duration_minutes = settings.calendar_event_duration_minutes;
  if (settings.unit_system !== undefined) settingsToSave.unit_system = settings.unit_system;

  // Ensure array fields are never null in the final object
  if (!settingsToSave.allergen_alerts || !Array.isArray(settingsToSave.allergen_alerts)) {
    settingsToSave.allergen_alerts = [];
  }
  if (!settingsToSave.custom_dietary_restrictions || !Array.isArray(settingsToSave.custom_dietary_restrictions)) {
    settingsToSave.custom_dietary_restrictions = [];
  }
  if (!settingsToSave.calendar_excluded_days || !Array.isArray(settingsToSave.calendar_excluded_days)) {
    settingsToSave.calendar_excluded_days = [];
  }

  // Upsert settings - this will update existing or create new
  const { error } = await supabase.from("user_settings").upsert(
    settingsToSave,
    { onConflict: "user_id" }
  ).select();

  if (error) {
    console.error('Error saving settings:', error);
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Get household info
export async function getHouseholdInfo() {
  const { user, household, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get full household details
  const { data: householdDetails } = await supabase
    .from("households")
    .select("id, name, created_at")
    .eq("id", household.household_id)
    .maybeSingle();

  // Get household members
  const { data: members } = await supabase
    .from("household_members")
    .select(
      `
      user_id,
      role,
      profiles (
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("household_id", household.household_id);

  return {
    error: null,
    data: {
      household: householdDetails,
      role: membership.role,
      members: members || [],
    },
  };
}

// Update household name
export async function updateHouseholdName(name: string) {
  const { user, household, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found" };
  }

  // Only owners can update household name
  if (membership.role !== "owner") {
    return { error: "Only the household owner can update the name" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Delete account permanently
// Uses admin client with service role to delete user and cascade all data
export async function deleteAccount() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  try {
    const adminClient = createAdminClient();

    // First, cancel any active Stripe subscription
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscription?.stripe_subscription_id) {
      try {
        const { getStripe } = await import("@/lib/stripe/client");
        const stripe = getStripe();
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete the user using admin API
    // This will cascade delete all related data due to ON DELETE CASCADE
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return { error: "Failed to delete account. Please contact support." };
    }

    return { error: null };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}

// Dismiss a contextual hint
export async function dismissHint(hintId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current dismissed hints
  const { data: settings } = await supabase
    .from("user_settings")
    .select("dismissed_hints")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentHints = settings?.dismissed_hints || [];

  // Only add if not already dismissed
  if (!currentHints.includes(hintId)) {
    // Use upsert to ensure the row exists, creating it if necessary
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          dismissed_hints: [...currentHints, hintId],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  // Also revalidate cook pages so wizard dismissal takes effect immediately
  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null };
}

// Reset all dismissed hints (re-enable all hints)
export async function resetAllHints() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ dismissed_hints: [] })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  revalidatePath("/app/settings");

  return { error: null };
}

// Update show recipe sources preference (stored in preferences JSONB)
export async function updateShowRecipeSources(showRecipeSources: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentPreferences = (settings?.preferences as Record<string, unknown>) || {};

  // Merge with new value under ui namespace
  const updatedPreferences = {
    ...currentPreferences,
    ui: {
      ...((currentPreferences.ui as Record<string, unknown>) || {}),
      showRecipeSources,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");

  return { error: null };
}

// ============================================================================
// Cook Mode Settings
// ============================================================================

import type {
  CookModeSettings,
  CustomCookModePreset,
  MealTypeEmojiSettings,
  MealTypeCustomization,
  MealTypeKey,
  MealTypeSettings,
  PlannerViewSettings,
  RecipePreferences,
  RecipeExportPreferences,
  CalendarPreferences,
  UserSettingsPreferences,
} from "@/types/settings";
import {
  DEFAULT_COOK_MODE_SETTINGS,
  DEFAULT_MEAL_TYPE_EMOJIS,
  DEFAULT_MEAL_TYPE_SETTINGS,
  DEFAULT_PLANNER_VIEW_SETTINGS,
  DEFAULT_RECIPE_PREFERENCES,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
  DEFAULT_CALENDAR_PREFERENCES,
  DifficultyThresholds,
  DEFAULT_DIFFICULTY_THRESHOLDS,
} from "@/types/settings";

/**
 * Get cook mode settings from the preferences JSONB column
 */
export async function getCookModeSettings(): Promise<{
  error: string | null;
  data: CookModeSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const cookMode = preferences.cookMode;

  if (!cookMode) {
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  // Deep merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        ...cookMode.display,
      },
      visibility: {
        ...DEFAULT_COOK_MODE_SETTINGS.visibility,
        ...cookMode.visibility,
      },
      behavior: {
        ...DEFAULT_COOK_MODE_SETTINGS.behavior,
        ...cookMode.behavior,
      },
      navigation: {
        ...DEFAULT_COOK_MODE_SETTINGS.navigation,
        ...cookMode.navigation,
      },
      voice: {
        ...DEFAULT_COOK_MODE_SETTINGS.voice,
        ...cookMode.voice,
      },
      gestures: {
        ...DEFAULT_COOK_MODE_SETTINGS.gestures,
        ...cookMode.gestures,
      },
      audio: {
        ...DEFAULT_COOK_MODE_SETTINGS.audio,
        ...cookMode.audio,
      },
      timers: {
        ...DEFAULT_COOK_MODE_SETTINGS.timers,
        ...cookMode.timers,
      },
    },
  };
}

/**
 * Update cook mode settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateCookModeSettings(
  newSettings: Partial<CookModeSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingCookMode =
    existingPreferences.cookMode || DEFAULT_COOK_MODE_SETTINGS;

  // Deep merge the new settings with existing
  const updatedCookMode: CookModeSettings = {
    display: {
      ...existingCookMode.display,
      ...(newSettings.display || {}),
    },
    visibility: {
      ...existingCookMode.visibility,
      ...(newSettings.visibility || {}),
    },
    behavior: {
      ...existingCookMode.behavior,
      ...(newSettings.behavior || {}),
    },
    navigation: {
      ...existingCookMode.navigation,
      ...(newSettings.navigation || {}),
    },
    voice: {
      ...existingCookMode.voice,
      ...(newSettings.voice || {}),
    },
    gestures: {
      ...existingCookMode.gestures,
      ...(newSettings.gestures || {}),
    },
    audio: {
      ...existingCookMode.audio,
      ...(newSettings.audio || {}),
    },
    timers: {
      ...existingCookMode.timers,
      ...(newSettings.timers || {}),
    },
  };

  // Update the preferences JSONB with the new cook mode settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookMode: updatedCookMode,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ============================================================================
// Meal Type Emoji Settings
// ============================================================================

/**
 * Get meal type emoji settings from the preferences JSONB column
 */
export async function getMealTypeEmojiSettings(): Promise<{
  error: string | null;
  data: MealTypeEmojiSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const mealTypeEmojis = preferences.mealTypeEmojis;

  if (!mealTypeEmojis) {
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_MEAL_TYPE_EMOJIS,
      ...mealTypeEmojis,
    },
  };
}

/**
 * Update meal type emoji settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateMealTypeEmojiSettings(
  newSettings: Partial<MealTypeEmojiSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingEmojis =
    existingPreferences.mealTypeEmojis || DEFAULT_MEAL_TYPE_EMOJIS;

  // Merge the new settings with existing
  const updatedEmojis: MealTypeEmojiSettings = {
    ...existingEmojis,
    ...newSettings,
  };

  // Update the preferences JSONB with the new meal type emoji settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeEmojis: updatedEmojis,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate meal planner paths
  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Meal Type Customization (Full Settings: Emoji, Color, Calendar Time)
// ============================================================================

/**
 * Helper to migrate from old emoji-only format to new full format
 */
function migrateToFullSettings(
  oldEmojis: MealTypeEmojiSettings | undefined,
  newSettings: MealTypeCustomization | undefined
): MealTypeCustomization {
  // If new settings exist, use them
  if (newSettings) {
    // Merge with defaults to ensure all fields exist
    const result: MealTypeCustomization = { ...DEFAULT_MEAL_TYPE_SETTINGS };
    for (const key of Object.keys(DEFAULT_MEAL_TYPE_SETTINGS) as MealTypeKey[]) {
      if (newSettings[key]) {
        result[key] = {
          ...DEFAULT_MEAL_TYPE_SETTINGS[key],
          ...newSettings[key],
        };
      }
    }
    return result;
  }

  // If only old emoji settings exist, migrate them
  if (oldEmojis) {
    const result: MealTypeCustomization = { ...DEFAULT_MEAL_TYPE_SETTINGS };
    for (const key of Object.keys(DEFAULT_MEAL_TYPE_SETTINGS) as MealTypeKey[]) {
      result[key] = {
        ...DEFAULT_MEAL_TYPE_SETTINGS[key],
        emoji: oldEmojis[key] ?? DEFAULT_MEAL_TYPE_SETTINGS[key].emoji,
      };
    }
    return result;
  }

  // Return defaults
  return DEFAULT_MEAL_TYPE_SETTINGS;
}

/**
 * Get full meal type customization settings (emoji, color, calendar time)
 * Automatically migrates from old emoji-only format
 */
export async function getMealTypeCustomization(): Promise<{
  error: string | null;
  data: MealTypeCustomization;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: DEFAULT_MEAL_TYPE_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_MEAL_TYPE_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const migrated = migrateToFullSettings(
    preferences.mealTypeEmojis,
    preferences.mealTypeSettings
  );

  return { error: null, data: migrated };
}

/**
 * Update a single meal type's settings
 */
export async function updateMealTypeSetting(
  mealType: MealTypeKey,
  updates: Partial<MealTypeSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingSettings = migrateToFullSettings(
    existingPreferences.mealTypeEmojis,
    existingPreferences.mealTypeSettings
  );

  // Update the specific meal type
  const updatedSettings: MealTypeCustomization = {
    ...existingSettings,
    [mealType]: {
      ...existingSettings[mealType],
      ...updates,
    },
  };

  // Update preferences (keep mealTypeEmojis for backward compatibility)
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: updatedSettings,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Update all meal type settings at once
 */
export async function updateMealTypeCustomization(
  updates: Partial<MealTypeCustomization>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingSettings = migrateToFullSettings(
    existingPreferences.mealTypeEmojis,
    existingPreferences.mealTypeSettings
  );

  // Merge updates
  const updatedSettings: MealTypeCustomization = { ...existingSettings };
  for (const key of Object.keys(updates) as MealTypeKey[]) {
    if (updates[key]) {
      updatedSettings[key] = {
        ...existingSettings[key],
        ...updates[key],
      };
    }
  }

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: updatedSettings,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Reset all meal type settings to defaults
 */
export async function resetMealTypeCustomization(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

  // Reset to defaults and remove old emoji-only settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: DEFAULT_MEAL_TYPE_SETTINGS,
    mealTypeEmojis: undefined, // Clean up old format
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Planner View Settings
// ============================================================================

/**
 * Get planner view settings from the preferences JSONB column
 */
export async function getPlannerViewSettings(): Promise<{
  error: string | null;
  data: PlannerViewSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const plannerView = preferences.plannerView;

  if (!plannerView) {
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_PLANNER_VIEW_SETTINGS,
      ...plannerView,
    },
  };
}

/**
 * Update planner view settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updatePlannerViewSettings(
  newSettings: Partial<PlannerViewSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingPlannerView =
    existingPreferences.plannerView || DEFAULT_PLANNER_VIEW_SETTINGS;

  // Merge the new settings with existing
  const updatedPlannerView: PlannerViewSettings = {
    ...existingPlannerView,
    ...newSettings,
  };

  // Update the preferences JSONB with the new planner view settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    plannerView: updatedPlannerView,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate meal planner paths
  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Reset planner view settings to defaults
 */
export async function resetPlannerViewSettings(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

  // Reset to defaults
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    plannerView: DEFAULT_PLANNER_VIEW_SETTINGS,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Recipe Preferences (Default Serving Size)
// ============================================================================

/**
 * Get recipe preferences from the preferences JSONB column
 */
export async function getRecipePreferences(): Promise<{
  error: string | null;
  data: RecipePreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const recipe = preferences.recipe;

  if (!recipe) {
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_RECIPE_PREFERENCES,
      ...recipe,
    },
  };
}

/**
 * Update recipe preferences in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateRecipePreferences(
  newSettings: Partial<RecipePreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingRecipe =
    existingPreferences.recipe || DEFAULT_RECIPE_PREFERENCES;

  // Merge the new settings with existing
  const updatedRecipe: RecipePreferences = {
    ...existingRecipe,
    ...newSettings,
  };

  // Update the preferences JSONB with the new recipe settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    recipe: updatedRecipe,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Recipe Export Preferences
// ============================================================================

/**
 * Get recipe export preferences from the preferences JSONB column
 */
export async function getRecipeExportPreferences(): Promise<{
  error: string | null;
  data: RecipeExportPreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const recipeExport = preferences.recipeExport;

  if (!recipeExport) {
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_RECIPE_EXPORT_PREFERENCES,
      ...recipeExport,
    },
  };
}

/**
 * Update recipe export preferences in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateRecipeExportPreferences(
  newSettings: Partial<RecipeExportPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingRecipeExport =
    existingPreferences.recipeExport || DEFAULT_RECIPE_EXPORT_PREFERENCES;

  // Merge the new settings with existing
  const updatedRecipeExport: RecipeExportPreferences = {
    ...existingRecipeExport,
    ...newSettings,
  };

  // Update the preferences JSONB with the new recipe export settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    recipeExport: updatedRecipeExport,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Custom Cook Mode Preset Actions
// ============================================================================

/**
 * Get all custom cook mode presets for the current user
 */
export async function getCustomCookModePresets(): Promise<{
  error: string | null;
  data: CustomCookModePreset[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: [] };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: [] };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const presets = preferences.cookModePresets || [];

  return { error: null, data: presets };
}

/**
 * Save a new custom cook mode preset
 */
export async function saveCustomCookModePreset(
  preset: Omit<CustomCookModePreset, "id" | "createdAt">
): Promise<{
  error: string | null;
  data: CustomCookModePreset | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Create new preset with id and timestamp
  const newPreset: CustomCookModePreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  // Append to existing presets
  const updatedPresets = [...existingPresets, newPreset];

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");

  return { error: null, data: newPreset };
}

/**
 * Update an existing custom cook mode preset
 */
export async function updateCustomCookModePreset(
  id: string,
  updates: Partial<Omit<CustomCookModePreset, "id" | "createdAt">>
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Find and update the preset
  const presetIndex = existingPresets.findIndex((p) => p.id === id);
  if (presetIndex === -1) {
    return { error: "Preset not found" };
  }

  const updatedPresets = [...existingPresets];
  updatedPresets[presetIndex] = {
    ...updatedPresets[presetIndex],
    ...updates,
  };

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Delete a custom cook mode preset
 */
export async function deleteCustomCookModePreset(
  id: string
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Filter out the preset
  const updatedPresets = existingPresets.filter((p) => p.id !== id);

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Set a preset as the default (unset any previous default)
 */
export async function setDefaultCookModePreset(
  id: string | null  // null to clear default
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Update all presets to set isDefault accordingly
  const updatedPresets = existingPresets.map((p) => ({
    ...p,
    isDefault: id === null ? false : p.id === id,
  }));

  // If setting a default, verify the preset exists
  if (id !== null && !updatedPresets.some((p) => p.id === id)) {
    return { error: "Preset not found" };
  }

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Duplicate an existing preset with a new name
 */
export async function duplicateCookModePreset(
  id: string,
  newName: string
): Promise<{
  error: string | null;
  data: CustomCookModePreset | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Find the preset to duplicate
  const presetToDuplicate = existingPresets.find((p) => p.id === id);
  if (!presetToDuplicate) {
    return { error: "Preset not found", data: null };
  }

  // Create duplicate with new id, name, and createdAt
  const duplicatedPreset: CustomCookModePreset = {
    ...presetToDuplicate,
    id: crypto.randomUUID(),
    name: newName,
    createdAt: new Date().toISOString(),
    isDefault: false, // Duplicates are never default
  };

  // Append to existing presets
  const updatedPresets = [...existingPresets, duplicatedPreset];

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");

  return { error: null, data: duplicatedPreset };
}

// ============================================================================
// Calendar Preferences
// ============================================================================

/**
 * Get calendar preferences from the preferences JSONB column
 */
export async function getCalendarPreferences(): Promise<{
  error: string | null;
  data: CalendarPreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: DEFAULT_CALENDAR_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences, calendar_event_time, calendar_event_duration_minutes, calendar_excluded_days")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    // Fallback to column values during migration period
    return {
      error: null,
      data: {
        eventTime: settings?.calendar_event_time || DEFAULT_CALENDAR_PREFERENCES.eventTime,
        eventDurationMinutes: settings?.calendar_event_duration_minutes || DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays: settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
      },
    };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const calendar = preferences.calendar;

  if (!calendar) {
    // Fallback to column values during migration period
    return {
      error: null,
      data: {
        eventTime: settings?.calendar_event_time || DEFAULT_CALENDAR_PREFERENCES.eventTime,
        eventDurationMinutes: settings?.calendar_event_duration_minutes || DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays: settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
      },
    };
  }

  return {
    error: null,
    data: {
      ...DEFAULT_CALENDAR_PREFERENCES,
      ...calendar,
    },
  };
}

/**
 * Update calendar preferences in the preferences JSONB column
 */
export async function updateCalendarPreferences(
  newSettings: Partial<CalendarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingCalendar = existingPreferences.calendar || DEFAULT_CALENDAR_PREFERENCES;

  // Merge new settings with existing
  const updatedCalendar: CalendarPreferences = {
    ...existingCalendar,
    ...newSettings,
  };

  // Update the preferences JSONB with the new calendar settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    calendar: updatedCalendar,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Custom Dietary Restrictions
// ============================================================================

/**
 * Add a custom dietary restriction to the user's settings
 */
export async function addCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Validate input
  const trimmed = restriction.trim();
  if (!trimmed) {
    return { error: "Restriction cannot be empty" };
  }

  // Get current restrictions
  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];

  // Check for duplicates (case-insensitive)
  if (current.some((r: string) => r.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "This restriction already exists" };
  }

  const updated = [...current, trimmed];

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");

  return { error: null };
}

/**
 * Remove a custom dietary restriction from the user's settings
 */
export async function removeCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];
  const updated = current.filter((r: string) => r !== restriction);

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");

  return { error: null };
}

// ============================================================================
// Difficulty Thresholds Settings
// ============================================================================

/**
 * Get difficulty thresholds from the preferences JSONB column
 */
export async function getDifficultyThresholds(): Promise<{
  error: string | null;
  data: DifficultyThresholds;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const thresholds = preferences.difficultyThresholds;

  if (!thresholds) {
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      time: { ...DEFAULT_DIFFICULTY_THRESHOLDS.time, ...thresholds.time },
      ingredients: { ...DEFAULT_DIFFICULTY_THRESHOLDS.ingredients, ...thresholds.ingredients },
      steps: { ...DEFAULT_DIFFICULTY_THRESHOLDS.steps, ...thresholds.steps },
    },
  };
}

/**
 * Update difficulty thresholds in the preferences JSONB column
 */
export async function updateDifficultyThresholds(
  newThresholds: Partial<DifficultyThresholds>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingThresholds =
    existingPreferences.difficultyThresholds || DEFAULT_DIFFICULTY_THRESHOLDS;

  // Deep merge the new thresholds with existing
  const updatedThresholds: DifficultyThresholds = {
    time: { ...existingThresholds.time, ...newThresholds.time },
    ingredients: { ...existingThresholds.ingredients, ...newThresholds.ingredients },
    steps: { ...existingThresholds.steps, ...newThresholds.steps },
  };

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    difficultyThresholds: updatedThresholds,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/difficulty");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reset difficulty thresholds to defaults
 */
export async function resetDifficultyThresholds(): Promise<{ error: string | null }> {
  return updateDifficultyThresholds(DEFAULT_DIFFICULTY_THRESHOLDS);
}
```

### sharing.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { Recipe } from "@/types/recipe";
import type { ShareLinkResponse, ShareAnalytics, UserProfile } from "@/types/social";
import { randomBytes, createHash } from "crypto";

// ============================================
// SHARE TOKEN MANAGEMENT
// ============================================

/**
 * Generate a secure share token for a recipe
 */
export async function generateShareToken(recipeId: string): Promise<{
  error: string | null;
  data: ShareLinkResponse | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id, share_token")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only share your own recipes", data: null };
  }

  // If token already exists, return it
  if (recipe.share_token) {
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${recipe.share_token}`;
    return {
      error: null,
      data: { share_token: recipe.share_token, share_url: shareUrl },
    };
  }

  // Generate new token
  const shareToken = randomBytes(16).toString("hex");

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ share_token: shareToken })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, data: null };
  }

  // Log the share event
  await supabase.from("recipe_share_events").insert({
    recipe_id: recipeId,
    event_type: "share_link_created",
    viewer_id: authUser.id,
  });

  revalidatePath(`/app/recipes/${recipeId}`);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${shareToken}`;
  return {
    error: null,
    data: { share_token: shareToken, share_url: shareUrl },
  };
}

/**
 * Revoke a share token (make recipe private again)
 */
export async function revokeShareToken(recipeId: string): Promise<{
  error: string | null;
  success: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", success: false };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only manage your own recipes", success: false };
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ share_token: null })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath(`/app/recipes/${recipeId}`);
  return { error: null, success: true };
}

// ============================================
// PUBLIC TOGGLE
// ============================================

/**
 * Toggle recipe public status
 * Requires username to be set before making public
 */
export async function toggleRecipePublic(
  recipeId: string,
  isPublic: boolean
): Promise<{
  error: string | null;
  success: boolean;
  requiresUsername?: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", success: false };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only manage your own recipes", success: false };
  }

  // If making public, verify user has a username set
  if (isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", authUser.id)
      .single();

    if (!profile?.username) {
      return {
        error: "You need to set a username before sharing recipes publicly",
        success: false,
        requiresUsername: true,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ is_public: isPublic })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath(`/app/recipes/${recipeId}`);
  revalidatePath("/app/discover");
  return { error: null, success: true };
}

// ============================================
// GUEST ACCESS (NO AUTH REQUIRED)
// ============================================

/**
 * Get a recipe by share token (for guest viewing)
 * This can be called without authentication
 */
export async function getRecipeByShareToken(token: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or link has expired", data: null };
  }

  // Transform the data to include author info
  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}

/**
 * Get a public recipe by ID (for guest viewing)
 */
export async function getPublicRecipe(recipeId: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("id", recipeId)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or is private", data: null };
  }

  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}

// ============================================
// VIEW TRACKING
// ============================================

/**
 * Track a recipe view (rate-limited per IP)
 * Can be called without authentication
 */
export async function trackRecipeView(
  recipeId: string,
  ipAddress?: string,
  referrer?: string,
  userAgent?: string
): Promise<{ error: string | null; counted: boolean }> {
  const supabase = await createClient();

  // Hash the IP address for privacy
  const ipHash = ipAddress
    ? createHash("sha256").update(ipAddress).digest("hex").substring(0, 32)
    : null;

  // Try to get current user (optional)
  let viewerId: string | null = null;
  try {
    const { user } = await getCachedUser();
    viewerId = user?.id || null;
  } catch {
    // Guest user, no viewer ID
  }

  // Call the rate-limited view function
  const { data, error } = await supabase.rpc("increment_recipe_view", {
    p_recipe_id: recipeId,
    p_ip_hash: ipHash,
    p_viewer_id: viewerId,
    p_referrer: referrer?.substring(0, 500) || null,
    p_user_agent: userAgent?.substring(0, 500) || null,
  });

  if (error) {
    console.error("Failed to track view:", error);
    return { error: error.message, counted: false };
  }

  return { error: null, counted: data === true };
}

// ============================================
// SHARE ANALYTICS
// ============================================

/**
 * Get share analytics for a recipe (owner only)
 */
export async function getShareAnalytics(recipeId: string): Promise<{
  error: string | null;
  data: ShareAnalytics | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id, view_count")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only view analytics for your own recipes", data: null };
  }

  // Get detailed analytics
  const { data: events, error: eventsError } = await supabase
    .from("recipe_share_events")
    .select("event_type, viewer_id")
    .eq("recipe_id", recipeId);

  if (eventsError) {
    return { error: eventsError.message, data: null };
  }

  const analytics: ShareAnalytics = {
    total_views: recipe.view_count || 0,
    unique_views: new Set(
      events?.filter((e) => e.event_type === "view").map((e) => e.viewer_id)
    ).size,
    copies: events?.filter((e) => e.event_type === "copy_recipe").length || 0,
    signups_from_share:
      events?.filter((e) => e.event_type === "signup_from_share").length || 0,
  };

  return { error: null, data: analytics };
}

// ============================================
// USERNAME MANAGEMENT
// ============================================

/**
 * Check if a username is available
 */
export async function checkUsernameAvailable(username: string): Promise<{
  error: string | null;
  available: boolean;
  suggestion?: string;
}> {
  // Validate format
  const usernameRegex = /^[a-z0-9_]{3,30}$/;
  const normalizedUsername = username.toLowerCase();

  if (!usernameRegex.test(normalizedUsername)) {
    return {
      error: "Username must be 3-30 characters, lowercase letters, numbers, and underscores only",
      available: false,
    };
  }

  if (/^[0-9]/.test(normalizedUsername)) {
    return { error: "Username cannot start with a number", available: false };
  }

  const reserved = [
    "admin",
    "moderator",
    "support",
    "help",
    "system",
    "official",
    "staff",
    "null",
    "undefined",
  ];
  if (reserved.includes(normalizedUsername)) {
    return { error: "This username is reserved", available: false };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    return { error: error.message, available: false };
  }

  if (data) {
    // Suggest alternative
    const suggestion = `${normalizedUsername}${Math.floor(Math.random() * 1000)}`;
    return { error: null, available: false, suggestion };
  }

  return { error: null, available: true };
}

/**
 * Set or update username
 */
export async function setUsername(username: string): Promise<{
  error: string | null;
  success: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const normalizedUsername = username.toLowerCase();

  // Check availability
  const { available, error: checkError } = await checkUsernameAvailable(
    normalizedUsername
  );
  if (checkError || !available) {
    return { error: checkError || "Username is not available", success: false };
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username: normalizedUsername })
    .eq("id", authUser.id);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath("/app/settings");
  return { error: null, success: true };
}

/**
 * Get user's current profile for sharing
 */
export async function getCurrentUserProfile(): Promise<{
  error: string | null;
  data: UserProfile | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error || !data) {
    return { error: error?.message || "Profile not found", data: null };
  }

  return {
    error: null,
    data: {
      id: data.id,
      username: data.username || "",
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      public_profile: data.public_profile || false,
      follower_count: data.follower_count || 0,
      following_count: data.following_count || 0,
      created_at: data.created_at,
    } as UserProfile,
  };
}

// ============================================
// COPY RECIPE
// ============================================

/**
 * Copy a public recipe to user's own collection
 */
export async function copyPublicRecipe(recipeId: string): Promise<{
  error: string | null;
  data: { newRecipeId: string } | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const { household } = await getCachedUserWithHousehold();
  const supabase = await createClient();

  // Get the original recipe
  const { data: originalRecipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .or("is_public.eq.true,share_token.not.is.null")
    .single();

  if (recipeError || !originalRecipe) {
    return { error: "Recipe not found or is private", data: null };
  }

  // Don't allow copying own recipes
  if (originalRecipe.user_id === authUser.id) {
    return { error: "You already own this recipe", data: null };
  }

  // Create the copy
  const { data: newRecipe, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title: originalRecipe.title,
      recipe_type: originalRecipe.recipe_type,
      category: originalRecipe.category,
      protein_type: originalRecipe.protein_type,
      prep_time: originalRecipe.prep_time,
      cook_time: originalRecipe.cook_time,
      servings: originalRecipe.servings,
      base_servings: originalRecipe.base_servings,
      ingredients: originalRecipe.ingredients,
      instructions: originalRecipe.instructions,
      tags: originalRecipe.tags,
      notes: originalRecipe.notes,
      source_url: originalRecipe.source_url,
      image_url: originalRecipe.image_url,
      allergen_tags: originalRecipe.allergen_tags,
      user_id: authUser.id,
      household_id: household?.household_id || null,
      is_shared_with_household: false,
      is_public: false,
      original_recipe_id: originalRecipe.id,
      original_author_id: originalRecipe.user_id,
    })
    .select("id")
    .single();

  if (insertError || !newRecipe) {
    return { error: insertError?.message || "Failed to copy recipe", data: null };
  }

  // Log the copy event
  await supabase.from("recipe_share_events").insert({
    recipe_id: recipeId,
    event_type: "copy_recipe",
    viewer_id: authUser.id,
  });

  revalidatePath("/app/recipes");
  return { error: null, data: { newRecipeId: newRecipe.id } };
}

/**
 * Get the original author of a copied recipe
 */
export async function getOriginalAuthor(authorId: string): Promise<{
  error: string | null;
  data: { username: string; id: string } | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", authorId)
    .single();

  if (error || !data) {
    return { error: null, data: null };
  }

  return {
    error: null,
    data: {
      id: data.id,
      username: data.username || "Anonymous",
    },
  };
}
```

### shopping-list.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
  NewShoppingListItem,
} from "@/types/shopping-list";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";
import { getWeekStart } from "@/types/meal-plan";

// Get or create the current shopping list for the household
// Automatically links to the current week's meal plan
export async function getOrCreateShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get the current week start
  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Find or create the current week's meal plan
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("week_start", weekStartStr)
    .maybeSingle();

  if (!mealPlan) {
    // Create meal plan for this week
    const { data: newPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: membership.household_id,
        week_start: weekStartStr,
      })
      .select()
      .single();

    if (planError) {
      return { error: planError.message, data: null };
    }
    mealPlan = newPlan;
  }

  // Try to get existing shopping list linked to this meal plan
  let { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("meal_plan_id", mealPlan.id)
    .maybeSingle();

  // Create if doesn't exist
  if (!shoppingList) {
    const { data: newList, error } = await supabase
      .from("shopping_lists")
      .insert({
        household_id: membership.household_id,
        meal_plan_id: mealPlan.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }
    shoppingList = newList;
  }

  return { error: null, data: shoppingList as ShoppingList };
}

// Get shopping list with all items
export async function getShoppingListWithItems(): Promise<{
  error: string | null;
  data: ShoppingListWithItems | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error, data: null };
  }

  // Get items
  const { data: items, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", listResult.data.id)
    .order("category")
    .order("ingredient");

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      ...listResult.data,
      items: (items || []) as ShoppingListItem[],
    },
  };
}

// Add item to shopping list
export async function addShoppingListItem(item: NewShoppingListItem) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase.from("shopping_list_items").insert({
    shopping_list_id: listResult.data.id,
    ingredient: item.ingredient,
    quantity: item.quantity || null,
    unit: item.unit || null,
    category: item.category || "Other",
    recipe_id: item.recipe_id || null,
    recipe_title: item.recipe_title || null,
    is_checked: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Toggle item checked status
export async function toggleShoppingListItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get current item status
  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("is_checked")
    .eq("id", itemId)
    .maybeSingle();

  if (!item) {
    return { error: "Item not found" };
  }

  // Toggle
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ is_checked: !item.is_checked })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove item from shopping list
export async function removeShoppingListItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Clear all checked items
export async function clearCheckedItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id)
    .eq("is_checked", true);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Clear entire shopping list
export async function clearShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove all items from a specific recipe
export async function removeItemsByRecipeId(recipeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", count: 0 };
  }

  // Count items before deletion for feedback
  const { count: itemCount } = await supabase
    .from("shopping_list_items")
    .select("*", { count: "exact", head: true })
    .eq("shopping_list_id", listResult.data.id)
    .eq("recipe_id", recipeId);

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id)
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, count: 0 };
  }

  revalidatePath("/app/shop");
  return { error: null, count: itemCount || 0 };
}

// Generate shopping list from meal plan
// Uses the current week's meal plan (automatically linked via getOrCreateShoppingList)
export async function generateFromMealPlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get or create shopping list (automatically linked to current week's meal plan)
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", count: 0 };
  }

  const shoppingList = listResult.data;

  // Get meal plan from the shopping list
  if (!shoppingList.meal_plan_id) {
    return { error: "No meal plan linked to shopping list", count: 0 };
  }

  // Get all assignments with recipe details
  const { data: assignments } = await supabase
    .from("meal_assignments")
    .select(
      `
      recipe_id,
      recipe:recipes(id, title, ingredients)
    `
    )
    .eq("meal_plan_id", shoppingList.meal_plan_id);

  if (!assignments || assignments.length === 0) {
    return { error: "No meals planned for this week", count: 0 };
  }

  // Collect all ingredients from all recipes
  const ingredientsToAdd: MergeableItem[] = [];

  for (const assignment of assignments) {
    const recipe = assignment.recipe as unknown as {
      id: string;
      title: string;
      ingredients: string[];
    };

    if (recipe && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        // Parse ingredient (basic parsing - could be enhanced)
        const parsed = parseIngredient(ingredient);
        ingredientsToAdd.push({
          ...parsed,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
        });
      }
    }
  }

  // Merge duplicate ingredients with smart unit conversion
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Get existing items in the shopping list to avoid duplicates
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("ingredient, recipe_id")
    .eq("shopping_list_id", shoppingList.id);

  // Create a set of existing recipe IDs for quick lookup
  const existingRecipeIds = new Set(
    (existingItems || [])
      .filter(item => item.recipe_id)
      .map(item => item.recipe_id)
  );

  // Filter out items that are already in the list (by recipe_id)
  // This prevents duplicates when regenerating from the same meal plan
  const newItems = mergedItems.filter(item => {
    const recipeId = item.sources[0]?.recipe_id;
    return recipeId ? !existingRecipeIds.has(recipeId) : true;
  });

  // Add only new merged ingredients to shopping list
  if (newItems.length > 0) {
    const itemsToInsert = newItems.map((item) => ({
      shopping_list_id: shoppingList.id,
      ingredient: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      category: item.category || "Other",
      // Store the first recipe source; sources array is for future display
      recipe_id: item.sources[0]?.recipe_id || null,
      recipe_title: item.sources.length > 1
        ? `${item.sources[0]?.recipe_title || "Recipe"} +${item.sources.length - 1} more`
        : item.sources[0]?.recipe_title || null,
      is_checked: false,
    }));

    const { error } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (error) {
      return { error: error.message, count: 0 };
    }
  }

  revalidatePath("/app/shop");
  return { error: null, count: newItems.length };
}

// Simple ingredient parser
function parseIngredient(ingredient: string): NewShoppingListItem {
  // Try to extract quantity and unit from beginning
  // Pattern: "2 cups flour" or "1/2 lb chicken" or "3 large eggs"
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|oz|lb|lbs?|g|kg|ml|l|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim() || undefined,
      unit: quantityMatch[2]?.trim() || undefined,
      ingredient: quantityMatch[3]?.trim() || ingredient,
      category: guessCategory(ingredient),
    };
  }

  return {
    ingredient: ingredient.trim(),
    category: guessCategory(ingredient),
  };
}

// Guess ingredient category based on keywords
function guessCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  // Produce
  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  // Meat & Seafood
  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  // Dairy & Eggs
  if (
    /milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  // Bakery
  if (/bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette/i.test(lower)) {
    return "Bakery";
  }

  // Pantry
  if (
    /flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  // Frozen
  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  // Spices
  if (
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning|fennel|cardamom|coriander|clove|allspice|anise|caraway|dill|mustard seed/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  // Condiments
  if (
    /ketchup|mustard|mayo|mayonnaise|relish|hot sauce|bbq|dressing|salsa/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  // Beverages (using word boundaries to prevent "tea" matching "teaspoon")
  if (/\b(juice|soda|water|coffee|tea|wine|beer)\b/i.test(lower)) {
    return "Beverages";
  }

  return "Other";
}

// Generate shopping list from multiple weeks' meal plans (Pro+ feature)
export async function generateMultiWeekShoppingList(
  weekStarts: string[]
): Promise<{
  error: string | null;
  data: ShoppingListWithItems | null;
  itemCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null, itemCount: 0 };
  }

  if (!weekStarts || weekStarts.length === 0) {
    return { error: "No weeks selected", data: null, itemCount: 0 };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No household found", data: null, itemCount: 0 };
  }

  // Get meal plans for all selected weeks
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", membership.household_id)
    .in("week_start", weekStarts);

  if (!mealPlans || mealPlans.length === 0) {
    return { error: "No meal plans found for selected weeks", data: null, itemCount: 0 };
  }

  const mealPlanIds = mealPlans.map((mp) => mp.id);

  // Get all assignments with recipe details from all selected weeks
  const { data: assignments } = await supabase
    .from("meal_assignments")
    .select(
      `
      recipe_id,
      recipe:recipes(id, title, ingredients)
    `
    )
    .in("meal_plan_id", mealPlanIds);

  if (!assignments || assignments.length === 0) {
    return { error: "No meals planned for selected weeks", data: null, itemCount: 0 };
  }

  // Collect all ingredients from all recipes
  const ingredientsToAdd: MergeableItem[] = [];

  for (const assignment of assignments) {
    const recipe = assignment.recipe as unknown as {
      id: string;
      title: string;
      ingredients: string[];
    };

    if (recipe && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        const parsed = parseIngredient(ingredient);
        ingredientsToAdd.push({
          ...parsed,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
        });
      }
    }
  }

  // Merge duplicate ingredients with smart unit conversion
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Get or create shopping list for current week (default list)
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", data: null, itemCount: 0 };
  }

  const shoppingList = listResult.data;

  // Clear existing items before adding new multi-week items
  await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", shoppingList.id);

  // Add merged ingredients to shopping list
  const itemsToInsert = mergedItems.map((item) => ({
    shopping_list_id: shoppingList.id,
    ingredient: item.ingredient,
    quantity: item.quantity || null,
    unit: item.unit || null,
    category: item.category || "Other",
    recipe_id: item.sources[0]?.recipe_id || null,
    recipe_title:
      item.sources.length > 1
        ? `${item.sources[0]?.recipe_title || "Recipe"} +${item.sources.length - 1} more`
        : item.sources[0]?.recipe_title || null,
    is_checked: false,
  }));

  if (itemsToInsert.length > 0) {
    const { error } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (error) {
      return { error: error.message, data: null, itemCount: 0 };
    }
  }

  // Fetch the updated shopping list with items
  const { data: items, error: fetchError } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", shoppingList.id)
    .order("category")
    .order("ingredient");

  if (fetchError) {
    return { error: fetchError.message, data: null, itemCount: 0 };
  }

  revalidatePath("/app/shop");

  return {
    error: null,
    data: {
      ...shoppingList,
      items: (items || []) as ShoppingListItem[],
    },
    itemCount: items?.length || 0,
  };
}
```

### sidebar-preferences.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  PinnedItem,
  SidebarMode,
  SidebarPreferences,
  UserPreferencesV2,
} from "@/types/user-preferences-v2";
import {
  DEFAULT_SIDEBAR_PREFERENCES,
  DEFAULT_USER_PREFERENCES_V2,
} from "@/types/user-preferences-v2";

// ============================================================================
// Get Sidebar Preferences
// ============================================================================

export async function getSidebarPreferences(
  userId: string
): Promise<{ error: string | null; data: SidebarPreferences }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return { error: null, data: DEFAULT_SIDEBAR_PREFERENCES };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;

  return {
    error: null,
    data: {
      ...DEFAULT_SIDEBAR_PREFERENCES,
      ...(prefs.sidebar || {}),
    },
  };
}

// Auto-authenticated version
export async function getSidebarPreferencesAuto(): Promise<{
  error: string | null;
  data: SidebarPreferences;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: DEFAULT_SIDEBAR_PREFERENCES };
  }

  return getSidebarPreferences(user.id);
}

// ============================================================================
// Update Sidebar Preferences
// ============================================================================

export async function updateSidebarPreferences(
  userId: string,
  preferences: Partial<SidebarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  const currentPrefs = (settings?.preferences_v2 as Partial<UserPreferencesV2>) || {};

  const updatedPreferences = {
    ...currentPrefs,
    sidebar: {
      ...DEFAULT_SIDEBAR_PREFERENCES,
      ...(currentPrefs.sidebar || {}),
      ...preferences,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, preferences_v2: updatedPreferences },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error updating sidebar preferences:", error);
    return { error: "Failed to update sidebar preferences" };
  }

  revalidatePath("/app");
  return { error: null };
}

// Auto-authenticated version
export async function updateSidebarPreferencesAuto(
  preferences: Partial<SidebarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateSidebarPreferences(user.id, preferences);
}

// ============================================================================
// Pin/Unpin Items
// ============================================================================

export async function pinSidebarItem(
  userId: string,
  item: Omit<PinnedItem, "addedAt">
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  // Check if already pinned
  const alreadyPinned = currentPrefs.pinnedItems.some(
    (p) => p.id === item.id && p.type === item.type
  );

  if (alreadyPinned) {
    return { error: null }; // Already pinned, no-op
  }

  const newItem: PinnedItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };

  return updateSidebarPreferences(userId, {
    pinnedItems: [...currentPrefs.pinnedItems, newItem],
  });
}

export async function pinSidebarItemAuto(
  item: Omit<PinnedItem, "addedAt">
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return pinSidebarItem(user.id, item);
}

export async function unpinSidebarItem(
  userId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  const updatedPinnedItems = currentPrefs.pinnedItems.filter(
    (p) => p.id !== itemId
  );

  return updateSidebarPreferences(userId, {
    pinnedItems: updatedPinnedItems,
  });
}

export async function unpinSidebarItemAuto(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return unpinSidebarItem(user.id, itemId);
}

// ============================================================================
// Reorder Pinned Items
// ============================================================================

export async function reorderPinnedItems(
  userId: string,
  itemIds: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  // Create a map for quick lookup
  const itemMap = new Map(currentPrefs.pinnedItems.map((item) => [item.id, item]));

  // Reorder based on new order, keeping only items that exist
  const reorderedItems = itemIds
    .map((id) => itemMap.get(id))
    .filter((item): item is PinnedItem => item !== undefined);

  return updateSidebarPreferences(userId, {
    pinnedItems: reorderedItems,
  });
}

export async function reorderPinnedItemsAuto(
  itemIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderPinnedItems(user.id, itemIds);
}

// ============================================================================
// Mode & Hover Settings
// ============================================================================

export async function setSidebarMode(
  userId: string,
  mode: SidebarMode
): Promise<{ error: string | null }> {
  return updateSidebarPreferences(userId, { mode });
}

export async function setSidebarModeAuto(
  mode: SidebarMode
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return setSidebarMode(user.id, mode);
}

// ============================================================================
// Width Persistence
// ============================================================================

export async function setSidebarWidth(
  userId: string,
  width: number
): Promise<{ error: string | null }> {
  return updateSidebarPreferences(userId, { width });
}

export async function setSidebarWidthAuto(
  width: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return setSidebarWidth(user.id, width);
}
```

### sidebar-section-actions.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserPreferencesV2 } from "@/types/user-preferences-v2";
import type {
  SidebarPreferencesV2,
  BuiltInSectionConfig,
  CustomSectionConfig,
  CustomSectionItem,
  BuiltInSectionId,
  SectionItemConfig,
} from "@/types/sidebar-customization";
import {
  DEFAULT_SIDEBAR_PREFERENCES_V2,
  DEFAULT_MEAL_PLANNING_ITEMS,
  isBuiltInSectionId,
} from "@/types/sidebar-customization";
import { normalizeSidebarPreferences } from "@/lib/sidebar/sidebar-migration";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets current sidebar preferences V2 from database.
 */
async function getSidebarPreferencesV2(
  userId: string
): Promise<{ error: string | null; data: SidebarPreferencesV2 }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return {
      error: null,
      data: structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2),
    };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;
  const sidebarPrefs = normalizeSidebarPreferences(prefs.sidebar);

  return { error: null, data: sidebarPrefs };
}

/**
 * Updates sidebar preferences V2 in database.
 */
async function updateSidebarPreferencesV2(
  userId: string,
  sidebarPrefs: SidebarPreferencesV2
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current full preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  const currentPrefs =
    (settings?.preferences_v2 as Partial<UserPreferencesV2>) || {};

  // Cast through unknown to handle backwards compatibility between v1 and v2
  const updatedPreferences = {
    ...currentPrefs,
    sidebar: sidebarPrefs as unknown,
  } as Partial<UserPreferencesV2>;

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, preferences_v2: updatedPreferences },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error updating sidebar preferences V2:", error);
    return { error: "Failed to update sidebar preferences" };
  }

  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Section Order
// ============================================================================

export async function reorderSections(
  userId: string,
  sectionIds: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  // Validate that all provided IDs exist
  const validIds = sectionIds.filter((id) => currentPrefs.sections[id]);

  // Ensure all sections are included (add any missing ones at the end)
  const allSectionIds = Object.keys(currentPrefs.sections);
  const missingIds = allSectionIds.filter((id) => !validIds.includes(id));
  const newOrder = [...validIds, ...missingIds];

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sectionOrder: newOrder,
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function reorderSectionsAuto(
  sectionIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderSections(user.id, sectionIds);
}

// ============================================================================
// Built-in Section Updates
// ============================================================================

export async function updateBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  updates: Partial<
    Pick<
      BuiltInSectionConfig,
      | "customTitle"
      | "customIcon"
      | "customEmoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    ...updates,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function updateBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  updates: Partial<
    Pick<
      BuiltInSectionConfig,
      | "customTitle"
      | "customIcon"
      | "customEmoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateBuiltInSection(user.id, sectionId, updates);
}

// ============================================================================
// Built-in Section Item Operations
// ============================================================================

/**
 * Updates a built-in item within a section (rename, icon, emoji, hide).
 */
export async function updateBuiltInItem(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string,
  updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  // Check if itemId is a valid built-in item for this section
  const existingItem = section.items[itemId];
  if (!existingItem) {
    return { error: "Invalid item ID for this section" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    items: {
      ...section.items,
      [itemId]: {
        ...existingItem,
        ...updates,
      },
    },
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function updateBuiltInItemAuto(
  sectionId: BuiltInSectionId,
  itemId: string,
  updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateBuiltInItem(user.id, sectionId, itemId, updates);
}

/**
 * Reorders items within a built-in section.
 * The itemOrder array can contain both built-in item IDs and custom item UUIDs.
 */
export async function reorderBuiltInItems(
  userId: string,
  sectionId: BuiltInSectionId,
  itemOrder: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  // Validate: ensure all built-in items and custom items are included
  const builtInItemIds = Object.keys(section.items);
  const customItemIds = section.customItems.map((item) => item.id);
  const allValidIds = new Set([...builtInItemIds, ...customItemIds]);

  // Filter to only valid IDs and ensure all are included
  const validOrder = itemOrder.filter((id) => allValidIds.has(id));
  const missingIds = [...builtInItemIds, ...customItemIds].filter(
    (id) => !validOrder.includes(id)
  );
  const finalOrder = [...validOrder, ...missingIds];

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    itemOrder: finalOrder,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function reorderBuiltInItemsAuto(
  sectionId: BuiltInSectionId,
  itemOrder: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderBuiltInItems(user.id, sectionId, itemOrder);
}

/**
 * Adds a custom item (link) to a built-in section.
 * The item will be added to the end of the itemOrder array.
 */
export async function addCustomItemToBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  const itemId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...section.customItems.map((i) => i.sortOrder),
    -1
  );

  const newItem: CustomSectionItem = {
    ...item,
    id: itemId,
    sortOrder: maxSortOrder + 1,
  } as CustomSectionItem;

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    customItems: [...section.customItems, newItem],
    itemOrder: [...section.itemOrder, itemId],
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, itemId };
}

export async function addCustomItemToBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return addCustomItemToBuiltInSection(user.id, sectionId, item);
}

/**
 * Removes a custom item from a built-in section.
 */
export async function removeCustomItemFromBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  // Ensure we're only removing custom items, not built-in items
  const itemExists = section.customItems.some((i) => i.id === itemId);
  if (!itemExists) {
    return { error: "Custom item not found in section" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    customItems: section.customItems.filter((i) => i.id !== itemId),
    itemOrder: section.itemOrder.filter((id) => id !== itemId),
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function removeCustomItemFromBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return removeCustomItemFromBuiltInSection(user.id, sectionId, itemId);
}

/**
 * Resets a built-in item to its default configuration.
 */
export async function resetBuiltInItem(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  // Get the default config for this item
  const defaultItem = DEFAULT_MEAL_PLANNING_ITEMS[itemId];
  if (!defaultItem) {
    return { error: "Invalid item ID - cannot reset custom items" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    items: {
      ...section.items,
      [itemId]: structuredClone(defaultItem),
    },
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function resetBuiltInItemAuto(
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return resetBuiltInItem(user.id, sectionId, itemId);
}

// ============================================================================
// Custom Section CRUD
// ============================================================================

export async function createCustomSection(
  userId: string,
  section: Omit<CustomSectionConfig, "id" | "createdAt" | "sortOrder">
): Promise<{ error: string | null; sectionId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const sectionId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...Object.values(currentPrefs.sections).map((s) => s.sortOrder),
    -1
  );

  const newSection: CustomSectionConfig = {
    ...section,
    id: sectionId,
    type: "custom",
    sortOrder: maxSortOrder + 1,
    createdAt: new Date().toISOString(),
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: newSection,
    },
    sectionOrder: [...currentPrefs.sectionOrder, sectionId],
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, sectionId };
}

export async function createCustomSectionAuto(
  section: Omit<CustomSectionConfig, "id" | "createdAt" | "sortOrder">
): Promise<{ error: string | null; sectionId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return createCustomSection(user.id, section);
}

export async function updateCustomSection(
  userId: string,
  sectionId: string,
  updates: Partial<
    Pick<
      CustomSectionConfig,
      | "title"
      | "icon"
      | "emoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const updatedSection: CustomSectionConfig = {
    ...section,
    ...updates,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function updateCustomSectionAuto(
  sectionId: string,
  updates: Partial<
    Pick<
      CustomSectionConfig,
      | "title"
      | "icon"
      | "emoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateCustomSection(user.id, sectionId, updates);
}

export async function deleteCustomSection(
  userId: string,
  sectionId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section) {
    return { error: "Section not found" };
  }

  if (section.type !== "custom") {
    return { error: "Cannot delete built-in sections" };
  }

  // Remove from sections
  const { [sectionId]: removed, ...remainingSections } = currentPrefs.sections;

  // Remove from order
  const newSectionOrder = currentPrefs.sectionOrder.filter(
    (id) => id !== sectionId
  );

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: remainingSections,
    sectionOrder: newSectionOrder,
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function deleteCustomSectionAuto(
  sectionId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return deleteCustomSection(user.id, sectionId);
}

// ============================================================================
// Custom Section Items
// ============================================================================

export async function addCustomSectionItem(
  userId: string,
  sectionId: string,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const itemId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...section.items.map((i) => i.sortOrder),
    -1
  );

  const newItem: CustomSectionItem = {
    ...item,
    id: itemId,
    sortOrder: maxSortOrder + 1,
  } as CustomSectionItem;

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: [...section.items, newItem],
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, itemId };
}

export async function addCustomSectionItemAuto(
  sectionId: string,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return addCustomSectionItem(user.id, sectionId, item);
}

export async function updateCustomSectionItem(
  userId: string,
  sectionId: string,
  itemId: string,
  updates: Partial<Omit<CustomSectionItem, "id" | "type" | "sortOrder">>
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const itemIndex = section.items.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    return { error: "Item not found in section" };
  }

  const updatedItems = [...section.items];
  updatedItems[itemIndex] = {
    ...updatedItems[itemIndex],
    ...updates,
  } as CustomSectionItem;

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: updatedItems,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function updateCustomSectionItemAuto(
  sectionId: string,
  itemId: string,
  updates: Partial<Omit<CustomSectionItem, "id" | "type" | "sortOrder">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateCustomSectionItem(user.id, sectionId, itemId, updates);
}

export async function removeCustomSectionItem(
  userId: string,
  sectionId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const updatedItems = section.items.filter((i) => i.id !== itemId);

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: updatedItems,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function removeCustomSectionItemAuto(
  sectionId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return removeCustomSectionItem(user.id, sectionId, itemId);
}

// ============================================================================
// Bulk Operations
// ============================================================================

export async function resetSectionCustomization(
  userId: string
): Promise<{ error: string | null }> {
  const resetPrefs = structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2);
  return updateSidebarPreferencesV2(userId, resetPrefs);
}

export async function resetSectionCustomizationAuto(): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return resetSectionCustomization(user.id);
}
```

### smart-folders.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  SystemSmartFolder,
  SmartFilterCriteria,
} from "@/types/smart-folder";
import type { FolderWithChildren } from "@/types/folder";

// =====================================================
// SMART FOLDER FORM DATA
// =====================================================

export interface SmartFolderFormData {
  name: string;
  emoji?: string | null;
  color?: string | null;
  smart_filters: SmartFilterCriteria;
  category_id?: string | null;
}

// =====================================================
// SYSTEM SMART FOLDERS (Built-in, Read-Only)
// =====================================================

/**
 * Get all system smart folders (built-in, read-only)
 */
export async function getSystemSmartFolders(): Promise<{
  error: string | null;
  data: SystemSmartFolder[] | null;
}> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("system_smart_folders")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Parse JSONB smart_filters into typed objects
  const parsed: SystemSmartFolder[] = data.map((folder) => ({
    ...folder,
    smart_filters:
      typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters,
  }));

  return { error: null, data: parsed };
}

// =====================================================
// USER SMART FOLDERS (Household-owned, Editable)
// =====================================================

/**
 * Get all user-created smart folders for the household
 */
export async function getUserSmartFolders(): Promise<{
  error: string | null;
  data: FolderWithChildren[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("recipe_folders")
    .select("*")
    .eq("household_id", household.household_id)
    .eq("is_smart", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Convert to FolderWithChildren format (smart folders don't have children)
  const smartFolders: FolderWithChildren[] = folders.map((folder) => ({
    ...folder,
    smart_filters:
      typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters,
    children: [],
    recipe_count: 0, // Dynamic count calculated client-side
    cover_image_url: null,
  }));

  return { error: null, data: smartFolders };
}

/**
 * Create a new smart folder
 */
export async function createSmartFolder(
  formData: SmartFolderFormData
): Promise<{ error: string | null; data: FolderWithChildren | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Validate that filters exist
  if (!formData.smart_filters?.conditions || formData.smart_filters.conditions.length === 0) {
    return { error: "Smart folders must have at least one filter condition", data: null };
  }

  const supabase = await createClient();

  // Get max sort_order for smart folders
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .eq("is_smart", true)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existingFolders?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("recipe_folders")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: formData.name,
      emoji: formData.emoji || null,
      color: formData.color || null,
      is_smart: true,
      smart_filters: formData.smart_filters,
      parent_folder_id: null, // Smart folders can't have parents
      cover_recipe_id: null, // No cover image for smart folders
      category_id: formData.category_id || null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  const smartFolder: FolderWithChildren = {
    ...data,
    smart_filters:
      typeof data.smart_filters === "string"
        ? JSON.parse(data.smart_filters)
        : data.smart_filters,
    children: [],
    recipe_count: 0,
    cover_image_url: null,
  };

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: smartFolder };
}

/**
 * Update an existing smart folder
 */
export async function updateSmartFolder(
  id: string,
  formData: Partial<SmartFolderFormData>
): Promise<{ error: string | null; data: FolderWithChildren | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify the folder exists, is owned by household, and is a smart folder
  const { data: existing } = await supabase
    .from("recipe_folders")
    .select("is_smart")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (!existing) {
    return { error: "Smart folder not found", data: null };
  }

  if (!existing.is_smart) {
    return { error: "This is not a smart folder", data: null };
  }

  // Validate filters if provided
  if (formData.smart_filters !== undefined) {
    if (!formData.smart_filters?.conditions || formData.smart_filters.conditions.length === 0) {
      return { error: "Smart folders must have at least one filter condition", data: null };
    }
  }

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
  if (formData.color !== undefined) updateData.color = formData.color || null;
  if (formData.smart_filters !== undefined) {
    updateData.smart_filters = formData.smart_filters;
  }
  if (formData.category_id !== undefined) {
    updateData.category_id = formData.category_id || null;
  }

  const { data, error } = await supabase
    .from("recipe_folders")
    .update(updateData)
    .eq("id", id)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  const smartFolder: FolderWithChildren = {
    ...data,
    smart_filters:
      typeof data.smart_filters === "string"
        ? JSON.parse(data.smart_filters)
        : data.smart_filters,
    children: [],
    recipe_count: 0,
    cover_image_url: null,
  };

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: smartFolder };
}

/**
 * Delete a smart folder
 */
export async function deleteSmartFolder(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify the folder exists, is owned by household, and is a smart folder
  const { data: existing } = await supabase
    .from("recipe_folders")
    .select("is_smart")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (!existing) {
    return { error: "Smart folder not found" };
  }

  if (!existing.is_smart) {
    return { error: "This is not a smart folder" };
  }

  const { error } = await supabase
    .from("recipe_folders")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null };
}

// =====================================================
// COOKING HISTORY CONTEXT DATA
// =====================================================

/**
 * Get cooking history data for smart folder evaluation
 * Returns cook counts and last cooked dates for all household recipes
 */
export async function getCookingHistoryContext(): Promise<{
  error: string | null;
  data: {
    cookCounts: Record<string, number>;
    lastCookedDates: Record<string, string | null>;
  } | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all cooking history for household recipes
  const { data: history, error } = await supabase
    .from("cooking_history")
    .select("recipe_id, cooked_at")
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  // Aggregate cook counts and find last cooked dates
  const cookCounts: Record<string, number> = {};
  const lastCookedDates: Record<string, string | null> = {};

  history?.forEach((entry) => {
    // Increment count
    cookCounts[entry.recipe_id] = (cookCounts[entry.recipe_id] || 0) + 1;

    // Track last cooked date (first occurrence in sorted list)
    if (!lastCookedDates[entry.recipe_id]) {
      lastCookedDates[entry.recipe_id] = entry.cooked_at;
    }
  });

  return { error: null, data: { cookCounts, lastCookedDates } };
}
```

### subscription.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionTier } from "@/types/subscription";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

/**
 * Get subscription data for the current user
 */
export async function getSubscriptionData(): Promise<{
  error: string | null;
  data: SubscriptionData | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get subscription from database (includes stripe_customer_id)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return {
      error: null,
      data: {
        tier: "free",
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      },
    };
  }

  return {
    error: null,
    data: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      stripeCustomerId: subscription.stripe_customer_id || null,
    },
  };
}

/**
 * Create a Stripe Customer Portal session for managing billing
 */
export async function createCustomerPortalSession(): Promise<{
  error: string | null;
  url: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  // Get stripe customer ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return { error: "No billing account found", url: null };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing`,
    });

    return { error: null, url: session.url };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error: "Failed to create billing portal session", url: null };
  }
}
```

### substitutions.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// Types for substitutions
export interface Substitution {
  id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
  is_default: boolean;
}

export interface UserSubstitution {
  id: string;
  user_id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
}

/**
 * Built-in common substitutions fallback
 */
const COMMON_SUBSTITUTIONS: Omit<Substitution, "id">[] = [
  { original_ingredient: "butter", substitute_ingredient: "coconut oil", notes: "Use 1:1 ratio. Great for vegan baking.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "oat milk", notes: "Use 1:1 ratio. Works well in most recipes.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "flax eggs", notes: "Mix 1 tbsp ground flaxseed with 3 tbsp water per egg.", is_default: true },
  { original_ingredient: "heavy cream", substitute_ingredient: "coconut cream", notes: "Use 1:1 ratio. Great for dairy-free recipes.", is_default: true },
  { original_ingredient: "sour cream", substitute_ingredient: "greek yogurt", notes: "Use 1:1 ratio. Tangy and protein-rich.", is_default: true },
];

/**
 * Get all default substitutions
 */
export async function getDefaultSubstitutions(): Promise<Substitution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("substitutions")
    .select("*")
    .eq("is_default", true)
    .order("original_ingredient");

  if (error) {
    console.error("Error fetching default substitutions:", error);
  }

  if (data && data.length > 0) {
    return data as Substitution[];
  }

  return COMMON_SUBSTITUTIONS.map((sub, index) => ({
    ...sub,
    id: `common-${index}`,
  }));
}

/**
 * Get user's custom substitutions
 */
export async function getUserSubstitutions(): Promise<UserSubstitution[]> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_substitutions")
    .select("*")
    .eq("user_id", user.id)
    .order("original_ingredient");

  if (error) {
    console.error("Error fetching user substitutions:", error);
    return [];
  }

  return (data as UserSubstitution[]) || [];
}

export interface UserSubstitutionFormData {
  original_ingredient: string;
  substitute_ingredient: string;
  notes?: string;
}

// Create a user substitution
export async function createUserSubstitution(formData: UserSubstitutionFormData) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_substitutions")
    .insert({
      user_id: user.id,
      original_ingredient: formData.original_ingredient.trim(),
      substitute_ingredient: formData.substitute_ingredient.trim(),
      notes: formData.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Update a user substitution
export async function updateUserSubstitution(
  id: string,
  formData: Partial<UserSubstitutionFormData>
) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.original_ingredient !== undefined)
    updateData.original_ingredient = formData.original_ingredient.trim();
  if (formData.substitute_ingredient !== undefined)
    updateData.substitute_ingredient = formData.substitute_ingredient.trim();
  if (formData.notes !== undefined)
    updateData.notes = formData.notes?.trim() || null;

  const { data, error } = await supabase
    .from("user_substitutions")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Delete a user substitution
export async function deleteUserSubstitution(id: string) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_substitutions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

/**
 * Normalize ingredient name for comparison
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/s$/, ""); // Remove trailing 's' for plurals
}

/**
 * Get all substitutions for a user (defaults + user custom)
 */
async function getAllSubstitutions(): Promise<Substitution[]> {
  const [defaults, userSubs] = await Promise.all([
    getDefaultSubstitutions(),
    getUserSubstitutions(),
  ]);

  const userSubMap = new Map<string, UserSubstitution>();
  userSubs.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    userSubMap.set(key, sub);
  });

  const merged: Substitution[] = [];

  defaults.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    const userSub = userSubMap.get(key);
    if (userSub) {
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    } else {
      merged.push(sub);
    }
  });

  userSubs.forEach((userSub) => {
    const key = normalizeIngredientName(userSub.original_ingredient);
    const hasDefault = defaults.some(
      (d) => normalizeIngredientName(d.original_ingredient) === key
    );
    if (!hasDefault) {
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    }
  });

  return merged;
}

/**
 * Find substitutions for all ingredients in a recipe
 */
export async function findSubstitutionsForIngredients(
  ingredients: string[]
): Promise<Map<string, Substitution[]>> {
  const allSubs = await getAllSubstitutions();
  const result = new Map<string, Substitution[]>();

  for (const ingredient of ingredients) {
    const normalized = normalizeIngredientName(ingredient);
    const matches = allSubs.filter(
      (sub) => normalizeIngredientName(sub.original_ingredient) === normalized
    );

    if (matches.length > 0) {
      result.set(ingredient, matches);
    }
  }

  return result;
}

```

### user-preferences.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserPreferencesV2,
  DisplayPreferences,
  SoundPreferences,
  ServingSizePreset,
  KeyboardPreferences,
  AiPersonalityType,
  PrivacyPreferences,
  RecipeLayoutPreferences,
} from "@/types/user-preferences-v2";
import {
  DEFAULT_USER_PREFERENCES_V2,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_SOUND_PREFERENCES,
  DEFAULT_SERVING_SIZE_PRESETS,
  DEFAULT_KEYBOARD_PREFERENCES,
  DEFAULT_PRIVACY_PREFERENCES,
  DEFAULT_SIDEBAR_PREFERENCES,
  DEFAULT_RECIPE_LAYOUT_PREFERENCES,
} from "@/types/user-preferences-v2";

// ============================================================================
// Get User Preferences V2
// ============================================================================

export async function getUserPreferencesV2(
  userId: string
): Promise<{ error: string | null; data: UserPreferencesV2 }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return { error: null, data: DEFAULT_USER_PREFERENCES_V2 };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;

  // Deep merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      display: {
        ...DEFAULT_DISPLAY_PREFERENCES,
        ...(prefs.display || {}),
      },
      sounds: {
        ...DEFAULT_SOUND_PREFERENCES,
        ...(prefs.sounds || {}),
      },
      servingSizePresets:
        prefs.servingSizePresets || DEFAULT_SERVING_SIZE_PRESETS,
      keyboard: {
        ...DEFAULT_KEYBOARD_PREFERENCES,
        ...(prefs.keyboard || {}),
        shortcuts: {
          ...DEFAULT_KEYBOARD_PREFERENCES.shortcuts,
          ...((prefs.keyboard?.shortcuts as Record<string, string>) || {}),
        },
      },
      aiPersonality: prefs.aiPersonality || "friendly",
      customAiPrompt: prefs.customAiPrompt || null,
      privacy: {
        ...DEFAULT_PRIVACY_PREFERENCES,
        ...(prefs.privacy || {}),
      },
      sidebar: {
        ...DEFAULT_SIDEBAR_PREFERENCES,
        ...(prefs.sidebar || {}),
      },
      recipeLayout: {
        ...DEFAULT_RECIPE_LAYOUT_PREFERENCES,
        ...(prefs.recipeLayout || {}),
        sections: {
          ...DEFAULT_RECIPE_LAYOUT_PREFERENCES.sections,
          ...((prefs.recipeLayout?.sections as Record<string, unknown>) || {}),
        },
        sectionOrder:
          prefs.recipeLayout?.sectionOrder ||
          DEFAULT_RECIPE_LAYOUT_PREFERENCES.sectionOrder,
      },
    },
  };
}

// ============================================================================
// Update Display Preferences
// ============================================================================

export async function updateDisplayPreferences(
  userId: string,
  data: Partial<DisplayPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    display: {
      ...currentPrefs.display,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Sound Preferences
// ============================================================================

export async function updateSoundPreferences(
  userId: string,
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    sounds: {
      ...currentPrefs.sounds,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Serving Size Presets
// ============================================================================

export async function updateServingSizePresets(
  userId: string,
  presets: ServingSizePreset[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    servingSizePresets: presets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Keyboard Shortcuts
// ============================================================================

export async function updateKeyboardShortcuts(
  userId: string,
  shortcuts: Record<string, string>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      shortcuts,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function toggleKeyboardShortcuts(
  userId: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      enabled,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update AI Personality
// ============================================================================

export async function updateAiPersonality(
  userId: string,
  personality: AiPersonalityType,
  customPrompt?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    aiPersonality: personality,
    customAiPrompt: customPrompt || null,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Privacy Preferences
// ============================================================================

export async function updatePrivacyPreferences(
  userId: string,
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  // Safely access privacy with fallback to defaults
  const currentPrivacy = currentPrefs.privacy ?? DEFAULT_PRIVACY_PREFERENCES;

  // Track consent timestamp when any privacy setting changes from false to true
  const updates: Partial<PrivacyPreferences> = { ...data };
  const privacyKeys: (keyof PrivacyPreferences)[] = [
    "analyticsEnabled",
    "crashReporting",
    "personalizedRecommendations",
  ];

  const anyOptIn = privacyKeys.some(
    (key) =>
      data[key] === true && !currentPrivacy[key]
  );

  if (anyOptIn && !currentPrivacy.consentTimestamp) {
    updates.consentTimestamp = new Date().toISOString();
  }

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    privacy: {
      ...currentPrivacy,
      ...updates,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Custom CSS
// ============================================================================

export async function getCustomCss(
  userId: string
): Promise<{ error: string | null; data: string | null }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("custom_css")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: settings?.custom_css || null };
}

export async function setCustomCss(
  userId: string,
  css: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_css: css })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Reset to Defaults
// ============================================================================

export async function resetPreferencesToDefaults(
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({
      preferences_v2: DEFAULT_USER_PREFERENCES_V2,
      custom_css: null,
    })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Auto-authenticated wrappers (for SettingsContext)
// These functions get the current user automatically
// ============================================================================

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function updateDisplayPreferencesAuto(
  data: Partial<DisplayPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateDisplayPreferences(userId, data);
}

export async function updateSoundPreferencesAuto(
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateSoundPreferences(userId, data);
}

export async function updateKeyboardPreferencesAuto(
  data: Partial<KeyboardPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function updateAiPersonalityAuto(
  personality: AiPersonalityType,
  customPrompt: string | null
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateAiPersonality(userId, personality, customPrompt ?? undefined);
}

export async function updateServingSizePresetsAuto(
  presets: ServingSizePreset[]
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateServingSizePresets(userId, presets);
}

export async function updatePrivacyPreferencesAuto(
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updatePrivacyPreferences(userId, data);
}

// ============================================================================
// Update Recipe Layout Preferences
// ============================================================================

export async function updateRecipeLayoutPreferences(
  userId: string,
  data: RecipeLayoutPreferences
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    recipeLayout: data,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function updateRecipeLayoutPreferencesAuto(
  data: RecipeLayoutPreferences
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateRecipeLayoutPreferences(userId, data);
}
```

### voice-cooking.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  ActiveCookingSession,
  NavigationResult,
  VoiceCookingSession,
  VoiceSessionTimer,
  CompleteCookingData,
  CreateTimerData,
  NavigationDirection,
} from "@/types/voice-cooking";

/**
 * Start a new cooking session for a recipe
 */
export async function startCookingSession(
  recipeId: string,
  servingsMultiplier: number = 1
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Call the database function to start the session
  const { data, error } = await supabase.rpc("start_cooking_session", {
    p_recipe_id: recipeId,
    p_servings_multiplier: servingsMultiplier,
    p_platform: "web",
    p_device_type: "desktop",
  });

  if (error) {
    console.error("Error starting cooking session:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Recipe has no instructions")) {
      return { error: "This recipe has no instructions to cook.", data: null };
    }

    return { error: `Failed to start cooking: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: data as string }; // Returns session_id
}

/**
 * Get the current active cooking session for the user
 */
export async function getActiveSession() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Call the database function to get active session
  const { data, error } = await supabase.rpc("get_active_cooking_session");

  if (error) {
    console.error("Error getting active session:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    return { error: `Failed to load session: ${error.message}`, data: null };
  }

  if (!data || data.length === 0) {
    return { error: null, data: null };
  }

  // Get the recipe details for the session
  const sessionData = data[0];
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("title, servings, instructions, ingredients")
    .eq("id", sessionData.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const activeSession: ActiveCookingSession = {
    ...sessionData,
    recipe_title: recipe.title,
    recipe_servings: recipe.servings,
    current_instruction: recipe.instructions[sessionData.current_step - 1] || "",
    instructions: recipe.instructions,
    ingredients: recipe.ingredients,
  };

  return { error: null, data: activeSession };
}

/**
 * Navigate to next, previous, or repeat current step
 */
export async function navigateStep(
  sessionId: string,
  direction: NavigationDirection
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Map direction to the database function parameter
  const directionMap: Record<NavigationDirection, string> = {
    next: "next",
    back: "back",
    repeat: "repeat",
  };

  const { data, error } = await supabase.rpc("navigate_cooking_step", {
    p_session_id: sessionId,
    p_direction: directionMap[direction],
    p_target_step: null,
  });

  if (error) {
    console.error("Error navigating step:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found. Please restart.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to access this session.", data: null };
    }

    return { error: `Navigation failed: ${error.message}`, data: null };
  }

  // Get the updated instruction
  const { data: session, error: sessionError } = await supabase
    .from("voice_cooking_sessions")
    .select("recipe_id, current_step")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found", data: null };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("instructions")
    .eq("id", session.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const navigationResult: NavigationResult = {
    new_step: data[0]?.new_step || session.current_step,
    total_steps: data[0]?.total_steps || recipe.instructions.length,
    is_complete: data[0]?.is_complete || false,
    instruction: recipe.instructions[session.current_step - 1] || "",
  };

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: navigationResult };
}

/**
 * Jump directly to a specific step
 */
export async function jumpToStep(sessionId: string, stepIndex: number) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("navigate_cooking_step", {
    p_session_id: sessionId,
    p_direction: "jump",
    p_target_step: stepIndex,
  });

  if (error) {
    console.error("Error jumping to step:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found. Please restart.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to access this session.", data: null };
    }

    return { error: `Failed to jump to step: ${error.message}`, data: null };
  }

  // Get the updated instruction
  const { data: session, error: sessionError } = await supabase
    .from("voice_cooking_sessions")
    .select("recipe_id, current_step")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found", data: null };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("instructions")
    .eq("id", session.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const navigationResult: NavigationResult = {
    new_step: data[0]?.new_step || session.current_step,
    total_steps: data[0]?.total_steps || recipe.instructions.length,
    is_complete: data[0]?.is_complete || false,
    instruction: recipe.instructions[session.current_step - 1] || "",
  };

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: navigationResult };
}

/**
 * Complete the cooking session and log to history
 */
export async function completeCookingSession(
  sessionId: string,
  data?: CompleteCookingData
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("complete_cooking_session", {
    p_session_id: sessionId,
    p_rating: data?.rating || null,
    p_notes: data?.notes || null,
    p_photo_url: data?.photo_url || null,
  });

  if (error) {
    console.error("Error completing cooking session:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to complete this session.", data: null };
    }

    return { error: `Failed to complete session: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/recipes/[id]", "page");

  return { error: null, data: true };
}

/**
 * Abandon the cooking session without logging to history
 */
export async function abandonSession(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Update the session status to abandoned
  const { error } = await supabase
    .from("voice_cooking_sessions")
    .update({ status: "abandoned", updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error abandoning session:", error);

    // Provide more descriptive error messages
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.code === "PGRST116") {
      return { error: "Session not found or already ended.", data: null };
    }

    return { error: `Failed to exit session: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes");

  return { error: null, data: true };
}

/**
 * Create a new timer for the current session
 */
export async function createTimer(sessionId: string, timerData: CreateTimerData) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_session_timer", {
    p_session_id: sessionId,
    p_label: timerData.label,
    p_duration_seconds: timerData.durationSeconds,
    p_step_index: timerData.stepIndex || null,
    p_alert_message: timerData.alertMessage || null,
  });

  if (error) {
    console.error("Error creating timer:", error);

    // Provide more descriptive error messages
    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to create timers for this session.", data: null };
    }

    return { error: `Failed to create timer: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: data as string }; // Returns timer_id
}

/**
 * Get all active timers for a session
 */
export async function getActiveTimers(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("voice_session_timers")
    .select("*")
    .eq("session_id", sessionId)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error getting active timers:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as VoiceSessionTimer[] };
}

/**
 * Cancel a timer
 */
export async function cancelTimer(timerId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error cancelling timer:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: true };
}

/**
 * Update timer remaining seconds (for client-side countdown sync)
 */
export async function updateTimerRemaining(timerId: string, remainingSeconds: number) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      remaining_seconds: remainingSeconds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error updating timer:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: true };
}

/**
 * Complete a timer
 */
export async function completeTimer(timerId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      status: "completed",
      remaining_seconds: 0,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error completing timer:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: true };
}
```

### waste-tracking.ts
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  type WasteMetrics,
  type AggregateWasteMetrics,
  type EarnedAchievement,
  type WasteDashboardData,
} from "@/types/waste-tracking";
import {
  enrichMetricsWithRates,
  calculateStreak,
  getNextAchievement,
  getCurrentWeekStart,
} from "@/lib/waste/calculations";

/**
 * Get the full waste dashboard data for the household
 */
export async function getWasteDashboard(): Promise<{
  error: string | null;
  data: WasteDashboardData | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const householdId = membership.household_id;
  const currentWeekStart = getCurrentWeekStart();

  // Fetch all data in parallel
  const [
    currentWeekResult,
    weeklyTrendResult,
    aggregateResult,
    achievementsResult,
  ] = await Promise.all([
    // Current week metrics
    supabase
      .from("waste_metrics")
      .select("*")
      .eq("household_id", householdId)
      .eq("week_start", currentWeekStart)
      .single(),

    // Last 12 weeks for trend
    supabase
      .from("waste_metrics")
      .select("*")
      .eq("household_id", householdId)
      .order("week_start", { ascending: false })
      .limit(12),

    // Aggregate metrics
    supabase.rpc("get_aggregate_waste_metrics", {
      p_household_id: householdId,
      p_period: "all_time",
    }),

    // Achievements
    supabase
      .from("waste_achievements")
      .select("*")
      .eq("household_id", householdId)
      .order("achieved_at", { ascending: false }),
  ]);

  // Process results
  const currentWeek = currentWeekResult.data
    ? enrichMetricsWithRates(currentWeekResult.data as WasteMetrics)
    : null;

  const weeklyTrend = (weeklyTrendResult.data || []) as WasteMetrics[];

  // Parse aggregate (comes as array from RPC)
  const aggregateArray = aggregateResult.data as Array<{
    total_meals_planned: number;
    total_meals_cooked: number;
    total_waste_prevented_kg: number;
    total_money_saved_cents: number;
    total_co2_saved_kg: number;
    average_utilization_rate: number;
    average_shopping_efficiency: number;
    weeks_tracked: number;
  }> | null;

  const aggregate: AggregateWasteMetrics = aggregateArray?.[0]
    ? {
        period: "all_time",
        total_meals_planned: Number(aggregateArray[0].total_meals_planned) || 0,
        total_meals_cooked: Number(aggregateArray[0].total_meals_cooked) || 0,
        total_waste_prevented_kg:
          Number(aggregateArray[0].total_waste_prevented_kg) || 0,
        total_money_saved_cents:
          Number(aggregateArray[0].total_money_saved_cents) || 0,
        total_co2_saved_kg: Number(aggregateArray[0].total_co2_saved_kg) || 0,
        average_utilization_rate:
          Number(aggregateArray[0].average_utilization_rate) || 0,
        average_shopping_efficiency:
          Number(aggregateArray[0].average_shopping_efficiency) || 0,
        weeks_tracked: Number(aggregateArray[0].weeks_tracked) || 0,
      }
    : {
        period: "all_time",
        total_meals_planned: 0,
        total_meals_cooked: 0,
        total_waste_prevented_kg: 0,
        total_money_saved_cents: 0,
        total_co2_saved_kg: 0,
        average_utilization_rate: 0,
        average_shopping_efficiency: 0,
        weeks_tracked: 0,
      };

  const achievements = (achievementsResult.data || []) as EarnedAchievement[];

  // Calculate streak
  const streak = calculateStreak(weeklyTrend, currentWeekStart);

  // Get next achievable achievement
  const nextAchievement = getNextAchievement(achievements, aggregate, streak);

  return {
    error: null,
    data: {
      current_week: currentWeek,
      weekly_trend: weeklyTrend,
      aggregate,
      streak,
      achievements,
      next_achievement: nextAchievement,
    },
  };
}

/**
 * Recalculate and update waste metrics for a specific week
 * This is called after cooking history or meal plan changes
 */
export async function recalculateWasteMetrics(
  weekStart?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const targetWeek = weekStart || getCurrentWeekStart();

  // Call the database function to calculate and upsert metrics
  const { error } = await supabase.rpc("calculate_waste_metrics", {
    p_household_id: membership.household_id,
    p_week_start: targetWeek,
  });

  if (error) {
    console.error("Error recalculating waste metrics:", error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Check and award any new achievements
 * Called after metrics are updated
 */
export async function checkAchievements(): Promise<{
  error: string | null;
  newAchievements: EarnedAchievement[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", newAchievements: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", newAchievements: [] };
  }

  // Call the database function to check achievements
  const { data, error } = await supabase.rpc("check_waste_achievements", {
    p_household_id: membership.household_id,
  });

  if (error) {
    console.error("Error checking achievements:", error);
    return { error: error.message, newAchievements: [] };
  }

  return {
    error: null,
    newAchievements: (data || []) as EarnedAchievement[],
  };
}

/**
 * Get aggregate metrics for a specific period
 */
export async function getAggregateMetrics(
  period: "week" | "month" | "year" | "all_time" = "all_time"
): Promise<{
  error: string | null;
  data: AggregateWasteMetrics | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase.rpc("get_aggregate_waste_metrics", {
    p_household_id: membership.household_id,
    p_period: period,
  });

  if (error) {
    console.error("Error fetching aggregate metrics:", error);
    return { error: error.message, data: null };
  }

  const result = (data as Array<{
    total_meals_planned: number;
    total_meals_cooked: number;
    total_waste_prevented_kg: number;
    total_money_saved_cents: number;
    total_co2_saved_kg: number;
    average_utilization_rate: number;
    average_shopping_efficiency: number;
    weeks_tracked: number;
  }>)?.[0];

  if (!result) {
    return {
      error: null,
      data: {
        period,
        total_meals_planned: 0,
        total_meals_cooked: 0,
        total_waste_prevented_kg: 0,
        total_money_saved_cents: 0,
        total_co2_saved_kg: 0,
        average_utilization_rate: 0,
        average_shopping_efficiency: 0,
        weeks_tracked: 0,
      },
    };
  }

  return {
    error: null,
    data: {
      period,
      total_meals_planned: Number(result.total_meals_planned) || 0,
      total_meals_cooked: Number(result.total_meals_cooked) || 0,
      total_waste_prevented_kg: Number(result.total_waste_prevented_kg) || 0,
      total_money_saved_cents: Number(result.total_money_saved_cents) || 0,
      total_co2_saved_kg: Number(result.total_co2_saved_kg) || 0,
      average_utilization_rate: Number(result.average_utilization_rate) || 0,
      average_shopping_efficiency:
        Number(result.average_shopping_efficiency) || 0,
      weeks_tracked: Number(result.weeks_tracked) || 0,
    },
  };
}

/**
 * Get weekly metrics for trend analysis
 */
export async function getWeeklyTrend(
  weeksCount = 12
): Promise<{
  error: string | null;
  data: WasteMetrics[] | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase
    .from("waste_metrics")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("week_start", { ascending: false })
    .limit(weeksCount);

  if (error) {
    console.error("Error fetching weekly trend:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: (data || []) as WasteMetrics[] };
}
```

## Key Components (Sample)
