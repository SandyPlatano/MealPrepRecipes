import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/google-calendar";

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

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Get redirect URI (must match what was used in OAuth flow)
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/auth/google/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user email from Google
    let googleEmail = "";
    try {
      const userInfo = await getUserInfo(tokens.access_token);
      googleEmail = userInfo.email || "";
    } catch (error) {
      console.warn("Failed to fetch Google user email:", error);
      // Continue without email - connection still works
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Update user settings with tokens
    const { error: updateError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || null,
          google_connected_account: googleEmail,
          google_token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (updateError) {
      console.error("Failed to save Google tokens:", updateError);
      return NextResponse.json(
        { error: "Failed to save connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      connectedAccount: googleEmail,
    });
  } catch (error) {
    console.error("Error exchanging Google OAuth token:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to connect: ${errorMessage}` },
      { status: 500 }
    );
  }
}
