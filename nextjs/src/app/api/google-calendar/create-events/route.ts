import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMealPlanEvents, refreshAccessToken } from "@/lib/google-calendar";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in." },
        { status: 401 }
      );
    }

    // Rate limiting: 20 calendar operations per hour
    const rateLimitResult = rateLimit({
      identifier: `calendar-events-${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { weekRange, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No meals assigned. Assign everyone first." },
        { status: 400 }
      );
    }

    // Check if user has Google Calendar connected
    const { data: settings } = await supabase
      .from("user_settings")
      .select("google_access_token, google_refresh_token, google_token_expires_at, google_connected_account, calendar_event_time, calendar_event_duration_minutes, calendar_excluded_days")
      .eq("user_id", user.id)
      .single();

    if (!settings?.google_access_token) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Please connect it in Settings first." },
        { status: 400 }
      );
    }

    let accessToken = settings.google_access_token;

    // Check if token is expired and refresh if needed
    if (settings.google_token_expires_at) {
      const expiresAt = new Date(settings.google_token_expires_at);
      const now = new Date();
      const bufferMinutes = 5; // Refresh 5 minutes before expiry
      const bufferTime = new Date(expiresAt.getTime() - bufferMinutes * 60 * 1000);

      if (now >= bufferTime && settings.google_refresh_token) {
        try {
          const newTokens = await refreshAccessToken(settings.google_refresh_token);
          accessToken = newTokens.access_token;

          // Update tokens in database
          const newExpiresAt = new Date();
          newExpiresAt.setSeconds(newExpiresAt.getSeconds() + newTokens.expires_in);

          await supabase
            .from("user_settings")
            .update({
              google_access_token: newTokens.access_token,
              google_token_expires_at: newExpiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } catch (refreshError) {
          console.error("Failed to refresh Google access token:", refreshError);
          return NextResponse.json(
            { error: "Failed to refresh Google Calendar access. Please reconnect in Settings." },
            { status: 401 }
          );
        }
      }
    }

    // Parse weekRange to get the Monday date (e.g., "Dec 2 - Dec 8" -> Dec 2, 2024)
    const weekRangeParts = weekRange.split(" - ");
    const startDateStr = weekRangeParts[0]; // e.g., "Dec 2"
    const currentYear = new Date().getFullYear();
    const mondayDate = new Date(`${startDateStr}, ${currentYear}`);

    // Get calendar settings with defaults
    const eventTime = settings.calendar_event_time || "17:00:00"; // Default 5 PM
    const eventDuration = settings.calendar_event_duration_minutes || 60; // Default 60 minutes
    const excludedDays = settings.calendar_excluded_days || [];

    // Filter out items for excluded days
    const filteredItems = items.filter((item: Record<string, unknown>) => !excludedDays.includes(item.day as string));

    if (filteredItems.length === 0) {
      return NextResponse.json(
        { error: "All assigned days are excluded from calendar sync. Please adjust your calendar settings." },
        { status: 400 }
      );
    }

    // Map items to calendar events with day offsets
    const dayMap: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const calendarEvents = filteredItems.map((item: Record<string, unknown>) => {
      const dayOffset = dayMap[item.day as string] || 0;
      const eventDate = new Date(mondayDate);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      // Parse event time (HH:MM:SS format)
      const [hours, minutes] = eventTime.split(":").map(Number);
      eventDate.setHours(hours, minutes, 0, 0);

      const startDateTime = eventDate.toISOString();

      // Calculate end time
      const endDate = new Date(eventDate);
      endDate.setMinutes(endDate.getMinutes() + eventDuration);
      const endDateTime = endDate.toISOString();

      const recipe = item.recipe as Record<string, unknown>;
      return {
        cook: item.cook,
        recipe: recipe.title,
        recipeData: {
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        },
        startDateTime,
        endDateTime,
      };
    });

    // Create calendar events
    const result = await createMealPlanEvents({
      accessToken,
      events: calendarEvents,
      attendeeEmails: [user.email],
    });

    if (result.failed > 0) {
      console.error("Some calendar events failed to create:", result.errors);
    }

    return NextResponse.json({
      success: true,
      eventsCreated: result.successful,
      eventsFailed: result.failed,
      totalEvents: result.total,
      eventsSkipped: items.length - filteredItems.length,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Error creating calendar events:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create calendar events: ${errorMessage}` },
      { status: 500 }
    );
  }
}
