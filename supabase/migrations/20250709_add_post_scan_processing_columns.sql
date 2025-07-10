-- Add post-scan processing tracking columns to scans table
-- Migration: 20250709_add_post_scan_processing_columns.sql

-- Add columns for tracking asynchronous post-scan processing
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_processed BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_processed_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_pdf_success BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_email_success BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS post_scan_error TEXT;

-- Add columns for enhanced PDF tracking
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_generation_status TEXT CHECK (pdf_generation_status IN ('pending', 'completed', 'failed'));
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_path TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS pdf_error TEXT;

-- Add columns for enhanced email tracking
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_error TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS email_message_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_post_scan_processed ON scans(post_scan_processed);
CREATE INDEX IF NOT EXISTS idx_scans_pdf_generation_status ON scans(pdf_generation_status);
CREATE INDEX IF NOT EXISTS idx_scans_email_sent ON scans(email_sent);
CREATE INDEX IF NOT EXISTS idx_scans_tier_status ON scans(tier, status);

-- Add comments for documentation
COMMENT ON COLUMN scans.post_scan_processed IS 'Whether post-scan processing (PDF + email) has been attempted';
COMMENT ON COLUMN scans.post_scan_processed_at IS 'When post-scan processing completed';
COMMENT ON COLUMN scans.post_scan_pdf_success IS 'Whether PDF generation was successful';
COMMENT ON COLUMN scans.post_scan_email_success IS 'Whether email delivery was successful';
COMMENT ON COLUMN scans.post_scan_error IS 'Any error that occurred during post-scan processing';

COMMENT ON COLUMN scans.pdf_generated IS 'Whether PDF has been generated successfully';
COMMENT ON COLUMN scans.pdf_generated_at IS 'When PDF generation was completed';
COMMENT ON COLUMN scans.pdf_generation_status IS 'Status of PDF generation process';
COMMENT ON COLUMN scans.pdf_path IS 'Storage path or URL of generated PDF';
COMMENT ON COLUMN scans.pdf_error IS 'Error details if PDF generation failed';

COMMENT ON COLUMN scans.email_sent IS 'Whether scan report email was sent successfully';
COMMENT ON COLUMN scans.email_sent_at IS 'When email was sent';
COMMENT ON COLUMN scans.email_error IS 'Error details if email sending failed';
COMMENT ON COLUMN scans.email_message_id IS 'Message ID from email service provider';