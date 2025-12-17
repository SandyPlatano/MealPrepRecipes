/**
 * Demo Sample Data
 * Pre-populated recipes, meal plans, and settings for the interactive demo
 */

import type { Recipe, RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { RecipeNutrition, NutritionData, MacroGoals, WeeklyMacroDashboard, DailyMacroSummary } from "@/types/nutrition";
import type { MealPlan, MealAssignment, MealAssignmentWithRecipe, DayOfWeek, MealType, WeekPlanData, DAYS_OF_WEEK } from "@/types/meal-plan";
import type { UserSettings, CookModeSettings, DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";

// =============================================================================
// DEMO USER & SETTINGS
// =============================================================================

export const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
};

export const DEMO_HOUSEHOLD_ID = "demo-household-id";

export const DEMO_SETTINGS: Partial<UserSettings> = {
  id: "demo-settings-id",
  user_id: DEMO_USER.id,
  dark_mode: false,
  cook_names: ["Sarah", "Mike"],
  cook_colors: {
    Sarah: "#10B981", // emerald
    Mike: "#6366F1",  // indigo
  },
  email_notifications: true,
  allergen_alerts: ["peanuts", "shellfish"],
  macro_tracking_enabled: true,
  macro_goals: {
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
    fiber_g: 25,
  },
  macro_goal_preset: "maintenance",
  unit_system: "imperial",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// =============================================================================
// DEMO RECIPES (10 diverse recipes)
// =============================================================================

const BASE_RECIPE = {
  user_id: DEMO_USER.id,
  household_id: DEMO_HOUSEHOLD_ID,
  is_shared_with_household: true,
  is_public: false,
  share_token: null,
  view_count: 0,
  original_recipe_id: null,
  original_author_id: null,
  avg_rating: null,
  review_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_RECIPES: Recipe[] = [
  // 1. Garlic Butter Salmon - Quick dinner, demonstrates timers
  {
    ...BASE_RECIPE,
    id: "demo-recipe-1",
    title: "Garlic Butter Salmon",
    recipe_type: "Dinner",
    category: "Seafood",
    protein_type: "Fish",
    prep_time: "10 min",
    cook_time: "15 min",
    servings: "4 servings",
    base_servings: 4,
    ingredients: [
      "4 salmon fillets (6 oz each)",
      "4 tbsp unsalted butter",
      "4 cloves garlic, minced",
      "2 tbsp fresh lemon juice",
      "2 tbsp fresh parsley, chopped",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "1 lemon, sliced for garnish",
    ],
    instructions: [
      "Pat salmon fillets dry with paper towels and season generously with salt and pepper on both sides.",
      "Melt 2 tablespoons of butter in a large skillet over medium-high heat until it starts to foam.",
      "Add the salmon fillets skin-side up to the hot pan. Cook without moving for 4 minutes until a golden crust forms.",
      "Flip the salmon carefully. Add remaining butter and minced garlic to the pan.",
      "Cook for 3-4 more minutes, basting the fish with the garlic butter as it cooks.",
      "Remove from heat. Drizzle with fresh lemon juice and garnish with chopped parsley and lemon slices.",
    ],
    tags: ["quick", "healthy", "keto-friendly", "high-protein", "date-night"],
    notes: "Great served with roasted asparagus or cauliflower rice for a low-carb meal.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    rating: 5,
    allergen_tags: ["fish"],
  },

  // 2. Chicken Stir Fry - Asian, multiple steps
  {
    ...BASE_RECIPE,
    id: "demo-recipe-2",
    title: "Honey Garlic Chicken Stir Fry",
    recipe_type: "Dinner",
    category: "Asian",
    protein_type: "Chicken",
    prep_time: "15 min",
    cook_time: "12 min",
    servings: "4 servings",
    base_servings: 4,
    ingredients: [
      "1.5 lbs chicken breast, cut into 1-inch cubes",
      "2 cups broccoli florets",
      "1 red bell pepper, sliced",
      "1 cup snap peas",
      "3 cloves garlic, minced",
      "1 inch fresh ginger, grated",
      "3 tbsp soy sauce",
      "2 tbsp honey",
      "1 tbsp rice vinegar",
      "1 tbsp sesame oil",
      "2 tbsp vegetable oil",
      "1 tbsp cornstarch",
      "Sesame seeds for garnish",
      "Green onions, sliced",
    ],
    instructions: [
      "In a small bowl, whisk together soy sauce, honey, rice vinegar, and cornstarch to make the sauce. Set aside.",
      "Heat 1 tablespoon vegetable oil in a wok or large skillet over high heat until smoking.",
      "Add chicken in a single layer. Let it sear without stirring for 2 minutes, then stir-fry for 3-4 minutes until cooked through. Remove and set aside.",
      "Add remaining oil to the wok. Add broccoli, bell pepper, and snap peas. Stir-fry for 3-4 minutes until crisp-tender.",
      "Add garlic and ginger, stir-fry for 30 seconds until fragrant.",
      "Return chicken to the wok. Pour sauce over everything and toss to coat. Cook 1-2 minutes until sauce thickens.",
      "Drizzle with sesame oil. Garnish with sesame seeds and green onions. Serve over rice.",
    ],
    tags: ["asian", "quick", "weeknight", "high-protein", "family-friendly"],
    notes: "Can substitute chicken with tofu for a vegetarian version.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    rating: 5,
    allergen_tags: ["soy", "sesame"],
  },

  // 3. Pasta Primavera - Vegetarian
  {
    ...BASE_RECIPE,
    id: "demo-recipe-3",
    title: "Pasta Primavera",
    recipe_type: "Dinner",
    category: "Italian",
    protein_type: null,
    prep_time: "15 min",
    cook_time: "20 min",
    servings: "6 servings",
    base_servings: 6,
    ingredients: [
      "1 lb penne pasta",
      "2 cups cherry tomatoes, halved",
      "1 zucchini, sliced",
      "1 yellow squash, sliced",
      "1 cup asparagus, cut into 2-inch pieces",
      "1 cup frozen peas",
      "4 cloves garlic, minced",
      "1/2 cup white wine",
      "1 cup heavy cream",
      "1 cup freshly grated Parmesan cheese",
      "3 tbsp olive oil",
      "Fresh basil leaves",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
    ],
    instructions: [
      "Bring a large pot of salted water to boil. Cook pasta according to package directions until al dente. Reserve 1 cup pasta water before draining.",
      "While pasta cooks, heat olive oil in a large skillet over medium-high heat.",
      "Add zucchini, yellow squash, and asparagus. Sauté for 4-5 minutes until lightly golden.",
      "Add cherry tomatoes and garlic. Cook for 2 minutes until tomatoes start to soften.",
      "Pour in white wine and let it reduce by half, about 2 minutes.",
      "Lower heat to medium. Add heavy cream and bring to a gentle simmer.",
      "Add peas and drained pasta to the skillet. Toss to combine, adding pasta water as needed for consistency.",
      "Remove from heat. Stir in Parmesan cheese. Season with salt, pepper, and red pepper flakes if desired.",
      "Garnish with fresh basil and extra Parmesan. Serve immediately.",
    ],
    tags: ["vegetarian", "pasta", "summer", "colorful", "dinner-party"],
    notes: "Best in spring/summer when vegetables are in season.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    rating: 4,
    allergen_tags: ["wheat", "milk"],
  },

  // 4. Beef Tacos - Mexican, shows scaling
  {
    ...BASE_RECIPE,
    id: "demo-recipe-4",
    title: "Street-Style Beef Tacos",
    recipe_type: "Dinner",
    category: "Mexican",
    protein_type: "Beef",
    prep_time: "20 min",
    cook_time: "15 min",
    servings: "4 servings (12 tacos)",
    base_servings: 4,
    ingredients: [
      "1.5 lbs ground beef (80/20)",
      "12 small corn tortillas",
      "1 white onion, finely diced",
      "1/4 cup fresh cilantro, chopped",
      "2 limes, cut into wedges",
      "2 tbsp vegetable oil",
      "For the seasoning:",
      "2 tsp chili powder",
      "1 tsp cumin",
      "1 tsp paprika",
      "1/2 tsp garlic powder",
      "1/2 tsp onion powder",
      "1/4 tsp oregano",
      "Salt to taste",
      "Optional toppings: salsa verde, queso fresco, sliced radishes",
    ],
    instructions: [
      "Mix all seasoning spices together in a small bowl.",
      "Heat oil in a large skillet over medium-high heat. Add ground beef and break it up with a wooden spoon.",
      "Cook beef for 6-8 minutes until browned. Drain excess fat if needed.",
      "Add the seasoning mix and 1/4 cup water. Stir well and simmer for 3-4 minutes until water evaporates.",
      "While beef cooks, warm tortillas in a dry skillet or directly over a gas flame for 15-20 seconds per side.",
      "To assemble: Place double-stacked tortillas on a plate. Add seasoned beef.",
      "Top with diced onion, fresh cilantro, and a squeeze of lime juice.",
      "Serve with your choice of salsa, queso fresco, and radishes on the side.",
    ],
    tags: ["mexican", "tacos", "quick", "crowd-pleaser", "customizable"],
    notes: "Double-stack the tortillas to prevent them from falling apart. Can also use flour tortillas if preferred.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
    rating: 5,
    allergen_tags: [],
  },

  // 5. Overnight Oats - Breakfast, meal type variety
  {
    ...BASE_RECIPE,
    id: "demo-recipe-5",
    title: "Berry Vanilla Overnight Oats",
    recipe_type: "Breakfast",
    category: "Healthy",
    protein_type: null,
    prep_time: "5 min",
    cook_time: "0 min",
    servings: "2 servings",
    base_servings: 2,
    ingredients: [
      "1 cup rolled oats",
      "1 cup milk (any type)",
      "1/2 cup Greek yogurt",
      "2 tbsp maple syrup or honey",
      "1 tsp vanilla extract",
      "1/4 tsp cinnamon",
      "1/2 cup mixed berries (strawberries, blueberries, raspberries)",
      "2 tbsp chia seeds",
      "Toppings: sliced almonds, coconut flakes, fresh berries",
    ],
    instructions: [
      "In a large bowl or jar, combine rolled oats, milk, Greek yogurt, maple syrup, vanilla extract, and cinnamon.",
      "Stir in chia seeds and mix until everything is well combined.",
      "Fold in mixed berries gently.",
      "Divide mixture between two jars or containers.",
      "Cover and refrigerate overnight, or for at least 4 hours.",
      "In the morning, give it a good stir. Add a splash of milk if you prefer a thinner consistency.",
      "Top with sliced almonds, coconut flakes, and fresh berries before serving.",
    ],
    tags: ["breakfast", "meal-prep", "no-cook", "healthy", "grab-and-go"],
    notes: "Can be stored in the fridge for up to 5 days. Great for meal prep!",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800",
    rating: 4,
    allergen_tags: ["milk", "tree nuts"],
  },

  // 6. Banana Bread - Baking category
  {
    ...BASE_RECIPE,
    id: "demo-recipe-6",
    title: "Classic Banana Bread",
    recipe_type: "Baking",
    category: "Baked Goods",
    protein_type: null,
    prep_time: "15 min",
    cook_time: "60 min",
    servings: "10 slices",
    base_servings: 10,
    ingredients: [
      "3 very ripe bananas, mashed",
      "1/3 cup melted butter",
      "3/4 cup sugar",
      "1 large egg, beaten",
      "1 tsp vanilla extract",
      "1 tsp baking soda",
      "Pinch of salt",
      "1.5 cups all-purpose flour",
      "1/2 cup walnuts or chocolate chips (optional)",
    ],
    instructions: [
      "Preheat oven to 350°F (175°C). Grease a 9x5 inch loaf pan with butter or cooking spray.",
      "In a large mixing bowl, mash the ripe bananas with a fork until smooth.",
      "Stir in melted butter until combined.",
      "Mix in sugar, beaten egg, and vanilla extract.",
      "Sprinkle in baking soda and salt. Stir to combine.",
      "Add flour and gently fold until just combined. Don't overmix - some lumps are okay!",
      "Fold in walnuts or chocolate chips if using.",
      "Pour batter into prepared loaf pan and spread evenly.",
      "Bake for 55-65 minutes, or until a toothpick inserted in the center comes out clean.",
      "Let cool in pan for 10 minutes, then transfer to a wire rack to cool completely before slicing.",
    ],
    tags: ["baking", "comfort-food", "use-ripe-bananas", "freezer-friendly"],
    notes: "The riper the bananas, the sweeter and more flavorful the bread. Spotted bananas are perfect!",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1606101273945-e9eba91f60a0?w=800",
    rating: 5,
    allergen_tags: ["wheat", "eggs", "milk", "tree nuts"],
  },

  // 7. Greek Salad - Side dish, quick prep
  {
    ...BASE_RECIPE,
    id: "demo-recipe-7",
    title: "Traditional Greek Salad",
    recipe_type: "Side Dish",
    category: "Salads",
    protein_type: null,
    prep_time: "15 min",
    cook_time: "0 min",
    servings: "4 servings",
    base_servings: 4,
    ingredients: [
      "3 large ripe tomatoes, cut into chunks",
      "1 English cucumber, sliced",
      "1 green bell pepper, sliced",
      "1/2 red onion, thinly sliced",
      "1 cup Kalamata olives",
      "8 oz feta cheese, cut into cubes or crumbled",
      "2 tbsp extra virgin olive oil",
      "1 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Salt and pepper to taste",
      "Fresh oregano or parsley for garnish",
    ],
    instructions: [
      "Cut tomatoes into large chunks and place in a large serving bowl.",
      "Slice cucumber into half-moons and add to the bowl.",
      "Cut bell pepper into strips or rings and add to the bowl.",
      "Thinly slice red onion and scatter over the vegetables.",
      "Add Kalamata olives to the bowl.",
      "Place feta cheese cubes on top - traditionally in one large piece, but cubed works great too.",
      "Drizzle with olive oil and red wine vinegar.",
      "Sprinkle with dried oregano, salt, and pepper.",
      "Gently toss just before serving. Garnish with fresh herbs.",
    ],
    tags: ["salad", "vegetarian", "mediterranean", "summer", "no-cook"],
    notes: "Don't refrigerate tomatoes - they taste best at room temperature. Make the salad just before serving for maximum freshness.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    rating: 4,
    allergen_tags: ["milk"],
  },

  // 8. Chocolate Chip Cookies - Dessert category
  {
    ...BASE_RECIPE,
    id: "demo-recipe-8",
    title: "Perfect Chocolate Chip Cookies",
    recipe_type: "Dessert",
    category: "Cookies",
    protein_type: null,
    prep_time: "15 min",
    cook_time: "12 min",
    servings: "24 cookies",
    base_servings: 24,
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup (2 sticks) butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups semi-sweet chocolate chips",
      "1 cup chopped walnuts (optional)",
      "Flaky sea salt for topping",
    ],
    instructions: [
      "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
      "In a medium bowl, whisk together flour, baking soda, and salt. Set aside.",
      "In a large bowl, beat softened butter with both sugars until light and fluffy, about 3-4 minutes.",
      "Add eggs one at a time, beating well after each addition. Mix in vanilla extract.",
      "Gradually add flour mixture to the butter mixture, mixing on low speed until just combined.",
      "Fold in chocolate chips and walnuts (if using) with a spatula.",
      "Scoop rounded tablespoons of dough onto prepared baking sheets, spacing them 2 inches apart.",
      "Bake for 9-11 minutes, or until edges are golden but centers look slightly underdone.",
      "Sprinkle with flaky sea salt while still warm.",
      "Let cool on baking sheet for 5 minutes before transferring to a wire rack.",
    ],
    tags: ["dessert", "cookies", "classic", "crowd-pleaser", "baking"],
    notes: "For extra chewy cookies, chill the dough for 30 minutes before baking. Dough can be frozen for up to 3 months.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800",
    rating: 5,
    allergen_tags: ["wheat", "eggs", "milk", "tree nuts"],
  },

  // 9. Chicken Tikka Masala - Indian cuisine, complex recipe
  {
    ...BASE_RECIPE,
    id: "demo-recipe-9",
    title: "Chicken Tikka Masala",
    recipe_type: "Dinner",
    category: "Indian",
    protein_type: "Chicken",
    prep_time: "30 min",
    cook_time: "30 min",
    servings: "6 servings",
    base_servings: 6,
    ingredients: [
      "For the chicken:",
      "2 lbs boneless chicken thighs, cut into chunks",
      "1 cup plain yogurt",
      "2 tbsp lemon juice",
      "2 tsp garam masala",
      "1 tsp turmeric",
      "1 tsp cumin",
      "1 tsp paprika",
      "Salt to taste",
      "For the sauce:",
      "2 tbsp butter",
      "1 large onion, finely diced",
      "4 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tsp garam masala",
      "1 tsp cumin",
      "1 tsp paprika",
      "1/2 tsp cayenne pepper",
      "1 can (14 oz) crushed tomatoes",
      "1 cup heavy cream",
      "Fresh cilantro for garnish",
      "Basmati rice for serving",
    ],
    instructions: [
      "In a large bowl, combine yogurt, lemon juice, and all chicken spices. Add chicken chunks and marinate for at least 30 minutes (or overnight in the fridge).",
      "Preheat broiler. Thread marinated chicken onto skewers or spread on a baking sheet.",
      "Broil chicken for 12-15 minutes, turning once, until charred and cooked through. Set aside.",
      "For the sauce: Melt butter in a large pan over medium heat. Add onion and cook until soft and golden, about 8 minutes.",
      "Add garlic and ginger, cook for 1 minute until fragrant.",
      "Add all sauce spices (garam masala, cumin, paprika, cayenne) and stir for 30 seconds.",
      "Pour in crushed tomatoes. Simmer for 10 minutes, stirring occasionally.",
      "Reduce heat to low. Stir in heavy cream and simmer for 5 more minutes.",
      "Add the cooked chicken to the sauce. Stir to coat and heat through.",
      "Garnish with fresh cilantro. Serve over basmati rice with warm naan bread.",
    ],
    tags: ["indian", "curry", "comfort-food", "restaurant-quality", "date-night"],
    notes: "Marinating overnight makes the chicken incredibly tender. Adjust cayenne for your spice preference.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
    rating: 5,
    allergen_tags: ["milk"],
  },

  // 10. Vegetable Soup - Dinner, shows nutrition tracking
  {
    ...BASE_RECIPE,
    id: "demo-recipe-10",
    title: "Hearty Vegetable Soup",
    recipe_type: "Dinner",
    category: "Soups",
    protein_type: null,
    prep_time: "20 min",
    cook_time: "35 min",
    servings: "8 servings",
    base_servings: 8,
    ingredients: [
      "2 tbsp olive oil",
      "1 large onion, diced",
      "3 carrots, sliced",
      "3 celery stalks, sliced",
      "4 cloves garlic, minced",
      "1 can (14 oz) diced tomatoes",
      "8 cups vegetable broth",
      "2 cups green beans, cut into 1-inch pieces",
      "2 cups zucchini, diced",
      "1 can (15 oz) cannellini beans, drained",
      "2 cups baby spinach",
      "1 tsp dried thyme",
      "1 tsp dried oregano",
      "1 bay leaf",
      "Salt and pepper to taste",
      "Fresh parsley for garnish",
      "Parmesan cheese for serving",
    ],
    instructions: [
      "Heat olive oil in a large Dutch oven or pot over medium heat.",
      "Add onion, carrots, and celery. Sauté for 5-7 minutes until vegetables begin to soften.",
      "Add garlic and cook for 1 minute until fragrant.",
      "Pour in diced tomatoes and vegetable broth. Add thyme, oregano, and bay leaf.",
      "Bring to a boil, then reduce heat and simmer for 15 minutes.",
      "Add green beans and zucchini. Continue simmering for 10 minutes.",
      "Stir in cannellini beans and baby spinach. Cook for 3-5 minutes until spinach wilts.",
      "Remove bay leaf. Season with salt and pepper to taste.",
      "Ladle into bowls. Garnish with fresh parsley and grated Parmesan cheese.",
    ],
    tags: ["soup", "vegetarian", "healthy", "meal-prep", "comfort-food", "low-calorie"],
    notes: "This soup tastes even better the next day! Freezes well for up to 3 months.",
    source_url: null,
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    rating: 4,
    allergen_tags: ["milk"],
  },
];

// =============================================================================
// DEMO NUTRITION DATA
// =============================================================================

export const DEMO_NUTRITION: Record<string, RecipeNutrition> = {
  "demo-recipe-1": {
    id: "demo-nutrition-1",
    recipe_id: "demo-recipe-1",
    calories: 450,
    protein_g: 42,
    carbs_g: 2,
    fat_g: 30,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 580,
    source: "manual",
    confidence_score: 0.95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-2": {
    id: "demo-nutrition-2",
    recipe_id: "demo-recipe-2",
    calories: 380,
    protein_g: 38,
    carbs_g: 22,
    fat_g: 16,
    fiber_g: 4,
    sugar_g: 12,
    sodium_mg: 720,
    source: "manual",
    confidence_score: 0.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-3": {
    id: "demo-nutrition-3",
    recipe_id: "demo-recipe-3",
    calories: 520,
    protein_g: 18,
    carbs_g: 62,
    fat_g: 22,
    fiber_g: 6,
    sugar_g: 8,
    sodium_mg: 480,
    source: "manual",
    confidence_score: 0.85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-4": {
    id: "demo-nutrition-4",
    recipe_id: "demo-recipe-4",
    calories: 420,
    protein_g: 28,
    carbs_g: 32,
    fat_g: 22,
    fiber_g: 4,
    sugar_g: 3,
    sodium_mg: 560,
    source: "manual",
    confidence_score: 0.88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-5": {
    id: "demo-nutrition-5",
    recipe_id: "demo-recipe-5",
    calories: 320,
    protein_g: 14,
    carbs_g: 48,
    fat_g: 10,
    fiber_g: 8,
    sugar_g: 18,
    sodium_mg: 120,
    source: "manual",
    confidence_score: 0.92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-6": {
    id: "demo-nutrition-6",
    recipe_id: "demo-recipe-6",
    calories: 220,
    protein_g: 3,
    carbs_g: 34,
    fat_g: 8,
    fiber_g: 1,
    sugar_g: 18,
    sodium_mg: 180,
    source: "manual",
    confidence_score: 0.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-7": {
    id: "demo-nutrition-7",
    recipe_id: "demo-recipe-7",
    calories: 280,
    protein_g: 10,
    carbs_g: 12,
    fat_g: 22,
    fiber_g: 3,
    sugar_g: 6,
    sodium_mg: 820,
    source: "manual",
    confidence_score: 0.88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-8": {
    id: "demo-nutrition-8",
    recipe_id: "demo-recipe-8",
    calories: 180,
    protein_g: 2,
    carbs_g: 24,
    fat_g: 9,
    fiber_g: 1,
    sugar_g: 14,
    sodium_mg: 140,
    source: "manual",
    confidence_score: 0.95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-9": {
    id: "demo-nutrition-9",
    recipe_id: "demo-recipe-9",
    calories: 480,
    protein_g: 35,
    carbs_g: 18,
    fat_g: 28,
    fiber_g: 3,
    sugar_g: 8,
    sodium_mg: 680,
    source: "manual",
    confidence_score: 0.85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  "demo-recipe-10": {
    id: "demo-nutrition-10",
    recipe_id: "demo-recipe-10",
    calories: 180,
    protein_g: 8,
    carbs_g: 28,
    fat_g: 5,
    fiber_g: 8,
    sugar_g: 10,
    sodium_mg: 620,
    source: "manual",
    confidence_score: 0.92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Helper to get recipes with nutrition for display
export function getDemoRecipesWithNutrition(): RecipeWithFavoriteAndNutrition[] {
  return DEMO_RECIPES.map((recipe) => ({
    ...recipe,
    is_favorite: ["demo-recipe-1", "demo-recipe-2", "demo-recipe-4", "demo-recipe-9"].includes(recipe.id),
    nutrition: DEMO_NUTRITION[recipe.id] || null,
  }));
}

// =============================================================================
// DEMO MEAL PLAN
// =============================================================================

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

export const DEMO_MEAL_PLAN: MealPlan = {
  id: "demo-meal-plan-id",
  household_id: DEMO_HOUSEHOLD_ID,
  week_start: getWeekStart(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_MEAL_ASSIGNMENTS: MealAssignmentWithRecipe[] = [
  // Monday
  {
    id: "demo-assignment-1",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-5",
    day_of_week: "Monday",
    cook: null,
    meal_type: "breakfast",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-5",
      title: "Berry Vanilla Overnight Oats",
      recipe_type: "Breakfast",
      prep_time: "5 min",
      cook_time: "0 min",
    },
  },
  {
    id: "demo-assignment-2",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-1",
    day_of_week: "Monday",
    cook: "Sarah",
    meal_type: "dinner",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-1",
      title: "Garlic Butter Salmon",
      recipe_type: "Dinner",
      prep_time: "10 min",
      cook_time: "15 min",
    },
  },
  // Tuesday
  {
    id: "demo-assignment-3",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-2",
    day_of_week: "Tuesday",
    cook: "Mike",
    meal_type: "dinner",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-2",
      title: "Honey Garlic Chicken Stir Fry",
      recipe_type: "Dinner",
      prep_time: "15 min",
      cook_time: "12 min",
    },
  },
  // Wednesday
  {
    id: "demo-assignment-4",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-3",
    day_of_week: "Wednesday",
    cook: "Sarah",
    meal_type: "dinner",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-3",
      title: "Pasta Primavera",
      recipe_type: "Dinner",
      prep_time: "15 min",
      cook_time: "20 min",
    },
  },
  // Thursday
  {
    id: "demo-assignment-5",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-4",
    day_of_week: "Thursday",
    cook: "Mike",
    meal_type: "dinner",
    serving_size: 4,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-4",
      title: "Street-Style Beef Tacos",
      recipe_type: "Dinner",
      prep_time: "20 min",
      cook_time: "15 min",
    },
  },
  // Friday
  {
    id: "demo-assignment-6",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-9",
    day_of_week: "Friday",
    cook: "Sarah",
    meal_type: "dinner",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-9",
      title: "Chicken Tikka Masala",
      recipe_type: "Dinner",
      prep_time: "30 min",
      cook_time: "30 min",
    },
  },
  // Saturday - Multiple meals
  {
    id: "demo-assignment-7",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-5",
    day_of_week: "Saturday",
    cook: null,
    meal_type: "breakfast",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-5",
      title: "Berry Vanilla Overnight Oats",
      recipe_type: "Breakfast",
      prep_time: "5 min",
      cook_time: "0 min",
    },
  },
  {
    id: "demo-assignment-8",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-7",
    day_of_week: "Saturday",
    cook: null,
    meal_type: "lunch",
    serving_size: 2,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-7",
      title: "Traditional Greek Salad",
      recipe_type: "Side Dish",
      prep_time: "15 min",
      cook_time: "0 min",
    },
  },
  {
    id: "demo-assignment-9",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-10",
    day_of_week: "Saturday",
    cook: "Mike",
    meal_type: "dinner",
    serving_size: 4,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-10",
      title: "Hearty Vegetable Soup",
      recipe_type: "Dinner",
      prep_time: "20 min",
      cook_time: "35 min",
    },
  },
  // Sunday
  {
    id: "demo-assignment-10",
    meal_plan_id: DEMO_MEAL_PLAN.id,
    recipe_id: "demo-recipe-6",
    day_of_week: "Sunday",
    cook: "Sarah",
    meal_type: "snack",
    serving_size: null,
    created_at: new Date().toISOString(),
    recipe: {
      id: "demo-recipe-6",
      title: "Classic Banana Bread",
      recipe_type: "Baking",
      prep_time: "15 min",
      cook_time: "60 min",
    },
  },
];

