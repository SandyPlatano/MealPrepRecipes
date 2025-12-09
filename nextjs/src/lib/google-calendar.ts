/**
 * Google Calendar API service for Next.js
 */

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_API = "https://www.googleapis.com/oauth2/v2/userinfo";

export interface CalendarEvent {
  cook: string;
  recipe: string;
  recipeData?: {
    prepTime?: string;
    cookTime?: string;
    servings?: string | number;
    ingredients: string[];
    instructions: string[];
    sourceUrl?: string;
  };
  startDateTime: string;
  endDateTime: string;
}

/**
 * Generate Google OAuth URL
 */
export function getGoogleOAuthURL(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error_description || "Failed to exchange code for tokens"
    );
  }

  return await response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  return await response.json();
}

/**
 * Get user info (email) from Google
 */
export async function getUserInfo(
  accessToken: string
): Promise<{ email: string; verified_email: boolean }> {
  const response = await fetch(GOOGLE_USERINFO_API, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch user info");
  }

  return await response.json();
}

/**
 * Create calendar event
 */
export async function createCalendarEvent({
  accessToken,
  summary,
  description,
  startDateTime,
  endDateTime,
  attendeeEmails,
}: {
  accessToken: string;
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmails?: string[];
}): Promise<Record<string, unknown>> {
  const event: Record<string, unknown> = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  if (attendeeEmails && attendeeEmails.length > 0) {
    event.attendees = attendeeEmails.map((email) => ({ email }));
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create calendar event");
  }

  return await response.json();
}

/**
 * Create multiple calendar events (for meal plan)
 */
export async function createMealPlanEvents({
  accessToken,
  events,
  attendeeEmails,
}: {
  accessToken: string;
  events: CalendarEvent[];
  attendeeEmails?: string[];
}): Promise<{
  successful: number;
  failed: number;
  total: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    events.map((event) =>
      createCalendarEvent({
        accessToken,
        summary: `${event.cook}: ${event.recipe}`,
        description: formatRecipeDescription(event.recipeData),
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        attendeeEmails,
      })
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  return {
    successful: successful.length,
    failed: failed.length,
    total: events.length,
    errors: failed.map((f: { reason?: { message?: string } }) => f.reason?.message || "Unknown error"),
  };
}

/**
 * Format recipe data as description for calendar event
 */
function formatRecipeDescription(recipe: CalendarEvent["recipeData"]): string {
  if (!recipe) return "Cooking time.";

  let desc = `Prep Time: ${recipe.prepTime || "N/A"} | Cook Time: ${recipe.cookTime || "N/A"} | Servings: ${recipe.servings || "N/A"}\n\n`;

  desc += "INGREDIENTS:\n";
  recipe.ingredients.forEach((ing) => {
    desc += `- ${ing}\n`;
  });

  desc += "\nINSTRUCTIONS:\n";
  recipe.instructions.forEach((inst, index) => {
    desc += `${index + 1}. ${inst}\n`;
  });

  if (recipe.sourceUrl) {
    desc += `\nSource: ${recipe.sourceUrl}`;
  }

  return desc;
}
