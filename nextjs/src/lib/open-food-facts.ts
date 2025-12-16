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
