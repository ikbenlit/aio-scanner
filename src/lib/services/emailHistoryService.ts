// src/lib/services/emailHistoryService.ts
import type { UserScanHistory } from '$lib/types/database';
import { getSupabaseClient } from '$lib/supabase';
const supabase = getSupabaseClient();

type UserScanHistoryRow = {
  email: string;
  scan_ids: string[];
  total_scans: number;
  paid_scans: number;
  total_spent: number;
  first_scan_at: string;
  last_scan_at?: string;
  created_at: string;
  updated_at?: string;
};

export async function upsertUserScanHistory({
  email,
  scanId,
  isPaid,
  amount
}: {
  email: string;
  scanId: string;
  isPaid?: boolean;
  amount?: number;
}) {
  const now = new Date().toISOString();

  // 1. Haal huidige record op
  const { data, error } = await (
    supabase
      .from('user_scan_history')
      .select('*')
      .eq('email', email)
      .single()
  ) as unknown as { data: UserScanHistoryRow | null; error: any };

  if (error && error.code !== 'PGRST116') {
    console.error(`❌ Fout bij ophalen history voor ${email}:`, error);
    return;
  }

  const current = data ?? {
    email,
    scan_ids: [],
    total_scans: 0,
    paid_scans: 0,
    total_spent: 0,
    first_scan_at: now,
    created_at: now
  };

  const newScanIds = Array.from(
    new Set([...(current.scan_ids as string[] ?? []), scanId])
  );
  
  const update = {
    email,
    scan_ids: newScanIds,
    total_scans: newScanIds.length,
    paid_scans: current.paid_scans + (isPaid ? 1 : 0),
    total_spent: current.total_spent + (isPaid && amount ? amount : 0),
    first_scan_at: current.first_scan_at,
    last_scan_at: now,
    created_at: current.created_at,
    updated_at: now
  };

  const { error: upsertError } = await supabase
    .from('user_scan_history')
    .upsert(update, { onConflict: 'email' });

  if (upsertError) {
    console.error(`❌ Upsert error voor ${email}:`, upsertError);
  } else {
    console.log(`✅ History bijgewerkt voor ${email}`);
  }
}
