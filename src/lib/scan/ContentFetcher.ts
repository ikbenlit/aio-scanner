import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import type { ScanMetadata } from './types.js';

export class ContentFetcher {
  private static readonly USER_AGENT = 'AIO-Scanner/1.0 (+https://aio-scanner.nl/bot)';
  private static readonly TIMEOUT = 10000; // 10 seconden

  async fetchContent(url: string): Promise<{ html: string; metadata: ScanMetadata }> {
    const startTime = Date.now();
    
    try {
      // Start met Cheerio (snel, lightweight)
      const response = await fetch(url, {
        headers: { 
          'User-Agent': ContentFetcher.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nl,en;q=0.5',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(ContentFetcher.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const responseTime = Date.now() - startTime;

      // Check of site JavaScript-heavy is
      if (this.isJavaScriptHeavy(html)) {
        console.log(`JavaScript-heavy site gedetecteerd voor ${url}, fallback naar Playwright`);
        return await this.fetchWithPlaywright(url);
      }

      return {
        html,
        metadata: {
          domain: new URL(url).hostname,
          userAgent: ContentFetcher.USER_AGENT,
          fetchMethod: 'cheerio',
          responseTime,
          statusCode: response.status
        }
      };

    } catch (error) {
      console.log(`Cheerio fetch gefaald voor ${url}:`, error instanceof Error ? error.message : String(error));
      // Fallback naar Playwright
      return await this.fetchWithPlaywright(url);
    }
  }

  private isJavaScriptHeavy(html: string): boolean {
    const $ = cheerio.load(html);
    
    // Indicatoren voor JavaScript-heavy sites
    const indicators = [
      // SPA frameworks
      $('script[src*="react"]').length > 0,
      $('script[src*="vue"]').length > 0,
      $('script[src*="angular"]').length > 0,
      $('div[id="root"]').length > 0,
      $('div[id="app"]').length > 0,
      
      // Minimal content
      $('body').text().trim().length < 500,
      
      // Veel externe scripts
      $('script[src]').length > 10,
      
      // Loading indicators
      $('.loading, .spinner, [class*="load"]').length > 0
    ];

    // Als 2 of meer indicatoren waar zijn → JavaScript-heavy
    return indicators.filter(Boolean).length >= 2;
  }

  private async fetchWithPlaywright(url: string): Promise<{ html: string; metadata: ScanMetadata }> {
    const startTime = Date.now();
    let browser;
    
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage({
        userAgent: ContentFetcher.USER_AGENT,
        viewport: { width: 1280, height: 720 }
      });

      // Timeout en error handling
      page.setDefaultTimeout(ContentFetcher.TIMEOUT);
      
      // Navigate en wacht op network idle
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: ContentFetcher.TIMEOUT 
      });

      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}: Failed to load page`);
      }

      // Wacht op dynamic content
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      const responseTime = Date.now() - startTime;

      return {
        html,
        metadata: {
          domain: new URL(url).hostname,
          userAgent: ContentFetcher.USER_AGENT,
          fetchMethod: 'playwright',
          responseTime,
          statusCode: response.status()
        }
      };

    } catch (error: unknown) {
      throw new Error(`Playwright fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Helper voor robots.txt fetching
  async fetchRobotsTxt(domain: string): Promise<string | null> {
    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const response = await fetch(robotsUrl, {
        headers: { 'User-Agent': ContentFetcher.USER_AGENT },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch {
      return null;
    }
  }

  // Helper voor sitemap.xml fetching  
  async fetchSitemap(domain: string): Promise<string | null> {
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://${domain}/sitemaps.xml`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          headers: { 'User-Agent': ContentFetcher.USER_AGENT },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          return await response.text();
        }
      } catch {
        continue;
      }
    }
    
    return null;
  }
} 