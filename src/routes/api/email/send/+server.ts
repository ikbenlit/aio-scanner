// src/routes/api/email/send/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmail } from '$lib/email/client';
import { getSupabaseClient } from '$lib/supabase';
import { generateScanEmailTemplate, convertToEmailFormat } from '$lib/email/templates';
import type { EngineScanResult, EmailScanResult } from '$lib/types/scan';

// Database scan type
interface DatabaseScan {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overall_score: number;
  result_json: {
    moduleResults: ModuleResult[];
  };
  created_at: string;
  completed_at: string | null;
  email: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_message_id: string | null;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('📧 Processing email send request...');
    const { email, scanId } = await request.json();

    // Validatie
    if (!email || !scanId) {
      throw error(400, 'Email en scan ID zijn verplicht');
    }

    // Email format validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw error(400, 'Ongeldig email formaat');
    }

    console.log(`📊 Fetching scan data for ID: ${scanId}`);
    // Haal scan data op
    const supabase = getSupabaseClient();
    const { data: scanData, error: dbError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single() as { data: DatabaseScan | null; error: any };

    if (dbError) {
      console.error('Database error:', dbError);
      throw error(500, 'Database error: ' + dbError.message);
    }

    if (!scanData) {
      throw error(404, 'Scan niet gevonden');
    }

    // Convert naar ScanResult format
    const scanResult: EngineScanResult = {
      scanId: scanData.id,
      url: scanData.url,
      status: scanData.status,
      overallScore: scanData.overall_score,
      moduleResults: scanData.result_json.moduleResults,
      createdAt: scanData.created_at,
      completedAt: scanData.completed_at || undefined
    };

    // Convert naar email template format
    const emailScanResult = convertToEmailFormat(scanResult);

    // Genereer email HTML
    console.log('🎨 Generating email template...');
    const emailHtml = generateScanEmailTemplate(emailScanResult);

    // Verstuur email
    console.log('📧 Sending email...');
    const emailResult = await sendEmail({
      to: email,
      subject: `Je AIO-Scanner resultaten voor ${scanResult.url}`,
      html: emailHtml
    });

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error);
      throw error(500, 'Email verzenden mislukt: ' + emailResult.error);
    }

    // Update database met email status
    console.log('💾 Updating email status in database...');
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        email,
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_message_id: emailResult.messageId
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('Failed to update email status:', updateError);
      // We gooien hier geen error omdat de email wel is verzonden
    }

    return json({
      success: true,
      messageId: emailResult.messageId
    });

  } catch (err) {
    console.error('❌ Email send API error:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
};