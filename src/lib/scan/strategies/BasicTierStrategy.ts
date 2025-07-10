// src/lib/scan/strategies/BasicTierStrategy.ts
import { BaseTierStrategy, type ScanDependencies, type ScanContext } from './TierScanStrategy';
import type { EngineScanResult } from '../../types/scan';
import type { ScanTier } from '../../types/database';

/**
 * Basic tier strategy - free tier with core modules only
 * Executes TechnicalSEO + SchemaMarkup modules
 */
export class BasicTierStrategy extends BaseTierStrategy {
    protected tier: ScanTier = 'basic';
    
    getEstimatedDuration(): number {
        return 15000; // 15 seconds for basic scan
    }
    
    async execute(
        url: string,
        scanId: string,
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult> {
        console.log(`🔍 Starting basic scan for ${url} (${scanId})`);
        
        const { modules, sharedContentService } = dependencies;
        
        // Fetch shared content once for all modules
        const sharedContent = await sharedContentService.fetchSharedContent(url);
        
        // Execute core modules in parallel (TechnicalSEO + SchemaMarkup)
        const moduleResults = await Promise.all(
            modules.slice(0, 2).map(module => module.execute(url, sharedContent.html, sharedContent.$))
        );
        
        // Update progress if callback provided
        if (context?.progressCallback) {
            context.progressCallback(100);
        }
        
        // Create basic scan result
        const baseResult = this.createBaseScanResult(scanId, url, moduleResults, 'basic');
        
        return {
            ...baseResult,
            tier: 'basic'
        };
    }
}