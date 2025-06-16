-- Phase 3.5 - PDF Tracking Migration
-- Add PDF generation tracking columns to scans table

BEGIN;

-- Add PDF tracking columns
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS pdf_generation_status text DEFAULT 'pending'::text 
    CHECK (pdf_generation_status = ANY (ARRAY['pending'::text, 'generating'::text, 'completed'::text, 'failed'::text])),
ADD COLUMN IF NOT EXISTS last_pdf_generated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pdf_template_version text DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS pdf_file_size integer;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_pdf_generation_status ON public.scans(pdf_generation_status);
CREATE INDEX IF NOT EXISTS idx_scans_last_pdf_generated_at ON public.scans(last_pdf_generated_at);
CREATE INDEX IF NOT EXISTS idx_scans_tier_pdf_status ON public.scans(tier, pdf_generation_status);

-- Update existing scans to set appropriate PDF status based on tier
UPDATE public.scans 
SET pdf_generation_status = CASE 
    WHEN tier = 'basic' THEN 'failed'::text  -- Basic tier doesn't get PDFs
    WHEN tier IN ('starter', 'business', 'enterprise') AND status = 'completed' THEN 'pending'::text
    ELSE 'pending'::text
END
WHERE pdf_generation_status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.scans.pdf_generation_status IS 'Status of PDF generation: pending, generating, completed, failed';
COMMENT ON COLUMN public.scans.last_pdf_generated_at IS 'Timestamp when PDF was last generated';
COMMENT ON COLUMN public.scans.pdf_template_version IS 'Version of PDF template used for generation';
COMMENT ON COLUMN public.scans.pdf_url IS 'Public URL of generated PDF report';
COMMENT ON COLUMN public.scans.pdf_file_size IS 'Size of generated PDF file in bytes';

COMMIT;