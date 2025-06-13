// src/routes/api/scan/business/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import { requireValidPayment } from '$lib/payment/verificationService.js';
import type { ScanTier } from '$lib/types/database.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }: RequestEvent) {
  try {
    const { url, email, paymentId } = await request.json();
    
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor business tier' 
      }, { status: 400 });
    }

    // 💳 PAYMENT VERIFICATION HERE
    const { success, error } = await requireValidPayment(paymentId, 'business' as ScanTier, email);
    if (!success) {
      return json({ error }, { status: 402 }); // Payment Required
    }

    // Payment valid - proceed with scan
    const scanId = crypto.randomUUID();
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'business' as ScanTier, 
      scanId,
      email,
      paymentId
    );

    return json({
      ...result,
      scanId,
      tier: 'business'
    });

  } catch (error: any) {
    console.error('Business scan failed:', error);
    return json({ 
      error: 'Business scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
} 