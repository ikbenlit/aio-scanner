import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    console.log('Simple scan test started...');
    
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const clientIP = getClientAddress();
    console.log(`Simple scan from IP: ${clientIP} for URL: ${url}`);

    // Fake scan ID voor test
    const fakeScanId = Math.floor(Math.random() * 10000);
    
    console.log(`Generated fake scan ID: ${fakeScanId}`);

    return json({
      success: true,
      scanId: fakeScanId,
      status: 'pending',
      message: 'Simple test scan started',
      url: parsedUrl.toString(),
      clientIP
    });

  } catch (err) {
    console.error('Simple scan error:', err);
    return json({ 
      error: 'Simple scan failed',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}; 