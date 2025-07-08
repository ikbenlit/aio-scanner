// src/lib/scan/strategies/TierStrategyFactory.ts
import type { TierScanStrategy } from './TierScanStrategy';
import type { ScanTier } from '../../types/database';
import { BasicTierStrategy } from './BasicTierStrategy';
import { StarterTierStrategy } from './StarterTierStrategy';
import { BusinessTierStrategy } from './BusinessTierStrategy';
import { EnterpriseTierStrategy } from './EnterpriseTierStrategy';

/**
 * Factory for creating tier-specific scan strategies
 * Provides clean instantiation and strategy selection
 */
export class TierStrategyFactory {
    private static strategies = new Map<ScanTier, () => TierScanStrategy>([
        ['basic', () => new BasicTierStrategy()],
        ['starter', () => new StarterTierStrategy()],
        ['business', () => new BusinessTierStrategy()],
        ['enterprise', () => new EnterpriseTierStrategy()]
    ]);
    
    /**
     * Create strategy for the specified tier
     * @param tier - The scan tier to create strategy for
     * @returns Strategy instance for the tier
     * @throws Error if tier is not supported
     */
    static createStrategy(tier: ScanTier): TierScanStrategy {
        const strategyFactory = this.strategies.get(tier);
        
        if (!strategyFactory) {
            throw new Error(`Niet-ondersteunde tier: ${tier}`);
        }
        
        return strategyFactory();
    }
    
    /**
     * Get all supported tiers
     * @returns Array of supported tier names
     */
    static getSupportedTiers(): ScanTier[] {
        return Array.from(this.strategies.keys());
    }
    
    /**
     * Check if a tier is supported
     * @param tier - Tier to check
     * @returns True if tier is supported
     */
    static isSupported(tier: string): tier is ScanTier {
        return this.strategies.has(tier as ScanTier);
    }
    
    /**
     * Get estimated duration for a tier
     * @param tier - Tier to get duration for
     * @returns Estimated duration in milliseconds
     */
    static getEstimatedDuration(tier: ScanTier): number {
        const strategy = this.createStrategy(tier);
        return strategy.getEstimatedDuration();
    }
}