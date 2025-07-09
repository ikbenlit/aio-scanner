// src/lib/pdf/starterTemplate.ts
import type { EngineScanResult, BusinessAction } from '$lib/types/scan';
import { translateFindings, getPositiveFindings } from '$lib/results/translation';
import { selectVariedQuickWins } from '$lib/results/prioritization';

export interface StarterPDFData {
  scanResult: EngineScanResult;
  businessActions: BusinessAction[];
  positiveFindings: string[];
  generatedAt: string;
}

export function generateStarterPDFHTML(data: StarterPDFData): string {
  const { scanResult, businessActions, positiveFindings, generatedAt } = data;
  
  // Extract domain name for title
  const websiteName = extractDomainName(scanResult.url);
  
  // Score interpretation
  const scoreInterpretation = getScoreInterpretation(scanResult.overallScore);
  
  // Group actions by module
  const actionsByModule = groupActionsByModule(businessActions);
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>AIO Scanner Rapport - ${websiteName}</title>
  <style>
    ${getStarterPDFStyles()}
  </style>
</head>
<body>
  <div class="document">
    ${renderHeader(websiteName, scanResult.url)}
    ${renderHeroScore(scanResult.overallScore, scoreInterpretation)}
    ${renderScanDetails(scanResult, generatedAt)}
    ${renderPositiveFindings(positiveFindings)}
    ${renderQuickWinsSection(actionsByModule)}
    ${renderFooter(scanResult.scanId)}
  </div>
</body>
</html>
  `;
}

function extractDomainName(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/[^a-zA-Z0-9.-]/g, '').substring(0, 50);
  }
}

function getScoreInterpretation(score: number): { label: string; color: string; description: string } {
  if (score >= 90) return { 
    label: 'Excellent', 
    color: '#10b981', 
    description: 'Je website is uitstekend geoptimaliseerd voor AI-assistenten' 
  };
  if (score >= 80) return { 
    label: 'Goed', 
    color: '#10b981', 
    description: 'Je website scoort goed, met enkele verbetermogelijkheden' 
  };
  if (score >= 70) return { 
    label: 'Gemiddeld', 
    color: '#f59e0b', 
    description: 'Je website heeft duidelijke verbeterpunten voor AI-optimalisatie' 
  };
  if (score >= 60) return { 
    label: 'Matig', 
    color: '#f59e0b', 
    description: 'Je website heeft substantiële verbeteringen nodig' 
  };
  return { 
    label: 'Onder gemiddeld', 
    color: '#ef4444', 
    description: 'Je website heeft een grondige optimalisatie nodig' 
  };
}

function groupActionsByModule(actions: BusinessAction[]): Record<string, BusinessAction[]> {
  const grouped: Record<string, BusinessAction[]> = {};
  
  actions.forEach(action => {
    const category = action.category || 'general';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(action);
  });
  
  return grouped;
}

function getModuleDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'technical-seo': 'Technische SEO',
    'schema-markup': 'Schema Markup',
    'ai-content': 'AI Content',
    'ai-citation': 'AI Citation',
    'cross-web-footprint': 'Cross-web Footprint',
    'versheid': 'Content Versheid',
    'business-info': 'Bedrijfsinformatie',
    'authority': 'Autoriteit',
    'general': 'Algemene Optimalisatie'
  };
  
  return categoryMap[category] || category;
}

function renderHeader(websiteName: string, url: string): string {
  return `
    <header class="pdf-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <div class="logo-icon">🤖</div>
            <div class="logo-text">
              <h1>AIO Scanner</h1>
              <p>AI-Optimalisatie Rapport</p>
            </div>
          </div>
        </div>
        <div class="website-info">
          <h2>${websiteName}</h2>
          <p class="url">${url}</p>
        </div>
      </div>
    </header>
  `;
}

function renderHeroScore(score: number, interpretation: { label: string; color: string; description: string }): string {
  return `
    <section class="hero-score">
      <div class="score-container">
        <div class="score-circle" style="border-color: ${interpretation.color}">
          <div class="score-number">${score}</div>
          <div class="score-max">/100</div>
        </div>
        <div class="score-details">
          <h3 class="score-label" style="color: ${interpretation.color}">${interpretation.label}</h3>
          <p class="score-description">${interpretation.description}</p>
        </div>
      </div>
    </section>
  `;
}

function renderScanDetails(scanResult: EngineScanResult, generatedAt: string): string {
  const scanDate = new Date(scanResult.createdAt).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <section class="scan-details">
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Scan uitgevoerd:</span>
          <span class="detail-value">${scanDate}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Rapport gegenereerd:</span>
          <span class="detail-value">${generatedAt}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Scan ID:</span>
          <span class="detail-value">${scanResult.scanId}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tier:</span>
          <span class="detail-value">Starter</span>
        </div>
      </div>
    </section>
  `;
}

