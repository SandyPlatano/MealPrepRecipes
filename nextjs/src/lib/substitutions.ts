/**
 * Ingredient substitution utilities
 * Provides built-in substitutions and user-defined preferences
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { normalizeIngredientName } from "./ingredient-scaler";

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
 * Built-in common substitutions that are always available
 * These serve as a fallback when database defaults aren't present
 */
const COMMON_SUBSTITUTIONS: Omit<Substitution, "id">[] = [
  // Dairy substitutions
  { original_ingredient: "butter", substitute_ingredient: "coconut oil", notes: "Use 1:1 ratio. Great for vegan baking.", is_default: true },
  { original_ingredient: "butter", substitute_ingredient: "olive oil", notes: "Use 3/4 cup oil for 1 cup butter in baking.", is_default: true },
  { original_ingredient: "butter", substitute_ingredient: "applesauce", notes: "Use 1/2 cup applesauce for 1 cup butter. Reduces fat in baking.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "oat milk", notes: "Use 1:1 ratio. Works well in most recipes.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "almond milk", notes: "Use 1:1 ratio. Slightly nutty flavor.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "coconut milk", notes: "Use 1:1 ratio. Rich and creamy.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "soy milk", notes: "Use 1:1 ratio. High protein alternative.", is_default: true },
  { original_ingredient: "heavy cream", substitute_ingredient: "coconut cream", notes: "Use 1:1 ratio. Great for dairy-free recipes.", is_default: true },
  { original_ingredient: "heavy cream", substitute_ingredient: "cashew cream", notes: "Blend soaked cashews with water for a silky alternative.", is_default: true },
  { original_ingredient: "sour cream", substitute_ingredient: "greek yogurt", notes: "Use 1:1 ratio. Tangy and protein-rich.", is_default: true },
  { original_ingredient: "sour cream", substitute_ingredient: "coconut cream", notes: "Add a splash of lemon juice for tang.", is_default: true },
  { original_ingredient: "cream cheese", substitute_ingredient: "cashew cream cheese", notes: "Soak cashews overnight, blend until smooth.", is_default: true },
  { original_ingredient: "cream cheese", substitute_ingredient: "silken tofu", notes: "Blend until smooth. Add lemon for tang.", is_default: true },
  { original_ingredient: "parmesan cheese", substitute_ingredient: "nutritional yeast", notes: "Use 2 tbsp yeast for 1/4 cup parmesan. Cheesy, nutty flavor.", is_default: true },
  { original_ingredient: "yogurt", substitute_ingredient: "coconut yogurt", notes: "Use 1:1 ratio. Great dairy-free option.", is_default: true },

  // Egg substitutions
  { original_ingredient: "eggs", substitute_ingredient: "flax eggs", notes: "Mix 1 tbsp ground flaxseed with 3 tbsp water per egg. Let sit 5 min.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "chia eggs", notes: "Mix 1 tbsp chia seeds with 3 tbsp water per egg. Let sit 5 min.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "applesauce", notes: "Use 1/4 cup per egg in baking. Adds moisture.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "mashed banana", notes: "Use 1/4 cup per egg. Adds sweetness to baked goods.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "silken tofu", notes: "Blend 1/4 cup per egg. Great for dense baked goods.", is_default: true },

  // Flour substitutions
  { original_ingredient: "flour", substitute_ingredient: "almond flour", notes: "Use 1:1 ratio but may need more liquid. Gluten-free.", is_default: true },
  { original_ingredient: "flour", substitute_ingredient: "coconut flour", notes: "Use 1/4 cup coconut flour for 1 cup regular flour. Very absorbent.", is_default: true },
  { original_ingredient: "flour", substitute_ingredient: "oat flour", notes: "Use 1:1 ratio. Blend oats to make your own.", is_default: true },
  { original_ingredient: "flour", substitute_ingredient: "whole wheat flour", notes: "Use 3/4 cup whole wheat for 1 cup all-purpose.", is_default: true },
  { original_ingredient: "flour", substitute_ingredient: "gluten-free flour blend", notes: "Use 1:1 ratio. Results may vary by brand.", is_default: true },
  { original_ingredient: "breadcrumbs", substitute_ingredient: "crushed oats", notes: "Pulse oats in food processor. Great gluten-free coating.", is_default: true },
  { original_ingredient: "breadcrumbs", substitute_ingredient: "crushed crackers", notes: "Any crackers work. Adds flavor and crunch.", is_default: true },

  // Sweetener substitutions
  { original_ingredient: "sugar", substitute_ingredient: "honey", notes: "Use 3/4 cup honey for 1 cup sugar. Reduce liquid by 1/4 cup.", is_default: true },
  { original_ingredient: "sugar", substitute_ingredient: "maple syrup", notes: "Use 3/4 cup syrup for 1 cup sugar. Reduce liquid by 3 tbsp.", is_default: true },
  { original_ingredient: "sugar", substitute_ingredient: "coconut sugar", notes: "Use 1:1 ratio. Lower glycemic index.", is_default: true },
  { original_ingredient: "sugar", substitute_ingredient: "stevia", notes: "Use 1 tsp stevia for 1 cup sugar. Adjust to taste.", is_default: true },
  { original_ingredient: "brown sugar", substitute_ingredient: "coconut sugar", notes: "Use 1:1 ratio. Similar caramel flavor.", is_default: true },
  { original_ingredient: "brown sugar", substitute_ingredient: "maple syrup", notes: "Use 2/3 cup syrup for 1 cup brown sugar. Reduce liquid.", is_default: true },

  // Oil and fat substitutions
  { original_ingredient: "vegetable oil", substitute_ingredient: "olive oil", notes: "Use 1:1 ratio. Better for savory dishes.", is_default: true },
  { original_ingredient: "vegetable oil", substitute_ingredient: "coconut oil", notes: "Use 1:1 ratio. Adds subtle coconut flavor.", is_default: true },
  { original_ingredient: "vegetable oil", substitute_ingredient: "applesauce", notes: "Use 1:1 ratio in baking. Reduces fat content.", is_default: true },
  { original_ingredient: "vegetable oil", substitute_ingredient: "avocado oil", notes: "Use 1:1 ratio. High smoke point, neutral flavor.", is_default: true },
  { original_ingredient: "mayonnaise", substitute_ingredient: "mashed avocado", notes: "Mash avocado for a creamy, healthy alternative.", is_default: true },
  { original_ingredient: "mayonnaise", substitute_ingredient: "greek yogurt", notes: "Use 1:1 ratio. Lighter and protein-rich.", is_default: true },

  // Protein substitutions
  { original_ingredient: "chicken", substitute_ingredient: "tofu", notes: "Press tofu well. Marinate for best flavor.", is_default: true },
  { original_ingredient: "chicken", substitute_ingredient: "chickpeas", notes: "Great in curries, salads, and wraps.", is_default: true },
  { original_ingredient: "beef", substitute_ingredient: "mushrooms", notes: "Portobello or cremini have meaty texture.", is_default: true },
  { original_ingredient: "beef", substitute_ingredient: "lentils", notes: "Cook lentils and season well for taco meat alternative.", is_default: true },
  { original_ingredient: "ground beef", substitute_ingredient: "ground turkey", notes: "Use 1:1 ratio. Leaner option.", is_default: true },
  { original_ingredient: "ground beef", substitute_ingredient: "textured vegetable protein", notes: "Rehydrate TVP and season well.", is_default: true },
  { original_ingredient: "bacon", substitute_ingredient: "tempeh bacon", notes: "Slice thin, marinate, and pan-fry until crispy.", is_default: true },
  { original_ingredient: "bacon", substitute_ingredient: "coconut bacon", notes: "Bake coconut flakes with soy sauce and smoked paprika.", is_default: true },

  // Sauce and condiment substitutions
  { original_ingredient: "soy sauce", substitute_ingredient: "coconut aminos", notes: "Use 1:1 ratio. Slightly sweeter, soy-free.", is_default: true },
  { original_ingredient: "soy sauce", substitute_ingredient: "tamari", notes: "Use 1:1 ratio. Gluten-free option.", is_default: true },
  { original_ingredient: "fish sauce", substitute_ingredient: "soy sauce", notes: "Add a pinch of seaweed for umami depth.", is_default: true },
  { original_ingredient: "worcestershire sauce", substitute_ingredient: "soy sauce", notes: "Add a splash of vinegar and pinch of sugar.", is_default: true },
  { original_ingredient: "tomato paste", substitute_ingredient: "tomato sauce", notes: "Use 3 tbsp sauce for 1 tbsp paste. Simmer to reduce.", is_default: true },
  { original_ingredient: "ketchup", substitute_ingredient: "tomato paste", notes: "Mix paste with vinegar, sugar, and spices.", is_default: true },

  // Baking substitutions
  { original_ingredient: "baking powder", substitute_ingredient: "baking soda", notes: "Use 1/4 tsp soda for 1 tsp powder. Add acid like lemon juice.", is_default: true },
  { original_ingredient: "buttermilk", substitute_ingredient: "milk with lemon", notes: "Add 1 tbsp lemon juice to 1 cup milk. Let sit 5 min.", is_default: true },
  { original_ingredient: "buttermilk", substitute_ingredient: "plain yogurt", notes: "Thin with milk to buttermilk consistency.", is_default: true },
  { original_ingredient: "cornstarch", substitute_ingredient: "arrowroot powder", notes: "Use 1:1 ratio. Great for sauces and gravies.", is_default: true },
  { original_ingredient: "cornstarch", substitute_ingredient: "tapioca starch", notes: "Use 2 tbsp tapioca for 1 tbsp cornstarch.", is_default: true },
  { original_ingredient: "vanilla extract", substitute_ingredient: "maple syrup", notes: "Use 1:1 ratio. Adds different but pleasant flavor.", is_default: true },
  { original_ingredient: "chocolate chips", substitute_ingredient: "cacao nibs", notes: "Use 1:1 ratio. Less sweet, more intense chocolate.", is_default: true },

  // Vegetable substitutions
  { original_ingredient: "potatoes", substitute_ingredient: "cauliflower", notes: "Steam and mash for lower-carb alternative.", is_default: true },
  { original_ingredient: "rice", substitute_ingredient: "cauliflower rice", notes: "Pulse cauliflower in food processor. Quick-cook in pan.", is_default: true },
  { original_ingredient: "rice", substitute_ingredient: "quinoa", notes: "Use 1:1 ratio. Higher protein content.", is_default: true },
  { original_ingredient: "pasta", substitute_ingredient: "zucchini noodles", notes: "Spiralize zucchini. Sauté briefly or serve raw.", is_default: true },
  { original_ingredient: "pasta", substitute_ingredient: "spaghetti squash", notes: "Roast squash and scrape out strands with fork.", is_default: true },
  { original_ingredient: "lettuce", substitute_ingredient: "spinach", notes: "Use 1:1 ratio. More nutritious.", is_default: true },
  { original_ingredient: "spinach", substitute_ingredient: "kale", notes: "Remove stems and massage leaves to soften.", is_default: true },

  // Allium substitutions
  { original_ingredient: "onion", substitute_ingredient: "shallots", notes: "Use 3 shallots for 1 medium onion. Milder flavor.", is_default: true },
  { original_ingredient: "onion", substitute_ingredient: "leeks", notes: "Use white and light green parts. Milder, sweeter.", is_default: true },
  { original_ingredient: "garlic", substitute_ingredient: "garlic powder", notes: "Use 1/8 tsp powder for 1 clove fresh garlic.", is_default: true },
  { original_ingredient: "garlic", substitute_ingredient: "shallots", notes: "Use 1/2 shallot for 1 clove. Milder flavor.", is_default: true },

  // Nut and seed substitutions
  { original_ingredient: "peanut butter", substitute_ingredient: "almond butter", notes: "Use 1:1 ratio. Slightly different flavor.", is_default: true },
  { original_ingredient: "peanut butter", substitute_ingredient: "sunflower seed butter", notes: "Use 1:1 ratio. Nut-free option.", is_default: true },
  { original_ingredient: "almonds", substitute_ingredient: "sunflower seeds", notes: "Use 1:1 ratio. Great for nut allergies.", is_default: true },
  { original_ingredient: "walnuts", substitute_ingredient: "pecans", notes: "Use 1:1 ratio. Similar texture and richness.", is_default: true },
  { original_ingredient: "pine nuts", substitute_ingredient: "sunflower seeds", notes: "Toast for best flavor. Good for pesto.", is_default: true },
];

