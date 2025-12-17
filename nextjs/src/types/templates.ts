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
