// Scan Completion Flow - beslissingslogica voor post-scan flows
import { checkUserStatus, deductCredit, type UserStatus } from './auth';
import type { ScanResult } from './types';

export type FlowAction = 
  | { type: 'show_results'; scanId: string }
  | { type: 'show_upgrade_prompt'; reason: 'no_credits' }
  | { type: 'show_email_capture'; scanResults: ScanResult }
  | { type: 'error'; message: string };

/**
 * Hoofdfunctie: bepaalt welke flow een gebruiker krijgt na scan completion
 * Dit implementeert de decision tree uit de scan completion flow spec
 */
export async function handleScanCompletion(ScanResult: ScanResult): Promise<FlowAction> {
  try {
    console.log(`Handling scan completion for scan ${ScanResult.scanId}`);
    
    // Stap 1: Check user authentication status
    const userStatus = await checkUserStatus();
    console.log('User status:', userStatus);
    
    if (userStatus.isAuthenticated) {
      // AUTHENTICATED USER FLOW
      return await handleAuthenticatedUser(userStatus, ScanResult);
    } else {
      // ANONYMOUS USER FLOW - Email Capture Gate
      return handleAnonymousUser(ScanResult);
    }
    
  } catch (error) {
    console.error('Error in scan completion flow:', error);
    return {
      type: 'error',
      message: 'Er is een fout opgetreden bij het voltooien van de scan'
    };
  }
}

/**
 * Authenticated user flow: Credit check → Results of Upgrade
 */
async function handleAuthenticatedUser(
  userStatus: UserStatus, 
  ScanResult: ScanResult
): Promise<FlowAction> {
  
  if (!userStatus.userId) {
    console.error('Authenticated user missing userId');
    return {
      type: 'error',
      message: 'Authenticatie fout - probeer opnieuw in te loggen'
    };
  }
  
  // Check credits
  if (userStatus.credits && userStatus.credits > 0) {
    // Scenario 1: User heeft credits - deduct en toon results
    const creditDeducted = await deductCredit(userStatus.userId);
    
    if (creditDeducted) {
      console.log(`Credit deducted, showing results for scan ${ScanResult.scanId}`);
      return {
        type: 'show_results',
        scanId: ScanResult.scanId
      };
    } else {
      // Credit deduction mislukt (race condition of database fout)
      console.log('Credit deduction failed, showing upgrade prompt');
      return {
        type: 'show_upgrade_prompt',
        reason: 'no_credits'
      };
    }
  } else {
    // Scenario 2: User heeft geen credits - upgrade prompt
    console.log('User has no credits, showing upgrade prompt');
    return {
      type: 'show_upgrade_prompt',
      reason: 'no_credits'
    };
  }
}

/**
 * Anonymous user flow: Email Capture Gate
 * Dit is het Maximum Leverage moment voor conversie
 */
function handleAnonymousUser(ScanResult: ScanResult): FlowAction {
  console.log('Anonymous user detected, showing email capture modal');
  
      // Scenario 3: Anonymous user - Email capture voor results toegang
    return {
      type: 'show_email_capture',
      scanResults: ScanResult
    };
}

/**
 * Verwerkt email capture van anonymous user
 * Slaat email op en geeft tijdelijke toegang tot results
 */
export async function handleEmailCapture(
  email: string, 
  ScanResult: ScanResult
): Promise<{ success: boolean; error?: string }> {
  
  try {
    console.log(`Processing email capture: ${email} for scan ${ScanResult.scanId}`);
    
    // 1. Store email in database (met conflict handling)
    await storeEmailCapture(email, ScanResult);
    
    // 2. Create temporary session (1 hour browser access)
    createTemporarySession(email, ScanResult.scanId);
    
    // 3. TODO: Send email report (Phase 2.3)
    // await sendScanReport(email, ScanResult);
    
    return { success: true };
    
  } catch (error) {
    console.error('Email capture processing failed:', error);
    return {
      success: false,
      error: 'Er is een fout opgetreden bij het verwerken van je email'
    };
  }
}

/**
 * Slaat email capture op in database
 */
async function storeEmailCapture(email: string, ScanResult: ScanResult): Promise<void> {
  const { getSupabase } = await import('../supabase');
  const supabase = getSupabase();
  
  // Ensure user exists in our users table
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      email: email,
      plan_type: 'free',
      credits_balance: 0 // Free users start with 0 credits
    }, {
      onConflict: 'email',
      ignoreDuplicates: true
    });
  
  if (userError) {
    console.error('Error creating/updating user:', userError);
  }
  
  // Update scan with email capture
  const { error: scanError } = await supabase
    .from('scans')
    .update({
      // Store email for follow-up (as we don't have user_id for anonymous scans)
      result_json: {
        ...ScanResult,
        email_captured: email,
        capture_timestamp: new Date().toISOString()
      }
    })
    .eq('id', parseInt(ScanResult.scanId));
  
  if (scanError) {
    console.error('Error updating scan with email:', scanError);
    throw new Error('Database update failed');
  }
}

/**
 * Creates temporary 1-hour session voor anonymous users
 */
function createTemporarySession(email: string, scanId: string): void {
  if (typeof window !== 'undefined') {
    const sessionData = {
      email: email,
      scanId: scanId,
      expires: Date.now() + (60 * 60 * 1000) // 1 hour
    };
    
    localStorage.setItem('temp_session', JSON.stringify(sessionData));
    console.log(`Temporary session created for ${email}, expires in 1 hour`);
  }
}

/**
 * Checks if user has valid temporary session
 */
export function hasValidTempSession(scanId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionData = localStorage.getItem('temp_session');
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    
    // Check if session is for this scan and not expired
    if (session.scanId === scanId && session.expires > Date.now()) {
      return true;
    }
    
    // Clean up expired session
    localStorage.removeItem('temp_session');
    return false;
    
  } catch (error) {
    console.error('Error checking temp session:', error);
    localStorage.removeItem('temp_session');
    return false;
  }
}

/**
 * IP-based rate limiting check voor anonymous users
 * Basis implementatie - wordt uitgebreid in latere phases
 */
export function checkRateLimit(clientIP: string): { allowed: boolean; reason?: string } {
  // TODO: Implement proper rate limiting met Redis of Supabase
  // Voor nu: basic in-memory tracking (reset bij server restart)
  
  // In productie: check database voor recente scans van dit IP
  console.log(`Rate limit check for IP: ${clientIP}`);
  
  // Voor MVP: geen echte rate limiting, alleen logging
  return { allowed: true };
} 
