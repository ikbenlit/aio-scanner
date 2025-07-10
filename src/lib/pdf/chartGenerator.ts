// src/lib/pdf/chartGenerator.ts
import type { EngineScanResult, ModuleResult } from '$lib/types/scan';
import type { BusinessAction } from '$lib/results/translation';

export interface ChartData {
  moduleScores: { name: string; score: number }[];
  actionDistribution: { difficulty: string; count: number; color: string }[];
}

export function generateChartData(scanResult: EngineScanResult, businessActions: BusinessAction[]): ChartData {
  // Generate module scores chart data
  const moduleScores = scanResult.moduleResults.map(module => ({
    name: getModuleDisplayName(module.name),
    score: module.score
  }));
  
  // Generate action distribution chart data
  const actionDistribution = getActionDistribution(businessActions);
  
  return {
    moduleScores,
    actionDistribution
  };
}

function getModuleDisplayName(moduleName: string): string {
  const displayNames: Record<string, string> = {
    'Technical SEO': 'Technical SEO',
    'Schema Markup': 'Schema Markup', 
    'AI Content': 'AI Content',
    'AI Citation': 'AI Citation',
    'Cross-web Footprint': 'Cross-web Footprint',
    'Content Freshness': 'Content Versheid',
    'technical_seo': 'Technical SEO',
    'schema_markup': 'Schema Markup',
    'ai_content': 'AI Content',
    'ai_citation': 'AI Citation',
    'cross_web_footprint': 'Cross-web Footprint',
    'versheid': 'Content Versheid'
  };
  
  return displayNames[moduleName] || moduleName;
}

function getActionDistribution(businessActions: BusinessAction[]): { difficulty: string; count: number; color: string }[] {
  const difficulties = ['makkelijk', 'gemiddeld', 'uitdagend'];
  const colors = ['#10b981', '#f59e0b', '#ef4444'];
  
  const distribution = difficulties.map((difficulty, index) => {
    const count = businessActions.filter(action => action.difficulty === difficulty).length;
    return {
      difficulty,
      count,
      color: colors[index]
    };
  });
  
  return distribution.filter(item => item.count > 0);
}

