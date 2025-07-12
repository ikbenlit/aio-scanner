// src/lib/scan/strategies/TierScanStrategy.ts
import type { EngineScanResult, ScanModule } from '../../types/scan';
import type { ScanTier } from '../../types/database';
import type { AIReportGenerator } from '../AIReportGenerator';
import type { ContentExtractor } from '../ContentExtractor';
import type { LLMEnhancementService } from '../LLMEnhancementService';
import type { TierAwarePDFGenerator } from '../../pdf/generator';
import type { SharedContentService } from '../SharedContentService';

/**
 * Interface for tier-specific scan strategies
 * Each tier has its own implementation strategy for scan execution
 */
export interface TierScanStrategy {
    /**
     * Execute scan for this specific tier
     * @param url - URL to scan
     * @param scanId - Unique scan identifier  
     * @param dependencies - Injected services and modules
     * @param context - Optional execution context
     * @returns Promise with scan result for this tier
     */
    execute(
        url: string, 
        scanId: string, 
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult>;
    
    /**
     * Get the tier this strategy handles
     */
    getTier(): ScanTier;
    
    /**
     * Get expected execution time for this tier (for progress estimation)
     */
    getEstimatedDuration(): number; // in milliseconds
    
    /**
     * Check if this tier supports site-wide crawling
     */
    supportsCrawling?(): boolean;
    
    /**
     * Get crawling limits for this tier (if supported)
     */
    getCrawlLimits?(): {
        maxPages: number;
        maxDepth: number;
        respectRobotsTxt: boolean;
        includeSubdomains?: boolean;
    };
}

/**
 * Dependencies shared across all tier strategies
 * Injected by the orchestrator to avoid tight coupling
 */
export interface ScanDependencies {
    modules: ScanModule[];
    aiReportGenerator: AIReportGenerator;
    contentExtractor: ContentExtractor;
    llmEnhancementService: LLMEnhancementService;
    pdfGenerator: TierAwarePDFGenerator;
    sharedContentService: SharedContentService;
}

/**
 * Strategy execution context
 * Additional context that may be needed during execution
 */
export interface ScanContext {
    email?: string;
    paymentId?: string;
    startTime?: number;
    progressCallback?: (progress: number) => void;
}

/**
 * Base class for tier strategies with common functionality
 */
export abstract class BaseTierStrategy implements TierScanStrategy {
    protected abstract tier: ScanTier;
    
    abstract execute(
        url: string, 
        scanId: string, 
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult>;
    
    getTier(): ScanTier {
        return this.tier;
    }
    
    abstract getEstimatedDuration(): number;
    
    /**
     * Default implementation: most tiers don't support crawling
     */
    supportsCrawling(): boolean {
        return false;
    }
    
    /**
     * Default implementation: return null for non-crawling tiers
     */
    getCrawlLimits() {
        return null;
    }
    
    /**
     * Common helper: Calculate overall score from module results
     */
    protected calculateOverallScore(moduleResults: any[]): number {
        if (moduleResults.length === 0) return 0;
        return Math.round(
            moduleResults.reduce((sum: number, result: any) => sum + result.score, 0) / moduleResults.length
        );
    }
    
    /**
     * Common helper: Create base scan result
     */
    protected createBaseScanResult(
        scanId: string, 
        url: string, 
        moduleResults: any[], 
        tier: ScanTier
    ): Omit<EngineScanResult, 'tier'> {
        return {
            scanId,
            url,
            status: 'completed',
            createdAt: new Date().toISOString(),
            overallScore: this.calculateOverallScore(moduleResults),
            moduleResults,
            completedAt: new Date().toISOString()
        };
    }
    
    /**
     * Common helper: Get tier pricing
     */
    protected getTierPrice(tier: ScanTier): number {
        const prices = {
            'basic': 0,
            'starter': 19.95,
            'business': 49.95,
            'enterprise': 149.95
        } as const;
        
        return prices[tier];
    }
}