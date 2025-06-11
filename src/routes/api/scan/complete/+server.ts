import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { handleScanCompletion } from '$lib/scan/completion';
import { getSupabaseClient } from '$lib/supabase';
import type { ScanResult, ModuleResult } from '$lib/scan/types';

// Interface voor de database scan data
interface DatabaseScan {
  id: string;
  url: string;
  status: string;
  overall_score: number;
  result_json: {
    moduleResults: ModuleResult[];
  };
  created_at: string;
  completed_at: string;
}

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
    const supabase = getSupabaseClient();
    const { data: scanData, error: dbError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (dbError || !scanData) {
      console.error('Scan not found:', dbError);
      throw error(404, 'Scan not found');
    }

    // Type guard voor database scan data
    const isValidScanData = (data: unknown): data is DatabaseScan => {
      return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'url' in data &&
        'status' in data &&
        'overall_score' in data &&
        'result_json' in data &&
        'created_at' in data &&
        'completed_at' in data
      );
    };

    if (!isValidScanData(scanData)) {
      throw error(400, 'Invalid scan data format');
    }

    if (scanData.status !== 'completed') {
      throw error(400, 'Scan is not completed yet');
    }

    if (!scanData.result_json) {
      throw error(400, 'Scan results not available');
    }

    // Convert database scan to ScanResult format
    const scanResult: ScanResult = {
      scanId: scanData.id,
      url: scanData.url,
      status: 'completed',
      overallScore: scanData.overall_score,
      moduleResults: scanData.result_json.moduleResults || [],
      createdAt: scanData.created_at,
      completedAt: scanData.completed_at
    };

    // Process scan completion flow
    const flowAction = await handleScanCompletion(scanResult);

    return json({
      success: true,
      action: flowAction,
      scanResults: flowAction.type === 'show_email_capture' ? scanResult : undefined
    });

  } catch (err) {
    console.error('Scan completion API error:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Internal server error');
  }
}; 