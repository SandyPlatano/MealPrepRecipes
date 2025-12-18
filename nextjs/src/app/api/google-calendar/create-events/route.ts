import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMealPlanEvents, refreshAccessToken } from "@/lib/google-calendar";
import { rateLimit } from "@/lib/rate-limit";
import { DEFAULT_MEAL_TYPE_SETTINGS, type MealTypeCustomization, type MealTypeKey } from "@/types/settings";

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
    const { weekRange, items, userTimeZone } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No meals assigned. Assign everyone first." },
        { status: 400 }
      );
    }

    // Check if user has Google Calendar connected
    const { data: settings } = await supabase
      .from("user_settings")
      .select("google_access_token, google_refresh_token, google_token_expires_at, google_connected_account, calendar_event_time, calendar_event_duration_minutes, calendar_excluded_days, preferences")
      .eq("user_id", user.id)
      .single();

    if (!settings?.google_access_token) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Please connect it in Settings first." },
        { status: 400 }
      );
    }

    // Extract calendar preferences from JSONB with fallback to old columns
    // Note: Global calendar preferences are deprecated in favor of per-meal-type settings
    const preferences = settings.preferences as { calendar?: { eventTime?: string; eventDurationMinutes?: number; excludedDays?: string[] } } | undefined;
    const calendarPrefs = preferences?.calendar;

    // Legacy fallback for global event time (used when meal type doesn't have a specific time)
    const globalEventTime = calendarPrefs?.eventTime || settings.calendar_event_time || "12:00";
    // Legacy fallback for global duration (used when meal type doesn't have a specific duration)
    const globalEventDuration = calendarPrefs?.eventDurationMinutes || settings.calendar_event_duration_minutes || 60;

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

    // Get meal type settings for meal-type-specific calendar times, durations, and excluded days
    const mealTypePreferences = settings.preferences as { mealTypeSettings?: MealTypeCustomization } | null;
    const mealTypeSettings: MealTypeCustomization = mealTypePreferences?.mealTypeSettings || DEFAULT_MEAL_TYPE_SETTINGS;

    // Filter out items based on per-meal-type excluded days
    const filteredItems = items.filter((item: Record<string, unknown>) => {
      const mealType = (item.meal_type as MealTypeKey | null) ?? "other";
      const mealTypeExcludedDays = mealTypeSettings[mealType]?.excludedDays || [];
      return !mealTypeExcludedDays.includes(item.day as string);
    });

    if (filteredItems.length === 0) {
      return NextResponse.json(
        { error: "All assigned days are excluded from calendar sync. Please adjust your meal type settings." },
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

      // Format date as YYYY-MM-DD
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Get meal-type-specific settings
      const mealType = (item.meal_type as MealTypeKey | null) ?? "other";
      const mealTypeConfig = mealTypeSettings[mealType];
      const mealTypeTime = mealTypeConfig?.calendarTime;
      const mealTypeDuration = mealTypeConfig?.duration || globalEventDuration;

      // Convert HH:MM to HH:MM:SS format if needed, or use global time as fallback
      const eventTime = mealTypeTime ? `${mealTypeTime}:00` : `${globalEventTime}:00`;

      // Combine date and time (time is already in HH:MM:SS format)
      const startDateTime = `${dateStr}T${eventTime}`;

      // Calculate end time by parsing the time and adding per-meal-type duration
      const [hours, minutes, seconds] = eventTime.split(":").map(Number);
      const endDate = new Date(eventDate);
      endDate.setHours(hours, minutes + mealTypeDuration, seconds || 0, 0);
      
      // Format end time (handle day overflow if event crosses midnight)
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const endDateStr = `${endYear}-${endMonth}-${endDay}`;
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      const endSeconds = String(endDate.getSeconds()).padStart(2, '0');
      const endDateTime = `${endDateStr}T${endHours}:${endMinutes}:${endSeconds}`;

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
      timeZone: userTimeZone,
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
