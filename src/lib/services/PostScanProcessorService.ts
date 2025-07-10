// src/lib/services/PostScanProcessorService.ts
import { getSupabaseClient } from '$lib/supabase';
import { sendScanReport } from '$lib/email/sender';
import type { EngineScanResult as ScanResult } from '$lib/types/scan';
import type { ScanTier } from '$lib/types/database';

export interface PostScanProcessorOptions {
  scanId: string;
  tier: ScanTier;
  email?: string;
  paymentId?: string;
}

export interface PostScanProcessorResult {
  success: boolean;
  pdfGenerated: boolean;
  emailSent: boolean;
  error?: string;
}

/**
 * Asynchronous Post-Scan Processor Service
 * Handles PDF generation and email delivery after scan completion
 * Designed to run independently of the main scan flow for better performance
 */
export class PostScanProcessorService {
  private supabase = getSupabaseClient();

  /**
   * Main entry point for post-scan processing
   * This is the "fire-and-forget" method called from ScanOrchestrator
   */
  async processAsync(options: PostScanProcessorOptions): Promise<void> {
    console.log(`🔄 Starting async post-scan processing for ${options.scanId}`);
    
    // Fire-and-forget: don't wait for this to complete
    Promise.resolve()
      .then(() => this.executeProcessing(options))
      .catch((error) => {
        console.error(`💥 Post-scan processing failed for ${options.scanId}:`, error);
        // Log error to database for debugging
        this.logProcessingError(options.scanId, error);
      });
  }

