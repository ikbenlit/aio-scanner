/**
 * Fase 4.2 - Tier Strategy PromptFactory Integration Test
 * Tests integration between tier strategies and PromptFactory
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMEnhancementService } from '../../LLMEnhancementService.js';
import { EnterpriseTierStrategy } from '../EnterpriseTierStrategy.js';
import { PromptFactory } from '../../../ai/prompts/PromptFactory.js';
import type { ScanDependencies } from '../TierScanStrategy.js';
import type { ModuleResult } from '../../../types/scan.js';
import type { EnhancedContent } from '../../ContentExtractor.js';

// Import strategies to ensure auto-registration
import '../../../ai/prompts/InsightsPromptStrategy.js';
import '../../../ai/prompts/NarrativePromptStrategy.js';
import '../../../ai/prompts/EnterprisePromptStrategy.js';

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

describe('Tier Strategy PromptFactory Integration - Fase 4.2', () => {
  let llmEnhancementService: LLMEnhancementService;
  let enterpriseTierStrategy: EnterpriseTierStrategy;
  let mockGenerateContent: any;
  let mockDependencies: ScanDependencies;
  
  const mockModuleResults: ModuleResult[] = [
    {
      name: 'TechnicalSEO',
      success: true,
      score: 85,
      findings: [
        {
          type: 'info',
          message: 'Page title is optimized',
          evidence: 'Title: "Test Page for Enterprise SEO"',
          suggestion: 'Consider adding year for freshness'
        }
      ],
      timestamp: '2025-07-11T10:00:00.000Z'
    },
    {
      name: 'SchemaMarkup',
      success: true,
      score: 90,
      findings: [],
      timestamp: '2025-07-11T10:00:00.000Z'
    }
  ];

  const mockEnhancedContent: EnhancedContent = {
    url: 'https://example.com',
    title: 'Enterprise Test Page',
    metaDescription: 'Enterprise SEO testing page',
    textContent: 'Professional enterprise content',
    authorityMarkers: ['industry leader', 'certified expert'],
    timeSignals: ['updated 2025'],
    qualityClaims: ['premium quality', 'enterprise-grade'],
    businessSignals: ['established since 2020'],
    contentQualityAssessment: {
      overallQualityScore: 90,
      readabilityScore: 85,
      authorityScore: 95,
      freshnessScore: 88,
      completenessScore: 92,
      unsupportedClaims: [],
      vagueStatements: []
    },
    missedOpportunities: [],
    aiOptimizationHints: ['implement structured data']
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful AI responses
    const mockInsightsResponse = {
      response: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                missedOpportunities: [
                  {
                    category: 'authority',
                    title: 'Enhance enterprise authority',
                    description: 'Add more industry credentials',
                    solution: 'Include certifications and awards',
                    impactScore: 8,
                    difficulty: 'medium',
                    timeEstimate: '2 hours'
                  }
                ],
                authorityEnhancements: [
                  {
                    currentSignal: 'industry leader',
                    enhancedVersion: 'industry leader with 10+ years experience',
                    explanation: 'Add specific experience duration',
                    impact: 'high'
                  }
                ],
                citabilityImprovements: [],
                implementationPriority: ['Enhance authority signals', 'Add certifications'],
                generatedAt: '2025-07-11T10:00:00.000Z',
                confidence: 90
              })
            }]
          }
        }]
      }
    };

    const mockNarrativeResponse = {
      response: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                executiveSummary: 'Enterprise analysis reveals strong foundation with strategic opportunities',
                detailedAnalysis: 'Comprehensive analysis shows enterprise-level authority with room for enhancement',
                implementationRoadmap: 'Strategic roadmap for enterprise SEO optimization',
                conclusionNextSteps: 'Focus on authority enhancement and certification display',
                generatedAt: '2025-07-11T10:00:00.000Z'
              })
            }]
          }
        }]
      }
    };

    const mockEnterpriseResponse = {
      response: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                executiveSummary: 'Enterprise strategic analysis completed',
                multiPageAnalysis: 'Multi-page enterprise analysis results',
                competitivePositioning: 'Strong competitive position identified',
                strategicRoadmap: 'Enterprise strategic roadmap developed',
                keyMetrics: {
                  estimatedROI: '200%',
                  implementationTimeframe: '6 months',
                  priorityActions: ['Authority enhancement', 'Competitive positioning']
                },
                generatedAt: '2025-07-11T10:00:00.000Z'
              })
            }]
          }
        }]
      }
    };

    // Setup mock generate content to return different responses based on prompt content
    mockGenerateContent = vi.fn()
      .mockResolvedValueOnce(mockInsightsResponse)  // First call for insights
      .mockResolvedValueOnce(mockNarrativeResponse) // Second call for narrative
      .mockResolvedValueOnce(mockInsightsResponse)  // Third call for insights
      .mockResolvedValueOnce(mockNarrativeResponse) // Fourth call for narrative
      .mockResolvedValueOnce(mockEnterpriseResponse) // Fifth call for enterprise
      .mockResolvedValue(mockInsightsResponse); // Default for additional calls

    // Setup LLMEnhancementService with mocked VertexClient
    llmEnhancementService = new LLMEnhancementService();
    (llmEnhancementService as any).vertexClient.model = { generateContent: mockGenerateContent };

    // Setup EnterpriseTierStrategy
    enterpriseTierStrategy = new EnterpriseTierStrategy();

    // Mock dependencies
    mockDependencies = {
      modules: [],
      aiReportGenerator: {} as any,
      contentExtractor: {} as any,
      llmEnhancementService,
      pdfGenerator: {} as any,
      sharedContentService: {} as any
    };
  });

  describe('LLMEnhancementService PromptFactory Integration', () => {
    it('should use PromptFactory for insights generation', async () => {
      // Act
      const result = await llmEnhancementService.enhanceFindings(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );

      // Assert
      expect(result.insights).toBeDefined();
      expect(result.insights.confidence).toBe(90);
      expect(result.insights.missedOpportunities).toHaveLength(1);
      expect(result.insights.missedOpportunities[0].category).toBe('authority');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2); // Once for insights, once for narrative
    });

    it('should use PromptFactory for narrative generation', async () => {
      // Act
      const result = await llmEnhancementService.enhanceFindings(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );

      // Assert
      expect(result.narrative).toBeDefined();
      expect(result.narrative.executiveSummary).toContain('Enterprise'); // More flexible assertion
      expect(result.narrative.detailedAnalysis).toContain('analysis'); // More flexible assertion
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should handle prompt generation errors gracefully', async () => {
      // Arrange
      mockGenerateContent.mockRejectedValue(new Error('AI_INSIGHTS_FAILED'));

      // Act
      const result = await llmEnhancementService.enhanceFindings(
        mockModuleResults,
        mockEnhancedContent,
        'https://example.com'
      );

      // Assert - should fallback to pattern-based analysis
      expect(result.insights).toBeDefined();
      expect(result.insights.confidence).toBe(75); // Fallback confidence
      expect(result.narrative).toBeDefined();
      expect(result.narrative.executiveSummary).toContain('score van');
    });
  });

  describe('EnterpriseTierStrategy PromptFactory Integration', () => {
    it('should use PromptFactory for enterprise narrative generation', async () => {
      // Arrange
      const mockBusinessResult = {
        scanId: 'test-scan-id',
        url: 'https://example.com',
        pageTitle: 'Enterprise Test Page',
        status: 'completed' as const,
        createdAt: '2025-07-11T10:00:00.000Z',
        overallScore: 85,
        moduleResults: mockModuleResults,
        completedAt: '2025-07-11T10:00:00.000Z',
        tier: 'business' as const,
        aiInsights: {
          missedOpportunities: [],
          authorityEnhancements: [],
          citabilityImprovements: [],
          implementationPriority: [],
          generatedAt: '2025-07-11T10:00:00.000Z',
          confidence: 90
        }
      };

      const mockEnterpriseFeatures = {
        multiPageAnalysis: [
          { url: 'https://example.com/page1', content: 'test content' }
        ],
        siteWidePatterns: { consistencyScore: 85 },
        competitiveContext: { benchmark: 'industry leader' },
        industryBenchmark: { score: 90 }
      };

      // Act
      const result = await (enterpriseTierStrategy as any).generateEnterpriseNarrative(
        mockBusinessResult,
        mockEnterpriseFeatures,
        mockDependencies
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Enterprise strategic analysis completed');
      expect(result.detailedAnalysis).toBe('Multi-page enterprise analysis results');
      expect(result.implementationRoadmap).toBe('Enterprise strategic roadmap developed');
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('enterprise'));
    });

    it('should handle enterprise narrative generation errors gracefully', async () => {
      // Arrange
      mockGenerateContent.mockRejectedValue(new Error('Enterprise generation failed'));
      
      const mockBusinessResult = {
        scanId: 'test-scan-id',
        url: 'https://example.com',
        pageTitle: 'Enterprise Test Page',
        status: 'completed' as const,
        createdAt: '2025-07-11T10:00:00.000Z',
        overallScore: 85,
        moduleResults: mockModuleResults,
        completedAt: '2025-07-11T10:00:00.000Z',
        tier: 'business' as const,
        aiInsights: {
          missedOpportunities: [],
          authorityEnhancements: [],
          citabilityImprovements: [],
          implementationPriority: [],
          generatedAt: '2025-07-11T10:00:00.000Z',
          confidence: 90
        }
      };

      const mockEnterpriseFeatures = {
        multiPageAnalysis: [{ url: 'https://example.com/page1', content: 'test' }],
        siteWidePatterns: { consistencyScore: 85 },
        competitiveContext: { benchmark: 'industry leader' },
        industryBenchmark: { score: 90 }
      };

      // Act
      const result = await (enterpriseTierStrategy as any).generateEnterpriseNarrative(
        mockBusinessResult,
        mockEnterpriseFeatures,
        mockDependencies
      );

      // Assert - should fallback to basic narrative
      expect(result).toBeDefined();
      expect(result.executiveSummary).toBe('Enterprise tier analysis completed with strategic insights');
      expect(result.detailedAnalysis).toContain('Multi-page analysis van 1 pagina');
      expect(result.wordCount).toBe(400);
    });
  });

  describe('PromptFactory Strategy Registration', () => {
    it('should have all strategies registered', () => {
      // Assert
      expect(PromptFactory.isRegistered('insights')).toBe(true);
      expect(PromptFactory.isRegistered('narrative')).toBe(true);
      expect(PromptFactory.isRegistered('enterprise')).toBe(true);
    });

    it('should create strategies successfully', () => {
      // Act & Assert
      expect(() => PromptFactory.create('insights')).not.toThrow();
      expect(() => PromptFactory.create('narrative')).not.toThrow();
      expect(() => PromptFactory.create('enterprise')).not.toThrow();
    });

    it('should generate prompts with correct structure', () => {
      // Arrange
      const insightsStrategy = PromptFactory.create('insights');
      const narrativeStrategy = PromptFactory.create('narrative');
      const enterpriseStrategy = PromptFactory.create('enterprise');

      // Act
      const insightsPrompt = insightsStrategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        url: 'https://example.com'
      });

      const narrativePrompt = narrativeStrategy.buildPrompt({
        moduleResults: mockModuleResults,
        enhancedContent: mockEnhancedContent,
        insights: {
          missedOpportunities: [],
          authorityEnhancements: [],
          citabilityImprovements: [],
          implementationPriority: [],
          generatedAt: '2025-07-11T10:00:00.000Z',
          confidence: 90
        }
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

      // Assert
      expect(insightsPrompt).toContain('AI SEO-consultant');
      expect(narrativePrompt).toContain('persoonlijke AI-consultant');
      expect(enterprisePrompt).toContain('senior AI-consultant');
    });
  });
});