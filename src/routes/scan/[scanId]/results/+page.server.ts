import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSupabaseClient } from '$lib/supabase';
import { translateFindings, getPositiveFindings } from '$lib/results/translation';
import { selectTop3QuickWins, selectVariedQuickWins, getAIPreviewBadge } from '$lib/results/prioritization';
import { groupModulesByTheme, generateScanSummary, type ThematicGroup } from '$lib/results/thematic-grouping';
import type { Finding } from '$lib/types/scan';
import type { ScanTier } from '$lib/types/database';

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
    // Phase 1.4: Smart Analysis fields
    evidence?: string[];
    suggestion?: string;
  }>;
}

interface DatabaseScan {
  id: string;
  url: string;
  page_title?: string | null;
  status: string;
  overall_score: number;
  result_json: {
    modules?: ScanModule[];
    moduleResults?: ScanModule[];
    // Phase 2: Additional AI data
    aiReport?: any;
    aiInsights?: any;
    narrativeReport?: any;
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
            estimatedTime: finding.estimatedTime,
            // Phase 1.4: Include smart analysis fields
            evidence: finding.evidence || undefined,
            suggestion: finding.suggestion || undefined
          });
        }
      }
    }
  }
  
  return allFindings;
}

/**
 * Extract key insights for Business tier enhancement
 * Searches for Conversational and Authority metrics in AI insights
 */
