/**
 * TokenLimiter - Advanced token counting and content trimming for AI prompts
 * 
 * Ensures prompts stay within model token limits while preserving important content
 * Uses intelligent truncation strategies to maintain prompt quality
 */

export interface TokenLimitConfig {
  maxTokens: number;
  reserveTokens?: number; // Reserve tokens for completion
  truncationStrategy?: 'end' | 'middle' | 'smart';
}

export interface TokenEstimate {
  estimatedTokens: number;
  characterCount: number;
  withinLimit: boolean;
}

export class TokenLimiter {
  private readonly DEFAULT_MAX_TOKENS = 12000;
  private readonly DEFAULT_RESERVE_TOKENS = 1000; // Reserve for AI response
  private readonly CHARS_PER_TOKEN = 4; // Conservative estimate for Dutch/English
  
  private config: Required<TokenLimitConfig>;
  
  constructor(config: TokenLimitConfig = { maxTokens: 12000 }) {
    this.config = {
      maxTokens: config.maxTokens || this.DEFAULT_MAX_TOKENS,
      reserveTokens: config.reserveTokens || this.DEFAULT_RESERVE_TOKENS,
      truncationStrategy: config.truncationStrategy || 'smart'
    };
  }
  
  /**
   * Estimate token count for given content
   */
  estimateTokens(content: string): TokenEstimate {
    const characterCount = content.length;
    const estimatedTokens = Math.ceil(characterCount / this.CHARS_PER_TOKEN);
    
    return {
      estimatedTokens,
      characterCount,
      withinLimit: estimatedTokens <= this.getAvailableTokens()
    };
  }
  
  /**
   * Limit content to fit within token constraints
   */
  limitContent(content: string): string {
    const estimate = this.estimateTokens(content);
    
    if (estimate.withinLimit) {
      return content;
    }
    
    const maxChars = this.getAvailableTokens() * this.CHARS_PER_TOKEN;
    
    switch (this.config.truncationStrategy) {
      case 'end':
        return this.truncateFromEnd(content, maxChars);
      case 'middle':
        return this.truncateFromMiddle(content, maxChars);
      case 'smart':
        return this.smartTruncate(content, maxChars);
      default:
        return this.smartTruncate(content, maxChars);
    }
  }
  
  /**
   * Limit structured data (JSON) with priority preservation
   */
  limitStructuredData(data: any, priorities: string[] = []): any {
    const jsonString = JSON.stringify(data, null, 2);
    const estimate = this.estimateTokens(jsonString);
    
    if (estimate.withinLimit) {
      return data;
    }
    
    // For structured data, we need to be more careful
    return this.truncateStructuredData(data, priorities);
  }
  
  /**
   * Get available tokens for content (total - reserved)
   */
  private getAvailableTokens(): number {
    return this.config.maxTokens - this.config.reserveTokens;
  }
  
  /**
   * Simple truncation from end
   */
  private truncateFromEnd(content: string, maxChars: number): string {
    const safeLength = maxChars - 100; // Buffer for truncation notice
    const truncated = content.substring(0, safeLength);
    
    // Try to end at a complete line
    const lastNewline = truncated.lastIndexOf('\n');
    if (lastNewline > safeLength * 0.9) {
      return truncated.substring(0, lastNewline) + '\n\n[Content truncated to fit token limit]';
    }
    
    return truncated + '\n\n[Content truncated to fit token limit]';
  }
  
  /**
   * Truncate from middle to preserve beginning and end
   */
  private truncateFromMiddle(content: string, maxChars: number): string {
    const keepLength = Math.floor((maxChars - 100) / 2);
    const beginning = content.substring(0, keepLength);
    const end = content.substring(content.length - keepLength);
    
    return beginning + '\n\n[... middle content truncated ...]\n\n' + end;
  }
  
  /**
   * Smart truncation that preserves important sections
   */
  private smartTruncate(content: string, maxChars: number): string {
    const sections = this.identifyImportantSections(content);
    let result = '';
    let remainingChars = maxChars - 100; // Buffer for truncation notice
    
    // Always keep the beginning (instructions)
    const beginning = content.substring(0, Math.min(remainingChars * 0.3, 2000));
    result += beginning;
    remainingChars -= beginning.length;
    
    // Add important sections if space allows
    for (const section of sections) {
      if (remainingChars > section.length + 50) {
        result += '\n\n' + section;
        remainingChars -= section.length + 2;
      } else {
        // Truncate this section
        const truncatedSection = section.substring(0, remainingChars - 50);
        result += '\n\n' + truncatedSection;
        break;
      }
    }
    
    return result + '\n\n[Content truncated to fit token limit]';
  }
  
  /**
   * Identify important sections in content
   */
  private identifyImportantSections(content: string): string[] {
    const sections: string[] = [];
    
    // Split by common section markers
    const sectionMarkers = [
      /SCAN RESULTATEN:[\s\S]*?(?=\n\n[A-Z]|$)/gi,
      /ENHANCED CONTENT[\s\S]*?(?=\n\n[A-Z]|$)/gi,
      /TAAK:[\s\S]*?(?=\n\n[A-Z]|$)/gi,
      /RESPONSE FORMAT[\s\S]*?(?=\n\n[A-Z]|$)/gi,
      /BELANGRIJKE INSTRUCTIES:[\s\S]*?$/gi
    ];
    
    for (const marker of sectionMarkers) {
      const matches = content.match(marker);
      if (matches) {
        sections.push(...matches);
      }
    }
    
    return sections;
  }
  
  /**
   * Truncate structured data while preserving important fields
   */
  private truncateStructuredData(data: any, priorities: string[] = []): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (Array.isArray(data)) {
      // For arrays, keep first N items
      const maxItems = Math.floor(this.getAvailableTokens() / 500); // Rough estimate
      return data.slice(0, maxItems);
    }
    
    // For objects, prioritize fields
    const result: any = {};
    
    // First, add priority fields
    for (const priority of priorities) {
      if (data.hasOwnProperty(priority)) {
        result[priority] = data[priority];
      }
    }
    
    // Then add other fields until we hit limits
    const remainingFields = Object.keys(data).filter(key => !priorities.includes(key));
    
    for (const field of remainingFields) {
      const testResult = { ...result, [field]: data[field] };
      const testJson = JSON.stringify(testResult, null, 2);
      
      if (this.estimateTokens(testJson).withinLimit) {
        result[field] = data[field];
      } else {
        // Try to truncate this field if it's a string or array
        if (typeof data[field] === 'string') {
          result[field] = data[field].substring(0, 200) + '...';
        } else if (Array.isArray(data[field])) {
          result[field] = data[field].slice(0, 3);
        }
        break;
      }
    }
    
    return result;
  }
  
  /**
   * Create a new TokenLimiter with different config
   */
  withConfig(config: Partial<TokenLimitConfig>): TokenLimiter {
    return new TokenLimiter({
      ...this.config,
      ...config
    });
  }
  
  /**
   * Get current configuration
   */
  getConfig(): TokenLimitConfig {
    return { ...this.config };
  }
}