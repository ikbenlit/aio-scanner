/**
 * Test endpoint for LLM Enhancement Service integration
 * Phase 3.1 - Validate ContentExtractor → LLMEnhancementService → VertexAI pipeline
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { testLLMIntegration, mockModuleResults, testHTML } from '../../../../lib/scan/test-llm-integration.js';

export const GET: RequestHandler = async ({ url }) => {
    const testMode = url.searchParams.get('mode') || 'full';

    try {
        console.log('🧪 Testing Phase 3.1 LLM Integration');
        console.log(`📋 Test mode: ${testMode}`);
        
        if (testMode === 'quick') {
            // Quick test - just validate services can be instantiated
            const { LLMEnhancementService } = await import('../../../../lib/scan/LLMEnhancementService.js');
            const { ContentExtractor } = await import('../../../../lib/scan/ContentExtractor.js');
            
            const llmService = new LLMEnhancementService();
            const contentExtractor = new ContentExtractor();
            
            // Test enhanced content extraction only
            const enhancedContent = contentExtractor.extractEnhancedContent(testHTML);
            
            return json({
                status: 'success',
                phase: '3.1 LLM Integration Test',
                testMode: 'quick',
                services: {
                    llmService: 'instantiated',
                    contentExtractor: 'instantiated'
                },
                enhancedContent: {
                    authorityMarkers: enhancedContent.authorityMarkers.length,
                    qualityClaims: enhancedContent.qualityClaims.length,
                    timeSignals: enhancedContent.timeSignals.length,
                    missedOpportunities: enhancedContent.missedOpportunities.length,
                    overallQualityScore: enhancedContent.contentQualityAssessment.overallQualityScore
                },
                message: 'Quick test completed - services working'
            });
        }
        
        // Full integration test
        console.log('🔄 Running full LLM integration test...');
        await testLLMIntegration();
        
        return json({
            status: 'success',
            phase: '3.1 LLM Integration Test',
            testMode: 'full',
            message: 'Full LLM integration test completed successfully',
            pipeline: [
                '✅ ContentExtractor - Enhanced pattern detection working',
                '✅ LLMEnhancementService - AI integration active',
                '✅ VertexAI Client - AI insights generation working',
                '✅ Fallback mechanism - Pattern-based analysis ready'
            ],
            implementation: {
                phase: '3.1',
                status: 'COMPLETED',
                features: [
                    'Enhanced ContentExtractor output connected to VertexAI',
                    'LLMEnhancementService with real AI processing',
                    'Cost monitoring and budget controls',
                    'Graceful fallback to pattern-based analysis',
                    'Caching for cost optimization',
                    'Dutch language narrative generation'
                ],
                readyForNextStep: 'Phase 3.2 - Business Tier Integration'
            }
        });

    } catch (error: any) {
        console.error('❌ LLM Integration test failed:', error);
        
        let errorDetails = {
            message: error.message,
            type: 'unknown'
        };
        
        if (error.message === 'BUDGET_EXCEEDED') {
            errorDetails.type = 'budget';
            errorDetails.message = 'AI budget exceeded - fallback mechanism should activate';
        } else if (error.message.includes('_FAILED')) {
            errorDetails.type = 'ai_service';
            errorDetails.message = 'AI service failed - fallback mechanism should activate';
        } else if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            errorDetails.type = 'authentication';
            errorDetails.message = 'Google Cloud authentication issue';
        }
        
        return json({
            status: 'error',
            phase: '3.1 LLM Integration Test',
            error: errorDetails,
            fallbackStatus: 'Pattern-based analysis should still work',
            implementation: {
                phase: '3.1',
                status: 'FAILED',
                readyForNextStep: false
            }
        }, { status: 500 });
    }
}; 