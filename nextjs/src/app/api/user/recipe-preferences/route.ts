import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecipePreferences } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/recipe-preferences
 * Returns user's recipe preferences including cook names, colors, and default serving size
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get settings for cook names and colors
  const { data: settings } = await supabase
    .from("user_settings")
    .select("cook_names, cook_colors, preferences")
    .eq("user_id", user.id)
    .single();

  // Get recipe preferences (default serving size)
  const { data: recipePrefs } = await getRecipePreferences();

  return NextResponse.json({
    cook_names: settings?.cook_names || [],
    cook_colors: settings?.cook_colors || {},
    default_serving_size: recipePrefs?.defaultServingSize || 2,
  });
}
