// src/routes/api/test/strategy-pattern/+server.ts
import { json } from '@sveltejs/kit';
import { testStrategyPattern, testBackwardsCompatibility } from '$lib/scan/strategies/test-strategy-pattern';

export async function GET() {
    try {
        console.log('🧪 Running Strategy Pattern tests...');
        
        // Test Strategy Pattern implementation
        const strategyTest = await testStrategyPattern();
        
        // Test backwards compatibility
        const compatibilityTest = await testBackwardsCompatibility();
        
        const overallSuccess = strategyTest.success && compatibilityTest.success;
        
        return json({
            success: overallSuccess,
            message: overallSuccess 
                ? '✅ All Strategy Pattern tests passed - Phase 0 refactoring successful!'
                : '❌ Some Strategy Pattern tests failed',
            tests: {
                strategyPattern: strategyTest,
                backwardsCompatibility: compatibilityTest
            },
            timestamp: new Date().toISOString(),
            phase: 'Phase 0: Strategy Pattern Refactoring'
        });
        
    } catch (error) {
        console.error('❌ Strategy Pattern test endpoint failed:', error);
        
        return json({
            success: false,
            message: 'Test endpoint failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}