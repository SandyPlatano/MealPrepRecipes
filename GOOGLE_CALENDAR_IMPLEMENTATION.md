# Google Calendar Integration - Implementation Status

## ✅ Completed

1. **Environment Variables** - Added Google OAuth credentials to `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. **Database Migration** - Created migration file to add Google Calendar fields to `user_settings` table:
   - `google_access_token` - OAuth access token
   - `google_refresh_token` - OAuth refresh token for token renewal
   - `google_connected_account` - Connected Google account email
   - `google_token_expires_at` - Token expiration timestamp
   - `calendar_event_time` - Default event time (default: 17:00/5 PM)
   - `calendar_event_duration_minutes` - Default event duration (default: 60 minutes)

3. **Google Calendar Service** - Created `/src/lib/google-calendar.ts` with:
   - OAuth URL generation
   - Token exchange and refresh
   - User info fetching
   - Calendar event creation
   - Meal plan batch event creation
   - Recipe description formatting

4. **OAuth Callback Page** - Created `/src/app/auth/google/callback/page.tsx`:
   - Handles Google OAuth redirect
   - Sends auth code back to parent window via postMessage
   - Shows success/error states

5. **API Routes**:
   - `/api/google-calendar/exchange-token` - Exchanges auth code for tokens and saves to database
   - `/api/google-calendar/disconnect` - Disconnects Google Calendar and clears tokens

6. **GoogleCalendarButton Component** - Created `/src/components/settings/google-calendar-button.tsx`:
   - Connect/disconnect button with OAuth popup flow
   - Shows connected account email
   - Loading states and error handling

## 🚧 Remaining Tasks

### 1. Google Cloud Console Setup

Ensure your Google OAuth app is configured with:
- **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback` (and production URL when deployed)
- **Scopes**:
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/userinfo.email`

### 2. Testing

Test the complete flow:
- Connect Google Calendar in Settings
- Add recipes to cart and assign them to days/cooks
- Send the meal plan
- Verify calendar events are created with correct times
- Check that calendar events include recipe details

## ✅ Recently Completed

1. **Database Migration Applied** - User confirmed migration was run
2. **Settings Page Updated** - Added Google Calendar section with GoogleCalendarButton
3. **send-shopping-list API Updated** - Now creates calendar events after sending email:
   - Fetches user's Google Calendar settings
   - Refreshes access token if expired
   - Creates calendar events for each assigned meal
   - Parses week range to calculate event dates
   - Uses configured event time and duration (defaults: 5 PM, 60 minutes)
   - Returns calendar creation results in API response
4. **Cart Sheet Updated** - Shows enhanced success toast with calendar event count
5. **Settings Actions** - Already fetches all Google Calendar fields via `select("*")`

## 🎯 How It Will Work

1. **User connects Google Calendar** in Settings:
   - Clicks "Connect Google Calendar" button
   - OAuth popup opens
   - User grants permissions
   - Tokens are saved to database

2. **User sends meal plan**:
   - Clicks "Send the Plan" in cart
   - Email is sent via Resend
   - If Google Calendar connected:
     - Calendar events are created for each assigned meal
     - Events scheduled at configured time (default 5 PM)
     - Events include recipe details and instructions
     - Success/error toasts shown

3. **Customizable Event Times** (future enhancement):
   - Default time can be set in Settings
   - Individual meal times can be set in cart (per-meal override)
   - Events created with specified times

## 📝 Code Examples

### Calendar Event Creation in send-shopping-list API

```typescript
// Check if Google Calendar is connected
const { data: settings } = await supabase
  .from("user_settings")
  .select("google_access_token, google_refresh_token, google_connected_account, calendar_event_time, calendar_event_duration_minutes")
  .eq("user_id", user.id)
  .single();

if (settings?.google_access_token) {
  // Refresh token if needed
  let accessToken = settings.google_access_token;
  // ... token refresh logic ...

  // Create calendar events
  const events = assignedItems.map(item => ({
    cook: item.cook,
    recipe: item.recipe.title,
    recipeData: {
      prepTime: item.recipe.prep_time,
      cookTime: item.recipe.cook_time,
      servings: item.recipe.servings,
      ingredients: item.recipe.ingredients,
      instructions: item.recipe.instructions,
    },
    startDateTime: // calculate from item.day + settings.calendar_event_time
    endDateTime: // calculate from startDateTime + settings.calendar_event_duration_minutes
  }));

  const result = await createMealPlanEvents({
    accessToken,
    events,
    attendeeEmails: [user.email],
  });

  // Show success toast
}
```

## 🔧 Testing Checklist

- [ ] Migration runs successfully
- [ ] Can connect Google Calendar in Settings
- [ ] Connected account email is displayed
- [ ] Can disconnect Google Calendar
- [ ] Tokens are saved correctly in database
- [ ] Sending meal plan creates calendar events
- [ ] Events have correct times and details
- [ ] Token refresh works when access token expires
- [ ] Error handling works for failed OAuth or API calls
- [ ] Calendar events include recipe instructions

## 🎨 UI/UX Enhancements (Optional)

1. **Per-meal custom times**: Add time picker to each cart item
2. **Event preview**: Show what calendar events will be created before sending
3. **Calendar sync status**: Show last sync time in settings
4. **Multiple calendars**: Allow selecting which calendar to use (not just "primary")
5. **Recurring events**: Option to create recurring events for meal prep routines

## 🐛 Known Issues / Edge Cases

1. **Token expiration**: Access tokens expire after 1 hour - need refresh logic
2. **Popup blockers**: Users need to allow popups for OAuth flow
3. **Multiple accounts**: Currently only supports one connected Google account per user
4. **Timezone handling**: Events use browser's timezone - may need server-side timezone selection
