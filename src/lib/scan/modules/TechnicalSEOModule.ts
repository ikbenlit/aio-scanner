import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import type { ScanModule, ModuleResult, Finding, Recommendation, ScanMetadata } from '../types.js';
import { ContentFetcher } from '../ContentFetcher.js';

export class TechnicalSEOModule implements ScanModule {
  name = 'Technical SEO';
  description = 'Controleert basis SEO-elementen: robots.txt, meta tags, sitemap';
  category = 'foundation' as const;
  
  private contentFetcher = new ContentFetcher();

  async analyze(url: string, html: string, metadata?: ScanMetadata): Promise<ModuleResult> {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    
    try {
      const $ = cheerio.load(html);
      const domain = metadata?.domain || new URL(url).hostname;

      // 1. Robots.txt Analysis
      await this.analyzeRobotsTxt(domain, findings, recommendations);

      // 2. Meta Tags Analysis
      this.analyzeMetaTags($, findings, recommendations);

      // 3. Sitemap Analysis
      await this.analyzeSitemap(domain, findings, recommendations);

      // 4. Basic SEO Structure
      this.analyzeBasicSEO($, findings, recommendations);

      const score = this.calculateScore(findings);

      return {
        moduleName: this.name,
        score,
        status: 'completed',
        findings,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
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
          description: `Technical SEO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          impact: 'high',
          category: 'system'
        }],
        recommendations: []
      };
    }
  }

  private async analyzeRobotsTxt(domain: string, findings: Finding[], recommendations: Recommendation[]): Promise<void> {
    const robotsTxt = await this.contentFetcher.fetchRobotsTxt(domain);
    
    if (!robotsTxt) {
      findings.push({
        type: 'warning',
        title: 'Robots.txt niet gevonden',
        description: 'Geen robots.txt bestand aangetroffen',
        impact: 'medium',
        category: 'crawling',
        technicalDetails: `Geen robots.txt op https://${domain}/robots.txt`
      });

      recommendations.push({
        priority: 'medium',
        title: 'Voeg robots.txt toe',
        description: 'Een robots.txt bestand helpt zoekmachines je site beter te crawlen',
        implementationSteps: [
          'Maak een robots.txt bestand aan in de root van je website',
          'Voeg basic rules toe voor User-agent: *',
          'Verwijs naar je sitemap.xml in het bestand'
        ],
        estimatedTime: '15 minuten',
        expectedImpact: 'Betere crawling door zoekmachines',
        codeSnippet: `User-agent: *\nAllow: /\nSitemap: https://${domain}/sitemap.xml`
      });

      return;
    }

