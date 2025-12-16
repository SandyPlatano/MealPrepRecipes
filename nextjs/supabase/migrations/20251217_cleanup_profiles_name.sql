-- ============================================
-- CLEANUP: Remove legacy name column from profiles
-- The name field was split into first_name/last_name in 20251204154125
-- but the old column was never dropped. This migration completes the cleanup.
-- ============================================

-- Step 1: Update the handle_new_user() trigger to use first_name/last_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_household_id UUID;
  extracted_name TEXT;
BEGIN
  -- Extract name from user metadata
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile with split name fields
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(extracted_name, ' ', 1),
    CASE
      WHEN POSITION(' ' IN extracted_name) > 0
      THEN SUBSTRING(extracted_name FROM POSITION(' ' IN extracted_name) + 1)
      ELSE NULL
    END
  );

  -- Create default household
  INSERT INTO households (name, owner_id)
  VALUES ('My Household', NEW.id)
  RETURNING id INTO new_household_id;

  -- Add user as household owner
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.id, 'owner');

  -- Create default user settings
  INSERT INTO user_settings (user_id, email_address)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Drop the legacy name column (data already migrated to first_name/last_name)
ALTER TABLE profiles DROP COLUMN IF EXISTS name;

-- Step 3: Add comment documenting the canonical name fields
COMMENT ON COLUMN profiles.first_name IS 'User first name (canonical, replaces legacy name column)';
COMMENT ON COLUMN profiles.last_name IS 'User last name (canonical, replaces legacy name column)';
