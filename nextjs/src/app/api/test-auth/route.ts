import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Test Authentication Endpoint
 * 
 * This endpoint is used for automated testing purposes only.
 * It allows tests to authenticate and receive valid session cookies.
 * 
 * In production, this should be disabled or protected.
 * 
 * Usage:
 * POST /api/test-auth
 * Body: { "email": "test@example.com", "password": "testpassword" }
 * 
 * Returns: Session info and sets authentication cookies
 */
export async function POST(request: NextRequest) {
  // Only allow in development/test environments
  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.ENABLE_TEST_AUTH === "true";
  
  if (!isDev && !isTest) {
    return NextResponse.json(
      { error: "Test authentication is not available in production" },
      { status: 403 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If user doesn't exist and we're in test mode, try to create them
      if (error.message.includes("Invalid login credentials") && (isDev || isTest)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: "Test",
              last_name: "User",
            },
          },
        });

        if (signUpError) {
          return NextResponse.json(
            { error: `Authentication failed: ${signUpError.message}` },
            { status: 401 }
          );
        }

        // For Supabase projects with email confirmation disabled, user is immediately available
        if (signUpData.user && signUpData.session) {
          return NextResponse.json({
            success: true,
            message: "Test user created and authenticated",
            email: signUpData.user.email, // Top-level for test compatibility
            user: {
              id: signUpData.user.id,
              email: signUpData.user.email,
            },
            session: {
              access_token: signUpData.session.access_token,
              expires_at: signUpData.session.expires_at,
            },
            token: signUpData.session.access_token,
            access_token: signUpData.session.access_token, // Test compatibility
          });
        }
        
        // User created but no session (needs email confirmation)
        if (signUpData.user) {
          return NextResponse.json({
            success: true,
            message: "Test user created. Email confirmation may be required.",
            email: signUpData.user.email, // Top-level for test compatibility
            user: {
              id: signUpData.user.id,
              email: signUpData.user.email,
            },
            session: null,
            token: null,
          });
        }
      }

      return NextResponse.json(
        { error: `Authentication failed: ${error.message}` },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      email: data.user?.email, // Top-level for test compatibility
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: {
        access_token: data.session?.access_token,
        expires_at: data.session?.expires_at,
      },
      token: data.session?.access_token,
      access_token: data.session?.access_token, // Test compatibility
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * Check current authentication status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : "Failed to check auth status",
    });
  }
}

