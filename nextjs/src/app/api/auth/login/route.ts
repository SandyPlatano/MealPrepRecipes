import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getIpAddress } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per minute per IP (brute force protection)
    const ip = getIpAddress(request);
    const rateLimitResult = await rateLimit({
      identifier: `login-${ip}`,
      limit: 5,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please wait a minute.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Return user-friendly error messages
      if (error.message.includes("Invalid login")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { error: "Please verify your email first" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name || data.user?.email?.split("@")[0],
      },
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      redirectTo: "/app",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}

