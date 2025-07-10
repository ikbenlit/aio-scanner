// src/lib/events/ScanEventEmitter.ts
import type { ScanTier } from '$lib/types/database';

export interface ScanCompletedEvent {
  scanId: string;
  tier: ScanTier;
  email?: string;
  paymentId?: string;
  completedAt: string;
  status: 'completed' | 'failed';
}

export interface ScanEventListener {
  onScanCompleted(event: ScanCompletedEvent): Promise<void>;
}

/**
 * Event-driven architecture for scan lifecycle events
 * Follows SOC principle by decoupling scan execution from post-processing
 */
export class ScanEventEmitter {
  private listeners: ScanEventListener[] = [];

  /**
   * Register a listener for scan events
   */
  registerListener(listener: ScanEventListener): void {
    this.listeners.push(listener);
    console.log(`📡 Registered scan event listener: ${listener.constructor.name}`);
  }

  /**
   * Emit scan completed event to all registered listeners
   */
  async emitScanCompleted(event: ScanCompletedEvent): Promise<void> {
    console.log(`📢 Emitting scan completed event: ${event.scanId}`);
    
    // Fire all listeners asynchronously without waiting
    const promises = this.listeners.map(async (listener) => {
      try {
        await listener.onScanCompleted(event);
      } catch (error) {
        console.error(`❌ Event listener failed for ${event.scanId}:`, error);
        // Continue with other listeners even if one fails
      }
    });

    // Fire-and-forget: don't wait for completion
    Promise.allSettled(promises).then((results) => {
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`📊 Event processing completed: ${succeeded} succeeded, ${failed} failed`);
    });
  }

  /**
   * Remove a listener (for cleanup)
   */
  removeListener(listener: ScanEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
      console.log(`📡 Removed scan event listener: ${listener.constructor.name}`);
    }
  }

  /**
   * Get number of registered listeners
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
}

// Singleton instance
export const scanEventEmitter = new ScanEventEmitter();