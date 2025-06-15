/**
 * Test script for LLMEnhancementService integration
 * Phase 3.1 - Validate VertexAI connection
 */

import { LLMEnhancementService } from './LLMEnhancementService.js';
import { ContentExtractor } from './ContentExtractor.js';
import type { ModuleResult } from './types.js';

// Mock module results for testing
const mockModuleResults: ModuleResult[] = [
    {
        moduleName: 'TechnicalSEOModule',
        score: 75,
        findings: [
            {
                recommendation: true,
                type: 'warning',
                title: 'Missing meta description',
                description: 'Add meta descriptions to improve AI citation potential',
                impact: 'medium',
                category: 'technical',
                priority: 'medium'
            }
        ],
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
    },
    {
        moduleName: 'AIContentModule',
        score: 60,
        findings: [
            {
                recommendation: true,
                type: 'warning',
                title: 'Vague quality claims',
                description: 'Replace vague statements with specific evidence',
                impact: 'high',
                category: 'content',
                priority: 'high'
            }
        ],
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
    }
];

// Test HTML content
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Website - Beste Service in Nederland</title>
    <meta name="description" content="Wij bieden de beste service sinds 1995">
</head>
<body>
    <h1>Welkom bij onze uitstekende service</h1>
    <p>Al meer dan 25 jaar ervaring in de branche.</p>
    <p>Veel tevreden klanten kiezen voor onze premium kwaliteit.</p>
    <p>Wij zijn marktleider in innovatieve oplossingen.</p>
    
    <div class="testimonials">
        <p>"Zeer tevreden met de service" - Klant A</p>
        <p>"Top kwaliteit geleverd" - Klant B</p>
    </div>
    
    <footer>
        <p>Opgericht in 1995 | Familiebedrijf | ISO 9001 gecertificeerd</p>
    </footer>
</body>
</html>
`;

export async function testLLMIntegration(): Promise<void> {
    console.log('🧪 Testing LLM Enhancement Service Integration...');
    
    try {
        // Initialize services
        const llmService = new LLMEnhancementService();
        const contentExtractor = new ContentExtractor();
        
        // Extract enhanced content
        console.log('📊 Extracting enhanced content...');
        const enhancedContent = contentExtractor.extractEnhancedContent(testHTML);
        
        console.log('✅ Enhanced content extracted:');
        console.log(`- Authority markers: ${enhancedContent.authorityMarkers.length}`);
        console.log(`- Quality claims: ${enhancedContent.qualityClaims.length}`);
        console.log(`- Time signals: ${enhancedContent.timeSignals.length}`);
        console.log(`- Missed opportunities: ${enhancedContent.missedOpportunities.length}`);
        console.log(`- Overall quality score: ${enhancedContent.contentQualityAssessment.overallQualityScore}`);
        
        // Test LLM enhancement
        console.log('\n🔮 Testing LLM enhancement...');
        const result = await llmService.enhanceFindings(mockModuleResults, enhancedContent);
        
        console.log('✅ LLM Enhancement completed:');
        console.log(`- Insights confidence: ${result.insights.confidence}%`);
        console.log(`- Missed opportunities found: ${result.insights.missedOpportunities.length}`);
        console.log(`- Authority enhancements: ${result.insights.authorityEnhancements.length}`);
        console.log(`- Citability improvements: ${result.insights.citabilityImprovements.length}`);
        console.log(`- Implementation priorities: ${result.insights.implementationPriority.length}`);
        
        console.log('\n📝 Narrative Report:');
        console.log(`- Word count: ${result.narrative.wordCount}`);
        console.log(`- Executive summary: ${result.narrative.executiveSummary.substring(0, 100)}...`);
        
        // Test sample opportunities
        if (result.insights.missedOpportunities.length > 0) {
            console.log('\n🎯 Sample Missed Opportunity:');
            const sample = result.insights.missedOpportunities[0];
            console.log(`- Title: ${sample.title}`);
            console.log(`- Category: ${sample.category}`);
            console.log(`- Impact Score: ${sample.impactScore}/10`);
            console.log(`- Difficulty: ${sample.difficulty}`);
            console.log(`- Time Estimate: ${sample.timeEstimate}`);
        }
        
        console.log('\n🎉 LLM Integration Test SUCCESSFUL!');
        console.log('✅ ContentExtractor → LLMEnhancementService → VertexAI pipeline working');
        
    } catch (error: any) {
        console.error('❌ LLM Integration Test FAILED:', error);
        
        if (error.message === 'BUDGET_EXCEEDED') {
            console.log('💰 Budget exceeded - fallback mechanism should activate');
        } else if (error.message.includes('_FAILED')) {
            console.log('🔄 AI service failed - fallback mechanism should activate');
        } else {
            console.log('⚠️ Unexpected error - check configuration');
        }
        
        throw error;
    }
}

// Export for use in API endpoints
export { mockModuleResults, testHTML }; 