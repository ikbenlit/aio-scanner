// src/routes/api/scan/basic/+server.ts
import { json } from '@sveltejs/kit';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';

const scanOrchestrator = new ScanOrchestrator();

export async function POST({ request }) {
  try {
    const { url, email } = await request.json();
    
    if (!url) {
      return json({ error: 'URL is verplicht' }, { status: 400 });
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return json({ 
        error: 'Ongeldige URL format' 
      }, { status: 400 });
    }

    console.log(`🔍 Starting basic scan for ${url}`);

    // Generate scan ID
    const scanId = crypto.randomUUID();
    
    // Basic tier - no payment verification needed
    const result = await scanOrchestrator.executeTierScan(
      url, 
      'basic', 
      scanId,
      email // Optional for basic tier
    );

    return json({
      ...result,
      scanId,
      tier: 'basic'
    });

  } catch (error: any) {
    console.error('💥 Basic scan failed:', error);
    return json({ 
      error: 'Basic scan mislukt', 
      details: error.message 
    }, { status: 500 });
  }
}