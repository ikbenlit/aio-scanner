// src/lib/pdf/generator.ts
import { chromium } from 'playwright';
import type { EngineScanResult, ScanTier, NarrativeReport, PDFGenerationOptions } from '$lib/types/scan';
import { generateScanEmailTemplate, convertToEmailFormat, type EmailTemplateResult } from '$lib/email/templates';
import { NarrativePDFGenerator } from './narrativeGenerator.js';
import { generateStarterPDFHTML, type StarterPDFData } from './starterTemplate.js';
import { translateFindings, getPositiveFindings } from '$lib/results/translation';
import { selectVariedQuickWins } from '$lib/results/prioritization';

// Unified Brand Styles for MVP Enhancement (Fase 3.1 + 3.2)
const BRAND_STYLES = {
  primaryColor: '#2563eb',
  secondaryColor: '#4FACFE', 
  successColor: '#10b981',
  warningColor: '#F5B041',
  dangerColor: '#E74C3C',
  textPrimary: '#1a1a1a',
  textSecondary: '#4a5568',
  borderLight: '#e2e8f0',
  headerFont: 'Segoe UI, Arial, Helvetica, sans-serif',
  bodyFont: 'Segoe UI, Arial, Helvetica, sans-serif',
  margins: { 
    top: '60px', 
    bottom: '60px', 
    left: '40px', 
    right: '40px' 
  },
  // Enhanced typography (Fase 3.2)
  typography: {
    h1: { fontSize: '28px', fontWeight: '700', lineHeight: '1.2', marginBottom: '16px' },
    h2: { fontSize: '24px', fontWeight: '600', lineHeight: '1.3', marginBottom: '14px' },
    h3: { fontSize: '20px', fontWeight: '600', lineHeight: '1.4', marginBottom: '12px' },
    h4: { fontSize: '18px', fontWeight: '500', lineHeight: '1.4', marginBottom: '10px' },
    body: { fontSize: '14px', fontWeight: '400', lineHeight: '1.6', marginBottom: '12px' },
    small: { fontSize: '12px', fontWeight: '400', lineHeight: '1.5', marginBottom: '8px' }
  }
};

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
      // Enhanced branded headers/footers (Fase 3.1)
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 11px; color: ${BRAND_STYLES.textSecondary}; width: 100%; text-align: center; margin-top: 12px; font-family: ${BRAND_STYLES.headerFont}; border-bottom: 1px solid ${BRAND_STYLES.borderLight}; padding-bottom: 8px;">
          <span style="color: ${BRAND_STYLES.primaryColor}; font-weight: 600;">AIO-Scanner</span> Professional Report - ${options.websiteUrl}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: ${BRAND_STYLES.textSecondary}; width: 100%; text-align: center; margin-bottom: 12px; font-family: ${BRAND_STYLES.bodyFont}; border-top: 1px solid ${BRAND_STYLES.borderLight}; padding-top: 8px;">
          Gegenereerd op <span class="date"></span> - Pagina <span class="pageNumber"></span> van <span class="totalPages"></span> | <span style="color: ${BRAND_STYLES.primaryColor};">AI-LINER.nl</span>
        </div>
      `
    });
    
    return Buffer.from(pdfBuffer);
    
  } catch (error: unknown) {
    console.error('PDF generation error:', error);
    // Enhanced error handling with fallback content
    if (error instanceof Error) {
      // Check if it's a content-related error
      if (error.message.includes('content') || error.message.includes('missing')) {
        console.log('📋 Content error detected, attempting graceful fallback...');
        throw new Error(`PDF generation failed - content issue: ${error.message}`);
      }
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
    
    try {
      // Graceful fallback for missing content (Fase 3.2)
      const moduleResults = scanResult.moduleResults || [];
      const findings = moduleResults.flatMap(m => m.findings || []);
      
      // Translate findings to business actions with fallback
      const businessActions = findings.length > 0 
        ? translateFindings(findings)
        : this.getDefaultBusinessActions();
      
      // Get positive findings with fallback
      const positiveFindings = moduleResults.length > 0 
        ? getPositiveFindings(moduleResults.flatMap(m => m.findings))
        : this.getDefaultPositiveFindings();
      
      // Prioritize actions for starter tier (show all actions)
      const prioritizedActions = selectVariedQuickWins(businessActions);
      
      // Generate current date
      const generatedAt = new Date().toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create starter PDF data with validation
      const starterData: StarterPDFData = {
        scanResult: this.validateScanResult(scanResult),
        businessActions: prioritizedActions,
        positiveFindings,
        generatedAt
      };
      
      // Generate HTML using new starter template
      const html = generateStarterPDFHTML(starterData);
      
      if (!html || html.length < 1000) {
        console.warn('⚠️ Generated HTML seems too short, using fallback template');
        throw new Error('Generated HTML content is insufficient');
      }
      
      console.log(`📄 Starter PDF HTML generated, length: ${html.length} chars`);
      
      // Use unified brand styles for starter tier
      const pdfOptions = TierAwarePDFGenerator.getPDFOptionsByTier('starter', scanResult.scanId, scanResult.url);
      return await generatePDFFromHTML(html, pdfOptions);
      
    } catch (error) {
      console.error('❌ Starter PDF generation failed:', error);
      // Fallback to minimal PDF if main generation fails
      return await this.generateFallbackPDF(scanResult, 'starter');
    }
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
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const baseOptions = {
      websiteUrl: url,
      format: 'A4' as const,
      margin: BRAND_STYLES.margins // Use unified brand margins
    };
    
    switch(tier) {
      case 'starter':
        return {
          ...baseOptions,
          filename: `scan-${scanId}-${timestamp}.pdf` // Production naming format
        };
        
      case 'business':
        return {
          ...baseOptions,
          filename: `scan-${scanId}-${timestamp}.pdf`, // Production naming format
          margin: { 
            top: '70px', 
            bottom: '70px', 
            left: '50px', 
            right: '50px' 
          } // Slightly more margin for business content
        };
        
      case 'enterprise':
        return {
          ...baseOptions,
          filename: `scan-${scanId}-${timestamp}.pdf`, // Production naming format
          margin: { 
            top: '70px', 
            bottom: '70px', 
            left: '50px', 
            right: '50px' 
          } // Premium margins for enterprise
        };
        
      default:
        throw new Error(`No PDF options available for tier: ${tier}`);
    }
  }
  
  // Export brand styles for use in templates
  static getBrandStyles() {
    return BRAND_STYLES;
  }
  
  // Helper methods for graceful error handling (Fase 3.2)
  private getDefaultBusinessActions(): any[] {
    return [
      {
        title: 'Meta descriptions optimaliseren',
        description: 'Verbeter je meta descriptions voor betere SEO prestaties',
        category: 'technical',
        priority: 'high',
        difficulty: 'easy',
        estimatedTime: '30 minuten'
      },
      {
        title: 'Alt-tags voor afbeeldingen toevoegen',
        description: 'Voeg beschrijvende alt-tags toe aan je afbeeldingen',
        category: 'technical',
        priority: 'medium',
        difficulty: 'easy',
        estimatedTime: '45 minuten'
      },
      {
        title: 'Structured data implementeren',
        description: 'Voeg schema markup toe voor betere AI-vindbaarheid',
        category: 'schema',
        priority: 'high',
        difficulty: 'medium',
        estimatedTime: '2 uur'
      }
    ];
  }
  
  private getDefaultPositiveFindings(): string[] {
    return [
      'Website heeft een goede basisstructuur',
      'Responsieve design is geïmplementeerd',
      'Laadsnelheid is acceptabel'
    ];
  }
  
  private validateScanResult(scanResult: EngineScanResult): EngineScanResult {
    return {
      ...scanResult,
      overallScore: scanResult.overallScore || 75,
      url: scanResult.url || 'https://example.com',
      scanId: scanResult.scanId || 'default-scan-id',
      moduleResults: scanResult.moduleResults || []
    };
  }
  
  private async generateFallbackPDF(scanResult: EngineScanResult, tier: string): Promise<Buffer> {
    console.log(`🔄 Generating fallback PDF for ${tier} tier...`);
    
    const fallbackHTML = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="utf-8">
        <title>AIO Scanner Rapport - Fallback</title>
        <style>
          body { font-family: ${BRAND_STYLES.bodyFont}; color: ${BRAND_STYLES.textPrimary}; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { color: ${BRAND_STYLES.primaryColor}; font-size: 24px; font-weight: bold; }
          .error-message { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .basic-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AIO Scanner</div>
          <h1>Website Analyse Rapport</h1>
        </div>
        <div class="error-message">
          <h3>📋 Beperkte Content Beschikbaar</h3>
          <p>Er was een probleem met het genereren van het volledige rapport. Dit is een basis versie met beschikbare informatie.</p>
        </div>
        <div class="basic-info">
          <h3>Scan Details</h3>
          <p><strong>Website:</strong> ${scanResult.url}</p>
          <p><strong>Scan ID:</strong> ${scanResult.scanId}</p>
          <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
          <p><strong>Tier:</strong> ${tier}</p>
        </div>
        <div class="basic-info">
          <h3>Algemene Aanbevelingen</h3>
          <ul>
            <li>Controleer je meta descriptions</li>
            <li>Optimaliseer afbeelding alt-tags</li>
            <li>Implementeer structured data</li>
          </ul>
        </div>
      </body>
      </html>
    `;
    
    return await generatePDFFromHTML(fallbackHTML, {
      filename: `fallback-${tier}-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url
    });
  }
}