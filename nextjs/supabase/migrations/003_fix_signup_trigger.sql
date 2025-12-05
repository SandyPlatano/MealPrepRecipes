-- ============================================
-- FIX: Allow trigger to create profile/household on signup
-- Run this in your Supabase SQL Editor
-- ============================================

-- The handle_new_user() trigger runs as SECURITY DEFINER but the
-- RLS policies block inserts. We need to either:
-- 1. Bypass RLS for the trigger function
-- 2. Or add policies that allow service role inserts

-- Option 1: Set the function to bypass RLS (recommended)
ALTER FUNCTION handle_new_user() SET search_path = public;

-- Recreate the function with explicit RLS bypass
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
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
    -- Log error details for debugging
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Also add INSERT policies for profiles that allow users to create their own profile
-- (This is a backup in case the trigger approach doesn't work)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
