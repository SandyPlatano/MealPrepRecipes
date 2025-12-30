"use server";

/**
 * Create/Update/Delete operations for macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { MacroPresetFormData, PresetActionResult } from "@/types/macro-preset";

/**
 * Create a new custom preset
 */
export async function createMacroPreset(
  formData: MacroPresetFormData
): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      return { success: false, error: "Name is required" };
    }

    if (formData.name.trim().length > 50) {
      return { success: false, error: "Name must be 50 characters or less" };
    }

    // Validate at least one macro value
    if (
      formData.calories == null &&
      formData.protein_g == null &&
      formData.carbs_g == null &&
      formData.fat_g == null
    ) {
      return { success: false, error: "At least one macro value is required" };
    }

    const supabase = await createClient();

    // Get max sort_order for new preset
    const { data: existingPresets } = await supabase
      .from("macro_presets")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxOrder = existingPresets?.[0]?.sort_order ?? 0;

    const { data, error } = await supabase
      .from("macro_presets")
      .insert({
        user_id: user.id,
        name: formData.name.trim(),
        emoji: formData.emoji || null,
        calories: formData.calories ?? null,
        protein_g: formData.protein_g ?? null,
        carbs_g: formData.carbs_g ?? null,
        fat_g: formData.fat_g ?? null,
        is_system: false,
        is_pinned: false,
        is_hidden: false,
        sort_order: maxOrder + 1,
        pin_order: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A preset with this name already exists" };
      }
      console.error("Error creating macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in createMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create preset",
    };
  }
}

/**
 * Update an existing preset
 * System presets cannot have their name/values changed (only pin/hide status)
 */
export async function updateMacroPreset(
  id: string,
  formData: Partial<MacroPresetFormData>
): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Check if it's a system preset
    const { data: existing, error: fetchError } = await supabase
      .from("macro_presets")
      .select("is_system")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Preset not found" };
    }

    if (existing.is_system) {
      return { success: false, error: "Cannot edit system presets. Create a custom preset instead." };
    }

    // Validate name if provided
    if (formData.name !== undefined) {
      if (!formData.name || formData.name.trim().length === 0) {
        return { success: false, error: "Name is required" };
      }
      if (formData.name.trim().length > 50) {
        return { success: false, error: "Name must be 50 characters or less" };
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (formData.name !== undefined) updateData.name = formData.name.trim();
    if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
    if (formData.calories !== undefined) updateData.calories = formData.calories;
    if (formData.protein_g !== undefined) updateData.protein_g = formData.protein_g;
    if (formData.carbs_g !== undefined) updateData.carbs_g = formData.carbs_g;
    if (formData.fat_g !== undefined) updateData.fat_g = formData.fat_g;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No changes provided" };
    }

    const { data, error } = await supabase
      .from("macro_presets")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A preset with this name already exists" };
      }
      console.error("Error updating macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, data };
  } catch (error) {
    console.error("Error in updateMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preset",
    };
  }
}

/**
 * Delete a preset (cannot delete system presets - use hide instead)
 */
export async function deleteMacroPreset(id: string): Promise<PresetActionResult> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Check if it's a system preset first
    const { data: existing } = await supabase
      .from("macro_presets")
      .select("is_system, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return { success: false, error: "Preset not found" };
    }

    if (existing.is_system) {
      return { success: false, error: "Cannot delete system presets. Use 'Hide' instead." };
    }

    const { error } = await supabase
      .from("macro_presets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting macro preset:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteMacroPreset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete preset",
    };
  }
}
