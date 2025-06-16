import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  const { scanId } = params;
  const email = url.searchParams.get('email');
  
  if (!scanId) {
    return new Response('Scan ID is required', { status: 400 });
  }
  
  if (!email) {
    return new Response('Email is required', { status: 400 });
  }
  
  try {
    // Fetch scan details from database
    const { data: scan, error } = await supabase
      .from('scans')
      .select('tier, user_email, pdf_url, pdf_generation_status, status, url')
      .eq('id', scanId)
      .single();
      
    if (error || !scan) {
      console.error('Scan not found:', error);
      return new Response('Scan not found', { status: 404 });
    }
    
    // Verify email access
    if (scan.user_email !== email) {
      console.log(`Unauthorized PDF access attempt: ${email} for scan ${scanId}`);
      return new Response('Unauthorized: Email does not match scan owner', { status: 401 });
    }
    
    // Check if tier supports PDF generation
    if (scan.tier === 'basic') {
      return json({ 
        error: 'PDF not available for basic tier',
        message: 'Upgrade to Starter tier for PDF reports',
        upgradeUrl: `/pricing?tier=starter&url=${encodeURIComponent(scan.url)}`
      }, { status: 403 });
    }
    
    // Check scan status
    if (scan.status !== 'completed') {
      return json({ 
        status: 'processing',
        message: 'Scan still in progress. Please wait for completion.',
        scanStatus: scan.status
      }, { status: 202 });
    }
    
    // Check PDF generation status
    switch (scan.pdf_generation_status) {
      case 'pending':
        return json({ 
          status: 'pdf_pending',
          message: 'PDF generation is queued. Please check back in a few minutes.',
          pdfStatus: 'pending'
        }, { status: 202 });
        
      case 'generating':
        return json({ 
          status: 'pdf_generating',
          message: 'PDF is being generated. Please wait...',
          pdfStatus: 'generating'
        }, { status: 202 });
        
      case 'failed':
        return json({ 
          error: 'PDF generation failed',
          message: 'PDF could not be generated. Please contact support if this persists.',
          supportEmail: 'support@aio-scanner.nl'
        }, { status: 500 });
        
      case 'completed':
        if (scan.pdf_url) {
          return json({ 
            pdfUrl: scan.pdf_url,
            tier: scan.tier,
            message: 'PDF report ready for download'
          });
        } else {
          // PDF marked as completed but no URL - regenerate
          return json({ 
            error: 'PDF URL not available',
            message: 'PDF needs to be regenerated. Please contact support.',
            supportEmail: 'support@aio-scanner.nl'
          }, { status: 500 });
        }
        
      default:
        return json({ 
          error: 'Unknown PDF status',
          message: 'PDF status unclear. Please contact support.',
          supportEmail: 'support@aio-scanner.nl'
        }, { status: 500 });
    }
    
  } catch (error) {
    console.error('PDF API error:', error);
    return json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
};

// POST endpoint for triggering PDF regeneration
export const POST: RequestHandler = async ({ params, request }) => {
  const { scanId } = params;
  
  try {
    const body = await request.json();
    const { email, action } = body;
    
    if (!email) {
      return new Response('Email is required', { status: 400 });
    }
    
    if (action !== 'regenerate') {
      return new Response('Invalid action. Only "regenerate" is supported.', { status: 400 });
    }
    
    // Verify scan ownership
    const { data: scan, error } = await supabase
      .from('scans')
      .select('tier, user_email, status')
      .eq('id', scanId)
      .single();
      
    if (error || !scan) {
      return new Response('Scan not found', { status: 404 });
    }
    
    if (scan.user_email !== email) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    if (scan.tier === 'basic') {
      return json({ 
        error: 'PDF regeneration not available for basic tier' 
      }, { status: 403 });
    }
    
    if (scan.status !== 'completed') {
      return json({ 
        error: 'Cannot regenerate PDF for incomplete scan' 
      }, { status: 400 });
    }
    
    // Reset PDF status to trigger regeneration
    const { error: updateError } = await supabase
      .from('scans')
      .update({ 
        pdf_generation_status: 'pending',
        pdf_url: null
      })
      .eq('id', scanId);
      
    if (updateError) {
      console.error('Failed to reset PDF status:', updateError);
      return json({ 
        error: 'Failed to trigger PDF regeneration' 
      }, { status: 500 });
    }
    
    // TODO: Trigger background PDF generation job
    // For now, we'll rely on the ScanOrchestrator.generatePDFForScan method
    
    return json({ 
      message: 'PDF regeneration triggered',
      status: 'pending',
      estimatedTime: '2-5 minutes'
    });
    
  } catch (error) {
    console.error('PDF regeneration error:', error);
    return json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};