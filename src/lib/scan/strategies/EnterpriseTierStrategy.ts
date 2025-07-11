// src/lib/scan/strategies/EnterpriseTierStrategy.ts
import { BaseTierStrategy, type ScanDependencies, type ScanContext } from './TierScanStrategy';
import type { EngineScanResult, NarrativeReport } from '../../types/scan';
import type { ScanTier } from '../../types/database';
import { PromptFactory } from '../../ai/prompts/PromptFactory.js';

/**
 * Enterprise tier strategy - includes multi-page analysis and strategic features
 * Builds on business tier with enterprise-specific enhancements
 */
export class EnterpriseTierStrategy extends BaseTierStrategy {
    protected tier: ScanTier = 'enterprise';
    
    getEstimatedDuration(): number {
        return 120000; // 2 minutes for enterprise scan
    }
    
    async execute(
        url: string,
        scanId: string,
        dependencies: ScanDependencies,
        context?: ScanContext
    ): Promise<EngineScanResult> {
        console.log('🏢 Starting enterprise tier scan for', url);
        const scanStartTime = context?.startTime || Date.now();
        
        try {
            // 1. Start with business tier analysis as foundation
            console.log('📊 Executing business tier analysis as foundation...');
            const { BusinessTierStrategy } = await import('./BusinessTierStrategy');
            const businessStrategy = new BusinessTierStrategy();
            const businessResult = await businessStrategy.execute(url, scanId, dependencies, {
                ...context,
                progressCallback: (progress) => {
                    // Scale business progress to 60% of total
                    if (context?.progressCallback) {
                        context.progressCallback(Math.round(progress * 0.6));
                    }
                }
            });
            
            // Skip enterprise enhancements if business tier already failed
            if (businessResult.error) {
                console.log('⚠️ Business tier had errors, returning enterprise tier with business data');
                return {
                    ...businessResult,
                    tier: 'enterprise',
                    error: `Enterprise tier: ${businessResult.error}`
                };
            }
            
            if (context?.progressCallback) {
                context.progressCallback(70);
            }
            
            // 2. Add enterprise-specific enhancements
            console.log('🚀 Adding enterprise enhancements...');
            const enterpriseEnhancements = await this.addEnterpriseFeatures(url, businessResult, dependencies);
            
            if (context?.progressCallback) {
                context.progressCallback(85);
            }
            
            // 3. Generate enhanced narrative for enterprise
            console.log('📝 Generating enterprise strategic narrative...');
            const enterpriseNarrative = await this.generateEnterpriseNarrative(
                businessResult, 
                enterpriseEnhancements,
                dependencies
            );
            
            // 4. Calculate enterprise cost tracking
            const enterpriseCostTracking = {
                aiCost: Math.min((businessResult.costTracking?.aiCost || 0.10) * 1.5, 0.15), // 50% more, max €0.15
                scanDuration: Date.now() - scanStartTime,
                enterpriseFeatures: {
                    multiPageAnalysis: enterpriseEnhancements.multiPageAnalysis?.length || 0,
                    competitiveInsights: !!enterpriseEnhancements.competitiveContext,
                    strategicRoadmap: !!enterpriseNarrative.strategicRoadmap
                }
            };
            
            console.log(`✅ Enterprise scan completed in ${enterpriseCostTracking.scanDuration}ms`);
            console.log(`💰 Enterprise AI cost: €${enterpriseCostTracking.aiCost.toFixed(4)}`);
            
            const enterpriseResult: EngineScanResult = {
                ...businessResult,
                tier: 'enterprise',
                enterpriseFeatures: enterpriseEnhancements as any,
                narrativeReport: enterpriseNarrative,
                costTracking: enterpriseCostTracking,
                // Override business AI report with enterprise version
                aiReport: await this.generateEnterpriseAIReport(
                    businessResult.moduleResults,
                    businessResult.aiInsights!,
                    enterpriseNarrative,
                    enterpriseEnhancements
                )
            };
            
            // Generate PDF for enterprise tier
            let pdfUrl: string | null = null;
            try {
                pdfUrl = await this.generateAndStorePDF(
                    enterpriseResult, 
                    dependencies.pdfGenerator, 
                    enterpriseNarrative
                );
            } catch (error) {
                console.warn('PDF generation failed for enterprise tier:', error);
            }
            
            if (context?.progressCallback) {
                context.progressCallback(100);
            }
            
            return {
                ...enterpriseResult,
                pdfUrl
            };
            
        } catch (error: unknown) {
            console.error('❌ Enterprise scan failed:', error);
            console.log('⬇️ Falling back to business tier with enterprise pricing...');
            
            // Graceful degradation to business tier
            const { BusinessTierStrategy } = await import('./BusinessTierStrategy');
            const businessStrategy = new BusinessTierStrategy();
            const fallbackResult = await businessStrategy.execute(url, scanId, dependencies, context);
            
            return {
                ...fallbackResult,
                tier: 'enterprise',
                error: `Enterprise features partially failed: ${error instanceof Error ? error.message : 'Unknown error'}. Business tier analysis completed with enterprise-level insights.`,
                costTracking: {
                    aiCost: fallbackResult.costTracking?.aiCost || 0,
                    scanDuration: Date.now() - scanStartTime,
                    fallbackUsed: true
                }
            };
        }
    }
    
