import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScanOrchestrator } from '$lib/scan/ScanOrchestrator.js';
import { getSupabaseClient } from '$lib/supabase';

// Basic in-memory rate limiting (for MVP)
// In production: use Redis or database-based rate limiting
const ipScanCounts = new Map<string, { count: number; resetTime: number }>();

async function checkBasicRateLimit(clientIP: string): Promise<{ allowed: boolean; reason?: string }> {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000; // 1 hour
  const maxScansPerHour = 5;
  
  const ipData = ipScanCounts.get(clientIP);
  
  if (!ipData || now > ipData.resetTime) {
    // First request or reset time passed
    ipScanCounts.set(clientIP, { count: 1, resetTime: now + hourMs });
    return { allowed: true };
  }
  
  if (ipData.count >= maxScansPerHour) {
    return { 
      allowed: false, 
      reason: `Maximum ${maxScansPerHour} scans per uur bereikt. Probeer later opnieuw.` 
    };
  }
  
  // Increment count
  ipData.count++;
  ipScanCounts.set(clientIP, ipData);
  
  return { allowed: true };
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const { url } = await request.json();
    const supabase = getSupabaseClient();

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
    console.log(`Scan request from IP: ${clientIP} for URL: ${url}`);
    
    // Basic rate limiting: 5 scans per IP per hour
    const rateLimitCheck = await checkBasicRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      throw error(429, rateLimitCheck.reason || 'Te veel scan verzoeken. Probeer later opnieuw.');
    }

    // 3. Create scan record in database
    const { data: scanRecord, error: dbError }: { data: any, error: any } = await supabase
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
    
    if (err && typeof err === 'object' && 'status' in err) {
      // Re-throw SvelteKit errors
      throw err;
    }
    
    throw error(500, 'Internal server error');
  }
};

export const GET: RequestHandler = async ({ url }) => {
    try {
        const supabase = getSupabaseClient();
        const scanId = url.searchParams.get('scanId');

        if (!scanId) {
            throw error(400, 'Scan ID is vereist');
        }

        // data: scan as any to bypass type errors until supabase.ts is fixed
        const { data: scan, error: dbError } = await supabase
            .from('scans')
            .select(`
                id,
                status,
                progress,
                overall_score,
                result_json,
                created_at,
                completed_at
            `)
            .eq('id', scanId)
            .single<any>();

        if (dbError) {
            console.error('Database error:', dbError);
            throw error(500, 'Fout bij ophalen scan status');
        }

        if (!scan) {
            throw error(404, 'Scan niet gevonden');
        }

        return json({
            id: scan.id,
            status: scan.status,
            progress: scan.progress,
            overallScore: scan.overall_score,
            results: scan.result_json,
            createdAt: scan.created_at,
            completedAt: scan.completed_at,
            estimatedTimeRemaining: scan.progress < 100 ? `${30 - Math.floor(scan.progress / 100 * 30)} seconds` : null
        });

    } catch (err) {
        console.error('Scan status API error:', err);
        
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        
        throw error(500, 'Internal server error');
    }
}; 