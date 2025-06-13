import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseClient } from '$lib/supabase';
import type { DBScan, DBModuleResult, TransformedScanResults, Finding } from '$lib/types/scan';
import { checkRateLimit } from '$lib/utils/rateLimit';

export const GET: RequestHandler = async ({ params, request }) => {
    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
        throw error(429, {
            message: 'Te veel requests. Probeer het over een minuut opnieuw.'
        });
    }

    const { scanId } = params;
    const supabase = getSupabaseClient();

    try {
        // 1. Haal basis scan data op inclusief screenshot
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select(`
                *,
                screenshot
            `)
            .eq('id', scanId)
            .single();

        if (scanError) throw scanError;
        if (!scan) throw new Error('Scan niet gevonden');

        const typedScan = scan as DBScan & { screenshot?: string };

        // 2. Haal module resultaten op
        const { data: moduleResults, error: moduleError } = await supabase
            .from('scan_modules')
            .select('*')
            .eq('scan_id', scanId);

        if (moduleError) throw moduleError;
        
        const typedModuleResults = (moduleResults || []) as DBModuleResult[];

        // 3. Transformeer data naar frontend formaat
        const transformedResults: TransformedScanResults = {
            overview: {
                url: typedScan.url,
                overallScore: typedScan.overall_score,
                completedAt: typedScan.completed_at,
                status: typedScan.status,
                screenshot: typedScan.screenshot // ← Add screenshot to response
            },
            modules: typedModuleResults.map(module => ({
                name: module.module_name,
                score: module.score,
                findings: module.findings || [],
                status: module.status,
                progress: module.progress || 0 // Add progress field with fallback to 0
            })),
            quickWins: extractQuickWins(typedModuleResults)
        };

        return json(transformedResults);

    } catch (err) {
        console.error('Error fetching scan results:', err);
        throw error(500, {
            message: 'Er ging iets mis bij het ophalen van de scan resultaten'
        });
    }
};

// Helper functie voor quick wins
function extractQuickWins(moduleResults: DBModuleResult[]): TransformedScanResults['quickWins'] {
    const allFindings: Finding[] = moduleResults.flatMap(module => 
        module.findings?.filter(finding => 
            finding.impact === 'high' && 
            finding.type === 'error'
        ) || []
    );

    return allFindings.map(finding => ({
        title: finding.title,
        description: finding.description,
        impact: finding.impact,
        implementation: typeof finding.recommendation === 'string' ? finding.recommendation : 'Implementatie details volgen'
    })).slice(0, 3); // Alleen top 3 quick wins
}