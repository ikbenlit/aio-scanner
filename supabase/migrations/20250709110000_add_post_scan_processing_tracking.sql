-- Migration: Add Post-Scan Processing Tracking Columns
-- File: 20250709110000_add_post_scan_processing_tracking.sql
-- Description: Adds columns to track asynchronous post-scan processing (PDF generation and email delivery)

-- Add post-scan processing tracking columns
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_processed BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_processed_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_pdf_success BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_email_success BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_error TEXT;

-- Add enhanced PDF tracking columns
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generation_status TEXT CHECK (pdf_generation_status IN ('pending', 'completed', 'failed'));
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_path TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_error TEXT;

-- Add enhanced email tracking columns (if not already exist)
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_error TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_message_id TEXT;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_scans_post_scan_processed ON scans(post_scan_processed);
CREATE INDEX IF NOT EXISTS idx_scans_pdf_generation_status ON scans(pdf_generation_status);
CREATE INDEX IF NOT EXISTS idx_scans_email_sent ON scans(email_sent);
CREATE INDEX IF NOT EXISTS idx_scans_tier_post_processing ON scans(tier, post_scan_processed);

-- Add column comments for documentation
COMMENT ON COLUMN scans.post_scan_processed IS 'Whether asynchronous post-scan processing has been attempted';
COMMENT ON COLUMN scans.post_scan_processed_at IS 'Timestamp when post-scan processing completed';
COMMENT ON COLUMN scans.post_scan_pdf_success IS 'Whether PDF generation was successful during post-scan processing';
COMMENT ON COLUMN scans.post_scan_email_success IS 'Whether email delivery was successful during post-scan processing';
COMMENT ON COLUMN scans.post_scan_error IS 'Error message if post-scan processing failed';

COMMENT ON COLUMN scans.pdf_generated IS 'Whether PDF has been successfully generated';
COMMENT ON COLUMN scans.pdf_generated_at IS 'Timestamp when PDF generation completed';
COMMENT ON COLUMN scans.pdf_generation_status IS 'Current status of PDF generation (pending/completed/failed)';
COMMENT ON COLUMN scans.pdf_path IS 'Storage path or URL of the generated PDF file';
COMMENT ON COLUMN scans.pdf_error IS 'Error details if PDF generation failed';

COMMENT ON COLUMN scans.email_sent IS 'Whether scan report email was successfully sent';
COMMENT ON COLUMN scans.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN scans.email_error IS 'Error details if email sending failed';
COMMENT ON COLUMN scans.email_message_id IS 'Message ID from email service provider (e.g., Resend)';

-- Update existing completed scans to have basic tracking data
-- This helps with backwards compatibility
UPDATE scans 
SET post_scan_processed = true,
    post_scan_processed_at = completed_at,
    post_scan_pdf_success = false,
    post_scan_email_success = false
WHERE status = 'completed' 
  AND post_scan_processed IS NULL;

-- For paid tiers that might have had PDFs generated, mark as potentially generated
UPDATE scans 
SET pdf_generated = true,
    pdf_generation_status = 'completed',
    pdf_generated_at = completed_at
WHERE status = 'completed' 
  AND tier IN ('starter', 'business', 'enterprise')
  AND pdf_generated IS NULL;

-- Migration completed successfully
-- Added comprehensive post-scan processing tracking columns for PDF generation and email delivery