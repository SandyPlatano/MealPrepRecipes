-- ============================================
-- Voice Cooking Mode Schema
-- Adds database support for voice-enabled cooking sessions
-- ============================================

-- Voice cooking sessions table
CREATE TABLE IF NOT EXISTS voice_cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  servings_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'mobile', 'voice_assistant')),
  device_type TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice session timers table
CREATE TABLE IF NOT EXISTS voice_session_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_cooking_sessions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  remaining_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  step_index INTEGER,
  alert_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice cooking analytics table
CREATE TABLE IF NOT EXISTS voice_cooking_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_cooking_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('navigation', 'timer_created', 'timer_completed', 'voice_command', 'error')),
  event_data JSONB,
  step_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_cooking_sessions_user_id ON voice_cooking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_cooking_sessions_recipe_id ON voice_cooking_sessions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_voice_cooking_sessions_status ON voice_cooking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_session_timers_session_id ON voice_session_timers(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_session_timers_status ON voice_session_timers(status);
CREATE INDEX IF NOT EXISTS idx_voice_cooking_analytics_session_id ON voice_cooking_analytics(session_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_voice_cooking_sessions_updated_at ON voice_cooking_sessions;
CREATE TRIGGER update_voice_cooking_sessions_updated_at
  BEFORE UPDATE ON voice_cooking_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_session_timers_updated_at ON voice_session_timers;
CREATE TRIGGER update_voice_session_timers_updated_at
  BEFORE UPDATE ON voice_session_timers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to start a new cooking session
CREATE OR REPLACE FUNCTION start_cooking_session(
  p_recipe_id UUID,
  p_servings_multiplier DECIMAL DEFAULT 1.00,
  p_platform TEXT DEFAULT 'web',
  p_device_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_total_steps INTEGER;
  v_existing_session_id UUID;
BEGIN
  -- Get the authenticated user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for existing active session
  SELECT id INTO v_existing_session_id
  FROM voice_cooking_sessions
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  -- If there's an existing active session, abandon it first
  IF v_existing_session_id IS NOT NULL THEN
    UPDATE voice_cooking_sessions
    SET status = 'abandoned', updated_at = NOW()
    WHERE id = v_existing_session_id;
  END IF;

  -- Get total steps from recipe
  SELECT array_length(instructions, 1) INTO v_total_steps
  FROM recipes
  WHERE id = p_recipe_id;

  IF v_total_steps IS NULL OR v_total_steps = 0 THEN
    RAISE EXCEPTION 'Recipe has no instructions';
  END IF;

  -- Create new session
  INSERT INTO voice_cooking_sessions (
    user_id,
    recipe_id,
    current_step,
    total_steps,
    servings_multiplier,
    platform,
    device_type,
    status
  ) VALUES (
    auth.uid(),
    p_recipe_id,
    1,
    v_total_steps,
    p_servings_multiplier,
    p_platform,
    p_device_type,
    'active'
  )
  RETURNING id INTO v_session_id;

  -- Log analytics event
  INSERT INTO voice_cooking_analytics (session_id, event_type, event_data)
  VALUES (v_session_id, 'navigation', jsonb_build_object('action', 'session_started', 'step', 1));

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active cooking session
CREATE OR REPLACE FUNCTION get_active_cooking_session()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  recipe_id UUID,
  current_step INTEGER,
  total_steps INTEGER,
  status TEXT,
  servings_multiplier DECIMAL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Get the authenticated user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    vcs.id,
    vcs.user_id,
    vcs.recipe_id,
    vcs.current_step,
    vcs.total_steps,
    vcs.status,
    vcs.servings_multiplier,
    vcs.started_at,
    vcs.completed_at,
    vcs.created_at,
    vcs.updated_at
  FROM voice_cooking_sessions vcs
  WHERE vcs.user_id = auth.uid()
    AND vcs.status = 'active'
  ORDER BY vcs.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to navigate cooking steps
CREATE OR REPLACE FUNCTION navigate_cooking_step(
  p_session_id UUID,
  p_direction TEXT,
  p_target_step INTEGER DEFAULT NULL
)
RETURNS TABLE (
  new_step INTEGER,
  total_steps INTEGER,
  is_complete BOOLEAN
) AS $$
DECLARE
  v_current_step INTEGER;
  v_total_steps INTEGER;
  v_new_step INTEGER;
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current session state
  SELECT vcs.current_step, vcs.total_steps, vcs.user_id
  INTO v_current_step, v_total_steps, v_user_id
  FROM voice_cooking_sessions vcs
  WHERE vcs.id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Verify user owns this session
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Calculate new step based on direction
  CASE p_direction
    WHEN 'next' THEN
      v_new_step := LEAST(v_current_step + 1, v_total_steps);
    WHEN 'back' THEN
      v_new_step := GREATEST(v_current_step - 1, 1);
    WHEN 'repeat' THEN
      v_new_step := v_current_step;
    WHEN 'jump' THEN
      IF p_target_step IS NULL THEN
        RAISE EXCEPTION 'Target step required for jump navigation';
      END IF;
      v_new_step := GREATEST(1, LEAST(p_target_step, v_total_steps));
    ELSE
      RAISE EXCEPTION 'Invalid navigation direction: %', p_direction;
  END CASE;

  -- Update session with new step
  UPDATE voice_cooking_sessions
  SET current_step = v_new_step, updated_at = NOW()
  WHERE id = p_session_id;

  -- Log analytics event
  INSERT INTO voice_cooking_analytics (session_id, event_type, event_data, step_index)
  VALUES (
    p_session_id,
    'navigation',
    jsonb_build_object('direction', p_direction, 'from_step', v_current_step, 'to_step', v_new_step),
    v_new_step
  );

  -- Return result
  RETURN QUERY SELECT
    v_new_step,
    v_total_steps,
    (v_new_step = v_total_steps) AS is_complete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a session timer
CREATE OR REPLACE FUNCTION create_session_timer(
  p_session_id UUID,
  p_label TEXT,
  p_duration_seconds INTEGER,
  p_step_index INTEGER DEFAULT NULL,
  p_alert_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_timer_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user owns this session
  SELECT user_id INTO v_user_id
  FROM voice_cooking_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Create timer
  INSERT INTO voice_session_timers (
    session_id,
    label,
    duration_seconds,
    remaining_seconds,
    step_index,
    alert_message,
    status
  ) VALUES (
    p_session_id,
    p_label,
    p_duration_seconds,
    p_duration_seconds,
    p_step_index,
    p_alert_message,
    'active'
  )
  RETURNING id INTO v_timer_id;

  -- Log analytics event
  INSERT INTO voice_cooking_analytics (session_id, event_type, event_data, step_index)
  VALUES (
    p_session_id,
    'timer_created',
    jsonb_build_object('label', p_label, 'duration', p_duration_seconds),
    p_step_index
  );

  RETURN v_timer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a cooking session
CREATE OR REPLACE FUNCTION complete_cooking_session(
  p_session_id UUID,
  p_rating DECIMAL DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_recipe_id UUID;
BEGIN
  -- Get the authenticated user ID
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get session details
  SELECT user_id, recipe_id INTO v_user_id, v_recipe_id
  FROM voice_cooking_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Verify user owns this session
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update session status
  UPDATE voice_cooking_sessions
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_session_id;

  -- Log to cooking history
  INSERT INTO cooking_history (user_id, recipe_id, cooked_at, rating, notes)
  VALUES (auth.uid(), v_recipe_id, NOW(), p_rating, p_notes);

  -- Cancel any active timers
  UPDATE voice_session_timers
  SET status = 'cancelled', updated_at = NOW()
  WHERE session_id = p_session_id
    AND status IN ('active', 'paused');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE voice_cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_session_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_cooking_analytics ENABLE ROW LEVEL SECURITY;

-- Voice cooking sessions policies
CREATE POLICY "Users can view own cooking sessions"
  ON voice_cooking_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cooking sessions"
  ON voice_cooking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cooking sessions"
  ON voice_cooking_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cooking sessions"
  ON voice_cooking_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Voice session timers policies
CREATE POLICY "Users can view own session timers"
  ON voice_session_timers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_cooking_sessions
      WHERE id = voice_session_timers.session_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own session timers"
  ON voice_session_timers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_cooking_sessions
      WHERE id = voice_session_timers.session_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own session timers"
  ON voice_session_timers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM voice_cooking_sessions
      WHERE id = voice_session_timers.session_id
        AND user_id = auth.uid()
    )
  );

-- Voice cooking analytics policies
CREATE POLICY "Users can view own analytics"
  ON voice_cooking_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_cooking_sessions
      WHERE id = voice_cooking_analytics.session_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own analytics"
  ON voice_cooking_analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_cooking_sessions
      WHERE id = voice_cooking_analytics.session_id
        AND user_id = auth.uid()
    )
  );
