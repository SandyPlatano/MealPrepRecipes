/**
 * Google Calendar API service
 */

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/**
 * Generate Google OAuth URL
 */
export function getGoogleOAuthURL(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for tokens');
  }

  return await response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
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
  attendeeEmail,
}) {
  const event = {
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

  if (attendeeEmail) {
    event.attendees = [{ email: attendeeEmail }];
  }

  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create calendar event');
  }

  return await response.json();
}

/**
 * Create multiple calendar events (for meal plan)
 */
export async function createMealPlanEvents({
  accessToken,
  events,
  attendeeEmail,
}) {
  const results = await Promise.allSettled(
    events.map(event => 
      createCalendarEvent({
        accessToken,
        summary: `${event.cook}: ${event.recipe}`,
        description: formatRecipeDescription(event.recipeData),
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        attendeeEmail,
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  return {
    successful: successful.length,
    failed: failed.length,
    total: events.length,
    errors: failed.map(f => f.reason?.message || 'Unknown error'),
  };
}

/**
 * Format recipe data as description for calendar event
 */
function formatRecipeDescription(recipe) {
  if (!recipe) return 'Meal prep cooking time.';
  
  let desc = `Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Servings: ${recipe.servings}\n\n`;
  
  desc += 'INGREDIENTS:\n';
  recipe.ingredients.forEach(ing => {
    desc += `- ${ing}\n`;
  });
  
  desc += '\nINSTRUCTIONS:\n';
  recipe.instructions.forEach((inst, index) => {
    desc += `${index + 1}. ${inst}\n`;
  });
  
  if (recipe.sourceUrl) {
    desc += `\nSource: ${recipe.sourceUrl}`;
  }
  
  return desc;
}

