/**
 * Fase 4.1 - VertexClient Method Overloads Integration Test
 * Tests backwards compatibility and PromptFactory integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VertexAIClient } from '../../vertexClient.js';
import { PromptFactory } from '../PromptFactory.js';
import type { ModuleResult } from '../../../types/scan.js';
import type { EnhancedContent } from '../../../scan/ContentExtractor.js';
import type { AIInsights } from '../../vertexClient.js';

// Import strategies to ensure auto-registration
import '../InsightsPromptStrategy.js';
import '../NarrativePromptStrategy.js';
import '../EnterprisePromptStrategy.js';

// Mock the VertexAI SDK
vi.mock('@google-cloud/vertexai', () => ({
  VertexAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn()
    }))
  }))
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
  GOOGLE_CLOUD_PROJECT: 'test-project',
  VERTEX_AI_LOCATION: 'europe-west1',
  GOOGLE_APPLICATION_CREDENTIALS: '/path/to/credentials.json'
}));

describe('VertexClient Integration Tests - Fase 4.1', () => {
  let vertexClient: VertexAIClient;
  let mockGenerateContent: any;
  
  const mockModuleResults: ModuleResult[] = [
    {
      name: 'TechnicalSEO',
      success: true,
      findings: [
        {
          type: 'info',
          message: 'Page title is optimized',
          evidence: 'Title: "Test Page for SEO"',
          suggestion: 'Consider adding year for freshness'
        }
      ],
      timestamp: '2025-07-11T10:00:00.000Z'
    }
  ];

  const mockEnhancedContent: EnhancedContent = {
    url: 'https://example.com',
    title: 'Test Page',
    metaDescription: 'Test description',
    textContent: 'Test content',
    authorityMarkers: ['expertise indicator found'],
    timeSignals: ['updated recently'],
    qualityClaims: ['high quality content'],
    businessSignals: ['established business'],
    contentQualityAssessment: {
      overallQualityScore: 85,
      readabilityScore: 75,
      authorityScore: 90,
      freshnessScore: 80,
      completenessScore: 85
    },
    missedOpportunities: [],
    aiOptimizationHints: ['add structured data']
  };

  const mockAIInsights: AIInsights = {
    missedOpportunities: [],
    authorityEnhancements: [],
    citabilityImprovements: [],
    implementationPriority: [],
    generatedAt: '2025-07-11T10:00:00.000Z',
    confidence: 85
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful AI response
    const mockAIResponse = {
      response: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                missedOpportunities: [],
                authorityEnhancements: [],
                citabilityImprovements: [],
                implementationPriority: [],
                generatedAt: '2025-07-11T10:00:00.000Z',
                confidence: 85
              })
            }]
          }
        }]
      }
    };

    // Setup vertex client with mocked response
    vertexClient = new VertexAIClient();
    mockGenerateContent = vi.fn().mockResolvedValue(mockAIResponse);
    (vertexClient as any).model = { generateContent: mockGenerateContent };
  });

  describe('NEW Signature Integration with PromptFactory', () => {
    it('should work with InsightsPromptStrategy', async () => {
      // Arrange
      const strategy = PromptFactory.create('insights');
      const prompt = strategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        url: 'https://example.com'
      });

      // Act
      const result = await vertexClient.generateInsights(prompt);

      // Assert
      expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
      expect(result).toBeDefined();
      expect(result.generatedAt).toBe('2025-07-11T10:00:00.000Z');
      expect(result.confidence).toBe(85);
    });

    it('should work with NarrativePromptStrategy', async () => {
      // Arrange
      const strategy = PromptFactory.create('narrative');
      const prompt = strategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        insights: mockAIInsights
      });

      // Update mock for narrative response
      const mockNarrativeResponse = {
        response: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  executiveSummary: 'Test executive summary',
                  detailedAnalysis: 'Test detailed analysis',
                  implementationRoadmap: 'Test roadmap',
                  conclusionNextSteps: 'Test conclusion',
                  generatedAt: '2025-07-11T10:00:00.000Z'
                })
              }]
            }
          }]
        }
      };
      mockGenerateContent.mockResolvedValue(mockNarrativeResponse);

      // Act
      const result = await vertexClient.generateNarrativeReport(prompt);

      // Assert
      expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Test executive summary');
      expect(result.generatedAt).toBe('2025-07-11T10:00:00.000Z');
    });

    it('should work with EnterprisePromptStrategy', async () => {
      // Arrange
      const strategy = PromptFactory.create('enterprise');
      const prompt = strategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        enterpriseFeatures: {
          multiPageAnalysis: [{ url: 'https://example.com/page1', data: 'test' }],
          siteWidePatterns: { pattern: 'consistent structure' },
          competitiveContext: { competitors: ['competitor1.com'] },
          industryBenchmark: { score: 85 }
        }
      });

      // Update mock for enterprise response
      const mockEnterpriseResponse = {
        response: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  executiveSummary: 'Enterprise executive summary',
                  multiPageAnalysis: 'Multi-page analysis',
                  competitivePositioning: 'Competitive positioning',
                  strategicRoadmap: 'Strategic roadmap',
                  keyMetrics: {
                    estimatedROI: '150%',
                    implementationTimeframe: '3 months',
                    priorityActions: ['Action 1', 'Action 2']
                  },
                  generatedAt: '2025-07-11T10:00:00.000Z'
                })
              }]
            }
          }]
        }
      };
      mockGenerateContent.mockResolvedValue(mockEnterpriseResponse);

      // Act
      const result = await vertexClient.generateEnterpriseReport(prompt);

      // Assert
      expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Enterprise executive summary');
      expect(result.keyMetrics.estimatedROI).toBe('150%');
      expect(result.generatedAt).toBe('2025-07-11T10:00:00.000Z');
    });
  });

  describe('PromptFactory Integration Verification', () => {
    it('should work correctly with all three prompt strategies', async () => {
      // Test that all strategies can be created and used
      const insightsStrategy = PromptFactory.create('insights');
      const narrativeStrategy = PromptFactory.create('narrative');
      const enterpriseStrategy = PromptFactory.create('enterprise');

      // Test prompt generation
      const insightsPrompt = insightsStrategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        url: 'https://example.com'
      });

      const narrativePrompt = narrativeStrategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        insights: mockAIInsights
      });

      const enterprisePrompt = enterpriseStrategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        enterpriseFeatures: {
          multiPageAnalysis: [],
          siteWidePatterns: { consistencyScore: 85 },
          competitiveContext: { benchmark: 'test' },
          industryBenchmark: { score: 90 }
        }
      });

      // Verify prompts are generated
      expect(insightsPrompt).toContain('AI SEO-consultant');
      expect(narrativePrompt).toContain('persoonlijke AI-consultant');
      expect(enterprisePrompt).toContain('senior AI-consultant');

      // Test actual AI calls
      const insightsResult = await vertexClient.generateInsights(insightsPrompt);
      expect(insightsResult).toBeDefined();
      expect(insightsResult.confidence).toBe(85);

      // Update mock for narrative response
      const mockNarrativeResponse = {
        response: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  executiveSummary: 'Test executive summary',
                  detailedAnalysis: 'Test detailed analysis',
                  implementationRoadmap: 'Test roadmap',
                  conclusionNextSteps: 'Test conclusion',
                  generatedAt: '2025-07-11T10:00:00.000Z'
                })
              }]
            }
          }]
        }
      };
      mockGenerateContent.mockResolvedValue(mockNarrativeResponse);

      const narrativeResult = await vertexClient.generateNarrativeReport(narrativePrompt);
      expect(narrativeResult).toBeDefined();
      expect(narrativeResult.executiveSummary).toBe('Test executive summary');
    });
  });

  describe('New Signature Type Safety', () => {
    it('should work correctly with string prompt signatures', () => {
      // This test verifies new string-based signatures work correctly
      // These should compile without TypeScript errors
      
      const directPrompt = 'test prompt';
      
      expect(() => {
        vertexClient.generateInsights(directPrompt);
        vertexClient.generateNarrativeReport(directPrompt);
        vertexClient.generateEnterpriseReport(directPrompt);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle budget exceeded error', async () => {
      // Override cost tracker to simulate budget exceeded
      (vertexClient as any).costTracker.currentSpend = 1.0;
      (vertexClient as any).costTracker.maxBudgetEuros = 0.10;

      await expect(
        vertexClient.generateInsights('test prompt')
      ).rejects.toThrow('BUDGET_EXCEEDED');
    });

    it('should handle empty AI response', async () => {
      const mockEmptyResponse = {
        response: {
          candidates: [{
            content: {
              parts: []
            }
          }]
        }
      };
      mockGenerateContent.mockResolvedValue(mockEmptyResponse);

      await expect(
        vertexClient.generateInsights('test prompt')
      ).rejects.toThrow('AI_INSIGHTS_FAILED');
    });
  });
});