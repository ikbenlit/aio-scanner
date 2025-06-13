// src/routes/api/payment/create/+server.ts
import { json } from '@sveltejs/kit';
import { paymentVerificationService } from '$lib/payment/verificationService.js';
import type { ScanTier } from '$lib/types/database.js';

export async function POST({ request, url }) {
  try {
    const { tier, email, scanUrl } = await request.json();
    
    // Validation
    if (!tier || !email) {
      return json({ 
        error: 'Tier en email zijn verplicht' 
      }, { status: 400 });
    }

    if (tier === 'basic') {
      return json({ 
        error: 'Basic tier heeft geen betaling nodig' 
      }, { status: 400 });
    }

    if (!['starter', 'business', 'enterprise'].includes(tier)) {
      return json({ 
        error: 'Ongeldige tier. Gebruik starter, business of enterprise' 
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ 
        error: 'Ongeldig email adres' 
      }, { status: 400 });
    }

    // Create return/webhook URLs
    const returnUrl = `${url.origin}/scan/payment-return?tier=${tier}&email=${encodeURIComponent(email)}${scanUrl ? `&url=${encodeURIComponent(scanUrl)}` : ''}`;
    // Only set webhook in production
const webhookUrl = url.origin.includes('localhost') 
? undefined 
: `${url.origin}/api/payment/webhook`;

    console.log(`💳 Creating payment for ${tier} tier, email: ${email}`);

    const { paymentUrl, paymentId } = await paymentVerificationService.createPayment(
      tier as ScanTier,
      email,
      returnUrl,
      webhookUrl
    );

    return json({ 
      paymentUrl, 
      paymentId,
      tier,
      email,
      message: 'Payment created successfully'
    });

  } catch (error: any) {
    console.error('💥 Payment creation failed:', error);
    return json({ 
      error: 'Payment creation failed', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve payment status
export async function GET({ url }) {
  const paymentId = url.searchParams.get('paymentId');
  
  if (!paymentId) {
    return json({ error: 'PaymentId parameter required' }, { status: 400 });
  }

  try {
    const verification = await paymentVerificationService.verifyPayment(paymentId, 'starter'); // Tier doesn't matter for status check
    
    return json({
      paymentId,
      status: verification.paymentStatus,
      isValid: verification.isValid,
      tier: verification.tier,
      userEmail: verification.userEmail
    });

  } catch (error: any) {
    return json({ 
      error: 'Payment status check failed', 
      details: error.message 
    }, { status: 500 });
  }
}

