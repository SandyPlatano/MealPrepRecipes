"use server";

/**
 * Seed/initialization operations for macro presets
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

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
