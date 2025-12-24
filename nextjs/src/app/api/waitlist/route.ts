import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getIpAddress } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

const WaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional().default("website"),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 signups per IP per hour
    const ip = getIpAddress(request);
    const rateLimitResult = await rateLimit({
      identifier: `waitlist-${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = WaitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, source } = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.from("waitlist_signups").insert({
      email: email.toLowerCase().trim(),
      source,
    });

    // Handle duplicate emails gracefully (don't expose if email exists)
    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation - email already exists
        // Return success to not reveal if email is already signed up
        return NextResponse.json({ success: true });
      }

      console.error("[Waitlist] Insert error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Waitlist] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
