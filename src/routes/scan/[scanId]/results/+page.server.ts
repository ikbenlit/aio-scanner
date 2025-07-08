import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSupabaseClient } from '$lib/supabase';
import { translateFindings, getPositiveFindings } from '$lib/results/translation';
import { selectTop3QuickWins } from '$lib/results/prioritization';
import type { Finding } from '$lib/types/scan';

interface ScanModule {
  id?: string;
  name: string;
  icon?: string;
  score: number;
  findings: Array<{
    type?: 'success' | 'warning' | 'error';
    priority?: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    message?: string;
    recommendation?: string;
    impact?: string;
    category?: string;
    technicalDetails?: string;
    estimatedTime?: string;
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
  email_sent: boolean | null;
  email_sent_at: string | null;
  user_email: string | null;
  tier: string | null;
  pdf_generation_status: string | null;
  pdf_url: string | null;
}

/**
 * Extract all findings from module results for translation
 */
function extractFindingsFromModules(moduleResults: ScanModule[]): Finding[] {
  const allFindings: Finding[] = [];
  
  for (const module of moduleResults) {
    if (module.findings && Array.isArray(module.findings)) {
      for (const finding of module.findings) {
        // Ensure finding has required properties
        if (finding.title && finding.description) {
          allFindings.push({
            title: finding.title,
            description: finding.description,
            priority: finding.priority || 'medium',
            recommendation: finding.recommendation,
            impact: finding.impact,
            category: finding.category || module.name?.toLowerCase() || 'general',
            technicalDetails: finding.technicalDetails,
            estimatedTime: finding.estimatedTime
          });
        }
      }
    }
  }
  
  return allFindings;
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
        email,
        email_sent,
        email_sent_at,
        user_email,
        tier,
        pdf_generation_status,
        pdf_url
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
          completedAt: null,
          tier: typedScan.tier || 'basic',
          pdfGenerationStatus: typedScan.pdf_generation_status,
          pdfUrl: typedScan.pdf_url
        },
        emailStatus: {
          email: typedScan.email || typedScan.user_email || null,
          sentAt: null
        },
        businessInsights: {
          quickWins: [],
          positiveFindings: [],
          totalActions: 0,
          allActions: []
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

    // 2. Email status is already in scan data
    console.log('📧 Using email status from scan data...');

    console.log('✅ Data loaded successfully');
    
    // 3. Process findings through translation system
    console.log('🔄 Processing findings through translation system...');
    const allFindings = extractFindingsFromModules(moduleResults);
    console.log(`📋 Found ${allFindings.length} total findings`);
    
    // Translate technical findings to business actions
    const businessActions = translateFindings(allFindings);
    console.log(`✨ Translated ${businessActions.length} findings to business actions`);
    
    // Select top 3 quick wins
    const quickWins = selectTop3QuickWins(businessActions);
    console.log(`🚀 Selected ${quickWins.length} quick wins`);
    
    // Get positive reinforcement points
    const positiveFindings = getPositiveFindings(allFindings);
    console.log(`✅ Found ${positiveFindings.length} positive points`);
    
    // 4. Return complete data with new business-friendly structure
    return {
      scan: {
        id: typedScan.id,
        url: typedScan.url,
        status: typedScan.status,
        overallScore: typedScan.overall_score,
        moduleResults: moduleResults,
        createdAt: typedScan.created_at,
        completedAt: typedScan.completed_at,
        tier: typedScan.tier || 'basic',
        pdfGenerationStatus: typedScan.pdf_generation_status,
        pdfUrl: typedScan.pdf_url
      },
      emailStatus: {
        email: typedScan.email || typedScan.user_email || null,
        sentAt: typedScan.email_sent_at || null,
        sent: typedScan.email_sent || false
      },
      // New business-friendly data
      businessInsights: {
        quickWins,
        positiveFindings,
        totalActions: businessActions.length,
        allActions: businessActions
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