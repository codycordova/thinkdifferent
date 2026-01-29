-- Migration: Add name column to leads table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add name column (nullable initially to support existing data)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;

-- Optional: Update existing records that don't have a name
-- Uncomment the line below if you want to set a default name for existing leads
-- UPDATE leads SET name = 'Legacy Lead' WHERE name IS NULL;

-- Note: Email column is kept nullable for future purchase data integration
-- Phone column remains nullable at database level (enforced at application level)
