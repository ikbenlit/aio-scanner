import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  const testUrl = url.searchParams.get('url') || 'https://example.com';
  const moduleFilter = url.searchParams.get('module');
  
  console.log('🚀 Starting AIO-Scanner test...\n');
  
  try {
    const orchestrator = new ScanOrchestrator();
    const availableModules = orchestrator.getAvailableModules();
    
    console.log(`📊 Available modules: ${availableModules.join(', ')}`);
    
    // Test specific module or run full scan
    if (moduleFilter && availableModules.includes(moduleFilter)) {
      console.log(`🧪 Testing individual module: ${moduleFilter}`);
      
      const startTime = Date.now();
      const result = await orchestrator.testModule(moduleFilter, testUrl);
      const duration = Date.now() - startTime;
      
      if (result) {
        return json({
          success: true,
          type: 'module_test',
          module: moduleFilter,
          url: testUrl,
          duration,
          result: {
            score: result.score,
            status: result.status,
            findings: result.findings.length,
            recommendations: result.recommendations.length,
            details: result
          }
        });
      } else {
        return json({
          success: false,
          error: `Module ${moduleFilter} not found`
        }, { status: 404 });
      }
      
    } else {
      // Run full scan test
      console.log(`🔍 Testing full scan for: ${testUrl}`);
      
      const startTime = Date.now();
      const result = await orchestrator.executeScan(testUrl, `test-${Date.now()}`);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Scan completed in ${duration}ms`);
      console.log(`📊 Overall Score: ${result.overallScore}/100`);
      
      return json({
        success: true,
        type: 'full_scan',
        url: testUrl,
        duration,
        availableModules,
        result: {
          overallScore: result.overallScore,
          moduleCount: result.moduleResults.length,
          completedModules: result.moduleResults.filter(m => m.status === 'completed').length,
          totalFindings: result.moduleResults.reduce((sum, m) => sum + m.findings.length, 0),
          totalRecommendations: result.moduleResults.reduce((sum, m) => sum + m.recommendations.length, 0),
          moduleResults: result.moduleResults.map(module => ({
            name: module.moduleName,
            score: module.score,
            status: module.status,
            findings: module.findings.length,
            recommendations: module.recommendations.length,
            topFindings: module.findings.slice(0, 3).map(f => ({
              type: f.type,
              title: f.title,
              description: f.description,
              impact: f.impact
            }))
          })),
          details: result
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}; 