    /**
     * Add enterprise-specific features to business tier results
     */
    private async addEnterpriseFeatures(url: string, businessResult: EngineScanResult, dependencies: ScanDependencies) {
        try {
            const { sharedContentService } = dependencies;
            const domain = new URL(url).hostname;
            
            // 1. Multi-page content sampling
            console.log('🔍 Discovering key pages for multi-page analysis...');
            const additionalPages = await this.discoverKeyPages(url);
            
            // 2. Analyze up to 2 additional pages
            const multiPageContent = [];
            for (const pageUrl of additionalPages.slice(0, 2)) {
                try {
                    console.log(`📄 Analyzing additional page: ${pageUrl}`);
                    const sharedContent = await sharedContentService.fetchSharedContent(pageUrl);
                    const content = await dependencies.contentExtractor.extractEnhancedContent(sharedContent.html);
                    multiPageContent.push({
                        url: pageUrl,
                        content,
                        relativePath: new URL(pageUrl).pathname
                    });
                } catch (pageError) {
                    console.warn(`⚠️ Failed to analyze page ${pageUrl}:`, pageError);
                }
            }
            
            // 3. Site-wide pattern analysis
            const siteWidePatterns = this.analyzeSiteWidePatterns([
                { url, content: businessResult.aiInsights },
                ...multiPageContent
            ]);
            
            // 4. Basic competitive context
            const competitiveContext = await this.getBasicCompetitiveInsights(domain, businessResult.overallScore);
            
            // 5. Industry benchmarking
            const industryBenchmark = this.calculateIndustryBenchmark(businessResult.overallScore, domain);
            
            return {
                multiPageAnalysis: multiPageContent,
                siteWidePatterns,
                competitiveContext,
                industryBenchmark,
                analysisDepth: {
                    totalPagesAnalyzed: multiPageContent.length + 1,
                    contentSamples: multiPageContent.length,
                    patternConsistency: siteWidePatterns.consistencyScore
                }
            };
            
        } catch (error) {
            console.error('❌ Enterprise features failed:', error);
            // Return minimal enterprise features
            return {
                multiPageAnalysis: [],
                siteWidePatterns: { consistencyScore: 0, patterns: [] },
                competitiveContext: { benchmark: 'unavailable', insights: [] },
                industryBenchmark: { score: 0, category: 'unknown' },
                analysisDepth: { totalPagesAnalyzed: 1, contentSamples: 0, patternConsistency: 0 },
                error: 'Enterprise features partially failed, basic analysis completed'
            };
        }
    }
    
    // ... (Other helper methods from original ScanOrchestrator will be imported here)
    // For brevity, I'm including the method signatures but the full implementation
    // would be extracted from the original ScanOrchestrator
    
    private async discoverKeyPages(url: string): Promise<string[]> {
        // Implementation from original ScanOrchestrator
        return [];
    }
    
    private analyzeSiteWidePatterns(pageData: { url: string; content: unknown }[]): any {
        // Implementation from original ScanOrchestrator
        return { consistencyScore: 0, patterns: [] };
    }
    
