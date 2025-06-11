// src/lib/scan/completion.ts (update existing function)
import { getSupabaseClient } from '$lib/supabase';
import { sendScanReport } from '$lib/email/sender';
import type { EngineScanResult as ScanResult } from '$lib/types/scan';
import { checkUserStatus } from './auth';
import type { PostgrestError } from '@supabase/supabase-js';

interface EmailCaptureResult {
  success: boolean;
  error?: string;
  emailSent?: boolean;
  nextAction: 'show_results' | 'show_error';
}

// Flow action types
export type FlowAction = 
  | { type: 'show_results' }
  | { type: 'show_upgrade_prompt' }
  | { type: 'show_email_capture' }
  | { type: 'error'; message: string };

/**
 * Bepaalt de volgende stap in de scan completion flow
 */
export async function handleScanCompletion(scanResult: ScanResult): Promise<FlowAction> {
  try {
    console.log(`🔄 Processing scan completion for ${scanResult.scanId}`);
    
    // 1. Check user status
    const userStatus = await checkUserStatus();
    
    // 2. Determine next action based on user status
    if (userStatus.isAuthenticated) {
      if (userStatus.credits && userStatus.credits > 0) {
        // Authenticated user with credits - show results directly
        return { type: 'show_results' };
      } else {
        // Authenticated user without credits - show upgrade prompt
        return { type: 'show_upgrade_prompt' };
      }
    } else {
      // Anonymous user - show email capture
      return { type: 'show_email_capture' };
    }
    
  } catch (error) {
    console.error('Scan completion flow error:', error);
    return { 
      type: 'error',
      message: error instanceof Error ? error.message : 'Onbekende fout bij verwerken scan'
    };
  }
}

/**
 * Process email capture and send scan report
 */
export async function handleEmailCapture(
  email: string, 
  scanResults: ScanResult
): Promise<EmailCaptureResult> {
  try {
    console.log(`📧 Processing email capture for scan ${scanResults.scanId}`);
    
    const supabase = getSupabaseClient();
    
    // 1. Save email to database
    const { error: updateError } = await supabase
      .from('scans')
      .update({ 
        email: email,
        email_captured_at: new Date().toISOString()
      })
      .eq('id', scanResults.scanId);

    if (updateError) {
      console.error('Email save error:', updateError);
      return {
        success: false,
        error: 'Failed to save email',
        nextAction: 'show_error'
      };
    }

    console.log(`✅ Email ${email} saved for scan ${scanResults.scanId}`);

    // 2. Send scan report via email (background process)
    console.log(`📧 Triggering email delivery for scan ${scanResults.scanId}`);
    
    // Start email sending but don't wait for it
    void Promise.resolve(sendScanReport(scanResults, email))
      .then((emailResult) => {
        console.log(`📧 Email delivery completed for ${scanResults.scanId}:`, {
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error
        });
        
        // Log email status to database (background)
        return supabase
          .from('scans')
          .update({
            email_sent: emailResult.success,
            email_sent_at: emailResult.success ? new Date().toISOString() : null,
            email_error: emailResult.error || null,
            email_message_id: emailResult.messageId || null
          })
          .eq('id', scanResults.scanId);
      })
      .then(() => {
        console.log(`📧 Email status logged for scan ${scanResults.scanId}`);
      })
      .catch((error: Error | PostgrestError) => {
        console.error(`📧 Failed to log email status for ${scanResults.scanId}:`, error);
      });

    // 3. Return success and show results
    return {
      success: true,
      emailSent: true,
      nextAction: 'show_results'
    };

  } catch (error) {
    console.error('Email capture processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextAction: 'show_error'
    };
  }
}