/**
 * Tests voor VertexClient method overloads (Phase 4.1)
 * 
 * Verificatie van backwards compatibility en nieuwe prompt-based signatures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VertexAIClient } from '../vertexClient.js';
import { PromptFactory } from '../prompts/PromptFactory.js';
// Import strategies to trigger auto-registration
import '../prompts/InsightsPromptStrategy.js';
import '../prompts/NarrativePromptStrategy.js';
import '../prompts/EnterprisePromptStrategy.js';
import type { ModuleResult } from '../../types/scan.js';
import type { EnhancedContent } from '../../scan/ContentExtractor.js';
import type { AIInsights } from '../vertexClient.js';

// Mock the Vertex AI client
vi.mock('@google-cloud/vertexai', () => ({
  VertexAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  missedOpportunities: [],
                  authorityEnhancements: [],
                  citabilityImprovements: [],
                  implementationPriority: [],
                  confidence: 85,
                  generatedAt: '2025-07-11T10:00:00Z'
                })
              }]
            }
          }]
        }
      })
    })
  }))
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
  GOOGLE_CLOUD_PROJECT: 'test-project',
  VERTEX_AI_LOCATION: 'europe-west1',
  GOOGLE_APPLICATION_CREDENTIALS: './test-credentials.json'
}));

describe('VertexClient Method Overloads', () => {
  let client: VertexAIClient;
  let consoleSpy: any;

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

  const mockEnhancedContent: EnhancedContent = {
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
    contentQualityAssessment: { readability: 'good' },
    missedOpportunities: [
      { category: 'authority', title: 'Add testimonials', description: 'Customer testimonials missing', solution: 'Add customer testimonials', impactScore: 7, difficulty: 'medium', timeEstimate: '2 hours' }
    ]
  };

  const mockInsights: AIInsights = {
    missedOpportunities: [
      {
        category: 'authority',
        title: 'Strengthen expertise signals',
        description: 'Add more specific credentials',
        solution: 'Include certifications',
        impactScore: 8,
        difficulty: 'medium',
        timeEstimate: '2 hours'
      }
    ],
    authorityEnhancements: [],
    citabilityImprovements: [],
    implementationPriority: ['Add testimonials'],
    generatedAt: '2025-07-11T10:00:00Z',
    confidence: 85
  };

  beforeEach(() => {
    // Mock console.warn to capture deprecation warnings
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Initialize client
    client = new VertexAIClient();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('generateInsights Method Overloads', () => {
    it('should work with new prompt signature', async () => {
      const strategy = PromptFactory.create('insights');
      const prompt = strategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        url: 'https://example.com'
      });

      const result = await client.generateInsights(prompt);

      expect(result).toBeDefined();
      expect(result.missedOpportunities).toBeDefined();
      expect(result.confidence).toBe(85);
      expect(consoleSpy).not.toHaveBeenCalled(); // No deprecation warning
    });

    it('should work with legacy signature and show deprecation warning', async () => {
      const result = await client.generateInsights(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );

      expect(result).toBeDefined();
      expect(result.missedOpportunities).toBeDefined();
      expect(result.confidence).toBe(85);
      
      // Should show deprecation warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEPRECATED: generateInsights(moduleResults, enhancedContent, url) is deprecated')
      );
    });

    it('should throw error for legacy signature with missing parameters', async () => {
      await expect(
        client.generateInsights(mockModuleResults as any)
      ).rejects.toThrow('LEGACY_SIGNATURE_MISSING_PARAMS');
    });

    it('should distinguish between string and array parameters', async () => {
      // Test with string (new signature)
      const result1 = await client.generateInsights('Test prompt');
      expect(result1).toBeDefined();
      expect(consoleSpy).not.toHaveBeenCalled();

      // Test with array (legacy signature)
      const result2 = await client.generateInsights(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );
      expect(result2).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('generateNarrativeReport Method Overloads', () => {
    // Mock voor narrative report response
    beforeEach(() => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    executiveSummary: 'Executive summary',
                    detailedAnalysis: 'Detailed analysis',
                    implementationRoadmap: 'Implementation roadmap',
                    conclusionNextSteps: 'Conclusion and next steps',
                    generatedAt: '2025-07-11T10:00:00Z'
                  })
                }]
              }
            }]
          }
        })
      };

      // Override the mocked model
      vi.mocked(client as any).model = mockModel;
    });

    it('should work with new prompt signature', async () => {
      const strategy = PromptFactory.create('narrative');
      const prompt = strategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        insights: mockInsights
      });

      const result = await client.generateNarrativeReport(prompt);

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Executive summary');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(consoleSpy).not.toHaveBeenCalled(); // No deprecation warning
    });

    it('should work with legacy signature and show deprecation warning', async () => {
      const result = await client.generateNarrativeReport(
        mockModuleResults,
        mockEnhancedContent,
        mockInsights
      );

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Executive summary');
      
      // Should show deprecation warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEPRECATED: generateNarrativeReport(moduleResults, enhancedContent, insights) is deprecated')
      );
    });

    it('should throw error for legacy signature with missing parameters', async () => {
      await expect(
        client.generateNarrativeReport(mockModuleResults as any)
      ).rejects.toThrow('LEGACY_SIGNATURE_MISSING_PARAMS');
    });
  });

  describe('generateEnterpriseReport Method', () => {
    // Mock voor enterprise report response
    beforeEach(() => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    executiveSummary: 'Executive summary',
                    multiPageAnalysis: 'Multi-page analysis',
                    competitivePositioning: 'Competitive positioning',
                    strategicRoadmap: 'Strategic roadmap',
                    keyMetrics: {
                      estimatedROI: '150%',
                      implementationTimeframe: '3-6 months',
                      priorityActions: ['Action 1', 'Action 2']
                    },
                    generatedAt: '2025-07-11T10:00:00Z'
                  })
                }]
              }
            }]
          }
        })
      };

      vi.mocked(client as any).model = mockModel;
    });

    it('should generate enterprise report with new signature', async () => {
      const strategy = PromptFactory.create('enterprise');
      const prompt = strategy.buildPrompt({
        insights: mockInsights,
        enterpriseFeatures: {
          multiPageAnalysis: [
            { url: 'https://example.com', content: {}, relativePath: '/' }
          ],
          siteWidePatterns: { consistencyScore: 80 },
          competitiveContext: { competitivePosition: 'above-average' },
          industryBenchmark: { category: 'professional-services' }
        }
      });

      const result = await client.generateEnterpriseReport(prompt);

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Executive summary');
      expect(result.multiPageAnalysis).toBe('Multi-page analysis');
      expect(result.competitivePositioning).toBe('Competitive positioning');
      expect(result.strategicRoadmap).toBe('Strategic roadmap');
      expect(result.keyMetrics.estimatedROI).toBe('150%');
      expect(result.keyMetrics.priorityActions).toEqual(['Action 1', 'Action 2']);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should handle parsing errors gracefully', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            candidates: [{
              content: {
                parts: [{
                  text: 'Invalid JSON response'
                }]
              }
            }]
          }
        })
      };

      vi.mocked(client as any).model = mockModel;

      await expect(
        client.generateEnterpriseReport('test prompt')
      ).rejects.toThrow('ENTERPRISE_GENERATION_FAILED');
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain existing API contracts', async () => {
      // Test that existing code still works
      const insightsResult = await client.generateInsights(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );
      
      expect(insightsResult).toHaveProperty('missedOpportunities');
      expect(insightsResult).toHaveProperty('authorityEnhancements');
      expect(insightsResult).toHaveProperty('citabilityImprovements');
      expect(insightsResult).toHaveProperty('implementationPriority');
      expect(insightsResult).toHaveProperty('generatedAt');
      expect(insightsResult).toHaveProperty('confidence');
    });

    it('should preserve error handling behavior', async () => {
      // Test budget exceeded error
      vi.mocked(client as any).costTracker.currentSpend = 1000;
      vi.mocked(client as any).costTracker.maxBudgetEuros = 0.10;

      await expect(
        client.generateInsights(mockModuleResults, mockEnhancedContent, 'https://example.com')
      ).rejects.toThrow('BUDGET_EXCEEDED');

      await expect(
        client.generateInsights('test prompt')
      ).rejects.toThrow('BUDGET_EXCEEDED');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty AI responses for all methods', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            candidates: []
          }
        })
      };

      vi.mocked(client as any).model = mockModel;

      await expect(
        client.generateInsights('test prompt')
      ).rejects.toThrow('AI_INSIGHTS_FAILED');

      await expect(
        client.generateNarrativeReport('test prompt')
      ).rejects.toThrow('NARRATIVE_GENERATION_FAILED');

      await expect(
        client.generateEnterpriseReport('test prompt')
      ).rejects.toThrow('ENTERPRISE_GENERATION_FAILED');
    });

    it('should handle API failures gracefully', async () => {
      const mockModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      };

      vi.mocked(client as any).model = mockModel;

      await expect(
        client.generateInsights('test prompt')
      ).rejects.toThrow('AI_INSIGHTS_FAILED');

      await expect(
        client.generateNarrativeReport('test prompt')
      ).rejects.toThrow('NARRATIVE_GENERATION_FAILED');

      await expect(
        client.generateEnterpriseReport('test prompt')
      ).rejects.toThrow('ENTERPRISE_GENERATION_FAILED');
    });
  });
});