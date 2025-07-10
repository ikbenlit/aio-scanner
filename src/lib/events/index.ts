// src/lib/events/index.ts
import { scanEventEmitter } from './ScanEventEmitter';
import { postScanEventListener } from './PostScanEventListener';
import { emailEventListener } from './EmailEventListener';

/**
 * Initialize the event system
 * Registers all event listeners with the central emitter
 * Call this once during application startup
 */
export function initializeEventSystem(): void {
  console.log('🚀 Initializing scan event system...');
  
  // Register all event listeners
  scanEventEmitter.registerListener(postScanEventListener);
  scanEventEmitter.registerListener(emailEventListener);
  
  console.log(`✅ Event system initialized with ${scanEventEmitter.getListenerCount()} listeners`);
}

// Export the main emitter for use in ScanOrchestrator
export { scanEventEmitter } from './ScanEventEmitter';
export type { ScanCompletedEvent, ScanEventListener } from './ScanEventEmitter';