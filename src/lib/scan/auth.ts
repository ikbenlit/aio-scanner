// Authentication utilities voor scan completion flow
import { getSupabaseClient } from '../supabase';

export interface UserStatus {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  credits?: number;
  needsUpgrade?: boolean;
}

/**
 * Detecteert user status voor scan completion flow
 * Dit is de basis van de decision tree in de scan completion flow
 */
export async function checkUserStatus(): Promise<UserStatus> {
  const supabase = getSupabaseClient();

  try {
    // Check if user is authenticated via Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        isAuthenticated: false,
        credits: 0
      };
    }

    // User is authenticated, get their credit balance
    const credits = await getUserCredits(user.id);
    
    return {
      isAuthenticated: true,
      userId: user.id,
      email: user.email,
      credits: credits,
      needsUpgrade: credits <= 0
    };
    
  } catch (error) {
    console.error('Error checking user status:', error);
    
    // Fallback to unauthenticated state on error
    return {
      isAuthenticated: false,
      credits: 0
    };
  }
}

/**
 * Haalt credit balance op voor een gebruiker
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('supabase_auth_id', userId)
      .single();
    
    if (error || !data || typeof data.credits_balance !== 'number') {
      // User doesn't exist in our users table yet, but is authenticated
      // This can happen if they just signed up but haven't made any purchases
      return 0;
    }
    
    return data.credits_balance;
    
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return 0;
  }
}

/**
 * Deducteert credits voor een authenticated user
 * Returns true als succesvol, false als insufficient credits
 */
export async function deductCredit(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  try {
    // Atomic update om race conditions te voorkomen
    const { data, error } = await supabase
      .from('users')
      .update({ 
        credits_balance: `credits_balance - 1`,
        updated_at: new Date().toISOString()
      })
      .eq('supabase_auth_id', userId)
      .gt('credits_balance', 0) // Only update if credits > 0
      .select('credits_balance')
      .single();
    
    if (error || !data) {
      console.log('Credit deduction failed:', error);
      return false;
    }
    
    console.log(`Credit deducted for user ${userId}. Remaining: ${data.credits_balance}`);
    return true;
    
  } catch (error) {
    console.error('Error deducting credit:', error);
    return false;
  }
}

/**
 * Browser-side authentication check (voor frontend components)
 */
export async function checkBrowserAuth(): Promise<UserStatus> {
  // Deze functie wordt gebruikt in Svelte components
  return await checkUserStatus();
} 