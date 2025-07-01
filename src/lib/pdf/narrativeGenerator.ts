import type { EngineScanResult, NarrativeReport, AIInsights, ScanTier } from '$lib/types/scan';
import { generatePDFFromHTML } from './generator.js';

export class NarrativePDFGenerator {
  async generateBusinessReport(
    scanResult: EngineScanResult,
    narrative: NarrativeReport
  ): Promise<Buffer> {
    
    const htmlContent = this.buildNarrativeHTML(scanResult, narrative, 'business');
    
    return await generatePDFFromHTML(htmlContent, {
      filename: `ai-business-report-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url
    });
  }

  async generateEnterpriseReport(
    scanResult: EngineScanResult,
    narrative: NarrativeReport
  ): Promise<Buffer> {
    
    const htmlContent = this.buildNarrativeHTML(scanResult, narrative, 'enterprise');
    
    return await generatePDFFromHTML(htmlContent, {
      filename: `ai-enterprise-report-${scanResult.scanId}.pdf`,
      websiteUrl: scanResult.url
    });
  }

  private buildNarrativeHTML(
    scanResult: EngineScanResult,
    narrative: NarrativeReport,
    tier: 'business' | 'enterprise'
  ): string {
    const websiteName = this.extractDomainName(scanResult.url);
    const currentDate = new Date().toLocaleDateString('nl-NL');

    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>AI Website Analysis - ${websiteName}</title>
  <style>
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a; 
      margin: 0; 
      padding: 0; 
    }
    
    .header { 
      background: linear-gradient(135deg, #2E9BDA, #4FACFE); 
      color: white; 
      padding: 40px 30px; 
      text-align: center;
      margin-bottom: 30px;
    }
    
    .header h1 { 
      font-size: 28px; 
      margin: 0 0 10px 0; 
      font-weight: 700;
    }
    
    .score-badge { 
      display: inline-block;
      background: rgba(255, 255, 255, 0.2); 
      border-radius: 50px; 
      padding: 15px 25px; 
      font-size: 24px; 
      font-weight: bold;
    }
    
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 0 20px;
    }
    
    .section { 
      margin-bottom: 40px; 
    }
    
    .section h2 { 
      color: #2E9BDA; 
      font-size: 20px; 
      border-bottom: 3px solid #e2e8f0; 
      padding-bottom: 10px; 
      margin-bottom: 20px;
    }
    
    .narrative-content { 
      background: #f8fafc; 
      border-left: 4px solid #2E9BDA; 
      padding: 25px; 
      margin: 20px 0; 
      border-radius: 8px;
      font-size: 15px;
      line-height: 1.7;
    }
    
    .footer { 
      background: #f8fafc;
      text-align: center; 
      color: #64748b; 
      padding: 30px 20px;
      margin-top: 50px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Website Analysis Rapport</h1>
    <div>
      <strong>Website:</strong> ${scanResult.url}<br>
      <strong>Analyse Datum:</strong> ${currentDate}<br>
      <strong>Tier:</strong> ${tier.charAt(0).toUpperCase() + tier.slice(1)}
    </div>
    <div class="score-badge">
      Score: ${scanResult.overallScore}/100
    </div>
  </div>

  <div class="container">
    <div class="section">
      <h2>🎯 Executive Summary</h2>
      <div class="narrative-content">
        ${this.formatTextForHTML(narrative.executiveSummary)}
      </div>
    </div>

    <div class="section">
      <h2>🔍 Gedetailleerde Analyse</h2>
      <div class="narrative-content">
        ${this.formatTextForHTML(narrative.detailedAnalysis)}
      </div>
    </div>

    <div class="section">
      <h2>🗺️ Implementatie Roadmap</h2>
      <div class="narrative-content">
        ${this.formatTextForHTML(narrative.implementationRoadmap)}
      </div>
    </div>

    <div class="section">
      <h2>🚀 Conclusie & Volgende Stappen</h2>
      <div class="narrative-content">
        ${this.formatTextForHTML(narrative.conclusionNextSteps)}
      </div>
    </div>
  </div>

  <div class="footer">
    <div><strong>AIO-Scanner AI Analysis</strong></div>
    <div>Rapport ID: ${scanResult.scanId} | Gegenereerd: ${currentDate}</div>
  </div>
</body>
</html>`;
  }

  private formatTextForHTML(text: string): string {
    return text
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join('');
  }

  private extractDomainName(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
} 