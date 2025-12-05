-- Split name field into first_name and last_name
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing data: split name on first space
UPDATE profiles
SET 
  first_name = COALESCE(SPLIT_PART(name, ' ', 1), name),
  last_name = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE NULL
  END
WHERE name IS NOT NULL AND first_name IS NULL;

-- For users who haven't set a name yet, leave both NULL
-- We'll collect this during onboarding or settings update

COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';
