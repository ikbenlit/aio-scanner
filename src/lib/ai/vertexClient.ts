/**
 * Phase 3.2A - Vertex AI Client for Production Use
 * Based on working vertexTest.ts configuration
 */

import { VertexAI } from '@google-cloud/vertexai';
import { GOOGLE_CLOUD_PROJECT, VERTEX_AI_LOCATION, GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';
import { resolve } from 'path';
import type { ModuleResult } from '../types/scan.js';
import type { EnhancedContent } from '../scan/ContentExtractor.js';
import { WebsiteContextAnalyzer, type WebsiteContext } from './prompts/shared/WebsiteContextAnalyzer.js';
import { PromptFactory } from './prompts/PromptFactory.js';

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

export interface EnterpriseReport {
  executiveSummary: string;
  multiPageAnalysis: string;
  competitivePositioning: string;
  strategicRoadmap: string;
  keyMetrics: {
    estimatedROI: string;
    implementationTimeframe: string;
    priorityActions: string[];
  };
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
   * Generate AI Insights using a prompt string
   */
  async generateInsights(prompt: string): Promise<AIInsights> {
    
    // Budget check
    if (!this.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
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
   * Generate Narrative Report using a prompt string
   */
  async generateNarrativeReport(prompt: string): Promise<NarrativeReport> {
    
    if (!this.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
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
   * Phase 4.1: Generate Enterprise Report - NEW signature with direct prompt
   */
  async generateEnterpriseReport(prompt: string): Promise<EnterpriseReport> {
    
    if (!this.canAffordRequest()) {
      throw new Error('BUDGET_EXCEEDED');
    }
    
    try {
      console.log('🏢 Generating enterprise report...');
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('AI_ENTERPRISE_EMPTY');
      }
      
      this.recordRequest(Date.now(), prompt.length);
      
      return this.parseEnterpriseReport(responseText);
      
    } catch (error: any) {
      console.error('❌ Enterprise report generation failed:', error);
      throw new Error('ENTERPRISE_GENERATION_FAILED');
    }
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
   * Phase 4.1: Parse Enterprise Report JSON response
   */
  private parseEnterpriseReport(responseText: string): EnterpriseReport {
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Calculate word count
      const totalText = [
        parsed.executiveSummary,
        parsed.multiPageAnalysis,
        parsed.competitivePositioning,
        parsed.strategicRoadmap
      ].join(' ');
      
      const wordCount = totalText.split(/\s+/).length;
      
      return {
        executiveSummary: parsed.executiveSummary || '',
        multiPageAnalysis: parsed.multiPageAnalysis || '',
        competitivePositioning: parsed.competitivePositioning || '',
        strategicRoadmap: parsed.strategicRoadmap || '',
        keyMetrics: {
          estimatedROI: parsed.keyMetrics?.estimatedROI || '',
          implementationTimeframe: parsed.keyMetrics?.implementationTimeframe || '',
          priorityActions: parsed.keyMetrics?.priorityActions || []
        },
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        wordCount
      };
      
    } catch (error) {
      console.error('❌ Failed to parse enterprise report:', error);
      console.error('Raw response:', responseText);
      throw new Error('ENTERPRISE_PARSE_FAILED');
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