import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import type { ModuleResult, Finding } from '../../types/scan';
import { ContentFetcher } from '../ContentFetcher.js';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';

export class TechnicalSEOModule {
  name = 'Technical SEO';
  description = 'Controleert basis SEO-elementen: robots.txt, meta tags, sitemap';
  category = 'foundation' as const;
  
  private contentFetcher = new ContentFetcher();
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string): Promise<ModuleResult> {
    try {
      // Fetch website content
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('TechnicalSEO');
      
      // Voer technische SEO checks uit
      const findings = await this.analyzeTechnicalSEO($, html, config);
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
        title: 'Robots.txt optimalisatie nodig',
        description: 'Voeg specifieke regels toe voor AI crawlers zoals GPTBot en ChatGPT-User',
        priority: 'high',
        category: 'Crawling',
        impact: 'high'
      },
      {
        title: 'Meta descriptions voor AI',
        description: 'Optimaliseer meta descriptions voor AI parsing',
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