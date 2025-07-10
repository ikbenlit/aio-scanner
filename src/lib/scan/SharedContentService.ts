import { load } from 'cheerio';
import { normalizeUrl } from '../utils';
import { ContentFetcher, type FetchStrategy } from './ContentFetcher';

export interface SharedContent {
  html: string;
  $: ReturnType<typeof load>;
  url: string;
  fetchedAt: Date;
  strategy: FetchStrategy;
  metadata?: {
    userAgent?: string;
    fetchMethod?: string;
    responseTime?: number;
    statusCode?: number;
  };
}

export class SharedContentService {
  private cache = new Map<string, SharedContent>();
  private contentFetcher = new ContentFetcher();
  
  async fetchSharedContent(url: string, strategy: FetchStrategy = 'fetch'): Promise<SharedContent> {
    const normalizedUrl = normalizeUrl(url);
    
    // Create cache key with strategy to avoid conflicts
    const cacheKey = `${normalizedUrl}:${strategy}`;
    
    // Check cache first (optional optimization)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      // Use new ContentFetcher with strategy pattern
      const result = await this.contentFetcher.execute(normalizedUrl, strategy, false); // No screenshot for shared content
      const $ = load(result.html);
      
      const content: SharedContent = {
        html: result.html,
        $,
        url: normalizedUrl,
        fetchedAt: new Date(),
        strategy,
        metadata: {
          userAgent: result.metadata.userAgent,
          fetchMethod: result.metadata.fetchMethod,
          responseTime: result.metadata.responseTime,
          statusCode: result.metadata.statusCode
        }
      };
      
      // Cache for this scan session with strategy-specific key
      this.cache.set(cacheKey, content);
      return content;
      
    } catch (error) {
      throw new Error(`Failed to fetch content from ${normalizedUrl} using ${strategy}: ${error}`);
    }
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
  
  getCachedUrls(): string[] {
    return Array.from(this.cache.keys());
  }
}