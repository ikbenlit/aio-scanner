/**
 * Snapshot tests voor copied prompt strategies
 * 
 * Deze tests zorgen voor regression prevention door exact output te verifiëren
 * tussen oude en nieuwe prompt implementaties.
 * 
 * CRITICAL: Deze tests moeten ALTIJD slagen om backwards compatibility te garanderen
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InsightsPromptStrategy, NarrativePromptStrategy, EnterprisePromptStrategy } from '../index.js';
import type { PromptInput } from '../PromptStrategy.js';
import type { ModuleResult } from '../../../types/scan.js';
import type { EnhancedContent } from '../../../scan/ContentExtractor.js';
import type { AIInsights } from '../../vertexClient.js';

// Comprehensive test fixtures voor snapshot consistency
const standardModuleResults: ModuleResult[] = [
  {
    name: 'TechnicalSEO',
    score: 85,
    findings: [
      {
        title: 'Missing meta description',
        description: 'Page lacks meta description tag',
        priority: 'high',
        recommendation: 'Add descriptive meta description between 150-160 characters'
      },
      {
        title: 'Slow loading speed',
        description: 'Page load time exceeds 3 seconds',
        priority: 'medium',
        recommendation: 'Optimize images and reduce HTTP requests'
      }
    ],
    status: 'completed',
    completedAt: '2025-07-11T10:00:00Z'
  },
  {
    name: 'SchemaMarkup',
    score: 92,
    findings: [
      {
        title: 'Valid schema markup',
        description: 'Organization schema correctly implemented',
        priority: 'low',
        recommendation: 'Consider adding FAQ schema for better visibility'
      }
    ],
    status: 'completed',
    completedAt: '2025-07-11T10:05:00Z'
  }
];

const standardEnhancedContent: EnhancedContent = {
  authorityMarkers: [
    { text: 'expert since 2010', markerType: 'expertise', context: 'about page', confidence: 'high' },
    { text: 'certified professional', markerType: 'certification', context: 'homepage', confidence: 'high' }
  ],
  timeSignals: [
    { text: 'updated 2025', matchedPattern: 'year', context: 'footer', confidence: 'medium' },
    { text: 'published January 2025', matchedPattern: 'month-year', context: 'blog', confidence: 'high' }
  ],
  qualityClaims: [
    { text: 'best quality service', claimType: 'quality', strength: 'strong', context: 'homepage', confidence: 'high' },
    { text: 'award-winning team', claimType: 'expertise', strength: 'strong', context: 'team page', confidence: 'medium' }
  ],
  businessSignals: [
    { text: 'contact us', signalType: 'contact', context: 'navigation', confidence: 'high' },
    { text: 'book consultation', signalType: 'contact', context: 'homepage', confidence: 'high' }
  ],
  contentQualityAssessment: { 
    overallQualityScore: 78, 
    temporalClaims: [],
    vagueStatements: [],
    unsupportedClaims: []
  },
  missedOpportunities: [
    { category: 'authority', description: 'Customer testimonials missing from homepage', impact: 'medium', suggestion: 'Add customer testimonials', implementationEffort: 'medium' },
    { category: 'authority', description: 'No case studies to demonstrate expertise', impact: 'high', suggestion: 'Include case studies', implementationEffort: 'high' }
  ],
  aiOptimizationHints: []
};

const standardInsights: AIInsights = {
  missedOpportunities: [
    {
      category: 'authority',
      title: 'Strengthen expertise signals',
      description: 'Add more specific credentials and certifications',
      solution: 'Include professional certifications, awards, and detailed experience',
      impactScore: 8,
      difficulty: 'medium',
      timeEstimate: '2-3 hours'
    },
    {
      category: 'authority',
      title: 'Improve content depth',
      description: 'Content lacks comprehensive coverage of topics',
      solution: 'Add detailed explanations, examples, and related topics',
      impactScore: 7,
      difficulty: 'medium',
      timeEstimate: '4-6 hours'
    }
  ],
  authorityEnhancements: [
    {
      currentSignal: 'expert since 2010',
      enhancedVersion: 'Industry expert with 15+ years experience and certified credentials',
      explanation: 'More specific expertise signals improve AI citation likelihood',
      impact: 'medium'
    }
  ],
  citabilityImprovements: [
    {
      section: 'homepage',
      currentContent: 'Content lacks credible external sources',
      improvedContent: 'Include references to industry reports, studies, and expert opinions',
      aiReasoning: 'AI assistants prefer content with credible sources',
      citationPotential: 9
    }
  ],
  implementationPriority: [
    'Add customer testimonials',
    'Strengthen expertise signals',
    'Include case studies',
    'Improve content depth'
  ],
  generatedAt: '2025-07-11T10:00:00Z',
  confidence: 85
};

const standardEnterpriseFeatures = {
  multiPageAnalysis: [
    { 
      url: 'https://example.com/about', 
      content: { 
        title: 'About Us',
        wordCount: 450,
        expertiseSignals: ['10+ years experience', 'certified team'],
        authorityMarkers: 2
      }, 
      relativePath: '/about' 
    },
    { 
      url: 'https://example.com/services', 
      content: { 
        title: 'Our Services',
        wordCount: 680,
        expertiseSignals: ['specialized solutions', 'proven methodology'],
        authorityMarkers: 3
      }, 
      relativePath: '/services' 
    },
    { 
      url: 'https://example.com/contact', 
      content: { 
        title: 'Contact',
        wordCount: 220,
        expertiseSignals: ['available 24/7', 'immediate response'],
        authorityMarkers: 1
      }, 
      relativePath: '/contact' 
    }
  ],
  siteWidePatterns: {
    consistencyScore: 78,
    patterns: [
      'consistent navigation structure',
      'mixed content quality across pages',
      'inconsistent call-to-action placement',
      'varying tone and voice'
    ],
    brandingConsistency: 85,
    messageAlignment: 72
  },
  competitiveContext: {
    industryCategory: 'professional-services',
    benchmarkScore: 65,
    currentScore: 82,
    competitivePosition: 'above-average',
    keyDifferentiators: ['specialized expertise', 'proven track record'],
    competitiveGaps: ['content depth', 'thought leadership']
  },
  industryBenchmark: {
    category: 'dutch-professional-services',
    improvementPotential: 18,
    topPerformers: 95,
    averageScore: 67,
    recommendations: ['content authority', 'technical optimization']
  },
  analysisDepth: {
    totalPagesAnalyzed: 3,
    contentSamples: 3,
    patternConsistency: 78,
    thoroughnessScore: 92
  }
};

describe('Snapshot Tests - Copied Prompt Strategies', () => {
  // Mock Date.now to provide consistent timestamps in snapshots
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-11T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  describe('InsightsPromptStrategy Snapshots', () => {
    it('should generate consistent insights prompt for standard input', () => {
      const strategy = new InsightsPromptStrategy();
      const input: PromptInput = {
        moduleResults: standardModuleResults,
        enhancedContent: standardEnhancedContent,
        url: 'https://example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      // Snapshot test voor volledige prompt consistency
      expect(prompt).toMatchSnapshot('insights-standard-input.txt');
    });

    it('should generate consistent insights prompt for minimal input', () => {
      const strategy = new InsightsPromptStrategy();
      const input: PromptInput = {
        moduleResults: [],
        url: 'https://minimal-example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('insights-minimal-input.txt');
    });

    it('should generate consistent insights prompt for rich input', () => {
      const strategy = new InsightsPromptStrategy();
      const input: PromptInput = {
        moduleResults: [
          ...standardModuleResults,
          {
            name: 'AIContent',
            score: 76,
            findings: [
              {
                title: 'Content authority signals',
                description: 'Strong expertise demonstrations found',
                priority: 'high',
                recommendation: 'Leverage these signals for better positioning'
              }
            ],
            status: 'completed',
            completedAt: '2025-07-11T10:10:00Z'
          }
        ],
        enhancedContent: standardEnhancedContent,
        url: 'https://rich-example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('insights-rich-input.txt');
    });
  });

  describe('NarrativePromptStrategy Snapshots', () => {
    it('should generate consistent narrative prompt for standard input', () => {
      const strategy = new NarrativePromptStrategy();
      const input: PromptInput = {
        moduleResults: standardModuleResults,
        enhancedContent: standardEnhancedContent,
        insights: standardInsights
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('narrative-standard-input.txt');
    });

    it('should generate consistent narrative prompt without insights', () => {
      const strategy = new NarrativePromptStrategy();
      const input: PromptInput = {
        moduleResults: standardModuleResults,
        enhancedContent: standardEnhancedContent
        // insights missing
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('narrative-no-insights.txt');
    });

    it('should generate consistent narrative prompt for comprehensive input', () => {
      const strategy = new NarrativePromptStrategy();
      const input: PromptInput = {
        moduleResults: [
          ...standardModuleResults,
          {
            name: 'AICitation',
            score: 88,
            findings: [
              {
                title: 'Citation opportunities identified',
                description: 'Multiple opportunities for external citations',
                priority: 'high',
                recommendation: 'Add authoritative sources and references'
              }
            ],
            status: 'completed',
            completedAt: '2025-07-11T10:15:00Z'
          }
        ],
        enhancedContent: standardEnhancedContent,
        insights: standardInsights,
        url: 'https://comprehensive-example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('narrative-comprehensive-input.txt');
    });
  });

  describe('EnterprisePromptStrategy Snapshots', () => {
    it('should generate consistent enterprise prompt for standard input', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: standardInsights,
        enterpriseFeatures: standardEnterpriseFeatures
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('enterprise-standard-input.txt');
    });

    it('should generate consistent enterprise prompt with minimal features', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: standardInsights,
        enterpriseFeatures: {
          multiPageAnalysis: [
            { url: 'https://example.com', content: {}, relativePath: '/' }
          ],
          siteWidePatterns: { consistencyScore: 60 }
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('enterprise-minimal-features.txt');
    });

    it('should generate consistent enterprise prompt for extensive analysis', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: standardInsights,
        enterpriseFeatures: {
          ...standardEnterpriseFeatures,
          multiPageAnalysis: [
            ...standardEnterpriseFeatures.multiPageAnalysis,
            { 
              url: 'https://example.com/blog', 
              content: { 
                title: 'Blog',
                wordCount: 1200,
                expertiseSignals: ['industry insights', 'thought leadership'],
                authorityMarkers: 5
              }, 
              relativePath: '/blog' 
            },
            { 
              url: 'https://example.com/portfolio', 
              content: { 
                title: 'Portfolio',
                wordCount: 890,
                expertiseSignals: ['successful projects', 'client testimonials'],
                authorityMarkers: 4
              }, 
              relativePath: '/portfolio' 
            }
          ],
          competitiveContext: {
            ...standardEnterpriseFeatures.competitiveContext,
            detailedAnalysis: 'Comprehensive competitive analysis showing strong market position'
          }
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('enterprise-extensive-analysis.txt');
    });

    it('should generate consistent enterprise prompt for different industry', () => {
      const strategy = new EnterprisePromptStrategy();
      const input: PromptInput = {
        insights: standardInsights,
        enterpriseFeatures: {
          ...standardEnterpriseFeatures,
          competitiveContext: {
            ...standardEnterpriseFeatures.competitiveContext,
            industryCategory: 'e-commerce'
          },
          industryBenchmark: {
            category: 'dutch-e-commerce',
            improvementPotential: 22,
            topPerformers: 98,
            averageScore: 71
          }
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toMatchSnapshot('enterprise-e-commerce-industry.txt');
    });
  });

  describe('Cross-Strategy Consistency', () => {
    it('should maintain consistent formatting across all strategies', () => {
      const insightsStrategy = new InsightsPromptStrategy();
      const narrativeStrategy = new NarrativePromptStrategy();
      const enterpriseStrategy = new EnterprisePromptStrategy();
      
      const baseInput: PromptInput = {
        moduleResults: standardModuleResults,
        enhancedContent: standardEnhancedContent,
        insights: standardInsights
      };
      
      const enterpriseInput: PromptInput = {
        ...baseInput,
        enterpriseFeatures: standardEnterpriseFeatures
      };
      
      const insightsPrompt = insightsStrategy.buildPrompt(baseInput);
      const narrativePrompt = narrativeStrategy.buildPrompt(baseInput);
      const enterprisePrompt = enterpriseStrategy.buildPrompt(enterpriseInput);
      
      // Verify all strategies use JSON response format
      expect(insightsPrompt).toContain('RESPONSE FORMAT');
      expect(narrativePrompt).toContain('RESPONSE FORMAT');
      expect(enterprisePrompt).toContain('RESPONSE FORMAT');
      
      // Verify all strategies use consistent persona language
      expect(insightsPrompt).toContain('Je bent een');
      expect(narrativePrompt).toContain('Je bent een');
      expect(enterprisePrompt).toContain('Je bent een');
      
      // Verify all strategies include structured sections
      expect(insightsPrompt).toContain('TAAK:');
      expect(narrativePrompt).toContain('TAAK:');
      expect(enterprisePrompt).toContain('TAAK:');
    });
  });

  describe('Token Limiting Behavior', () => {
    it('should generate consistent truncated output for oversized inputs', () => {
      const strategy = new InsightsPromptStrategy(500); // Small token limit
      const oversizedInput: PromptInput = {
        moduleResults: Array.from({ length: 20 }, (_, i) => ({
          name: `Module${i}`,
          score: 85,
          findings: Array.from({ length: 5 }, (_, j) => ({
            title: `Finding ${j}`,
            description: `Very long description that repeats many times `.repeat(20),
            priority: 'high' as const,
            recommendation: `Long recommendation that also repeats `.repeat(15)
          })),
          status: 'completed' as const,
          completedAt: '2025-07-11T10:00:00Z'
        })),
        enhancedContent: standardEnhancedContent,
        url: 'https://oversized-example.com'
      };
      
      const prompt = strategy.buildPrompt(oversizedInput);
      
      expect(prompt).toMatchSnapshot('insights-oversized-truncated.txt');
    });
  });
});