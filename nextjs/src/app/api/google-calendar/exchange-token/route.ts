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
      console.error("[Google OAuth API] Not authenticated");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, redirectUri } = body;

    console.log("[Google OAuth API] Exchange token request:", {
      userId: user.id,
      hasCode: !!code,
      redirectUri,
    });

    if (!code) {
      console.error("[Google OAuth API] Missing authorization code");
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    if (!redirectUri) {
      console.error("[Google OAuth API] Missing redirect URI");
      return NextResponse.json(
        { error: "Redirect URI is required" },
        { status: 400 }
      );
    }

    // Validate redirect URI format
    try {
      const url = new URL(redirectUri);
      if (!url.pathname.endsWith("/auth/google/callback")) {
        throw new Error("Invalid callback path");
      }
    } catch (error) {
      console.error("[Google OAuth API] Invalid redirect URI:", redirectUri, error);
      return NextResponse.json(
        { error: "Invalid redirect URI format" },
        { status: 400 }
      );
    }

    console.log("[Google OAuth API] Exchanging code for tokens with redirect URI:", redirectUri);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    console.log("[Google OAuth API] Token exchange successful");

    // Get user email from Google
    let googleEmail = "";
    try {
      const userInfo = await getUserInfo(tokens.access_token);
      googleEmail = userInfo.email || "";
      console.log("[Google OAuth API] Retrieved Google user email:", googleEmail);
    } catch (error) {
      console.warn("[Google OAuth API] Failed to fetch Google user email:", error);
      // Continue without email - connection still works
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    console.log("[Google OAuth API] Saving tokens to database for user:", user.id);

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
      console.error("[Google OAuth API] Failed to save Google tokens:", updateError);
      return NextResponse.json(
        { error: "Failed to save connection" },
        { status: 500 }
      );
    }

    console.log("[Google OAuth API] Successfully saved Google Calendar connection");

    return NextResponse.json({
      success: true,
      connectedAccount: googleEmail,
    });
  } catch (error) {
    console.error("[Google OAuth API] Error exchanging Google OAuth token:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to connect: ${errorMessage}` },
      { status: 500 }
    );
  }
}
