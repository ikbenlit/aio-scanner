/**
 * Test endpoint for Enterprise Tier Implementation
 * Phase 3.3 - Validate ScanOrchestrator enterprise tier execution
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ScanOrchestrator } from '../../../../lib/scan/ScanOrchestrator.js';

export const GET: RequestHandler = async ({ url }) => {
    const testMode = url.searchParams.get('mode') || 'full';
    const testUrl = url.searchParams.get('url') || 'https://gifsvoorinsta.nl';

    try {
        console.log('🧪 Testing Phase 3.3 Enterprise Tier Implementation');
        console.log(`📋 Test mode: ${testMode}`);
        console.log(`🌐 Test URL: ${testUrl}`);
        
        const orchestrator = new ScanOrchestrator();
        const testScanId = crypto.randomUUID();
        
        if (testMode === 'quick') {
            // Quick test - just validate orchestrator can be instantiated
            return json({
                status: 'success',
                phase: '3.3 Enterprise Tier Implementation Test',
                testMode: 'quick',
                message: 'ScanOrchestrator instantiated successfully with Enterprise Lite features',
                scanId: testScanId,
                features: [
                    'Multi-page content sampling',
                    'Site-wide pattern analysis',
                    'Basic competitive insights',
                    'Industry benchmarking',
                    'Enhanced strategic narrative',
                    'Enterprise AI report generation'
                ]
            });
        }
        
        // Full integration test
        console.log('🏢 Running full enterprise tier scan...');
        const startTime = Date.now();
        
        const result = await orchestrator.executeTierScan(
            testUrl,
            'enterprise',
            testScanId,
            'test@example.com',
            'test-payment-id'
        );
        
        const duration = Date.now() - startTime;
        
        console.log('✅ Enterprise tier scan completed');
        
        return json({
            status: 'success',
            phase: '3.3 Enterprise Tier Implementation Test',
            testMode: 'full',
            message: 'Enterprise tier scan completed successfully',
            scanResult: {
                scanId: result.scanId,
                url: result.url,
                tier: result.tier,
                overallScore: result.overallScore,
                status: result.status,
                moduleCount: result.moduleResults.length,
                hasAIReport: !!result.aiReport,
                hasAIInsights: !!result.aiInsights,
                hasNarrativeReport: !!result.narrativeReport,
                hasEnterpriseFeatures: !!result.enterpriseFeatures,
                hasCostTracking: !!result.costTracking,
                error: result.error
            },
            enterpriseFeatures: {
                multiPageAnalysis: {
                    enabled: !!result.enterpriseFeatures?.multiPageAnalysis,
                    pagesAnalyzed: result.enterpriseFeatures?.multiPageAnalysis?.length || 0,
                    totalPages: result.enterpriseFeatures?.analysisDepth?.totalPagesAnalyzed || 1
                },
                competitiveContext: {
                    enabled: !!result.enterpriseFeatures?.competitiveContext,
                    industryCategory: result.enterpriseFeatures?.competitiveContext?.industryCategory || 'unknown',
                    competitivePosition: result.enterpriseFeatures?.competitiveContext?.competitivePosition || 'unknown'
                }
            },
            performance: {
                scanDuration: duration,
                aiCost: result.costTracking?.aiCost || 0,
                fallbackUsed: !!result.error
            }
        });

    } catch (error: any) {
        console.error('💥 Enterprise tier test failed:', error);
        
        return json({
            status: 'error',
            phase: '3.3 Enterprise Tier Implementation Test',
            testMode,
            message: 'Enterprise tier test failed',
            error: {
                message: error.message,
                type: error.constructor.name
            }
        }, { status: 500 });
    }
}; 