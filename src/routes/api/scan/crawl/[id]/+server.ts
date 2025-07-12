// src/routes/api/scan/crawl/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { CrawlManager } from '$lib/scan/CrawlManager.js';

const crawlManager = new CrawlManager();

export async function GET({ params }: RequestEvent) {
  try {
    const { id: crawlId } = params;
    
    if (!crawlId) {
      return json({ 
        error: 'Crawl ID is verplicht' 
      }, { status: 400 });
    }

    // Get crawl status
    const status = await crawlManager.getCrawlStatus(crawlId);
    
    return json(status);

  } catch (error) {
    console.error('Crawl status error:', error);
    
    // Handle not found case
    if (error.message.includes('not found')) {
      return json({ 
        error: 'Crawl niet gevonden',
        details: error.message 
      }, { status: 404 });
    }
    
    return json({ 
      error: 'Er ging iets mis bij het ophalen van de crawl status',
      details: error.message 
    }, { status: 500 });
  }
}