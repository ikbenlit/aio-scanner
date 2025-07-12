// src/routes/api/scan/crawl/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { CrawlManager } from '$lib/scan/CrawlManager.js';
import { requireValidPayment } from '$lib/payment/verificationService.js';
import type { ScanTier } from '$lib/types/database.js';

const crawlManager = new CrawlManager();

export async function POST({ request }: RequestEvent) {
  try {
    const { url, email, paymentId, options = {} } = await request.json();
    
    if (!url || !email || !paymentId) {
      return json({ 
        error: 'URL, email en paymentId zijn verplicht voor site-wide crawl' 
      }, { status: 400 });
    }

    // 💳 PAYMENT VERIFICATION - Business tier required for crawling
    const { success, error } = await requireValidPayment(paymentId, 'business' as ScanTier, email);
    if (!success) {
      return json({ error }, { status: 402 }); // Payment Required
    }

    // Payment valid - start crawl (using email as user_id for now)
    const crawlId = await crawlManager.startCrawl(email, url, options);
    
    return json({ 
      success: true, 
      crawlId,
      message: 'Site-wide crawl gestart. Gebruik de status endpoint om voortgang te volgen.',
      statusUrl: `/api/scan/crawl/${crawlId}`
    });

  } catch (error) {
    console.error('Crawl start error:', error);
    return json({ 
      error: 'Er ging iets mis bij het starten van de crawl',
      details: error.message 
    }, { status: 500 });
  }
}