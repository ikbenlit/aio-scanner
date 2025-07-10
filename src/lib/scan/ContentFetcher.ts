import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
// TODO: Fix import - ScanMetadata should be in scan types
// import type { ScanMetadata } from '../types/scan.js';

interface ScanMetadata {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    domain?: string;
    userAgent?: string;
    fetchMethod?: string;
    responseTime?: number;
    statusCode?: number;
}

export interface ContentFetchResult {
  html: string;
  metadata: ScanMetadata;
  screenshot?: string; // Base64 encoded screenshot
}

export interface FetchError {
  type: 'network_error' | 'timeout' | 'http_error' | 'playwright_error' | 'parse_error';
  url: string;
  message: string;
  timestamp: string;
  duration: number;
  strategy: FetchStrategy;
  statusCode?: number;
}

export type FetchStrategy = 'fetch' | 'playwright';

export class ContentFetcher {
  private static readonly USER_AGENT = 'AIO-Scanner/1.0 (+https://aio-scanner.nl/bot)';
  private static readonly TIMEOUT = 30000; // 30 seconden voor betaalde tiers
  private static readonly SCREENSHOT_TIMEOUT = 5000; // 5 seconden voor screenshot

  async execute(url: string, strategy: FetchStrategy = 'fetch', includeScreenshot = true): Promise<ContentFetchResult> {
    if (strategy === 'playwright') {
      return await this.fetchWithPlaywright(url, includeScreenshot);
    }
    return await this.fetchWithCheerio(url, includeScreenshot);
  }

  // Legacy method for backwards compatibility
  async fetchContent(url: string, includeScreenshot = true): Promise<ContentFetchResult> {
    return await this.fetchWithCheerio(url, includeScreenshot);
  }

  private async fetchWithCheerio(url: string, includeScreenshot = true): Promise<ContentFetchResult> {
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

      // Voor Cheerio strategie: check of site JavaScript-heavy is voor fallback
      if (this.isJavaScriptHeavy(html)) {
        console.log(`JavaScript-heavy site gedetecteerd voor ${url}, fallback naar Playwright`);
        return await this.fetchWithPlaywright(url, includeScreenshot);
      }

      // Voor statische sites: aparte screenshot met Playwright indien gewenst
      let screenshot: string | undefined;
      if (includeScreenshot) {
        try {
          screenshot = await this.captureScreenshot(url);
        } catch (error) {
          console.log(`Screenshot capture gefaald voor ${url}:`, error instanceof Error ? error.message : String(error));
          // Continue zonder screenshot
        }
      }

      return {
        html,
        screenshot,
        metadata: {
          title: '', // Will be extracted from HTML if needed
          description: '', // Will be extracted from HTML if needed
          keywords: [], // Will be extracted from HTML if needed
          domain: new URL(url).hostname,
          userAgent: ContentFetcher.USER_AGENT,
          fetchMethod: 'cheerio',
          responseTime,
          statusCode: response.status
        }
      };

    } catch (error) {
      const errorDetails = this.createStandardError(error, url, 'fetch', Date.now() - startTime, response?.status);
      console.log(`Cheerio fetch gefaald voor ${url}:`, errorDetails.message);
      // Fallback naar Playwright
      return await this.fetchWithPlaywright(url, includeScreenshot);
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

  private async fetchWithPlaywright(url: string, includeScreenshot = true): Promise<ContentFetchResult> {
    const startTime = Date.now();
    let browser;
    
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Realistische Chrome User-Agent
        viewport: { width: 1280, height: 720 }
      });

      // Configureerbare timeout van 30 seconden
      page.setDefaultTimeout(ContentFetcher.TIMEOUT);
      
      // Navigate en wacht op networkidle0 voor volledige load
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0', // Zoals gespecificeerd in het plan
        timeout: ContentFetcher.TIMEOUT 
      });

      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}: Failed to load page`);
      }

      // Wacht op dynamic content
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      const responseTime = Date.now() - startTime;

      // Screenshot capture (als browser al open is)
      let screenshot: string | undefined;
      if (includeScreenshot) {
        try {
          const screenshotBuffer = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: 1280, height: 720 },
            timeout: ContentFetcher.SCREENSHOT_TIMEOUT
          });
          screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
        } catch (error) {
          console.log(`Screenshot capture gefaald in Playwright voor ${url}:`, error instanceof Error ? error.message : String(error));
          // Continue zonder screenshot
        }
      }

      return {
        html,
        screenshot,
        metadata: {
          title: '', // Will be extracted from HTML if needed
          description: '', // Will be extracted from HTML if needed
          keywords: [], // Will be extracted from HTML if needed
          domain: new URL(url).hostname,
          userAgent: ContentFetcher.USER_AGENT,
          fetchMethod: 'playwright',
          responseTime,
          statusCode: response.status()
        }
      };

    } catch (error: unknown) {
      const errorDetails = this.createStandardError(error, url, 'playwright', Date.now() - startTime);
      throw new Error(`Playwright fetch failed: ${JSON.stringify(errorDetails)}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Standalone screenshot capture voor statische sites
   * Gebruikt minimale Playwright setup voor snelheid
   */
  private async captureScreenshot(url: string): Promise<string> {
    let browser;
    
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 }
      });

      // Snelle screenshot - geen wachten op complex JS
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: ContentFetcher.SCREENSHOT_TIMEOUT 
      });

      // Korte wachttijd voor basic rendering
      await page.waitForTimeout(1000);
      
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1280, height: 720 },
        timeout: ContentFetcher.SCREENSHOT_TIMEOUT
      });

      return `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

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

  /**
   * Standaard error handling voor alle fetch methoden
   */
  private createStandardError(
    error: unknown, 
    url: string, 
    strategy: FetchStrategy, 
    duration: number, 
    statusCode?: number
  ): FetchError {
    const message = error instanceof Error ? error.message : 'Unknown error';
    let type: FetchError['type'] = strategy === 'playwright' ? 'playwright_error' : 'network_error';
    
    // Bepaal specifiek error type
    if (error instanceof Error) {
      if (message.includes('timeout')) {
        type = 'timeout';
      } else if (message.includes('net::ERR_') || message.includes('Failed to fetch')) {
        type = 'network_error';
      } else if (message.includes('HTTP') || statusCode) {
        type = 'http_error';
      } else if (message.includes('parse') || message.includes('JSON')) {
        type = 'parse_error';
      }
    }
    
    return {
      type,
      url,
      message,
      timestamp: new Date().toISOString(),
      duration,
      strategy,
      statusCode
    };
  }
}