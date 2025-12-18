import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * POST /api/settings/sync
 *
 * Endpoint for navigator.sendBeacon to sync settings on page unload.
 * This provides reliable persistence when the user navigates away.
 *
 * sendBeacon automatically includes cookies, so authentication works.
 * The response doesn't matter since sendBeacon is fire-and-forget.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse the settings from the request body
    // sendBeacon sends data as a Blob, but we can still parse it as JSON
    const body = await request.text();
    if (!body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    let settings: Record<string, unknown>;
    try {
      settings = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Get existing settings to merge
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Prepare settings for save
    const settingsToSave: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
      ...(existingSettings || {}),
    };

    // Merge in the new settings
    // Handle specific fields that need validation
    const validFields = [
      "dark_mode",
      "cook_names",
      "cook_colors",
      "email_notifications",
      "allergen_alerts",
      "custom_dietary_restrictions",
      "category_order",
      "calendar_event_time",
      "calendar_event_duration_minutes",
      "calendar_excluded_days",
      "unit_system",
    ];

    for (const field of validFields) {
      if (settings[field] !== undefined) {
        // Ensure array fields are always arrays
        if (
          ["allergen_alerts", "custom_dietary_restrictions", "calendar_excluded_days", "cook_names"].includes(field)
        ) {
          settingsToSave[field] = Array.isArray(settings[field]) ? settings[field] : [];
        } else {
          settingsToSave[field] = settings[field];
        }
      }
    }

    // Upsert settings
    const { error: saveError } = await supabase
      .from("user_settings")
      .upsert(settingsToSave, { onConflict: "user_id" })
      .select();

    if (saveError) {
      console.error("[Settings Sync] Error saving:", saveError);
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    // Revalidate paths (though this may not matter during page unload)
    revalidatePath("/app/settings");
    revalidatePath("/app");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings Sync] Unexpected error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
