// src/lib/services/migrationService.ts
import { getSupabaseClient } from '$lib/supabase';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type { ScanPayment, UserScanHistory } from '$lib/types/database';

const supabase = getSupabaseClient();

type ScanRow = {
  id: number;
  created_at: string;
};

type ScanPaymentRow = {
  amount: number;
};

export async function migrateScansToUserHistory() {
  console.log('🔁 Start migratie van scans → user_scan_history');

  const supabase = getSupabaseClient();

  // 1. Haal unieke e-mails op
  const { data: emailRows, error: emailError } = await supabase
    .from('scans')
    .select('user_email')
    .not('user_email', 'is', null);

  if (emailError || !emailRows) {
    console.error('❌ Fout bij ophalen e-mails:', emailError);
    return;
  }

  const uniqueEmails = [...new Set(emailRows.map((row) => row.user_email).filter(Boolean))];

  for (const email of uniqueEmails as string[]) {


    // 2. Haal alle scans voor dit e-mailadres
    const { data: scansRaw, error: scanError } = await (
      supabase
        .from('scans')
        .select('id, created_at')
        .eq('user_email', email)
    ) as unknown as { data: ScanRow[] | null; error: any };
    

    if (scanError || !scansRaw || scansRaw.length === 0) {
      console.warn(`⚠️ Geen scans gevonden voor ${email}`);
      continue;
    }

    const scans = scansRaw;
    const scanIds = scans.map((s) => s.id);

    const firstScanAt = scans.reduce(
      (min, s) => (s.created_at < min ? s.created_at : min),
      scans[0].created_at
    );

    const lastScanAt = scans.reduce(
      (max, s) => (s.created_at > max ? s.created_at : max),
      scans[0].created_at
    );

    // 3. Haal betaalde scans op
    const { data: paymentsRaw, error: paymentError } = await supabase
      .from('scan_payments')
      .select('amount')
      .eq('user_email', email)
      .eq('status', 'paid') as PostgrestResponse<ScanPaymentRow>;

    if (paymentError) {
      console.warn(`⚠️ Fout bij ophalen payments voor ${email}:`, paymentError);
    }

    const payments = paymentsRaw || [];
    const paidScans = payments.length;
    const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 4. Upsert naar user_scan_history
    const { error: insertError } = await supabase
      .from('user_scan_history')
      .upsert(
        {
          email,
          scan_ids: scanIds,
          first_scan_at: firstScanAt,
          last_scan_at: lastScanAt,
          total_scans: scanIds.length,
          paid_scans: paidScans,
          total_spent: totalSpent,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'email' }
      );

    if (insertError) {
      console.error(`❌ Fout bij upsert ${email}:`, insertError);
    } else {
      console.log(`✅ Migratie voltooid voor ${email}`);
    }
  }

  console.log('🏁 Migratie afgerond.');
}