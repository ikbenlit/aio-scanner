/**
 * Integration tests for PromptHelpers with example strategies
 */

import { describe, it, expect } from 'vitest';
import { ExampleInsightsStrategy, ExampleNarrativeStrategy, ExampleEnterpriseStrategy } from './fixtures/example-strategy.js';
import type { PromptInput } from '../PromptStrategy.js';

describe('PromptHelpers Integration', () => {
  const mockPromptInput: PromptInput = {
    url: 'https://example.com',
    moduleResults: [
      {
        moduleName: 'TechnicalSEO',
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
    ],
    enhancedContent: {
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
      contentQualityAssessment: { score: 78, readability: 'good' },
      missedOpportunities: [
        { title: 'Add testimonials', description: 'Customer testimonials missing', priority: 'medium' }
      ]
    },
    insights: {
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
    },
    enterpriseFeatures: {
      multiPageAnalysis: [
        { url: 'https://example.com/about', content: {}, relativePath: '/about' }
      ],
      siteWidePatterns: {
        consistencyScore: 72,
        patterns: ['consistent navigation', 'mixed content quality']
      },
      competitiveContext: {
        industryCategory: 'general',
        benchmarkScore: 65,
        currentScore: 85,
        competitivePosition: 'above-average'
      },
      industryBenchmark: {
        category: 'dutch-market',
        improvementPotential: 15
      }
    }
  };

  describe('ExampleInsightsStrategy', () => {
    it('should generate a complete insights prompt', () => {
      const strategy = new ExampleInsightsStrategy();
      const prompt = strategy.buildPrompt(mockPromptInput);
      
      expect(prompt).toContain('AI SEO-consultant');
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('TechnicalSEO');
      expect(prompt).toContain('ENHANCED CONTENT ANALYSE:');
      expect(prompt).toContain('Authority Signals:');
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('AI-citation opportunities');
      expect(prompt).toContain('RESPONSE FORMAT');
      expect(prompt).toContain('missedOpportunities');
      expect(prompt).toContain('BELANGRIJKE INSTRUCTIES:');
      expect(prompt).toContain('Geef ALLEEN valid JSON terug');
    });

    it('should handle empty input gracefully', () => {
      const strategy = new ExampleInsightsStrategy();
      const prompt = strategy.buildPrompt({});
      
      expect(prompt).toContain('AI SEO-consultant');
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('[]'); // Empty array for moduleResults
      expect(prompt).toContain('TAAK:');
    });
  });

  describe('ExampleNarrativeStrategy', () => {
    it('should generate a complete narrative prompt', () => {
      const strategy = new ExampleNarrativeStrategy();
      const prompt = strategy.buildPrompt(mockPromptInput);
      
      expect(prompt).toContain('persoonlijke AI-consultant');
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('scanResults');
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('professioneel rapport');
      expect(prompt).toContain('TONE:');
      expect(prompt).toContain('Persoonlijk');
      expect(prompt).toContain('STRUCTUUR:');
      expect(prompt).toContain('Executive Summary');
      expect(prompt).toContain('150-200 woorden');
      expect(prompt).toContain('RESPONSE FORMAT');
      expect(prompt).toContain('executiveSummary');
    });

    it('should include all required sections', () => {
      const strategy = new ExampleNarrativeStrategy();
      const prompt = strategy.buildPrompt(mockPromptInput);
      
      const requiredSections = [
        'Executive Summary',
        'Detailed Analysis',
        'Implementation Roadmap',
        'Conclusion & Next Steps'
      ];
      
      requiredSections.forEach(section => {
        expect(prompt).toContain(section);
      });
    });
  });

  describe('ExampleEnterpriseStrategy', () => {
    it('should generate a complete enterprise prompt', () => {
      const strategy = new ExampleEnterpriseStrategy();
      const prompt = strategy.buildPrompt(mockPromptInput);
      
      expect(prompt).toContain('senior AI-consultant');
      expect(prompt).toContain('BUSINESS TIER ANALYSIS:');
      expect(prompt).toContain('MULTI-PAGE INSIGHTS:');
      expect(prompt).toContain('Geanalyseerde paginas: 1');
      expect(prompt).toContain('Site-wide consistentie: 72/100');
      expect(prompt).toContain('COMPETITIVE CONTEXT:');
      expect(prompt).toContain('above-average');
      expect(prompt).toContain('TAAK:');
      expect(prompt).toContain('strategisch rapport');
      expect(prompt).toContain('STRUCTUUR:');
      expect(prompt).toContain('EXECUTIVE SUMMARY');
      expect(prompt).toContain('MULTI-PAGE STRATEGIC ANALYSIS');
      expect(prompt).toContain('COMPETITIVE POSITIONING');
      expect(prompt).toContain('STRATEGIC IMPLEMENTATION ROADMAP');
    });

    it('should handle missing enterprise features', () => {
      const strategy = new ExampleEnterpriseStrategy();
      const inputWithoutEnterprise = { ...mockPromptInput };
      delete inputWithoutEnterprise.enterpriseFeatures;
      
      const prompt = strategy.buildPrompt(inputWithoutEnterprise);
      
      expect(prompt).toContain('senior AI-consultant');
      expect(prompt).toContain('Geanalyseerde paginas: 0');
      expect(prompt).toContain('Site-wide consistentie: 0/100');
    });
  });

  describe('Token Limiting Integration', () => {
    it('should respect token limits in generated prompts', () => {
      const strategy = new ExampleInsightsStrategy(500); // Small token limit
      const largeInput = {
        ...mockPromptInput,
        moduleResults: Array.from({ length: 100 }, (_, i) => ({
          moduleName: `Module${i}`,
          score: 85,
          findings: Array.from({ length: 10 }, (_, j) => ({
            title: `Finding ${j} for module ${i}`,
            description: `This is a long description for finding ${j} in module ${i}. `.repeat(10),
            priority: 'high' as const,
            recommendation: `Long recommendation for finding ${j}. `.repeat(5)
          })),
          status: 'completed' as const,
          completedAt: '2025-07-11T10:00:00Z'
        }))
      };
      
      const prompt = strategy.buildPrompt(largeInput);
      
      // Should still contain essential parts but be truncated
      expect(prompt).toContain('AI SEO-consultant');
      expect(prompt).toContain('TAAK:');
      expect(prompt.length).toBeLessThan(10000); // Should be significantly shorter than full content
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      const strategy = new ExampleInsightsStrategy();
      const prompt = strategy.buildPrompt({
        url: undefined,
        moduleResults: null as any,
        enhancedContent: undefined
      });
      
      expect(prompt).toContain('AI SEO-consultant');
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('null'); // Should handle null gracefully
    });

    it('should generate valid prompts even with minimal data', () => {
      const strategy = new ExampleNarrativeStrategy();
      const prompt = strategy.buildPrompt({ url: 'https://test.com' });
      
      expect(prompt).toContain('persoonlijke AI-consultant');
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('RESPONSE FORMAT');
      expect(prompt.length).toBeGreaterThan(100);
    });
  });
});