    // Parse robots.txt
    try {
      const robots = robotsParser(`https://${domain}/robots.txt`, robotsTxt);
      
      // Check of site toegankelijk is voor bots
      const isAllowed = robots.isAllowed(domain, '*');
      
      if (isAllowed) {
        findings.push({
          type: 'success',
          title: 'Robots.txt configuratie correct',
          description: 'Website is toegankelijk voor zoekmachine crawlers',
          impact: 'low',
          category: 'crawling'
        });
      } else {
        findings.push({
          type: 'error',
          title: 'Website geblokkeerd in robots.txt',
          description: 'Robots.txt blokkeert toegang voor zoekmachine crawlers',
          impact: 'high',
          category: 'crawling',
          technicalDetails: 'Disallow: / regel gedetecteerd'
        });

        recommendations.push({
          priority: 'high',
          title: 'Corrigeer robots.txt blokkeringen',
          description: 'Je website wordt volledig geblokkeerd voor zoekmachines',
          implementationSteps: [
            'Open je robots.txt bestand',
            'Verwijder de "Disallow: /" regel',
            'Vervang door specifieke blokkades indien nodig'
          ],
          estimatedTime: '10 minuten',
          expectedImpact: 'Website wordt vindbaar in zoekmachines'
        });
      }

      // Check voor sitemap referentie
      if (robotsTxt.toLowerCase().includes('sitemap:')) {
        findings.push({
          type: 'success',
          title: 'Sitemap referentie gevonden',
          description: 'Robots.txt verwijst naar sitemap.xml',
          impact: 'low',
          category: 'crawling'
        });
      }

    } catch (error) {
      findings.push({
        type: 'warning',
        title: 'Robots.txt parsing error',
        description: 'Kon robots.txt niet correct interpreteren',
        impact: 'medium',
        category: 'crawling'
      });
    }
  }

  private analyzeMetaTags($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    // Title tag
    const title = $('title').text().trim();
    if (!title) {
      findings.push({
        type: 'error',
        title: 'Title tag ontbreekt',
        description: 'Geen title tag gevonden in de HTML',
        impact: 'high',
        category: 'meta-tags'
      });

      recommendations.push({
        priority: 'high',
        title: 'Voeg title tag toe',
        description: 'De title tag is cruciaal voor SEO en wordt getoond in zoekresultaten',
        implementationSteps: [
          'Voeg een <title> tag toe in de <head> sectie',
          'Houd de titel tussen 30-60 karakters',
          'Maak de titel beschrijvend en uniek per pagina'
        ],
        estimatedTime: '5 minuten',
        expectedImpact: 'Betere rankings en klik-through rates',
        codeSnippet: '<title>Je Paginatitel - Bedrijfsnaam</title>'
      });
    } else if (title.length < 30 || title.length > 60) {
      findings.push({
        type: 'warning',
        title: 'Title tag lengte suboptimaal',
        description: `Title tag is ${title.length} karakters (aanbevolen: 30-60)`,
        impact: 'medium',
        category: 'meta-tags',
        technicalDetails: `Huidige titel: "${title}"`
      });

      recommendations.push({
        priority: 'medium',
        title: 'Optimaliseer title tag lengte',
        description: 'Zorg dat de title tag tussen 30-60 karakters is voor optimale weergave',
        implementationSteps: [
          'Herformuleer de titel om binnen 30-60 karakters te blijven',
          'Plaats belangrijke keywords vooraan',
          'Houd rekening met branding aan het einde'
        ],
        estimatedTime: '10 minuten',
        expectedImpact: 'Betere weergave in zoekresultaten'
      });
    } else {
      findings.push({
        type: 'success',
        title: 'Title tag correct geconfigureerd',
        description: `Title tag heeft goede lengte (${title.length} karakters)`,
        impact: 'low',
        category: 'meta-tags'
      });
    }

    // Meta description
    const metaDescription = $('meta[name="description"]').attr('content')?.trim();
    if (!metaDescription) {
      findings.push({
        type: 'error',
        title: 'Meta description ontbreekt',
        description: 'Geen meta description gevonden',
        impact: 'high',
        category: 'meta-tags'
      });

      recommendations.push({
        priority: 'high',
        title: 'Voeg meta description toe',
        description: 'Meta description wordt vaak gebruikt als snippet in zoekresultaten',
        implementationSteps: [
          'Voeg een meta description tag toe in de <head>',
          'Houd de beschrijving tussen 120-160 karakters',
          'Maak het aantrekkelijk en relevant voor de pagina inhoud'
        ],
        estimatedTime: '10 minuten',
        expectedImpact: 'Betere click-through rates van zoekresultaten',
        codeSnippet: '<meta name="description" content="Je paginabeschrijving die zoekers aanzet tot klikken">'
      });
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      findings.push({
        type: 'warning',
        title: 'Meta description lengte suboptimaal',
        description: `Meta description is ${metaDescription.length} karakters (aanbevolen: 120-160)`,
        impact: 'medium',
        category: 'meta-tags'
      });
    } else {
      findings.push({
        type: 'success',
        title: 'Meta description correct geconfigureerd',
        description: `Meta description heeft goede lengte (${metaDescription.length} karakters)`,
        impact: 'low',
        category: 'meta-tags'
      });
    }

    // Viewport meta tag (mobile optimization)
    const viewport = $('meta[name="viewport"]').attr('content');
    if (!viewport) {
      findings.push({
        type: 'warning',
        title: 'Viewport meta tag ontbreekt',
        description: 'Geen viewport configuratie voor mobiele weergave',
        impact: 'medium',
        category: 'mobile'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Voeg viewport meta tag toe',
        description: 'Viewport tag is essentieel voor responsive design',
        implementationSteps: [
          'Voeg viewport meta tag toe in de <head> sectie',
          'Gebruik standaard responsive configuratie'
        ],
        estimatedTime: '2 minuten',
        expectedImpact: 'Betere mobiele gebruikerservaring',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    } else {
      findings.push({
        type: 'success',
        title: 'Viewport meta tag aanwezig',
        description: 'Website is geconfigureerd voor mobiele weergave',
        impact: 'low',
        category: 'mobile'
      });
    }
  }

  private async analyzeSitemap(domain: string, findings: Finding[], recommendations: Recommendation[]): Promise<void> {
    const sitemap = await this.contentFetcher.fetchSitemap(domain);
    
    if (!sitemap) {
      findings.push({
        type: 'warning',
        title: 'Sitemap.xml niet gevonden',
        description: 'Geen XML sitemap aangetroffen',
        impact: 'medium',
        category: 'crawling'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Genereer XML sitemap',
        description: 'Een sitemap helpt zoekmachines alle pagina\'s te ontdekken',
        implementationSteps: [
          'Genereer een sitemap.xml met alle belangrijke pagina\'s',
          'Upload naar de root van je website',
          'Verwijs ernaar in je robots.txt',
          'Submit aan Google Search Console'
        ],
        estimatedTime: '30 minuten',
        expectedImpact: 'Betere indexering van je website'
      });
    } else {
      findings.push({
        type: 'success',
        title: 'XML Sitemap gevonden',
        description: 'Website heeft een toegankelijke sitemap',
        impact: 'low',
        category: 'crawling'
      });
    }
  }

  private analyzeBasicSEO($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    // H1 tags
    const h1Tags = $('h1');
    if (h1Tags.length === 0) {
      findings.push({
        type: 'error',
        title: 'Geen H1 tag gevonden',
        description: 'Geen hoofdkop (H1) aangetroffen op de pagina',
        impact: 'high',
        category: 'content-structure'
      });

      recommendations.push({
        priority: 'high',
        title: 'Voeg H1 tag toe',
        description: 'Elke pagina moet één duidelijke hoofdkop (H1) hebben',
        implementationSteps: [
          'Voeg één <h1> tag toe aan je pagina',
          'Gebruik relevante keywords in de H1',
          'Zorg dat de H1 de pagina-inhoud goed samenvat'
        ],
        estimatedTime: '5 minuten',
        expectedImpact: 'Betere structuur en SEO rankings'
      });
    } else if (h1Tags.length > 1) {
      findings.push({
        type: 'warning',
        title: 'Meerdere H1 tags gevonden',
        description: `${h1Tags.length} H1 tags gevonden (aanbevolen: 1)`,
        impact: 'medium',
        category: 'content-structure'
      });
    } else {
      findings.push({
        type: 'success',
        title: 'H1 tag correct gebruikt',
                  description: 'Pagina heeft een duidelijke hoofdkop',
        impact: 'low',
        category: 'content-structure'
      });
    }

    // Images without alt tags
    const imagesWithoutAlt = $('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      findings.push({
        type: 'warning',
        title: 'Afbeeldingen zonder alt-tekst',
        description: `${imagesWithoutAlt.length} afbeeldingen missen alt-tekst`,
        impact: 'medium',
        category: 'accessibility'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Voeg alt-tekst toe aan afbeeldingen',
        description: 'Alt-tekst is belangrijk voor toegankelijkheid en SEO',
        implementationSteps: [
          'Voeg beschrijvende alt-tekst toe aan alle afbeeldingen',
          'Gebruik relevante keywords waar mogelijk',
          'Beschrijf wat er op de afbeelding te zien is'
        ],
        estimatedTime: '20 minuten',
        expectedImpact: 'Betere toegankelijkheid en SEO',
        codeSnippet: '<img src="foto.jpg" alt="Beschrijving van de afbeelding">'
      });
    }
  }

  calculateScore(findings: Finding[]): number {
    let score = 100;
    
    for (const finding of findings) {
      if (finding.type === 'error') {
        score -= finding.impact === 'high' ? 20 : finding.impact === 'medium' ? 10 : 5;
      } else if (finding.type === 'warning') {
        score -= finding.impact === 'high' ? 10 : finding.impact === 'medium' ? 5 : 2;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
} 