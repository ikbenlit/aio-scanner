import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';
import { normalizeUrl } from '../../utils.js';

export class SchemaMarkupModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string, html?: string, $?: cheerio.CheerioAPI): Promise<ModuleResult> {
    try {
      // Use provided content or fetch (backward compatibility)
      const normalizedUrl = normalizeUrl(url);
      const actualHtml = html || await fetch(normalizedUrl).then(r => r.text());
      const actual$ = $ || cheerio.load(actualHtml);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('SchemaMarkup');
      
      const findings = await this.analyzeSchemaMarkup(actual$, actualHtml, config);
      const score = this.calculateScore(findings);

      return {
        name: 'SchemaMarkup',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'SchemaMarkup',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `Schema Markup analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeSchemaMarkup($: cheerio.CheerioAPI, html: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Use PatternMatcher for basic pattern detection
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'SchemaMarkup');
    findings.push(...patternFindings);

    // Custom analysis that requires complex logic
    this.analyzeJsonLd($, findings);
    this.analyzeOpenGraph($, findings);
    this.analyzeBusinessSchema($, findings);

    return findings;
  }

  private analyzeJsonLd($: cheerio.CheerioAPI, findings: Finding[]): void {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    if (jsonLdScripts.length === 0) {
      findings.push({
        title: 'Gestructureerde Data: Ontbrekend',
        description: 'Website gebruikt geen JSON-LD schema markup. Het toevoegen van schema markup kan leiden tot rich snippets in zoekresultaten en betere zichtbaarheid.',
        priority: 'high',
        category: 'structured-data'
      });
      return;
    }

    // Parse JSON-LD and validate
    let validSchemas = 0;
    const foundSchemaTypes: string[] = [];

    jsonLdScripts.each((_, script) => {
      const content = $(script).html();
      if (!content) return;

      try {
        const schema = JSON.parse(content);
        validSchemas++;

        if (schema['@type']) {
          const type = Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'];
          foundSchemaTypes.push(type);
        }

        this.validateSchemaType(schema, findings);

      } catch (parseError) {
        findings.push({
          title: 'JSON-LD syntax error',
          description: 'Ongeldige JSON-LD syntax gedetecteerd',
          priority: 'medium',
          category: 'structured-data'
        });
      }
    });

    if (validSchemas > 0) {
      findings.push({
        title: `Gestructureerde Data: Uitstekend (${validSchemas} schema's gevonden)`,
        description: `Gevonden schema types: ${foundSchemaTypes.join(', ')}. Schema markup helpt zoekmachines je content beter te begrijpen en kan leiden tot rich snippets in zoekresultaten.`,
        priority: 'low',
        category: 'structured-data'
      });

      this.checkEssentialSchemas(foundSchemaTypes, findings);
    }
  }

  private validateSchemaType(schema: any, findings: Finding[]): void {
    const schemaType = Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'];

    switch (schemaType) {
      case 'Organization':
        this.validateOrganizationSchema(schema, findings);
        break;
      case 'LocalBusiness':
        this.validateLocalBusinessSchema(schema, findings);
        break;
      case 'FAQ':
      case 'FAQPage':
        this.validateFAQSchema(schema, findings);
        break;
    }
  }

  private validateOrganizationSchema(schema: any, findings: Finding[]): void {
    const requiredFields = ['name', 'url'];
    const missingFields = requiredFields.filter(field => !schema[field]);

    if (missingFields.length === 0) {
      findings.push({
        title: 'Organization schema compleet',
        description: 'Basis bedrijfsgegevens zijn aanwezig',
        priority: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        title: 'Organization schema incompleet',
        description: `Ontbrekende velden: ${missingFields.join(', ')}`,
        priority: 'medium',
        category: 'structured-data'
      });
    }
  }

  private validateLocalBusinessSchema(schema: any, findings: Finding[]): void {
    const requiredFields = ['name', 'address'];
    const missingFields = requiredFields.filter(field => !schema[field]);

    if (missingFields.length === 0) {
      findings.push({
        title: 'LocalBusiness schema compleet',
        description: 'Lokale bedrijfsgegevens zijn correct gestructureerd',
        priority: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        title: 'LocalBusiness schema incompleet',
        description: `Ontbrekende velden: ${missingFields.join(', ')}`,
        priority: 'medium',
        category: 'structured-data'
      });
    }
  }

  private validateFAQSchema(schema: any, findings: Finding[]): void {
    if (schema.mainEntity && Array.isArray(schema.mainEntity) && schema.mainEntity.length > 0) {
      findings.push({
        title: 'FAQ schema gedetecteerd',
        description: `${schema.mainEntity.length} FAQ items gevonden`,
        priority: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        title: 'FAQ schema incompleet',
        description: 'FAQ schema mist mainEntity array met vragen',
        priority: 'medium',
        category: 'structured-data'
      });
    }
  }

  private checkEssentialSchemas(foundTypes: string[], findings: Finding[]): void {
    const essentialSchemas = ['Organization', 'WebSite'];
    const missingEssentials = essentialSchemas.filter(type => !foundTypes.includes(type));

    if (missingEssentials.length > 0) {
      findings.push({
        title: 'Ontbrekende essentiële schemas',
        description: `Overweeg toe te voegen: ${missingEssentials.join(', ')}`,
        priority: 'medium',
        category: 'structured-data'
      });
    }
  }

  private analyzeOpenGraph($: cheerio.CheerioAPI, findings: Finding[]): void {
    const ogTags = $('meta[property^="og:"]');
    
    if (ogTags.length === 0) {
      findings.push({
        title: 'Geen Open Graph tags gevonden',
        description: 'Website mist Open Graph meta tags voor social sharing',
        priority: 'medium',
        category: 'meta-data'
      });
      return;
    }

    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const foundOgTags: string[] = [];

    ogTags.each((_, tag) => {
      const property = $(tag).attr('property');
      if (property) {
        foundOgTags.push(property);
      }
    });

    const missingOgTags = requiredOgTags.filter(tag => !foundOgTags.includes(tag));

    if (missingOgTags.length === 0) {
      findings.push({
        title: 'Open Graph tags compleet',
        description: 'Alle essentiële OG tags aanwezig voor social sharing',
        priority: 'low',
        category: 'meta-data'
      });
    } else {
      findings.push({
        title: 'Open Graph tags incompleet',
        description: `Ontbrekende tags: ${missingOgTags.join(', ')}`,
        priority: 'medium',
        category: 'meta-data'
      });
    }
  }

  private analyzeBusinessSchema($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    
    // Check if business type content exists
    const businessPatterns = [
      /openingstijden|opening hours/gi,
      /adres|address/gi,
      /telefoon|phone/gi,
      /contact|contacteer/gi,
      /reviews|beoordelingen/gi
    ];

    let businessSignals = 0;
    businessPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) businessSignals += matches.length;
    });

    if (businessSignals >= 3) {
      // Check if LocalBusiness schema is present
      const jsonLdScripts = $('script[type="application/ld+json"]');
      let hasLocalBusiness = false;

      jsonLdScripts.each((_, script) => {
        const content = $(script).html();
        if (content && content.includes('LocalBusiness')) {
          hasLocalBusiness = true;
        }
      });

      if (!hasLocalBusiness) {
        findings.push({
          title: 'LocalBusiness schema aanbevolen',
          description: 'Website toont bedrijfskenmerken maar mist LocalBusiness schema',
          priority: 'medium',
          category: 'structured-data'
        });
      }
    }

    // Check for FAQ content without FAQ schema
    const faqPatterns = [
      /veelgestelde vragen|frequently asked|faq/gi,
      /\?.*\?.*\?/gi // Multiple question marks indicating FAQ-style content
    ];

    let faqSignals = 0;
    faqPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) faqSignals += matches.length;
    });

    if (faqSignals >= 2) {
      const jsonLdScripts = $('script[type="application/ld+json"]');
      let hasFAQSchema = false;

      jsonLdScripts.each((_, script) => {
        const content = $(script).html();
        if (content && (content.includes('FAQ') || content.includes('Question'))) {
          hasFAQSchema = true;
        }
      });

      if (!hasFAQSchema) {
        findings.push({
          title: 'FAQ schema aanbevolen',
          description: 'Website heeft FAQ-content maar mist FAQ schema markup',
          priority: 'medium',
          category: 'structured-data'
        });
      }
    }
  }

  private calculateScore(findings: Finding[]): number {
    let score = 100;
    
    for (const finding of findings) {
      if (finding.priority === 'high') {
        score -= 25;
      } else if (finding.priority === 'medium') {
        score -= 10;
      } else if (finding.priority === 'low') {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
} 