// src/routes/api/payment/webhook/+server.ts  
import { json } from '@sveltejs/kit';
import { paymentVerificationService } from '$lib/payment/verificationService.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get('id') as string;

    if (!paymentId) {
      console.error('💥 Webhook: No payment ID provided');
      return new Response('No payment ID', { status: 400 });
    }

    console.log(`🔔 Webhook received for payment: ${paymentId}`);
    
    // Process webhook
    await paymentVerificationService.handleWebhook(paymentId);
    
    // Always return 200 OK for Mollie
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('💥 Webhook processing failed:', error);
    
    // Still return 200 to prevent Mollie retries
    return new Response('OK', { status: 200 });
  }
}