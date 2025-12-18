# Phase 0: Consolidated Database Schema Design

**Focus:** Social Community (Phase 3) + Voice Interface (Phase 4)
**Skipping:** AI Meal Planning (Phase 1)

---

## Existing Foundation (No Changes Needed)

These tables are already complete and well-designed:

### Social Core
- `profiles` - username, bio, public_profile, follower/following counts
- `follows` - follower/following relationships
- `reviews` - recipe reviews with ratings, photos, helpful counts
- `review_responses` - replies to reviews
- `review_helpful_votes` - upvoting reviews
- `saved_recipes` - saving others' public recipes
- `activity_feed_events` - activity feed events
- `recipe_share_events` - share tracking
- `recipe_reports` - moderation

### Cooking History
- `cooking_history` - cook logs with ratings, notes, photo_url, modifications

---

## New Tables: Social Community Enhancements

### 1. `cooking_streaks` - Gamification Engine

Tracks consecutive cooking activity for streak mechanics.

```sql
CREATE TABLE cooking_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Current streak
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  current_streak_start DATE,

  -- Best streak (all-time)
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_start DATE,
  longest_streak_end DATE,

  -- Weekly streak (meals per week target)
  weekly_target INTEGER DEFAULT 5,
  current_week_count INTEGER DEFAULT 0,
  current_week_start DATE,

  -- Streak maintenance
  last_cook_date DATE,
  streak_frozen_until DATE, -- Grace period / freeze feature
  freeze_count_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

-- Index for leaderboard queries
CREATE INDEX idx_cooking_streaks_current ON cooking_streaks(current_streak_days DESC);
CREATE INDEX idx_cooking_streaks_longest ON cooking_streaks(longest_streak_days DESC);
```

### 2. `user_badges` - Achievement System

Gamification badges earned by users.

```sql
CREATE TYPE badge_category AS ENUM (
  'cooking',      -- Cooking-related achievements
  'social',       -- Community engagement
  'streak',       -- Streak milestones
  'collection',   -- Recipe collection achievements
  'creator'       -- Recipe creation achievements
);

CREATE TABLE badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  slug TEXT NOT NULL UNIQUE, -- 'first_cook', 'streak_7', 'recipe_viral'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT DEFAULT '🏆',
  category badge_category NOT NULL,

  -- Unlock criteria (JSONB for flexibility)
  criteria JSONB NOT NULL DEFAULT '{}',
  -- Example: {"type": "streak_days", "value": 7}
  -- Example: {"type": "recipes_created", "value": 10}
  -- Example: {"type": "followers", "value": 100}

  -- Display
  is_hidden BOOLEAN DEFAULT false, -- Hidden until earned
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,

  earned_at TIMESTAMPTZ DEFAULT now(),

  -- Optional context about how it was earned
  context JSONB DEFAULT '{}',
  -- Example: {"recipe_id": "...", "streak_length": 30}

  -- Display preferences
  is_featured BOOLEAN DEFAULT false, -- Show on profile

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_featured ON user_badges(user_id, is_featured) WHERE is_featured = true;
```

### 3. `cook_photos` - "I Made It" Public Gallery

Public photos from cooking_history for social sharing.

```sql
CREATE TABLE cook_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  cooking_history_id UUID REFERENCES cooking_history(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  caption TEXT,

  -- Visibility
  is_public BOOLEAN DEFAULT true,

  -- Engagement
  like_count INTEGER DEFAULT 0,

  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cook_photos_recipe ON cook_photos(recipe_id, is_public, created_at DESC);
CREATE INDEX idx_cook_photos_user ON cook_photos(user_id, created_at DESC);
```

### 4. `cook_photo_likes` - Photo Engagement

```sql
CREATE TABLE cook_photo_likes (
  photo_id UUID NOT NULL REFERENCES cook_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (photo_id, user_id)
);
```

### 5. `social_notifications` - Notification System

```sql
CREATE TYPE notification_type AS ENUM (
  'new_follower',
  'recipe_liked',
  'recipe_saved',
  'review_received',
  'review_helpful',
  'cook_photo_liked',
  'badge_earned',
  'streak_milestone',
  'streak_at_risk'
);

CREATE TABLE social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  notification_type notification_type NOT NULL,

  -- Who triggered this notification
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- What entity is this about
  entity_type TEXT, -- 'recipe', 'review', 'photo', 'badge'
  entity_id UUID,

  -- Notification content
  title TEXT NOT NULL,
  body TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON social_notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;
CREATE INDEX idx_notifications_user_all ON social_notifications(user_id, created_at DESC);
```

