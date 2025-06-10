import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { handleEmailCapture } from '$lib/scan/completion';
import { getSupabase } from '$lib/supabase';

/**
 * API endpoint voor email capture processing
 * Slaat email op en geeft toegang tot scan resultaten
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, scanId } = await request.json();

    if (!email || !scanId) {
      throw error(400, 'Email and scan ID are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw error(400, 'Invalid email format');
    }

    // Fetch scan results from database
    const supabase = getSupabase();
    const { data: scanData, error: dbError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (dbError || !scanData) {
      console.error('Scan not found:', dbError);
      throw error(404, 'Scan not found');
    }

    if (scanData.status !== 'completed') {
      throw error(400, 'Scan is not completed yet');
    }

    if (!scanData.result_json) {
      throw error(400, 'Scan results not available');
    }

    // Convert to ScanResult format
    const scanResults = {
      scanId: scanData.id.toString(),
      url: scanData.url,
      status: 'completed' as const,
      overallScore: scanData.overall_score || 0,
      moduleResults: scanData.result_json.moduleResults || [],
      createdAt: scanData.created_at,
      completedAt: scanData.completed_at
    };

    // Process email capture
    const result = await handleEmailCapture(email, scanResults);

    if (!result.success) {
      throw error(500, result.error || 'Email capture failed');
    }

    return json({
      success: true,
      message: 'Email captured successfully',
      redirectUrl: `/scan/${scanId}/results`
    });

  } catch (err) {
    console.error('Email capture API error:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Internal server error');
  }
}; 