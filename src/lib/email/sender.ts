// src/lib/email/sender.ts
import { generateScanEmailTemplate } from './templates';
import { generatePDFFromHTML } from '../pdf/generator';
import { sendEmail } from './client';
import type { EmailScanResult as ScanResult } from '$lib/types/scan';

interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  pdfGenerated: boolean;
  emailSent: boolean;
}

export async function sendScanReport(
  scanResult: ScanResult, 
  recipientEmail: string
): Promise<EmailDeliveryResult> {
  try {
    console.log(`📧 Starting email delivery for scan ${scanResult.scanId} to ${recipientEmail}`);
    
    // 1. Generate HTML email template
    console.log('🎨 Generating email template...');
    const emailHTML = generateScanEmailTemplate(scanResult);
    
    // 2. Generate PDF from same HTML
    console.log('📄 Generating PDF report...');
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDFFromHTML(emailHTML, {
        filename: `aio-scan-${scanResult.scanId}.pdf`,
        websiteUrl: scanResult.url
      });
      console.log('📄 PDF generated successfully');
    } catch (pdfError) {
      console.error('📄 PDF generation failed:', pdfError);
      throw new Error('PDF generatie mislukt: ' + (pdfError instanceof Error ? pdfError.message : 'Onbekende fout'));
    }
    
    // 3. Send email with PDF attachment
    console.log('📧 Sending email with PDF attachment...');
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: `✅ Je AIO-Scanner rapport voor ${scanResult.url}`,
      html: emailHTML,
      attachments: [{
        filename: `AIO-Scanner-Rapport-${scanResult.scanId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    
    console.log('📧 Email send result:', emailResult);
    
    if (!emailResult.success) {
      throw new Error(`Email verzending mislukt: ${emailResult.error}`);
    }
    
    return {
      success: true,
      messageId: emailResult.messageId || undefined,
      error: undefined,
      pdfGenerated: true,
      emailSent: true
    };
    
  } catch (error) {
    console.error('❌ Email delivery failed:', error);
    return {
      success: false,
      messageId: undefined,
      error: error instanceof Error ? error.message : 'Onbekende fout bij email verzending',
      pdfGenerated: false,
      emailSent: false
    };
  }
}

// Notification email (kort bericht + PDF attachment)
function createNotificationEmail(scanResult: ScanResult, recipientEmail: string): string {
  const domain = new URL(scanResult.url).hostname;
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #2E9BDA, #4FACFE); color: white; padding: 2rem; text-align: center; }
    .content { padding: 2rem; }
    .score-highlight { background: linear-gradient(135deg, rgba(46, 155, 218, 0.1), rgba(0, 245, 255, 0.1)); padding: 1.5rem; border-radius: 12px; text-align: center; margin: 1.5rem 0; }
    .score-value { font-size: 3rem; font-weight: bold; color: #2E9BDA; margin-bottom: 0.5rem; }
    .cta-button { display: inline-block; background: #2E9BDA; color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; margin: 1rem 0; }
    .footer { background: #f8fafc; padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AIO-Scanner</h1>
      <h2>Je scan resultaten zijn klaar! 🎉</h2>
    </div>
    
    <div class="content">
      <p>Hallo,</p>
      
      <p>Je AI-gereedheid scan van <strong>${domain}</strong> is voltooid!</p>
      
      <div class="score-highlight">
        <div class="score-value">${scanResult.overallScore}/100</div>
        <p><strong>AI-Gereedheid Score</strong></p>
        <p>Je volledige rapport vind je als PDF bijlage bij deze email.</p>
      </div>
      
      <p><strong>Wat zit er in je rapport?</strong></p>
      <ul>
        <li>✅ Uitgebreide analyse van 4 AI-modules</li>
        <li>📊 Gedetailleerde scores per onderdeel</li> 
        <li>⚡ Top prioritaire verbeterpunten</li>
        <li>💡 Concrete implementatie aanbevelingen</li>
      </ul>
      
      <div style="text-align: center; margin: 2rem 0;">
        <a href="https://aio-scanner.nl" class="cta-button">Scan nog een website</a>
      </div>
      
      <p>Vragen over je rapport? Stuur een email naar <a href="mailto:support@aio-scanner.nl">support@aio-scanner.nl</a></p>
      
      <p>Succes met het optimaliseren van je website! 🚀</p>
      
      <p>Het AIO-Scanner team</p>
    </div>
    
    <div class="footer">
      <p><strong>AIO-Scanner</strong> - AI-gereedheid scanner voor websites</p>
      <p>Deze scan werd uitgevoerd op ${new Date(scanResult.createdAt).toLocaleDateString('nl-NL')}</p>
      <p><a href="https://aio-scanner.nl">Website</a> • <a href="mailto:support@aio-scanner.nl">Support</a> • <a href="https://aio-scanner.nl/privacy">Privacy</a></p>
    </div>
  </div>
</body>
</html>`;
}