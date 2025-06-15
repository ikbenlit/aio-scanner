import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';

interface FreshnessDebugMeta {
  foundDates: {
    published?: Date;
    modified?: Date;
    sitemap?: Date;
  };
  consistency: {
    htmlVsJsonLd: boolean;
    htmlVsSitemap: boolean;
    allMatch: boolean;
  };
  updateMetrics: {
    daysSincePublished: number;
    daysSinceModified: number;
    updateFrequency: number;
  };
}

export class FreshnessModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string): Promise<ModuleResult> {
    try {
      // Fetch website content
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('Freshness');
      
      const findings = await this.analyzeFreshness($, html, url, config);
      const score = this.calculateScore(findings);

      return {
        name: 'Freshness',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'Freshness',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `Freshness analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeFreshness($: cheerio.CheerioAPI, html: string, url: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // 1. Extract dates from various sources
    const dateInfo = this.extractDates($, html);

    // 2. Check date consistency
    this.checkDateConsistency(dateInfo, findings);

    // 3. Analyze content freshness
    this.analyzeContentFreshness(dateInfo, findings);

    // 4. Check update frequency
    this.analyzeUpdateFrequency(dateInfo, findings);

    // 5. Use pattern matcher for additional signals
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'Freshness');
    findings.push(...patternFindings);

    return findings;
  }

  private extractDates($: cheerio.CheerioAPI, html: string): FreshnessDebugMeta {
    const foundDates: FreshnessDebugMeta['foundDates'] = {};

    // Extract from HTML meta tags
    const publishedMeta = $('meta[property="article:published_time"]').attr('content') ||
                         $('meta[name="date"]').attr('content') ||
                         $('time[datetime]').first().attr('datetime');
    
    const modifiedMeta = $('meta[property="article:modified_time"]').attr('content') ||
                        $('meta[name="last-modified"]').attr('content');

    if (publishedMeta) {
      foundDates.published = new Date(publishedMeta);
    }

    if (modifiedMeta) {
      foundDates.modified = new Date(modifiedMeta);
    }

    // Extract from JSON-LD
    const jsonLdScripts = $('script[type="application/ld+json"]');
    jsonLdScripts.each((_, script) => {
      const content = $(script).html();
      if (!content) return;

      try {
        const schema = JSON.parse(content);
        if (schema.datePublished && !foundDates.published) {
          foundDates.published = new Date(schema.datePublished);
        }
        if (schema.dateModified && !foundDates.modified) {
          foundDates.modified = new Date(schema.dateModified);
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
    });

    // Extract from inline text patterns
    if (!foundDates.published || !foundDates.modified) {
      const datePatterns = [
        /last updated on\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/gi,
        /laatst bijgewerkt op\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/gi,
        /updated:\s+(\w+\s+\d{1,2},\s+\d{4})/gi,
        /published on\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/gi,
        /gepubliceerd op\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/gi
      ];

      const bodyText = $('body').text();
      datePatterns.forEach(pattern => {
        const matches = bodyText.match(pattern);
        if (matches) {
          const dateStr = matches[0].replace(/.*?(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\w+\s+\d{1,2},\s+\d{4}).*/, '$1');
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // Check for update-related keywords
            if (pattern.source.includes('update') || pattern.source.includes('bijgewerkt')) {
                if (!foundDates.modified) foundDates.modified = date;
            } 
            // Check for publication-related keywords
            else if (pattern.source.includes('publish') || pattern.source.includes('gepubliceerd')) {
                if (!foundDates.published) foundDates.published = date;
            }
          }
        }
      });
    }

    // Calculate metrics
    const now = new Date();
    const daysSincePublished = foundDates.published ? 
      Math.floor((now.getTime() - foundDates.published.getTime()) / (1000 * 60 * 60 * 24)) : -1;
    
    const daysSinceModified = foundDates.modified ? 
      Math.floor((now.getTime() - foundDates.modified.getTime()) / (1000 * 60 * 60 * 24)) : -1;

    const updateFrequency = (foundDates.published && foundDates.modified) ?
      Math.floor((foundDates.modified.getTime() - foundDates.published.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      foundDates,
      consistency: {
        htmlVsJsonLd: true, // TODO: Implement actual consistency check
        htmlVsSitemap: true, // TODO: Check against sitemap if available
        allMatch: true
      },
      updateMetrics: {
        daysSincePublished,
        daysSinceModified,
        updateFrequency
      }
    };
  }

  private checkDateConsistency(dateInfo: FreshnessDebugMeta, findings: Finding[]): void {
    const { foundDates } = dateInfo;

    if (!foundDates.published && !foundDates.modified) {
      findings.push({
        title: 'No date information found',
        description: 'Website is missing published/modified dates - AI prefers fresh content.',
        priority: 'high',
        category: 'freshness',
        impact: 'high',
        technicalDetails: JSON.stringify(dateInfo, null, 2)
      });
      return;
    }

    if (foundDates.published && foundDates.modified) {
      if (foundDates.modified < foundDates.published) {
        findings.push({
          title: 'Inconsistent date information',
          description: 'The modified date is earlier than the published date.',
          priority: 'medium',
          category: 'freshness',
          impact: 'medium'
        });
      } else {
        findings.push({
          title: 'Consistent date information',
          description: 'Published and modified dates are logically consistent.',
          priority: 'low',
          category: 'freshness',
          impact: 'low'
        });
      }
    }
  }

  private analyzeContentFreshness(dateInfo: FreshnessDebugMeta, findings: Finding[]): void {
    const { updateMetrics } = dateInfo;

    if (updateMetrics.daysSinceModified === -1) {
      findings.push({
        title: 'Unknown content freshness',
        description: 'Cannot determine content freshness. Ensure a "dateModified" is available.',
        priority: 'medium',
        category: 'freshness',
        impact: 'medium'
      });
      return;
    }

    if (updateMetrics.daysSinceModified <= 30) {
      findings.push({
        title: 'Fresh content detected',
        description: `Content was updated ${updateMetrics.daysSinceModified} days ago, which is ideal for AI.`,
        priority: 'low',
        category: 'freshness',
        impact: 'low'
      });
    } else if (updateMetrics.daysSinceModified <= 90) {
      findings.push({
        title: 'Reasonably fresh content',
        description: `Content is ${updateMetrics.daysSinceModified} days old. Consider an update.`,
        priority: 'medium',
        category: 'freshness',
        impact: 'medium'
      });
    } else {
      findings.push({
        title: 'Outdated content',
        description: `Content is ${updateMetrics.daysSinceModified} days old. AI prefers fresh content.`,
        priority: 'high',
        category: 'freshness',
        impact: 'high'
      });
    }
  }

  private analyzeUpdateFrequency(dateInfo: FreshnessDebugMeta, findings: Finding[]): void {
    const { foundDates, updateMetrics } = dateInfo;

    if (!foundDates.published || !foundDates.modified) {
      return; // Can't analyze without both dates
    }

    if (updateMetrics.updateFrequency === 0) {
      findings.push({
        title: 'Content never updated',
        description: 'Published and modified dates are identical. Showing that content is maintained is beneficial.',
        priority: 'medium',
        category: 'freshness',
        impact: 'medium'
      });
    } else if (updateMetrics.updateFrequency > 0) {
      findings.push({
        title: 'Content is being updated',
        description: `Content was updated ${updateMetrics.updateFrequency} days after publication.`,
        priority: 'low',
        category: 'freshness',
        impact: 'low'
      });
    }
  }

  private calculateScore(findings: Finding[]): number {
    const baseScore = 100;
    const deductions = {
      high: 20,
      medium: 10,
      low: 5
    };

    const totalDeduction = findings.reduce((sum, finding) => {
      return sum + deductions[finding.priority as keyof typeof deductions];
    }, 0);

    return Math.max(0, Math.min(100, baseScore - totalDeduction));
  }
} 