// src/lib/types/database.ts

// Enum voor de verschillende tiers
export type ScanTier = 'basic' | 'starter' | 'business' | 'enterprise';

// Interface voor scan_payments
export interface ScanPayment {
  id: string;
  scan_id: string;
  user_email: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  provider: string;
  payment_reference: string;
  created_at: string;
  paid_at?: string | null;
}

// Interface voor user_scan_history
export interface UserScanHistory {
  email: string;
  scan_ids: string[];
  total_scans: number;
  paid_scans: number;
  total_spent: number;
  first_scan_at: string;
  last_scan_at: string;
  created_at: string;
  updated_at?: string;
}
  