import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/shopping-lists/generated - Get generated shopping list from meal plan
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mealPlanId = searchParams.get("meal_plan_id");

    if (!mealPlanId) {
      return NextResponse.json(
        { error: "meal_plan_id is required" },
        { status: 400 }
      );
    }

    // Get meal plan with assignments and recipes
    const { data: mealPlan, error: planError } = await supabase
      .from("meal_plans")
      .select(`
        *,
        meal_plan_assignments(
          *,
          recipe:recipes(ingredients, servings, base_servings)
        )
      `)
      .eq("id", mealPlanId)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Aggregate ingredients from all assignments
    const ingredientMap = new Map<string, { name: string; quantity: number; unit: string; category: string }>();

    for (const assignment of mealPlan.meal_plan_assignments || []) {
      const recipe = assignment.recipe;
      if (!recipe || !recipe.ingredients) continue;

      const baseServings = recipe.base_servings || parseInt(recipe.servings) || 4;
      const multiplier = (assignment.servings || 4) / baseServings;

      for (const ingredientStr of recipe.ingredients) {
        const parsed = parseIngredient(ingredientStr);
        const key = parsed.ingredient.toLowerCase();
        
        const existingQuantity = ingredientMap.get(key)?.quantity || 0;
        const newQuantity = parseFloat(parsed.quantity || "1") * multiplier;

        ingredientMap.set(key, {
          name: parsed.ingredient,
          quantity: existingQuantity + newQuantity,
          unit: parsed.unit || "",
          category: parsed.category,
        });
      }
    }

    // Convert to array format
    const items = Array.from(ingredientMap.values()).map((item, index) => ({
      id: `${mealPlanId}-${index}`,
      name: item.name,
      quantity: Math.round(item.quantity * 100) / 100,
      unit: item.unit,
      category: item.category,
      checked: false,
    }));

    return NextResponse.json({
      id: `shopping-list-${mealPlanId}`,
      meal_plan_id: mealPlanId,
      items,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}

// Helper function to parse ingredient strings
function parseIngredient(ingredient: string): {
  quantity?: string;
  unit?: string;
  ingredient: string;
  category: string;
} {
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|oz|lb|lbs?|g|kg|ml|l|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim() || "1",
      unit: quantityMatch[2]?.trim() || "",
      ingredient: quantityMatch[3]?.trim() || ingredient,
      category: guessCategory(ingredient),
    };
  }

  return {
    quantity: "1",
    ingredient: ingredient.trim(),
    category: guessCategory(ingredient),
  };
}

function guessCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (/lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|broccoli|cucumber|avocado|vegetable|fruit|herb/i.test(lower)) {
    return "Produce";
  }
  if (/chicken|beef|pork|fish|salmon|shrimp|bacon|sausage|meat|seafood/i.test(lower)) {
    return "Meat & Seafood";
  }
  if (/milk|cheese|butter|cream|yogurt|egg/i.test(lower)) {
    return "Dairy & Eggs";
  }
  if (/bread|roll|bun|tortilla/i.test(lower)) {
    return "Bakery";
  }
  if (/flour|sugar|rice|pasta|oil|vinegar|sauce|broth|can|bean/i.test(lower)) {
    return "Pantry";
  }
  if (/salt|pepper|cumin|paprika|oregano|spice|seasoning/i.test(lower)) {
    return "Spices";
  }
  
  return "Other";
}

