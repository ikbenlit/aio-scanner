import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSupabaseClient } from '$lib/supabase';

interface ScanModule {
  id?: string;
  name: string;
  icon?: string;
  score: number;
  findings: Array<{
    type: 'success' | 'warning' | 'error';
    message: string;
  }>;
}

interface DatabaseScan {
  id: string;
  url: string;
  status: string;
  overall_score: number;
  result_json: {
    modules?: ScanModule[];
    moduleResults?: ScanModule[];
  } | null;
  created_at: string;
  completed_at: string | null;
  email: string | null;
}

export const load = (async ({ params }: { params: { scanId: string } }) => {
  const { scanId } = params;
  console.log('🔍 Loading scan results for:', scanId);
  
  const supabase = getSupabaseClient();

  try {
    // 1. Haal scan data op
    console.log('📊 Fetching scan data...');
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select(`
        id,
        url,
        status,
        overall_score,
        result_json,
        created_at,
        completed_at,
        email
      `)
      .eq('id', scanId)
      .single();

    if (scanError) {
      console.error('❌ Error fetching scan:', scanError);
      throw error(500, `Database error: ${scanError.message}`);
    }
    
    if (!scan) {
      console.error('❌ Scan not found:', scanId);
      throw error(404, 'Scan niet gevonden');
    }

    const typedScan = scan as DatabaseScan;
    
    // Log de volledige result_json structuur
    console.log('📋 Full result_json structure:', JSON.stringify(typedScan.result_json, null, 2));
    console.log('✅ Scan data loaded:', {
      id: typedScan.id,
      status: typedScan.status,
      hasResultJson: !!typedScan.result_json,
      resultJsonKeys: typedScan.result_json ? Object.keys(typedScan.result_json) : []
    });

    // Valideer scan status en result_json
    if (typedScan.status !== 'completed') {
      console.log('⚠️ Scan not completed:', typedScan.status);
      return {
        scan: {
          id: typedScan.id,
          url: typedScan.url,
          status: typedScan.status,
          overallScore: 0,
          moduleResults: [],
          createdAt: typedScan.created_at,
          completedAt: null
        },
        emailStatus: {
          email: null,
          sentAt: null
        }
      };
    }

    // Check de exacte structuur van result_json
    if (!typedScan.result_json) {
      console.error('❌ result_json is null');
      throw error(500, 'Scan resultaten niet beschikbaar');
    }

    // Check of we moduleResults of modules hebben
    const moduleResults = typedScan.result_json.moduleResults || typedScan.result_json.modules;
    if (!moduleResults) {
      console.error('❌ No modules or moduleResults found in:', typedScan.result_json);
      throw error(500, 'Scan resultaten niet beschikbaar');
    }

    // 2. Haal email status op
    console.log('📧 Fetching email status...');
    const { data: emailStatus, error: emailError } = await supabase
      .from('email_status')
      .select('email, sent_at')
      .eq('scan_id', scanId)
      .single();

    if (emailError) {
      console.error('❌ Error fetching email status:', emailError);
      // Don't throw here, just log and continue without email status
    }

    console.log('✅ Data loaded successfully');
    
    // 3. Return complete data
    return {
      scan: {
        id: typedScan.id,
        url: typedScan.url,
        status: typedScan.status,
        overallScore: typedScan.overall_score,
        moduleResults: moduleResults,
        createdAt: typedScan.created_at,
        completedAt: typedScan.completed_at
      },
      emailStatus: {
        email: emailStatus?.email || typedScan.email || null,
        sentAt: emailStatus?.sent_at || null
      }
    };

  } catch (err) {
    // Log de volledige error voor debugging
    console.error('❌ Error loading scan results:', err);
    
    // Als het een bekende error is (404/500), gooi deze door
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Anders, geef een generieke error met meer context
    throw error(500, 'Kon scan resultaten niet laden. Probeer het later opnieuw of neem contact op met support.');
  }
}) satisfies PageServerLoad;