// Get assignments grouped by day
export function getDemoWeekPlanData(): WeekPlanData {
  const assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  DEMO_MEAL_ASSIGNMENTS.forEach((assignment) => {
    assignments[assignment.day_of_week].push(assignment);
  });

  return {
    meal_plan: DEMO_MEAL_PLAN,
    assignments,
  };
}

// =============================================================================
// DEMO SHOPPING LIST
// =============================================================================

export interface DemoShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  recipeIds: string[];
}

export const DEMO_SHOPPING_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Pantry",
  "Spices & Seasonings",
  "Canned Goods",
  "Bakery",
  "Frozen",
];

export const DEMO_SHOPPING_LIST: DemoShoppingItem[] = [
  // Produce
  { id: "shop-1", name: "Salmon fillets (6 oz)", quantity: "4", category: "Meat & Seafood", checked: false, recipeIds: ["demo-recipe-1"] },
  { id: "shop-2", name: "Chicken breast", quantity: "1.5 lbs", category: "Meat & Seafood", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-3", name: "Ground beef (80/20)", quantity: "1.5 lbs", category: "Meat & Seafood", checked: false, recipeIds: ["demo-recipe-4"] },
  { id: "shop-4", name: "Chicken thighs (boneless)", quantity: "2 lbs", category: "Meat & Seafood", checked: false, recipeIds: ["demo-recipe-9"] },

  { id: "shop-5", name: "Broccoli florets", quantity: "2 cups", category: "Produce", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-6", name: "Red bell pepper", quantity: "2", category: "Produce", checked: false, recipeIds: ["demo-recipe-2", "demo-recipe-7"] },
  { id: "shop-7", name: "Snap peas", quantity: "1 cup", category: "Produce", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-8", name: "Garlic", quantity: "2 heads", category: "Produce", checked: true, recipeIds: ["demo-recipe-1", "demo-recipe-2", "demo-recipe-3"] },
  { id: "shop-9", name: "Fresh ginger", quantity: "1 piece", category: "Produce", checked: false, recipeIds: ["demo-recipe-2", "demo-recipe-9"] },
  { id: "shop-10", name: "Lemons", quantity: "4", category: "Produce", checked: false, recipeIds: ["demo-recipe-1", "demo-recipe-9"] },
  { id: "shop-11", name: "Fresh parsley", quantity: "1 bunch", category: "Produce", checked: false, recipeIds: ["demo-recipe-1", "demo-recipe-10"] },
  { id: "shop-12", name: "Fresh cilantro", quantity: "1 bunch", category: "Produce", checked: true, recipeIds: ["demo-recipe-4", "demo-recipe-9"] },
  { id: "shop-13", name: "Cherry tomatoes", quantity: "2 cups", category: "Produce", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-14", name: "Zucchini", quantity: "3", category: "Produce", checked: false, recipeIds: ["demo-recipe-3", "demo-recipe-10"] },
  { id: "shop-15", name: "Yellow squash", quantity: "1", category: "Produce", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-16", name: "Asparagus", quantity: "1 bunch", category: "Produce", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-17", name: "White onion", quantity: "2", category: "Produce", checked: false, recipeIds: ["demo-recipe-4", "demo-recipe-9", "demo-recipe-10"] },
  { id: "shop-18", name: "Limes", quantity: "3", category: "Produce", checked: false, recipeIds: ["demo-recipe-4"] },
  { id: "shop-19", name: "Ripe bananas", quantity: "3", category: "Produce", checked: false, recipeIds: ["demo-recipe-6"] },
  { id: "shop-20", name: "Mixed berries", quantity: "1 pint", category: "Produce", checked: false, recipeIds: ["demo-recipe-5"] },
  { id: "shop-21", name: "English cucumber", quantity: "1", category: "Produce", checked: false, recipeIds: ["demo-recipe-7"] },
  { id: "shop-22", name: "Large tomatoes", quantity: "3", category: "Produce", checked: false, recipeIds: ["demo-recipe-7"] },
  { id: "shop-23", name: "Carrots", quantity: "3", category: "Produce", checked: true, recipeIds: ["demo-recipe-10"] },
  { id: "shop-24", name: "Celery", quantity: "3 stalks", category: "Produce", checked: false, recipeIds: ["demo-recipe-10"] },
  { id: "shop-25", name: "Green beans", quantity: "2 cups", category: "Produce", checked: false, recipeIds: ["demo-recipe-10"] },
  { id: "shop-26", name: "Baby spinach", quantity: "2 cups", category: "Produce", checked: false, recipeIds: ["demo-recipe-10"] },

  // Dairy & Eggs
  { id: "shop-27", name: "Unsalted butter", quantity: "1 lb", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-1", "demo-recipe-6", "demo-recipe-8", "demo-recipe-9"] },
  { id: "shop-28", name: "Heavy cream", quantity: "2 cups", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-3", "demo-recipe-9"] },
  { id: "shop-29", name: "Parmesan cheese", quantity: "1 cup", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-30", name: "Greek yogurt", quantity: "1 cup", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-5", "demo-recipe-9"] },
  { id: "shop-31", name: "Feta cheese", quantity: "8 oz", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-7"] },
  { id: "shop-32", name: "Large eggs", quantity: "1 dozen", category: "Dairy & Eggs", checked: true, recipeIds: ["demo-recipe-6", "demo-recipe-8"] },
  { id: "shop-33", name: "Milk", quantity: "1 cup", category: "Dairy & Eggs", checked: false, recipeIds: ["demo-recipe-5"] },

  // Pantry
  { id: "shop-34", name: "Rolled oats", quantity: "1 cup", category: "Pantry", checked: false, recipeIds: ["demo-recipe-5"] },
  { id: "shop-35", name: "Chia seeds", quantity: "2 tbsp", category: "Pantry", checked: false, recipeIds: ["demo-recipe-5"] },
  { id: "shop-36", name: "Maple syrup", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-5"] },
  { id: "shop-37", name: "All-purpose flour", quantity: "3 cups", category: "Pantry", checked: true, recipeIds: ["demo-recipe-6", "demo-recipe-8"] },
  { id: "shop-38", name: "Sugar", quantity: "2 cups", category: "Pantry", checked: true, recipeIds: ["demo-recipe-6", "demo-recipe-8"] },
  { id: "shop-39", name: "Brown sugar", quantity: "1 cup", category: "Pantry", checked: false, recipeIds: ["demo-recipe-8"] },
  { id: "shop-40", name: "Chocolate chips", quantity: "2 cups", category: "Pantry", checked: false, recipeIds: ["demo-recipe-8"] },
  { id: "shop-41", name: "Soy sauce", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-42", name: "Honey", quantity: "1 jar", category: "Pantry", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-43", name: "Rice vinegar", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-44", name: "Sesame oil", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-2"] },
  { id: "shop-45", name: "Corn tortillas", quantity: "12", category: "Bakery", checked: false, recipeIds: ["demo-recipe-4"] },
  { id: "shop-46", name: "Penne pasta", quantity: "1 lb", category: "Pantry", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-47", name: "White wine", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-3"] },
  { id: "shop-48", name: "Kalamata olives", quantity: "1 cup", category: "Pantry", checked: false, recipeIds: ["demo-recipe-7"] },
  { id: "shop-49", name: "Extra virgin olive oil", quantity: "1 bottle", category: "Pantry", checked: true, recipeIds: ["demo-recipe-7", "demo-recipe-10"] },
  { id: "shop-50", name: "Red wine vinegar", quantity: "1 bottle", category: "Pantry", checked: false, recipeIds: ["demo-recipe-7"] },

  // Canned Goods
  { id: "shop-51", name: "Crushed tomatoes (14 oz)", quantity: "2 cans", category: "Canned Goods", checked: false, recipeIds: ["demo-recipe-9", "demo-recipe-10"] },
  { id: "shop-52", name: "Cannellini beans", quantity: "1 can", category: "Canned Goods", checked: false, recipeIds: ["demo-recipe-10"] },
  { id: "shop-53", name: "Vegetable broth", quantity: "8 cups", category: "Canned Goods", checked: false, recipeIds: ["demo-recipe-10"] },

  // Frozen
  { id: "shop-54", name: "Frozen peas", quantity: "1 cup", category: "Frozen", checked: false, recipeIds: ["demo-recipe-3"] },
];

// =============================================================================
// DEMO SMART FOLDERS
// =============================================================================

export interface DemoSmartFolder {
  id: string;
  name: string;
  emoji: string;
  color: string;
  recipeCount: number;
  conditions: {
    field: string;
    operator: string;
    value: string | number;
  }[];
}

export const DEMO_SMART_FOLDERS: DemoSmartFolder[] = [
  {
    id: "demo-folder-1",
    name: "Quick Meals",
    emoji: "⚡",
    color: "#fbbf24",
    recipeCount: 4,
    conditions: [
      { field: "cook_time", operator: "less_than", value: 20 },
    ],
  },
  {
    id: "demo-folder-2",
    name: "High Protein",
    emoji: "💪",
    color: "#10B981",
    recipeCount: 5,
    conditions: [
      { field: "protein_g", operator: "greater_than", value: 25 },
    ],
  },
  {
    id: "demo-folder-3",
    name: "Vegetarian",
    emoji: "🥬",
    color: "#34d399",
    recipeCount: 4,
    conditions: [
      { field: "protein_type", operator: "is_empty", value: "" },
    ],
  },
];

// =============================================================================
// DEMO WEEKLY NUTRITION SUMMARY
// =============================================================================

export function getDemoWeeklyNutrition(): WeeklyMacroDashboard {
  const goals = DEMO_SETTINGS.macro_goals!;

  // Generate realistic daily data based on meal plan
  const days: DailyMacroSummary[] = [
    // Monday: Overnight Oats + Salmon
    createDailyMacro("Monday", { calories: 770, protein_g: 56, carbs_g: 50, fat_g: 40 }, goals),
    // Tuesday: Stir Fry
    createDailyMacro("Tuesday", { calories: 380, protein_g: 38, carbs_g: 22, fat_g: 16 }, goals),
    // Wednesday: Pasta Primavera
    createDailyMacro("Wednesday", { calories: 520, protein_g: 18, carbs_g: 62, fat_g: 22 }, goals),
    // Thursday: Tacos
    createDailyMacro("Thursday", { calories: 840, protein_g: 56, carbs_g: 64, fat_g: 44 }, goals),
    // Friday: Tikka Masala
    createDailyMacro("Friday", { calories: 480, protein_g: 35, carbs_g: 18, fat_g: 28 }, goals),
    // Saturday: Oats + Salad + Soup
    createDailyMacro("Saturday", { calories: 780, protein_g: 32, carbs_g: 88, fat_g: 37 }, goals),
    // Sunday: Light (just banana bread snack)
    createDailyMacro("Sunday", { calories: 220, protein_g: 3, carbs_g: 34, fat_g: 8 }, goals),
  ];

  const weeklyTotals: NutritionData = {
    calories: days.reduce((sum, d) => sum + (d.nutrition.calories || 0), 0),
    protein_g: days.reduce((sum, d) => sum + (d.nutrition.protein_g || 0), 0),
    carbs_g: days.reduce((sum, d) => sum + (d.nutrition.carbs_g || 0), 0),
    fat_g: days.reduce((sum, d) => sum + (d.nutrition.fat_g || 0), 0),
    fiber_g: days.reduce((sum, d) => sum + (d.nutrition.fiber_g || 0), 0),
  };

  const daysOnTarget = days.filter(d => {
    const calPct = (d.nutrition.calories || 0) / goals.calories;
    return calPct >= 0.8 && calPct <= 1.2;
  }).length;

  return {
    week_start: getWeekStart(),
    week_end: new Date(new Date(getWeekStart()).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    days,
    weekly_totals: weeklyTotals,
    weekly_averages: {
      calories: Math.round(weeklyTotals.calories! / 7),
      protein_g: Math.round(weeklyTotals.protein_g! / 7),
      carbs_g: Math.round(weeklyTotals.carbs_g! / 7),
      fat_g: Math.round(weeklyTotals.fat_g! / 7),
    },
    goals,
    overall_progress: {
      calories: createProgress("Calories", weeklyTotals.calories!, goals.calories * 7),
      protein: createProgress("Protein", weeklyTotals.protein_g!, goals.protein_g * 7),
      carbs: createProgress("Carbs", weeklyTotals.carbs_g!, goals.carbs_g * 7),
      fat: createProgress("Fat", weeklyTotals.fat_g!, goals.fat_g * 7),
    },
    days_on_target: daysOnTarget,
  };
}

function createDailyMacro(
  day: string,
  nutrition: NutritionData,
  goals: MacroGoals
): DailyMacroSummary {
  const date = getDayDate(day);
  return {
    date,
    day_of_week: day,
    nutrition,
    goals,
    progress: {
      calories: createProgress("Calories", nutrition.calories!, goals.calories),
      protein: createProgress("Protein", nutrition.protein_g!, goals.protein_g),
      carbs: createProgress("Carbs", nutrition.carbs_g!, goals.carbs_g),
      fat: createProgress("Fat", nutrition.fat_g!, goals.fat_g),
    },
    meal_count: day === "Sunday" ? 1 : day === "Saturday" ? 3 : 1,
    data_completeness_pct: 100,
  };
}

function createProgress(name: string, actual: number, target: number) {
  const percentage = Math.round((actual / target) * 100);
  const status = percentage >= 90 && percentage <= 110 ? "achieved" as const :
                 percentage > 110 ? "exceeded" as const : "remaining" as const;
  const color = status === "achieved" ? "sage" as const :
                status === "exceeded" ? "coral" as const : "muted" as const;

  return {
    name,
    actual,
    target,
    percentage,
    remaining: Math.max(0, target - actual),
    status,
    color,
  };
}

function getDayDate(day: string): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayIndex = days.indexOf(day);
  const weekStart = new Date(getWeekStart());
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + dayIndex);
  return date.toISOString().split("T")[0];
}

// =============================================================================
// DEMO FAVORITES & COOKING HISTORY
// =============================================================================

export const DEMO_FAVORITE_IDS = ["demo-recipe-1", "demo-recipe-2", "demo-recipe-4", "demo-recipe-9"];

export const DEMO_COOKING_HISTORY = [
  { recipe_id: "demo-recipe-1", cooked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { recipe_id: "demo-recipe-4", cooked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { recipe_id: "demo-recipe-2", cooked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { recipe_id: "demo-recipe-9", cooked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// =============================================================================
// EXPORT DEFAULT CONFIG
// =============================================================================

export const DEMO_CONFIG = {
  user: DEMO_USER,
  householdId: DEMO_HOUSEHOLD_ID,
  settings: DEMO_SETTINGS,
  recipes: DEMO_RECIPES,
  nutrition: DEMO_NUTRITION,
  mealPlan: DEMO_MEAL_PLAN,
  mealAssignments: DEMO_MEAL_ASSIGNMENTS,
  shoppingList: DEMO_SHOPPING_LIST,
  smartFolders: DEMO_SMART_FOLDERS,
  favoriteIds: DEMO_FAVORITE_IDS,
  cookingHistory: DEMO_COOKING_HISTORY,
};
