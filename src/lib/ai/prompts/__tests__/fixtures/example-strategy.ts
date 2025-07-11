/**
 * Example strategy implementation demonstrating PromptHelpers usage
 * This shows how concrete strategies can leverage the DRY utilities
 */

import { BasePromptStrategy, type PromptInput } from '../../PromptStrategy.js';

export class ExampleInsightsStrategy extends BasePromptStrategy {
  buildPrompt(data: PromptInput): string {
    // Using PromptHelpers for DRY implementation
    return this.helpers.createConsultantPrompt({
      persona: 'SEO_CONSULTANT',
      dataSection: [
        { 
          title: this.helpers.SECTION_HEADERS.SCAN_RESULTS, 
          data: data.moduleResults || [] 
        },
        { 
          title: this.helpers.SECTION_HEADERS.ENHANCED_CONTENT, 
          data: this.formatEnhancedContentSection(data.enhancedContent || {}) 
        }
      ],
      task: {
        description: 'Analyseer deze website voor AI-citation opportunities en geef structured insights.',
        focusPoints: [
          '**Missed Opportunities** - Concrete kansen voor betere AI visibility',
          '**Authority Enhancements** - Hoe bestaande signalen sterker kunnen',
          '**Citability Improvements** - Content optimalisaties voor AI assistants'
        ]
      },
      responseSchema: 'AI_INSIGHTS',
      instructions: 'JSON_ONLY'
    });
  }
}

export class ExampleNarrativeStrategy extends BasePromptStrategy {
  buildPrompt(data: PromptInput): string {
    return this.helpers.createConsultantPrompt({
      persona: 'PERSONAL_CONSULTANT',
      dataSection: [
        { title: 'CONTEXT', data: {
          scanResults: data.moduleResults || [],
          insights: data.insights || {},
          authorityContent: data.enhancedContent?.authorityMarkers?.slice(0, 3) || []
        }},
        { title: 'SMART ANALYSIS DATA', data: 'De scan bevat verrijkte findings met evidence en suggestions.' }
      ],
      task: {
        description: 'Schrijf een persoonlijk, professioneel rapport in vloeiende Nederlandse tekst.'
      },
      tone: 'PROFESSIONAL_PERSONAL',
      structure: [
        {
          title: 'Executive Summary',
          description: 'Persoonlijke opening over hun website\nHoofdbevindingen in context van hun business\nTop 3 belangrijkste kansen',
          wordCount: '150-200 woorden'
        },
        {
          title: 'Detailed Analysis',
          description: 'Dieper ingaan op specifieke bevindingen MET evidence quotes\nUitleggen waarom dit belangrijk is voor hun business',
          wordCount: '300-400 woorden'
        },
        {
          title: 'Implementation Roadmap',
          description: 'Prioriteer acties op impact vs effort\nRealistische tijdschattingen\nQuick wins eerst',
          wordCount: '200-250 woorden'
        },
        {
          title: 'Conclusion & Next Steps',
          description: 'Samenvatten belangrijkste acties\nMotiveren om te beginnen\nDuidelijke volgende stappen',
          wordCount: '100-150 woorden'
        }
      ],
      responseSchema: 'NARRATIVE_REPORT',
      instructions: 'DUTCH_PROFESSIONAL'
    });
  }
}

export class ExampleEnterpriseStrategy extends BasePromptStrategy {
  buildPrompt(data: PromptInput): string {
    const enterpriseFeatures = data.enterpriseFeatures || {};
    
    return this.helpers.buildStructuredPrompt({
      persona: this.helpers.PERSONAS.ENTERPRISE_CONSULTANT,
      sections: [
        {
          title: this.helpers.SECTION_HEADERS.BUSINESS_ANALYSIS,
          content: this.formatJSON(data.insights || {}),
          priority: 'high'
        },
        {
          title: this.helpers.SECTION_HEADERS.MULTI_PAGE_INSIGHTS,
          content: `Geanalyseerde paginas: ${enterpriseFeatures.multiPageAnalysis?.length || 0}
Site-wide consistentie: ${enterpriseFeatures.siteWidePatterns?.consistencyScore || 0}/100
${this.formatJSON(enterpriseFeatures.siteWidePatterns || {})}`,
          priority: 'high'
        },
        {
          title: this.helpers.SECTION_HEADERS.COMPETITIVE_CONTEXT,
          content: this.formatJSON(enterpriseFeatures.competitiveContext || {}),
          priority: 'medium'
        },
        {
          title: this.helpers.SECTION_HEADERS.TASK,
          content: this.helpers.formatTaskSection(
            'Schrijf een uitgebreid strategisch rapport (800-1200 woorden) met deze secties:',
            []
          ).replace('TAAK:\n', ''),
          priority: 'high'
        },
        {
          title: 'STRUCTUUR',
          content: this.helpers.formatStructureSection([
            {
              title: 'EXECUTIVE SUMMARY',
              description: 'Strategic overview van AI-readiness across multiple pages\nKey competitive advantages en gaps vs industry benchmark',
              wordCount: '200-250 woorden'
            },
            {
              title: 'MULTI-PAGE STRATEGIC ANALYSIS',
              description: 'Consistency analysis tussen homepage en subpaginas\nSite-wide content strategy recommendations',
              wordCount: '300-400 woorden'
            },
            {
              title: 'COMPETITIVE POSITIONING',
              description: 'Industry benchmark comparison\nCompetitive advantages to leverage immediately',
              wordCount: '200-250 woorden'
            },
            {
              title: 'STRATEGIC IMPLEMENTATION ROADMAP',
              description: '3-6 month phased implementation plan\nResource allocation recommendations\nROI timeline',
              wordCount: '200-300 woorden'
            }
          ]).replace('STRUCTUUR:\n', ''),
          priority: 'medium'
        }
      ],
      responseFormat: {
        format: 'json',
        schema: this.helpers.JSON_SCHEMAS.ENTERPRISE_REPORT,
        instructions: [...this.helpers.COMMON_INSTRUCTIONS.ENTERPRISE_STRATEGIC]
      }
    });
  }
}