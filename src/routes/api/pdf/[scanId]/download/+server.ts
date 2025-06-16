import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  const { scanId } = params;
  const email = url.searchParams.get('email');
  const token = url.searchParams.get('token'); // Alternative auth method
  
  if (!scanId) {
    return new Response('Scan ID is required', { status: 400 });
  }
  
  if (!email && !token) {
    return new Response('Email or token is required for authentication', { status: 400 });
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
    
    // Verify access (email or token-based)
    if (email && scan.user_email !== email) {
      console.log(`Unauthorized PDF download attempt: ${email} for scan ${scanId}`);
      return new Response('Unauthorized: Email does not match scan owner', { status: 401 });
    }
    
    // TODO: Implement token-based authentication if needed
    if (token && !email) {
      // Token verification would go here
      console.log('Token-based authentication not yet implemented');
      return new Response('Token authentication not implemented', { status: 501 });
    }
    
    // Check if tier supports PDF generation
    if (scan.tier === 'basic') {
      return new Response('PDF not available for basic tier. Upgrade to Starter tier for PDF reports.', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // Check scan and PDF status
    if (scan.status !== 'completed' || scan.pdf_generation_status !== 'completed' || !scan.pdf_url) {
      const message = scan.status !== 'completed' ? 'Scan still in progress' :
                     scan.pdf_generation_status === 'generating' ? 'PDF is being generated' :
                     scan.pdf_generation_status === 'failed' ? 'PDF generation failed' :
                     'PDF not available';
                     
      return new Response(message, { 
        status: scan.pdf_generation_status === 'failed' ? 500 : 202,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // Get PDF file from Supabase Storage
    const pdfPath = scan.pdf_url.split('/').slice(-4).join('/'); // Extract path from URL
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('scan-reports')
      .download(pdfPath);
      
    if (downloadError || !pdfData) {
      console.error('PDF download failed:', downloadError);
      return new Response('PDF file not found in storage', { status: 404 });
    }
    
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await pdfData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Generate filename
    const domain = new URL(scan.url).hostname;
    const tierPrefix = scan.tier.charAt(0).toUpperCase() + scan.tier.slice(1);
    const filename = `AIO-Scanner-${tierPrefix}-Report-${domain}.pdf`;
    
    // Return PDF file with proper headers
    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8Array.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'X-Scan-Tier': scan.tier,
        'X-Generated-Date': new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('PDF download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};