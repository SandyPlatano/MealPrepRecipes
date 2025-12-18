import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getIpAddress } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 signup attempts per hour per IP (spam prevention)
    const ip = getIpAddress(request);
    const rateLimitResult = await rateLimit({
      identifier: `signup-${ip}`,
      limit: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
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

    const { email, password, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // If password provided, use password signup; otherwise use magic link
    if (password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
          onboardingRequired: true,
          message: "Please check your email to verify your account",
        },
        { status: 201 }
      );
    } else {
      // Magic link signup (OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/app`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          user: { email },
          onboardingRequired: true,
          message: "Check your email for a magic link to sign in",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

