-- 📄 Registreer PDF Tracking Migration
-- Doel: Formeel registreren dat PDF kolommen al bestaan
-- (Ze zijn handmatig toegevoegd, nu tracken in migrations table)

-- Check of kolommen bestaan (should return 5 rows)
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'scans' 
AND column_name LIKE 'pdf_%'
ORDER BY ordinal_position;

-- Registreer migration status in migrations table
-- (ON CONFLICT DO NOTHING voorkomt dubbele entries)
INSERT INTO supabase_migrations.schema_migrations (version, statements, name) 
VALUES (
  '002', 
  ARRAY[
    'ALTER TABLE scans ADD COLUMN pdf_generation_status TEXT DEFAULT ''pending'' CHECK (pdf_generation_status = ANY (ARRAY[''pending''::text, ''generating''::text, ''completed''::text, ''failed''::text, ''N/A''::text, ''development''::text]))',
    'ALTER TABLE scans ADD COLUMN last_pdf_generated_at TIMESTAMPTZ',
    'ALTER TABLE scans ADD COLUMN pdf_template_version TEXT DEFAULT ''1.0''',
    'ALTER TABLE scans ADD COLUMN pdf_url TEXT',
    'ALTER TABLE scans ADD COLUMN pdf_file_size INTEGER'
  ], 
  '002_add_pdf_tracking'
) ON CONFLICT (version) DO NOTHING;

-- Update CHECK constraint om nieuwe development statuses toe te staan
ALTER TABLE scans 
DROP CONSTRAINT IF EXISTS scans_pdf_generation_status_check;

ALTER TABLE scans 
ADD CONSTRAINT scans_pdf_generation_status_check 
CHECK (pdf_generation_status = ANY (ARRAY[
  'pending'::text, 
  'generating'::text, 
  'completed'::text, 
  'failed'::text,
  'N/A'::text,        -- Voor basic tier (geen PDF)
  'development'::text  -- Voor test/dev scans
]));

-- Verify migrations table heeft onze entry
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%pdf%' 
ORDER BY version;