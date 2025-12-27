# Cooking Mode Navigation/Exit Bug Fix

## Issue Summary

Users were experiencing "Failed to navigate" and "Failed to exit" toast errors when using the cooking mode feature at `/app/recipes/[id]/cook`.

## Root Cause

The cooking mode implementation was calling Supabase RPC functions that **did not exist** in the database:
- `start_cooking_session`
- `get_active_cooking_session`
- `navigate_cooking_step`
- `complete_cooking_session`
- `create_session_timer`

Additionally, the required database tables were missing:
- `voice_cooking_sessions`
- `voice_session_timers`
- `voice_cooking_analytics`

The application code was complete, but the database schema and functions were never created.

## Files Changed

### 1. Created Migration File
**File**: `nextjs/supabase/migrations/20251219_voice_cooking_mode.sql`

This migration creates:

#### Tables
- **voice_cooking_sessions**: Stores active cooking sessions with step tracking
- **voice_session_timers**: Manages timers created during cooking
- **voice_cooking_analytics**: Logs cooking events for analytics

#### RPC Functions
- **start_cooking_session**: Creates new cooking session, auto-abandons existing active sessions
- **get_active_cooking_session**: Retrieves current active session for user
- **navigate_cooking_step**: Handles next/back/repeat/jump navigation with validation
- **create_session_timer**: Creates timers associated with cooking sessions
- **complete_cooking_session**: Marks session complete and logs to cooking history

#### Security
- Row Level Security (RLS) policies ensure users can only access their own sessions
- All functions use `SECURITY DEFINER` with `auth.uid()` validation
- Proper CASCADE deletion for cleanup

### 2. Enhanced Error Handling
**File**: `nextjs/src/app/actions/voice-cooking.ts`

Updated all server actions with descriptive error messages:

#### Error Types Handled
1. **Missing Database Functions**: "Cooking mode database setup incomplete. Please contact support."
2. **Session Not Found**: "Cooking session not found. Please restart."
3. **Unauthorized Access**: "You don't have permission to access this session."
4. **Recipe Validation**: "This recipe has no instructions to cook."
5. **Generic Failures**: Include specific error context (e.g., "Navigation failed: [reason]")

#### Functions Updated
- `startCookingSession` - Better startup error messages
- `getActiveSession` - Database connection feedback
- `navigateStep` - Navigation-specific errors
- `jumpToStep` - Jump navigation errors
- `completeCookingSession` - Completion error context
- `abandonSession` - Exit error handling
- `createTimer` - Timer creation feedback

## Migration Deployment

To deploy this fix:

1. **Apply the migration** in your Supabase SQL Editor:
   ```bash
   # Navigate to Supabase project > SQL Editor
   # Copy and execute: supabase/migrations/20251219_voice_cooking_mode.sql
   ```

2. **Verify deployment**:
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'voice_%';

   -- Check functions exist
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name LIKE '%cooking%';
   ```

3. **Deploy code changes**:
   ```bash
   git add .
   git commit -m "fix: Add voice cooking database schema and improve error handling"
   git push
   ```

## Testing Checklist

After deployment, verify:

- [ ] Can start a new cooking session
- [ ] Can navigate next/back/repeat through steps
- [ ] Can create timers during cooking
- [ ] Can complete a cooking session (logs to cooking history)
- [ ] Can abandon/exit a session
- [ ] Error messages are descriptive and user-friendly
- [ ] Only one active session allowed at a time
- [ ] Existing active session auto-abandons when starting new one
- [ ] RLS policies prevent accessing other users' sessions

## Database Schema Details

### voice_cooking_sessions
```sql
- id: UUID (PK)
- user_id: UUID (FK to profiles)
- recipe_id: UUID (FK to recipes)
- current_step: INTEGER
- total_steps: INTEGER
- status: TEXT (active|paused|completed|abandoned)
- servings_multiplier: DECIMAL
- platform: TEXT (web|mobile|voice_assistant)
- device_type: TEXT
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### voice_session_timers
```sql
- id: UUID (PK)
- session_id: UUID (FK to voice_cooking_sessions)
- label: TEXT
- duration_seconds: INTEGER
- remaining_seconds: INTEGER
- status: TEXT (active|paused|completed|cancelled)
- step_index: INTEGER (nullable)
- alert_message: TEXT (nullable)
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Future Improvements

While this fix makes the cooking mode functional and robust, consider:

1. **Analytics Dashboard**: Utilize `voice_cooking_analytics` table for insights
2. **Session Recovery**: Allow resuming abandoned sessions
3. **Multi-device Sync**: Real-time sync across devices
4. **Voice Integration**: Leverage the platform field for voice assistant support
5. **Timer Notifications**: Browser notifications when timers complete

## Error Message Examples

Before:
```
"Failed to navigate"
"Failed to exit"
```

After:
```
"Cooking mode database setup incomplete. Please contact support."
"Cooking session not found. Please restart."
"You don't have permission to access this session."
"Navigation failed: Invalid direction specified"
```

## Performance Considerations

- Indexes added on frequently queried columns:
  - `user_id` for session lookups
  - `recipe_id` for recipe associations
  - `status` for active session queries
- Single active session per user prevents database bloat
- Automatic cleanup via CASCADE deletion
- Analytics events logged asynchronously

## Security Considerations

- All RPC functions validate `auth.uid()` before operations
- RLS policies enforce user isolation
- `SECURITY DEFINER` functions run with elevated privileges safely
- No SQL injection vectors (all parameters properly parameterized)
- Unauthorized access attempts return clear error messages without leaking data
