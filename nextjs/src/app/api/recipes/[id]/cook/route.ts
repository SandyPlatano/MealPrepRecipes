import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit-redis";
import { assertValidOrigin } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

// POST /api/recipes/[id]/cook - Log cooking event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Validate request origin to prevent CSRF attacks
  const csrfError = assertValidOrigin(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting: 60 cooking events per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `recipe-cook-${user.id}`,
      limit: 60,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const event = body.event || "start"; // "start" or "stop"

    // Verify recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, title")
      .eq("id", id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Log cooking event to cooking_history table
    const { data: historyEntry, error: historyError } = await supabase
      .from("cooking_history")
      .insert({
        user_id: user.id,
        recipe_id: id,
        cooked_at: new Date().toISOString(),
        notes: `Cooking ${event}`,
      })
      .select()
      .single();

    if (historyError) {
      console.error("Error logging cooking event:", historyError);
      return NextResponse.json(
        { error: historyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: event === "start" ? "cooking_started" : "cooking_completed",
      recipe_id: id,
      recipe_title: recipe.title,
      history_id: historyEntry?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging cooking event:", error);
    return NextResponse.json(
      { error: "Failed to log cooking event" },
      { status: 500 }
    );
  }
}

