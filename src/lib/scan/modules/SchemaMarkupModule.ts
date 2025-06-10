import * as cheerio from 'cheerio';
import type { ScanModule, ModuleResult, Finding, Recommendation, ScanMetadata } from '../types.js';

export class SchemaMarkupModule implements ScanModule {
  name = 'Schema Markup';
  description = 'Analyseert structured data: JSON-LD, schema markup, rich snippets potentie';
  category = 'foundation' as const;

  async analyze(url: string, html: string, metadata?: ScanMetadata): Promise<ModuleResult> {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    
    try {
      const $ = cheerio.load(html);
      const domain = metadata?.domain || new URL(url).hostname;

      // 1. JSON-LD Analysis
      this.analyzeJsonLd($, findings, recommendations);

      // 2. Open Graph Analysis
      this.analyzeOpenGraph($, findings, recommendations);

      // 3. Business Schema Opportunities
      this.analyzeBusinessSchema($, findings, recommendations);

      const score = this.calculateScore(findings);

      return {
        moduleName: this.name,
        score,
        status: 'completed',
        findings,
        recommendations: recommendations.slice(0, 5),
        metadata: {
          domain,
          totalChecks: findings.length
        }
      };

    } catch (error) {
      return {
        moduleName: this.name,
        score: 0,
        status: 'failed',
        findings: [{
          type: 'error',
          title: 'Module Error',
          description: `Schema Markup analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          impact: 'high',
          category: 'system'
        }],
        recommendations: []
      };
    }
  }

  private analyzeJsonLd($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    if (jsonLdScripts.length === 0) {
      findings.push({
        type: 'warning',
        title: 'Geen JSON-LD structured data gevonden',
        description: 'Website gebruikt geen JSON-LD schema markup',
        impact: 'high',
        category: 'structured-data'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer JSON-LD structured data',
        description: 'Structured data helpt zoekmachines en AI-assistenten je content beter te begrijpen',
        implementationSteps: [
          'Implementeer Organization schema voor bedrijfsgegevens',
          'Voeg WebSite schema toe voor sitewide informatie',
          'Overweeg FAQ schema voor veelgestelde vragen',
          'Test met Google Rich Results Test tool'
        ],
        estimatedTime: '2-4 uur',
        expectedImpact: 'Rich snippets, betere AI-assistant detectie',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Jouw Bedrijf",
  "url": "https://jouwdomein.nl",
  "logo": "https://jouwdomein.nl/logo.png"
}
</script>`
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

        this.validateSchemaType(schema, findings, recommendations);

      } catch (parseError) {
        findings.push({
          type: 'error',
          title: 'JSON-LD syntax error',
          description: 'Ongeldige JSON-LD syntax gedetecteerd',
          impact: 'medium',
          category: 'structured-data'
        });

        recommendations.push({
          priority: 'medium',
          title: 'Corrigeer JSON-LD syntax',
          description: 'Ongeldige JSON-LD kan niet door zoekmachines worden gelezen',
          implementationSteps: [
            'Valideer JSON syntax met online JSON validator',
            'Controleer op ontbrekende komma\'s en haakjes',
            'Test met Google Rich Results Test'
          ],
          estimatedTime: '30 minuten',
          expectedImpact: 'Werkende structured data'
        });
      }
    });

    if (validSchemas > 0) {
      findings.push({
        type: 'success',
        title: `${validSchemas} JSON-LD schema's gevonden`,
        description: `Schema types: ${foundSchemaTypes.join(', ')}`,
        impact: 'low',
        category: 'structured-data'
      });

      this.checkEssentialSchemas(foundSchemaTypes, findings, recommendations);
    }
  }

  private validateSchemaType(schema: any, findings: Finding[], recommendations: Recommendation[]): void {
    const schemaType = Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'];

    switch (schemaType) {
      case 'Organization':
        this.validateOrganizationSchema(schema, findings, recommendations);
        break;
      case 'LocalBusiness':
        this.validateLocalBusinessSchema(schema, findings, recommendations);
        break;
      case 'FAQ':
      case 'FAQPage':
        this.validateFAQSchema(schema, findings, recommendations);
        break;
    }
  }

  private validateOrganizationSchema(schema: any, findings: Finding[], recommendations: Recommendation[]): void {
    const requiredFields = ['name', 'url'];
    const missingFields = requiredFields.filter(field => !schema[field]);

    if (missingFields.length === 0) {
      findings.push({
        type: 'success',
        title: 'Organization schema compleet',
        description: 'Basis bedrijfsgegevens zijn aanwezig',
        impact: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'Organization schema incompleet',
        description: `Ontbrekende velden: ${missingFields.join(', ')}`,
        impact: 'medium',
        category: 'structured-data'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Completeer Organization schema',
        description: 'Voeg ontbrekende bedrijfsgegevens toe',
        implementationSteps: [
          'Voeg bedrijfsnaam toe (name)',
          'Voeg website URL toe (url)',
          'Overweeg logo en contactInfo toe te voegen'
        ],
        estimatedTime: '20 minuten',
        expectedImpact: 'Betere bedrijfsherkenning door AI-assistenten'
      });
    }
  }

  private validateLocalBusinessSchema(schema: any, findings: Finding[], recommendations: Recommendation[]): void {
    const requiredFields = ['name', 'address', 'telephone'];
    const missingFields = requiredFields.filter(field => !schema[field]);

    if (missingFields.length === 0) {
      findings.push({
        type: 'success',
        title: 'LocalBusiness schema compleet',
        description: 'NAP-gegevens (Name, Address, Phone) zijn volledig',
        impact: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'LocalBusiness schema incompleet',
        description: `Ontbrekende NAP-gegevens: ${missingFields.join(', ')}`,
        impact: 'high',
        category: 'structured-data'
      });

      recommendations.push({
        priority: 'high',
        title: 'Completeer LocalBusiness schema',
        description: 'Lokale bedrijven hebben volledige NAP-gegevens nodig',
        implementationSteps: [
          'Voeg exacte bedrijfsnaam toe',
          'Voeg volledig adres toe',
          'Voeg telefoonnummer toe',
          'Overweeg openingstijden toe te voegen'
        ],
        estimatedTime: '30 minuten',
        expectedImpact: 'Betere lokale SEO en Google Maps visibility'
      });
    }
  }

  private validateFAQSchema(schema: any, findings: Finding[], recommendations: Recommendation[]): void {
    if (schema.mainEntity && Array.isArray(schema.mainEntity) && schema.mainEntity.length > 0) {
      findings.push({
        type: 'success',
        title: 'FAQ schema geïmplementeerd',
        description: `${schema.mainEntity.length} FAQ items gevonden`,
        impact: 'low',
        category: 'structured-data'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'FAQ schema is leeg',
        description: 'FAQ schema zonder inhoud heeft geen waarde',
        impact: 'medium',
        category: 'structured-data'
      });
    }
  }

  private checkEssentialSchemas(foundTypes: string[], findings: Finding[], recommendations: Recommendation[]): void {
    const essentialSchemas = ['Organization', 'WebSite'];
    const missingEssential = essentialSchemas.filter(type => !foundTypes.includes(type));

    if (missingEssential.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Implementeer basis schema types',
        description: 'Organization en WebSite schema zijn essentieel',
        implementationSteps: [
          'Voeg Organization schema toe voor bedrijfsgegevens',
          'Voeg WebSite schema toe voor site-informatie',
          'Test met Google Rich Results Test'
        ],
        estimatedTime: '1 uur',
        expectedImpact: 'Betere herkenning door zoekmachines en AI'
      });
    }
  }

  private analyzeOpenGraph($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');

    if (ogTitle && ogDescription) {
      findings.push({
        type: 'success',
        title: 'Open Graph markup aanwezig',
        description: 'Social media sharing markup is geconfigureerd',
        impact: 'low',
        category: 'social-markup'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'Open Graph markup ontbreekt',
        description: 'Geen social media preview markup',
        impact: 'medium',
        category: 'social-markup'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Implementeer Open Graph markup',
        description: 'Verbetert social media previews',
        implementationSteps: [
          'Voeg og:title meta tag toe',
          'Voeg og:description meta tag toe',
          'Voeg og:image meta tag toe',
          'Voeg og:url toe'
        ],
        estimatedTime: '30 minuten',
        expectedImpact: 'Betere social media previews'
      });
    }
  }

  private analyzeBusinessSchema($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const content = $('body').text().toLowerCase();
    
    // Check for FAQ content without schema
    if ((content.includes('vraag') || content.includes('faq') || content.includes('veelgesteld')) 
        && !content.includes('"@type":"FAQ')) {
      recommendations.push({
        priority: 'medium',
        title: 'FAQ content detecteerd - voeg FAQ schema toe',
        description: 'Je hebt FAQ content maar geen structured data',
        implementationSteps: [
          'Identificeer veelgestelde vragen op je site',
          'Implementeer FAQ schema markup',
          'Structureer vragen en antwoorden correct'
        ],
        estimatedTime: '1 uur',
        expectedImpact: 'FAQ rich snippets in zoekresultaten'
      });
    }

    // Check for product/service content
    if (content.includes('prijs') || content.includes('product') || content.includes('dienst')) {
      recommendations.push({
        priority: 'low',
        title: 'Overweeg Product/Service schema',
        description: 'Product of service content kan specifieke markup gebruiken',
        implementationSteps: [
          'Bepaal of je Product of Service schema nodig hebt',
          'Voeg prijsinformatie toe waar van toepassing',
          'Voeg beschrijvingen en specificaties toe'
        ],
        estimatedTime: '2 uur',
        expectedImpact: 'Product/service rich snippets'
      });
    }
  }

  calculateScore(findings: Finding[]): number {
    let score = 100;
    
    for (const finding of findings) {
      if (finding.type === 'error') {
        score -= finding.impact === 'high' ? 25 : finding.impact === 'medium' ? 15 : 8;
      } else if (finding.type === 'warning') {
        score -= finding.impact === 'high' ? 15 : finding.impact === 'medium' ? 8 : 3;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
} 