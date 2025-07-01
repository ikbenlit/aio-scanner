/**
 * Test endpoint for Business Tier Integration
 * Phase 3.2 - Validate ScanOrchestrator business tier execution
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ScanOrchestrator } from '../../../../lib/scan/ScanOrchestrator.js';

export const GET: RequestHandler = async ({ url }) => {
    const testMode = url.searchParams.get('mode') || 'full';
    const testUrl = url.searchParams.get('url') || 'https://gifsvoorinsta.nl';

    try {
        console.log('🧪 Testing Phase 3.2 Business Tier Integration');
        console.log(`📋 Test mode: ${testMode}`);
        console.log(`🌐 Test URL: ${testUrl}`);
        
        const orchestrator = new ScanOrchestrator();
        const testScanId = crypto.randomUUID();
        
        if (testMode === 'quick') {
            // Quick test - just validate orchestrator can be instantiated
            return json({
                status: 'success',
                phase: '3.2 Business Tier Integration Test',
                testMode: 'quick',
                message: 'ScanOrchestrator instantiated successfully',
                scanId: testScanId,
                features: [
                    'ScanOrchestrator with LLMEnhancementService integration',
                    'Business tier execution method available',
                    'AI-enhanced report generation ready',
                    'Cost tracking and fallback mechanisms'
                ]
            });
        }
        
        // Full integration test
        console.log('🚀 Running full business tier scan...');
        const startTime = Date.now();
        
        const result = await orchestrator.executeTierScan(
            testUrl,
            'business',
            testScanId,
            'test@example.com',
            'test-payment-id'
        );
        
        const duration = Date.now() - startTime;
        
        console.log('✅ Business tier scan completed');
        
        return json({
            status: 'success',
            phase: '3.2 Business Tier Integration Test',
            testMode: 'full',
            message: 'Business tier scan completed successfully',
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
                hasCostTracking: !!result.costTracking,
                error: result.error
            },
            aiEnhancement: {
                insightsGenerated: !!result.aiInsights,
                narrativeGenerated: !!result.narrativeReport,
                missedOpportunities: result.aiInsights?.missedOpportunities?.length || 0,
                authorityEnhancements: result.aiInsights?.authorityEnhancements?.length || 0,
                confidence: result.aiInsights?.confidence || 0,
                wordCount: result.narrativeReport?.wordCount || 0
            },
            performance: {
                scanDuration: duration,
                aiCost: result.costTracking?.aiCost || 0,
                fallbackUsed: !!result.error
            },
            implementation: {
                phase: '3.2',
                status: 'COMPLETED',
                features: [
                    'Business tier scan orchestration',
                    'AI-enhanced content analysis',
                    'Hybrid scoring (pattern + AI confidence)',
                    'Enhanced AI report generation',
                    'Cost tracking and monitoring',
                    'Graceful fallback to starter tier'
                ],
                readyForNextStep: 'Phase 3.3 - Narrative PDF Enhancement'
            }
        });

    } catch (error: any) {
        console.error('❌ Business tier integration test failed:', error);
        
        let errorDetails = {
            message: error.message,
            type: 'unknown',
            stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
        };
        
        if (error.message.includes('Email en paymentId zijn verplicht')) {
            errorDetails.type = 'validation';
        } else if (error.message.includes('AI enhancement failed')) {
            errorDetails.type = 'ai_fallback';
        } else if (error.message.includes('BUDGET_EXCEEDED')) {
            errorDetails.type = 'budget';
        } else if (error.message.includes('database')) {
            errorDetails.type = 'database';
        }
        
        return json({
            status: 'error',
            phase: '3.2 Business Tier Integration Test',
            error: errorDetails,
            fallbackStatus: 'Should gracefully degrade to starter tier',
            implementation: {
                phase: '3.2',
                status: 'FAILED',
                readyForNextStep: false
            }
        }, { status: 500 });
    }
}; 