// src/lib/scan/strategies/StarterTierStrategy.ts
import { BaseTierStrategy, type ScanDependencies, type ScanContext } from './TierScanStrategy';
import type { EngineScanResult } from '../../types/scan';
import type { ScanTier } from '../../types/database';

/**
 * Starter tier strategy - includes AI report generation
 * Executes Basic modules + AIContent + AICitation + AI report
 */
export class StarterTierStrategy extends BaseTierStrategy {
    protected tier: ScanTier = 'starter';
    
    getEstimatedDuration(): number {
        return 45000; // 45 seconds for starter scan
    }
    
    async execute(
        url: string,
        scanId: string,
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult> {
        console.log(`🔍 Starting starter scan for ${url} (${scanId})`);
        
        const { modules, aiReportGenerator, pdfGenerator, sharedContentService } = dependencies;
        
        // Fetch shared content once for all modules
        const sharedContent = await sharedContentService.fetchSharedContent(url);
        
        // Execute basic modules first (TechnicalSEO + SchemaMarkup)
        const basicResults = await Promise.all(
            modules.slice(0, 2).map(module => module.execute(url, sharedContent.html, sharedContent.$))
        );
        
        if (context?.progressCallback) {
            context.progressCallback(40);
        }
        
        // Execute additional starter modules (AIContent + AICitation)
        const additionalResults = await Promise.all(
            modules.slice(2, 4).map(module => module.execute(url, sharedContent.html, sharedContent.$))
        );
        
        if (context?.progressCallback) {
            context.progressCallback(70);
        }
        
        const allResults = [...basicResults, ...additionalResults];
        
        // Create base result
        const baseResult = this.createBaseScanResult(scanId, url, allResults, 'starter');
        
        // Generate AI report
        const aiReport = await aiReportGenerator.generateReport({
            ...baseResult,
            moduleResults: allResults,
            tier: 'starter'
        });
        
        if (context?.progressCallback) {
            context.progressCallback(90);
        }
        
        const starterResult: EngineScanResult = {
            ...baseResult,
            moduleResults: allResults,
            aiReport,
            tier: 'starter'
        };
        
        // Generate PDF for starter tier
        let pdfUrl: string | null = null;
        try {
            pdfUrl = await this.generateAndStorePDF(starterResult, pdfGenerator);
        } catch (error) {
            console.warn('PDF generation failed for starter tier:', error);
            // Don't fail the entire scan if PDF generation fails
        }
        
        if (context?.progressCallback) {
            context.progressCallback(100);
        }
        
        return {
            ...starterResult,
            pdfUrl
        };
    }
    
    /**
     * Generate and store PDF for paid tiers
     */
    private async generateAndStorePDF(
        scanResult: EngineScanResult,
        pdfGenerator: any
    ): Promise<string | null> {
        try {
            const pdfBuffer = await pdfGenerator.generatePDF(
                scanResult, 
                scanResult.tier, 
                undefined // No narrative for starter
            );
            
            // Store in Supabase Storage (simplified for now)
            // TODO: Implement actual storage logic
            console.log('PDF generated for starter tier');
            return `pdf-url-${scanResult.scanId}`;
        } catch (error) {
            console.error('PDF generation failed:', error);
            return null;
        }
    }
}