import { detectAllergens, mergeAllergens, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";

interface UseRecipeAllergensProps {
  ingredients: string[];
  allergenTags: string[];
  userAllergenAlerts: string[];
  customDietaryRestrictions: string[];
}

export interface RecipeAllergensState {
  allergens: string[];
  hasUserAllergensFlag: boolean;
  matchingAllergens: string[];
  matchingCustomRestrictions: string[];
  hasAnyWarnings: boolean;
}

export function useRecipeAllergens({
  ingredients,
  allergenTags,
  userAllergenAlerts,
  customDietaryRestrictions,
}: UseRecipeAllergensProps): RecipeAllergensState {
  // Allergen detection
  const detectedAllergens = detectAllergens(ingredients);
  const allergens = mergeAllergens(detectedAllergens, allergenTags);

  // Check if recipe contains user's allergens
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) => userAllergenAlerts.includes(allergen));

  // Check for custom dietary restrictions
  const matchingCustomRestrictions = hasCustomRestrictions(ingredients, customDietaryRestrictions);
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;

  return {
    allergens,
    hasUserAllergensFlag,
    matchingAllergens,
    matchingCustomRestrictions,
    hasAnyWarnings,
  };
}
