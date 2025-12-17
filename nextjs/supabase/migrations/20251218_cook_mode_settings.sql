-- ============================================
-- Cook Mode Settings in preferences JSONB
-- Stores cook mode customization options
-- ============================================

-- Update the comment to document cookMode structure
COMMENT ON COLUMN user_settings.preferences IS
  'Extensible JSON for settings. Structure: {
    "cookMode": {
      "display": { "fontSize": "small"|"medium"|"large", "themeOverride": "system"|"light"|"dark" },
      "visibility": { "showIngredients": boolean, "showTimers": boolean, "showProgress": boolean },
      "behavior": { "keepScreenAwake": boolean, "timerSounds": boolean, "autoAdvance": boolean },
      "navigation": { "mode": "step-by-step"|"scrollable" }
    }
  }';
