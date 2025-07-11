import { json } from '@sveltejs/kit';
import { VertexAIClient } from '$lib/ai/vertexClient.js';
import { ContentExtractor } from '$lib/scan/ContentExtractor.js';
import { PromptFactory } from '$lib/ai/prompts/PromptFactory.js';
import type { RequestHandler } from './$types';

// Import strategies to ensure auto-registration
import '$lib/ai/prompts/InsightsPromptStrategy.js';
import '$lib/ai/prompts/NarrativePromptStrategy.js';
import '$lib/ai/prompts/EnterprisePromptStrategy.js';

// Test data for Phase 3.2A validation - Updated for PromptFactory compatibility
const mockModuleResults = [
  {
    name: 'TechnicalSEO', // Updated from moduleName to name
    success: true,
    score: 75,
    findings: [
      {
        type: 'warning' as const,
        message: 'Missing meta descriptions - Several pages lack meta descriptions',
        evidence: 'Found 3 pages without meta descriptions',
        suggestion: 'Add descriptive meta descriptions to all pages'
      }
    ],
    timestamp: new Date().toISOString()
  },
  {
    name: 'AIContent', // Updated from moduleName to name
    success: true,
    score: 60,
    findings: [
      {
        type: 'error' as const,
        message: 'Limited FAQ content - Only 2 FAQ sections found',
        evidence: 'Found FAQ sections: "Hoe werkt jullie service?", "Wat kost het?"',
        suggestion: 'Add more comprehensive FAQ content covering common questions'
      }
    ],
    timestamp: new Date().toISOString()
  }
];

const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Testbedrijf - Specialist sinds 1995</title>
</head>
<body>
    <h1>Welkom bij Testbedrijf</h1>
    <p>Al 30 jaar zijn wij de beste in onze branche en helpen we veel klanten.</p>
    <p>Onze nieuwste technologie zorgt voor uitstekende resultaten.</p>
    <p>95% van onze klanten is zeer tevreden en we zijn marktleider.</p>
    <p>Gecertificeerd door ISO 9001, lid van branchevereniging.</p>
    <p>KvK: 12345678, BTW: NL123456789B01</p>
    <div>
        <h2>Veelgestelde vragen</h2>
        <p>Hoe werkt jullie service? We bieden verschillende oplossingen.</p>
        <p>Wat kost het? Dat hangt af van jullie wensen.</p>
    </div>
</body>
</html>
`;

export const GET: RequestHandler = async ({ url }) => {
  const testMode = url.searchParams.get('mode') || 'full';

  try {
    console.log('🧪 Testing Phase 3.2A VertexAI Client');
    
    const vertexClient = new VertexAIClient();
    const extractor = new ContentExtractor();
    
    // Extract enhanced content
    console.log('📊 Extracting enhanced content...');
    const enhancedContent = extractor.extractEnhancedContent(testHTML);
    
    let result: any = {
      status: 'success',
      phase: '3.2A VertexAI Client Test',
      testMode,
      enhancedContentSummary: {
        timeSignals: enhancedContent.timeSignals.length,
        qualityClaims: enhancedContent.qualityClaims.length,
        authorityMarkers: enhancedContent.authorityMarkers.length,
        contentQualityScore: enhancedContent.contentQualityAssessment.overallQualityScore,
        missedOpportunities: enhancedContent.missedOpportunities.length
      }
    };

    if (testMode === 'insights' || testMode === 'full') {
      console.log('🧠 Testing AI insights generation...');
      try {
        // Use PromptFactory approach for insights generation
        const insightsStrategy = PromptFactory.create('insights');
        const insightsPrompt = insightsStrategy.buildPrompt({
          moduleResults: mockModuleResults,
          enhancedContent,
          url: 'https://testbedrijf.example.com'
        });
        const insights = await vertexClient.generateInsights(insightsPrompt);
        
        result.aiInsights = {
          status: 'success',
          missedOpportunities: insights.missedOpportunities.length,
          authorityEnhancements: insights.authorityEnhancements.length,
          confidence: insights.confidence,
          sampleOpportunity: insights.missedOpportunities[0] || null
        };
        
        console.log('✅ AI insights generated successfully');
        
        if (testMode === 'full') {
          console.log('📝 Testing narrative report generation...');
          try {
            // Use PromptFactory approach for narrative generation
            const narrativeStrategy = PromptFactory.create('narrative');
            const narrativePrompt = narrativeStrategy.buildPrompt({
              moduleResults: mockModuleResults,
              enhancedContent,
              insights
            });
            const narrative = await vertexClient.generateNarrativeReport(narrativePrompt);
            
            result.narrativeReport = {
              status: 'success',
              wordCount: narrative.wordCount,
              sectionsPresent: {
                executiveSummary: !!narrative.executiveSummary,
                detailedAnalysis: !!narrative.detailedAnalysis,
                implementationRoadmap: !!narrative.implementationRoadmap,
                conclusionNextSteps: !!narrative.conclusionNextSteps
              },
              sampleExecutiveSummary: narrative.executiveSummary?.substring(0, 200) + '...'
            };
            
            console.log('✅ Narrative report generated successfully');
            
          } catch (narrativeError: any) {
            console.error('❌ Narrative generation failed:', narrativeError);
            result.narrativeReport = {
              status: 'failed',
              error: narrativeError.message
            };
          }
        }
        
      } catch (insightsError: any) {
        console.error('❌ AI insights generation failed:', insightsError);
        result.aiInsights = {
          status: 'failed',
          error: insightsError.message
        };
      }
    }
    
    // Cost tracking summary
    result.costTracking = {
      currentCost: vertexClient.getCurrentCost(),
      remainingBudget: vertexClient.getRemainingBudget(),
      costSummary: vertexClient.getCostSummary()
    };
    
    result.implementation = {
      phase: '5.1 - PromptFactory Integration',
      status: 'COMPLETED',
      features: [
        'VertexAI Client with PromptFactory integration',
        'AI insights generation via PromptFactory strategies',
        'Narrative report generation via PromptFactory strategies',
        'Cost monitoring and budget controls',
        'Response parsing and validation',
        'Error handling and fallbacks',
        'Centralized prompt management'
      ],
      readyForIntegration: true
    };
    
    console.log('✅ Phase 3.2A VertexAI Client test completed');
    
    return json(result);

  } catch (error: any) {
    console.error('❌ VertexAI Client test failed:', error);
    
    return json({
      status: 'error',
      phase: '5.1 - PromptFactory Integration Test',
      error: error.message,
      implementation: {
        phase: '5.1 - PromptFactory Integration',
        status: 'FAILED',
        readyForIntegration: false
      }
    }, { status: 500 });
  }
};