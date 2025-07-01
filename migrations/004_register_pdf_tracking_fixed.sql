-- 📄 PDF Tracking Constraint Update (zonder migrations table)
-- Doel: Update constraint om 'N/A' en 'development' statuses toe te staan

-- 1. Check of PDF kolommen bestaan (should return 5 rows)
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'scans' 
AND column_name LIKE 'pdf_%'
ORDER BY ordinal_position;

-- 2. Check huidige constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'scans_pdf_generation_status_check';

-- 3. Drop oude constraint en add nieuwe constraint met extra statuses
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

-- 4. Verify nieuwe constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'scans_pdf_generation_status_check';

-- 5. Test dat nieuwe statuses toegestaan zijn (dry run check)
SELECT 'N/A' = ANY (ARRAY['pending', 'generating', 'completed', 'failed', 'N/A', 'development']) as na_allowed,
       'development' = ANY (ARRAY['pending', 'generating', 'completed', 'failed', 'N/A', 'development']) as dev_allowed;

-- Expected: na_allowed = true, dev_allowed = true