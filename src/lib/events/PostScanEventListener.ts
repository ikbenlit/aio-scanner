// src/lib/events/PostScanEventListener.ts
import { postScanProcessor } from '$lib/services/PostScanProcessorService';
import type { ScanEventListener, ScanCompletedEvent } from './ScanEventEmitter';

/**
 * Event listener for post-scan processing
 * Handles PDF generation and email delivery when scans complete
 * Follows SOC principle by keeping this logic separate from ScanOrchestrator
 */
export class PostScanEventListener implements ScanEventListener {
  
  /**
   * Handle scan completed event
   * Triggers asynchronous post-scan processing
   */
  async onScanCompleted(event: ScanCompletedEvent): Promise<void> {
    console.log(`🔄 PostScanEventListener: Processing scan ${event.scanId}`);
    
    // Only process completed scans
    if (event.status !== 'completed') {
      console.log(`⏭️ Skipping post-scan processing for ${event.scanId} - status: ${event.status}`);
      return;
    }

    // Basic tier doesn't need post-scan processing
    if (event.tier === 'basic') {
      console.log(`⏭️ Skipping post-scan processing for ${event.scanId} - basic tier`);
      return;
    }

    // Trigger post-scan processing
    try {
      await postScanProcessor.processAsync({
        scanId: event.scanId,
        tier: event.tier,
        email: event.email,
        paymentId: event.paymentId
      });
      
      console.log(`✅ PostScanEventListener: Successfully triggered processing for ${event.scanId}`);
    } catch (error) {
      console.error(`❌ PostScanEventListener: Failed to trigger processing for ${event.scanId}:`, error);
      // Don't re-throw - this is fire-and-forget
    }
  }
}

// Singleton instance
export const postScanEventListener = new PostScanEventListener();