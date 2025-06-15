// TO BE DEPRECATED: REPLACED BY /api/scan/business/
// This endpoint is an experimental version and will be removed in favor of the official endpoint
// Please use /api/scan/business/ for all business tier scans

// src/routes/api/scan/business/+server.ts
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
        error: 'URL, email en paymentId zijn verplicht voor business tier' 
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

    console.log(`🔍 Starting business scan for ${url} with payment ${paymentId}`);

    // 💳 PAYMENT VERIFICATION
    const { success, error, paymentData } = await requireValidPayment(paymentId, 'business', email);
    if (!success) {
      console.warn(`❌ Payment validation failed: ${error}`);
      return json({ error }, { status: 402 }); // Payment Required
    }

    console.log(`✅ Payment verified for business tier: €${paymentData?.amount}`);

    // Payment valid - proceed with scan
    const scanId = crypto.randomUUID();
    
    try {
      const result = await scanOrchestrator.executeTierScan(
        url, 
        'business', 
        scanId,
        email,
        paymentId
      );

      return json({
        ...result,
        scanId,
        tier: 'business',
        paymentVerified: true
      });

    } catch (scanError: any) {
      if (scanError.message === 'Business tier not implemented yet') {
        return json({ 
          error: 'Business tier wordt geïmplementeerd in Phase 3',
          fallbackSuggestion: 'Gebruik starter tier voor nu'
        }, { status: 501 }); // Not Implemented
      }
      throw scanError;
    }

  } catch (error: any) {
    console.error('💥 Business scan failed:', error);
    return json({ 
      error: 'Business scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}