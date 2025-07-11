/**
 * PromptStrategy - Interface for centralized prompt management
 * Part of the Strategy Pattern for AI prompt generation
 */

import type { ModuleResult } from '../../types/scan.js';
import type { EnhancedContent } from '../../scan/ContentExtractor.js';
import type { AIInsights } from '../vertexClient.js';
import { TokenLimiter } from './shared/TokenLimiter.js';
import { PromptHelpers } from './shared/PromptHelpers.js';

// Core input data that all prompts can work with
export interface PromptInput {
  // Core data (always available)
  moduleResults?: ModuleResult[];
  enhancedContent?: EnhancedContent;
  url?: string;
  
  // Contextual data (per prompt-type)
  insights?: AIInsights;           // For narrative prompts
  enterpriseFeatures?: {           // For enterprise prompts
    multiPageAnalysis?: any[];
    siteWidePatterns?: any;
    competitiveContext?: any;
    industryBenchmark?: any;
  };
  
  // Extension for future prompt types
  extras?: Record<string, unknown>;
}

// Strategy interface for all prompt generators
export interface PromptStrategy {
  buildPrompt(data: PromptInput): string;
}

// Base implementation with common functionality
export abstract class BasePromptStrategy implements PromptStrategy {
  protected readonly tokenLimiter: TokenLimiter;
  
  constructor(maxTokens: number = 12000) {
    this.tokenLimiter = new TokenLimiter({ maxTokens });
  }
  
  // Abstract method that concrete strategies must implement
  abstract buildPrompt(data: PromptInput): string;
  
  // Common utility methods for all strategies
  protected formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
  
  protected limitTokens(content: string): string {
    return this.tokenLimiter.limitContent(content);
  }
  
  protected limitStructuredData(data: any, priorities: string[] = []): any {
    return this.tokenLimiter.limitStructuredData(data, priorities);
  }
  
  protected estimateTokens(content: string) {
    return this.tokenLimiter.estimateTokens(content);
  }
  
  protected getCurrentTimestamp(): string {
    return PromptHelpers.getCurrentTimestamp();
  }
  
  // PromptHelpers integration
  protected get helpers() {
    return PromptHelpers;
  }
  
  protected formatDataSection(title: string, data: any, limit?: number): string {
    return PromptHelpers.formatDataSection(title, data, limit);
  }
  
  protected formatEnhancedContentSection(enhancedContent: any): string {
    return PromptHelpers.formatEnhancedContentSection(enhancedContent);
  }
  
  protected buildJSONResponse(fields: string[]): string {
    const jsonFields = fields.map(field => `  "${field}": "..."`).join(',\n');
    return `{\n${jsonFields}\n}`;
  }
}