/**
 * InsightsPromptStrategy - Copy van vertexClient.buildInsightsPrompt()
 * 
 * COPY-FIRST STRATEGY: Dit is een exacte kopie van de bestaande prompt logica
 * uit vertexClient.ts (regel 175-251) om backwards compatibility te garanderen
 * 
 * TODO: Na verificatie van identieke output, kan deze worden gerefactored
 * naar gebruik van PromptHelpers voor DRY compliance
 */

import { BasePromptStrategy, type PromptInput } from './PromptStrategy.js';
import type { ModuleResult } from '../../types/scan.js';
import type { EnhancedContent } from '../../scan/ContentExtractor.js';
import { PromptFactory } from './PromptFactory.js';

export class InsightsPromptStrategy extends BasePromptStrategy {
  
  buildPrompt(data: PromptInput): string {
    // Extract parameters from PromptInput
    const moduleResults = data.moduleResults || [];
    const enhancedContent = data.enhancedContent || {} as EnhancedContent;
    const url = data.url || '';
    
    // Apply token limiting to prevent context overflow
    const limitedPrompt = this.limitTokens(this.buildInsightsPromptInternal(moduleResults, enhancedContent, url));
    
    return limitedPrompt;
  }
  
  /**
   * EXACT COPY van vertexClient.buildInsightsPrompt() - regel 175-251
   * Geen wijzigingen aan de prompt logica om backwards compatibility te garanderen
   */
  private buildInsightsPromptInternal(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent,
    url: string
  ): string {
    return `
Je bent een AI SEO-consultant die websites analyseert voor AI-readiness en citability.

SCAN RESULTATEN:
${JSON.stringify(moduleResults, null, 2)}

ENHANCED CONTENT ANALYSE:
Authority Signals: ${JSON.stringify(enhancedContent.authorityMarkers)}
Time Claims: ${JSON.stringify(enhancedContent.timeSignals)}
Quality Claims: ${JSON.stringify(enhancedContent.qualityClaims)}
Business Signals: ${JSON.stringify(enhancedContent.businessSignals)}
Content Quality: ${JSON.stringify(enhancedContent.contentQualityAssessment)}
Current Missed Opportunities: ${JSON.stringify(enhancedContent.missedOpportunities)}

TAAK:
Analyseer deze website voor AI-citation opportunities en geef structured insights.

Focus op:
1. **Missed Opportunities** - Concrete kansen voor betere AI visibility
2. **Authority Enhancements** - Hoe bestaande signalen sterker kunnen
3. **Citability Improvements** - Content optimalisaties voor AI assistants

Geef voor elke missed opportunity:
- Concrete before/after voorbeelden uit hun eigen content
- Impact score (1-10) en difficulty (easy/medium/hard)
- Specifieke implementatie instructies
- Tijd schatting

RESPONSE FORMAT (Strict JSON):
{
  "missedOpportunities": [
    {
      "category": "authority|specificity|evidence|differentiation|ai_optimization",
      "title": "Short descriptive title",
      "description": "What is missing and why it matters",
      "solution": "Concrete step-by-step solution",
      "beforeExample": "Current content example from their site",
      "afterExample": "How it should be improved",
      "impactScore": 1-10,
      "difficulty": "easy|medium|hard",
      "timeEstimate": "15 minutes|2 hours|etc"
    }
  ],
  "authorityEnhancements": [
    {
      "currentSignal": "Existing authority signal found",
      "enhancedVersion": "How to make it stronger",
      "explanation": "Why this improvement helps AI citation",
      "impact": "low|medium|high"
    }
  ],
  "citabilityImprovements": [
    {
      "section": "Which part of site",
      "currentContent": "Current content snippet",
      "improvedContent": "AI-optimized version",
      "aiReasoning": "Why AI assistants will prefer improved version",
      "citationPotential": 1-10
    }
  ],
  "implementationPriority": ["Step 1", "Step 2", "Step 3"],
  "generatedAt": "${new Date().toISOString()}",
  "confidence": 1-100
}

BELANGRIJKE INSTRUCTIES:
- Geef ALLEEN valid JSON terug
- Gebruik concrete voorbeelden uit hun werkelijke content
- Focus op actionable insights, niet algemene SEO tips
- Prioriteer quick wins met hoge impact
- Denk als AI assistant: wat zou je willen citeren van deze site?
`;
  }
}

// Auto-register this strategy with the factory
PromptFactory.register('insights', () => new InsightsPromptStrategy());