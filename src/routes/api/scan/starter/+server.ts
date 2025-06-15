// src/routes/api/scan/starter/+server.ts
import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import { requireValidPayment } from '$lib/payment/verificationService.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }) {
  try {
    const { url, email, paymentId } = await request.json();
    
    // Basic validation
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor starter tier' 
      }, { status: 400 });
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return json({ 
        error: 'Ongeldige URL format' 
      }, { status: 400 });
    }

    console.log(`🔍 Starting starter scan for ${url} with payment ${paymentId}`);

    // 💳 PAYMENT VERIFICATION
    const { success, error, paymentData } = await requireValidPayment(paymentId, 'starter', email);
    if (!success) {
      console.warn(`❌ Payment validation failed: ${error}`);
      return json({ error }, { status: 402 }); // Payment Required
    }

    console.log(`✅ Payment verified for starter tier: €${paymentData?.amount}`);

    // Payment valid - proceed with scan
    const scanId = crypto.randomUUID();
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'starter', 
      scanId,
      email,
      paymentId
    );

    return json({
      ...result,
      scanId,
      tier: 'starter',
      paymentVerified: true
    });

  } catch (error: any) {
    console.error('💥 Starter scan failed:', error);
    return json({ 
      error: 'Starter scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}