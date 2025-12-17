-- ============================================================================
-- AUTOMATION RULES SYSTEM (IFTTT-style)
-- Allows users to create automated workflows
-- (e.g., "When I rate 5 stars, add to favorites")
-- ============================================================================

-- Enum for trigger types
DO $$ BEGIN
  CREATE TYPE automation_trigger AS ENUM (
    'recipe_rated',
    'recipe_cooked',
    'recipe_created',
    'recipe_added_to_folder',
    'recipe_removed_from_folder',
    'meal_assigned',
    'meal_unassigned',
    'shopping_list_generated',
    'shopping_item_checked',
    'macro_logged',
    'pantry_item_added',
    'pantry_item_expiring',
    'pantry_item_expired',
    'scheduled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum for action types
DO $$ BEGIN
  CREATE TYPE automation_action AS ENUM (
    'add_to_folder',
    'remove_from_folder',
    'add_tag',
    'remove_tag',
    'set_favorite',
    'unset_favorite',
    'set_lifecycle_stage',
    'send_email',
    'send_notification',
    'add_to_shopping_list',
    'add_to_pantry',
    'webhook',
    'run_script'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  trigger_type automation_trigger NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '[]'::jsonb, -- conditions that must match
  action_type automation_action NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- action-specific configuration
  schedule TEXT, -- cron expression for scheduled triggers
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation execution log table
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  triggered_by JSONB, -- what triggered it (recipe_id, etc)
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  result JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_household ON automation_rules(household_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(household_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_automation_runs_rule ON automation_runs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(rule_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_executed ON automation_runs(executed_at DESC);

-- Enable RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

-- RLS for automation rules
CREATE POLICY "Users can view automation rules for their household"
  ON automation_rules FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert automation rules for their household"
  ON automation_rules FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update automation rules for their household"
  ON automation_rules FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete automation rules for their household"
  ON automation_rules FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- RLS for automation runs
CREATE POLICY "Users can view automation runs for their rules"
  ON automation_runs FOR SELECT
  USING (
    rule_id IN (
      SELECT id FROM automation_rules WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Trigger condition schema documentation
COMMENT ON COLUMN automation_rules.trigger_conditions IS 'Array of condition objects:
[
  {
    "field": "rating", // field to check
    "operator": "gte", // eq|neq|gt|gte|lt|lte|contains|not_contains|matches|is_null|is_not_null
    "value": 5 // value to compare against
  },
  {
    "field": "prep_time_minutes",
    "operator": "lt",
    "value": 30
  }
]
Multiple conditions are ANDed together.';

-- Action config schema documentation
COMMENT ON COLUMN automation_rules.action_config IS 'Action-specific configuration object:
- add_to_folder: {"folder_id": "uuid"}
- remove_from_folder: {"folder_id": "uuid"}
- add_tag: {"tag": "string"}
- remove_tag: {"tag": "string"}
- set_favorite: {}
- unset_favorite: {}
- set_lifecycle_stage: {"stage_id": "uuid"}
- send_email: {"template": "string", "subject": "string"}
- send_notification: {"title": "string", "body": "string"}
- add_to_shopping_list: {"items": [{"ingredient": "string", "quantity": "string"}]}
- add_to_pantry: {"ingredient": "string", "quantity": "number"}
- webhook: {"url": "string", "method": "POST|GET", "headers": {}, "body_template": "string"}
- run_script: {"script": "string"} // JavaScript code
';

-- Function to record an automation run
CREATE OR REPLACE FUNCTION record_automation_run(
  p_rule_id UUID,
  p_triggered_by JSONB,
  p_status TEXT,
  p_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_run_id UUID;
BEGIN
  -- Insert the run record
  INSERT INTO automation_runs (rule_id, triggered_by, status, result, error_message, execution_time_ms)
  VALUES (p_rule_id, p_triggered_by, p_status, p_result, p_error_message, p_execution_time_ms)
  RETURNING id INTO v_run_id;

  -- Update the rule's last_run_at and counts
  UPDATE automation_rules
  SET
    last_run_at = NOW(),
    run_count = run_count + 1,
    error_count = CASE WHEN p_status = 'failed' THEN error_count + 1 ELSE error_count END,
    updated_at = NOW()
  WHERE id = p_rule_id;

  RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get enabled rules for a trigger type
CREATE OR REPLACE FUNCTION get_enabled_rules_for_trigger(
  p_household_id UUID,
  p_trigger_type automation_trigger
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  trigger_conditions JSONB,
  action_type automation_action,
  action_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ar.id,
    ar.name,
    ar.trigger_conditions,
    ar.action_type,
    ar.action_config
  FROM automation_rules ar
  WHERE ar.household_id = p_household_id
    AND ar.trigger_type = p_trigger_type
    AND ar.is_enabled = true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS automation_rules_updated_at ON automation_rules;
CREATE TRIGGER automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_automation_rules_updated_at();

-- Cleanup old runs (keep last 100 per rule)
CREATE OR REPLACE FUNCTION cleanup_old_automation_runs()
RETURNS void AS $$
BEGIN
  DELETE FROM automation_runs
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY rule_id ORDER BY executed_at DESC) as rn
      FROM automation_runs
    ) ranked
    WHERE rn > 100
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
