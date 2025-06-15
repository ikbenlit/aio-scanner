import type { EmailScanResult, EngineScanResult, Finding } from '$lib/types/scan';

export interface EmailTemplateResult {
  scanId: string;
  url: string;
  overallScore: number;
  createdAt: string;
  status: 'completed' | 'pending' | 'running' | 'failed';
  moduleResults: {
    name: string;
    score: number;
    findings: Finding[];
  }[];
}

// Helper functie om scan engine result te converteren naar email template format
export function convertToEmailFormat(scanResult: EngineScanResult): EmailTemplateResult {
  return {
    scanId: scanResult.scanId,
    url: scanResult.url,
    overallScore: scanResult.overallScore,
    createdAt: scanResult.createdAt,
    status: scanResult.status,
    moduleResults: scanResult.moduleResults.map(module => ({
      name: module.name,
      score: module.score,
      findings: module.findings
    }))
  };
}

export function generateScanEmailTemplate(scanResults: EmailTemplateResult): string {
  const { url, overallScore, moduleResults } = scanResults;
  const domain = new URL(url).hostname;
  
  // Determine status and color based on score
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Uitstekend', color: '#10b981', emoji: '🚀' };
    if (score >= 60) return { label: 'Goed', color: '#2E9BDA', emoji: '👍' };
    if (score >= 40) return { label: 'Verbetering Nodig', color: '#F5B041', emoji: '⚠️' };
    return { label: 'Kritiek', color: '#E74C3C', emoji: '🚨' };
  };

  const scoreStatus = getScoreStatus(overallScore);
  
  // Get top 3 priority findings
  const getPriorityFindings = (modules: { name: string; score: number; findings: Finding[] }[]) => {
    const allFindings = modules.flatMap(module => 
      module.findings
        .filter(finding => finding.impact === 'high' || finding.impact === 'medium')
        .map(finding => ({
          ...finding,
          module: module.name,
          score: module.score
        }))
    );
    
    const impactOrder: Record<string, number> = { 
      'high': 0, 
      'medium': 1, 
      'low': 2 
    };
    
    return allFindings
      .filter(finding => finding.impact && impactOrder.hasOwnProperty(finding.impact))
      .sort((a, b) => impactOrder[a.impact!] - impactOrder[b.impact!])
      .slice(0, 3);
  };

  const topFindings = getPriorityFindings(moduleResults);

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Je AIO-Scanner Resultaten</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f8fafc;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2E9BDA, #4FACFE);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    
    .logo {
      font-family: 'Orbitron', system-ui, sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .header-subtitle {
      opacity: 0.9;
      font-size: 1rem;
    }
    
    .score-section {
      background: linear-gradient(135deg, rgba(46, 155, 218, 0.05), rgba(0, 245, 255, 0.05));
      padding: 2rem;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .website-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border: 1px solid rgba(46, 155, 218, 0.1);
    }
    
    .website-icon {
      font-size: 1.5rem;
    }
    
    .website-url {
      font-family: 'Orbitron', system-ui, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #2E9BDA;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(${scoreStatus.color} 0deg ${overallScore * 3.6}deg, #e2e8f0 ${overallScore * 3.6}deg 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      position: relative;
    }
    
    .score-circle::before {
      content: '';
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: white;
    }
    
    .score-value {
      position: relative;
      z-index: 1;
      font-family: 'Orbitron', system-ui, sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .score-status {
      font-size: 1.25rem;
      font-weight: 600;
      color: ${scoreStatus.color};
      margin-bottom: 0.5rem;
    }
    
    .score-description {
      color: #64748b;
      font-size: 1rem;
    }
    
    .findings-section {
      padding: 2rem;
    }
    
    .section-title {
      font-family: 'Orbitron', system-ui, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .finding-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 12px;
      border-left: 4px solid;
    }
    
    .finding-high {
      background: rgba(231, 76, 60, 0.05);
      border-left-color: #E74C3C;
    }
    
    .finding-medium {
      background: rgba(245, 176, 65, 0.05);
      border-left-color: #F5B041;
    }
    
    .finding-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }
    
    .finding-content h4 {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.25rem;
    }
    
    .finding-content p {
      color: #64748b;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #2E9BDA, #4FACFE);
      padding: 2rem;
      text-align: center;
      color: white;
    }
    
    .cta-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .cta-text {
      opacity: 0.9;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .cta-button {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      border: 2px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    
    .footer {
      background: #f8fafc;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
      border-top: 1px solid #e2e8f0;
    }
    
    .social-links {
      margin-top: 1rem;
      text-align: center;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 0.5rem;
      color: #2E9BDA;
      text-decoration: none;
    }
    
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .module-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .module-score {
      font-family: 'Orbitron', system-ui, sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    
    .module-name {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
    
    .score-80 { color: #10b981; }
    .score-60 { color: #2E9BDA; }
    .score-40 { color: #F5B041; }
    .score-low { color: #E74C3C; }
    
    @media (max-width: 480px) {
      .container { margin: 1rem; }
      .modules-grid { grid-template-columns: 1fr; }
      .website-info { flex-direction: column; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">AIO-Scanner</div>
      <div class="header-subtitle">Je AI-Gereedheid Scan is Voltooid!</div>
    </div>

    <!-- Score Section -->
    <div class="score-section">
      <div class="website-info">
        <div class="website-icon">🌐</div>
        <div class="website-url">${domain}</div>
      </div>
      
      <div class="score-circle">
        <div class="score-value">${overallScore}</div>
      </div>
      
      <div class="score-status">${scoreStatus.emoji} ${scoreStatus.label}</div>
      <div class="score-description">
        ${overallScore >= 80 ? 'Uitstekend! Je website is goed geoptimaliseerd voor AI-zoekmachines.' :
          overallScore >= 60 ? 'Goede basis, maar er zijn mogelijkheden voor verbetering.' :
          overallScore >= 40 ? 'Er zijn verschillende optimalisaties nodig om je AI-zichtbaarheid te verbeteren.' :
          'Je website heeft dringend optimalisatie nodig voor AI-zoekmachines.'}
      </div>
      
      <!-- Module Scores Grid -->
      <div class="modules-grid">
        ${moduleResults.map(module => {
          const scoreClass = module.score >= 80 ? 'score-80' : 
                           module.score >= 60 ? 'score-60' : 
                           module.score >= 40 ? 'score-40' : 'score-low';
          return `
            <div class="module-item">
              <div class="module-score ${scoreClass}">${module.score}</div>
              <div class="module-name">${module.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Priority Findings -->
    ${topFindings.length > 0 ? `
    <div class="findings-section">
      <h2 class="section-title">⚡ Top ${topFindings.length} Prioritaire Verbeterpunten</h2>
      
      ${topFindings.map((finding, index) => `
        <div class="finding-item finding-${finding.impact}">
          <div class="finding-icon">${finding.impact === 'high' ? '🚨' : '⚠️'}</div>
          <div class="finding-content">
            <h4>#${index + 1} ${finding.title}</h4>
            <p>${finding.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- CTA Section -->
    <div class="cta-section">
      <h2 class="cta-title">🚀 Klaar voor de Volgende Stap?</h2>
      <p class="cta-text">
        Krijg toegang tot gedetailleerde implementatiegidsen, code voorbeelden en AI-aangedreven aanbevelingen voor alle ${moduleResults.length} modules.
      </p>
      <a href="https://aio-scanner.nl/scan/${scanResults.scanId}/results" class="cta-button">
        Bekijk Volledige Resultaten
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>AIO-Scanner</strong> - De eerste AI-gereedheid scanner voor websites<br>
        Optimaliseer je content voor de toekomst van zoeken.
      </p>
      
      <div class="social-links">
        <a href="https://aio-scanner.nl">Website</a> •
        <a href="mailto:support@aio-scanner.nl">Support</a> •
        <a href="https://aio-scanner.nl/privacy">Privacy</a>
      </div>
      
      <p style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.7;">
        Deze scan werd uitgevoerd op ${new Date(scanResults.createdAt).toLocaleDateString('nl-NL', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Helper function voor fallback plain text email
export function generateScanEmailText(scanResults: EmailTemplateResult): string {
  const { url, overallScore, moduleResults } = scanResults;
  const domain = new URL(url).hostname;
  
  const scoreStatus = overallScore >= 80 ? 'Uitstekend 🚀' : 
                     overallScore >= 60 ? 'Goed 👍' : 
                     overallScore >= 40 ? 'Verbetering Nodig ⚠️' : 'Kritiek 🚨';

  return `
AIO-Scanner Resultaten voor ${domain}

===========================================
OVERALL SCORE: ${overallScore}/100 (${scoreStatus})
===========================================

Je website scoort ${overallScore} van de 100 punten voor AI-gereedheid.

MODULE SCORES:
${moduleResults.map(module => `• ${module.name}: ${module.score}/100`).join('\n')}

VOLLEDIGE RESULTATEN:
Bekijk je complete rapport online:
https://aio-scanner.nl/scan/${scanResults.scanId}/results

VRAGEN?
Email ons op support@aio-scanner.nl

---
AIO-Scanner - De eerste AI-gereedheid scanner voor websites
Gescand op ${new Date(scanResults.createdAt).toLocaleDateString('nl-NL')}
  `;
} 