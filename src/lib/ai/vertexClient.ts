/**
 * Phase 3.2A - Vertex AI Client for Production Use
 * Based on working vertexTest.ts configuration
 */

import { VertexAI } from '@google-cloud/vertexai';
import { GOOGLE_CLOUD_PROJECT, VERTEX_AI_LOCATION, GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';
import { resolve } from 'path';
import type { ModuleResult } from '../scan/types.js';
import type { EnhancedContent } from '../scan/ContentExtractor.js';

// Phase 3.2A Types
export interface AIInsights {
  missedOpportunities: MissedOpportunity[];
  authorityEnhancements: AuthorityEnhancement[];
  citabilityImprovements: CitabilityImprovement[];
  implementationPriority: string[];
  generatedAt: string;
  confidence: number;
}

export interface MissedOpportunity {
  category: 'authority' | 'specificity' | 'evidence' | 'differentiation' | 'ai_optimization';
  title: string;
  description: string;
  solution: string;
  beforeExample?: string;
  afterExample?: string;
  impactScore: number; // 1-10
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
}

export interface AuthorityEnhancement {
  currentSignal: string;
  enhancedVersion: string;
  explanation: string;
  impact: 'low' | 'medium' | 'high';
}

export interface CitabilityImprovement {
  section: string;
  currentContent: string;
  improvedContent: string;
  aiReasoning: string;
  citationPotential: number; // 1-10
}

export interface NarrativeReport {
  executiveSummary: string;
  detailedAnalysis: string;
  implementationRoadmap: string;
  conclusionNextSteps: string;
  generatedAt: string;
  wordCount: number;
}

export interface CostTracker {
  maxBudgetEuros: number;
  currentSpend: number;
  requestCount: number;
  averageCostPerRequest: number;
}

export class VertexAIClient {
  private vertex: VertexAI;
  private model: any;
  private costTracker: CostTracker;

  constructor() {
    // Set up authentication using working configuration from vertexTest
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(GOOGLE_APPLICATION_CREDENTIALS);
    
    this.vertex = new VertexAI({
      project: GOOGLE_CLOUD_PROJECT,
      location: 'europe-west1' // EU region for GDPR compliance (confirmed working)
    });
    
    // Use cost-effective model for business tier
    this.model = this.vertex.getGenerativeModel({
      model: 'gemini-2.0-flash', // Same as working test
      generationConfig: {
        maxOutputTokens: 2000, // Sufficient for narrative content
        temperature: 0.4, // Balance between creativity and consistency
        topP: 0.8,
        topK: 32
      }
    });
    
    // Initialize cost tracking with €0.10 max per scan
    this.costTracker = {
      maxBudgetEuros: 0.10,
      currentSpend: 0,
      requestCount: 0,
      averageCostPerRequest: 0.02 // Conservative estimate
    };
  }

  /**
   * Phase 3.2A: Generate AI Insights from module results and enhanced content
   */
  async generateInsights(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
  ): Promise<AIInsights> {
    
    // Budget check
    if (!this.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
    const prompt = this.buildInsightsPrompt(moduleResults, enhancedContent);
    
    try {
      console.log('🧠 Generating AI insights...');
      const startTime = Date.now();
      
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('AI_RESPONSE_EMPTY');
      }
      
      const duration = Date.now() - startTime;
      this.recordRequest(duration, prompt.length);
      
      return this.parseInsights(responseText);
      
    } catch (error: any) {
      console.error('❌ AI insights generation failed:', error);
      throw new Error('AI_INSIGHTS_FAILED');
    }
  }

  /**
   * Phase 3.2A: Generate Narrative Report for Business Tier
   */
  async generateNarrativeReport(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent,
    insights: AIInsights
  ): Promise<NarrativeReport> {
    
    if (!this.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
    const prompt = this.buildNarrativePrompt(moduleResults, enhancedContent, insights);
    
    try {
      console.log('📝 Generating narrative report...');
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('AI_NARRATIVE_EMPTY');
      }
      
      this.recordRequest(Date.now(), prompt.length);
      
      return this.parseNarrativeReport(responseText);
      
    } catch (error: any) {
      console.error('❌ Narrative generation failed:', error);
      throw new Error('NARRATIVE_GENERATION_FAILED');
    }
  }

  /**
   * Phase 3.2A: Insights Prompt Engineering
   */
  private buildInsightsPrompt(
    moduleResults: ModuleResult[], 
    enhancedContent: EnhancedContent
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

  /**
   * Phase 3.2A: Narrative Report Prompt Engineering
   */
  private buildNarrativePrompt(
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
   - Dieper ingaan op specifieke bevindingen
   - Uitleggen waarom dit belangrijk is voor hun business
   - Concrete voorbeelden uit hun eigen content
   - Focus op AI-readiness en citation potential

3. **Implementation Roadmap** (200-250 woorden)
   - Prioriteer acties op impact vs effort
   - Stap-voor-stap instructies
   - Realistische tijdschattingen
   - Quick wins eerst

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
- Gebruik hun werkelijke content voorbeelden
- Maak het persoonlijk en specifiek
- Focus op AI citation opportunities
- Geen algemene SEO clichés
`;
  }

  /**
   * Phase 3.2A: Parse AI Insights Response
   */
  private parseInsights(responseText: string): AIInsights {
    try {
      // Clean response (sometimes AI adds markdown formatting)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsed.missedOpportunities || !Array.isArray(parsed.missedOpportunities)) {
        throw new Error('Invalid insights format: missing missedOpportunities');
      }
      
      return {
        missedOpportunities: parsed.missedOpportunities || [],
        authorityEnhancements: parsed.authorityEnhancements || [],
        citabilityImprovements: parsed.citabilityImprovements || [],
        implementationPriority: parsed.implementationPriority || [],
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        confidence: parsed.confidence || 75
      };
      
    } catch (error) {
      console.error('❌ Failed to parse AI insights:', error);
      console.error('Raw response:', responseText);
      throw new Error('AI_INSIGHTS_PARSE_FAILED');
    }
  }

  /**
   * Phase 3.2A: Parse Narrative Report Response
   */
  private parseNarrativeReport(responseText: string): NarrativeReport {
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Calculate word count
      const totalText = [
        parsed.executiveSummary,
        parsed.detailedAnalysis,
        parsed.implementationRoadmap,
        parsed.conclusionNextSteps
      ].join(' ');
      
      const wordCount = totalText.split(/\s+/).length;
      
      return {
        executiveSummary: parsed.executiveSummary || '',
        detailedAnalysis: parsed.detailedAnalysis || '',
        implementationRoadmap: parsed.implementationRoadmap || '',
        conclusionNextSteps: parsed.conclusionNextSteps || '',
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        wordCount
      };
      
    } catch (error) {
      console.error('❌ Failed to parse narrative report:', error);
      console.error('Raw response:', responseText);
      throw new Error('NARRATIVE_PARSE_FAILED');
    }
  }

  /**
   * Phase 3.2A: Cost Control Methods
   */
  private canAffordRequest(): boolean {
    const projectedCost = this.costTracker.currentSpend + this.costTracker.averageCostPerRequest;
    return projectedCost <= this.costTracker.maxBudgetEuros;
  }

  private recordRequest(durationMs: number, promptLength: number): void {
    // Rough cost estimation for Gemini 2.0 Flash
    // Input: ~$0.075 per 1M tokens, Output: ~$0.30 per 1M tokens
    const estimatedInputTokens = promptLength / 4; // ~4 chars per token
    const estimatedOutputTokens = 500; // Conservative estimate
    
    const inputCost = (estimatedInputTokens / 1000000) * 0.075;
    const outputCost = (estimatedOutputTokens / 1000000) * 0.30;
    const totalCostUSD = inputCost + outputCost;
    const totalCostEUR = totalCostUSD * 0.95; // Rough USD to EUR
    
    this.costTracker.currentSpend += totalCostEUR;
    this.costTracker.requestCount++;
    this.costTracker.averageCostPerRequest = 
      this.costTracker.currentSpend / this.costTracker.requestCount;
    
    console.log(`💰 AI Request cost: €${totalCostEUR.toFixed(4)} | Total: €${this.costTracker.currentSpend.toFixed(4)}`);
  }

  /**
   * Public cost tracking methods
   */
  public getCurrentCost(): number {
    return this.costTracker.currentSpend;
  }

  public getRemainingBudget(): number {
    return this.costTracker.maxBudgetEuros - this.costTracker.currentSpend;
  }

  public getCostSummary(): CostTracker {
    return { ...this.costTracker };
  }
}