  /**
   * Execute the actual post-scan processing steps
   */
  private async executeProcessing(options: PostScanProcessorOptions): Promise<PostScanProcessorResult> {
    const { scanId, tier, email, paymentId } = options;
    
    try {
      console.log(`📊 Processing post-scan for tier: ${tier}, scanId: ${scanId}`);
      
      // 1. Fetch scan data from database
      const scanData = await this.fetchScanData(scanId);
      if (!scanData) {
        throw new Error('Scan data not found');
      }

      let pdfGenerated = false;
      let emailSent = false;

      // 2. Generate PDF for paid tiers
      if (tier !== 'basic') {
        console.log(`📄 Starting PDF generation for ${tier} tier`);
        pdfGenerated = await this.generatePDF(scanData);
        console.log(`📄 PDF generation ${pdfGenerated ? 'successful' : 'failed'} for ${scanId}`);
      } else {
        console.log(`📄 Skipping PDF generation for basic tier`);
      }

      // 3. Send email if email address provided
      if (email) {
        console.log(`📧 Starting email delivery to ${email}`);
        emailSent = await this.sendEmail(scanData, email, tier);
        console.log(`📧 Email delivery ${emailSent ? 'successful' : 'failed'} for ${scanId}`);
      } else {
        console.log(`📧 No email provided, skipping email delivery`);
      }

      // 4. Update processing status in database
      await this.updateProcessingStatus(scanId, {
        pdfGenerated,
        emailSent,
        processedAt: new Date().toISOString()
      });

      const result: PostScanProcessorResult = {
        success: true,
        pdfGenerated,
        emailSent
      };

      console.log(`✅ Post-scan processing completed for ${scanId}:`, result);
      return result;

    } catch (error) {
      console.error(`💥 Post-scan processing error for ${scanId}:`, error);
      
      const result: PostScanProcessorResult = {
        success: false,
        pdfGenerated: false,
        emailSent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Log error to database
      await this.logProcessingError(scanId, error);
      
      return result;
    }
  }

  /**
   * Fetch scan data from database and convert to ScanResult format
   */
  private async fetchScanData(scanId: string): Promise<ScanResult | null> {
    try {
      // Select only columns that we know exist
      const { data: scan, error } = await this.supabase
        .from('scans')
        .select('id, url, status, overall_score, result_json, created_at, completed_at, tier, email, pdf_generation_status')
        .eq('id', scanId)
        .single();

      if (error || !scan) {
        console.error('Failed to fetch scan data:', error);
        return null;
      }

      // Convert database scan to ScanResult format (gracefully handle missing columns)
      const scanResult: ScanResult = {
        scanId: scan.id,
        url: scan.url,
        status: scan.status as any,
        overallScore: scan.overall_score || 0,
        createdAt: scan.created_at,
        completedAt: scan.completed_at || undefined,
        tier: scan.tier as ScanTier,
        moduleResults: scan.result_json?.moduleResults || [],
        // Gracefully handle columns that might not exist yet
        aiReport: (scan as any).ai_report ? JSON.parse((scan as any).ai_report) : undefined,
        aiInsights: (scan as any).ai_insights ? JSON.parse((scan as any).ai_insights) : undefined,
        narrativeReport: (scan as any).narrative_report ? JSON.parse((scan as any).narrative_report) : undefined,
        costTracking: (scan as any).cost_tracking ? JSON.parse((scan as any).cost_tracking) : undefined
      };

      return scanResult;

    } catch (error) {
      console.error('Error fetching scan data:', error);
      return null;
    }
  }

  /**
   * Generate PDF for the scan
   */
  private async generatePDF(scanResult: ScanResult): Promise<boolean> {
    try {
      // Import the PDF generator dynamically to avoid circular dependencies
      const { TierAwarePDFGenerator } = await import('$lib/pdf/generator');
      const pdfGenerator = new TierAwarePDFGenerator();

      const pdfPath = await pdfGenerator.generateAndStorePDF(
        scanResult,
        scanResult.narrativeReport
      );

      if (pdfPath) {
        // Update scan record with PDF information
        await this.supabase
          .from('scans')
          .update({
            pdf_generated: true,
            pdf_generated_at: new Date().toISOString(),
            pdf_generation_status: 'completed',
            pdf_path: pdfPath
          })
          .eq('id', scanResult.scanId);

        return true;
      } else {
        // Update with failed status
        await this.supabase
          .from('scans')
          .update({
            pdf_generation_status: 'failed',
            pdf_generated_at: new Date().toISOString()
          })
          .eq('id', scanResult.scanId);

        return false;
      }

    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Update with error status
      await this.supabase
        .from('scans')
        .update({
          pdf_generation_status: 'failed',
          pdf_generated_at: new Date().toISOString(),
          pdf_error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', scanResult.scanId);

      return false;
    }
  }

  /**
   * Send email with scan report
   */
  private async sendEmail(scanResult: ScanResult, email: string, tier: ScanTier): Promise<boolean> {
    try {
      const emailResult = await sendScanReport(scanResult, email);

      // Update scan record with email information
      await this.supabase
        .from('scans')
        .update({
          email_sent: emailResult.success,
          email_sent_at: new Date().toISOString(),
          email_error: emailResult.error || null,
          email_message_id: emailResult.messageId || null
        })
        .eq('id', scanResult.scanId);

      return emailResult.success;

    } catch (error) {
      console.error('Email sending error:', error);
      
      // Update with error status
      await this.supabase
        .from('scans')
        .update({
          email_sent: false,
          email_sent_at: new Date().toISOString(),
          email_error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', scanResult.scanId);

      return false;
    }
  }

  /**
   * Update processing status in database
   * Gracefully handles missing columns for backwards compatibility
   */
  private async updateProcessingStatus(scanId: string, status: {
    pdfGenerated: boolean;
    emailSent: boolean;
    processedAt: string;
  }): Promise<void> {
    try {
      // Try to update with new post-scan processing columns
      const { error } = await this.supabase
        .from('scans')
        .update({
          post_scan_processed: true,
          post_scan_processed_at: status.processedAt,
          post_scan_pdf_success: status.pdfGenerated,
          post_scan_email_success: status.emailSent
        })
        .eq('id', scanId);

      if (error) {
        console.warn('Post-scan processing columns not available, using fallback:', error.message);
        
        // Fallback: update only basic columns that should exist
        await this.supabase
          .from('scans')
          .update({
            updated_at: status.processedAt
          })
          .eq('id', scanId);
      }

    } catch (error) {
      console.error('Failed to update processing status:', error);
    }
  }

  /**
   * Log processing error to database
   * Gracefully handles missing columns for backwards compatibility
   */
  private async logProcessingError(scanId: string, error: any): Promise<void> {
    try {
      // Try to update with new post-scan processing columns
      const { error: updateError } = await this.supabase
        .from('scans')
        .update({
          post_scan_processed: true,
          post_scan_processed_at: new Date().toISOString(),
          post_scan_error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', scanId);

      if (updateError) {
        console.warn('Post-scan processing columns not available for error logging:', updateError.message);
        
        // Fallback: just update timestamp
        await this.supabase
          .from('scans')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', scanId);
      }

    } catch (dbError) {
      console.error('Failed to log processing error:', dbError);
    }
  }
}

// Singleton instance for app-wide use
export const postScanProcessor = new PostScanProcessorService();

/**
 * Convenience function for triggering post-scan processing
 */
export async function triggerPostScanProcessing(options: PostScanProcessorOptions): Promise<void> {
  await postScanProcessor.processAsync(options);
}