/**
 * Test suite for PromptStrategy interface and BasePromptStrategy
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BasePromptStrategy, type PromptInput } from '../PromptStrategy.js';

// Test implementation of BasePromptStrategy
class TestPromptStrategy extends BasePromptStrategy {
  constructor(maxTokens?: number) {
    super(maxTokens);
  }
  
  buildPrompt(data: PromptInput): string {
    return `Test prompt for URL: ${data.url || 'unknown'}`;
  }
}

describe('PromptStrategy', () => {
  describe('BasePromptStrategy', () => {
    let strategy: TestPromptStrategy;

    beforeEach(() => {
      strategy = new TestPromptStrategy();
    });

    it('should implement the PromptStrategy interface', () => {
      expect(strategy.buildPrompt).toBeDefined();
      expect(typeof strategy.buildPrompt).toBe('function');
    });

    it('should build a basic prompt', () => {
      const input: PromptInput = {
        url: 'https://example.com',
        moduleResults: [],
        enhancedContent: {} as any
      };

      const result = strategy.buildPrompt(input);
      expect(result).toBe('Test prompt for URL: https://example.com');
    });

    it('should format JSON correctly', () => {
      const testObj = { test: 'value', number: 42 };
      const formatted = (strategy as any).formatJSON(testObj);
      
      expect(formatted).toBe(JSON.stringify(testObj, null, 2));
    });

    it('should limit tokens when content is too long', () => {
      const longContent = 'a'.repeat(50000); // 50k characters
      const limited = (strategy as any).limitTokens(longContent);
      
      expect(limited.length).toBeLessThan(longContent.length);
      expect(limited).toContain('[Content truncated to fit token limit]');
    });

    it('should not truncate content within token limit', () => {
      const shortContent = 'This is a short content string.';
      const limited = (strategy as any).limitTokens(shortContent);
      
      expect(limited).toBe(shortContent);
    });

    it('should estimate tokens correctly', () => {
      const content = 'This is a test string for token estimation.';
      const estimate = (strategy as any).estimateTokens(content);
      
      expect(estimate).toHaveProperty('estimatedTokens');
      expect(estimate).toHaveProperty('withinLimit');
      expect(estimate.estimatedTokens).toBeGreaterThan(0);
    });

    it('should generate current timestamp', () => {
      const timestamp = (strategy as any).getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should build JSON response template', () => {
      const fields = ['field1', 'field2', 'field3'];
      const jsonTemplate = (strategy as any).buildJSONResponse(fields);
      
      expect(jsonTemplate).toBe('{\n  "field1": "...",\n  "field2": "...",\n  "field3": "..."\n}');
    });
  });
});