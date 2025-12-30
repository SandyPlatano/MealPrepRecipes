"use server";

/**
 * Quick add operations for macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

/**
 * One-tap add from preset - adds preset values directly to nutrition log
 */
export async function quickAddFromPreset(
  presetId: string,
  date: string,
  customNote?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get preset values
    const { data: preset, error: presetError } = await supabase
      .from("macro_presets")
      .select("id, user_id, name, emoji, calories, protein_g, carbs_g, fat_g, is_system, is_pinned, is_hidden, sort_order, pin_order, created_at, updated_at")
      .eq("id", presetId)
      .eq("user_id", user.id)
      .single();

    if (presetError || !preset) {
      return { success: false, error: "Preset not found" };
    }

    // Insert into nutrition_quick_adds
    const { error } = await supabase.from("nutrition_quick_adds").insert({
      user_id: user.id,
      date,
      calories: preset.calories,
      protein_g: preset.protein_g,
      carbs_g: preset.carbs_g,
      fat_g: preset.fat_g,
      note: customNote || null,
      preset: preset.name, // Store preset name for reference
    });

    if (error) {
      console.error("Error adding quick macro from preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in quickAddFromPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add from preset",
    };
  }
}