function renderPositiveFindings(positiveFindings: string[]): string {
  if (positiveFindings.length === 0) return '';
  
  return `
    <section class="positive-findings">
      <h3>✅ Wat je al goed doet</h3>
      <ul class="findings-list">
        ${positiveFindings.map(finding => `
          <li class="finding-item positive">
            <span class="finding-icon">✓</span>
            <span class="finding-text">${finding}</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderQuickWinsSection(actionsByModule: Record<string, BusinessAction[]>): string {
  const modules = Object.keys(actionsByModule);
  
  if (modules.length === 0) {
    return `
      <section class="quick-wins">
        <h3>🎉 Gefeliciteerd!</h3>
        <p class="no-actions">Je website is al uitstekend geoptimaliseerd. We hebben geen directe verbeterpunten gevonden.</p>
      </section>
    `;
  }
  
  return `
    <section class="quick-wins">
      <h3>🚀 Jouw Implementatie Checklist</h3>
      <p class="section-description">Deze acties hebben de grootste impact op je AI-vindbaarheid:</p>
      
      ${modules.map(module => `
        <div class="module-section">
          <h4 class="module-title">${getModuleDisplayName(module)}</h4>
          <div class="actions-list">
            ${actionsByModule[module].map((action, index) => `
              <div class="action-card">
                <div class="action-header">
                  <span class="action-number">${index + 1}</span>
                  <h5 class="action-title">${action.title}</h5>
                  <div class="action-meta">
                    <span class="action-time">${action.timeEstimate}</span>
                    <span class="action-impact">${action.impactPoints}</span>
                  </div>
                </div>
                <div class="action-body">
                  <p class="action-why"><strong>Waarom:</strong> ${action.why}</p>
                  <p class="action-how"><strong>Hoe:</strong> ${action.how}</p>
                  ${action.expandedDetails ? `
                    <div class="action-details">
                      <p><strong>Stappen:</strong></p>
                      <ul>
                        ${action.expandedDetails.steps?.map(step => `<li>${step}</li>`).join('') || ''}
                      </ul>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </section>
  `;
}

function renderFooter(scanId: string): string {
  return `
    <footer class="pdf-footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>Gegenereerd door AIO Scanner</p>
          <p class="scan-id">Scan ID: ${scanId}</p>
        </div>
        <div class="footer-right">
          <p>Voor meer informatie:</p>
          <p class="website-link">https://aio-scanner.nl</p>
        </div>
      </div>
    </footer>
  `;
}

function getStarterPDFStyles(): string {
  return `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }
    
    .document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    
    /* Header */
    .pdf-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2E9BDA;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo-icon {
      font-size: 48px;
      line-height: 1;
    }
    
    .logo-text h1 {
      font-size: 24px;
      font-weight: 700;
      color: #2E9BDA;
      margin-bottom: 5px;
    }
    
    .logo-text p {
      font-size: 14px;
      color: #64748b;
    }
    
    .website-info {
      text-align: right;
    }
    
    .website-info h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    
    .url {
      font-size: 14px;
      color: #64748b;
      font-family: monospace;
    }
    
    /* Hero Score */
    .hero-score {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
    }
    
    .score-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      border: 6px solid;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .score-number {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }
    
    .score-max {
      font-size: 16px;
      color: #64748b;
      margin-top: -5px;
    }
    
    .score-details {
      text-align: left;
    }
    
    .score-label {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .score-description {
      font-size: 16px;
      color: #64748b;
      max-width: 300px;
    }
    
    /* Scan Details */
    .scan-details {
      margin: 30px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .detail-label {
      font-weight: 600;
      color: #374151;
    }
    
    .detail-value {
      color: #64748b;
      font-family: monospace;
    }
    
    /* Positive Findings */
    .positive-findings {
      margin: 30px 0;
      padding: 25px;
      background: #f0fdf4;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    
    .positive-findings h3 {
      color: #10b981;
      margin-bottom: 15px;
      font-size: 18px;
    }
    
    .findings-list {
      list-style: none;
    }
    
    .finding-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #dcfce7;
    }
    
    .finding-item:last-child {
      border-bottom: none;
    }
    
    .finding-icon {
      color: #10b981;
      font-weight: 700;
      font-size: 14px;
    }
    
    .finding-text {
      color: #166534;
      font-size: 14px;
    }
    
    /* Quick Wins Section */
    .quick-wins {
      margin: 40px 0;
    }
    
    .quick-wins h3 {
      color: #2E9BDA;
      font-size: 22px;
      margin-bottom: 10px;
    }
    
    .section-description {
      color: #64748b;
      margin-bottom: 25px;
    }
    
    .no-actions {
      text-align: center;
      padding: 40px;
      color: #64748b;
      font-size: 16px;
    }
    
    /* Module Sections */
    .module-section {
      margin-bottom: 35px;
    }
    
    .module-title {
      color: #1a1a1a;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    /* Action Cards */
    .action-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .action-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .action-number {
      background: #2E9BDA;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .action-title {
      flex-grow: 1;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .action-meta {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    
    .action-time {
      background: #f59e0b;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .action-impact {
      background: #10b981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .action-body {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .action-why, .action-how {
      margin-bottom: 10px;
    }
    
    .action-details {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
    }
    
    .action-details ul {
      margin-left: 20px;
      margin-top: 5px;
    }
    
    .action-details li {
      margin-bottom: 5px;
      color: #64748b;
    }
    
    /* Footer */
    .pdf-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-left p, .footer-right p {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .scan-id {
      font-family: monospace;
      font-size: 11px;
    }
    
    .website-link {
      color: #2E9BDA;
      font-weight: 600;
    }
    
    /* Print optimizations */
    @media print {
      .document {
        padding: 15mm;
      }
      
      .module-section {
        page-break-inside: avoid;
      }
      
      .action-card {
        page-break-inside: avoid;
      }
    }
  `;
}