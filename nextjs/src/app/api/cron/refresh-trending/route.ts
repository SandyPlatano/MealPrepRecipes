import { NextResponse } from "next/server";
import { refreshTrendingCache } from "@/app/actions/community";

// This endpoint should be called by a cron job every 15 minutes
// Configure in vercel.json or your hosting provider's cron settings

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow requests with valid cron secret or in development
  if (process.env.NODE_ENV !== "development") {
    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await refreshTrendingCache();

    if (result.error) {
      console.error("Failed to refresh trending cache:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Trending cache refreshed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in refresh-trending cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering from admin panels
export async function POST(request: Request) {
  return GET(request);
}
