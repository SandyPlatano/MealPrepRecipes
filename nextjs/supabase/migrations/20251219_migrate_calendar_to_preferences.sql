-- Migration: Move calendar settings from dedicated columns to preferences JSONB
-- Date: 2025-12-19
-- Purpose: Consolidate calendar settings into preferences JSONB to match the
--          architecture pattern used by other settings (plannerView, cookMode, etc.)

-- Migrate existing calendar settings from columns to preferences JSONB
UPDATE user_settings
SET preferences = COALESCE(preferences, '{}'::jsonb) ||
  jsonb_build_object(
    'calendar', jsonb_build_object(
      'eventTime', COALESCE(calendar_event_time, '12:00'),
      'eventDurationMinutes', COALESCE(calendar_event_duration_minutes, 60),
      'excludedDays', COALESCE(calendar_excluded_days, ARRAY[]::text[])
    )
  )
WHERE calendar_event_time IS NOT NULL
   OR calendar_event_duration_minutes IS NOT NULL
   OR (calendar_excluded_days IS NOT NULL AND array_length(calendar_excluded_days, 1) > 0);

-- Add deprecation comments to old columns
-- NOTE: We're keeping these columns for backward compatibility during the transition period
-- They will be removed in a future migration after we've verified the JSONB approach works
COMMENT ON COLUMN user_settings.calendar_event_time IS
  'DEPRECATED: Moved to preferences.calendar.eventTime. Will be removed in future migration.';

COMMENT ON COLUMN user_settings.calendar_event_duration_minutes IS
  'DEPRECATED: Moved to preferences.calendar.eventDurationMinutes. Will be removed in future migration.';

COMMENT ON COLUMN user_settings.calendar_excluded_days IS
  'DEPRECATED: Moved to preferences.calendar.excludedDays. Will be removed in future migration.';
