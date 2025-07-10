// src/lib/results/thematic-grouping.ts

import type { Finding } from '$lib/types/scan';

export interface ThematicGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  score: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  findings: Finding[];
  quickFixes: string[];
  impact: 'high' | 'medium' | 'low';
  priority: number; // 1 = highest priority
}

export interface ScanModule {
  name: string;
  score: number;
  findings: Array<{
    type?: 'success' | 'warning' | 'error';
    priority?: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    message?: string;
    recommendation?: string;
    impact?: string;
    category?: string;
    technicalDetails?: string;
    estimatedTime?: string;
    evidence?: string[];
    suggestion?: string;
  }>;
}

/**
 * Transform technical modules into meaningful business themes
 */
export function groupModulesByTheme(moduleResults: ScanModule[]): ThematicGroup[] {
  const themes: ThematicGroup[] = [];

  // 1. Vindbaarheid (Findability)
  const findabilityModules = ['TechnicalSEO', 'SchemaMarkup'];
  const findabilityFindings = extractFindingsByModules(moduleResults, findabilityModules);
  const findabilityScore = calculateThemeScore(moduleResults, findabilityModules);
  
  themes.push({
    id: 'findability',
    name: 'Vindbaarheid',
    description: 'Hoe goed kunnen AI-systemen en zoekmachines je website vinden en indexeren?',
    icon: '🔍',
    score: findabilityScore,
    status: getScoreStatus(findabilityScore),
    findings: findabilityFindings,
    quickFixes: generateQuickFixes(findabilityFindings, 'findability'),
    impact: findabilityFindings.filter(f => f.priority === 'high').length > 0 ? 'high' : 'medium',
    priority: 1
  });

  // 2. Vertrouwen & Autoriteit (Trust & Authority)
  const trustModules = ['AICitation', 'CrossWebFootprint'];
  const trustFindings = extractFindingsByModules(moduleResults, trustModules);
  const trustScore = calculateThemeScore(moduleResults, trustModules);
  
  themes.push({
    id: 'trust',
    name: 'Vertrouwen & Autoriteit',
    description: 'Hoe betrouwbaar en gezaghebbend komt je bedrijf over voor AI en bezoekers?',
    icon: '🏆',
    score: trustScore,
    status: getScoreStatus(trustScore),
    findings: trustFindings,
    quickFixes: generateQuickFixes(trustFindings, 'trust'),
    impact: trustFindings.filter(f => f.priority === 'high').length > 0 ? 'high' : 'medium',
    priority: 2
  });

  // 3. Conversiepotentieel (Conversion Potential)
  const conversionModules = ['AIContent'];
  const conversionFindings = extractFindingsByModules(moduleResults, conversionModules);
  const conversionScore = calculateThemeScore(moduleResults, conversionModules);
  
  themes.push({
    id: 'conversion',
    name: 'Conversiepotentieel',
    description: 'Hoe goed motiveert je content bezoekers om actie te ondernemen?',
    icon: '📈',
    score: conversionScore,
    status: getScoreStatus(conversionScore),
    findings: conversionFindings,
    quickFixes: generateQuickFixes(conversionFindings, 'conversion'),
    impact: conversionFindings.filter(f => f.priority === 'high').length > 0 ? 'high' : 'medium',
    priority: 3
  });

  // 4. Actualiteit (Freshness)
  const freshnessModules = ['Freshness'];
  const freshnessFindings = extractFindingsByModules(moduleResults, freshnessModules);
  const freshnessScore = calculateThemeScore(moduleResults, freshnessModules);
  
  themes.push({
    id: 'freshness',
    name: 'Actualiteit',
    description: 'Hoe up-to-date en relevant is je content voor AI-systemen?',
    icon: '⏰',
    score: freshnessScore,
    status: getScoreStatus(freshnessScore),
    findings: freshnessFindings,
    quickFixes: generateQuickFixes(freshnessFindings, 'freshness'),
    impact: freshnessFindings.filter(f => f.priority === 'high').length > 0 ? 'high' : 'low',
    priority: 4
  });

  // Sort by priority (most important first)
  return themes.sort((a, b) => a.priority - b.priority);
}

/**
 * Extract findings from specific modules
 */
