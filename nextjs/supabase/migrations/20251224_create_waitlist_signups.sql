-- Waitlist signups table for pre-launch email capture
-- Allows anonymous inserts, no reads (privacy)

CREATE TABLE waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  converted_at TIMESTAMPTZ,

  -- Unique constraint for duplicate prevention
  CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (no auth required)
CREATE POLICY "Anyone can sign up for waitlist"
  ON waitlist_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No select policy = no reads (even authenticated users can't see the list)
-- Admin access via service role key bypasses RLS

-- Index for duplicate checking performance
CREATE INDEX idx_waitlist_signups_email ON waitlist_signups(email);

-- Index for analytics queries
CREATE INDEX idx_waitlist_signups_created_at ON waitlist_signups(created_at);
CREATE INDEX idx_waitlist_signups_source ON waitlist_signups(source);

COMMENT ON TABLE waitlist_signups IS 'Pre-launch waitlist email signups';
COMMENT ON COLUMN waitlist_signups.source IS 'Where the signup came from: website, tiktok, instagram, etc.';
COMMENT ON COLUMN waitlist_signups.converted_at IS 'Timestamp when this signup became a real user';
