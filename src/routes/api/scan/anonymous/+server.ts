import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import { getSupabase } from '$lib/supabase';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const { url } = await request.json();
    const supabase = getSupabase();

    // 1. Validate URL
    if (!url || typeof url !== 'string') {
      throw error(400, 'Valid URL is required');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw error(400, 'Invalid URL format');
    }

    // 2. Rate limiting based on IP (basic protection)
    const clientIP = getClientAddress();
    
    // TODO: Implement proper rate limiting with Redis/Supabase
    // For now, just log the IP for monitoring
    console.log(`Scan request from IP: ${clientIP} for URL: ${url}`);

    // 3. Create scan record in database
    const { data: scanRecord, error: dbError } = await supabase
      .from('scans')
      .insert({
        url: parsedUrl.toString(),
        status: 'pending'
      })
      .select()
      .single();

    if (dbError || !scanRecord) {
      console.error('Database error:', dbError);
      throw error(500, 'Failed to create scan record');
    }

    console.log(`Created scan record with ID: ${scanRecord.id}`);

    // 4. Start scan process (async)
    const scanOrchestrator = new ScanOrchestrator();
    
    // Don't await - run in background
    scanOrchestrator.executeScan(parsedUrl.toString(), scanRecord.id.toString())
      .catch(scanError => {
        console.error(`Background scan failed for ${scanRecord.id}:`, scanError);
        
        // Update scan status to failed
        supabase
          .from('scans')
          .update({ status: 'failed' })
          .eq('id', scanRecord.id)
          .then(({ error: updateError }) => {
            if (updateError) {
              console.error('Failed to update scan status:', updateError);
            }
          });
      });

    // 5. Return scan ID immediately for polling
    return json({
      success: true,
      scanId: scanRecord.id,
      status: 'pending',
      message: 'Scan started successfully',
      estimatedDuration: '30 seconds'
    });

  } catch (err) {
    console.error('Anonymous scan API error:', err);
    
    if (err?.status) {
      // Re-throw SvelteKit errors
      throw err;
    }
    
    throw error(500, 'Internal server error');
  }
}; 