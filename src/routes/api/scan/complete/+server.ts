import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { handleScanCompletion } from '$lib/scan/completion';
import { getSupabaseClient } from '$lib/supabase';
import type { EngineScanResult as ScanResult, convertToEmailFormat } from '$lib/types/scan';

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
  completed_at: string | null;
}

/**
 * API endpoint voor scan completion flow
 * Triggered wanneer een scan voltooid is
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('🎯 Processing scan completion...');
    const { scanId } = await request.json();

    if (!scanId) {
      throw error(400, 'Scan ID is required');
    }

    console.log(`📊 Fetching scan data for ID: ${scanId}`);
    const supabase = getSupabaseClient();
    
    // Expliciet type casting voor database response
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
      console.error('Scan not found:', scanId);
      throw error(404, 'Scan not found');
    }

    if (scanData.status !== 'completed') {
      console.error('Invalid scan status:', scanData.status);
      throw error(400, 'Scan is not completed yet');
    }

    // Convert database scan to ScanResult format
    const scanResult: ScanResult = {
      scanId: scanData.id,
      url: scanData.url,
      status: 'completed',
      overallScore: scanData.overall_score,
      moduleResults: scanData.result_json.moduleResults,
      createdAt: scanData.created_at,
      completedAt: scanData.completed_at || undefined
    };

    console.log('🔄 Processing completion flow...');
    const flowAction = await handleScanCompletion(scanResult);
    console.log('✅ Flow action determined:', flowAction);

    return json({
      success: true,
      action: flowAction,
      scanResults: flowAction.type === 'show_email_capture' ? scanResult : undefined
    });

  } catch (err) {
    console.error('❌ Scan completion API error:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}; 