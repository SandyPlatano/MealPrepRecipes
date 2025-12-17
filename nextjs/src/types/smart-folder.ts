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
  emoji: string;
  color: string;
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