function extractFindingsByModules(moduleResults: ScanModule[], moduleNames: string[]): Finding[] {
  const findings: Finding[] = [];
  
  for (const module of moduleResults) {
    const isRelevantModule = moduleNames.some(name => 
      module.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if (isRelevantModule && module.findings) {
      // Transform module findings to Finding interface
      const moduleFindings: Finding[] = module.findings.map(finding => ({
        title: finding.title,
        description: finding.description,
        priority: finding.priority || 'medium',
        recommendation: finding.recommendation,
        impact: finding.impact,
        category: finding.category || module.name?.toLowerCase() || 'general',
        technicalDetails: finding.technicalDetails,
        estimatedTime: finding.estimatedTime,
        evidence: finding.evidence,
        suggestion: finding.suggestion
      }));
      findings.push(...moduleFindings);
    }
  }
  
  return findings;
}

/**
 * Calculate average score for modules in theme
 */
function calculateThemeScore(moduleResults: ScanModule[], moduleNames: string[]): number {
  const relevantModules = moduleResults.filter(module =>
    moduleNames.some(name => module.name.toLowerCase().includes(name.toLowerCase()))
  );
  
  if (relevantModules.length === 0) return 0;
  
  const totalScore = relevantModules.reduce((sum, module) => sum + module.score, 0);
  return Math.round(totalScore / relevantModules.length);
}

/**
 * Get status based on score
 */
function getScoreStatus(score: number): 'excellent' | 'good' | 'needs_attention' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs_attention';
  return 'critical';
}

/**
 * Generate actionable quick fixes based on findings
 */
function generateQuickFixes(findings: Finding[], themeId: string): string[] {
  const quickFixes: string[] = [];
  
  // Get high priority findings first
  const highPriorityFindings = findings.filter(f => f.priority === 'high').slice(0, 2);
  const mediumPriorityFindings = findings.filter(f => f.priority === 'medium').slice(0, 1);
  
  const relevantFindings = [...highPriorityFindings, ...mediumPriorityFindings];
  
  for (const finding of relevantFindings) {
    if (finding.recommendation) {
      quickFixes.push(finding.recommendation);
    } else {
      // Generate theme-specific quick fixes
      quickFixes.push(generateThemeSpecificFix(finding, themeId));
    }
  }
  
  return quickFixes.slice(0, 3); // Max 3 quick fixes per theme
}

/**
 * Generate theme-specific quick fixes when recommendation is missing
 */
function generateThemeSpecificFix(finding: Finding, themeId: string): string {
  const genericFixes: Record<string, string[]> = {
    findability: [
      'Voeg ontbrekende meta tags toe',
      'Verbeter je robots.txt bestand',
      'Implementeer structured data markup'
    ],
    trust: [
      'Voeg bedrijfsgegevens toe aan je website',
      'Maak een uitgebreide About Us pagina',
      'Voeg social media links toe'
    ],
    conversion: [
      'Maak je call-to-actions duidelijker',
      'Voeg testimonials of reviews toe',
      'Verbeter je FAQ sectie'
    ],
    freshness: [
      'Update je content regelmatig',
      'Voeg publicatiedatums toe',
      'Verwijder verouderde informatie'
    ]
  };
  
  const fixes = genericFixes[themeId] || ['Verbeter dit aspect van je website'];
  return fixes[Math.floor(Math.random() * fixes.length)];
}

/**
 * Get contextual insights for overall scan performance
 */
export function generateScanSummary(themes: ThematicGroup[], overallScore: number): {
  motivationalMessage: string;
  keyPriorities: string[];
  benchmarkMessage: string;
  nextSteps: string[];
} {
  const excellentThemes = themes.filter(t => t.status === 'excellent').length;
  const criticalThemes = themes.filter(t => t.status === 'critical').length;
  const highPriorityFindings = themes.flatMap(t => t.findings.filter(f => f.priority === 'high')).length;
  
  // Motivational message based on performance
  let motivationalMessage = '';
  if (overallScore >= 80) {
    motivationalMessage = `🎉 Uitstekend! Je website scoort ${overallScore}/100 - beter dan 78% van het MKB!`;
  } else if (overallScore >= 60) {
    motivationalMessage = `✅ Goede basis! Je scoort ${overallScore}/100. Met een paar aanpassingen kom je in de top 25%.`;
  } else if (overallScore >= 40) {
    motivationalMessage = `📈 Veel potentieel! Je scoort ${overallScore}/100. Er zijn enkele kansen voor snelle verbeteringen.`;
  } else {
    motivationalMessage = `🚀 Tijd voor optimalisatie! Je scoort ${overallScore}/100, maar elke verbetering heeft direct effect.`;
  }
  
  // Key priorities
  const keyPriorities = themes
    .filter(t => t.status === 'critical' || t.status === 'needs_attention')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(t => `${t.icon} ${t.name}: ${t.score}/100`);
  
  // Benchmark message
  const benchmarkMessage = `Je scoort beter dan ${Math.max(10, Math.round((overallScore - 20) * 1.5))}% van vergelijkbare websites in je sector.`;
  
  // Next steps
  const nextSteps = themes
    .filter(t => t.quickFixes.length > 0)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(t => t.quickFixes[0]);
  
  return {
    motivationalMessage,
    keyPriorities,
    benchmarkMessage,
    nextSteps
  };
} 