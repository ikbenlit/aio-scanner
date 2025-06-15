import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig, type DetectedSignal } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';

interface CrossWebDebugMeta {
  platforms: {
    social: string[];
    professional: string[];
    authority: string[];
  };
  metrics: {
    totalProfiles: number;
    activeProfiles: number;
    authorityLinks: number;
  };
  validation: {
    hasRequiredPlatforms: boolean;
    hasAuthorityPresence: boolean;
    hasSufficientFootprint: boolean;
  };
}

export class CrossWebFootprintModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  // Platform categorization
  private platformCategories = {
    social: ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com'],
    professional: ['linkedin.com', 'github.com', 'behance.net', 'dribbble.com', 'medium.com'],
    authority: ['wikipedia.org', 'crunchbase.com', 'bloomberg.com', 'reuters.com', 'techcrunch.com']
  };

  async execute(url: string): Promise<ModuleResult> {
    try {
      // Fetch website content
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('CrossWebFootprint');
      
      const findings = await this.analyzeCrossWebFootprint($, html, url, config);
      const score = this.calculateScore(findings);

      return {
        name: 'CrossWebFootprint',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'CrossWebFootprint',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `CrossWeb analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeCrossWebFootprint($: cheerio.CheerioAPI, html: string, url: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // 1. Extract cross-platform links
    const footprintData = this.extractCrossWebLinks($, html);

    // 2. Analyze platform presence
    this.analyzePlatformPresence(footprintData, findings);

    // 3. Check authority validation
    this.analyzeAuthorityPresence(footprintData, findings);

    // 4. Evaluate engagement signals
    this.analyzeEngagementSignals($, findings);

    // 5. Use pattern matcher for additional signals
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'CrossWebFootprint');
    findings.push(...patternFindings);

    return findings;
  }

  private extractCrossWebLinks($: cheerio.CheerioAPI, html: string): CrossWebDebugMeta {
    const platforms: CrossWebDebugMeta['platforms'] = {
      social: [],
      professional: [],
      authority: []
    };

    // Extract from JSON-LD sameAs
    const jsonLdScripts = $('script[type="application/ld+json"]');
    jsonLdScripts.each((_, script) => {
      const content = $(script).html();
      if (!content) return;

      try {
        const schema = JSON.parse(content);
        if (schema.sameAs && Array.isArray(schema.sameAs)) {
          schema.sameAs.forEach((link: string) => {
            this.categorizeLink(link, platforms);
          });
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
    });

    // Extract from social media links
    const socialSelectors = [
      'a[href*="facebook.com"]',
      'a[href*="twitter.com"]',
      'a[href*="linkedin.com"]',
      'a[href*="instagram.com"]',
      'a[href*="youtube.com"]',
      'a[href*="github.com"]'
    ];

    socialSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          this.categorizeLink(href, platforms);
        }
      });
    });

    // Extract from footer and social sections
    const socialSections = $('[class*="social" i], [id*="social" i], footer');
    socialSections.find('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        this.categorizeLink(href, platforms);
      }
    });

    // Calculate metrics
    const totalProfiles = platforms.social.length + platforms.professional.length;
    const activeProfiles = totalProfiles; // Assume all found profiles are active
    const authorityLinks = platforms.authority.length;

    return {
      platforms,
      metrics: {
        totalProfiles,
        activeProfiles,
        authorityLinks
      },
      validation: {
        hasRequiredPlatforms: platforms.social.length >= 2,
        hasAuthorityPresence: platforms.authority.length >= 1,
        hasSufficientFootprint: totalProfiles >= 3
      }
    };
  }

  private categorizeLink(link: string, platforms: CrossWebDebugMeta['platforms']): void {
    const url = link.toLowerCase();

    // Check social platforms
    for (const platform of this.platformCategories.social) {
      if (url.includes(platform) && !platforms.social.includes(platform)) {
        platforms.social.push(platform);
        break;
      }
    }

    // Check professional platforms
    for (const platform of this.platformCategories.professional) {
      if (url.includes(platform) && !platforms.professional.includes(platform)) {
        platforms.professional.push(platform);
        break;
      }
    }

    // Check authority platforms
    for (const platform of this.platformCategories.authority) {
      if (url.includes(platform) && !platforms.authority.includes(platform)) {
        platforms.authority.push(platform);
        break;
      }
    }
  }

  private analyzePlatformPresence(footprintData: CrossWebDebugMeta, findings: Finding[]): void {
    const { platforms, metrics, validation } = footprintData;

    if (validation.hasSufficientFootprint) {
      findings.push({
        title: 'Sterke cross-platform presence',
        description: `${metrics.totalProfiles} platforms gevonden: ${[...platforms.social, ...platforms.professional].join(', ')}`,
        priority: 'low',
        category: 'cross-web',
        impact: 'low',
        technicalDetails: JSON.stringify(footprintData, null, 2)
      });
    } else if (metrics.totalProfiles >= 1) {
      findings.push({
        title: 'Beperkte cross-platform presence',
        description: `Slechts ${metrics.totalProfiles} platforms gevonden - AI prefereert multi-platform entiteiten`,
        priority: 'medium',
        category: 'cross-web',
        impact: 'medium'
      });
    } else {
      findings.push({
        title: 'Ontbrekende cross-platform presence',
        description: 'Geen social media of professional platform links gevonden',
        priority: 'high',
        category: 'cross-web',
        impact: 'high'
      });
    }

    // Specific platform recommendations
    if (!platforms.social.includes('linkedin.com')) {
      findings.push({
        title: 'LinkedIn profiel ontbreekt',
        description: 'LinkedIn is cruciaal voor professional authority - voeg sameAs link toe',
        priority: 'medium',
        category: 'cross-web',
        impact: 'medium'
      });
    }

    if (platforms.social.length === 0) {
      findings.push({
        title: 'Geen social media presence',
        description: 'Social media links helpen AI assistenten entiteit validatie',
        priority: 'medium',
        category: 'cross-web',
        impact: 'medium'
      });
    }
  }

  private analyzeAuthorityPresence(footprintData: CrossWebDebugMeta, findings: Finding[]): void {
    const { platforms, validation } = footprintData;

    if (validation.hasAuthorityPresence) {
      findings.push({
        title: 'Authority platform presence',
        description: `Externe validatie gevonden: ${platforms.authority.join(', ')}`,
        priority: 'low',
        category: 'authority',
        impact: 'low'
      });
    } else {
      findings.push({
        title: 'Ontbrekende authority validatie',
        description: 'Geen links naar authority sites - overweeg Wikipedia, Crunchbase, of nieuwssites',
        priority: 'medium',
        category: 'authority',
        impact: 'medium'
      });
    }
  }

  private analyzeEngagementSignals($: cheerio.CheerioAPI, findings: Finding[]): void {
    // Check for social sharing buttons
    const shareButtons = $('[class*="share" i], [class*="social" i]').find('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"]');
    
    if (shareButtons.length >= 3) {
      findings.push({
        title: 'Social sharing geïmplementeerd',
        description: `${shareButtons.length} social share buttons gevonden`,
        priority: 'low',
        category: 'engagement',
        impact: 'low'
      });
    } else if (shareButtons.length >= 1) {
      findings.push({
        title: 'Beperkte social sharing',
        description: 'Voeg meer social share buttons toe voor betere verspreiding',
        priority: 'medium',
        category: 'engagement',
        impact: 'medium'
      });
    }

    // Check for newsletter/RSS feeds
    const feedLinks = $('a[href*="rss"], a[href*="feed"], a[href*="newsletter"], input[type="email"]');
    
    if (feedLinks.length > 0) {
      findings.push({
        title: 'Engagement mechanismen gevonden',
        description: 'RSS feeds of newsletter signup gedetecteerd',
        priority: 'low',
        category: 'engagement',
        impact: 'low'
      });
    }

    // Check for comment systems
    const commentSystems = $('[class*="comment" i], [id*="comment" i], [class*="disqus" i]');
    
    if (commentSystems.length > 0) {
      findings.push({
        title: 'Comment systeem gedetecteerd',
        description: 'Website heeft interactie mogelijkheden',
        priority: 'low',
        category: 'engagement',
        impact: 'low'
      });
    }
  }

  private calculateScore(findings: Finding[]): number {
    const baseScore = 100;
    const deductions = {
      high: 25,
      medium: 15,
      low: 5
    };

    const totalDeduction = findings.reduce((sum, finding) => {
      return sum + deductions[finding.priority as keyof typeof deductions];
    }, 0);

    return Math.max(0, Math.min(100, baseScore - totalDeduction));
  }
} 