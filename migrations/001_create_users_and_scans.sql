-- Migration 001: Create users and scans tables (Phase 1)
-- AIO-Scanner Database Schema - Core Foundation
-- Created: $(date)

-- Create users table (basis versie)
CREATE TABLE users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email text UNIQUE NOT NULL,
  plan_type text DEFAULT 'free',
  credits_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scans table (simpel versie)
CREATE TABLE scans (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id bigint REFERENCES users(id), -- Nullable voor anonieme scans
  url text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  overall_score integer,
  result_json jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Essential indexes voor performance
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_user_id ON scans(user_id);

-- Commentaar voor toekomstige ontwikkelaars
COMMENT ON TABLE users IS 'User accounts - Phase 1: basis versie zonder auth integratie';
COMMENT ON TABLE scans IS 'Website scans - Phase 1: simpele versie zonder real-time modules';
COMMENT ON COLUMN scans.user_id IS 'Nullable: ondersteunt anonieme scans voor gratis tier';
COMMENT ON COLUMN scans.result_json IS 'Flexibele JSON opslag voor alle scan resultaten'; 