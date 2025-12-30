"use server";

/**
 * Pin/Hide display operations for macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { PresetActionResult } from "@/types/macro-preset";

/**
 * Toggle pin status for a preset
 */
export async function togglePresetPinned(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get current pin status
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_pinned")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    const newPinnedStatus = !existing.is_pinned;

    // Get next pin_order if pinning
    let pinOrder = 0;
    if (newPinnedStatus) {
      const { data: pinnedPresets } = await supabase
        .from("macro_presets")
        .select("pin_order")
        .eq("user_id", user.id)
        .eq("is_pinned", true)
        .order("pin_order", { ascending: false })
        .limit(1);

      pinOrder = (pinnedPresets?.[0]?.pin_order ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update({
        is_pinned: newPinnedStatus,
        pin_order: newPinnedStatus ? pinOrder : 0,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling preset pinned:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in togglePresetPinned:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle pin status",
    };
  }
}

/**
 * Toggle hidden status for a preset (works for system presets too)
 */
export async function togglePresetHidden(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get current hidden status
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_hidden")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update({ is_hidden: !existing.is_hidden })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling preset hidden:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in togglePresetHidden:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle hidden status",
    };
  }
}

/**
 * Reorder pinned presets
 */
export async function reorderPinnedPresets(
  orderedIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Update pin_order for each preset
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("macro_presets")
        .update({ pin_order: index })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("is_pinned", true)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      console.error("Error reordering presets:", results.filter((r) => r.error));
      return { success: false, error: "Failed to reorder presets" };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in reorderPinnedPresets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder presets",
    };
  }
}
