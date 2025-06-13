// src/lib/payment/verificationService.ts
import { createMollieClient, type Payment } from '@mollie/api-client';
import { MOLLIE_API_KEY, MOLLIE_TEST_MODE } from '$env/static/private';
import type { ScanTier } from '../types/database.js';

interface PaymentVerificationResult {
  isValid: boolean;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'cancelled' | 'expired' | 'unknown';
  tier?: ScanTier;
  userEmail?: string;
  amount?: number;
  error?: string;
}

export class PaymentVerificationService {
  private mollie: any;
  private cache = new Map<string, PaymentVerificationResult>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Lazy initialization - will be created when first needed
    this.mollie = null;
  }

  private getMollieClient() {
    if (!this.mollie) {
      console.log('🔧 Initializing Mollie client...');
      this.mollie = createMollieClient({
        apiKey: MOLLIE_API_KEY
      });
      console.log('✅ Mollie client initialized');
    }
    return this.mollie;
  }

  /**
   * Verify payment status for tier-based scans
   */
  async verifyPayment(paymentId: string, expectedTier: ScanTier): Promise<PaymentVerificationResult> {
    // Basic tier doesn't need payment verification
    if (expectedTier === 'basic') {
      return {
        isValid: true,
        paymentStatus: 'paid',
        tier: 'basic'
      };
    }

    // Check cache first
    const cached = this.getCachedResult(paymentId);
    if (cached) {
      console.log(`💰 Using cached payment result for ${paymentId}`);
      return cached;
    }

    try {
      console.log(`💳 Verifying Mollie payment: ${paymentId}`);
      const payment = await this.getMollieClient().payments.get(paymentId);
      
      const result = this.processPaymentResponse(payment, expectedTier);
      
      // Cache successful results
      if (result.paymentStatus === 'paid') {
        this.cacheResult(paymentId, result);
      }
      
      return result;

    } catch (error: any) {
      console.error('💥 Mollie payment verification failed:', error.message);
      
      return {
        isValid: false,
        paymentStatus: 'unknown',
        error: `Payment verification failed: ${error.message}`
      };
    }
  }

  /**
   * Process Mollie payment response and validate against expected tier
   */
  private processPaymentResponse(payment: Payment, expectedTier: ScanTier): PaymentVerificationResult {
    const paymentStatus = payment.status as PaymentVerificationResult['paymentStatus'];
    
    // Payment must be paid to proceed
    if (payment.status !== 'paid') {
      return {
        isValid: false,
        paymentStatus,
        error: `Payment status is ${payment.status}, expected 'paid'`
      };
    }

    // Extract metadata - cast to any since Mollie metadata is flexible
    const metadata = (payment.metadata || {}) as any;
    const paidTier = metadata.tier as ScanTier;
    const userEmail = metadata.userEmail || (payment as any).billingEmail;
    const amount = parseFloat(payment.amount.value);

    // Validate tier matches payment
    if (paidTier !== expectedTier) {
      return {
        isValid: false,
        paymentStatus: 'paid',
        error: `Tier mismatch: paid for ${paidTier}, requesting ${expectedTier}`
      };
    }

    // Validate amount for tier
    const expectedAmount = this.getTierPrice(expectedTier);
    if (Math.abs(amount - expectedAmount) > 0.01) { // Allow 1 cent tolerance
      return {
        isValid: false,
        paymentStatus: 'paid',
        error: `Amount mismatch: paid €${amount}, expected €${expectedAmount} for ${expectedTier}`
      };
    }

    // All validations passed
    return {
      isValid: true,
      paymentStatus: 'paid',
      tier: paidTier,
      userEmail,
      amount
    };
  }

  /**
   * Get expected price for tier
   */
  private getTierPrice(tier: ScanTier): number {
    const prices: Record<ScanTier, number> = {
      basic: 0,
      starter: 19.95,
      business: 49.95,
      enterprise: 149.95
    };
    return prices[tier];
  }

  /**
   * Cache management
   */
  private getCachedResult(paymentId: string): PaymentVerificationResult | null {
    const expiry = this.cacheExpiry.get(paymentId);
    if (!expiry || Date.now() > expiry) {
      // Cache expired
      this.cache.delete(paymentId);
      this.cacheExpiry.delete(paymentId);
      return null;
    }
    return this.cache.get(paymentId) || null;
  }

  private cacheResult(paymentId: string, result: PaymentVerificationResult): void {
    this.cache.set(paymentId, result);
    this.cacheExpiry.set(paymentId, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Validate payment for API endpoints
   */
  async validatePaymentForScan(
    paymentId: string | undefined, 
    tier: ScanTier, 
    userEmail?: string
  ): Promise<{ valid: boolean; error?: string; paymentData?: any }> {
    
    // Basic tier doesn't need payment
    if (tier === 'basic') {
      return { valid: true };
    }

    // Paid tiers require payment ID
    if (!paymentId) {
      return { 
        valid: false, 
        error: `Payment ID required for ${tier} tier` 
      };
    }

    const verification = await this.verifyPayment(paymentId, tier);
    
    if (!verification.isValid) {
      return {
        valid: false,
        error: verification.error || `Payment verification failed for ${tier} tier`
      };
    }

    // Optional: Validate email matches if provided
    if (userEmail && verification.userEmail && verification.userEmail !== userEmail) {
      return {
        valid: false,
        error: 'Email mismatch between payment and scan request'
      };
    }

    return {
      valid: true,
      paymentData: {
        tier: verification.tier,
        amount: verification.amount,
        userEmail: verification.userEmail
      }
    };
  }

  /**
   * Create payment for tier (for frontend integration)
   */
  async createPayment(
    tier: ScanTier,
    userEmail: string,
    returnUrl: string,
    webhookUrl?: string
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    
    if (tier === 'basic') {
      throw new Error('Cannot create payment for basic tier');
    }

    const amount = this.getTierPrice(tier);
    
    const payment = await this.getMollieClient().payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2)
      },
      description: `AIO-Scanner ${tier.charAt(0).toUpperCase() + tier.slice(1)} Pack`,
      redirectUrl: returnUrl,
      webhookUrl: webhookUrl,
      metadata: {
        tier,
        userEmail,
        product: 'aio-scanner',
        createdAt: new Date().toISOString()
      }
    });

    return {
      paymentUrl: payment.getCheckoutUrl() || '',
      paymentId: payment.id
    };
  }

  /**
   * Webhook handler for payment status updates
   */
  async handleWebhook(paymentId: string): Promise<void> {
    try {
      const payment = await this.getMollieClient().payments.get(paymentId);
      
      // Clear cache to force fresh verification
      this.cache.delete(paymentId);
      this.cacheExpiry.delete(paymentId);
      
      console.log(`🔔 Webhook: Payment ${paymentId} status updated to ${payment.status}`);
      
      // TODO: Add database update logic here if needed
      // await this.updatePaymentInDatabase(payment);
      
    } catch (error) {
      console.error('💥 Webhook processing failed:', error);
    }
  }
}

// Singleton instance for app-wide use
export const paymentVerificationService = new PaymentVerificationService();

// Helper for API endpoints
export async function requireValidPayment(
  paymentId: string | undefined,
  tier: ScanTier,
  userEmail?: string
): Promise<{ success: boolean; error?: string; paymentData?: any }> {
  
  const validation = await paymentVerificationService.validatePaymentForScan(
    paymentId, 
    tier, 
    userEmail
  );
  
  return {
    success: validation.valid,
    error: validation.error,
    paymentData: validation.paymentData
  };
}