export function generateModuleScoresChart(moduleScores: { name: string; score: number }[]): string {
  const maxScore = Math.max(...moduleScores.map(m => m.score));
  const chartHeight = 300;
  const chartWidth = 500;
  const barWidth = Math.floor(chartWidth / moduleScores.length * 0.8);
  const barSpacing = Math.floor(chartWidth / moduleScores.length * 0.2);
  
  return `
    <svg width="${chartWidth}" height="${chartHeight + 100}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#2E9BDA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Chart Title -->
      <text x="${chartWidth / 2}" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a1a">
        Score per Module
      </text>
      
      <!-- Chart Area -->
      <rect x="0" y="40" width="${chartWidth}" height="${chartHeight}" fill="none" stroke="#e2e8f0" stroke-width="1" rx="4"/>
      
      <!-- Y-axis labels -->
      ${[0, 25, 50, 75, 100].map(score => `
        <text x="-5" y="${chartHeight + 40 - (score / 100) * chartHeight + 5}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#64748b">
          ${score}
        </text>
        <line x1="0" y1="${chartHeight + 40 - (score / 100) * chartHeight}" x2="${chartWidth}" y2="${chartHeight + 40 - (score / 100) * chartHeight}" stroke="#f1f5f9" stroke-width="1"/>
      `).join('')}
      
      <!-- Bars -->
      ${moduleScores.map((module, index) => {
        const x = index * (barWidth + barSpacing) + barSpacing / 2 + 20;
        const barHeight = (module.score / 100) * chartHeight;
        const y = chartHeight + 40 - barHeight;
        
        return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="url(#barGradient)" rx="2"/>
          <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2E9BDA">
            ${module.score}
          </text>
        `;
      }).join('')}
      
      <!-- X-axis labels -->
      ${moduleScores.map((module, index) => {
        const x = index * (barWidth + barSpacing) + barSpacing / 2 + 20 + barWidth / 2;
        const words = module.name.split(' ');
        
        return words.map((word, wordIndex) => `
          <text x="${x}" y="${chartHeight + 60 + wordIndex * 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#64748b">
            ${word}
          </text>
        `).join('');
      }).join('')}
    </svg>
  `;
}

export function generateActionDistributionChart(actionDistribution: { difficulty: string; count: number; color: string }[]): string {
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const total = actionDistribution.reduce((sum, item) => sum + item.count, 0);
  
  if (total === 0) {
    return `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#64748b">
          Geen acties beschikbaar
        </text>
      </svg>
    `;
  }
  
  let currentAngle = 0;
  const slices = actionDistribution.map(item => {
    const angle = (item.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      percentage: Math.round((item.count / total) * 100)
    };
  });
  
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <!-- Chart Title -->
      <text x="200" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a1a1a">
        Verdeling Acties per Moeilijkheidsgraad
      </text>
      
      <!-- Pie Chart -->
      <g transform="translate(50, 50)">
        ${slices.map(slice => {
          const x1 = centerX + radius * Math.cos(slice.startAngle);
          const y1 = centerY + radius * Math.sin(slice.startAngle);
          const x2 = centerX + radius * Math.cos(slice.endAngle);
          const y2 = centerY + radius * Math.sin(slice.endAngle);
          
          const largeArc = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          // Label position
          const labelAngle = (slice.startAngle + slice.endAngle) / 2;
          const labelX = centerX + (radius + 30) * Math.cos(labelAngle);
          const labelY = centerY + (radius + 30) * Math.sin(labelAngle);
          
          return `
            <path d="${pathData}" fill="${slice.color}" stroke="white" stroke-width="2"/>
            <text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1a1a1a">
              ${slice.difficulty}
            </text>
            <text x="${labelX}" y="${labelY + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#64748b">
              ${slice.count} (${slice.percentage}%)
            </text>
          `;
        }).join('')}
      </g>
      
      <!-- Legend -->
      <g transform="translate(320, 80)">
        <rect x="0" y="0" width="70" height="${slices.length * 25 + 10}" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
        <text x="35" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1a1a1a">
          Legenda
        </text>
        ${slices.map((slice, index) => `
          <rect x="5" y="${25 + index * 25}" width="12" height="12" fill="${slice.color}"/>
          <text x="22" y="${25 + index * 25 + 9}" font-family="Arial, sans-serif" font-size="10" fill="#1a1a1a">
            ${slice.difficulty}
          </text>
        `).join('')}
      </g>
    </svg>
  `;
}

export function generateChartsHTML(chartData: ChartData): string {
  const moduleScoresChart = generateModuleScoresChart(chartData.moduleScores);
  const actionDistributionChart = generateActionDistributionChart(chartData.actionDistribution);
  
  return `
    <div class="charts-section">
      <h3>📊 Analyse Dashboard</h3>
      <p class="charts-description">Visuele weergave van je scan resultaten en aanbevelingen</p>
      
      <div class="chart-container">
        <div class="chart-wrapper">
          ${moduleScoresChart}
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-wrapper">
          ${actionDistributionChart}
        </div>
      </div>
    </div>
  `;
}

export function getChartsCSS(): string {
  return `
    .charts-section {
      margin: 40px 0;
      padding: 30px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    
    .charts-section h3 {
      color: #2E9BDA;
      font-size: 22px;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .charts-description {
      text-align: center;
      color: #64748b;
      margin-bottom: 30px;
    }
    
    .chart-container {
      margin: 30px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .chart-wrapper {
      display: flex;
      justify-content: center;
      overflow-x: auto;
    }
    
    .chart-wrapper svg {
      max-width: 100%;
      height: auto;
    }
  `;
}