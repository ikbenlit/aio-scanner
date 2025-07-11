/**
 * EnterprisePromptStrategy - Copy van ScanOrchestrator.generateEnterpriseNarrative()
 * 
 * COPY-FIRST STRATEGY: Dit is een exacte kopie van de bestaande prompt logica
 * uit ScanOrchestrator.ts (regel 634-698) om backwards compatibility te garanderen
 * 
 * TODO: Na verificatie van identieke output, kan deze worden gerefactored
 * naar gebruik van PromptHelpers voor DRY compliance
 */

import { BasePromptStrategy, type PromptInput } from './PromptStrategy.js';
import type { EngineScanResult, NarrativeReport } from '../../types/scan.js';
import type { AIInsights } from '../vertexClient.js';
import { PromptFactory } from './PromptFactory.js';

// Enterprise Features type definitie (gekopieerd van ScanOrchestrator)
interface EnterpriseFeatures {
  multiPageAnalysis?: { url: string; content: unknown; relativePath: string; }[];
  siteWidePatterns?: { consistencyScore: number; [key: string]: unknown; };
  competitiveContext?: { competitivePosition?: string; currentScore?: number; benchmarkScore?: number; [key: string]: unknown; };
  industryBenchmark?: { category?: string; improvementPotential?: number; [key: string]: unknown; };
  analysisDepth?: { totalPagesAnalyzed?: number; [key: string]: unknown; };
  [key: string]: unknown;
}

export class EnterprisePromptStrategy extends BasePromptStrategy {
  
  buildPrompt(data: PromptInput): string {
    // Extract enterprise-specific data from PromptInput
    const businessResult = this.extractBusinessResult(data);
    const enterpriseFeatures = data.enterpriseFeatures || {};
    
    // Apply token limiting to prevent context overflow
    const limitedPrompt = this.limitTokens(this.buildEnterprisePromptInternal(businessResult, enterpriseFeatures));
    
    return limitedPrompt;
  }
  
  /**
   * EXACT COPY van ScanOrchestrator.generateEnterpriseNarrative() prompt - regel 634-698
   * Geen wijzigingen aan de prompt logica om backwards compatibility te garanderen
   */
  private buildEnterprisePromptInternal(
    businessResult: { aiInsights?: AIInsights; [key: string]: unknown; },
    enterpriseFeatures: EnterpriseFeatures
  ): string {
    return `
Je bent een senior AI-consultant die een strategisch rapport schrijft voor een enterprise klant (€149.95 tier).

BUSINESS TIER ANALYSIS:
${JSON.stringify(businessResult.aiInsights, null, 2)}

MULTI-PAGE INSIGHTS:
Geanalyseerde paginas: ${enterpriseFeatures.multiPageAnalysis?.length || 0}
Site-wide consistentie: ${enterpriseFeatures.siteWidePatterns?.consistencyScore || 0}/100
${JSON.stringify(enterpriseFeatures.siteWidePatterns, null, 2)}

COMPETITIVE CONTEXT:
${JSON.stringify(enterpriseFeatures.competitiveContext, null, 2)}

INDUSTRY BENCHMARK:
${JSON.stringify(enterpriseFeatures.industryBenchmark, null, 2)}

TAAK:
Schrijf een uitgebreid strategisch rapport (800-1200 woorden) met deze secties:

1. EXECUTIVE SUMMARY (200-250 woorden)
   - Strategic overview van AI-readiness across multiple pages
   - Key competitive advantages en gaps vs industry benchmark
   - ROI projectie voor implementatie (3-6 maanden)
   - Investment prioritization recommendations

2. MULTI-PAGE STRATEGIC ANALYSIS (300-400 woorden)
   - Consistency analysis tussen homepage en subpaginas
   - Site-wide content strategy recommendations
   - Cross-page optimization opportunities
   - Brand voice en messaging consistency

3. COMPETITIVE POSITIONING (200-250 woorden)
   - Industry benchmark comparison (${enterpriseFeatures.industryBenchmark?.category || 'general'} sector)
   - Competitive advantages to leverage immediately
   - Market positioning recommendations
   - Differentiation opportunities vs competitors

4. STRATEGIC IMPLEMENTATION ROADMAP (200-300 woorden)
   - 3-6 month phased implementation plan
   - Resource allocation recommendations (tijd/budget)
   - Success metrics en KPIs per fase
   - ROI timeline en realistic expectations
   - Risk mitigation strategies

SCHRIJFSTIJL:
- Executive-level strategic focus (niet tactisch)
- Concrete ROI en business impact cijfers
- Actionable strategic recommendations
- Professional consulting tone
- Nederlandse taal, formeel niveau

RESPONSE FORMAT (JSON):
{
  "executiveSummary": "...",
  "multiPageAnalysis": "...",
  "competitivePositioning": "...",
  "strategicRoadmap": "...",
  "keyMetrics": {
    "estimatedROI": "...",
    "implementationTimeframe": "...",
    "priorityActions": ["...", "...", "..."]
  }
}
`;
  }
  
  /**
   * Helper method to extract business result data from PromptInput
   * Adapts the new PromptInput interface to the legacy business result format
   */
  private extractBusinessResult(data: PromptInput): { aiInsights?: AIInsights; [key: string]: unknown; } {
    return {
      aiInsights: data.insights,
      // Include any other relevant data from PromptInput
      moduleResults: data.moduleResults,
      enhancedContent: data.enhancedContent,
      url: data.url
    };
  }
  
  /**
   * Extended interface for enterprise-specific PromptInput
   * This allows type-safe access to enterprise features
   */
  static isEnterpriseInput(data: PromptInput): data is PromptInput & { enterpriseFeatures: EnterpriseFeatures } {
    return data.enterpriseFeatures !== undefined;
  }
}

// Auto-register this strategy with the factory
PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());