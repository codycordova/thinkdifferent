-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  page_structure JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  github_pr_number INTEGER,
  github_pr_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (admin client)
-- In production, you'd want more restrictive policies
CREATE POLICY "Service role can manage proposals"
  ON proposals
  FOR ALL
  USING (true)
  WITH CHECK (true);
