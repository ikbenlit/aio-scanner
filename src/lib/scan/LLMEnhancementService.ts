import type { ModuleResult } from '../types/scan.js';
import type { EnhancedContent } from './ContentExtractor';
import { VertexAIClient } from '../ai/vertexClient.js';
import { PromptFactory } from '../ai/prompts/PromptFactory.js';
import type { 
    AIInsights as VertexAIInsights, 
    NarrativeReport as VertexNarrativeReport,
    MissedOpportunity as VertexMissedOpportunity,
    AuthorityEnhancement as VertexAuthorityEnhancement,
    CitabilityImprovement as VertexCitabilityImprovement
} from '../ai/vertexClient.js';

// Re-export types from VertexAI for consistency
export interface AIInsights extends VertexAIInsights {}
export interface NarrativeReport extends VertexNarrativeReport {}
export interface MissedOpportunity extends VertexMissedOpportunity {}
export interface AuthorityEnhancement extends VertexAuthorityEnhancement {}
export interface CitabilityImprovement extends VertexCitabilityImprovement {}

export class LLMEnhancementService {
    private vertexClient: VertexAIClient;
    private cache: Map<string, any> = new Map();

    constructor() {
        this.vertexClient = new VertexAIClient();
    }

    async enhanceFindings(
        moduleResults: ModuleResult[],
        enhancedContent: EnhancedContent,
        url: string
    ): Promise<{ insights: AIInsights; narrative: NarrativeReport }> {
        console.log('🔮 Enhancing findings with LLM...');

        // Check cache first (cost optimization)
        const cacheKey = this.generateCacheKey(moduleResults, enhancedContent);
        if (this.cache.has(cacheKey)) {
            console.log('📋 Using cached AI analysis');
            return this.cache.get(cacheKey);
        }

        try {
            // Generate structured insights using VertexAI with PromptFactory
            console.log('🧠 Generating AI insights...');
            const insightsStrategy = PromptFactory.create('insights');
            const insightsPrompt = insightsStrategy.buildPrompt({
                moduleResults,
                enhancedContent,
                url
            });
            const insights = await this.vertexClient.generateInsights(insightsPrompt);
            
            // Generate narrative report using VertexAI with PromptFactory
            console.log('📝 Generating narrative report...');
            const narrativeStrategy = PromptFactory.create('narrative');
            const narrativePrompt = narrativeStrategy.buildPrompt({
                moduleResults,
                enhancedContent,
                insights
            });
            const narrative = await this.vertexClient.generateNarrativeReport(narrativePrompt);
            
            const result = { insights, narrative };
            
            // Cache the result for cost optimization
            this.cache.set(cacheKey, result);
            console.log('✅ AI enhancement completed successfully');
            
            return result;
            
        } catch (error: any) {
            console.error('❌ AI enhancement failed:', error);
            
            if (error.message === 'BUDGET_EXCEEDED') {
                console.warn('💰 AI budget exceeded, falling back to pattern-based insights');
                return this.getFallbackAnalysis(moduleResults, enhancedContent);
            }
            
            if (error.message.includes('_FAILED')) {
                console.warn('🔄 AI enhancement failed, using pattern-based insights');
                return this.getFallbackAnalysis(moduleResults, enhancedContent);
            }
            
            // Unknown error - still provide fallback
            console.warn('⚠️ Unknown AI error, falling back gracefully');
            return this.getFallbackAnalysis(moduleResults, enhancedContent);
        }
    }

    private generateCacheKey(moduleResults: ModuleResult[], enhancedContent: EnhancedContent): string {
        // Create a simple cache key based on content characteristics
        const moduleScores = moduleResults.map(m => m.score).join('-');
        const contentSignature = `${enhancedContent.authorityMarkers.length}-${enhancedContent.qualityClaims.length}-${enhancedContent.missedOpportunities.length}`;
        return `${moduleScores}_${contentSignature}`;
    }

    private getFallbackAnalysis(
        moduleResults: ModuleResult[], 
        enhancedContent: EnhancedContent
    ): { insights: AIInsights; narrative: NarrativeReport } {
        console.log('🔄 Generating pattern-based fallback analysis...');
        
        // Generate insights based on enhanced content patterns
        const insights: AIInsights = {
            missedOpportunities: this.generatePatternBasedOpportunities(enhancedContent),
            authorityEnhancements: this.generatePatternBasedAuthority(enhancedContent),
            citabilityImprovements: this.generatePatternBasedCitability(enhancedContent),
            implementationPriority: this.generatePatternBasedPriority(enhancedContent),
            generatedAt: new Date().toISOString(),
            confidence: 75 // Lower confidence for pattern-based analysis
        };

        // Generate basic narrative report
        const narrative: NarrativeReport = {
            executiveSummary: this.generatePatternBasedSummary(moduleResults, enhancedContent),
            detailedAnalysis: this.generatePatternBasedAnalysis(moduleResults, enhancedContent),
            implementationRoadmap: this.generatePatternBasedRoadmap(insights),
            conclusionNextSteps: this.generatePatternBasedConclusion(insights),
            generatedAt: new Date().toISOString(),
            wordCount: 600 // Approximate word count
        };

        return { insights, narrative };
    }

