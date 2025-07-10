// src/routes/api/test/event-system/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { scanEventEmitter } from '$lib/events';
import { initializeEventSystem } from '$lib/events';

/**
 * Test endpoint for Event System Architecture
 * Tests the new event-driven post-scan processing
 */
export const GET: RequestHandler = async ({ url }) => {
  const testType = url.searchParams.get('test') || 'basic';
  const scanId = url.searchParams.get('scanId') || 'test-scan-id';
  const tier = url.searchParams.get('tier') || 'starter';
  const email = url.searchParams.get('email') || 'test@example.com';

  try {
    console.log(`🧪 Testing event system: ${testType}`);

    switch (testType) {
      case 'basic':
        return await testBasicEventSystem();
      
      case 'initialization':
        return await testEventSystemInitialization();
      
      case 'emit-completed':
        return await testEmitCompletedEvent(scanId, tier, email);
      
      case 'emit-failed':
        return await testEmitFailedEvent(scanId, tier, email);
      
      case 'listener-count':
        return await testListenerCount();
      
      default:
        return json({ error: 'Invalid test type. Use: basic, initialization, emit-completed, emit-failed, listener-count' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Event system test failed:', error);
    return json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
};

/**
 * Test basic event system functionality
 */
async function testBasicEventSystem() {
  console.log('🔄 Testing basic event system functionality...');
  
  const tests = {
    eventEmitterExists: false,
    hasListeners: false,
    canEmitEvents: false
  };

  try {
    // Test event emitter exists
    tests.eventEmitterExists = scanEventEmitter !== undefined;
    
    // Test has listeners
    tests.hasListeners = scanEventEmitter.getListenerCount() > 0;
    
    // Test can emit events (fire-and-forget)
    await scanEventEmitter.emitScanCompleted({
      scanId: 'test-basic-scan',
      tier: 'starter',
      email: 'test@example.com',
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
    tests.canEmitEvents = true;
    
    return json({
      success: true,
      message: 'Basic event system tests passed',
      tests,
      listenerCount: scanEventEmitter.getListenerCount()
    });

  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests
    });
  }
}

/**
 * Test event system initialization
 */
async function testEventSystemInitialization() {
  console.log('🔄 Testing event system initialization...');
  
  const initialListenerCount = scanEventEmitter.getListenerCount();
  
  // Re-initialize (should not duplicate listeners)
  initializeEventSystem();
  
  const finalListenerCount = scanEventEmitter.getListenerCount();
  
  return json({
    success: true,
    message: 'Event system initialization tested',
    initialListenerCount,
    finalListenerCount,
    listenersAdded: finalListenerCount - initialListenerCount
  });
}

/**
 * Test emitting completed event
 */
async function testEmitCompletedEvent(scanId: string, tier: string, email: string) {
  console.log(`🔄 Testing emit completed event for ${scanId}...`);
  
  const startTime = Date.now();
  
  await scanEventEmitter.emitScanCompleted({
    scanId,
    tier: tier as any,
    email,
    paymentId: 'test-payment-id',
    completedAt: new Date().toISOString(),
    status: 'completed'
  });
  
  const duration = Date.now() - startTime;
  
  return json({
    success: true,
    message: 'Completed event emitted successfully',
    scanId,
    tier,
    email,
    duration,
    listenerCount: scanEventEmitter.getListenerCount()
  });
}

/**
 * Test emitting failed event
 */
async function testEmitFailedEvent(scanId: string, tier: string, email: string) {
  console.log(`🔄 Testing emit failed event for ${scanId}...`);
  
  const startTime = Date.now();
  
  await scanEventEmitter.emitScanCompleted({
    scanId,
    tier: tier as any,
    email,
    paymentId: 'test-payment-id',
    completedAt: new Date().toISOString(),
    status: 'failed'
  });
  
  const duration = Date.now() - startTime;
  
  return json({
    success: true,
    message: 'Failed event emitted successfully',
    scanId,
    tier,
    email,
    duration,
    listenerCount: scanEventEmitter.getListenerCount()
  });
}

/**
 * Test listener count and management
 */
async function testListenerCount() {
  console.log('🔄 Testing listener count and management...');
  
  const listenerCount = scanEventEmitter.getListenerCount();
  
  return json({
    success: true,
    message: 'Listener count retrieved',
    listenerCount,
    hasListeners: listenerCount > 0,
    expectedListeners: ['PostScanEventListener', 'EmailEventListener']
  });
}