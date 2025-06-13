// src/routes/api/test/payment/+server.ts
import { json } from '@sveltejs/kit';
import { MOLLIE_API_KEY, MOLLIE_TEST_MODE, MOLLIE_WEBHOOK_SECRET } from '$env/static/private';

export async function GET() {
  return json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!MOLLIE_API_KEY,
      testMode: MOLLIE_TEST_MODE,
      apiKeyPrefix: MOLLIE_API_KEY?.substring(0, 8) + '...'
    }
  });
}

export async function POST({ request }) {
  console.log('🔥 Payment test endpoint hit!');
  
  try {
    const body = await request.json();
    
    if (!MOLLIE_API_KEY) {
      return json({ 
        error: 'MOLLIE_API_KEY not found in environment' 
      }, { status: 500 });
    }

    // Test Mollie import with SvelteKit env
    const { createMollieClient } = await import('@mollie/api-client');
    const mollie = createMollieClient({
      apiKey: MOLLIE_API_KEY,
      testMode: MOLLIE_TEST_MODE === 'true'
    });

    return json({
      message: 'Payment test successful!',
      received: body,
      mollie: {
        importStatus: 'success',
        testMode: MOLLIE_TEST_MODE === 'true',
        apiKeyPresent: true
      }
    });

  } catch (error: any) {
    return json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 });
  }
}