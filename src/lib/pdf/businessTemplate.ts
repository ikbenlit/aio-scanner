// src/lib/pdf/businessTemplate.ts
import type { EngineScanResult, NarrativeReport } from '$lib/types/scan';
import type { BusinessAction } from '$lib/results/translation';
import { generateStarterPDFHTML, type StarterPDFData } from './starterTemplate.js';
import { generateChartData, generateChartsHTML, getChartsCSS } from './chartGenerator.js';

export interface BusinessPDFData extends StarterPDFData {
  narrative: NarrativeReport;
  customerLogo?: string; // Base64 encoded logo
}

export function generateBusinessPDFHTML(data: BusinessPDFData): string {
  const { scanResult, businessActions, positiveFindings, generatedAt, narrative, customerLogo } = data;
  
  // Generate chart data
  const chartData = generateChartData(scanResult, businessActions);
  
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
  <title>AI Business Rapport - ${websiteName}</title>
  <style>
    ${getBusinessPDFStyles()}
    ${getChartsCSS()}
  </style>
</head>
<body>
  <div class="document business-tier">
    ${renderBusinessHeader(websiteName, scanResult.url, customerLogo)}
    ${renderHeroScore(scanResult.overallScore, scoreInterpretation)}
    ${renderScanDetails(scanResult, generatedAt)}
    ${renderPositiveFindings(positiveFindings)}
    ${renderAINarrativeSection(narrative)}
    ${renderChartsSection(chartData)}
    ${renderQuickWinsSection(actionsByModule)}
    ${renderBusinessFooter(scanResult.scanId)}
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

function renderBusinessHeader(websiteName: string, url: string, customerLogo?: string): string {
  return `
    <header class="pdf-header business-header">
      <div class="header-content">
        <div class="logo-section">
          ${customerLogo ? `
            <div class="customer-logo">
              <img src="data:image/png;base64,${customerLogo}" alt="Logo" class="customer-logo-img">
            </div>
          ` : ''}
          <div class="logo">
            <div class="logo-icon">🤖</div>
            <div class="logo-text">
              <h1>AIO Scanner</h1>
              <p>AI-Strategisch Groeiplan</p>
            </div>
          </div>
        </div>
        <div class="website-info">
          <h2>${websiteName}</h2>
          <p class="url">${url}</p>
          <div class="tier-badge business-badge">Business Tier</div>
        </div>
      </div>
    </header>
  `;
}

function renderHeroScore(score: number, interpretation: { label: string; color: string; description: string }): string {
  return `
    <section class="hero-score business-hero">
      <div class="score-container">
        <div class="score-circle" style="border-color: ${interpretation.color}">
          <div class="score-number">${score}</div>
          <div class="score-max">/100</div>
        </div>
        <div class="score-details">
          <h3 class="score-label" style="color: ${interpretation.color}">${interpretation.label}</h3>
          <p class="score-description">${interpretation.description}</p>
          <div class="business-note">
            <span class="business-icon">🎯</span>
            <span>Inclusief AI-strategische analyse en implementatie roadmap</span>
          </div>
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
    <section class="scan-details business-details">
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
          <span class="detail-label">Analyse Tier:</span>
          <span class="detail-value business-tier-text">Business</span>
        </div>
      </div>
    </section>
  `;
}

function renderPositiveFindings(positiveFindings: string[]): string {
  if (positiveFindings.length === 0) return '';
  
  return `
    <section class="positive-findings business-positive">
      <h3>✅ Sterke punten van je website</h3>
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

function renderAINarrativeSection(narrative: NarrativeReport): string {
  return `
    <section class="ai-narrative-section">
      <div class="narrative-header">
        <h3>🧠 AI-Strategische Analyse</h3>
        <p class="narrative-subtitle">Gepersonaliseerde inzichten op basis van je website-analyse</p>
      </div>
      
      <div class="narrative-content">
        <div class="narrative-block executive-summary">
          <h4>🎯 Executive Summary</h4>
          <div class="narrative-text">
            ${formatNarrativeText(narrative.executiveSummary)}
          </div>
        </div>
        
        <div class="narrative-block detailed-analysis">
          <h4>🔍 Gedetailleerde Analyse</h4>
          <div class="narrative-text">
            ${formatNarrativeText(narrative.detailedAnalysis)}
          </div>
        </div>
        
        <div class="narrative-block implementation-roadmap">
          <h4>🗺️ Implementatie Roadmap</h4>
          <div class="narrative-text roadmap-text">
            ${formatRoadmapText(narrative.implementationRoadmap)}
          </div>
        </div>
        
        <div class="narrative-block conclusion">
          <h4>🚀 Volgende Stappen</h4>
          <div class="narrative-text">
            ${formatNarrativeText(narrative.conclusionNextSteps)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderChartsSection(chartData: any): string {
  return generateChartsHTML(chartData);
}

function renderQuickWinsSection(actionsByModule: Record<string, BusinessAction[]>): string {
  const modules = Object.keys(actionsByModule);
  
  if (modules.length === 0) {
    return `
      <section class="quick-wins business-quick-wins">
        <h3>🎉 Uitstekende optimalisatie!</h3>
        <p class="no-actions">Je website is al uitstekend geoptimaliseerd voor AI-assistenten. De AI-analyse toont geen directe verbeterpunten.</p>
      </section>
    `;
  }
  
  return `
    <section class="quick-wins business-quick-wins">
      <h3>🚀 Volledige Implementatie Checklist</h3>
      <p class="section-description">Alle aanbevelingen voor maximale AI-optimalisatie, gerangschikt op impact:</p>
      
      ${modules.map(module => `
        <div class="module-section business-module">
          <h4 class="module-title">${getModuleDisplayName(module)}</h4>
          <div class="actions-list">
            ${actionsByModule[module].map((action, index) => `
              <div class="action-card business-action">
                <div class="action-header">
                  <span class="action-number business-number">${index + 1}</span>
                  <h5 class="action-title">${action.title}</h5>
                  <div class="action-meta">
                    <span class="action-time">${action.timeEstimate}</span>
                    <span class="action-impact">${action.impactPoints}</span>
                    <span class="action-difficulty ${action.difficulty}">${action.difficulty}</span>
                  </div>
                </div>
                <div class="action-body">
                  <p class="action-why"><strong>Business Impact:</strong> ${action.why}</p>
                  <p class="action-how"><strong>Implementation:</strong> ${action.how}</p>
                  ${action.expandedDetails ? `
                    <div class="action-details">
                      <p><strong>Uitgebreide stappen:</strong></p>
                      <ul>
                        ${action.expandedDetails.steps?.map(step => `<li>${step}</li>`).join('') || ''}
                      </ul>
                      ${action.expandedDetails.whyItWorks ? `
                        <p class="why-it-works"><strong>Waarom dit werkt:</strong> ${action.expandedDetails.whyItWorks}</p>
                      ` : ''}
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

function renderBusinessFooter(scanId: string): string {
  return `
    <footer class="pdf-footer business-footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>AI-Strategisch Groeiplan gegenereerd door</p>
          <p class="brand-name">AIO Scanner Business</p>
          <p class="scan-id">Scan ID: ${scanId}</p>
        </div>
        <div class="footer-right">
          <p>Voor strategische ondersteuning:</p>
          <p class="website-link">https://aio-scanner.nl/business</p>
          <p class="support-text">Business Support beschikbaar</p>
        </div>
      </div>
    </footer>
  `;
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

function formatNarrativeText(text: string): string {
  return text
    .split('\n\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('');
}

function formatRoadmapText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.some(line => /^\d+\./.test(line.trim()))) {
    return lines.map(line => {
      if (/^\d+\./.test(line.trim())) {
        return `<div class="roadmap-phase"><strong>${line.trim()}</strong></div>`;
      }
      return `<div class="roadmap-detail">${line.trim()}</div>`;
    }).join('');
  }
  
  return formatNarrativeText(text);
}

function getBusinessPDFStyles(): string {
  return `
    /* Base styles from starter template */
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
    
    .business-tier {
      background: linear-gradient(135deg, #fafafa 0%, #f8fafc 100%);
    }
    
    /* Enhanced Business Header */
    .business-header {
      margin-bottom: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #2E9BDA 0%, #1d4ed8 100%);
      color: white;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }
    
    .business-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 3s ease-in-out infinite;
    }
    
    .customer-logo {
      margin-bottom: 15px;
    }
    
    .customer-logo-img {
      max-height: 40px;
      max-width: 150px;
      object-fit: contain;
    }
    
    .business-header .logo-text h1 {
      color: white;
      font-size: 26px;
    }
    
    .business-header .logo-text p {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
    }
    
    .business-header .website-info h2 {
      color: white;
      font-size: 22px;
    }
    
    .business-header .url {
      color: rgba(255,255,255,0.8);
    }
    
    .tier-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .business-badge {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }
    
    /* Enhanced Hero Score */
    .business-hero {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      box-shadow: 0 8px 25px rgba(46, 155, 218, 0.15);
    }
    
    .business-note {
      margin-top: 15px;
      padding: 10px;
      background: rgba(46, 155, 218, 0.1);
      border-radius: 6px;
      font-size: 14px;
      color: #0369a1;
    }
    
    .business-icon {
      margin-right: 8px;
    }
    
    /* Enhanced Scan Details */
    .business-details {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #cbd5e1;
    }
    
    .business-tier-text {
      color: #2E9BDA;
      font-weight: 600;
    }
    
    /* Enhanced Positive Findings */
    .business-positive {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #16a34a;
    }
    
    /* AI Narrative Section */
    .ai-narrative-section {
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-radius: 12px;
      border: 1px solid #c4b5fd;
    }
    
    .narrative-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .narrative-header h3 {
      color: #7c3aed;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .narrative-subtitle {
      color: #6b46c1;
      font-size: 16px;
      font-style: italic;
    }
    
    .narrative-content {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }
    
    .narrative-block {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
      border-left: 4px solid #7c3aed;
    }
    
    .narrative-block h4 {
      color: #7c3aed;
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .narrative-text {
      line-height: 1.7;
      color: #374151;
    }
    
    .narrative-text p {
      margin-bottom: 15px;
    }
    
    .roadmap-text .roadmap-phase {
      background: #f3e8ff;
      padding: 10px 15px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 3px solid #7c3aed;
    }
    
    .roadmap-text .roadmap-detail {
      margin-left: 20px;
      color: #6b46c1;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    /* Enhanced Quick Wins */
    .business-quick-wins h3 {
      color: #2E9BDA;
      font-size: 24px;
    }
    
    .business-module {
      border: 1px solid #e0f2fe;
      border-radius: 8px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    }
    
    .business-action {
      border: 1px solid #e0f2fe;
      box-shadow: 0 2px 8px rgba(46, 155, 218, 0.1);
    }
    
    .business-number {
      background: linear-gradient(135deg, #2E9BDA 0%, #1d4ed8 100%);
    }
    
    .action-difficulty {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .action-difficulty.makkelijk {
      background: #dcfce7;
      color: #166534;
    }
    
    .action-difficulty.gemiddeld {
      background: #fef3c7;
      color: #92400e;
    }
    
    .action-difficulty.uitdagend {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .why-it-works {
      margin-top: 10px;
      padding: 10px;
      background: #f0f9ff;
      border-radius: 6px;
      color: #0369a1;
      font-size: 14px;
    }
    
    /* Enhanced Footer */
    .business-footer {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      border-radius: 8px;
      padding: 25px;
    }
    
    .business-footer .brand-name {
      font-size: 16px;
      font-weight: 600;
      color: #60a5fa;
    }
    
    .business-footer .support-text {
      color: #94a3b8;
      font-size: 12px;
    }
    
    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.3; }
    }
    
    /* Print optimizations */
    @media print {
      .document {
        padding: 15mm;
      }
      
      .ai-narrative-section {
        page-break-inside: avoid;
      }
      
      .narrative-block {
        page-break-inside: avoid;
      }
      
      .business-module {
        page-break-inside: avoid;
      }
      
      .business-action {
        page-break-inside: avoid;
      }
      
      .charts-section {
        page-break-inside: avoid;
      }
    }
  `;
}