/**
 * Get all default substitutions
 * Falls back to built-in common substitutions if database has none
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

  // If we have database defaults, use them
  if (data && data.length > 0) {
    return data as Substitution[];
  }

  // Otherwise, return built-in common substitutions
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

/**
 * Get all substitutions for a user (defaults + user custom)
 * User substitutions take precedence over defaults
 */
export async function getAllSubstitutions(): Promise<Substitution[]> {
  const [defaults, userSubs] = await Promise.all([
    getDefaultSubstitutions(),
    getUserSubstitutions(),
  ]);

  const userSubMap = new Map<string, UserSubstitution>();
  userSubs.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    userSubMap.set(key, sub);
  });

  // Merge: use user substitutions if they exist, otherwise use defaults
  const merged: Substitution[] = [];

  // Add all defaults
  defaults.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    const userSub = userSubMap.get(key);
    if (userSub) {
      // User has a custom substitution for this ingredient
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    } else {
      // Use default
      merged.push(sub);
    }
  });

  // Add user substitutions that don't have defaults
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
 * Find substitutions for a specific ingredient
 */
export async function findSubstitutionsForIngredient(
  ingredient: string
): Promise<Substitution[]> {
  const allSubs = await getAllSubstitutions();
  const normalized = normalizeIngredientName(ingredient);

  return allSubs.filter(
    (sub) => normalizeIngredientName(sub.original_ingredient) === normalized
  );
}

/**
 * Find substitutions for all ingredients in a recipe
 * Returns a map of ingredient -> substitutions[]
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

/**
 * Check if an ingredient has substitutions available
 */
export async function hasSubstitutions(ingredient: string): Promise<boolean> {
  const subs = await findSubstitutionsForIngredient(ingredient);
  return subs.length > 0;
}

