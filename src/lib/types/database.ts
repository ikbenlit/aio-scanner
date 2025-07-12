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

// Interface voor crawls table
export interface CrawlRecord {
  id: string;
  user_id: string;
  root_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  pages_scanned?: number;
  total_pages_found?: number;
  created_at: string;
  completed_at?: string | null;
  error_message?: string | null;
}

// Interface voor crawl_pages table
export interface CrawlPage {
  id: string;
  crawl_id: string;
  url: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  http_status?: number;
  scan_result_id?: string | null; // FK to scans table
  error_message?: string | null;
  discovered_at: string;
  scanned_at?: string | null;
}
  