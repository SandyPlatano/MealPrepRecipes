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
