import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recipeFormSchema, validateSchema } from "@/lib/validations/schemas";
import { assertValidOrigin } from "@/lib/security/csrf";
import { rateLimit } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

// GET /api/recipes - List all recipes for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per minute per user
    const rateLimitResult = await rateLimit({
      identifier: `recipes-list-${user.id}`,
      limit: 100,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, title, recipe_type, category, protein_type, prep_time, cook_time, servings, base_servings, ingredients, instructions, tags, notes, source_url, image_url, rating, allergen_tags, user_id, household_id, is_shared_with_household, is_public, share_token, view_count, original_recipe_id, original_author_id, avg_rating, review_count, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(recipes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  // SECURITY: Validate request origin to prevent CSRF attacks
  const csrfError = assertValidOrigin(request);
  if (csrfError) return csrfError;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting: 30 recipe creations per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `recipes-create-${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();

    // SECURITY: Validate request body against schema
    // Normalize field names (handle both camelCase and snake_case)
    const normalizedBody = {
      title: body.title,
      recipe_type: body.recipe_type || body.recipeType || "Dinner",
      category: body.category || "Other",
      protein_type: body.protein_type || body.proteinType,
      prep_time: body.prep_time || body.prepTime,
      cook_time: body.cook_time || body.cookTime || `${body.cook_time_minutes || body.cookTimeMinutes || 30} minutes`,
      servings: body.servings?.toString() || "4",
      base_servings: typeof body.servings === "number" ? body.servings : parseInt(body.servings) || 4,
      ingredients: Array.isArray(body.ingredients)
        ? body.ingredients.map((i: unknown) => typeof i === "string" ? i : `${(i as Record<string, string>).quantity || ""} ${(i as Record<string, string>).unit || ""} ${(i as Record<string, string>).name}`.trim())
        : [],
      instructions: Array.isArray(body.instructions) ? body.instructions : [],
      tags: body.tags || [],
      notes: body.notes,
      source_url: body.source_url || body.sourceUrl,
      image_url: body.image_url || body.imageUrl,
      allergen_tags: body.allergen_tags || body.allergenTags || [],
      is_shared_with_household: body.is_shared_with_household ?? true,
      is_public: body.is_public ?? false,
    };

    const validation = validateSchema(recipeFormSchema, normalizedBody);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Map validated fields to database schema
    const recipeData = {
      user_id: user.id,
      title: validatedData.title,
      description: body.description || null, // Optional, not in schema
      recipe_type: validatedData.recipe_type,
      category: validatedData.category || "Other",
      protein_type: validatedData.protein_type,
      prep_time: validatedData.prep_time,
      cook_time: validatedData.cook_time,
      servings: validatedData.servings || "4",
      base_servings: validatedData.base_servings || 4,
      ingredients: validatedData.ingredients,
      instructions: validatedData.instructions,
      tags: validatedData.tags,
      notes: validatedData.notes,
      source_url: validatedData.source_url,
      image_url: validatedData.image_url,
      allergen_tags: validatedData.allergen_tags,
      is_favorite: body.is_favorite || false,
      is_shared_with_household: validatedData.is_shared_with_household,
      is_public: validatedData.is_public,
      rating: body.rating || null,
      rating_count: body.rating_count || 0,
    };

    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(recipe, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

