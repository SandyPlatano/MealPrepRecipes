import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Clear Google Calendar tokens from user settings
    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        google_access_token: null,
        google_refresh_token: null,
        google_connected_account: null,
        google_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to disconnect Google Calendar:", updateError);
      return NextResponse.json(
        { error: "Failed to disconnect" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google Calendar disconnected",
    });
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to disconnect: ${errorMessage}` },
      { status: 500 }
    );
  }
}
