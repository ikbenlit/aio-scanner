/**
 * NarrativePromptStrategy - Copy van vertexClient.buildNarrativePrompt()
 * 
 * COPY-FIRST STRATEGY: Dit is een exacte kopie van de bestaande prompt logica
 * uit vertexClient.ts (regel 257-329) om backwards compatibility te garanderen
 * 
 * TODO: Na verificatie van identieke output, kan deze worden gerefactored
 * naar gebruik van PromptHelpers voor DRY compliance
 */

import { BasePromptStrategy, type PromptInput } from './PromptStrategy.js';
import type { ModuleResult } from '../../types/scan.js';
import type { EnhancedContent } from '../../scan/ContentExtractor.js';
import type { AIInsights } from '../vertexClient.js';
import { PromptFactory } from './PromptFactory.js';

export class NarrativePromptStrategy extends BasePromptStrategy {
  
  buildPrompt(data: PromptInput): string {
    // Extract parameters from PromptInput
    const moduleResults = data.moduleResults || [];
    const enhancedContent = data.enhancedContent || {} as EnhancedContent;
    const insights = data.insights || {} as AIInsights;
    
    // Apply token limiting to prevent context overflow
    const limitedPrompt = this.limitTokens(this.buildNarrativePromptInternal(moduleResults, enhancedContent, insights));
    
    return limitedPrompt;
  }
  
  /**
   * EXACT COPY van vertexClient.buildNarrativePrompt() - regel 257-329
   * Geen wijzigingen aan de prompt logica om backwards compatibility te garanderen
   */
  private buildNarrativePromptInternal(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent,
    insights: AIInsights
  ): string {
    return `
Je bent een persoonlijke AI-consultant die een rapport schrijft voor de website eigenaar.

CONTEXT:
Scan Results: ${JSON.stringify(moduleResults, null, 2)}
AI Insights: ${JSON.stringify(insights, null, 2)}
Authority Content: ${JSON.stringify(enhancedContent.authorityMarkers.slice(0, 3))}

SMART ANALYSIS DATA:
De scan bevat verrijkte findings met:
- Evidence: Contextuele quotes en voorbeelden uit de werkelijke content
- Suggestions: Concrete, implementeerbare verbeteringen per finding
Gebruik deze evidence als proof points en suggestions als actionable advice.

TAAK:
Schrijf een persoonlijk, professioneel rapport in vloeiende Nederlandse tekst.

TONE:
- Persoonlijk ("je website", "jouw klanten")
- Professioneel maar toegankelijk
- Specifiek voor deze website, niet generiek
- Gebruik concrete voorbeelden uit hun content
- Motiverend en actionable

STRUCTUUR:
1. **Executive Summary** (150-200 woorden)
   - Persoonlijke opening over hun website
   - Hoofdbevindingen in context van hun business
   - Top 3 belangrijkste kansen

2. **Detailed Analysis** (300-400 woorden)
   - Dieper ingaan op specifieke bevindingen MET evidence quotes
   - Uitleggen waarom dit belangrijk is voor hun business
   - Gebruik de evidence velden als concrete voorbeelden uit hun content
   - Focus op AI-readiness en citation potential
   - Integreer suggestions als directe verbeteringsadvies

3. **Implementation Roadmap** (200-250 woorden)
   - Prioriteer acties op impact vs effort
   - Gebruik suggestion velden voor stap-voor-stap instructies
   - Realistische tijdschattingen
   - Quick wins eerst, gebaseerd op suggestions

4. **Conclusion & Next Steps** (100-150 woorden)
   - Samenvatten belangrijkste acties
   - Motiveren om te beginnen
   - Duidelijke volgende stappen

RESPONSE FORMAT (Strict JSON):
{
  "executiveSummary": "Complete section text here...",
  "detailedAnalysis": "Complete section text here...",
  "implementationRoadmap": "Complete section text here...",
  "conclusionNextSteps": "Complete section text here...",
  "generatedAt": "${new Date().toISOString()}",
  "wordCount": <total_word_count>
}

BELANGRIJKE INSTRUCTIES:
- Geef ALLEEN valid JSON terug
- Schrijf in vloeiend Nederlands
- Gebruik hun werkelijke content voorbeelden UIT EVIDENCE VELDEN
- Maak het persoonlijk en specifiek
- Focus op AI citation opportunities
- Gebruik suggestion velden voor concrete actie-items
- Quote evidence in blockquotes waar relevant
- Geen algemene SEO clichés
`;
  }
}

// Auto-register this strategy with the factory
PromptFactory.register('narrative', () => new NarrativePromptStrategy());