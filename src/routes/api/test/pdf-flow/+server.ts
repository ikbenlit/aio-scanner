import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const tier = url.searchParams.get('tier') || 'starter';
  const testUrl = url.searchParams.get('url') || 'https://example.com';
  const mockMode = url.searchParams.get('mock') === 'true';
  
  console.log(`🧪 Testing complete PDF flow for tier: ${tier}, URL: ${testUrl}`);
  
  if (!['starter', 'business', 'enterprise'].includes(tier)) {
    return json({
      success: false,
      error: 'Invalid tier. Use starter, business, or enterprise.',
      availableTiers: ['starter', 'business', 'enterprise']
    }, { status: 400 });
  }
  
  try {
    const orchestrator = new ScanOrchestrator();
    const scanId = crypto.randomUUID();
    const testEmail = 'test@example.com';
    const mockPaymentId = `pay_${Date.now()}`;
    
    console.log(`📋 Starting ${tier} tier scan with ID: ${scanId}`);
    
    if (mockMode) {
      // Mock mode - test without real scan execution
      return await testMockPDFFlow(tier, scanId, testUrl);
    }
    
    // Real scan execution (be careful with external URLs)
    const startTime = Date.now();
    
    const result = await orchestrator.executeTierScan(
      testUrl,
      tier as any,
      scanId,
      testEmail,
      mockPaymentId
    );
    
    const totalDuration = Date.now() - startTime;
    
    // Check if PDF was generated
    const hasPDF = 'pdfUrl' in result && result.pdfUrl;
    
    return json({
      success: true,
      testResults: {
        tier,
        scanId,
        url: testUrl,
        totalDuration: `${totalDuration}ms`,
        overallScore: result.overallScore,
        status: result.status,
        pdfGenerated: hasPDF,
        pdfUrl: hasPDF ? result.pdfUrl : null,
        moduleCount: result.moduleResults.length,
        hasAIContent: !!(result.aiInsights || result.narrativeReport),
        costTracking: result.costTracking
      },
      validation: {
        scanCompleted: result.status === 'completed',
        pdfAvailable: hasPDF,
        tierMatchesRequest: result.tier === tier,
        hasExpectedModules: result.moduleResults.length > 0,
        performance: {
          acceptable: totalDuration < 30000, // 30 seconds
          fast: totalDuration < 15000, // 15 seconds
          rating: totalDuration < 15000 ? 'Fast' : totalDuration < 30000 ? 'Acceptable' : 'Slow'
        }
      },
      message: `Complete PDF flow test ${hasPDF ? 'passed' : 'partially passed'} for ${tier} tier`
    });
    
  } catch (error) {
    console.error('PDF flow test failed:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      testDetails: {
        tier,
        testUrl,
        scanId: `pdf-test-${tier}-${Date.now()}`,
        phase: 'scan-execution'
      }
    }, { status: 500 });
  }
};

async function testMockPDFFlow(tier: string, scanId: string, testUrl: string) {
  const startTime = Date.now();
  
  // Simulate scan execution time based on tier
  const simulatedDuration = {
    starter: 2000,
    business: 5000,
    enterprise: 8000
  }[tier] || 2000;
  
  await new Promise(resolve => setTimeout(resolve, Math.random() * simulatedDuration));
  
  const mockResult = {
    scanId,
    url: testUrl,
    status: 'completed' as const,
    overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
    tier: tier as any,
    moduleResults: [
      { name: 'Technical SEO', score: 75, findings: [] },
      { name: 'Schema Markup', score: 80, findings: [] }
    ],
    pdfGenerated: tier !== 'basic',
    mockPdfUrl: tier !== 'basic' ? `https://storage.example.com/reports/${scanId}/${tier}-report.pdf` : null,
    aiContent: tier === 'business' || tier === 'enterprise',
    enterpriseFeatures: tier === 'enterprise'
  };
  
  const totalDuration = Date.now() - startTime;
  
  return json({
    success: true,
    mockMode: true,
    testResults: {
      ...mockResult,
      totalDuration: `${totalDuration}ms`,
      simulatedScanDuration: `${simulatedDuration}ms`
    },
    validation: {
      scanCompleted: true,
      pdfAvailable: mockResult.pdfGenerated,
      tierMatchesRequest: mockResult.tier === tier,
      hasExpectedModules: mockResult.moduleResults.length > 0,
      performance: {
        acceptable: totalDuration < 10000,
        fast: totalDuration < 5000,
        rating: totalDuration < 5000 ? 'Fast' : 'Acceptable'
      }
    },
    features: {
      basicScan: true,
      pdfGeneration: tier !== 'basic',
      aiContent: tier === 'business' || tier === 'enterprise',
      enterpriseFeatures: tier === 'enterprise'
    },
    message: `Mock PDF flow test completed successfully for ${tier} tier`
  });
}