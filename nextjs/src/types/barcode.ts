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
