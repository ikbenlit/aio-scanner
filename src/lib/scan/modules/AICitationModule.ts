import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';

export class AICitationModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string): Promise<ModuleResult> {
    try {
      // Fetch website content
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('AICitation');
      
      const findings = await this.analyzeAICitation($, html, config);
      const score = this.calculateScore(findings);

      return {
        name: 'AICitation',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'AICitation',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `AI Citation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeAICitation($: cheerio.CheerioAPI, html: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // 1. Use PatternMatcher for basic pattern detection
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'AICitation');
    findings.push(...patternFindings);

    // 2. Custom analysis that requires complex logic
    this.analyzeAuthorBio($, findings);
    this.analyzeExpertiseSignals($, findings);
    this.analyzeQuoteableContent($, findings);
    this.analyzeAuthorityMarkers($, findings);
    this.analyzeBusinessTransparency($, findings);

    return findings;
  }

  private analyzeAuthorBio($: cheerio.CheerioAPI, findings: Finding[]): void {
    // Detect author/team sections by common patterns
    const authorSelectors = [
      '[class*="over" i]',
      '[class*="about" i]',
      '[class*="team" i]',
      '[class*="author" i]',
      '[class*="founder" i]',
      '[class*="bio" i]',
      '[id*="over" i]',
      '[id*="about" i]',
      '[id*="team" i]'
    ];

    let authorSectionsFound = 0;
    let professionalTitles = 0;

    // Check for explicit author sections
    authorSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        authorSectionsFound += elements.length;
        
        // Analyze content within author sections
        elements.each((_, element) => {
          const text = $(element).text().toLowerCase();
          
          // Count professional titles
          const titlePatterns = [
            /ceo|directeur|oprichter|founder/gi,
            /expert|specialist|consultant/gi,
            /manager|hoofd|senior/gi,
            /years? of experience|jaar ervaring/gi
          ];
          
          titlePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) professionalTitles += matches.length;
          });
        });
      }
    });

    // Evaluate findings
    if (authorSectionsFound >= 2 && professionalTitles >= 3) {
      findings.push({
        title: 'Uitgebreide author/team informatie',
        description: `${authorSectionsFound} team secties met ${professionalTitles} professionele titels`,
        priority: 'low',
        category: 'authority'
      });
    } else if (authorSectionsFound >= 1 || professionalTitles >= 1) {
      findings.push({
        title: 'Beperkte author informatie',
        description: `${authorSectionsFound} author secties gevonden`,
        priority: 'medium',
        category: 'authority'
      });
    } else {
      findings.push({
        title: 'Ontbrekende author/team informatie',
        description: 'Website mist duidelijke informatie over wie er achter het bedrijf zit',
        priority: 'high',
        category: 'authority'
      });
    }
  }

  private analyzeExpertiseSignals($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    
    // Detect expertise indicators
    const expertisePatterns = [
      /\d+\s*jaar\s*(ervaring|experience)/gi,
      /gecertificeerd|certified|diploma|degree/gi,
      /award|prijs|winnaar|winner/gi,
      /specialist|expert|authority|guru/gi,
      /published|gepubliceerd|artikel|research/gi,
      /keynote|spreker|speaker|presentatie/gi
    ];

    let expertiseSignals = 0;
    expertisePatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) expertiseSignals += matches.length;
    });

    // Check for credentials
    const credentialPatterns = [
      /bachelor|master|phd|doctor/gi,
      /iso|certified|accredited/gi,
      /member|lid van|association/gi
    ];

    let credentials = 0;
    credentialPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) credentials += matches.length;
    });

    if (expertiseSignals >= 5 && credentials >= 2) {
      findings.push({
        title: 'Sterke expertise signalen',
        description: `${expertiseSignals} expertise mentions, ${credentials} credentials gevonden`,
        priority: 'low',
        category: 'authority'
      });
    } else if (expertiseSignals >= 2 || credentials >= 1) {
      findings.push({
        title: 'Beperkte expertise signalen',
        description: `${expertiseSignals} expertise mentions gevonden`,
        priority: 'medium',
        category: 'authority'
      });
    } else {
      findings.push({
        title: 'Ontbrekende expertise signalen',
        description: 'Website toont geen duidelijke expertise indicators',
        priority: 'high',
        category: 'authority'
      });
    }
  }

  private analyzeQuoteableContent($: cheerio.CheerioAPI, findings: Finding[]): void {
    const paragraphs = $('p');
    let quoteableStatements = 0;
    let shortImpactfulSentences = 0;

    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      
      // Skip very short or long paragraphs
      if (text.length < 30 || text.length > 300) return;
      
      // Check for quoteable patterns
      const quoteablePatterns = [
        /^".*"$/,  // Already in quotes
        /^(het belangrijkste is|the key is|essential is)/i,
        /^(wij geloven|we believe|our philosophy)/i,
        /^(de toekomst|the future|success requires)/i,
        /^\d+%\s+van/i,  // Statistics
        /^(studies tonen|research shows|proven that)/i
      ];

      if (quoteablePatterns.some(pattern => pattern.test(text))) {
        quoteableStatements++;
      }

      // Check for impact statements
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      sentences.forEach(sentence => {
        sentence = sentence.trim();
        if (sentence.length >= 20 && sentence.length <= 100) {
          const impactWords = ['succesvol', 'uniek', 'expert', 'bewezen', 'resultaat', 'transformatie'];
          if (impactWords.some(word => sentence.toLowerCase().includes(word))) {
            shortImpactfulSentences++;
          }
        }
      });
    });

    if (quoteableStatements >= 5 && shortImpactfulSentences >= 8) {
      findings.push({
        title: 'Uitstekende quoteable content',
        description: `${quoteableStatements} quoteable statements en ${shortImpactfulSentences} impactful zinnen`,
        priority: 'low',
        category: 'citation-potential'
      });
    } else if (quoteableStatements >= 2 || shortImpactfulSentences >= 4) {
      findings.push({
        title: 'Beperkte quoteable content',
        description: `${quoteableStatements} quoteable statements gevonden`,
        priority: 'medium',
        category: 'citation-potential'
      });
    } else {
      findings.push({
        title: 'Ontbrekende quoteable content',
        description: 'Website mist korte, krachtige statements die AI kan citeren',
        priority: 'high',
        category: 'citation-potential'
      });
    }
  }

  private analyzeAuthorityMarkers($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    
    // Check for media mentions
    const mediaPatterns = [
      /featured in|vermeld in|appeared on/gi,
      /interview|artikel|publicatie/gi,
      /tv|radio|podcast|nieuwsuur/gi,
      /nos|rtl|bbc|cnn/gi
    ];

    let mediaSignals = 0;
    mediaPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) mediaSignals += matches.length;
    });

    // Check for client logos/names
    const clientPatterns = [
      /klanten|clients|partners/gi,
      /samenwerking|collaboration/gi,
      /fortune|top\s*\d+/gi
    ];

    let clientSignals = 0;
    clientPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) clientSignals += matches.length;
    });

    // Check for industry recognition
    const recognitionPatterns = [
      /award|prijs|winnaar|nominated/gi,
      /best|top|leading|#1/gi,
      /recognized|erkend|known for/gi
    ];

    let recognitionSignals = 0;
    recognitionPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) recognitionSignals += matches.length;
    });

    const totalAuthoritySignals = mediaSignals + clientSignals + recognitionSignals;

    if (totalAuthoritySignals >= 8) {
      findings.push({
        title: 'Sterke authority markers',
        description: `${totalAuthoritySignals} authority signals: ${mediaSignals} media, ${clientSignals} clients, ${recognitionSignals} recognition`,
        priority: 'low',
        category: 'authority'
      });
    } else if (totalAuthoritySignals >= 3) {
      findings.push({
        title: 'Beperkte authority markers',
        description: `${totalAuthoritySignals} authority signals gevonden`,
        priority: 'medium',
        category: 'authority'
      });
    } else {
      findings.push({
        title: 'Ontbrekende authority markers',
        description: 'Website toont weinig external validation',
        priority: 'medium',
        category: 'authority'
      });
    }
  }

  private analyzeBusinessTransparency($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    
    // Check for contact information
    const contactElements = [
      'email', 'telefoon', 'phone', 'address', 'adres',
      'contact', 'kvk', 'btw', 'vat', 'chamber of commerce'
    ];

    let contactSignals = 0;
    contactElements.forEach(element => {
      if (bodyText.includes(element)) contactSignals++;
    });

    // Check for business registration info
    const businessPatterns = [
      /kvk\s*:?\s*\d+/gi,
      /btw\s*:?\s*[a-z]{2}\d+/gi,
      /established|opgericht|since\s*\d{4}/gi,
      /registered|geregistreerd/gi
    ];

    let businessInfoSignals = 0;
    businessPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) businessInfoSignals += matches.length;
    });

    const transparencyScore = contactSignals + businessInfoSignals;

    if (transparencyScore >= 8) {
      findings.push({
        title: 'Uitstekende business transparantie',
        description: `${transparencyScore} transparency signals: contact info, business details`,
        priority: 'low',
        category: 'transparency'
      });
    } else if (transparencyScore >= 4) {
      findings.push({
        title: 'Beperkte business transparantie',
        description: `${transparencyScore} transparency signals gevonden`,
        priority: 'medium',
        category: 'transparency'
      });
    } else {
      findings.push({
        title: 'Ontbrekende business transparantie',
        description: 'Website mist essentiële bedrijfsinformatie',
        priority: 'high',
        category: 'transparency'
      });
    }
  }

  private calculateScore(findings: Finding[]): number {
    let score = 100;
    
    for (const finding of findings) {
      if (finding.priority === 'high') {
        score -= 20;
      } else if (finding.priority === 'medium') {
        score -= 10;
      } else if (finding.priority === 'low') {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
}