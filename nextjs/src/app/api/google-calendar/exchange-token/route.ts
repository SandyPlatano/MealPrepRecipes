import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/google-calendar";
import { safeEncryptToken } from "@/lib/crypto/token-encryption";

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
    const { code, redirectUri } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    if (!redirectUri) {
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
    } catch {
      return NextResponse.json(
        { error: "Invalid redirect URI format" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user email from Google
    let googleEmail = "";
    try {
      const userInfo = await getUserInfo(tokens.access_token);
      googleEmail = userInfo.email || "";
    } catch {
      // Continue without email - connection still works
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // SECURITY: Encrypt tokens before storing in database
    const encryptedAccessToken = safeEncryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? safeEncryptToken(tokens.refresh_token)
      : null;

    // Update user settings with encrypted tokens
    const { error: updateError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          google_access_token: encryptedAccessToken,
          google_refresh_token: encryptedRefreshToken,
          google_connected_account: googleEmail,
          google_token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (updateError) {
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to connect: ${errorMessage}` },
      { status: 500 }
    );
  }
}
