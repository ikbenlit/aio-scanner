// src/lib/pdf/generator.ts
import { chromium } from 'playwright';
import type { EngineScanResult, ScanTier, NarrativeReport, PDFGenerationOptions } from '$lib/types/scan';
import { generateScanEmailTemplate, convertToEmailFormat, type EmailTemplateResult } from '$lib/email/templates';
import { NarrativePDFGenerator } from './narrativeGenerator.js';
import { generateStarterPDFHTML, type StarterPDFData } from './starterTemplate.js';
import { translateFindings, getPositiveFindings } from '$lib/results/translation';
import { selectVariedQuickWins } from '$lib/results/prioritization';

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

// Phase 3.5 - Tier-aware PDF Generator
export class TierAwarePDFGenerator {
  private narrativeGenerator = new NarrativePDFGenerator();

  async generatePDF(
    scanResult: EngineScanResult,
    tier: ScanTier,
    aiContent?: NarrativeReport
  ): Promise<Buffer> {
    console.log(`🏭 TierAwarePDFGenerator.generatePDF called with tier: ${tier}, aiContent: ${!!aiContent}`);
    
    switch(tier) {
      case 'basic':
        throw new Error('PDF generation not available for basic tier');
        
      case 'starter':
        console.log(`📄 Generating starter PDF...`);
        return this.generateStarterPDF(scanResult);
        
      case 'business':
        if (!aiContent) {
          console.error('❌ AI content missing for business tier');
          throw new Error('AI content required for business tier');
        }
        console.log(`📊 Generating business PDF with narrative content...`);
        return this.generateBusinessPDF(scanResult, aiContent);
        
      case 'enterprise':
        if (!aiContent) throw new Error('AI content required for enterprise tier');
        console.log(`🏢 Generating enterprise PDF with narrative content...`);
        return this.generateEnterprisePDF(scanResult, aiContent);
        
      default:
        throw new Error(`Unsupported tier: ${tier}`);
    }
  }
  
  private async generateStarterPDF(scanResult: EngineScanResult): Promise<Buffer> {
    console.log('🔄 Generating enhanced Starter PDF...');
    
    // Translate findings to business actions
    const businessActions = translateFindings(scanResult.moduleResults.flatMap(m => m.findings));
    
    // Get positive findings
    const positiveFindings = getPositiveFindings(scanResult.moduleResults);
    
    // Prioritize actions for starter tier (show all actions)
    const prioritizedActions = selectVariedQuickWins(businessActions);
    
    // Generate current date
    const generatedAt = new Date().toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create starter PDF data
    const starterData: StarterPDFData = {
      scanResult,
      businessActions: prioritizedActions,
      positiveFindings,
      generatedAt
    };
    
    // Generate HTML using new starter template
    const html = generateStarterPDFHTML(starterData);
    
    console.log(`📄 Starter PDF HTML generated, length: ${html.length} chars`);
    
    return await generatePDFFromHTML(html, {
      filename: `scan-report-starter-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url,
      format: 'A4',
      margin: { top: '0.6in', bottom: '0.6in', left: '0.6in', right: '0.6in' }
    });
  }
  
  private async generateBusinessPDF(
    scanResult: EngineScanResult, 
    narrative: NarrativeReport
  ): Promise<Buffer> {
    // Use dedicated narrative PDF generator instead of email template
    return await this.narrativeGenerator.generateBusinessReport(scanResult, narrative);
  }
  
  private async generateEnterprisePDF(
    scanResult: EngineScanResult,
    narrative: NarrativeReport
  ): Promise<Buffer> {
    // Use dedicated narrative PDF generator instead of email template
    return await this.narrativeGenerator.generateEnterpriseReport(scanResult, narrative);
  }
  
  // Legacy methods removed - now handled by NarrativePDFGenerator
  
  // Utility method for getting PDF options by tier
  static getPDFOptionsByTier(tier: ScanTier, scanId: string, url: string): PDFOptions {
    const baseOptions = {
      websiteUrl: url,
      format: 'A4' as const
    };
    
    switch(tier) {
      case 'starter':
        return {
          ...baseOptions,
          filename: `scan-report-starter-${scanId}.pdf`,
          margin: { top: '0.6in', bottom: '0.6in', left: '0.6in', right: '0.6in' }
        };
        
      case 'business':
        return {
          ...baseOptions,
          filename: `ai-report-business-${scanId}.pdf`,
          margin: { top: '0.8in', bottom: '0.8in', left: '0.6in', right: '0.6in' }
        };
        
      case 'enterprise':
        return {
          ...baseOptions,
          filename: `ai-report-enterprise-${scanId}.pdf`,
          margin: { top: '0.8in', bottom: '0.8in', left: '0.6in', right: '0.6in' }
        };
        
      default:
        throw new Error(`No PDF options available for tier: ${tier}`);
    }
  }
}