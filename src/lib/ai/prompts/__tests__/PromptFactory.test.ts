/**
 * Tests for PromptFactory registry-based factory
 * 
 * Verifies that the factory can create prompt strategies by type
 * and that auto-registration works correctly.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PromptFactory } from '../PromptFactory.js';
import { InsightsPromptStrategy, NarrativePromptStrategy, EnterprisePromptStrategy } from '../index.js';
import type { PromptInput } from '../PromptStrategy.js';

describe('PromptFactory', () => {
  beforeEach(() => {
    // Clear registry before each test to ensure clean state
    PromptFactory.clearRegistry();
  });

  afterEach(() => {
    // Clear registry after each test
    PromptFactory.clearRegistry();
  });

  describe('Registry Management', () => {
    it('should start with empty registry', () => {
      expect(PromptFactory.getRegisteredCount()).toBe(0);
      expect(PromptFactory.getRegisteredTypes()).toEqual([]);
    });

    it('should register and create strategies', () => {
      // Register strategies
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      PromptFactory.register('narrative', () => new NarrativePromptStrategy());
      PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());

      // Verify registration
      expect(PromptFactory.getRegisteredCount()).toBe(3);
      expect(PromptFactory.getRegisteredTypes()).toContain('insights');
      expect(PromptFactory.getRegisteredTypes()).toContain('narrative');
      expect(PromptFactory.getRegisteredTypes()).toContain('enterprise');
    });

    it('should check if types are registered', () => {
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      
      expect(PromptFactory.isRegistered('insights')).toBe(true);
      expect(PromptFactory.isRegistered('narrative')).toBe(false);
      expect(PromptFactory.isRegistered('enterprise')).toBe(false);
    });

    it('should provide registry information', () => {
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      PromptFactory.register('narrative', () => new NarrativePromptStrategy());
      
      const info = PromptFactory.getRegistryInfo();
      expect(info.count).toBe(2);
      expect(info.types).toContain('insights');
      expect(info.types).toContain('narrative');
    });
  });

  describe('Strategy Creation', () => {
    beforeEach(() => {
      // Register all strategies for creation tests
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      PromptFactory.register('narrative', () => new NarrativePromptStrategy());
      PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());
    });

    it('should create insights strategy', () => {
      const strategy = PromptFactory.create('insights');
      expect(strategy).toBeInstanceOf(InsightsPromptStrategy);
    });

    it('should create narrative strategy', () => {
      const strategy = PromptFactory.create('narrative');
      expect(strategy).toBeInstanceOf(NarrativePromptStrategy);
    });

    it('should create enterprise strategy', () => {
      const strategy = PromptFactory.create('enterprise');
      expect(strategy).toBeInstanceOf(EnterprisePromptStrategy);
    });

    it('should create new instances each time', () => {
      const strategy1 = PromptFactory.create('insights');
      const strategy2 = PromptFactory.create('insights');
      
      expect(strategy1).not.toBe(strategy2);
      expect(strategy1).toBeInstanceOf(InsightsPromptStrategy);
      expect(strategy2).toBeInstanceOf(InsightsPromptStrategy);
    });

    it('should throw error for unknown strategy type', () => {
      expect(() => {
        PromptFactory.create('unknown' as any);
      }).toThrow('Unknown prompt type: unknown. Available types: insights, narrative, enterprise');
    });

    it('should throw error for unregistered strategy type', () => {
      PromptFactory.clearRegistry();
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      
      expect(() => {
        PromptFactory.create('narrative');
      }).toThrow('Unknown prompt type: narrative. Available types: insights');
    });
  });

  describe('Strategy Functionality', () => {
    beforeEach(() => {
      // Register all strategies
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      PromptFactory.register('narrative', () => new NarrativePromptStrategy());
      PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());
    });

    it('should create working insights strategy', () => {
      const strategy = PromptFactory.create('insights');
      const input: PromptInput = {
        moduleResults: [],
        url: 'https://example.com'
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een AI SEO-consultant');
      expect(prompt).toContain('SCAN RESULTATEN:');
      expect(prompt).toContain('TAAK:');
    });

    it('should create working narrative strategy', () => {
      const strategy = PromptFactory.create('narrative');
      const input: PromptInput = {
        moduleResults: [],
        enhancedContent: {
          authorityMarkers: [],
          timeSignals: [],
          qualityClaims: [],
          businessSignals: [],
          contentQualityAssessment: { overallQualityScore: 75, temporalClaims: [], vagueStatements: [], unsupportedClaims: [] },
          missedOpportunities: [],
          aiOptimizationHints: []
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een persoonlijke AI-consultant');
      expect(prompt).toContain('CONTEXT:');
      expect(prompt).toContain('TAAK:');
    });

    it('should create working enterprise strategy', () => {
      const strategy = PromptFactory.create('enterprise');
      const input: PromptInput = {
        insights: {
          missedOpportunities: [],
          authorityEnhancements: [],
          citabilityImprovements: [],
          implementationPriority: [],
          generatedAt: '2025-07-11T10:00:00Z',
          confidence: 85
        },
        enterpriseFeatures: {
          multiPageAnalysis: [],
          siteWidePatterns: { consistencyScore: 80 },
          competitiveContext: { competitivePosition: 'above-average' },
          industryBenchmark: { category: 'professional-services' }
        }
      };
      
      const prompt = strategy.buildPrompt(input);
      
      expect(prompt).toContain('Je bent een senior AI-consultant');
      expect(prompt).toContain('BUSINESS TIER ANALYSIS:');
      expect(prompt).toContain('TAAK:');
    });
  });

  describe('Auto-Registration Integration', () => {
    it('should support auto-registration pattern', () => {
      // Test that the registry pattern works (auto-registration is tested in integration)
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      PromptFactory.register('narrative', () => new NarrativePromptStrategy());
      PromptFactory.register('enterprise', () => new EnterprisePromptStrategy());
      
      // Verify all types are registered
      expect(PromptFactory.getRegisteredCount()).toBe(3);
      expect(PromptFactory.isRegistered('insights')).toBe(true);
      expect(PromptFactory.isRegistered('narrative')).toBe(true);
      expect(PromptFactory.isRegistered('enterprise')).toBe(true);
      
      // Test that they can be created and work
      const insights = PromptFactory.create('insights');
      const narrative = PromptFactory.create('narrative');
      const enterprise = PromptFactory.create('enterprise');
      
      expect(insights).toBeInstanceOf(InsightsPromptStrategy);
      expect(narrative).toBeInstanceOf(NarrativePromptStrategy);
      expect(enterprise).toBeInstanceOf(EnterprisePromptStrategy);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error messages', () => {
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      
      expect(() => {
        PromptFactory.create('narrative');
      }).toThrow('Unknown prompt type: narrative. Available types: insights');
    });

    it('should handle empty registry gracefully', () => {
      expect(() => {
        PromptFactory.create('insights');
      }).toThrow('Unknown prompt type: insights. Available types: ');
    });

    it('should handle registry clearing', () => {
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      expect(PromptFactory.getRegisteredCount()).toBe(1);
      
      PromptFactory.clearRegistry();
      expect(PromptFactory.getRegisteredCount()).toBe(0);
      expect(PromptFactory.getRegisteredTypes()).toEqual([]);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should enforce valid prompt types', () => {
      // This test verifies TypeScript compilation, not runtime behavior
      PromptFactory.register('insights', () => new InsightsPromptStrategy());
      
      const validTypes: Array<'insights' | 'narrative' | 'enterprise'> = ['insights', 'narrative', 'enterprise'];
      
      validTypes.forEach(type => {
        if (PromptFactory.isRegistered(type)) {
          const strategy = PromptFactory.create(type);
          expect(strategy).toBeDefined();
        }
      });
    });
  });
});