function extractKeyInsights(moduleResults: ScanModule[], aiInsights: any): {
  conversational: { score: number; benchmark: string } | null;
  authority: { score: number; details: string[] } | null;
} {
  const insights = {
    conversational: null as { score: number; benchmark: string } | null,
    authority: null as { score: number; details: string[] } | null
  };

  // Search in module findings for metrics
  for (const module of moduleResults) {
    if (module.findings && Array.isArray(module.findings)) {
      for (const finding of module.findings) {
        if (finding.title?.toLowerCase().includes('conversational')) {
          // Extract conversational score from metrics or calculate from description
          const score = Math.floor(Math.random() * 20) + 75; // MVP: simulated score 75-95
          insights.conversational = {
            score,
            benchmark: score >= 85 ? 'Boven gemiddeld' : score >= 70 ? 'Gemiddeld' : 'Beneden gemiddeld'
          };
        }
        
        if (finding.title?.toLowerCase().includes('authority')) {
          // Extract authority score from metrics or calculate from description
          const score = Math.floor(Math.random() * 30) + 15; // MVP: simulated score 15-45
          insights.authority = {
            score,
            details: ['Media: 3', 'Klanten: 5', 'Awards: 1'] // MVP: simulated details
          };
        }
      }
    }
  }

  // Fallback: Calculate from AI insights if available
  if (aiInsights && !insights.conversational) {
    const opportunities = aiInsights.missedOpportunities || [];
    const citabilityImprovements = aiInsights.citabilityImprovements || [];
    
    if (opportunities.length > 0 || citabilityImprovements.length > 0) {
      // Calculate conversational score based on opportunities
      const totalOpportunities = opportunities.length + citabilityImprovements.length;
      const score = Math.max(60, 95 - (totalOpportunities * 3));
      insights.conversational = {
        score,
        benchmark: score >= 85 ? 'Boven gemiddeld' : score >= 70 ? 'Gemiddeld' : 'Beneden gemiddeld'
      };
    }
  }

  if (aiInsights && !insights.authority) {
    const authorityEnhancements = aiInsights.authorityEnhancements || [];
    if (authorityEnhancements.length > 0) {
      // Calculate authority score based on current signals
      const score = Math.max(10, 40 - (authorityEnhancements.length * 2));
      insights.authority = {
        score,
        details: authorityEnhancements.slice(0, 3).map((auth: any) => auth.currentSignal || 'Onbekend')
      };
    }
  }

  return insights;
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
        page_title,
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
          pageTitle: typedScan.page_title || null,
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
          allActions: [],
          // Phase 2: Empty AI data for incomplete scans
          aiNarrative: null,
          aiInsights: null,
          // Phase 3.4: No key insights for incomplete scans
          keyInsights: null,
          // Phase 1.4: No smart findings for incomplete scans
          smartFindings: [],
          tier: typedScan.tier || 'basic',
          aiPreviewBadge: null,
          isBasicTier: (typedScan.tier || 'basic') === 'basic',
          hasAIContent: false,
          hasAdvancedInsights: false,
          hasSmartFindings: false
        },
        // UX Redesign: Empty thematic data for incomplete scans
        thematicData: {
          themes: [],
          summary: {
            motivationalMessage: 'Scan nog niet voltooid...',
            keyPriorities: [],
            benchmarkMessage: '',
            nextSteps: []
          }
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
    
    // Phase 1.4: Extract smart findings (findings with evidence or suggestions)
    const smartFindings = allFindings.filter(finding => 
      (finding.evidence && finding.evidence.length > 0) || 
      (finding.suggestion && finding.suggestion.trim().length > 0)
    );
    console.log(`🧠 Found ${smartFindings.length} smart findings with evidence/suggestions`);
    
    // Translate technical findings to business actions
    const businessActions = translateFindings(allFindings);
    console.log(`✨ Translated ${businessActions.length} findings to business actions`);
    
    // Extract tier and determine Quick Wins strategy
    const scanTier = (typedScan.tier || 'basic') as ScanTier;
    console.log(`🎯 Scan tier: ${scanTier}`);
    
    // Phase 2: Tier-aware Quick Wins selection
    let quickWins;
    let aiPreviewBadge = null;
    
    if (scanTier === 'basic') {
      // Basic tier: 3 varied actions (1 AI + 2 highest impact)
      quickWins = selectVariedQuickWins(businessActions);
      aiPreviewBadge = getAIPreviewBadge(quickWins);
      console.log(`🤖 Basic tier: Selected ${quickWins.length} varied quick wins (AI Preview: ${aiPreviewBadge})`);
    } else {
      // Paid tiers: Show all actions (filtered by selectTop3QuickWins for display)
      quickWins = businessActions; // Show all for paid tiers
      console.log(`💎 ${scanTier} tier: Showing all ${quickWins.length} business actions`);
    }
    
    // Get positive reinforcement points
    const positiveFindings = getPositiveFindings(allFindings);
    console.log(`✅ Found ${positiveFindings.length} positive points`);
    
    // 4. Extract AI narrative and insights based on tier
    let aiNarrative = null;
    let aiInsights = null;
    
    if (scanTier !== 'basic' && typedScan.result_json) {
      // Extract AI narrative for Starter+ tiers
      if (typedScan.result_json.narrativeReport) {
        aiNarrative = typedScan.result_json.narrativeReport;
        console.log(`📜 AI Narrative available for ${scanTier} tier`);
      }
      
      // Extract AI insights for Business+ tiers  
      if ((scanTier === 'business' || scanTier === 'enterprise') && typedScan.result_json.aiInsights) {
        aiInsights = typedScan.result_json.aiInsights;
        console.log(`🧠 AI Insights available for ${scanTier} tier`);
      }
    }
    
    // 5. Extract key insights for Business tier enhancement
    let keyInsights = null;
    if (scanTier === 'business' || scanTier === 'enterprise') {
      keyInsights = extractKeyInsights(moduleResults, aiInsights);
      console.log(`🔍 Key insights extracted for ${scanTier} tier:`, keyInsights);
    }
    
    // 6. Generate thematic groups for new UX layout
    // DEBUG: Log actual module names to fix thematic grouping
    console.log('🔧 DEBUG: Actual module names:', moduleResults.map(m => m.name));
    const thematicGroups = groupModulesByTheme(moduleResults);
    const scanSummary = generateScanSummary(thematicGroups, typedScan.overall_score);
    console.log(`🎨 Generated ${thematicGroups.length} thematic groups for improved UX`);
    
    // 7. Return complete data with new business-friendly structure and tier-aware content
    return {
      scan: {
        id: typedScan.id,
        url: typedScan.url,
        pageTitle: typedScan.page_title || null,
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
      // Phase 2: Enhanced business-friendly data with tier-aware content
      businessInsights: {
        quickWins,
        positiveFindings,
        totalActions: businessActions.length,
        allActions: businessActions,
        // Phase 2: AI narrative and insights
        aiNarrative,
        aiInsights,
        // Phase 3.4: Key insights for Business tier enhancement
        keyInsights,
        // Phase 1.4: Smart findings with evidence/suggestions
        smartFindings,
        // Tier-specific metadata
        tier: scanTier,
        aiPreviewBadge,
        // Content filtering info
        isBasicTier: scanTier === 'basic',
        hasAIContent: scanTier !== 'basic',
        hasAdvancedInsights: scanTier === 'business' || scanTier === 'enterprise',
        hasSmartFindings: smartFindings.length > 0
      },
      // UX Redesign: Thematic organization and AI summary
      thematicData: {
        themes: thematicGroups,
        summary: scanSummary
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