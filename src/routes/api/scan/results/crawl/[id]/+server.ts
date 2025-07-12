// src/routes/api/scan/results/crawl/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { CrawlManager } from '$lib/scan/CrawlManager.js';

const crawlManager = new CrawlManager();

export async function GET({ params, url }: RequestEvent) {
  try {
    const { id: crawlId } = params;
    
    if (!crawlId) {
      return json({ 
        error: 'Crawl ID is verplicht' 
      }, { status: 400 });
    }

    // Parse pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100); // Max 100 per page

    if (page < 1 || limit < 1) {
      return json({ 
        error: 'Page en limit moeten positieve getallen zijn' 
      }, { status: 400 });
    }

    // First check if crawl is completed
    const crawlStatus = await crawlManager.getCrawlStatus(crawlId);
    
    if (crawlStatus.status !== 'completed') {
      return json({ 
        error: 'Crawl is nog niet voltooid',
        status: crawlStatus.status,
        message: 'Wacht tot de crawl voltooid is voordat u resultaten kunt ophalen'
      }, { status: 409 }); // Conflict
    }

    // Get paginated crawl results
    const results = await crawlManager.getCrawlResults(crawlId, page, limit);
    
    return json({
      crawlId,
      crawlStatus,
      results: {
        pages: results.pages,
        pagination: {
          currentPage: results.currentPage,
          totalPages: results.totalPages,
          totalCount: results.totalCount,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Crawl results error:', error);
    
    // Handle not found case
    if (error.message.includes('not found')) {
      return json({ 
        error: 'Crawl niet gevonden',
        details: error.message 
      }, { status: 404 });
    }
    
    return json({ 
      error: 'Er ging iets mis bij het ophalen van de crawl resultaten',
      details: error.message 
    }, { status: 500 });
  }
}