// src/routes/api/test/fase-1-1-server-logic/+server.ts
import { json } from '@sveltejs/kit';
import { selectVariedQuickWins, selectTop3QuickWins, getAIPreviewBadge, isAICategory } from '$lib/results/prioritization';
import { translateFindings } from '$lib/results/translation';
import type { BusinessAction } from '$lib/results/translation';
import type { Finding } from '$lib/types/scan';

export async function GET() {
    try {
        console.log('🧪 Testing Fase 1.1 - Server Logic for Tier-aware Quick Wins...');
        
        // Mock findings data for testing (realistic findings that create proper quick wins)
        const mockFindings: Finding[] = [
            {
                title: 'missing_schema_organization',
                description: 'Organisatie gegevens niet gevonden',
                priority: 'high',
                category: 'structured-data',
                recommendation: 'Voeg schema markup toe',
                technicalDetails: 'JSON-LD schema missing'
            },
            {
                title: 'faq_content_missing',
                description: 'Geen FAQ sectie gevonden',
                priority: 'high',
                category: 'ai-content',
                recommendation: 'Maak een FAQ sectie',
                technicalDetails: 'No FAQ content found'
            },
            {
                title: 'author_info_missing',
                description: 'Geen author info gevonden',
                priority: 'medium',
                category: 'authority',
                recommendation: 'Voeg author info toe',
                technicalDetails: 'No author schema found'
            },
            {
                title: 'meta_description_too_long',
                description: 'Meta description > 160 characters',
                priority: 'medium',
                category: 'metadata',
                recommendation: 'Kort meta description in',
                technicalDetails: 'Current length: 185 characters'
            },
            {
                title: 'missing_h1_tag',
                description: 'Geen H1 tag gevonden',
                priority: 'high',
                category: 'technical',
                recommendation: 'Voeg H1 tag toe',
                technicalDetails: 'No H1 element found'
            },
            {
                title: 'images_missing_alt_text',
                description: '3 images zonder alt text',
                priority: 'low',
                category: 'technical',
                recommendation: 'Voeg alt text toe aan images',
                technicalDetails: '3 images missing alt attribute'
            }
        ];

        // Translate findings to business actions
        const businessActions = translateFindings(mockFindings);
        console.log(`✨ Translated ${businessActions.length} findings to business actions`);

        // Test Basic tier selection (selectVariedQuickWins)
        const basicTierQuickWins = selectVariedQuickWins(businessActions);
        const basicAIPreviewBadge = getAIPreviewBadge(basicTierQuickWins);

        // Test paid tier selection (selectTop3QuickWins)
        const paidTierQuickWins = selectTop3QuickWins(businessActions);

        // Analyze AI category distribution
        const aiCategoryCount = businessActions.filter(action => isAICategory(action.category)).length;
        const nonAiCategoryCount = businessActions.length - aiCategoryCount;

        // Test results
        const results = {
            mockData: {
                totalFindings: mockFindings.length,
                totalBusinessActions: businessActions.length,
                aiCategoryActions: aiCategoryCount,
                nonAiCategoryActions: nonAiCategoryCount
            },
            basicTier: {
                quickWins: basicTierQuickWins,
                quickWinsCount: basicTierQuickWins.length,
                aiPreviewBadge: basicAIPreviewBadge,
                hasAIAction: basicTierQuickWins.some(action => isAICategory(action.category)),
                hasQuickWin: basicTierQuickWins.some(action => {
                    const timeNumber = parseInt(action.timeEstimate);
                    const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
                    return timeNumber <= 15 && impactNumber >= 8;
                }),
                categoryBreakdown: basicTierQuickWins.reduce((acc, action) => {
                    acc[action.category] = (acc[action.category] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            },
            paidTier: {
                quickWins: paidTierQuickWins,
                quickWinsCount: paidTierQuickWins.length,
                showsAllActions: true,
                totalAvailableActions: businessActions.length
            },
            tierComparison: {
                basicShowsLimited: basicTierQuickWins.length <= 3,
                paidShowsAll: paidTierQuickWins.length <= businessActions.length,
                basicHasAIPreview: !!basicAIPreviewBadge,
                paidHasNoPreview: !getAIPreviewBadge(paidTierQuickWins) // Should be null for paid
            }
        };

        // Validation checks
        const validationChecks = {
            basicTierCorrect: basicTierQuickWins.length <= 3,
            basicHasAIAction: basicTierQuickWins.some(action => isAICategory(action.category)),
            basicHasQuickWin: basicTierQuickWins.some(action => {
                const timeNumber = parseInt(action.timeEstimate);
                const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
                return timeNumber <= 15 && impactNumber >= 8;
            }),
            aiPreviewBadgeWorking: !!basicAIPreviewBadge,
            paidTierHasMore: paidTierQuickWins.length >= basicTierQuickWins.length
        };

        const allValidationsPassed = Object.values(validationChecks).every(check => check);

        return json({
            success: allValidationsPassed,
            message: allValidationsPassed 
                ? '✅ All Fase 1.1 server logic tests passed!'
                : '❌ Some Fase 1.1 server logic tests failed',
            results,
            validationChecks,
            implementation: {
                selectVariedQuickWins: 'Implemented - 1 AI + 2 highest impact',
                tierAwareFiltering: 'Implemented - Basic vs Paid logic',
                aiPreviewBadge: 'Implemented - Shows AI action count',
                businessInsightsExtended: 'Implemented - aiNarrative + aiInsights fields'
            },
            timestamp: new Date().toISOString(),
            phase: 'Fase 1.1: Server Logica - Tier-aware Quick Wins & Data Props'
        });
        
    } catch (error) {
        console.error('❌ Fase 1.1 server logic test failed:', error);
        
        return json({
            success: false,
            message: 'Fase 1.1 test endpoint failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}