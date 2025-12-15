import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  // Check for OAuth errors from the provider
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("OAuth provider error:", error, errorDescription);
    const errorMsg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful auth - redirect to the app or specified page
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Code exchange error:", exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
  }

  // No code and no error - something weird happened
  console.error("Auth callback called without code or error");
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
