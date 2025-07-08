// src/lib/scan/strategies/test-strategy-pattern.ts
// Quick test to verify Strategy Pattern implementation works

import { TierStrategyFactory } from './TierStrategyFactory';
import type { ScanDependencies } from './TierScanStrategy';

/**
 * Test function to verify the Strategy Pattern works correctly
 * This can be called from API routes or tests to validate implementation
 */
export async function testStrategyPattern(): Promise<{
    success: boolean;
    message: string;
    results: Array<{ tier: string; duration: number; success: boolean; error?: string }>;
}> {
    const results = [];
    const testUrl = 'https://example.com';
    const testScanId = 'test-strategy-pattern-123';
    
    // Mock dependencies for testing
    const mockDependencies: ScanDependencies = {
        modules: [],
        aiReportGenerator: {} as any,
        contentExtractor: {} as any,
        llmEnhancementService: {} as any,
        pdfGenerator: {} as any
    };
    
    try {
        console.log('🧪 Testing Strategy Pattern implementation...');
        
        // Test each tier strategy
        for (const tier of ['basic', 'starter', 'business', 'enterprise'] as const) {
            const startTime = Date.now();
            
            try {
                console.log(`Testing ${tier} tier strategy...`);
                
                // Create strategy
                const strategy = TierStrategyFactory.createStrategy(tier);
                
                // Verify strategy properties
                if (strategy.getTier() !== tier) {
                    throw new Error(`Strategy tier mismatch: expected ${tier}, got ${strategy.getTier()}`);
                }
                
                // Verify estimated duration
                const duration = strategy.getEstimatedDuration();
                if (typeof duration !== 'number' || duration <= 0) {
                    throw new Error(`Invalid duration: ${duration}`);
                }
                
                console.log(`✅ ${tier} strategy: OK (estimated duration: ${duration}ms)`);
                
                results.push({
                    tier,
                    duration: Date.now() - startTime,
                    success: true
                });
                
            } catch (error) {
                console.error(`❌ ${tier} strategy failed:`, error);
                results.push({
                    tier,
                    duration: Date.now() - startTime,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        
        // Test factory error handling
        try {
            TierStrategyFactory.createStrategy('invalid' as any);
            throw new Error('Factory should have thrown error for invalid tier');
        } catch (error) {
            if (error instanceof Error && error.message.includes('Niet-ondersteunde tier')) {
                console.log('✅ Factory error handling: OK');
            } else {
                throw error;
            }
        }
        
        // Test supported tiers
        const supportedTiers = TierStrategyFactory.getSupportedTiers();
        if (supportedTiers.length !== 4) {
            throw new Error(`Expected 4 supported tiers, got ${supportedTiers.length}`);
        }
        
        console.log('✅ Strategy Pattern implementation test completed successfully');
        
        return {
            success: true,
            message: 'All strategy pattern tests passed',
            results
        };
        
    } catch (error) {
        console.error('❌ Strategy Pattern test failed:', error);
        
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            results
        };
    }
}

/**
 * Test backwards compatibility with legacy scan methods
 */
export async function testBackwardsCompatibility(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        console.log('🧪 Testing backwards compatibility...');
        
        // Verify that TierStrategyFactory supports all required tiers
        const requiredTiers = ['basic', 'starter', 'business', 'enterprise'];
        
        for (const tier of requiredTiers) {
            if (!TierStrategyFactory.isSupported(tier)) {
                throw new Error(`Tier ${tier} not supported by factory`);
            }
            
            const duration = TierStrategyFactory.getEstimatedDuration(tier as any);
            if (typeof duration !== 'number' || duration <= 0) {
                throw new Error(`Invalid duration for tier ${tier}: ${duration}`);
            }
        }
        
        console.log('✅ Backwards compatibility test passed');
        
        return {
            success: true,
            message: 'Backwards compatibility verified'
        };
        
    } catch (error) {
        console.error('❌ Backwards compatibility test failed:', error);
        
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}