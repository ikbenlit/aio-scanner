// src/lib/pdf/generator.ts
import { chromium } from 'playwright';
import type { EngineScanResult, ScanTier, NarrativeReport, PDFGenerationOptions } from '$lib/types/scan';
import { generateScanEmailTemplate, convertToEmailFormat, type EmailTemplateResult } from '$lib/email/templates';

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
  async generatePDF(
    scanResult: EngineScanResult,
    tier: ScanTier,
    aiContent?: NarrativeReport
  ): Promise<Buffer> {
    
    switch(tier) {
      case 'basic':
        throw new Error('PDF generation not available for basic tier');
        
      case 'starter':
        return this.generateStarterPDF(scanResult);
        
      case 'business':
        if (!aiContent) throw new Error('AI content required for business tier');
        return this.generateBusinessPDF(scanResult, aiContent);
        
      case 'enterprise':
        if (!aiContent) throw new Error('AI content required for enterprise tier');
        return this.generateEnterprisePDF(scanResult, aiContent);
        
      default:
        throw new Error(`Unsupported tier: ${tier}`);
    }
  }
  
  private async generateStarterPDF(scanResult: EngineScanResult): Promise<Buffer> {
    const templateData: EmailTemplateResult = {
      ...convertToEmailFormat(scanResult),
      includeRecommendations: true,
      tier: 'starter'
    };
    
    const html = generateScanEmailTemplate(templateData);
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
    const templateData: EmailTemplateResult = {
      ...convertToEmailFormat(scanResult),
      aiNarrative: this.formatNarrativeForPDF(narrative),
      includeRecommendations: true,
      tier: 'business'
    };
    
    const html = generateScanEmailTemplate(templateData);
    return await generatePDFFromHTML(html, {
      filename: `ai-report-business-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url,
      format: 'A4',
      margin: { top: '0.8in', bottom: '0.8in', left: '0.6in', right: '0.6in' }
    });
  }
  
  private async generateEnterprisePDF(
    scanResult: EngineScanResult,
    narrative: NarrativeReport
  ): Promise<Buffer> {
    const templateData: EmailTemplateResult = {
      ...convertToEmailFormat(scanResult),
      aiNarrative: this.formatNarrativeForPDF(narrative),
      enhancedInsights: true,
      includeRecommendations: true,
      tier: 'enterprise'
    };
    
    const html = generateScanEmailTemplate(templateData);
    return await generatePDFFromHTML(html, {
      filename: `ai-report-enterprise-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url,
      format: 'A4',
      margin: { top: '0.8in', bottom: '0.8in', left: '0.6in', right: '0.6in' }
    });
  }
  
  private formatNarrativeForPDF(narrative: NarrativeReport) {
    return {
      executiveSummary: this.wrapTextForPDF(narrative.executiveSummary),
      detailedAnalysis: this.formatAnalysisSection(narrative.detailedAnalysis),
      implementationRoadmap: this.formatRoadmap(narrative.implementationRoadmap),
      conclusionNextSteps: this.wrapTextForPDF(narrative.conclusionNextSteps)
    };
  }
  
  private wrapTextForPDF(text: string): string {
    // Ensure proper line breaks and paragraph spacing for PDF rendering
    return text
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
      .replace(/(.{80,100})\s/g, '$1\n') // Soft wrap long lines
      .trim();
  }
  
  private formatAnalysisSection(analysis: string): string {
    // Handle longer analysis text with better formatting
    const paragraphs = analysis.split('\n\n').filter(p => p.trim());
    
    return paragraphs
      .map(paragraph => this.wrapTextForPDF(paragraph))
      .join('\n\n');
  }
  
  private formatRoadmap(roadmap: string): string {
    // Preserve numbered lists and bullet points
    const lines = roadmap.split('\n').filter(line => line.trim());
    
    return lines
      .map(line => {
        // Preserve numbered items
        if (/^\d+\./.test(line.trim())) {
          return line.trim();
        }
        // Preserve bullet points
        if (/^[-•*]/.test(line.trim())) {
          return line.trim();
        }
        // Wrap regular text
        return this.wrapTextForPDF(line.trim());
      })
      .join('\n');
  }
  
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