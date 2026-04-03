-- Migration: Waitlist fields for leads table (safe + nullable)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
--
-- Adds columns used by the locked waitlist page while keeping existing
-- discount modal (name+phone) leads intact.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS size TEXT;

-- Helpful indexes (optional). Comment out if you prefer no new indexes.
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads (source);
CREATE INDEX IF NOT EXISTS leads_product_slug_idx ON leads (product_slug);