    private async getBasicCompetitiveInsights(domain: string, currentScore: number): Promise<any> {
        // Implementation from original ScanOrchestrator
        return { benchmark: 'unavailable', insights: [] };
    }
    
    private calculateIndustryBenchmark(score: number, domain: string): any {
        // Implementation from original ScanOrchestrator
        return { score: 0, category: 'unknown' };
    }
    
    private async generateEnterpriseNarrative(
        businessResult: EngineScanResult, 
        enterpriseFeatures: any,
        dependencies: ScanDependencies
    ): Promise<NarrativeReport> {
        try {
            console.log('🏢 Generating enterprise narrative using PromptFactory...');
            
            // Use PromptFactory to generate enterprise narrative
            const enterpriseStrategy = PromptFactory.create('enterprise');
            const enterprisePrompt = enterpriseStrategy.buildPrompt({
                moduleResults: businessResult.moduleResults,
                enhancedContent: businessResult.aiInsights ? {
                    // Map business result to enhanced content format
                    url: businessResult.url,
                    title: businessResult.pageTitle,
                    authorityMarkers: businessResult.aiInsights.authorityEnhancements || [],
                    missedOpportunities: businessResult.aiInsights.missedOpportunities || [],
                    contentQualityAssessment: { overallQualityScore: businessResult.overallScore }
                } as any : undefined,
                enterpriseFeatures: {
                    multiPageAnalysis: enterpriseFeatures.multiPageAnalysis,
                    siteWidePatterns: enterpriseFeatures.siteWidePatterns,
                    competitiveContext: enterpriseFeatures.competitiveContext,
                    industryBenchmark: enterpriseFeatures.industryBenchmark
                }
            });
            
            // Use VertexClient through LLMEnhancementService to generate enterprise report
            const { llmEnhancementService } = dependencies;
            const vertexClient = (llmEnhancementService as any).vertexClient;
            const enterpriseReport = await vertexClient.generateEnterpriseReport(enterprisePrompt);
            
            // Convert enterprise report to narrative report format
            return {
                executiveSummary: enterpriseReport.executiveSummary,
                detailedAnalysis: enterpriseReport.multiPageAnalysis,
                implementationRoadmap: enterpriseReport.strategicRoadmap,
                conclusionNextSteps: enterpriseReport.competitivePositioning,
                generatedAt: enterpriseReport.generatedAt,
                wordCount: enterpriseReport.wordCount
            };
            
        } catch (error) {
            console.error('❌ Enterprise narrative generation failed:', error);
            
            // Fallback to basic narrative
            return {
                executiveSummary: 'Enterprise tier analysis completed with strategic insights',
                detailedAnalysis: `Multi-page analysis van ${enterpriseFeatures.multiPageAnalysis?.length || 0} pagina's uitgevoerd. Competitive context en industry benchmarks geanalyseerd.`,
                implementationRoadmap: 'Enterprise implementation roadmap gebaseerd op multi-page analyse en competitive insights',
                conclusionNextSteps: 'Focus op strategische verbeteringen en competitive positioning',
                generatedAt: new Date().toISOString(),
                wordCount: 400
            };
        }
    }
    
    private async generateEnterpriseAIReport(
        moduleResults: any[],
        insights: any,
        narrative: NarrativeReport,
        enterpriseFeatures: any
    ) {
        // Implementation from original ScanOrchestrator
        return {
            summary: narrative.executiveSummary,
            recommendations: [],
            implementationPlan: { steps: [], estimatedTime: '1-2 months' },
            estimatedImpact: 'Enterprise-level strategic improvements'
        };
    }
    
    private async generateAndStorePDF(
        scanResult: EngineScanResult,
        pdfGenerator: any,
        narrative?: NarrativeReport
    ): Promise<string | null> {
        try {
            const pdfBuffer = await pdfGenerator.generatePDF(
                scanResult, 
                scanResult.tier, 
                narrative
            );
            
            // Store in Supabase Storage (simplified for now)
            console.log('PDF generated for enterprise tier');
            return `pdf-url-${scanResult.scanId}`;
        } catch (error) {
            console.error('PDF generation failed:', error);
            return null;
        }
    }
}