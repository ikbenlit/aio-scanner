// src/lib/scan/CrawlManager.ts
import { supabase } from '../supabase';
import type { CrawlRecord, CrawlPage } from '../types/database';
import { SharedContentService } from './SharedContentService';
import { ScanOrchestrator } from './ScanOrchestrator';

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  respectRobotsTxt?: boolean;
  includeSubdomains?: boolean;
}

export interface CrawlStatus {
  crawlId: string;
  rootUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  pagesScanned: number;
  totalPagesFound: number;
  createdAt: string;
  reportUrl?: string;
}

export class CrawlManager {
  private sharedContentService = new SharedContentService();
  private scanOrchestrator = new ScanOrchestrator();
  
  // Default limits according to specs
  private readonly DEFAULT_MAX_PAGES = 250;
  private readonly DEFAULT_MAX_DEPTH = 5;

  /**
   * Start a new site-wide crawl
   */
  async startCrawl(
    userId: string, 
    rootUrl: string, 
    options: CrawlOptions = {}
  ): Promise<string> {
    const {
      maxPages = this.DEFAULT_MAX_PAGES,
      maxDepth = this.DEFAULT_MAX_DEPTH,
      respectRobotsTxt = true
    } = options;

    // Generate UUID for user_id if email provided (for compatibility)
    const actualUserId = userId.includes('@') ? crypto.randomUUID() : userId;

    // Create crawl record in database
    const { data: crawl, error } = await supabase
      .from('crawls')
      .insert({
        user_id: actualUserId,
        root_url: rootUrl,
        status: 'pending',
        pages_scanned: 0,
        total_pages_found: 0
      })
      .select()
      .single();

    if (error || !crawl) {
      throw new Error(`Failed to create crawl: ${error?.message}`);
    }

    // Start async crawling process
    this.executeCrawl(crawl.id, rootUrl, { maxPages, maxDepth, respectRobotsTxt, includeSubdomains: false })
      .catch(async (error) => {
        console.error(`Crawl ${crawl.id} failed:`, error);
        await this.updateCrawlStatus(crawl.id, 'failed', error.message);
      });

    return crawl.id;
  }

  /**
   * Get crawl status
   */
  async getCrawlStatus(crawlId: string): Promise<CrawlStatus> {
    const { data: crawl, error } = await supabase
      .from('crawls')
      .select('*')
      .eq('id', crawlId)
      .single();

    if (error || !crawl) {
      throw new Error(`Crawl not found: ${error?.message}`);
    }

    const status: CrawlStatus = {
      crawlId: crawl.id,
      rootUrl: crawl.root_url,
      status: crawl.status as any,
      pagesScanned: crawl.pages_scanned || 0,
      totalPagesFound: crawl.total_pages_found || 0,
      createdAt: crawl.created_at
    };

    // Add report URL if completed
    if (crawl.status === 'completed') {
      status.reportUrl = `/scan/${crawlId}/results`;
    }

    return status;
  }