### 6. `public_collections` - Shareable Recipe Collections

Extends recipe_folders for public sharing.

```sql
CREATE TABLE public_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  emoji TEXT DEFAULT '📚',

  -- Visibility
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,

  -- SEO / Discovery
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, slug)
);

CREATE TABLE public_collection_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  collection_id UUID NOT NULL REFERENCES public_collections(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Curator note about why this recipe is in the collection
  curator_note TEXT,

  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(collection_id, recipe_id)
);

CREATE TABLE saved_collections (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public_collections(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (user_id, collection_id)
);

CREATE INDEX idx_public_collections_user ON public_collections(user_id, is_published);
CREATE INDEX idx_public_collections_popular ON public_collections(save_count DESC) WHERE is_published = true;
```

---

## New Tables: Voice Interface (Phase 4)

### 7. `voice_cooking_sessions` - Active Cooking Session

Tracks an active voice-guided cooking session.

```sql
CREATE TYPE cooking_session_status AS ENUM (
  'active',
  'paused',
  'completed',
  'abandoned'
);

CREATE TABLE voice_cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,

  -- Session state
  status cooking_session_status NOT NULL DEFAULT 'active',
  current_step INTEGER NOT NULL DEFAULT 0, -- 0-indexed
  total_steps INTEGER NOT NULL,

  -- Scaling
  servings_multiplier NUMERIC DEFAULT 1.0,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT now(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_active_time_seconds INTEGER DEFAULT 0,

  -- Voice preferences for this session
  voice_settings JSONB DEFAULT '{}',
  -- Example: {"verbosity": "concise", "speed": 1.0, "confirmations": true}

  -- Session metadata
  platform TEXT, -- 'google_assistant', 'alexa', 'web', 'ios', 'android'
  device_type TEXT, -- 'smart_display', 'smart_speaker', 'phone', 'tablet'

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_sessions_user_active ON voice_cooking_sessions(user_id, status)
  WHERE status = 'active';
CREATE INDEX idx_voice_sessions_recipe ON voice_cooking_sessions(recipe_id);
```

### 8. `voice_session_timers` - Timer Management

Multiple named timers per cooking session.

```sql
CREATE TYPE timer_status AS ENUM (
  'running',
  'paused',
  'completed',
  'cancelled'
);

CREATE TABLE voice_session_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES voice_cooking_sessions(id) ON DELETE CASCADE,

  -- Timer identity
  label TEXT NOT NULL, -- 'Pasta', 'Sauce simmering', 'Bread rising'

  -- Timer settings
  duration_seconds INTEGER NOT NULL,
  remaining_seconds INTEGER NOT NULL,

  -- Timer state
  status timer_status NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT now(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Context
  step_index INTEGER, -- Which recipe step this timer is for

  -- Notification settings
  alert_sound TEXT DEFAULT 'default',
  alert_message TEXT, -- Custom "Your pasta is ready!"

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_timers_session ON voice_session_timers(session_id, status);
CREATE INDEX idx_session_timers_active ON voice_session_timers(session_id)
  WHERE status IN ('running', 'paused');
```

### 9. `voice_session_events` - Session Analytics

Track voice commands and interactions for analytics.

```sql
CREATE TYPE voice_event_type AS ENUM (
  -- Navigation
  'session_start',
  'session_end',
  'step_next',
  'step_back',
  'step_repeat',
  'step_jump',

  -- Timers
  'timer_set',
  'timer_pause',
  'timer_resume',
  'timer_cancel',
  'timer_complete',

  -- Queries
  'ingredient_query',
  'quantity_query',
  'substitution_query',
  'time_query',
  'temperature_query',

  -- Errors
  'command_not_understood',
  'command_failed',

  -- Other
  'pause',
  'resume',
  'help_requested'
);

CREATE TABLE voice_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES voice_cooking_sessions(id) ON DELETE CASCADE,

  event_type voice_event_type NOT NULL,

  -- What triggered this event
  raw_command TEXT, -- The actual voice command
  interpreted_intent TEXT, -- What we thought they meant
  confidence_score NUMERIC, -- ASR confidence

  -- Context
  step_index INTEGER,

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_events_session ON voice_session_events(session_id, created_at);
CREATE INDEX idx_voice_events_type ON voice_session_events(event_type, created_at DESC);
```

