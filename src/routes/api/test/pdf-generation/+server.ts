import { json } from '@sveltejs/kit';
import { TierAwarePDFGenerator } from '$lib/pdf/generator';
import type { EngineScanResult, NarrativeReport } from '$lib/types/scan';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const tier = url.searchParams.get('tier') || 'starter';
  const test = url.searchParams.get('test') || 'basic';
  const download = url.searchParams.get('download') === 'true';
  
  console.log(`🧪 Testing PDF generation for tier: ${tier}, test: ${test}, download: ${download}`);
  
  try {
    const pdfGenerator = new TierAwarePDFGenerator();
    
    // Create mock scan result
    const mockScanResult: EngineScanResult = createMockScanResult(tier as any);
    
    // Create mock narrative for business/enterprise tiers
    const mockNarrative = (tier === 'business' || tier === 'enterprise') ? createMockNarrative(tier) : undefined;
    
    // Handle download request separately
    if (download) {
      return await downloadPDF(pdfGenerator, mockScanResult, tier as any, mockNarrative);
    }
    
    switch (test) {
      case 'generate':
        return await testPDFGeneration(pdfGenerator, mockScanResult, tier as any, mockNarrative);
        
      case 'validate':
        return await validatePDFContent(pdfGenerator, mockScanResult, tier as any, mockNarrative);
        
      case 'performance':
        return await testPDFPerformance(pdfGenerator, mockScanResult, tier as any, mockNarrative);
        
      case 'error-handling':
        return await testErrorHandling(pdfGenerator, tier as any);
        
      default:
        return await testPDFGeneration(pdfGenerator, mockScanResult, tier as any, mockNarrative);
    }
    
  } catch (error) {
    console.error('PDF test failed:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
};

async function testPDFGeneration(
  generator: TierAwarePDFGenerator, 
  scanResult: EngineScanResult, 
  tier: any, 
  narrative?: NarrativeReport
) {
  const startTime = Date.now();
  
  try {
    const pdfBuffer = await generator.generatePDF(scanResult, tier, narrative);
    const duration = Date.now() - startTime;
    
    return json({
      success: true,
      tier,
      fileSize: pdfBuffer.length,
      generationTime: `${duration}ms`,
      fileSizeHuman: `${(pdfBuffer.length / 1024).toFixed(1)} KB`,
      message: `PDF generated successfully for ${tier} tier`,
      contentPreview: {
        hasNarrative: !!narrative,
        wordCount: narrative?.wordCount || 0,
        sections: narrative ? ['executiveSummary', 'detailedAnalysis', 'implementationRoadmap', 'conclusionNextSteps'] : ['basic scan results']
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      tier,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `PDF generation failed for ${tier} tier`
    }, { status: 500 });
  }
}

async function validatePDFContent(
  generator: TierAwarePDFGenerator, 
  scanResult: EngineScanResult, 
  tier: any, 
  narrative?: NarrativeReport
) {
  try {
    const pdfBuffer = await generator.generatePDF(scanResult, tier, narrative);
    
    // Basic PDF validation
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    const isValidPDF = pdfHeader === '%PDF';
    
    const validation = {
      isValidPDF,
      fileSize: pdfBuffer.length,
      hasContent: pdfBuffer.length > 1000, // Minimum reasonable size
      tier,
      expectedFeatures: getExpectedFeatures(tier),
      checks: {
        pdfHeader: isValidPDF,
        minFileSize: pdfBuffer.length > 1000,
        maxFileSize: pdfBuffer.length < 10 * 1024 * 1024, // 10MB max
        hasNarrativeContent: tier === 'business' || tier === 'enterprise' ? !!narrative : 'N/A'
      }
    };
    
    const allChecksPass = Object.values(validation.checks).every(check => check === true || check === 'N/A');
    
    return json({
      success: allChecksPass,
      validation,
      message: allChecksPass ? 'PDF validation passed' : 'PDF validation failed'
    });
    
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'PDF validation failed'
    }, { status: 500 });
  }
}

async function testPDFPerformance(
  generator: TierAwarePDFGenerator, 
  scanResult: EngineScanResult, 
  tier: any, 
  narrative?: NarrativeReport
) {
  const iterations = 3;
  const times: number[] = [];
  const sizes: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    const pdfBuffer = await generator.generatePDF(scanResult, tier, narrative);
    const duration = Date.now() - startTime;
    
    times.push(duration);
    sizes.push(pdfBuffer.length);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  
  return json({
    success: true,
    performance: {
      tier,
      iterations,
      averageTime: `${avgTime.toFixed(1)}ms`,
      minTime: `${Math.min(...times)}ms`,
      maxTime: `${Math.max(...times)}ms`,
      averageSize: `${(avgSize / 1024).toFixed(1)} KB`,
      consistency: Math.max(...sizes) - Math.min(...sizes) < 1024 ? 'Good' : 'Variable'
    },
    benchmark: {
      acceptable: avgTime < 5000, // 5 seconds
      fast: avgTime < 2000, // 2 seconds
      rating: avgTime < 2000 ? 'Fast' : avgTime < 5000 ? 'Acceptable' : 'Slow'
    }
  });
}