  /**
   * Get paginated crawl results
   */
  async getCrawlResults(crawlId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const { data: pages, error, count } = await supabase
      .from('crawl_pages')
      .select('*, scans!scan_result_id(*)', { count: 'exact' })
      .eq('crawl_id', crawlId)
      .eq('status', 'completed')
      .range(offset, offset + limit - 1)
      .order('scanned_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch crawl results: ${error.message}`);
    }

    return {
      pages: pages || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Execute the actual crawling process
   */
  private async executeCrawl(
    crawlId: string,
    rootUrl: string,
    options: Required<CrawlOptions>
  ): Promise<void> {
    try {
      await this.updateCrawlStatus(crawlId, 'running');

      // Initialize crawl with root URL
      const urlQueue: Array<{ url: string; depth: number }> = [{ url: rootUrl, depth: 0 }];
      const visited = new Set<string>();
      const discoveredUrls = new Set<string>([rootUrl]);

      // Add root URL to crawl_pages
      await this.addCrawlPage(crawlId, rootUrl);

      while (urlQueue.length > 0 && visited.size < options.maxPages) {
        const { url, depth } = urlQueue.shift()!;
        
        if (visited.has(url) || depth > options.maxDepth) {
          continue;
        }

        visited.add(url);

        try {
          // Update page status to scanning
          await this.updatePageStatus(crawlId, url, 'scanning');

          // Fetch and scan the page using existing infrastructure
          const scanId = await this.scanSinglePage(url);
          
          // Update page with scan results
          await this.updatePageWithScanResult(crawlId, url, 'completed', scanId);

          // Discover new URLs from this page (if not at max depth)
          if (depth < options.maxDepth) {
            const newUrls = await this.discoverUrls(url, rootUrl, options.includeSubdomains);
            
            for (const newUrl of newUrls) {
              if (!discoveredUrls.has(newUrl)) {
                discoveredUrls.add(newUrl);
                urlQueue.push({ url: newUrl, depth: depth + 1 });
                await this.addCrawlPage(crawlId, newUrl);
              }
            }
          }

          // Update crawl progress
          await this.updateCrawlProgress(crawlId, visited.size, discoveredUrls.size);

        } catch (pageError) {
          console.error(`Failed to scan page ${url}:`, pageError);
          await this.updatePageStatus(crawlId, url, 'failed', pageError instanceof Error ? pageError.message : 'Unknown error');
        }
      }

      // Mark crawl as completed
      await this.updateCrawlStatus(crawlId, 'completed');

    } catch (error) {
      await this.updateCrawlStatus(crawlId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Scan a single page using existing ScanOrchestrator infrastructure
   */
  private async scanSinglePage(url: string): Promise<string> {
    // Generate unique scan ID
    const scanId = `crawl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Use ScanOrchestrator with business tier for crawled pages
    await this.scanOrchestrator.executeTierScan(url, 'business', scanId);
    
    return scanId;
  }

  /**
   * Discover URLs from a page using SharedContentService
   */
  private async discoverUrls(
    pageUrl: string, 
    rootUrl: string, 
    includeSubdomains = false
  ): Promise<string[]> {
    try {
      // Use SharedContentService with Playwright strategy for reliable content
      const content = await this.sharedContentService.fetchSharedContent(pageUrl, 'playwright');
      const $ = content.$;
      
      const urls = new Set<string>();
      const rootDomain = new URL(rootUrl).hostname;

      // Extract links from page
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, pageUrl).href;
          const urlDomain = new URL(absoluteUrl).hostname;

          // Filter URLs based on domain rules
          if (includeSubdomains) {
            if (urlDomain.endsWith(rootDomain)) {
              urls.add(absoluteUrl);
            }
          } else {
            if (urlDomain === rootDomain) {
              urls.add(absoluteUrl);
            }
          }
        } catch {
          // Skip invalid URLs
        }
      });

      return Array.from(urls);
    } catch (error) {
      console.error(`Failed to discover URLs from ${pageUrl}:`, error);
      return [];
    }
  }

  /**
   * Database helper methods - DRY pattern reuse
   */
  private async updateCrawlStatus(
    crawlId: string, 
    status: CrawlRecord['status'], 
    errorMessage?: string
  ): Promise<void> {
    const updates: Partial<CrawlRecord> = { status };
    
    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
    
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('crawls')
      .update(updates)
      .eq('id', crawlId);

    if (error) {
      console.error(`Failed to update crawl status:`, error);
    }
  }

  private async addCrawlPage(crawlId: string, url: string): Promise<void> {
    const { error } = await supabase
      .from('crawl_pages')
      .insert({
        crawl_id: crawlId,
        url: url,
        status: 'pending'
      });

    if (error) {
      console.error(`Failed to add crawl page:`, error);
    }
  }

  private async updatePageStatus(
    crawlId: string,
    url: string,
    status: CrawlPage['status'],
    errorMessage?: string
  ): Promise<void> {
    const updates: Partial<CrawlPage> = { status };
    
    if (status === 'completed' || status === 'failed') {
      updates.scanned_at = new Date().toISOString();
    }
    
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('crawl_pages')
      .update(updates)
      .eq('crawl_id', crawlId)
      .eq('url', url);

    if (error) {
      console.error(`Failed to update page status:`, error);
    }
  }

  private async updatePageWithScanResult(
    crawlId: string,
    url: string,
    status: CrawlPage['status'],
    scanResultId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('crawl_pages')
      .update({
        status,
        scan_result_id: scanResultId,
        scanned_at: new Date().toISOString()
      })
      .eq('crawl_id', crawlId)
      .eq('url', url);

    if (error) {
      console.error(`Failed to update page with scan result:`, error);
    }
  }

  private async updateCrawlProgress(
    crawlId: string,
    pagesScanned: number,
    totalPagesFound: number
  ): Promise<void> {
    const { error } = await supabase
      .from('crawls')
      .update({
        pages_scanned: pagesScanned,
        total_pages_found: totalPagesFound
      })
      .eq('id', crawlId);

    if (error) {
      console.error(`Failed to update crawl progress:`, error);
    }
  }
}