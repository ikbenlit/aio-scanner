/**
 * Test suite for TokenLimiter class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TokenLimiter } from '../shared/TokenLimiter.js';

describe('TokenLimiter', () => {
  let limiter: TokenLimiter;

  beforeEach(() => {
    limiter = new TokenLimiter({ maxTokens: 1000 }); // Small limit for testing
  });

  describe('Token estimation', () => {
    it('should estimate tokens correctly', () => {
      const content = 'This is a test string with about 10 words.';
      const estimate = limiter.estimateTokens(content);
      
      expect(estimate.estimatedTokens).toBeGreaterThan(0);
      expect(estimate.characterCount).toBe(content.length);
      expect(estimate.withinLimit).toBe(true);
    });

    it('should detect when content exceeds limit', () => {
      const longContent = 'a'.repeat(5000); // 5k characters should exceed 1k tokens
      const estimate = limiter.estimateTokens(longContent);
      
      expect(estimate.withinLimit).toBe(false);
      expect(estimate.estimatedTokens).toBeGreaterThan(1000);
    });
  });

  describe('Content limiting', () => {
    it('should not truncate content within limits', () => {
      const shortContent = 'This is a short content string.';
      const limited = limiter.limitContent(shortContent);
      
      expect(limited).toBe(shortContent);
    });

    it('should truncate content exceeding limits', () => {
      const longContent = 'a'.repeat(5000);
      const limited = limiter.limitContent(longContent);
      
      expect(limited.length).toBeLessThan(longContent.length);
      expect(limited).toContain('[Content truncated to fit token limit]');
    });

    it('should use different truncation strategies', () => {
      const content = 'Beginning part. '.repeat(100) + 'Middle part. '.repeat(100) + 'End part.'.repeat(100);
      
      const endLimiter = new TokenLimiter({ maxTokens: 500, truncationStrategy: 'end' });
      const middleLimiter = new TokenLimiter({ maxTokens: 500, truncationStrategy: 'middle' });
      const smartLimiter = new TokenLimiter({ maxTokens: 500, truncationStrategy: 'smart' });
      
      const endResult = endLimiter.limitContent(content);
      const middleResult = middleLimiter.limitContent(content);
      const smartResult = smartLimiter.limitContent(content);
      
      expect(endResult).not.toBe(middleResult);
      expect(middleResult).toContain('[... middle content truncated ...]');
      expect(smartResult).toContain('[Content truncated to fit token limit]');
    });
  });

  describe('Structured data limiting', () => {
    it('should not modify data within limits', () => {
      const smallData = { key1: 'value1', key2: 'value2' };
      const limited = limiter.limitStructuredData(smallData);
      
      expect(limited).toEqual(smallData);
    });

    it('should prioritize specified fields', () => {
      const largeData = {
        important: 'This is very important data',
        lessImportant: 'a'.repeat(1000),
        notImportant: 'b'.repeat(1000)
      };
      
      const limited = limiter.limitStructuredData(largeData, ['important']);
      
      expect(limited).toHaveProperty('important');
      expect(limited.important).toBe(largeData.important);
    });

    it('should handle arrays by limiting items', () => {
      const arrayData = Array.from({ length: 100 }, (_, i) => ({ id: i, data: 'item' + i }));
      const limited = limiter.limitStructuredData(arrayData);
      
      expect(Array.isArray(limited)).toBe(true);
      expect(limited.length).toBeLessThan(arrayData.length);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const defaultLimiter = new TokenLimiter();
      const config = defaultLimiter.getConfig();
      
      expect(config.maxTokens).toBe(12000);
      expect(config.reserveTokens).toBe(1000);
      expect(config.truncationStrategy).toBe('smart');
    });

    it('should create new instance with different config', () => {
      const newLimiter = limiter.withConfig({ maxTokens: 2000, truncationStrategy: 'end' });
      const config = newLimiter.getConfig();
      
      expect(config.maxTokens).toBe(2000);
      expect(config.truncationStrategy).toBe('end');
    });

    it('should preserve original config when creating new instance', () => {
      const originalConfig = limiter.getConfig();
      limiter.withConfig({ maxTokens: 2000 });
      const unchangedConfig = limiter.getConfig();
      
      expect(unchangedConfig).toEqual(originalConfig);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', () => {
      const estimate = limiter.estimateTokens('');
      expect(estimate.estimatedTokens).toBe(0);
      expect(estimate.withinLimit).toBe(true);
      
      const limited = limiter.limitContent('');
      expect(limited).toBe('');
    });

    it('should handle null and undefined in structured data', () => {
      expect(limiter.limitStructuredData(null)).toBe(null);
      expect(limiter.limitStructuredData(undefined)).toBe(undefined);
    });

    it('should handle non-object data', () => {
      expect(limiter.limitStructuredData('string')).toBe('string');
      expect(limiter.limitStructuredData(123)).toBe(123);
    });
  });
});