async function testErrorHandling(generator: TierAwarePDFGenerator, tier: any) {
  const tests = [
    {
      name: 'Basic tier restriction',
      test: async () => {
        try {
          await generator.generatePDF(createMockScanResult('basic'), 'basic');
          return { success: false, error: 'Should have thrown error for basic tier' };
        } catch (error) {
          return { 
            success: error instanceof Error && error.message.includes('not available for basic tier'),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Missing AI content for business tier',
      test: async () => {
        try {
          await generator.generatePDF(createMockScanResult('business'), 'business');
          return { success: false, error: 'Should have thrown error for missing AI content' };
        } catch (error) {
          return { 
            success: error instanceof Error && error.message.includes('AI content required'),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Invalid tier handling',
      test: async () => {
        try {
          await generator.generatePDF(createMockScanResult('starter'), 'invalid' as any);
          return { success: false, error: 'Should have thrown error for invalid tier' };
        } catch (error) {
          return { 
            success: error instanceof Error && error.message.includes('Unsupported tier'),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await test.test();
    results.push({
      name: test.name,
      ...result
    });
  }
  
  const allPassed = results.every(r => r.success);
  
  return json({
    success: allPassed,
    errorHandling: {
      totalTests: tests.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    },
    message: allPassed ? 'All error handling tests passed' : 'Some error handling tests failed'
  });
}

async function downloadPDF(
  generator: TierAwarePDFGenerator,
  scanResult: EngineScanResult,
  tier: any,
  narrative?: NarrativeReport
) {
  try {
    const pdfBuffer = await generator.generatePDF(scanResult, tier, narrative);
    const filename = `AIO_Scanner_Report_${tier}_${new URL(scanResult.url).hostname}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `PDF download failed for ${tier} tier`
    }, { status: 500 });
  }
}

function createMockScanResult(tier: string): EngineScanResult {
  return {
    scanId: `test-${tier}-${Date.now()}`,
    url: 'https://example.com',
    status: 'completed',
    overallScore: 75,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    tier: tier as any,
    moduleResults: [
      {
        name: 'Technical SEO',
        score: 80,
        findings: [
          {
            title: 'Test Finding',
            description: 'This is a test finding for PDF generation',
            priority: 'medium',
            recommendation: 'Test recommendation for improvement'
          }
        ]
      },
      {
        name: 'Schema Markup',
        score: 70,
        findings: [
          {
            title: 'Schema Test',
            description: 'Schema markup test finding',
            priority: 'high',
            recommendation: 'Add structured data markup'
          }
        ]
      }
    ]
  };
}

function createMockNarrative(tier: string): NarrativeReport {
  const baseContent = {
    executiveSummary: `Test executive summary for ${tier} tier. This demonstrates AI-generated content with proper formatting and professional tone. The analysis shows significant opportunities for improvement.`,
    detailedAnalysis: `Detailed analysis section for ${tier} tier testing.\n\nThis section includes multiple paragraphs with proper formatting:\n\n1. Technical SEO opportunities\n2. Content enhancement possibilities\n3. Authority signal improvements\n\nEach section provides actionable insights based on the scan results.`,
    implementationRoadmap: `Implementation roadmap for ${tier} tier:\n\n1. Phase 1: Technical fixes (Week 1-2)\n   - Fix robots.txt\n   - Improve meta descriptions\n\n2. Phase 2: Content optimization (Week 3-4)\n   - Enhance authority signals\n   - Improve content structure\n\n3. Phase 3: Advanced optimization (Week 5-6)\n   - Schema markup implementation\n   - Advanced AI optimization`,
    conclusionNextSteps: `Next steps for ${tier} tier implementation: Start with technical fixes, then move to content optimization. Expected timeline is 6 weeks with significant ROI within 3 months.`,
    generatedAt: new Date().toISOString(),
    wordCount: 250
  };
  
  if (tier === 'enterprise') {
    return {
      ...baseContent,
      strategicRoadmap: 'Strategic roadmap for enterprise implementation with competitive positioning and market analysis.',
      competitivePositioning: 'Enterprise competitive analysis shows opportunities for market leadership through AI optimization.',
      keyMetrics: {
        estimatedROI: '25-35% within 6 months',
        implementationTimeframe: '3-6 months',
        priorityActions: ['Multi-page optimization', 'Competitive analysis', 'Strategic positioning']
      }
    };
  }
  
  return baseContent;
}

function getExpectedFeatures(tier: string) {
  const features = {
    basic: [],
    starter: ['Pattern-based recommendations', 'Basic findings', 'Score visualization'],
    business: ['AI narrative content', 'Executive summary', 'Implementation roadmap', 'Detailed analysis'],
    enterprise: ['Enhanced insights', 'Strategic roadmap', 'Competitive positioning', 'Key metrics']
  };
  
  return features[tier as keyof typeof features] || [];
}