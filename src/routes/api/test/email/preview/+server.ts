import { generateScanEmailTemplate } from '$lib/email/templates';
import { generatePDFFromHTML } from '$lib/pdf/generator';
import type { Finding } from '$lib/types/scan';

// Test data voor de email template
const testScanResult = {
  scanId: 'test-123',
  url: 'https://example.com',
  overallScore: 75,
  createdAt: new Date().toISOString(),
  status: 'completed' as const,
  moduleResults: [
    {
      name: 'Technical SEO',
      score: 85,
      findings: [
        {
          type: 'error',
          title: 'Robots.txt Optimalisatie',
          description: 'Je robots.txt blokkeert belangrijke AI crawl paden.',
          impact: 'high',
          recommendation: 'Update je robots.txt om AI crawlers toe te staan.'
        }
      ] as Finding[]
    },
    {
      name: 'Schema Markup',
      score: 65,
      findings: [
        {
          type: 'warning',
          title: 'Onvolledige Schema.org Data',
          description: 'Voeg Organization schema toe voor betere AI-zichtbaarheid.',
          impact: 'medium',
          recommendation: 'Implementeer Organization schema markup.'
        }
      ] as Finding[]
    },
    {
      name: 'AI Content',
      score: 90,
      findings: [] as Finding[]
    },
    {
      name: 'AI Citations',
      score: 60,
      findings: [
        {
          type: 'warning',
          title: 'Authority Signals',
          description: 'Voeg meer expertise markers toe aan je content.',
          impact: 'medium',
          recommendation: 'Voeg expert citations en credentials toe.'
        }
      ] as Finding[]
    }
  ]
};

export async function GET({ url }) {
  try {
    const format = url.searchParams.get('format') || 'html';
    const email = url.searchParams.get('email') || 'test@example.com';
    
    // Genereer HTML email
    const htmlEmail = generateScanEmailTemplate(testScanResult);

    if (format === 'pdf') {
      // Generate PDF from HTML
      const pdfBuffer = await generatePDFFromHTML(htmlEmail, {
        filename: `aio-scan-${testScanResult.scanId}.pdf`,
        websiteUrl: testScanResult.url
      });

      // Return PDF binary
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="AIO-Scanner-Report-${testScanResult.scanId}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Return HTML direct voor preview (default)
    return new Response(htmlEmail, {
      headers: {
        'Content-Type': 'text/html'
      }
    });

  } catch (error: unknown) {
    console.error('Email/PDF generation error:', error);
    if (error instanceof Error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
    return new Response('An unknown error occurred', { status: 500 });
  }
}