### 10. `user_voice_preferences` - Voice Settings

User preferences for voice cooking experience.

```sql
CREATE TABLE user_voice_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Voice output settings
  tts_speed NUMERIC DEFAULT 1.0 CHECK (tts_speed >= 0.5 AND tts_speed <= 2.0),
  tts_voice TEXT DEFAULT 'default', -- Platform-specific voice ID

  -- Verbosity
  verbosity TEXT DEFAULT 'normal'
    CHECK (verbosity IN ('concise', 'normal', 'detailed')),
  include_tips BOOLEAN DEFAULT true,
  include_timing_hints BOOLEAN DEFAULT true,

  -- Confirmation behavior
  confirm_navigation BOOLEAN DEFAULT false, -- "Moving to step 3, confirm?"
  confirm_timers BOOLEAN DEFAULT true, -- "Setting 15 minute timer, confirm?"

  -- Wake word (if custom)
  custom_wake_word TEXT,
  wake_word_enabled BOOLEAN DEFAULT true,

  -- Accessibility
  high_contrast_mode BOOLEAN DEFAULT false,
  large_text_mode BOOLEAN DEFAULT false,
  screen_reader_optimized BOOLEAN DEFAULT false,

  -- Timer preferences
  default_timer_sound TEXT DEFAULT 'chime',
  timer_volume INTEGER DEFAULT 80 CHECK (timer_volume >= 0 AND timer_volume <= 100),

  -- Platform preferences
  preferred_platform TEXT, -- 'google_assistant', 'alexa', 'siri'

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);
```

### 11. `recipe_voice_data` - Voice-Optimized Recipe Data

Pre-processed recipe data optimized for voice delivery.

```sql
CREATE TABLE recipe_voice_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Voice-optimized instructions (shorter, clearer)
  voice_instructions JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"step": 1, "text": "Preheat your oven to 375 degrees.", "duration_hint": "15 minutes"},
  --   {"step": 2, "text": "Dice the onion into quarter-inch pieces.", "technique_video_url": "..."}
  -- ]

  -- Voice-optimized ingredient list
  voice_ingredients JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"name": "onion", "quantity": "1 large", "voice_text": "one large onion"}
  -- ]

  -- Timing data extracted from instructions
  timing_cues JSONB DEFAULT '[]',
  -- Example: [{"step": 3, "duration_seconds": 900, "label": "simmer sauce"}]

  -- Temperature mentions
  temperature_cues JSONB DEFAULT '[]',
  -- Example: [{"step": 1, "temp_f": 375, "temp_c": 190, "context": "oven"}]

  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT now(),
  generation_model TEXT, -- 'manual', 'ai_claude', 'ai_gpt4'

  UNIQUE(recipe_id)
);

CREATE INDEX idx_recipe_voice_data_recipe ON recipe_voice_data(recipe_id);
```

---

## RLS Policies Summary

All new tables need RLS policies. Key patterns:

### Social Tables
- `cooking_streaks`: Users can only see/modify their own
- `user_badges`: Users can see anyone's public badges, modify only their own
- `cook_photos`: Public photos visible to all, own photos fully editable
- `social_notifications`: Users can only see their own
- `public_collections`: Published collections visible to all, own collections editable

### Voice Tables
- `voice_cooking_sessions`: Users can only access their own sessions
- `voice_session_timers`: Access through session ownership
- `voice_session_events`: Access through session ownership
- `user_voice_preferences`: Users can only see/modify their own
- `recipe_voice_data`: Readable by all (public recipe data), writable by recipe owner

---

## Migration Order

1. **Social Enhancements Migration**
   - badge_definitions + user_badges
   - cooking_streaks
   - cook_photos + cook_photo_likes
   - social_notifications
   - public_collections + public_collection_recipes + saved_collections

2. **Voice Interface Migration**
   - user_voice_preferences
   - recipe_voice_data
   - voice_cooking_sessions
   - voice_session_timers
   - voice_session_events

3. **Functions & Triggers**
   - update_cooking_streak() - called after cooking_history insert
   - check_badge_criteria() - called after various events
   - sync_cook_photo_to_public() - optional auto-publish from cooking_history

---

## Storage Buckets Needed

### `cook-photos` bucket
- Public photos for "I Made It" gallery
- Max size: 5MB per image
- Allowed types: image/jpeg, image/png, image/webp
