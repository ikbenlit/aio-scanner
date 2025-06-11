import * as cheerio from 'cheerio';
import type { ScanModule, ModuleResult, Finding, Recommendation, ScanMetadata } from '../types.js';

export class AICitationModule implements ScanModule {
  name = 'AI Citation';
  description = 'Analyseert authority signals en citatie-mogelijkheden voor AI-assistenten: author bio, expertise, quoteable content';
  category = 'ai-enhancement' as const;

  async analyze(url: string, html: string, metadata?: ScanMetadata): Promise<ModuleResult> {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    
    try {
      const $ = cheerio.load(html);
      const domain = metadata?.domain || new URL(url).hostname;

      // 1. Author Bio & Team Detection
      this.analyzeAuthorBio($, findings, recommendations);

      // 2. Expertise Signals
      this.analyzeExpertiseSignals($, findings, recommendations);

      // 3. Quoteable Content Analysis
      this.analyzeQuoteableContent($, findings, recommendations);

      // 4. Authority Markers
      this.analyzeAuthorityMarkers($, findings, recommendations);

      // 5. Contact & Business Transparency
      this.analyzeBusinessTransparency($, findings, recommendations);

      const score = this.calculateScore(findings);

      return {
        moduleName: this.name,
        score,
        status: 'completed',
        findings,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        metadata: {
          domain,
          totalChecks: findings.length,
          authoritySignals: this.countAuthoritySignals($)
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
          description: `AI Citation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          impact: 'high',
          category: 'system'
        }],
        recommendations: []
      };
    }
  }

  private analyzeAuthorBio($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
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
    let authorNames = 0;
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

    // Check for author names in headings and strong text
    const nameElements = $('h1, h2, h3, h4, strong, .name, .author-name');
    nameElements.each((_, element) => {
      const text = $(element).text().trim();
      // Simple heuristic: if it contains 2-3 words and doesn't look like a title
      if (text.split(' ').length >= 2 && text.split(' ').length <= 3 && 
          !/^(over|about|team|contact|services|diensten)/i.test(text)) {
        authorNames++;
      }
    });

    // Evaluate findings
    if (authorSectionsFound >= 2 && professionalTitles >= 3) {
      findings.push({
        type: 'success',
        title: 'Uitgebreide author/team informatie',
        description: `${authorSectionsFound} team secties met ${professionalTitles} professionele titels`,
        impact: 'low',
        category: 'authority'
      });
    } else if (authorSectionsFound >= 1 || professionalTitles >= 1) {
      findings.push({
        type: 'warning',
        title: 'Beperkte author informatie',
        description: `${authorSectionsFound} author secties gevonden`,
        impact: 'medium',
        category: 'authority'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Uitbreiden author/team informatie',
        description: 'AI-assistenten citeren websites met duidelijke expertise en author credentials',
        implementationSteps: [
          'Voeg een uitgebreide "Over ons" sectie toe',
          'Vermeld professionele titels en jaren ervaring',
          'Voeg foto\'s en korte bio\'s van team members toe',
          'Highlight relevante expertise en specialisaties'
        ],
        estimatedTime: '3-4 uur',
        expectedImpact: 'Hogere trust en authority voor AI-citaties',
        codeSnippet: `<section class="team">
  <h2>Ons Team</h2>
  <div class="team-member">
    <h3>Jan de Vries - CEO & Oprichter</h3>
    <p>15 jaar ervaring in AI consultancy...</p>
  </div>
</section>`
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende author/team informatie',
        description: 'Website mist duidelijke informatie over wie er achter het bedrijf zit',
        impact: 'high',
        category: 'authority'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer author credibility sectie',
        description: 'AI-assistenten hebben vertrouwen nodig in de bron van informatie',
        implementationSteps: [
          'Creëer een prominente "Over ons" pagina',
          'Voeg founder/team bio\'s toe met foto\'s',
          'Vermeld relevante ervaring en kwalificaties',
          'Highlight unieke expertise en specialisaties',
          'Voeg contact informatie en social links toe'
        ],
        estimatedTime: '4-6 uur',
        expectedImpact: 'Significant betere AI-citation authority',
        codeSnippet: `<section class="about-us">
  <h2>Over [Bedrijfsnaam]</h2>
  <div class="founder">
    <h3>[Naam] - Oprichter & Expert</h3>
    <p>Met [X] jaar ervaring in [specialisatie]...</p>
  </div>
</section>`
      });
    }
  }

  private analyzeExpertiseSignals($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
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

    // Check for certifications and credentials
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

    // Check for years of experience mentions
    const experienceMatches = bodyText.match(/(\d+)\s*jaar/gi);
    const maxExperience = experienceMatches ? 
      Math.max(...experienceMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'))) : 0;

    if (expertiseSignals >= 5 && credentials >= 2) {
      findings.push({
        type: 'success',
        title: 'Sterke expertise signalen',
        description: `${expertiseSignals} expertise mentions, ${credentials} credentials gevonden`,
        impact: 'low',
        category: 'authority'
      });

      if (maxExperience >= 10) {
        findings.push({
          type: 'success',
          title: 'Uitgebreide ervaring gedocumenteerd',
          description: `${maxExperience} jaar ervaring vermeld - excellent voor authority`,
          impact: 'low',
          category: 'authority'
        });
      }
    } else if (expertiseSignals >= 2 || credentials >= 1) {
      findings.push({
        type: 'warning',
        title: 'Beperkte expertise signalen',
        description: `${expertiseSignals} expertise mentions gevonden`,
        impact: 'medium',
        category: 'authority'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Versterken expertise signalen',
        description: 'Meer expertise indicators verhogen AI-citation authority',
        implementationSteps: [
          'Vermeld specifieke jaren ervaring',
          'Highlight certificeringen en diploma\'s',
          'Voeg awards en erkenningen toe',
          'Mention publicaties en spreekwerk',
          'Toon memberships van professionele organisaties'
        ],
        estimatedTime: '2-3 uur',
        expectedImpact: 'Hogere expertise perceptie door AI-systemen'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende expertise signalen',
        description: 'Website toont geen duidelijke expertise indicators',
        impact: 'high',
        category: 'authority'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer expertise showcase',
        description: 'AI-assistenten citeren bronnen met duidelijke expertise',
        implementationSteps: [
          'Voeg een "Expertise" sectie toe aan je homepage',
          'Documenteer jaren ervaring en specialisaties',
          'Toon certificeringen, awards en achievements',
          'Vermeld speaking engagements en publicaties',
          'Highlight unieke methodieken en successen'
        ],
        estimatedTime: '4-6 uur',
        expectedImpact: 'Dramatically betere authority voor AI-citaties'
      });
    }
  }

  private analyzeQuoteableContent($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const paragraphs = $('p');
    let quoteableStatements = 0;
    let shortImpactfulSentences = 0;
    const quotes: string[] = [];

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
        if (quotes.length < 3) quotes.push(text.substring(0, 100) + '...');
      }

      // Check for impact statements (short, punchy sentences)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      sentences.forEach(sentence => {
        sentence = sentence.trim();
        if (sentence.length >= 20 && sentence.length <= 100) {
          // Check if it contains impactful words
          const impactWords = ['succesvol', 'uniek', 'expert', 'bewezen', 'resultaat', 'transformatie'];
          if (impactWords.some(word => sentence.toLowerCase().includes(word))) {
            shortImpactfulSentences++;
          }
        }
      });
    });

    // Check for testimonials and case studies
    const testimonialSelectors = [
      '[class*="testimonial" i]',
      '[class*="review" i]',
      '[class*="case" i]',
      '[class*="success" i]'
    ];

    let testimonials = 0;
    testimonialSelectors.forEach(selector => {
      testimonials += $(selector).length;
    });

    if (quoteableStatements >= 5 && shortImpactfulSentences >= 8) {
      findings.push({
        type: 'success',
        title: 'Uitstekende quoteable content',
        description: `${quoteableStatements} quoteable statements en ${shortImpactfulSentences} impactful zinnen`,
        impact: 'low',
        category: 'citation-potential'
      });
    } else if (quoteableStatements >= 2 || shortImpactfulSentences >= 4) {
      findings.push({
        type: 'warning',
        title: 'Beperkte quoteable content',
        description: `${quoteableStatements} quoteable statements gevonden`,
        impact: 'medium',
        category: 'citation-potential'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Verbeteren quoteable content',
        description: 'AI-assistenten citeren korte, krachtige statements',
        implementationSteps: [
          'Schrijf korte, impactful statements (20-100 karakters)',
          'Voeg statistieken en concrete cijfers toe',
          'Creëer memorable quotes over je expertise',
          'Gebruik active voice en sterke werkwoorden',
          'Highlight unique value propositions'
        ],
        estimatedTime: '3-4 uur',
        expectedImpact: 'Hogere kans op directe AI-citaties'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende quoteable content',
        description: 'Website mist korte, krachtige statements die AI kan citeren',
        impact: 'high',
        category: 'citation-potential'
      });

      recommendations.push({
        priority: 'high',
        title: 'Creëer quoteable content strategie',
        description: 'AI-assistenten hebben korte, memorable statements nodig om te citeren',
        implementationSteps: [
          'Identificeer je kernboodschappen en unique insights',
          'Schrijf 10-15 korte, krachtige statements',
          'Voeg concrete statistieken en resultaten toe',
          'Creëer memorable quotes over industrie trends',
          'Highlight proven methodieken in quoteable format',
          'Test: "Is dit een zin die iemand zou citeren?"'
        ],
        estimatedTime: '4-6 uur',
        expectedImpact: 'Significant betere AI-citation potential'
      });
    }

    if (testimonials >= 3) {
      findings.push({
        type: 'success',
        title: 'Testimonials/case studies aanwezig',
        description: `${testimonials} testimonial/case study secties gevonden`,
        impact: 'low',
        category: 'social-proof'
      });
    }
  }

  private analyzeAuthorityMarkers($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
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
        type: 'success',
        title: 'Sterke authority markers',
        description: `${totalAuthoritySignals} authority signals: ${mediaSignals} media, ${clientSignals} clients, ${recognitionSignals} recognition`,
        impact: 'low',
        category: 'authority'
      });
    } else if (totalAuthoritySignals >= 3) {
      findings.push({
        type: 'warning',
        title: 'Beperkte authority markers',
        description: `${totalAuthoritySignals} authority signals gevonden`,
        impact: 'medium',
        category: 'authority'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Versterken authority markers',
        description: 'Media mentions en client recognitie verhogen AI-citation authority',
        implementationSteps: [
          'Voeg een "Media & Press" sectie toe',
          'Toon client logos en case studies',
          'Highlight awards en industry recognition',
          'Vermeld speaking engagements en conferenties',
          'Documenteer partnerships en collaborations'
        ],
        estimatedTime: '2-3 uur',
        expectedImpact: 'Betere trust signals voor AI-assistenten'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'Ontbrekende authority markers',
        description: 'Website toont weinig external validation',
        impact: 'medium',
        category: 'authority'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Ontwikkel authority marker strategie',
        description: 'External validation verhoogt credibility voor AI-citaties',
        implementationSteps: [
          'Verzamel media mentions en press coverage',
          'Vraag testimonials van bekende clients',
          'Apply voor industry awards en recognition',
          'Seek speaking opportunities op conferenties',
          'Build partnerships met recognized organizations'
        ],
        estimatedTime: '4-8 uur (ongoing)',
        expectedImpact: 'Langetermijn authority building voor AI-systemen'
      });
    }
  }

  private analyzeBusinessTransparency($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
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

    // Check for location information
    const locationPatterns = [
      /nederland|amsterdam|rotterdam|utrecht|den haag/gi,
      /netherlands|holland|europe/gi,
      /\d{4}\s*[a-z]{2}/gi  // Dutch postal codes
    ];

    let locationSignals = 0;
    locationPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) locationSignals += matches.length;
    });

    const transparencyScore = contactSignals + businessInfoSignals + locationSignals;

    if (transparencyScore >= 8) {
      findings.push({
        type: 'success',
        title: 'Uitstekende business transparantie',
        description: `${transparencyScore} transparency signals: contact info, business details, location`,
        impact: 'low',
        category: 'transparency'
      });
    } else if (transparencyScore >= 4) {
      findings.push({
        type: 'warning',
        title: 'Beperkte business transparantie',
        description: `${transparencyScore} transparency signals gevonden`,
        impact: 'medium',
        category: 'transparency'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Verbeteren business transparantie',
        description: 'AI-assistenten vertrouwen transparante businesses meer',
        implementationSteps: [
          'Voeg complete contactgegevens toe',
          'Vermeld KvK nummer en BTW nummer',
          'Toon bedrijfsadres en vestigingslocatie',
          'Voeg "Established since [jaar]" toe',
          'Link naar Google Maps of andere location services'
        ],
        estimatedTime: '1-2 uur',
        expectedImpact: 'Betere trust en local SEO voor AI-citaties'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende business transparantie',
        description: 'Website mist essentiële bedrijfsinformatie',
        impact: 'high',
        category: 'transparency'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer volledige business transparantie',
        description: 'Transparantie is cruciaal voor AI-assistant trust en citaties',
        implementationSteps: [
          'Creëer uitgebreide contact pagina',
          'Voeg alle wettelijk vereiste bedrijfsgegevens toe',
          'Toon duidelijk bedrijfsadres en contactmogelijkheden',
          'Vermeld registratie details (KvK, BTW)',
          'Voeg Google Maps embed toe voor locatie',
          'Link naar social media profiles'
        ],
        estimatedTime: '2-3 uur',
        expectedImpact: 'Fundamental trust building voor AI-systemen'
      });
    }
  }

  private countAuthoritySignals($: cheerio.CheerioAPI): number {
    const bodyText = $('body').text().toLowerCase();
    
    const allPatterns = [
      /\d+\s*jaar\s*(ervaring|experience)/gi,
      /award|prijs|winnaar/gi,
      /expert|specialist|authority/gi,
      /featured|vermeld|interview/gi,
      /certified|gecertificeerd/gi
    ];

    let totalSignals = 0;
    allPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) totalSignals += matches.length;
    });

    return totalSignals;
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