    private generatePatternBasedOpportunities(content: EnhancedContent): MissedOpportunity[] {
        const opportunities: MissedOpportunity[] = [];

        // Convert missed opportunities from enhanced content
        content.missedOpportunities.forEach(opp => {
            opportunities.push({
                category: opp.category as 'authority' | 'specificity' | 'evidence' | 'differentiation',
                title: `Verbeter ${opp.category}`,
                description: opp.description,
                solution: opp.suggestion,
                impactScore: opp.impact === 'high' ? 8 : opp.impact === 'medium' ? 6 : 4,
                difficulty: opp.implementationEffort as 'easy' | 'medium' | 'hard',
                timeEstimate: opp.implementationEffort === 'low' ? '15-30 min' : 
                             opp.implementationEffort === 'medium' ? '1-2 uur' : '3-5 uur'
            });
        });

        // Add opportunities based on vague statements
        content.contentQualityAssessment.vagueStatements.forEach(vague => {
            opportunities.push({
                category: 'specificity',
                title: 'Maak claims specifieker',
                description: `Vage uitspraak gevonden: "${vague.text}"`,
                solution: vague.suggestion,
                beforeExample: vague.text,
                afterExample: vague.suggestion,
                impactScore: 7,
                difficulty: 'easy',
                timeEstimate: '15-30 min'
            });
        });

        return opportunities.slice(0, 5); // Limit to top 5
    }

    private generatePatternBasedAuthority(content: EnhancedContent): AuthorityEnhancement[] {
        return content.authorityMarkers.map(marker => ({
            currentSignal: marker.text,
            enhancedVersion: `${marker.text} - voeg meer specifieke details toe`,
            explanation: `Versterk dit ${marker.markerType} signaal met concrete voorbeelden`,
            impact: marker.confidence === 'high' ? 'high' as const : 
                   marker.confidence === 'medium' ? 'medium' as const : 'low' as const
        })).slice(0, 3);
    }

    private generatePatternBasedCitability(content: EnhancedContent): CitabilityImprovement[] {
        return content.contentQualityAssessment.unsupportedClaims.map(claim => ({
            section: 'Content verbetering',
            currentContent: claim.text,
            improvedContent: `${claim.text} - ${claim.evidenceNeeded}`,
            aiReasoning: `Deze claim heeft bewijs nodig: ${claim.evidenceNeeded}`,
            citationPotential: claim.confidence === 'high' ? 8 : 6
        })).slice(0, 3);
    }

    private generatePatternBasedPriority(content: EnhancedContent): string[] {
        const priorities = [];
        
        if (content.contentQualityAssessment.vagueStatements.length > 0) {
            priorities.push('Maak vage uitspraken specifieker');
        }
        
        if (content.contentQualityAssessment.unsupportedClaims.length > 0) {
            priorities.push('Voeg bewijs toe aan claims');
        }
        
        if (content.authorityMarkers.length < 3) {
            priorities.push('Versterk autoriteit signalen');
        }
        
        return priorities;
    }

    private generatePatternBasedSummary(moduleResults: ModuleResult[], content: EnhancedContent): string {
        const overallScore = Math.round(moduleResults.reduce((sum, m) => sum + m.score, 0) / moduleResults.length);
        const issueCount = content.missedOpportunities.length + content.contentQualityAssessment.vagueStatements.length;
        
        return `Je website heeft een score van ${overallScore}/100 behaald. Er zijn ${issueCount} verbeterpunten geïdentificeerd die je AI-zichtbaarheid kunnen verbeteren. De belangrijkste focus ligt op het specifieker maken van claims en het versterken van autoriteit signalen.`;
    }

    private generatePatternBasedAnalysis(moduleResults: ModuleResult[], content: EnhancedContent): string {
        let analysis = 'Gedetailleerde analyse van je website:\n\n';
        
        moduleResults.forEach(module => {
            analysis += `${module.name}: ${module.score}/100 - `;
            analysis += module.findings.length > 0 ? 
                `${module.findings.length} verbeterpunten gevonden.\n` : 
                'Geen grote problemen gevonden.\n';
        });
        
        if (content.contentQualityAssessment.vagueStatements.length > 0) {
            analysis += `\nEr zijn ${content.contentQualityAssessment.vagueStatements.length} vage uitspraken gevonden die specifieker kunnen worden gemaakt voor betere AI-citatie.`;
        }
        
        return analysis;
    }

    private generatePatternBasedRoadmap(insights: AIInsights): string {
        let roadmap = 'Implementatie roadmap:\n\n';
        
        insights.implementationPriority.forEach((priority, index) => {
            roadmap += `${index + 1}. ${priority}\n`;
        });
        
        roadmap += '\nBegin met de eenvoudige verbeteringen en werk toe naar complexere wijzigingen.';
        
        return roadmap;
    }

    private generatePatternBasedConclusion(insights: AIInsights): string {
        return `Met ${insights.missedOpportunities.length} geïdentificeerde kansen kun je je AI-zichtbaarheid significant verbeteren. Start met de hoogst scorende verbeteringen voor maximale impact.`;
    }
} 