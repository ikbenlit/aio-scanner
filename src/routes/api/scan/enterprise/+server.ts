// src/routes/api/scan/enterprise/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import { requireValidPayment } from '$lib/payment/verificationService.js';
import type { ScanTier } from '$lib/types/database.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }: RequestEvent) {
  try {
    const { url, email, paymentId } = await request.json();
    
    // Basic validation
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor enterprise tier' 
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

    console.log(`🔍 Starting enterprise scan for ${url} with payment ${paymentId}`);

    // 💳 PAYMENT VERIFICATION
    const { success, error, paymentData } = await requireValidPayment(paymentId, 'enterprise' as ScanTier, email);
    if (!success) {
      console.warn(`❌ Payment validation failed: ${error}`);
      return json({ error }, { status: 402 }); // Payment Required
    }

    console.log(`✅ Payment verified for enterprise tier: €${paymentData?.amount}`);

    // Payment valid - proceed with scan
    const scanId = crypto.randomUUID();
    
    try {
      const result = await scanOrchestrator.executeTierScan(
        url, 
        'enterprise' as ScanTier, 
        scanId,
        email,
        paymentId
      );

      return json({
        ...result,
        scanId,
        tier: 'enterprise',
        paymentVerified: true
      });

    } catch (scanError: any) {
      if (scanError.message === 'Enterprise tier not implemented yet') {
        return json({ 
          error: 'Enterprise tier wordt geïmplementeerd in Phase 4',
          fallbackSuggestion: 'Gebruik business of starter tier voor nu'
        }, { status: 501 }); // Not Implemented
      }
      throw scanError;
    }

  } catch (error: any) {
    console.error('💥 Enterprise scan failed:', error);
    return json({ 
      error: 'Enterprise scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
} 