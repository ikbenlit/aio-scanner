// src/routes/api/test/post-scan-processing/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { postScanProcessor } from '$lib/services/PostScanProcessorService';
import { getSupabaseClient } from '$lib/supabase';
import type { ScanTier } from '$lib/types/database';

/**
 * Test endpoint for Post-Scan Processing Service
 * Tests PDF generation and email delivery independently
 */
export const GET: RequestHandler = async ({ url }) => {
  const testType = url.searchParams.get('test') || 'basic';
  const scanId = url.searchParams.get('scanId');
  const tier = (url.searchParams.get('tier') || 'starter') as ScanTier;
  const email = url.searchParams.get('email') || 'test@example.com';

  try {
    console.log(`🧪 Testing post-scan processing: ${testType}`);

    switch (testType) {
      case 'basic':
        return await testBasicProcessing();
      
      case 'with-scan':
        if (!scanId) {
          return json({ error: 'scanId parameter required for with-scan test' }, { status: 400 });
        }
        return await testWithExistingScan(scanId, tier, email);
      
      case 'create-and-process':
        return await testCreateAndProcess(tier, email);
      
      case 'status':
        return await testProcessingStatus();
      
      default:
        return json({ error: 'Invalid test type. Use: basic, with-scan, create-and-process, status' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Post-scan processing test failed:', error);
    return json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
};

/**
 * Test basic service instantiation and methods
 */
async function testBasicProcessing() {
  console.log('🔄 Testing basic service functionality...');
  
  const tests = {
    serviceInstantiation: false,
    methodsExist: false,
    asyncTrigger: false
  };

  try {
    // Test service instantiation
    tests.serviceInstantiation = postScanProcessor !== undefined;
    
    // Test methods exist
    tests.methodsExist = 
      typeof postScanProcessor.processAsync === 'function';
    
    // Test async trigger (with invalid scan ID - should handle gracefully)
    const startTime = Date.now();
    await postScanProcessor.processAsync({
      scanId: 'test-invalid-scan-id',
      tier: 'starter',
      email: 'test@example.com'
    });
    tests.asyncTrigger = true; // Should not throw even with invalid scan
    
    return json({
      success: true,
      message: 'Basic post-scan processing tests passed',
      tests,
      duration: Date.now() - startTime
    });

  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests
    });
  }
}

/**
 * Test with existing scan in database
 */
async function testWithExistingScan(scanId: string, tier: ScanTier, email: string) {
  console.log(`🔄 Testing with existing scan: ${scanId}`);
  
  const supabase = getSupabaseClient();
  
  // Verify scan exists
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (scanError || !scan) {
    return json({
      success: false,
      error: 'Scan not found in database',
      scanId
    });
  }

  // Process with the existing scan
  const startTime = Date.now();
  await postScanProcessor.processAsync({
    scanId,
    tier: scan.tier as ScanTier || tier,
    email: scan.email || email
  });

  // Check processing status after a short delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { data: updatedScan, error: updateError } = await supabase
    .from('scans')
    .select('post_scan_processed, post_scan_processed_at, pdf_generation_status, email_sent')
    .eq('id', scanId)
    .single();

  return json({
    success: true,
    message: 'Post-scan processing triggered for existing scan',
    scanId,
    originalScan: {
      id: scan.id,
      tier: scan.tier,
      status: scan.status,
      email: scan.email
    },
    processingStatus: updatedScan,
    duration: Date.now() - startTime
  });
}

/**
 * Test create mock scan and process
 */
async function testCreateAndProcess(tier: ScanTier, email: string) {
  console.log(`🔄 Testing create mock scan and process for ${tier} tier`);
  
  const supabase = getSupabaseClient();
  
  // Create a mock completed scan using only existing columns
  const { data: scan, error: createError } = await supabase
    .from('scans')
    .insert({
      url: 'https://example.com',
      tier,
      email,
      status: 'completed',
      overall_score: 85,
      result_json: {
        moduleResults: [
          { module: 'TechnicalSEO', score: 80, status: 'completed' },
          { module: 'SchemaMarkup', score: 90, status: 'completed' }
        ]
      },
      completed_at: new Date().toISOString(),
      pdf_generation_status: 'pending'
    })
    .select('id, url, tier, email, status, overall_score, result_json, completed_at, pdf_generation_status')
    .single();

  if (createError || !scan) {
    console.error('Create scan error:', createError);
    return json({
      success: false,
      error: 'Failed to create mock scan',
      details: createError?.message,
      debugInfo: {
        error: createError,
        data: scan
      }
    });
  }

  // Process the mock scan
  const startTime = Date.now();
  
  console.log('About to trigger post-scan processing...');
  
  try {
    await postScanProcessor.processAsync({
      scanId: scan.id,
      tier,
      email
    });
    console.log('Post-scan processing triggered successfully');
  } catch (processError) {
    console.error('Post-scan processing error:', processError);
    return json({
      success: false,
      error: 'Post-scan processing failed',
      details: processError instanceof Error ? processError.message : 'Unknown error'
    });
  }

  // Wait for processing and check results
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Fetching processed scan results...');
  const { data: processedScan, error: fetchError } = await supabase
    .from('scans')
    .select('id, tier, email, status, pdf_generation_status, email_sent, email_sent_at, updated_at')
    .eq('id', scan.id)
    .single();

  return json({
    success: true,
    message: 'Created mock scan and triggered processing',
    scanId: scan.id,
    tier,
    email,
    processingResults: {
      postScanProcessed: processedScan?.post_scan_processed,
      processedAt: processedScan?.post_scan_processed_at,
      pdfGenerated: processedScan?.pdf_generated,
      pdfStatus: processedScan?.pdf_generation_status,
      emailSent: processedScan?.email_sent,
      emailSentAt: processedScan?.email_sent_at
    },
    duration: Date.now() - startTime
  });
}

/**
 * Test processing status overview
 */
async function testProcessingStatus() {
  console.log('🔄 Testing processing status overview...');
  
  const supabase = getSupabaseClient();
  
  // Try to get recent scans with processing status (gracefully handle missing columns)
  let recentScans, error;
  
  // First try with new columns
  const resultWithColumns = await supabase
    .from('scans')
    .select('id, tier, status, created_at, post_scan_processed, pdf_generated, email_sent')
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log('Query result error:', resultWithColumns.error);
  
  if (resultWithColumns.error && (
    resultWithColumns.error.message.includes('does not exist') ||
    resultWithColumns.error.message.includes('column') ||
    resultWithColumns.error.code === '42703'
  )) {
    console.warn('New columns not available, using fallback query');
    
    // Fallback to basic columns only
    const fallbackResult = await supabase
      .from('scans')
      .select('id, tier, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    recentScans = fallbackResult.data;
    error = fallbackResult.error;
  } else {
    recentScans = resultWithColumns.data;
    error = resultWithColumns.error;
  }

  if (error) {
    return json({
      success: false,
      error: 'Failed to fetch processing status',
      details: error.message
    });
  }

  // Calculate processing statistics (gracefully handle missing columns)
  const stats = {
    totalScans: recentScans?.length || 0,
    processedScans: recentScans?.filter(s => s.post_scan_processed)?.length || 0,
    pdfGenerated: recentScans?.filter(s => s.pdf_generated)?.length || 0,
    emailSent: recentScans?.filter(s => s.email_sent)?.length || 0,
    byTier: {
      basic: recentScans?.filter(s => s.tier === 'basic')?.length || 0,
      starter: recentScans?.filter(s => s.tier === 'starter')?.length || 0,
      business: recentScans?.filter(s => s.tier === 'business')?.length || 0,
      enterprise: recentScans?.filter(s => s.tier === 'enterprise')?.length || 0
    },
    // Note if columns are missing
    hasPostScanColumns: recentScans?.[0]?.hasOwnProperty('post_scan_processed') || false
  };

  return json({
    success: true,
    message: 'Processing status overview',
    stats,
    recentScans: recentScans?.map(scan => ({
      id: scan.id,
      tier: scan.tier,
      status: scan.status,
      processed: scan.post_scan_processed || null,
      pdfGenerated: scan.pdf_generated || null,
      emailSent: scan.email_sent || null,
      createdAt: scan.created_at
    })),
    note: stats.hasPostScanColumns ? 
      'Full post-scan processing columns available' : 
      'Post-scan processing columns not yet migrated - using basic data only'
  });
}