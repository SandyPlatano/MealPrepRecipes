-- Add Google Calendar fields to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_connected_account TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS calendar_event_time TIME DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS calendar_event_duration_minutes INTEGER DEFAULT 60;

COMMENT ON COLUMN user_settings.google_access_token IS 'Google OAuth access token for Calendar API';
COMMENT ON COLUMN user_settings.google_refresh_token IS 'Google OAuth refresh token for Calendar API';
COMMENT ON COLUMN user_settings.google_connected_account IS 'Email address of the connected Google account';
COMMENT ON COLUMN user_settings.google_token_expires_at IS 'Expiration timestamp for the access token';
COMMENT ON COLUMN user_settings.calendar_event_time IS 'Default time for calendar events (24-hour format)';
COMMENT ON COLUMN user_settings.calendar_event_duration_minutes IS 'Default duration for calendar events in minutes';
