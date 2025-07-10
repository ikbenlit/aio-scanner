import { load } from 'cheerio';
import { normalizeUrl } from '../utils';

export interface SharedContent {
  html: string;
  $: ReturnType<typeof load>;
  url: string;
  fetchedAt: Date;
}

export class SharedContentService {
  private cache = new Map<string, SharedContent>();
  
  async fetchSharedContent(url: string): Promise<SharedContent> {
    const normalizedUrl = normalizeUrl(url);
    
    // Check cache first (optional optimization)
    if (this.cache.has(normalizedUrl)) {
      return this.cache.get(normalizedUrl)!;
    }
    
    try {
      const html = await fetch(normalizedUrl).then(r => r.text());
      const $ = load(html);
      
      const content: SharedContent = {
        html,
        $,
        url: normalizedUrl,
        fetchedAt: new Date()
      };
      
      // Cache for this scan session
      this.cache.set(normalizedUrl, content);
      return content;
      
    } catch (error) {
      throw new Error(`Failed to fetch content from ${normalizedUrl}: ${error}`);
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