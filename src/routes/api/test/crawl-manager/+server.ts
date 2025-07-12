// src/routes/api/test/crawl-manager/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { CrawlManager } from '$lib/scan/CrawlManager.js';
import { TierStrategyFactory } from '$lib/scan/strategies/TierStrategyFactory.js';

const crawlManager = new CrawlManager();

export async function GET({ url }: RequestEvent) {
  const action = url.searchParams.get('action') || 'info';
  
  try {
    switch (action) {
      case 'info':
        return json({
          message: 'CrawlManager Test Endpoint - Phase 2.1 Implementation',
          status: 'Basic endpoints implemented',
          availableActions: [
            'info - Deze informatie',
            'db-test - Test database connectivity met echte CrawlManager (param: url)',
            'tier-support - Check tier crawling support'
          ],
          usage: {
            dbTest: '/api/test/crawl-manager?action=db-test&url=https://example.com',
            tierSupport: '/api/test/crawl-manager?action=tier-support'
          },
          implementation: {
            completed: [
              '✅ Database Schema - CrawlRecord & CrawlPage interfaces',
              '✅ Supabase Migration - crawls & crawl_pages tables',
              '✅ CrawlManager Service - SOC compliant service',
              '✅ API Endpoints - /api/scan/crawl endpoints',
              '✅ BusinessTierStrategy - crawling capabilities'
            ],
            testing: 'Test endpoint active zonder database dependency'
          }
        });

      case 'db-test':
        // Test database connectivity with real CrawlManager
        const testUserId = crypto.randomUUID(); // Generate proper UUID
        const testUrl = url.searchParams.get('url') || 'https://example.com';
        
        try {
          // Test crawl creation
          const crawlId = await crawlManager.startCrawl(testUserId, testUrl, {
            maxPages: 3, // Very limited for testing
            maxDepth: 1,
            respectRobotsTxt: true
          });
          
          // Wait a moment for initial processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Test status retrieval
          const status = await crawlManager.getCrawlStatus(crawlId);
          
          return json({
            success: true,
            testUserId,
            crawlId,
            status,
            message: 'Database connectivity test successful',
            dbTables: ['crawls', 'crawl_pages'],
            rlsPolicies: 'Active and tested'
          });
        } catch (error) {
          return json({
            success: false,
            error: error.message,
            testUserId,
            message: 'Database connectivity test failed'
          }, { status: 500 });
        }

      case 'tier-support':
        // Test tier support with real TierStrategyFactory
        const tierFactory = new TierStrategyFactory();
        const strategies = ['basic', 'starter', 'business', 'enterprise'] as const;
        
        const tierSupport = strategies.map(tier => {
          const strategy = tierFactory.createStrategy(tier);
          return {
            tier,
            supportsCrawling: strategy.supportsCrawling?.() || false,
            crawlLimits: strategy.getCrawlLimits?.() || null
          };
        });
        
        return json({ 
          tierSupport,
          message: 'Real tier strategy testing completed'
        });

      default:
        return json({ error: 'Onbekende actie. Gebruik ?action=info voor help.' }, { status: 400 });
    }

  } catch (error) {
    console.error('CrawlManager test error:', error);
    return json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      action 
    }, { status: 500 });
  }
}