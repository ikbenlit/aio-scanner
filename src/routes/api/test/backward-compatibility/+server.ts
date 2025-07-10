import { json, type RequestHandler } from '@sveltejs/kit';
import { TechnicalSEOModule } from '$lib/scan/modules/TechnicalSEOModule';
import { AIContentModule } from '$lib/scan/modules/AIContentModule';
import { AICitationModule } from '$lib/scan/modules/AICitationModule';
import { SharedContentService } from '$lib/scan/SharedContentService';

export const GET: RequestHandler = async () => {
    try {
        console.log('🧪 Testing Backward Compatibility - Fase 2.3');
        
        const testUrl = 'https://example.com';
        const results: any = {
            phase: '2.3',
            title: 'Backward Compatibility Testing',
            tests: {}
        };

        // Test 1: Modules without shared content (legacy mode)
        console.log('📦 Test 1: Legacy module execution without shared content...');
        const technicalSEO = new TechnicalSEOModule();
        const aiContent = new AIContentModule();
        const aiCitation = new AICitationModule();

        const legacyResults = await Promise.all([
            technicalSEO.execute(testUrl), // No html/$ parameters
            aiContent.execute(testUrl),    // No html/$ parameters 
            aiCitation.execute(testUrl)    // No html/$ parameters
        ]);

        results.tests.legacyMode = {
            success: legacyResults.every(r => r.score >= 0 && r.findings.length > 0),
            modules: legacyResults.map(r => ({
                name: r.name,
                score: r.score,
                findingsCount: r.findings.length,
                hasError: r.findings.some(f => f.category === 'system')
            }))
        };

        // Test 2: Modules with shared content (new mode)
        console.log('🚀 Test 2: New mode with shared content...');
        const sharedContentService = new SharedContentService();
        const sharedContent = await sharedContentService.fetchSharedContent(testUrl);

        const sharedResults = await Promise.all([
            technicalSEO.execute(testUrl, sharedContent.html, sharedContent.$),
            aiContent.execute(testUrl, sharedContent.html, sharedContent.$),
            aiCitation.execute(testUrl, sharedContent.html, sharedContent.$)
        ]);

        results.tests.sharedMode = {
            success: sharedResults.every(r => r.score >= 0 && r.findings.length > 0),
            modules: sharedResults.map(r => ({
                name: r.name,
                score: r.score,
                findingsCount: r.findings.length,
                hasError: r.findings.some(f => f.category === 'system')
            }))
        };

        // Test 3: Mixed mode (some with shared content, some without)
        console.log('🔀 Test 3: Mixed mode execution...');
        const mixedResults = await Promise.all([
            technicalSEO.execute(testUrl), // Legacy mode
            aiContent.execute(testUrl, sharedContent.html, sharedContent.$), // Shared mode
            aiCitation.execute(testUrl) // Legacy mode
        ]);

        results.tests.mixedMode = {
            success: mixedResults.every(r => r.score >= 0 && r.findings.length > 0),
            modules: mixedResults.map(r => ({
                name: r.name,
                score: r.score,
                findingsCount: r.findings.length,
                hasError: r.findings.some(f => f.category === 'system')
            }))
        };

        // Test 4: Performance comparison
        console.log('⚡ Test 4: Performance comparison...');
        const startLegacy = Date.now();
        await Promise.all([
            technicalSEO.execute(testUrl),
            aiContent.execute(testUrl),
            aiCitation.execute(testUrl)
        ]);
        const legacyTime = Date.now() - startLegacy;

        const startShared = Date.now();
        const sharedContent2 = await sharedContentService.fetchSharedContent(testUrl);
        await Promise.all([
            technicalSEO.execute(testUrl, sharedContent2.html, sharedContent2.$),
            aiContent.execute(testUrl, sharedContent2.html, sharedContent2.$),
            aiCitation.execute(testUrl, sharedContent2.html, sharedContent2.$)
        ]);
        const sharedTime = Date.now() - startShared;

        results.tests.performance = {
            legacyTime: legacyTime,
            sharedTime: sharedTime,
            improvement: Math.round(((legacyTime - sharedTime) / legacyTime) * 100),
            httpRequests: {
                legacy: 3, // Each module fetches individually
                shared: 1  // Single fetch via SharedContentService
            }
        };

        // Overall validation
        const allTestsPassed = Object.values(results.tests).every((test: any) => 
            test.success !== false
        );

        results.success = allTestsPassed;
        results.message = allTestsPassed 
            ? '✅ All backward compatibility tests passed - Fase 2.3 successful!'
            : '❌ Some backward compatibility tests failed';

        results.timestamp = new Date().toISOString();
        
        console.log(`🎯 Backward compatibility validation: ${results.success ? 'PASSED' : 'FAILED'}`);
        
        return json(results);

    } catch (error) {
        console.error('❌ Backward compatibility test error:', error);
        
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            phase: '2.3',
            title: 'Backward Compatibility Testing',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
};