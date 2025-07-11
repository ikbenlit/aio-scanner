// src/lib/scan/ScanOrchestrator.ts
import type { EngineScanResult, ModuleResult, ScanModule } from '../types/scan';
import type { ScanTier } from '../types/database';
import { scanEventEmitter } from '../events';
import { db, type Json } from '../supabase';
import { AIReportGenerator } from './AIReportGenerator';
import { TechnicalSEOModule } from './modules/TechnicalSEOModule';
import { SchemaMarkupModule } from './modules/SchemaMarkupModule';
import { AIContentModule } from './modules/AIContentModule';
import { AICitationModule } from './modules/AICitationModule';
import { PromptFactory } from '../ai/prompts/PromptFactory.js';
import { VertexAIClient } from '../ai/vertexClient.js';
import { FreshnessModule } from './modules/FreshnessModule';
import { CrossWebFootprintModule } from './modules/CrossWebFootprintModule';
import { ContentExtractor } from './ContentExtractor';
import { LLMEnhancementService, type AIInsights, type MissedOpportunity, type AuthorityEnhancement } from './LLMEnhancementService.js';
import type { NarrativeReport } from '../types/scan.js';
import { TierAwarePDFGenerator } from '../pdf/generator.js';
import { supabase } from '../supabase.js';
// Strategy Pattern imports
import { TierStrategyFactory } from './strategies/TierStrategyFactory';
import type { ScanDependencies, ScanContext } from './strategies/TierScanStrategy';
import { SharedContentService } from './SharedContentService';

export class ScanOrchestrator {
    private modules: ScanModule[] = [
        new TechnicalSEOModule(),
        new SchemaMarkupModule(),
        new AIContentModule(),
        new AICitationModule(),
        new FreshnessModule(),
        new CrossWebFootprintModule()
    ];

    private aiReportGenerator = new AIReportGenerator();
    private contentExtractor = new ContentExtractor();
    private llmEnhancementService = new LLMEnhancementService();
    private pdfGenerator = new TierAwarePDFGenerator();
    private sharedContentService = new SharedContentService();

    // Legacy method - blijft behouden voor backwards compatibility
    async executeScan(url: string, scanId: string): Promise<void> {
        try {
            // Execute basic scan for anonymous users
            await this.executeTierScan(url, 'basic', scanId);
        } catch (error) {
            console.error(`Scan execution failed for ${scanId}:`, error);
            throw error; // Re-throw to be caught by caller
        }
    }

    async executeTierScan(
        url: string,
        tier: ScanTier,
        scanId: string,
        email?: string,
        paymentId?: string
    ): Promise<EngineScanResult> {
        // Validate required fields for paid tiers
        if (tier !== 'basic' && (!email || !paymentId)) {
            throw new Error('Email en paymentId zijn verplicht voor betaalde tiers');
        }

        try {
            // 1. Create scan record in database
            console.log(`💾 Creating scan record: ${scanId}`);
            await db.createScan(url, scanId, undefined, tier);

            // 2. Get strategy for this tier
            const strategy = TierStrategyFactory.createStrategy(tier);
            
            // 3. Prepare dependencies for strategy
            const dependencies: ScanDependencies = {
                modules: this.modules,
                aiReportGenerator: this.aiReportGenerator,
                contentExtractor: this.contentExtractor,
                llmEnhancementService: this.llmEnhancementService,
                pdfGenerator: this.pdfGenerator,
                sharedContentService: this.sharedContentService
            };
            
            // 4. Prepare execution context
            const context: ScanContext = {
                email,
                paymentId,
                startTime: Date.now(),
                progressCallback: (progress) => {
                    console.log(`📊 Scan progress: ${progress}%`);
                }
            };

            // 5. Execute scan using strategy
            console.log(`🚀 Executing ${tier} tier scan using strategy pattern`);
            const result = await strategy.execute(url, scanId, dependencies, context);

            // 6. Update scan with results
            console.log(`💾 Updating scan results: ${scanId}`);
            await db.updateScanStatus(
                scanId, 
                'completed', 
                this.convertToJson(result), 
                result.overallScore
            );

            // 7. Clear shared content cache
            this.sharedContentService.clearCache();

            // 8. Emit scan completed event (fire-and-forget)
            console.log(`📢 Emitting scan completed event for ${scanId}`);
            await scanEventEmitter.emitScanCompleted({
                scanId,
                tier,
                email,
                paymentId,
                completedAt: new Date().toISOString(),
                status: 'completed'
            });

            return result;

        } catch (error) {
            console.error(`❌ Scan execution failed for ${scanId}:`, error);
            
            // Clear cache on error
            this.sharedContentService.clearCache();
            
            // Update scan status to failed
            try {
                await db.updateScanStatus(scanId, 'failed');
                
                // Emit failed event
                await scanEventEmitter.emitScanCompleted({
                    scanId,
                    tier,
                    email,
                    paymentId,
                    completedAt: new Date().toISOString(),
                    status: 'failed'
                });
            } catch (updateError) {
                console.error(`❌ Failed to update scan status to failed:`, updateError);
            }
            
            throw error;
        }
    }

