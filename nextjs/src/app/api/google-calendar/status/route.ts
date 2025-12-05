import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

    // Get user's Google Calendar settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("google_connected_account, google_access_token")
      .eq("user_id", user.id)
      .single();

    const isConnected = !!settings?.google_access_token;
    const connectedAccount = settings?.google_connected_account || null;

    return NextResponse.json({
      isConnected,
      connectedAccount,
    });
  } catch (error) {
    console.error("Error fetching Google Calendar status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
