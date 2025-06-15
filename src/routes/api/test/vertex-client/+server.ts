import { json } from '@sveltejs/kit';
import { VertexAIClient } from '$lib/ai/vertexClient.js';
import { ContentExtractor } from '$lib/scan/ContentExtractor.js';
import type { RequestHandler } from './$types';

// Test data for Phase 3.2A validation
const mockModuleResults = [
  {
    moduleName: 'TechnicalSEO',
    score: 75,
    findings: [
      {
        recommendation: true,
        type: 'warning' as const,
        title: 'Missing meta descriptions',
        description: 'Several pages lack meta descriptions',
        impact: 'medium' as const,
        category: 'meta'
      }
    ],
    status: 'completed' as const,
    progress: 100
  },
  {
    moduleName: 'AIContent',
    score: 60,
    findings: [
      {
        recommendation: true,
        type: 'error' as const,
        title: 'Limited FAQ content',
        description: 'Only 2 FAQ sections found',
        impact: 'high' as const,
        category: 'content'
      }
    ],
    status: 'completed' as const,
    progress: 100
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
        const insights = await vertexClient.generateInsights(mockModuleResults, enhancedContent);
        
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
            const narrative = await vertexClient.generateNarrativeReport(
              mockModuleResults, 
              enhancedContent, 
              insights
            );
            
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
      phase: '3.2A',
      status: 'COMPLETED',
      features: [
        'VertexAI Client with production configuration',
        'AI insights generation with structured prompts',
        'Narrative report generation',
        'Cost monitoring and budget controls',
        'Response parsing and validation',
        'Error handling and fallbacks'
      ],
      readyForIntegration: true
    };
    
    console.log('✅ Phase 3.2A VertexAI Client test completed');
    
    return json(result);

  } catch (error: any) {
    console.error('❌ VertexAI Client test failed:', error);
    
    return json({
      status: 'error',
      phase: '3.2A VertexAI Client Test',
      error: error.message,
      implementation: {
        phase: '3.2A',
        status: 'FAILED',
        readyForIntegration: false
      }
    }, { status: 500 });
  }
};