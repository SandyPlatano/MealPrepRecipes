"use server";

/**
 * Server Actions for Macro Presets
 * CRUD operations for user-customizable macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  MacroPreset,
  MacroPresetFormData,
  PresetActionResult,
} from "@/types/macro-preset";

// =====================================================
// GET OPERATIONS
// =====================================================

/**
 * Get all presets for current user
 * @param includeHidden - Whether to include hidden presets (for preset manager)
 */
export async function getMacroPresets(includeHidden = false): Promise<{
  data: MacroPreset[];
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const supabase = await createClient();

    let query = supabase
      .from("macro_presets")
      .select("*")
      .eq("user_id", user.id);

    if (!includeHidden) {
      query = query.eq("is_hidden", false);
    }

    // Order: pinned first (by pin_order), then by sort_order, then by created_at
    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("pin_order", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching macro presets:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getMacroPresets:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch presets",
    };
  }
}

/**
 * Get a single preset by ID
 */
export async function getMacroPreset(id: string): Promise<{
  data: MacroPreset | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("macro_presets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: "Preset not found" };
      }
      console.error("Error fetching macro preset:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getMacroPreset:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch preset",
    };
  }
}

// =====================================================
// CREATE/UPDATE/DELETE OPERATIONS
// =====================================================

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

// =====================================================
// PIN/HIDE OPERATIONS
// =====================================================

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

// =====================================================
// SEED/INIT OPERATIONS
// =====================================================

/**
 * Seed default presets for current user (if none exist)
 * Called automatically on first quick add, but can be triggered manually
 */
export async function seedDefaultPresets(): Promise<{
  success: boolean;
  error: string | null;
  seeded: boolean;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated", seeded: false };
    }

    const supabase = await createClient();

    // Check if user already has presets
    const { data: existing } = await supabase
      .from("macro_presets")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      // Already has presets, no need to seed
      return { success: true, error: null, seeded: false };
    }

    // Seed defaults using the database function
    const { error } = await supabase.rpc("seed_default_macro_presets", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error seeding default presets:", error);
      return { success: false, error: error.message, seeded: false };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null, seeded: true };
  } catch (error) {
    console.error("Error in seedDefaultPresets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to seed presets",
      seeded: false,
    };
  }
}

// =====================================================
// QUICK ADD FROM PRESET
// =====================================================

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
      .select("*")
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
