import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { handleScanCompletion } from '$lib/scan/completion';
import { getSupabase } from '$lib/supabase';

/**
 * API endpoint voor scan completion flow
 * Triggered wanneer een scan voltooid is
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { scanId } = await request.json();

    if (!scanId) {
      throw error(400, 'Scan ID is required');
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

    // Convert database scan to ScanResult format
    const scanResults = {
      scanId: scanData.id.toString(),
      url: scanData.url,
      status: 'completed' as const,
      overallScore: scanData.overall_score || 0,
      moduleResults: scanData.result_json.moduleResults || [],
      createdAt: scanData.created_at,
      completedAt: scanData.completed_at
    };

    // Process scan completion flow
    const flowAction = await handleScanCompletion(scanResults);

    return json({
      success: true,
      action: flowAction,
      scanResults: flowAction.type === 'show_email_capture' ? scanResults : undefined
    });

  } catch (err) {
    console.error('Scan completion API error:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Internal server error');
  }
}; 