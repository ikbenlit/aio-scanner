import { json } from '@sveltejs/kit';
import { generateScanEmailTemplate, generateScanEmailText } from '$lib/email/templates';
import { sendScanReport } from '$lib/email/sender';
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
    const action = url.searchParams.get('action') || 'template';
    const email = url.searchParams.get('email');
    
    // EMAIL SENDING ACTION
    if (action === 'send') {
      if (!email) {
        return json({ 
          success: false, 
          error: 'Email parameter required for sending' 
        }, { status: 400 });
      }
      
      console.log(`📧 Testing complete email delivery to: ${email}`);
      
      const result = await sendScanReport(testScanResult, email);
      
      return json({
        success: result.success,
        message: result.success 
          ? '✅ Email met PDF rapport succesvol verstuurd!'
          : '❌ Email verzending gefaald',
        details: {
          messageId: result.messageId,
          pdfGenerated: result.pdfGenerated,
          emailSent: result.emailSent,
          error: result.error
        },
        testData: {
          scanId: testScanResult.scanId,
          recipientEmail: email,
          reportUrl: testScanResult.url,
          score: testScanResult.overallScore
        }
      });
    }
    
    // TEMPLATE GENERATION (existing functionality)
    const htmlEmail = generateScanEmailTemplate(testScanResult);
    const textEmail = generateScanEmailText(testScanResult);

    return json({
      success: true,
      action: 'template',
      data: {
        html: htmlEmail,
        text: textEmail
      },
      usage: {
        template: '/api/test/email',
        send: '/api/test/email?action=send&email=your@email.com'
      }
    });
    
  } catch (error) {
    console.error('Email operation error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}