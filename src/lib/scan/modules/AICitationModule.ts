import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';
import { normalizeUrl } from '../../utils.js';

export class AICitationModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string, html?: string, $?: cheerio.CheerioAPI): Promise<ModuleResult> {
    try {
      // Use provided content or fetch (backward compatibility)
      const normalizedUrl = normalizeUrl(url);
      const actualHtml = html || await fetch(normalizedUrl).then(r => r.text());
      const actual$ = $ || cheerio.load(actualHtml || '');
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('AICitation');
      
      const findings = await this.analyzeAICitation(actual$, actualHtml || '', config);
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
    const authorEvidence: string[] = []; // Phase 1.2: Collect evidence

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
        category: 'authority',
        evidence: authorEvidence.slice(0, 3),
        suggestion: 'Uitstekend! Deze autoriteit informatie helpt AI-assistenten je content betrouwbaar te beoordelen.'
      });
    } else if (authorSectionsFound >= 1 || professionalTitles >= 1) {
      findings.push({
        title: 'Beperkte author informatie',
        description: `${authorSectionsFound} author secties gevonden`,
        priority: 'medium',
        category: 'authority',
        evidence: authorEvidence.slice(0, 3),
        suggestion: 'Voeg meer teaminfo toe met functietitels en ervaring voor betere AI-autoriteit.'
      });
    } else {
      findings.push({
        title: 'Ontbrekende author/team informatie',
        description: 'Website mist duidelijke informatie over wie er achter het bedrijf zit',
        priority: 'high',
        category: 'authority',
        evidence: [],
        suggestion: 'Voeg een "Over ons" sectie toe met namen, functietitels, en korte bio\'s van teamleden.'
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
    const foundRecognition: string[] = [];
    recognitionPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) {
        recognitionSignals += matches.length;
        foundRecognition.push(...matches.slice(0, 3)); // Limit per pattern
      }
    });

    const totalAuthoritySignals = mediaSignals + clientSignals + recognitionSignals;

    // Calculate weighted authority score
    const authorityScore = (mediaSignals * 3) + (clientSignals * 2) + (recognitionSignals * 1);
    const benchmark = authorityScore >= 20 ? 'sterk' : authorityScore >= 10 ? 'gemiddeld' : 'zwak';

    // Build concrete examples
    const authorityExamples: string[] = [];
    if (mediaSignals > 0) authorityExamples.push(`${mediaSignals} media vermeldingen`);
    if (clientSignals > 0) authorityExamples.push(`${clientSignals} klant referenties`);
    if (recognitionSignals > 0) authorityExamples.push(`${recognitionSignals} awards/erkenningen`);

    if (totalAuthoritySignals >= 8) {
      findings.push({
        title: 'Sterke Authoriteit Signalen',
        description: `Uitstekende authoriteit met ${authorityExamples.join(', ')}. ${foundRecognition.length > 0 ? `Gevonden termen: ${foundRecognition.slice(0, 3).join(', ')}${foundRecognition.length > 3 ? '...' : ''}. ` : ''}Dit versterkt je geloofwaardigheid bij AI-assistenten.`,
        priority: 'low',
        category: 'authority',
        metrics: {
          score: authorityScore,
          benchmark: benchmark,
          breakdown: {
            media: mediaSignals,
            clients: clientSignals,
            recognition: recognitionSignals
          }
        }
      });
    } else if (totalAuthoritySignals >= 3) {
      findings.push({
        title: 'Beperkte Authoriteit Signalen',
        description: `Gevonden: ${authorityExamples.join(', ')}. Voeg meer client testimonials, media vermeldingen of awards toe om je authoriteit te versterken voor AI-citaties.`,
        priority: 'medium',
        category: 'authority',
        metrics: {
          score: authorityScore,
          benchmark: benchmark,
          breakdown: {
            media: mediaSignals,
            clients: clientSignals,
            recognition: recognitionSignals
          }
        }
      });
    } else {
      findings.push({
        title: 'Ontbrekende Authoriteit Signalen',
        description: 'Website mist externe validatie zoals klant testimonials, media vermeldingen of industry awards. Dit schaadt je geloofwaardigheid bij AI-assistenten.',
        priority: 'medium',
        category: 'authority',
        metrics: {
          score: authorityScore,
          benchmark: benchmark,
          breakdown: {
            media: mediaSignals,
            clients: clientSignals,
            recognition: recognitionSignals
          }
        }
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

    // Create detailed findings with specific information
    const foundContactElements = contactElements.filter(element => bodyText.includes(element));
    
    if (transparencyScore >= 8) {
      findings.push({
        title: 'Uitstekende Business Transparantie',
        description: `Gevonden contact elementen: ${foundContactElements.slice(0, 5).join(', ')}${foundContactElements.length > 5 ? ` en ${foundContactElements.length - 5} meer` : ''}. Dit helpt met lokale SEO, vertrouwensopbouw en gebruikerservaring.`,
        priority: 'low',
        category: 'transparency'
      });
    } else if (transparencyScore >= 4) {
      findings.push({
        title: 'Beperkte Business Transparantie',
        description: `Gevonden: ${foundContactElements.slice(0, 3).join(', ')}${foundContactElements.length > 3 ? ` en ${foundContactElements.length - 3} meer` : ''}. Voeg meer contactinformatie toe zoals telefoonnummer, adres en KVK-nummer voor betere SEO.`,
        priority: 'medium',
        category: 'transparency'
      });
    } else {
      findings.push({
        title: 'Ontbrekende Business Transparantie',
        description: 'Website mist essentiële bedrijfsinformatie zoals contactgegevens, adres, telefoonnummer en KVK-nummer. Dit schaadt de geloofwaardigheid en lokale SEO.',
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