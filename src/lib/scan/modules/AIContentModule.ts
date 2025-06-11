import * as cheerio from 'cheerio';
import type { ScanModule, ModuleResult, Finding, Recommendation, ScanMetadata } from '../types.js';

export class AIContentModule implements ScanModule {
  name = 'AI Content';
  description = 'Analyseert content optimalisatie voor AI-assistenten: FAQ detectie, conversational tone, directe antwoorden';
  category = 'ai-enhancement' as const;

  async analyze(url: string, html: string, metadata?: ScanMetadata): Promise<ModuleResult> {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    
    try {
      const $ = cheerio.load(html);
      const domain = metadata?.domain || new URL(url).hostname;

      // 1. FAQ Section Detection
      this.analyzeFAQSections($, findings, recommendations);

      // 2. Conversational Tone Assessment
      this.analyzeConversationalTone($, findings, recommendations);

      // 3. Educational Content Structure
      this.analyzeEducationalContent($, findings, recommendations);

      // 4. Direct Answer Quality
      this.analyzeDirectAnswers($, findings, recommendations);

      // 5. Question-Answer Patterns
      this.analyzeQuestionPatterns($, findings, recommendations);

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
          contentLength: $('body').text().length
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
          description: `AI Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          impact: 'high',
          category: 'system'
        }],
        recommendations: []
      };
    }
  }

  private analyzeFAQSections($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    // Detect FAQ sections by common patterns
    const faqSelectors = [
      '[class*="faq" i]',
      '[id*="faq" i]',
      '[class*="veelgesteld" i]',
      '[id*="veelgesteld" i]',
      '[class*="questions" i]',
      '[class*="vragen" i]'
    ];

    let faqSectionsFound = 0;
    let questionsFound = 0;

    // Check for explicit FAQ sections
    faqSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        faqSectionsFound += elements.length;
        
        // Count questions within FAQ sections
        elements.each((_, element) => {
          const text = $(element).text();
          const questionMatches = text.match(/\?/g);
          if (questionMatches) {
            questionsFound += questionMatches.length;
          }
        });
      }
    });

    // Check for question patterns in headings
    const headings = $('h1, h2, h3, h4, h5, h6');
    let questionHeadings = 0;
    
    headings.each((_, heading) => {
      const text = $(heading).text().trim();
      const questionPatterns = [
        /^(wat|hoe|waarom|wanneer|waar|welke|wie)\s/i,
        /^(what|how|why|when|where|which|who)\s/i,
        /\?$/
      ];
      
      if (questionPatterns.some(pattern => pattern.test(text))) {
        questionHeadings++;
      }
    });

    // Evaluate findings
    if (faqSectionsFound > 0 || questionHeadings >= 3) {
      findings.push({
        type: 'success',
        title: 'FAQ content gedetecteerd',
        description: `${faqSectionsFound} FAQ secties en ${questionHeadings} vraag-koppen gevonden`,
        impact: 'low',
        category: 'ai-content'
      });

      if (questionsFound >= 5) {
        findings.push({
          type: 'success',
          title: 'Uitgebreide FAQ content',
          description: `${questionsFound} vragen gevonden - ideaal voor AI-citaties`,
          impact: 'low',
          category: 'ai-content'
        });
      }
    } else if (questionHeadings >= 1) {
      findings.push({
        type: 'warning',
        title: 'Beperkte FAQ content',
        description: `Slechts ${questionHeadings} vraag-koppen gevonden`,
        impact: 'medium',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Uitbreiden FAQ sectie',
        description: 'Voeg meer veelgestelde vragen toe voor betere AI-assistant detectie',
        implementationSteps: [
          'Identificeer de meest gestelde vragen van klanten',
          'Creëer een dedicated FAQ sectie op je website',
          'Gebruik duidelijke vraag-antwoord paren',
          'Structureer met H2/H3 kopjes voor elke vraag'
        ],
        estimatedTime: '2-3 uur',
        expectedImpact: 'Hogere kans op citatie door AI-assistenten',
        codeSnippet: `<section class="faq">
  <h2>Veelgestelde Vragen</h2>
  <div class="faq-item">
    <h3>Wat kost jullie service?</h3>
    <p>Onze service kost vanaf €99 per maand...</p>
  </div>
</section>`
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Geen FAQ content gevonden',
        description: 'Website mist vraag-antwoord content die AI-assistenten kunnen citeren',
        impact: 'high',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer FAQ sectie',
        description: 'AI-assistenten citeren websites met duidelijke vraag-antwoord structuren',
        implementationSteps: [
          'Verzamel de 10 meest gestelde vragen van klanten',
          'Schrijf duidelijke, directe antwoorden',
          'Gebruik een herkenbare FAQ sectie op je homepage',
          'Overweeg FAQ schema markup toe te voegen'
        ],
        estimatedTime: '4-6 uur',
        expectedImpact: 'Significant hogere kans op AI-assistant citaties',
        codeSnippet: `<section class="faq">
  <h2>Veelgestelde Vragen</h2>
  <div class="faq-item">
    <h3>Vraag hier?</h3>
    <p>Direct, helder antwoord...</p>
  </div>
</section>`
      });
    }
  }

  private analyzeConversationalTone($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const bodyText = $('body').text().toLowerCase();
    const wordCount = bodyText.split(/\s+/).length;
    
    if (wordCount < 50) {
      findings.push({
        type: 'warning',
        title: 'Te weinig content voor analyse',
        description: 'Onvoldoende tekst om conversational tone te beoordelen',
        impact: 'low',
        category: 'ai-content'
      });
      return;
    }

    // Detect personal pronouns (conversational indicators)
    const personalPronouns = ['je ', 'jij ', 'jouw ', 'jullie ', 'u ', 'you ', 'your ', 'we ', 'wij ', 'ons '];
    const pronounMatches = personalPronouns.reduce((count, pronoun) => {
      const matches = bodyText.match(new RegExp(pronoun, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Detect formal/corporate language
    const corporateTerms = ['klanten', 'gebruikers', 'organisatie', 'bedrijf', 'dienstverlening', 'oplossingen'];
    const corporateMatches = corporateTerms.reduce((count, term) => {
      const matches = bodyText.match(new RegExp(term, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Detect question marks (engagement indicators)
    const questionMarks = (bodyText.match(/\?/g) || []).length;

    // Detect casual language indicators
    const casualTerms = ['gewoon', 'eigenlijk', 'natuurlijk', 'simpelweg', 'makkelijk', 'handig'];
    const casualMatches = casualTerms.reduce((count, term) => {
      const matches = bodyText.match(new RegExp(term, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Calculate conversational score
    const conversationalScore = Math.min(100, 
      (pronounMatches * 10) + 
      (questionMarks * 5) + 
      (casualMatches * 3) - 
      (corporateMatches * 2)
    );

    if (conversationalScore >= 70) {
      findings.push({
        type: 'success',
        title: 'Conversational tone gedetecteerd',
        description: `Goede balans tussen persoonlijke en professionele taal (score: ${conversationalScore})`,
        impact: 'low',
        category: 'ai-content'
      });
    } else if (conversationalScore >= 40) {
      findings.push({
        type: 'warning',
        title: 'Gematigd conversational tone',
        description: `Toon kan persoonlijker (score: ${conversationalScore})`,
        impact: 'medium',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Maak content persoonlijker',
        description: 'AI-assistenten prefereren conversational content boven corporate speak',
        implementationSteps: [
          'Vervang "klanten" door "je" waar mogelijk',
          'Voeg meer vragen toe om engagement te verhogen',
          'Gebruik eenvoudige, directe taal',
          'Spreek de lezer rechtstreeks aan'
        ],
        estimatedTime: '2-4 uur',
        expectedImpact: 'Betere AI-assistant citatie kwalificatie'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Te formele/corporate toon',
        description: `Content is te formeel voor AI-assistenten (score: ${conversationalScore})`,
        impact: 'high',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'high',
        title: 'Transformeer naar conversational tone',
        description: 'AI-assistenten citeren websites die persoonlijk en toegankelijk schrijven',
        implementationSteps: [
          'Herschrijf corporate jargon naar eenvoudige taal',
          'Gebruik "je" en "jouw" in plaats van "klanten"',
          'Voeg praktische voorbeelden en verhalen toe',
          'Stel vragen aan de lezer',
          'Test met de vraag: "Zou ik dit zo tegen een vriend zeggen?"'
        ],
        estimatedTime: '6-8 uur',
        expectedImpact: 'Dramatically hogere kans op AI-citaties'
      });
    }
  }

  private analyzeEducationalContent($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const bodyText = $('body').text().toLowerCase();
    
    // Detect educational patterns
    const stepPatterns = [
      /stap\s*\d+/gi,
      /step\s*\d+/gi,
      /\d+\.\s/gi
    ];

    const stepMatches = stepPatterns.reduce((count, pattern) => {
      const matches = bodyText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // Detect how-to patterns
    const howToPatterns = [
      /hoe\s+(je|u|men)/gi,
      /how\s+to/gi,
      /zo\s+doe\s+je/gi,
      /handleiding/gi,
      /uitleg/gi
    ];

    const howToMatches = howToPatterns.reduce((count, pattern) => {
      const matches = bodyText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // Check for lists (ordered and unordered)
    const orderedLists = $('ol').length;
    const unorderedLists = $('ul').length;
    const totalListItems = $('li').length;

    // Process indicators
    const processWords = ['eerst', 'daarna', 'vervolgens', 'tenslotte', 'first', 'then', 'next', 'finally'];
    const processMatches = processWords.reduce((count, word) => {
      const matches = bodyText.match(new RegExp(`\\b${word}\\b`, 'gi'));
      return count + (matches ? matches.length : 0);
    }, 0);

    const educationalScore = stepMatches + howToMatches + (totalListItems * 0.5) + processMatches;

    if (educationalScore >= 10) {
      findings.push({
        type: 'success',
        title: 'Sterke educationele content structuur',
        description: `${stepMatches} stappen, ${totalListItems} lijst items, ${howToMatches} how-to patterns`,
        impact: 'low',
        category: 'ai-content'
      });
    } else if (educationalScore >= 5) {
      findings.push({
        type: 'warning',
        title: 'Beperkte educationele structuur',
        description: 'Content heeft enige structuur maar kan beter',
        impact: 'medium',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Verbeter content structuur',
        description: 'AI-assistenten prefereren gestructureerde, educationele content',
        implementationSteps: [
          'Voeg stap-voor-stap handleidingen toe',
          'Gebruik genummerde lijsten voor processen',
          'Structureer content met duidelijke koppen',
          'Voeg praktische voorbeelden toe'
        ],
        estimatedTime: '3-4 uur',
        expectedImpact: 'Betere AI-training data kwalificatie'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende educationele structuur',
        description: 'Content mist duidelijke structuur die AI-assistenten kunnen gebruiken',
        impact: 'high',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer educationele content structuur',
        description: 'Gestructureerde content wordt door AI-assistenten gebruikt voor training',
        implementationSteps: [
          'Creëer step-by-step guides voor je services',
          'Gebruik genummerde lijsten voor processen',
          'Voeg "Hoe werkt het?" secties toe',
          'Structureer informatie met bullet points',
          'Voeg voor/na voorbeelden toe'
        ],
        estimatedTime: '6-10 uur',
        expectedImpact: 'Hoge waarde voor AI-training datasets'
      });
    }
  }

  private analyzeDirectAnswers($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const paragraphs = $('p');
    let directAnswers = 0;
    let shortAnswers = 0;

    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      
      if (text.length < 20) return; // Skip very short paragraphs
      
      // Check if paragraph starts with direct answer patterns
      const directPatterns = [
        /^(ja|nee|inderdaad|zeker|natuurlijk),/i,
        /^(yes|no|absolutely|definitely),/i,
        /^(de prijs is|het kost|dat kost)/i,
        /^(the price is|it costs|that costs)/i,
        /^(dit betekent|dit houdt in|dit is)/i,
        /^(this means|this involves|this is)/i
      ];

      if (directPatterns.some(pattern => pattern.test(text))) {
        directAnswers++;
      }

      // Check for concise, complete sentences (good for AI)
      if (text.length >= 50 && text.length <= 200 && text.includes('.')) {
        shortAnswers++;
      }
    });

    if (directAnswers >= 3 && shortAnswers >= 5) {
      findings.push({
        type: 'success',
        title: 'Uitstekende directe antwoorden',
        description: `${directAnswers} directe antwoorden en ${shortAnswers} concise verklaringen`,
        impact: 'low',
        category: 'ai-content'
      });
    } else if (directAnswers >= 1 || shortAnswers >= 3) {
      findings.push({
        type: 'warning',
        title: 'Beperkte directe antwoorden',
        description: `${directAnswers} directe antwoorden gevonden`,
        impact: 'medium',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Voeg meer directe antwoorden toe',
        description: 'AI-assistenten prefereren korte, directe antwoorden boven lange uitleg',
        implementationSteps: [
          'Begin antwoorden met directe statements',
          'Gebruik korte zinnen (50-150 karakters)',
          'Geef concrete informatie zonder omhaal',
          'Beantwoord vragen in de eerste zin'
        ],
        estimatedTime: '2-3 uur',
        expectedImpact: 'Betere citatie kwaliteit door AI-assistenten'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Ontbrekende directe antwoorden',
        description: 'Content geeft geen duidelijke, directe antwoorden op vragen',
        impact: 'high',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'high',
        title: 'Implementeer directe antwoord strategie',
        description: 'AI-assistenten hebben directe, concrete antwoorden nodig',
        implementationSteps: [
          'Identificeer de hoofdvragen van je doelgroep',
          'Schrijf directe antwoorden van 1-2 zinnen',
          'Begin elk antwoord met de kernboodschap',
          'Vermijd lange inleidingen en omschrijvingen',
          'Test: "Beantwoordt de eerste zin de vraag volledig?"'
        ],
        estimatedTime: '4-6 uur',
        expectedImpact: 'Drastisch betere AI-assistant citatie kans'
      });
    }
  }

  private analyzeQuestionPatterns($: cheerio.CheerioAPI, findings: Finding[], recommendations: Recommendation[]): void {
    const bodyText = $('body').text();
    
    // Count total questions
    const questionMarks = (bodyText.match(/\?/g) || []).length;
    
    // Detect specific question patterns in headings
    const headings = $('h1, h2, h3, h4, h5, h6');
    const questionHeadings: string[] = [];
    
    headings.each((_, heading) => {
      const text = $(heading).text().trim();
      if (text.includes('?')) {
        questionHeadings.push(text);
      }
    });

    // Analyze question quality
    const goodQuestionPatterns = [
      /wat kost/i,
      /hoe lang duurt/i,
      /wanneer kan ik/i,
      /what does .* cost/i,
      /how long does/i,
      /when can i/i
    ];

    const qualityQuestions = questionHeadings.filter(q => 
      goodQuestionPatterns.some(pattern => pattern.test(q))
    ).length;

    if (questionMarks >= 10 && questionHeadings.length >= 3) {
      findings.push({
        type: 'success',
        title: 'Goede vraag-structuur',
        description: `${questionMarks} vragen totaal, ${questionHeadings.length} vraag-koppen`,
        impact: 'low',
        category: 'ai-content'
      });
    } else if (questionMarks >= 5) {
      findings.push({
        type: 'warning',
        title: 'Beperkte vraag-structuur',
        description: `${questionMarks} vragen gevonden, meer zou beter zijn`,
        impact: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        type: 'warning',
        title: 'Weinig interactieve content',
        description: `Slechts ${questionMarks} vragen gevonden`,
        impact: 'medium',
        category: 'ai-content'
      });

      recommendations.push({
        priority: 'medium',
        title: 'Voeg meer vragen toe',
        description: 'Vragen maken content interactiever en AI-vriendelijker',
        implementationSteps: [
          'Voeg retorische vragen toe in content',
          'Gebruik vragen als section headers',
          'Stel vragen die lezers herkennen',
          'Beantwoord vragen direct na het stellen'
        ],
        estimatedTime: '1-2 uur',
        expectedImpact: 'Betere engagement en AI-detectie'
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