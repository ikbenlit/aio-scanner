-- Migration: Create Migration Log Table
-- File: 20250709105000_create_migration_log_table.sql
-- Description: Creates a migration_log table for tracking applied migrations

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_migration_log_name ON public.migration_log(migration_name);
CREATE INDEX IF NOT EXISTS idx_migration_log_applied_at ON public.migration_log(applied_at);

-- Add table comment
COMMENT ON TABLE public.migration_log IS 'Tracks applied database migrations for audit purposes';

-- Enable RLS (Row Level Security) if needed
ALTER TABLE public.migration_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for authenticated users
CREATE POLICY "Allow read access to migration log" ON public.migration_log
    FOR SELECT TO authenticated
    USING (true);

-- Create policy to allow insert for service role (corrected syntax)
CREATE POLICY "Allow insert to migration log" ON public.migration_log
    FOR INSERT 
    WITH CHECK (true); 