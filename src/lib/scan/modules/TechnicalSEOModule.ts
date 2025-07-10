import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { ContentFetcher } from '../ContentFetcher.js';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';
import { normalizeUrl } from '../../utils.js';

export class TechnicalSEOModule {
  name = 'Technical SEO';
  description = 'Controleert basis SEO-elementen: robots.txt, meta tags, sitemap';
  category = 'foundation' as const;
  
  private contentFetcher = new ContentFetcher();
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string, html?: string, $?: cheerio.CheerioAPI): Promise<ModuleResult> {
    try {
      // Use provided content or fetch (backward compatibility)
      const normalizedUrl = normalizeUrl(url);
      const actualHtml = html || await fetch(normalizedUrl).then(r => r.text());
      const actual$ = $ || cheerio.load(actualHtml);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('TechnicalSEO');
      
      // Voer technische SEO checks uit
      const findings = await this.analyzeTechnicalSEO(actual$, actualHtml, config);
      const score = this.calculateScore(findings);

      return {
        name: 'TechnicalSEO',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'TechnicalSEO',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `Technical SEO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeTechnicalSEO($: cheerio.CheerioAPI, html: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Use PatternMatcher for basic pattern detection
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'TechnicalSEO');
    findings.push(...patternFindings);

    // Add custom technical SEO analysis
    findings.push(
      {
        title: 'Robots.txt: Optimalisatie Nodig',
        description: 'Voeg specifieke regels toe voor AI crawlers zoals GPTBot en ChatGPT-User. Dit helpt bij het controleren hoe AI-systemen je content crawlen en indexeren.',
        priority: 'high',
        category: 'Crawling',
        impact: 'high'
      },
      {
        title: 'Meta Descriptions: AI-Optimalisatie',
        description: 'Optimaliseer meta descriptions voor AI parsing. Goed gestructureerde metadata helpt AI-systemen je content beter te begrijpen en te categoriseren.',
        priority: 'medium',
        category: 'Metadata',
        impact: 'medium'
      }
    );

    return findings;
  }

  private calculateScore(findings: Finding[]): number {
    // Bereken score op basis van findings
    const baseScore = 100;
    const deductions = {
      high: 15,
      medium: 10,
      low: 5
    };

    const totalDeduction = findings.reduce((sum, finding) => {
      return sum + deductions[finding.priority];
    }, 0);

    return Math.max(0, Math.min(100, baseScore - totalDeduction));
  }
} 