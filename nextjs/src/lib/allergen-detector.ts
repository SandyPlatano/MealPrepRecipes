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

