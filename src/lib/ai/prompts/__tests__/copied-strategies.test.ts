/**
 * Tests voor copied prompt strategies uit vertexClient.ts
 * Verificatie dat copy-first implementatie correct werkt
 */

import { describe, it, expect } from 'vitest';
import { InsightsPromptStrategy, NarrativePromptStrategy, EnterprisePromptStrategy } from '../index.js';
import type { PromptInput } from '../PromptStrategy.js';
import type { ModuleResult } from '../../../types/scan.js';
import type { EnhancedContent } from '../../../scan/ContentExtractor.js';
import type { AIInsights } from '../../vertexClient.js';

// Mock data voor testing
const mockModuleResults: ModuleResult[] = [
  {
    name: 'TechnicalSEO',
    score: 85,
    findings: [
      {
        title: 'Missing meta description',
        description: 'Page lacks meta description',
        priority: 'high',
        recommendation: 'Add descriptive meta description'
      }
    ],
    status: 'completed',
    completedAt: '2025-07-11T10:00:00Z'
  }
];

const mockEnhancedContent: Partial<EnhancedContent> = {
  authorityMarkers: [
    { text: 'expert since 2010', markerType: 'expertise', context: 'about page', confidence: 'high' }
  ],
  timeSignals: [
    { text: 'updated 2025', matchedPattern: 'year', context: 'footer', confidence: 'medium' }
  ],
  qualityClaims: [
    { text: 'best quality', claimType: 'quality', strength: 'strong', context: 'homepage', confidence: 'high' }
  ],
  businessSignals: [
    { text: 'contact us', signalType: 'contact', context: 'navigation', confidence: 'high' }
  ],
  contentQualityAssessment: { overallQualityScore: 78, temporalClaims: [], vagueStatements: [], unsupportedClaims: [] },
  missedOpportunities: [
    { category: 'authority', description: 'Customer testimonials missing', impact: 'medium', suggestion: 'Add testimonials', implementationEffort: 'medium' }
  ],
  aiOptimizationHints: []
};

const mockInsights: AIInsights = {
  missedOpportunities: [
    {
      category: 'authority',
      title: 'Strengthen expertise signals',
      description: 'Add more specific credentials',
      solution: 'Include certifications and awards',
      impactScore: 8,
      difficulty: 'medium',
      timeEstimate: '2 hours'
    }
  ],
  authorityEnhancements: [],
  citabilityImprovements: [],
  implementationPriority: ['Add testimonials', 'Improve meta descriptions'],
  generatedAt: '2025-07-11T10:00:00Z',
  confidence: 85
};

