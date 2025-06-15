// src/lib/pdf/generator.ts
import { chromium } from 'playwright';

interface PDFOptions {
  filename: string;
  websiteUrl: string;
  format?: 'A4' | 'Letter';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export async function generatePDFFromHTML(
  htmlContent: string, 
  options: PDFOptions
): Promise<Buffer> {
  let browser;
  
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Load HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle'
    });
    
    // Wait for any fonts/images to load
    await page.waitForTimeout(1000);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true,
      // Add metadata
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-top: 10px;">
          AIO-Scanner Rapport - ${options.websiteUrl}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-bottom: 10px;">
          Gegenereerd op <span class="date"></span> - Pagina <span class="pageNumber"></span> van <span class="totalPages"></span>
        </div>
      `
    });
    
    return Buffer.from(pdfBuffer);
    
  } catch (error: unknown) {
    console.error('PDF generation error:', error);
    // Type guard voor betere error handling
    if (error instanceof Error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
    // Fallback voor onbekende error types
    throw new Error('PDF generation failed: Unknown error occurred');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Alternative simpler version zonder headers/footers
export async function generateSimplePDF(htmlContent: string): Promise<Buffer> {
  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      printBackground: true
    });
    
    return Buffer.from(pdfBuffer);
    
  } catch (error: unknown) {
    console.error('PDF generation error:', error);
    if (error instanceof Error) {
      throw new Error(`Simple PDF generation failed: ${error.message}`);
    }
    throw new Error('Simple PDF generation failed: Unknown error occurred');
  } finally {
    if (browser) await browser.close();
  }
}