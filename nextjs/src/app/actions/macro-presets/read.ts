"use server";

/**
 * Read operations for macro presets
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { MacroPreset } from "@/types/macro-preset";

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
      .select("id, user_id, name, emoji, calories, protein_g, carbs_g, fat_g, is_system, is_pinned, is_hidden, sort_order, pin_order, created_at, updated_at")
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
      .select("id, user_id, name, emoji, calories, protein_g, carbs_g, fat_g, is_system, is_pinned, is_hidden, sort_order, pin_order, created_at, updated_at")
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