describe('Copied Prompt Strategies', () => {
  describe('InsightsPromptStrategy', () => {
    it('should generate insights prompt with all required sections', () => {
      const strategy = new InsightsPromptStrategy();
      const input: PromptInput = {
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent as EnhancedContent,
        url: 'https://example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      // Verify persona
      expect(prompt).toContain('Je bent een AI SEO-consultant');
      
      // Verify data sections
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('TechnicalSEO');
      expect(prompt).toContain('ENHANCED CONTENT ANALYSE:');
      expect(prompt).toContain('Authority Signals:');
      expect(prompt).toContain('Time Claims:');
      expect(prompt).toContain('Quality Claims:');
      
      // Verify task section
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('AI-citation opportunities');
      
      // Verify focus points
      expect(prompt).toContain('Focus op:');
      expect(prompt).toContain('**Missed Opportunities**');
      expect(prompt).toContain('**Authority Enhancements**');
      expect(prompt).toContain('**Citability Improvements**');
      
      // Verify JSON schema
      expect(prompt).toContain('RESPONSE FORMAT (Strict JSON):');
      expect(prompt).toContain('missedOpportunities');
      expect(prompt).toContain('authorityEnhancements');
      expect(prompt).toContain('citabilityImprovements');
      expect(prompt).toContain('implementationPriority');
      
      // Verify instructions
      expect(prompt).toContain('BELANGRIJKE INSTRUCTIES:');
      expect(prompt).toContain('Geef ALLEEN valid JSON terug');
    });

    it('should handle empty input gracefully', () => {
      const strategy = new InsightsPromptStrategy();
      const input: PromptInput = {};
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een AI SEO-consultant');
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('[]'); // Empty moduleResults
      expect(prompt).toContain('TAAK:');
    });

    it('should apply token limiting for large inputs', () => {
      const strategy = new InsightsPromptStrategy(1000); // Small token limit
      const largeInput: PromptInput = {
        moduleResults: Array.from({ length: 50 }, (_, i) => ({
          name: `Module${i}`,
          score: 85,
          findings: Array.from({ length: 10 }, (_, j) => ({
            title: `Finding ${j}`,
            description: `Description ${j}`.repeat(20),
            priority: 'high' as const,
            recommendation: `Recommendation ${j}`.repeat(10)
          })),
          status: 'completed' as const,
          completedAt: '2025-07-11T10:00:00Z'
        })),
        enhancedContent: mockEnhancedContent as EnhancedContent,
        url: 'https://example.com'
      };
      
      const prompt = strategy.buildPrompt(largeInput);
      
      // Should still contain essential parts
      expect(prompt).toContain('Je bent een AI SEO-consultant');
      expect(prompt).toContain('TAAK:');
      
      // Should be truncated
      expect(prompt).toContain('[Content truncated to fit token limit]');
    });
  });

  describe('NarrativePromptStrategy', () => {
    it('should generate narrative prompt with all required sections', () => {
      const strategy = new NarrativePromptStrategy();
      const input: PromptInput = {
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent as EnhancedContent,
        insights: mockInsights
      };
      
      const prompt = strategy.buildPrompt(input);
      
      // Verify persona
      expect(prompt).toContain('Je bent een persoonlijke AI-consultant');
      
      // Verify context section
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('Scan Results:');
      expect(prompt).toContain('AI Insights:');
      expect(prompt).toContain('Authority Content:');
      
      // Verify smart analysis section
      expect(prompt).toContain('SMART ANALYSIS DATA:');
      expect(prompt).toContain('Evidence:');
      expect(prompt).toContain('Suggestions:');
      
      // Verify task
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('professioneel rapport');
      
      // Verify tone guidelines
      expect(prompt).toContain('TONE:');
      expect(prompt).toContain('Persoonlijk');
      expect(prompt).toContain('Professioneel maar toegankelijk');
      
      // Verify structure
      expect(prompt).toContain('STRUCTUUR:');
      expect(prompt).toContain('**Executive Summary**');
      expect(prompt).toContain('**Detailed Analysis**');
      expect(prompt).toContain('**Implementation Roadmap**');
      expect(prompt).toContain('**Conclusion & Next Steps**');
      
      // Verify JSON response format
      expect(prompt).toContain('RESPONSE FORMAT (Strict JSON):');
      expect(prompt).toContain('executiveSummary');
      expect(prompt).toContain('detailedAnalysis');
      expect(prompt).toContain('implementationRoadmap');
      expect(prompt).toContain('conclusionNextSteps');
      
      // Verify instructions
      expect(prompt).toContain('BELANGRIJKE INSTRUCTIES:');
      expect(prompt).toContain('Schrijf in vloeiend Nederlands');
    });

    it('should handle missing insights gracefully', () => {
      const strategy = new NarrativePromptStrategy();
      const input: PromptInput = {
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent as EnhancedContent
        // insights missing
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een persoonlijke AI-consultant');
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('AI Insights: {}'); // Empty object
    });
  });

  describe('EnterprisePromptStrategy', () => {
    const mockEnterpriseFeatures = {
      multiPageAnalysis: [
        { url: 'https://example.com/about', content: {}, relativePath: '/about' },
        { url: 'https://example.com/services', content: {}, relativePath: '/services' }
      ],
      siteWidePatterns: {
        consistencyScore: 78,
        patterns: ['consistent navigation', 'mixed content quality']
      },
      competitiveContext: {
        industryCategory: 'professional-services',
        benchmarkScore: 65,
        currentScore: 82,
        competitivePosition: 'above-average'
      },
      industryBenchmark: {
        category: 'dutch-market',
        improvementPotential: 18
      },
      analysisDepth: {
        totalPagesAnalyzed: 2,
        contentSamples: 2,
        patternConsistency: 78
      }
    };

    it('should generate enterprise prompt with all required sections', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: mockInsights,
        enterpriseFeatures: mockEnterpriseFeatures
      };
      
      const prompt = strategy.buildPrompt(input);
      
      // Verify persona
      expect(prompt).toContain('Je bent een senior AI-consultant');
      expect(prompt).toContain('enterprise klant (€149.95 tier)');
      
      // Verify business analysis section
      expect(prompt).toContain('BUSINESS TIER ANALYSIS:');
      expect(prompt).toContain('Strengthen expertise signals');
      
      // Verify multi-page insights
      expect(prompt).toContain('MULTI-PAGE INSIGHTS:');
      expect(prompt).toContain('Geanalyseerde paginas: 2');
      expect(prompt).toContain('Site-wide consistentie: 78/100');
      
      // Verify competitive context
      expect(prompt).toContain('COMPETITIVE CONTEXT:');
      expect(prompt).toContain('above-average');
      
      // Verify industry benchmark
      expect(prompt).toContain('INDUSTRY BENCHMARK:');
      expect(prompt).toContain('dutch-market');
      
      // Verify task section
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('strategisch rapport (800-1200 woorden)');
      
      // Verify structure sections
      expect(prompt).toContain('1. EXECUTIVE SUMMARY');
      expect(prompt).toContain('2. MULTI-PAGE STRATEGIC ANALYSIS');
      expect(prompt).toContain('3. COMPETITIVE POSITIONING');
      expect(prompt).toContain('4. STRATEGIC IMPLEMENTATION ROADMAP');
      
      // Verify writing style
      expect(prompt).toContain('SCHRIJFSTIJL:');
      expect(prompt).toContain('Executive-level strategic focus');
      expect(prompt).toContain('Nederlandse taal, formeel niveau');
      
      // Verify JSON response format
      expect(prompt).toContain('RESPONSE FORMAT (JSON):');
      expect(prompt).toContain('executiveSummary');
      expect(prompt).toContain('multiPageAnalysis');
      expect(prompt).toContain('competitivePositioning');
      expect(prompt).toContain('strategicRoadmap');
      expect(prompt).toContain('keyMetrics');
    });

    it('should handle missing enterprise features gracefully', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: mockInsights
        // enterpriseFeatures missing
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een senior AI-consultant');
      expect(prompt).toContain('Geanalyseerde paginas: 0');
      expect(prompt).toContain('Site-wide consistentie: 0/100');
      expect(prompt).toContain('general} sector'); // Default category
    });

    it('should use industry benchmark category in competitive positioning', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: mockInsights,
        enterpriseFeatures: {
          ...mockEnterpriseFeatures,
          industryBenchmark: { category: 'e-commerce' }
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Industry benchmark comparison (e-commerce sector)');
    });

    it('should handle empty enterprise features', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: mockInsights,
        enterpriseFeatures: {}
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een senior AI-consultant');
      expect(prompt).toContain('Geanalyseerde paginas: 0');
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('RESPONSE FORMAT (JSON):');
    });

    it('should apply token limiting for large enterprise data', () => {
      const strategy = new EnterprisePromptStrategy(800); // Small token limit
      const largeEnterpriseFeatures = {
        multiPageAnalysis: Array.from({ length: 20 }, (_, i) => ({
          url: `https://example.com/page${i}`,
          content: { data: 'Large content data '.repeat(100) },
          relativePath: `/page${i}`
        })),
        siteWidePatterns: {
          consistencyScore: 85,
          patterns: Array.from({ length: 50 }, (_, i) => `Pattern ${i}: ${'description '.repeat(20)}`)
        },
        competitiveContext: {
          industryCategory: 'professional-services',
          benchmarkScore: 65,
          currentScore: 82,
          competitivePosition: 'above-average',
          detailedAnalysis: 'Very detailed competitive analysis '.repeat(100)
        }
      };
      
      const input: PromptInput = {
        insights: mockInsights,
        enterpriseFeatures: largeEnterpriseFeatures
      };
      
      const prompt = strategy.buildPrompt(input);
      
      // Should still contain essential parts
      expect(prompt).toContain('Je bent een senior AI-consultant');
      expect(prompt).toContain('TAAK:');
      
      // Should be truncated due to token limit
      expect(prompt).toContain('[Content truncated to fit token limit]');
    });

    it('should check enterprise input type guard', () => {
      const enterpriseInput: PromptInput = {
        insights: mockInsights,
        enterpriseFeatures: mockEnterpriseFeatures
      };
      
      const regularInput: PromptInput = {
        insights: mockInsights
      };
      
      expect(EnterprisePromptStrategy.isEnterpriseInput(enterpriseInput)).toBe(true);
      expect(EnterprisePromptStrategy.isEnterpriseInput(regularInput)).toBe(false);
    });
  });

  describe('Strategy Consistency', () => {
    it('should both strategies use consistent timestamp format', () => {
      const insightsStrategy = new InsightsPromptStrategy();
      const narrativeStrategy = new NarrativePromptStrategy();
      
      const input: PromptInput = {
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent as EnhancedContent,
        insights: mockInsights
      };
      
      const insightsPrompt = insightsStrategy.buildPrompt(input);
      const narrativePrompt = narrativeStrategy.buildPrompt(input);
      
      // Both should use ISO timestamp format
      expect(insightsPrompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      expect(narrativePrompt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should both strategies include JSON response format', () => {
      const insightsStrategy = new InsightsPromptStrategy();
      const narrativeStrategy = new NarrativePromptStrategy();
      
      const input: PromptInput = { moduleResults: mockModuleResults };
      
      const insightsPrompt = insightsStrategy.buildPrompt(input);
      const narrativePrompt = narrativeStrategy.buildPrompt(input);
      
      expect(insightsPrompt).toContain('RESPONSE FORMAT (Strict JSON):');
      expect(narrativePrompt).toContain('RESPONSE FORMAT (Strict JSON):');
    });
  });
});