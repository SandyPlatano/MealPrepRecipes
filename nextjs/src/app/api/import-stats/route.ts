import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRateLimitStatus } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

const DAILY_IMPORT_LIMIT = 20;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get current rate limit status without consuming a request
    const status = await getRateLimitStatus({
      identifier: `parse-recipe-daily-${user.id}`,
      limit: DAILY_IMPORT_LIMIT,
      windowMs: DAY_IN_MS,
    });

    return NextResponse.json({
      remaining: status.remaining,
      limit: status.limit,
      reset: status.reset,
    });
  } catch (error) {
    console.error("Failed to get import stats:", error);
    return NextResponse.json(
      { error: "Failed to get import stats" },
      { status: 500 }
    );
  }
}
