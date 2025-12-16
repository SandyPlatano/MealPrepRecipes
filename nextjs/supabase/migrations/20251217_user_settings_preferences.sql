-- ============================================
-- Add preferences JSONB column for future extensibility
-- Instead of adding more nullable columns, new settings can go here
-- ============================================

-- Add preferences column for extensible settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Document the intended structure
COMMENT ON COLUMN user_settings.preferences IS
  'Extensible JSON for future settings. Structure: {
    "ui": { "compactMode": boolean, ... },
    "notifications": { "emailDigest": boolean, ... },
    "features": { "betaFeatures": boolean, ... }
  }';
