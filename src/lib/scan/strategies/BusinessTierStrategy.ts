// src/lib/scan/strategies/BusinessTierStrategy.ts
import { BaseTierStrategy, type ScanDependencies, type ScanContext } from './TierScanStrategy';
import type { EngineScanResult } from '../../types/scan';
import type { ScanTier } from '../../types/database';

/**
 * Business tier strategy - includes AI enhancement and full analysis
 * Executes all 6 modules + LLM enhancement + comprehensive AI report
 */
export class BusinessTierStrategy extends BaseTierStrategy {
    protected tier: ScanTier = 'business';
    
    getEstimatedDuration(): number {
        return 90000; // 90 seconds for business scan
    }
    
    async execute(
        url: string,
        scanId: string,
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult> {
        console.log('🚀 Starting business tier AI-enhanced scan for', url);
        const scanStartTime = context?.startTime || Date.now();
        
        const { modules, contentExtractor, llmEnhancementService, pdfGenerator, sharedContentService } = dependencies;
        
        try {
            // 1. Fetch shared content once for all modules using Playwright for Business+ tiers
            console.log('📊 Extracting enhanced content...');
            const sharedContent = await sharedContentService.fetchSharedContent(url, 'playwright');
            const enhancedContent = await contentExtractor.extractEnhancedContent(sharedContent.html);
            
            // Extract page title from shared content
            const pageTitle = sharedContent.$('title').text() || 'Titel niet gevonden';
            
            if (context?.progressCallback) {
                context.progressCallback(20);
            }
            
            // 2. Run all 6 pattern modules in parallel with shared content
            console.log('🔧 Running pattern analysis modules...');
            const moduleResults = await Promise.all(
                modules.map(module => module.execute(url, sharedContent.html, sharedContent.$))
            );
            
            if (context?.progressCallback) {
                context.progressCallback(50);
            }
            
            // 3. LLM enhancement layer
            console.log('🧠 Enhancing findings with AI...');
            const { insights, narrative } = await llmEnhancementService.enhanceFindings(
                moduleResults,
                enhancedContent,
                url
            );
            
            if (context?.progressCallback) {
                context.progressCallback(70);
            }
            
            // 4. Calculate hybrid score
            const patternScore = Math.round(
                moduleResults.reduce((sum, result) => sum + result.score, 0) / moduleResults.length
            );
            
            // Combine pattern score with AI confidence (weighted average)
            const hybridScore = Math.round((patternScore * 0.7) + (insights.confidence * 0.3));
            
            // 5. Generate enhanced AI report for business tier
            console.log('📝 Generating enhanced AI report...');
            const enhancedAIReport = await this.generateBusinessAIReport(
                moduleResults, 
                insights, 
                narrative, 
                patternScore
            );
            
            if (context?.progressCallback) {
                context.progressCallback(85);
            }
            
            // 6. Calculate cost tracking
            const costTracking = {
                aiCost: this.estimateAICost(insights, narrative),
                scanDuration: Date.now() - scanStartTime
            };
            
            console.log(`✅ Business scan completed in ${costTracking.scanDuration}ms`);
            console.log(`💰 Estimated AI cost: €${costTracking.aiCost.toFixed(4)}`);
            
            const businessResult: EngineScanResult = {
                scanId,
                url,
                pageTitle,
                status: 'completed',
                createdAt: new Date().toISOString(),
                overallScore: hybridScore,
                moduleResults,
                completedAt: new Date().toISOString(),
                tier: 'business',
                aiReport: enhancedAIReport,
                aiInsights: insights,
                narrativeReport: narrative,
                costTracking
            };
            
            // Generate PDF for business tier
            let pdfUrl: string | null = null;
            try {
                pdfUrl = await this.generateAndStorePDF(businessResult, pdfGenerator, narrative);
            } catch (error) {
                console.warn('PDF generation failed for business tier:', error);
            }
            
            if (context?.progressCallback) {
                context.progressCallback(100);
            }
            
            return {
                ...businessResult,
                pdfUrl
            };
            
        } catch (error: unknown) {
            console.error('❌ Business scan failed:', error);
            console.log('⬇️ Falling back to starter tier...');
            
            // Graceful degradation to starter tier
            const { StarterTierStrategy } = await import('./StarterTierStrategy');
            const starterStrategy = new StarterTierStrategy();
            const fallbackResult = await starterStrategy.execute(url, scanId, dependencies, context);
            
            // Mark as business tier but with fallback data
            return {
                ...fallbackResult,
                tier: 'business',
                error: `AI enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback to pattern-based analysis.`,
                costTracking: {
                    aiCost: 0,
                    scanDuration: Date.now() - scanStartTime
                }
            };
        }
    }
    
    /**
     * Generate enhanced AI report for business tier
     * Combines pattern-based analysis with AI insights
     */
    private async generateBusinessAIReport(
        moduleResults: any[],
        insights: any,
        narrative: any,
        patternScore: number
    ) {
        // Convert AI insights to AIReport format
        const recommendations = insights.missedOpportunities.map((opp: any) => ({
            title: opp.title,
            description: opp.description,
            priority: opp.impactScore >= 8 ? 'high' as const : 
                     opp.impactScore >= 6 ? 'medium' as const : 'low' as const,
            recommendation: opp.solution,
            impact: `Impact: ${opp.impactScore}/10`,
            category: opp.category,
            estimatedTime: opp.timeEstimate || 'Niet gespecificeerd'
        }));
        
        // Add authority enhancements as recommendations
        insights.authorityEnhancements.forEach((auth: any) => {
            recommendations.push({
                title: `Versterk autoriteit: ${auth.currentSignal}`,
                description: auth.explanation,
                priority: auth.impact === 'high' ? 'high' as const : 
                         auth.impact === 'medium' ? 'medium' as const : 'low' as const,
                recommendation: auth.enhancedVersion,
                impact: `Autoriteit verbetering: ${auth.impact}`,
                category: 'authority',
                estimatedTime: '30-60 minuten'
            });
        });
        
        return {
            summary: narrative.executiveSummary,
            recommendations,
            implementationPlan: {
                steps: insights.implementationPriority,
                estimatedTime: this.calculateImplementationTime(insights.missedOpportunities)
            },
            estimatedImpact: `Hybride score: ${patternScore} (pattern) + AI confidence ${insights.confidence}%. ${insights.missedOpportunities.length} verbeterkansen geïdentificeerd.`
        };
    }
    
    /**
     * Estimate AI cost based on insights and narrative complexity
     */
    private estimateAICost(insights: any, narrative: any): number {
        // Conservative estimate based on token usage
        const baseRequestCost = 0.02; // €0.02 per request
        const wordCountMultiplier = narrative.wordCount / 1000 * 0.01; // €0.01 per 1000 words
        const complexityMultiplier = insights.missedOpportunities.length * 0.005; // €0.005 per opportunity
        
        return Math.min(baseRequestCost + wordCountMultiplier + complexityMultiplier, 0.10); // Max €0.10
    }
    
    /**
     * Calculate total implementation time for all opportunities
     */
    private calculateImplementationTime(opportunities: any[]): string {
        const timeMap: Record<string, number> = { 'easy': 30, 'medium': 120, 'hard': 300 }; // minutes
        
        const totalMinutes = opportunities.reduce((sum, opp) => {
            return sum + (timeMap[opp.difficulty] || 60);
        }, 0);
        
        if (totalMinutes < 60) {
            return `${totalMinutes} minuten`;
        } else if (totalMinutes < 480) {
            return `${Math.round(totalMinutes / 60)} uur`;
        } else {
            return `${Math.round(totalMinutes / 480)} dagen`;
        }
    }
    
    /**
     * Generate and store PDF for business tier
     */
    private async generateAndStorePDF(
        scanResult: EngineScanResult,
        pdfGenerator: any,
        narrative?: any
    ): Promise<string | null> {
        try {
            const pdfBuffer = await pdfGenerator.generatePDF(
                scanResult, 
                scanResult.tier, 
                narrative
            );
            
            // Store in Supabase Storage (simplified for now)
            // TODO: Implement actual storage logic
            console.log('PDF generated for business tier');
            return `pdf-url-${scanResult.scanId}`;
        } catch (error) {
            console.error('PDF generation failed:', error);
            return null;
        }
    }
}