    // DEPRECATED: Legacy method - use Strategy Pattern instead
    // TODO: Remove after full Strategy Pattern migration
    // Kept for backwards compatibility only
    private async executeBasicScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.warn('⚠️ DEPRECATED: executeBasicScan - use TierStrategyFactory.createStrategy("basic") instead');
        const { BasicTierStrategy } = await import('./strategies/BasicTierStrategy');
        const strategy = new BasicTierStrategy();
        const dependencies: ScanDependencies = {
            modules: this.modules,
            aiReportGenerator: this.aiReportGenerator,
            contentExtractor: this.contentExtractor,
            llmEnhancementService: this.llmEnhancementService,
            pdfGenerator: this.pdfGenerator,
            sharedContentService: this.sharedContentService
        };
        return strategy.execute(url, scanId, dependencies, { startTime: Date.now() });
    }

    // DEPRECATED: Legacy method - use Strategy Pattern instead
    // TODO: Remove after full Strategy Pattern migration
    private async executeStarterScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.warn('⚠️ DEPRECATED: executeStarterScan - use TierStrategyFactory.createStrategy("starter") instead');
        const { StarterTierStrategy } = await import('./strategies/StarterTierStrategy');
        const strategy = new StarterTierStrategy();
        const dependencies: ScanDependencies = {
            modules: this.modules,
            aiReportGenerator: this.aiReportGenerator,
            contentExtractor: this.contentExtractor,
            llmEnhancementService: this.llmEnhancementService,
            pdfGenerator: this.pdfGenerator,
            sharedContentService: this.sharedContentService
        };
        return strategy.execute(url, scanId, dependencies, { startTime: Date.now() });
    }

    // DEPRECATED: Legacy method - use Strategy Pattern instead
    // TODO: Remove after full Strategy Pattern migration - uses old ContentExtractor.fetchContent
    // WARNING: Does not use new tier-based fetch strategy
    private async executeBusinessScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.warn('⚠️ DEPRECATED: executeBusinessScan - uses old fetch method, use TierStrategyFactory.createStrategy("business") instead');
        console.log('🚀 Starting business tier AI-enhanced scan for', url);
        const scanStartTime = Date.now();

        try {
            // 1. Fetch and extract enhanced content
            console.log('📊 Extracting enhanced content...');
            const html = await this.contentExtractor.fetchContent(url);
            const enhancedContent = await this.contentExtractor.extractEnhancedContent(html);

            // 2. Run all 6 pattern modules in parallel
            console.log('🔧 Running pattern analysis modules...');
            const moduleResults = await Promise.all(
                this.modules.map(module => module.execute(url))
            );

            // 3. LLM enhancement layer
            console.log('🧠 Enhancing findings with AI...');
            const { insights, narrative } = await this.llmEnhancementService.enhanceFindings(
                moduleResults,
                enhancedContent,
                url
            );

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

            // Phase 3.5 - Generate PDF for business tier
            const pdfUrl = await this.generateAndStorePDF(businessResult, narrative);

            return {
                ...businessResult,
                pdfUrl
            };

        } catch (error: unknown) {
            console.error('❌ Business scan failed:', error);
            console.log('⬇️ Falling back to starter tier...');
            
            // Graceful degradation to starter tier
            const fallbackResult = await this.executeStarterScan(url, scanId);
            
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

    // DEPRECATED: Legacy method - use Strategy Pattern instead  
    // TODO: Remove after full Strategy Pattern migration
    // WARNING: Does not use new tier-based fetch strategy
    private async executeEnterpriseScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.warn('⚠️ DEPRECATED: executeEnterpriseScan - use TierStrategyFactory.createStrategy("enterprise") instead');
        console.log('🏢 Starting enterprise tier scan for', url);
        const scanStartTime = Date.now();

        try {
            // 1. Start with business tier analysis as foundation
            console.log('📊 Executing business tier analysis as foundation...');
            const businessResult = await this.executeBusinessScan(url, scanId);
            
            // Skip enterprise enhancements if business tier already failed
            if (businessResult.error) {
                console.log('⚠️ Business tier had errors, returning enterprise tier with business data');
                return {
                    ...businessResult,
                    tier: 'enterprise',
                    error: `Enterprise tier: ${businessResult.error}`
                };
            }
            
            // 2. Add enterprise-specific enhancements
            console.log('🚀 Adding enterprise enhancements...');
            const enterpriseEnhancements = await this.addEnterpriseFeatures(url, businessResult);
            
            // 3. Generate enhanced narrative for enterprise
            console.log('📝 Generating enterprise strategic narrative...');
            const enterpriseNarrative = await this.generateEnterpriseNarrative(
                businessResult, 
                enterpriseEnhancements
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

            // Phase 3.5 - Generate PDF for enterprise tier
            const pdfUrl = await this.generateAndStorePDF(enterpriseResult, enterpriseNarrative);

            return {
                ...enterpriseResult,
                pdfUrl
            };

        } catch (error: unknown) {
            console.error('❌ Enterprise scan failed:', error);
            console.log('⬇️ Falling back to business tier with enterprise pricing...');
            
            // Graceful degradation to business tier
            const fallbackResult = await this.executeBusinessScan(url, scanId);
            
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
    private async addEnterpriseFeatures(url: string, businessResult: EngineScanResult) {
        try {
            const domain = new URL(url).hostname;
            
            // 1. Multi-page content sampling
            console.log('🔍 Discovering key pages for multi-page analysis...');
            const additionalPages = await this.discoverKeyPages(url);
            
            // 2. Analyze up to 2 additional pages
            const multiPageContent = [];
            for (const pageUrl of additionalPages.slice(0, 2)) {
                try {
                    console.log(`📄 Analyzing additional page: ${pageUrl}`);
                    const html = await this.contentExtractor.fetchContent(pageUrl);
                    const content = await this.contentExtractor.extractEnhancedContent(html);
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

    /**
     * Discover key pages for multi-page analysis
     */
    private async discoverKeyPages(url: string): Promise<string[]> {
        try {
            const baseUrl = new URL(url);
            const domain = baseUrl.origin;
            
            // Common important pages to check
            const candidatePages = [
                '/about',
                '/about-us',
                '/over-ons',
                '/services',
                '/diensten',
                '/products',
                '/producten',
                '/contact',
                '/blog'
            ];
            
            const validPages: string[] = [];
            
            // Quick check which pages exist (max 3 to keep it fast)
            for (const path of candidatePages.slice(0, 5)) {
                try {
                    const testUrl = domain + path;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);
                    
                    const response = await fetch(testUrl, { 
                        method: 'HEAD',
                        signal: controller.signal,
                        headers: { 'User-Agent': 'AIO-Scanner Enterprise Analysis' }
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (response.ok) {
                        validPages.push(testUrl);
                        if (validPages.length >= 2) break; // Max 2 additional pages
                    }
                } catch {
                    // Page doesn't exist or is unreachable, skip
                    continue;
                }
            }
            
            return validPages;
            
        } catch (error) {
            console.warn('⚠️ Page discovery failed:', error);
            return []; // Return empty array if discovery fails
        }
    }

    /**
     * Analyze patterns across multiple pages
     */
    private analyzeSiteWidePatterns(pageData: { url: string; content: unknown }[]): {
        authoritySignals: unknown[];
        contentThemes: string[];
        consistencyIssues: string[];
        consistencyScore: number;
    } {
        try {
            const patterns = {
                authoritySignals: [] as unknown[],
                contentThemes: [] as string[],
                consistencyIssues: [] as string[],
                consistencyScore: 0
            };
            
            // Collect authority signals from all pages
            pageData.forEach(page => {
                if (page.content && typeof page.content === 'object' && 'authoritySignals' in page.content) {
                    const signals = (page.content as any).authoritySignals;
                    if (Array.isArray(signals)) {
                        patterns.authoritySignals.push(...signals);
                    }
                }
            });
            
            // Calculate consistency score (simplified)
            const uniqueSignalTypes = new Set(patterns.authoritySignals.map(s => (s as any).type).filter(Boolean));
            patterns.consistencyScore = Math.min(uniqueSignalTypes.size * 20, 100);
            
            // Identify consistency issues
            if (patterns.authoritySignals.length === 0) {
                patterns.consistencyIssues.push('Geen autoriteit signalen gevonden op geanalyseerde paginas');
            }
            
            if (patterns.consistencyScore < 60) {
                patterns.consistencyIssues.push('Inconsistente autoriteit signalen tussen paginas');
            }
            
            return patterns;
            
        } catch (error) {
            console.error('❌ Site-wide pattern analysis failed:', error);
            return {
                authoritySignals: [],
                contentThemes: [],
                consistencyIssues: ['Pattern analysis failed'],
                consistencyScore: 0
            };
        }
    }

    /**
     * Get basic competitive insights
     */
    private async getBasicCompetitiveInsights(domain: string, currentScore: number): Promise<any> {
        try {
            // Simplified competitive analysis based on domain and score
            const domainParts = domain.split('.');
            const tld = domainParts[domainParts.length - 1];
            
            // Basic industry categorization based on domain patterns
            let industryCategory = 'general';
            let benchmarkScore = 65; // Default benchmark
            
            if (domain.includes('shop') || domain.includes('store')) {
                industryCategory = 'e-commerce';
                benchmarkScore = 70;
            } else if (domain.includes('blog') || domain.includes('news')) {
                industryCategory = 'content';
                benchmarkScore = 75;
            } else if (tld === 'nl') {
                industryCategory = 'dutch-local';
                benchmarkScore = 60;
            }
            
            const competitivePosition = currentScore >= benchmarkScore ? 'above-average' : 'below-average';
            
            return {
                industryCategory,
                benchmarkScore,
                currentScore,
                competitivePosition,
                insights: [
                    `Je website scoort ${currentScore}/100 vs industrie gemiddelde van ${benchmarkScore}/100`,
                    `Positie: ${competitivePosition === 'above-average' ? 'Boven gemiddeld' : 'Onder gemiddeld'} in ${industryCategory} sector`,
                    `Verbetering van ${Math.max(benchmarkScore - currentScore + 10, 5)} punten zou je in top 25% plaatsen`
                ]
            };
            
        } catch (error) {
            console.error('❌ Competitive insights failed:', error);
            return {
                industryCategory: 'unknown',
                benchmarkScore: 65,
                currentScore,
                competitivePosition: 'unknown',
                insights: ['Competitive analysis niet beschikbaar']
            };
        }
    }

    /**
     * Calculate industry benchmark
     */
    private calculateIndustryBenchmark(score: number, domain: string): {
        category: string;
        benchmarkScore: number;
        currentScore: number;
        percentile: string;
        improvementPotential: number;
    } {
        const category = domain.includes('.nl') ? 'dutch-market' : 'international';
        const benchmark = category === 'dutch-market' ? 62 : 68;
        
        return {
            category,
            benchmarkScore: benchmark,
            currentScore: score,
            percentile: score >= benchmark + 15 ? 'top-25' : 
                       score >= benchmark ? 'above-average' : 
                       score >= benchmark - 10 ? 'average' : 'below-average',
            improvementPotential: Math.max(benchmark + 15 - score, 0)
        };
    }

    /**
     * Generate enhanced narrative for enterprise tier using PromptFactory
     */
    private async generateEnterpriseNarrative(
        businessResult: EngineScanResult, 
        enterpriseFeatures: {
            multiPageAnalysis?: { url: string; content: unknown; relativePath: string; }[];
            siteWidePatterns?: { consistencyScore: number; [key: string]: unknown; };
            competitiveContext?: { competitivePosition?: string; currentScore?: number; benchmarkScore?: number; [key: string]: unknown; };
            industryBenchmark?: { category?: string; improvementPotential?: number; [key: string]: unknown; };
            analysisDepth?: { totalPagesAnalyzed?: number; [key: string]: unknown; };
            [key: string]: unknown;
        }
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
            
            // Use VertexClient to generate enterprise report
            const vertexClient = new VertexAIClient();
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
            
            // Fallback to enhanced business narrative
            const businessNarrative = businessResult.narrativeReport;
            if (businessNarrative) {
                return {
                    ...businessNarrative,
                    executiveSummary: `[ENTERPRISE TIER] ${businessNarrative.executiveSummary}\n\nDit rapport is gebaseerd op multi-page analyse van ${enterpriseFeatures.multiPageAnalysis?.length || 0} pagina's met competitive benchmarking.`,
                    wordCount: businessNarrative.wordCount * 1.3, // Estimate 30% more content
                };
            }
            
            // Ultimate fallback
            return {
                executiveSummary: 'Enterprise tier analyse voltooid met beperkte AI enhancement. Business tier insights beschikbaar.',
                detailedAnalysis: 'Gedetailleerde analyse niet beschikbaar door technische beperkingen.',
                implementationRoadmap: 'Implementatie roadmap wordt handmatig opgesteld.',
                conclusionNextSteps: 'Neem contact op voor uitgebreide enterprise analyse.',
                generatedAt: new Date().toISOString(),
                wordCount: 100
            };
        }
    }

    /**
     * Generate enhanced AI report for enterprise tier
     */
    private async generateEnterpriseAIReport(
        moduleResults: ModuleResult[],
        insights: AIInsights,
        narrative: NarrativeReport,
        enterpriseFeatures: {
            multiPageAnalysis?: { url: string; content: unknown; relativePath: string; }[];
            siteWidePatterns?: { consistencyScore: number; [key: string]: unknown; };
            competitiveContext?: { competitivePosition?: string; currentScore?: number; benchmarkScore?: number; [key: string]: unknown; };
            industryBenchmark?: { category?: string; improvementPotential?: number; [key: string]: unknown; };
            analysisDepth?: { totalPagesAnalyzed?: number; [key: string]: unknown; };
            [key: string]: unknown;
        }
    ) {
        // Build on business tier AI report but with enterprise enhancements
        const businessReport = await this.generateBusinessAIReport(moduleResults, insights, narrative, 
            moduleResults.reduce((sum, result) => sum + result.score, 0) / moduleResults.length
        );
        
        // Add enterprise-specific recommendations
        const enterpriseRecommendations = [
            {
                title: 'Multi-Page Consistency Optimization',
                description: `Analyseer van ${enterpriseFeatures.analysisDepth?.totalPagesAnalyzed || 1} pagina's toont consistentie score van ${enterpriseFeatures.siteWidePatterns?.consistencyScore || 0}/100`,
                priority: 'high' as const,
                recommendation: 'Implementeer site-wide content strategy voor consistente AI-citatie kansen',
                impact: `Consistency verbetering: ${100 - (enterpriseFeatures.siteWidePatterns?.consistencyScore || 0)} punten potentieel`,
                category: 'enterprise-strategy',
                estimatedTime: '2-4 weken'
            },
            {
                title: 'Competitive Positioning Enhancement',
                description: `Je website scoort ${enterpriseFeatures.competitiveContext?.currentScore || 0}/100 vs industrie benchmark ${enterpriseFeatures.competitiveContext?.benchmarkScore || 65}/100`,
                priority: enterpriseFeatures.competitiveContext?.competitivePosition === 'above-average' ? 'medium' as const : 'high' as const,
                recommendation: 'Leverage competitive advantages voor betere AI-visibility',
                impact: `Competitive improvement: ${enterpriseFeatures.industryBenchmark?.improvementPotential || 0} punten naar top 25%`,
                category: 'competitive-strategy',
                estimatedTime: '4-8 weken'
            }
        ];
        
        return {
            ...businessReport,
            summary: `[ENTERPRISE TIER] ${businessReport.summary}\n\nMulti-page analyse van ${enterpriseFeatures.analysisDepth?.totalPagesAnalyzed || 1} pagina's met competitive benchmarking voltooid.`,
            recommendations: [...businessReport.recommendations, ...enterpriseRecommendations],
            implementationPlan: {
                ...businessReport.implementationPlan,
                enterpriseFeatures: {
                    multiPageOptimization: '2-4 weken',
                    competitivePositioning: '4-8 weken',
                    strategicRoadmap: '3-6 maanden'
                }
            },
            estimatedImpact: `${businessReport.estimatedImpact} + Enterprise strategic positioning: ${enterpriseFeatures.industryBenchmark?.improvementPotential || 0} punten competitive advantage.`
        };
    }

    /**
     * Generate enhanced AI report for business tier
     * Combines pattern-based analysis with AI insights
     */
    private async generateBusinessAIReport(
        moduleResults: ModuleResult[],
        insights: AIInsights,
        narrative: NarrativeReport,
        patternScore: number
    ) {
        // Convert AI insights to AIReport format
        const recommendations = insights.missedOpportunities.map(opp => ({
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
        insights.authorityEnhancements.forEach(auth => {
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
    private estimateAICost(insights: AIInsights, narrative: NarrativeReport): number {
        // Conservative estimate based on token usage
        const baseRequestCost = 0.02; // €0.02 per request
        const wordCountMultiplier = narrative.wordCount / 1000 * 0.01; // €0.01 per 1000 words
        const complexityMultiplier = insights.missedOpportunities.length * 0.005; // €0.005 per opportunity
        
        return Math.min(baseRequestCost + wordCountMultiplier + complexityMultiplier, 0.10); // Max €0.10
    }

    /**
     * Calculate total implementation time for all opportunities
     */
    private calculateImplementationTime(opportunities: MissedOpportunity[]): string {
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

    // getTierPrice method removed - now handled by EmailEventListener

    /**
     * Convert EngineScanResult to Json type for database storage
     */
    private convertToJson(result: EngineScanResult): Json {
        return JSON.parse(JSON.stringify(result)) as Json;
    }

    /**
     * Generate LLM content using the enhancement service
     */
    private async generateLLMContent(prompt: string): Promise<{ response: { text: () => string } } | null> {
        try {
            // Use the public method from LLMEnhancementService or return mock for now
            return {
                response: {
                    text: () => JSON.stringify({
                        executiveSummary: 'Enterprise tier analyse voltooid met AI enhancement.',
                        multiPageAnalysis: 'Multi-page consistentie analyse uitgevoerd.',
                        strategicRoadmap: 'Strategische implementatie roadmap ontwikkeld.',
                        competitivePositioning: 'Competitive positioning bepaald.',
                        keyMetrics: {
                            estimatedROI: '15-25% binnen 6 maanden',
                            implementationTimeframe: '3-6 maanden', 
                            priorityActions: ['Multi-page optimalisatie', 'Competitive positionering', 'AI strategie']
                        }
                    })
                }
            };
        } catch (error) {
            console.error('LLM content generation failed:', error);
            return null;
        }
    }

    /**
     * Phase 3.5 - Generate and store PDF for paid tiers
     */
    private async generateAndStorePDF(
        scanResult: EngineScanResult,
        narrative?: NarrativeReport
    ): Promise<string | null> {
        if (!scanResult.tier || scanResult.tier === 'basic') {
            console.log('Skipping PDF generation for basic tier or tierless scan.');
            return null;
        }

        const scanId = scanResult.scanId;
        const tier = scanResult.tier;

        try {
            console.log(`🚀 Starting PDF generation for scan ${scanId} (tier: ${tier})`);
            await db.updateScanStatus(scanId, 'generating');

            // Generate PDF buffer from the appropriate generator
            const pdfBuffer = await this.pdfGenerator.generatePDF(scanResult, tier, narrative);

            // Store PDF in Supabase Storage
            const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const filePath = `reports/${timestamp}/${scanId}/${tier}-report.pdf`;
            
            const { error: uploadError } = await supabase.storage
                .from('scan-reports')
                .upload(filePath, pdfBuffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`PDF upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('scan-reports')
                .getPublicUrl(filePath);

            console.log(`✅ PDF generated and stored for scan ${scanId} at ${publicUrl}`);

            // Update scan record with PDF URL and status
            await db.updateScanStatus(scanId, 'completed');

            return publicUrl;
        } catch (error: any) {
            console.error(`❌ PDF generation failed for scan ${scanId}:`, error);
            await db.updateScanStatus(scanId, 'failed');
            return null; // Return null on failure
        }
    }

    /**
     * Phase 3.5 - Generate PDF after scan completion for paid tiers
     */
    async generatePDFForScan(scanId: string): Promise<string | null> {
        try {
            // Fetch scan details from database
            const { data: scan, error } = await supabase
                .from('scans')
                .select('*')
                .eq('id', scanId)
                .single();
                
            if (error || !scan) {
                console.error('Scan not found for PDF generation:', scanId);
                return null;
            }
            
            if (scan.tier === 'basic') {
                console.log('PDF generation not available for basic tier');
                return null;
            }
            
            // Reconstruct scan result from database
            const scanResult: EngineScanResult = {
                scanId: scan.id,
                url: scan.url,
                status: scan.status as any,
                overallScore: scan.overall_score || 0,
                createdAt: scan.created_at,
                completedAt: scan.completed_at || undefined,
                tier: scan.tier as ScanTier,
                moduleResults: [], // Would need to fetch from scan_modules table
                aiReport: scan.ai_report ? JSON.parse(scan.ai_report) : undefined,
                aiInsights: scan.ai_insights ? JSON.parse(scan.ai_insights) : undefined,
                narrativeReport: scan.narrative_report ? JSON.parse(scan.narrative_report) : undefined,
                costTracking: scan.cost_tracking ? JSON.parse(scan.cost_tracking) : undefined
            };
            
            // Generate PDF
            return await this.generateAndStorePDF(
                scanResult,
                scanResult.narrativeReport
            );
            
        } catch (error) {
            console.error('PDF generation for scan failed:', error);
            return null;
        }
    }
}
