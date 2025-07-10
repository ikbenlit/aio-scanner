// src/lib/events/EmailEventListener.ts
import { upsertUserScanHistory } from '$lib/services/emailHistoryService';
import type { ScanEventListener, ScanCompletedEvent } from './ScanEventEmitter';

/**
 * Event listener for email-related scan processing
 * Handles email history updates and notifications
 * Follows SOC principle by separating email logic from scan execution
 */
export class EmailEventListener implements ScanEventListener {
  
  /**
   * Handle scan completed event
   * Updates user scan history for email tracking
   */
  async onScanCompleted(event: ScanCompletedEvent): Promise<void> {
    console.log(`📧 EmailEventListener: Processing scan ${event.scanId}`);
    
    // Only process completed scans with email
    if (event.status !== 'completed' || !event.email) {
      console.log(`⏭️ Skipping email processing for ${event.scanId} - status: ${event.status}, email: ${!!event.email}`);
      return;
    }

    // Update user scan history
    try {
      await upsertUserScanHistory({
        email: event.email,
        scanId: event.scanId,
        isPaid: event.tier !== 'basic',
        amount: this.getTierPrice(event.tier)
      });
      
      console.log(`✅ EmailEventListener: Updated scan history for ${event.email}`);
    } catch (error) {
      console.error(`❌ EmailEventListener: Failed to update scan history for ${event.scanId}:`, error);
      // Don't re-throw - this is fire-and-forget
    }
  }

  /**
   * Get tier pricing for history tracking
   */
  private getTierPrice(tier: string): number {
    const prices: Record<string, number> = {
      basic: 0,
      starter: 19.95,
      business: 49.95,
      enterprise: 149.95
    };
    return prices[tier] || 0;
  }
}

// Singleton instance
export const emailEventListener = new EmailEventListener();