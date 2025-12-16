-- ============================================
-- Add admin role to profiles for admin-only features
-- This enables features like the cost dashboard to be accessed by admins
-- ============================================

-- Add is_admin column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin lookups (should be rare, but fast when needed)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON profiles(is_admin)
  WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN profiles.is_admin IS
  'Admin flag for access to admin-only features (cost dashboard, moderation, etc.)';

-- Grant admin to your own user (you'll need to update this with your user ID)
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
