import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';
import { normalizeUrl } from '../../utils.js';

export class AIContentModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string, html?: string, $?: cheerio.CheerioAPI): Promise<ModuleResult> {
    try {
      // Use provided content or fetch (backward compatibility)
      const normalizedUrl = normalizeUrl(url);
      const actualHtml = html || await fetch(normalizedUrl).then(r => r.text());
      const actual$ = $ || cheerio.load(actualHtml || '');
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('AIContent');
      
      const findings = await this.analyzeAIContent(actual$, actualHtml || '', config);
      const score = this.calculateScore(findings);

      return {
        name: 'AIContent',
        score,
        findings
      };
    } catch (error) {
      return {
        name: 'AIContent',
        score: 0,
        findings: [
          {
            title: 'Module Error',
            description: `AI Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            priority: 'high',
            category: 'system'
          }
        ]
      };
    }
  }

  private async analyzeAIContent($: cheerio.CheerioAPI, html: string, config: PatternConfig): Promise<Finding[]> {
    const findings: Finding[] = [];

    // 1. Use PatternMatcher for basic pattern detection
    const signals = this.patternMatcher.matchPatterns(html, $, config);
    const patternFindings = this.patternMatcher.toFindings(signals, 'AIContent');
    findings.push(...patternFindings);

    // 2. Custom analysis that requires complex logic
    this.analyzeFAQSections($, findings);
    this.analyzeConversationalTone($, findings);
    this.analyzeEducationalContent($, findings);
    this.analyzeDirectAnswers($, findings);
    this.analyzeQuestionPatterns($, findings);

    return findings;
  }

  private analyzeFAQSections($: cheerio.CheerioAPI, findings: Finding[]): void {
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
    const faqEvidence: string[] = []; // Phase 1.2: Collect evidence

    // Check for explicit FAQ sections
    faqSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        faqSectionsFound += elements.length;
        
        // Count questions within FAQ sections AND collect evidence
        elements.each((_, element) => {
          const text = $(element).text();
          const questionMatches = text.match(/\?/g);
          if (questionMatches) {
            questionsFound += questionMatches.length;
            
            // Extract contextual evidence (max 3)
            if (faqEvidence.length < 3) {
              const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
              if (sentences.length > 0) {
                faqEvidence.push(sentences[0].trim().substring(0, 150) + '...');
              }
            }
          }
        });
      }
    });

    // Check for question patterns in headings
    const headings = $('h1, h2, h3, h4, h5, h6');
    let questionHeadings = 0;
    const foundQuestions: string[] = [];
    
    headings.each((_, heading) => {
      const text = $(heading).text().trim();
      const questionPatterns = [
        /^(wat|hoe|waarom|wanneer|waar|welke|wie)\s/i,
        /^(what|how|why|when|where|which|who)\s/i,
        /\?$/
      ];
      
      if (questionPatterns.some(pattern => pattern.test(text))) {
        questionHeadings++;
        if (foundQuestions.length < 3) { // Limit examples
          foundQuestions.push(text);
        }
        // Also add to evidence if we don't have enough yet
        if (faqEvidence.length < 3) {
          faqEvidence.push(`Heading: "${text}"`);
        }
      }
    });

    // Evaluate findings
    if (faqSectionsFound > 0 || questionHeadings >= 3) {
      const exampleText = foundQuestions.length > 0 
        ? ` Voorbeelden: "${foundQuestions.slice(0, 2).join('", "')}".` 
        : '';
      
      findings.push({
        title: 'FAQ Content: Uitstekend',
        description: `${faqSectionsFound} FAQ secties en ${questionHeadings} vraag-koppen gevonden.${exampleText} FAQ content is ideaal voor AI-citaties en verbetert de kans dat je website wordt gebruikt als bron.`,
        priority: 'low',
        category: 'ai-content',
        evidence: faqEvidence.slice(0, 3),
        suggestion: 'Behoud deze sterke FAQ structuur en voeg regelmatig nieuwe vragen toe gebaseerd op klantvragen.'
      });

      if (questionsFound >= 5) {
        findings.push({
          title: 'Uitgebreide FAQ Content: Ideaal voor AI',
          description: `${questionsFound} vragen gevonden in FAQ secties. Dit uitgebreide vraag-antwoord format is perfect voor AI-assistenten om te citeren bij gebruikersvragen.`,
          priority: 'low',
          category: 'ai-content',
          evidence: faqEvidence.slice(0, 3),
          suggestion: 'Structureer antwoorden met korte, directe alinea\'s voor optimale AI-leesbaarheid.'
        });
      }
    } else if (questionHeadings >= 1) {
      const exampleText = foundQuestions.length > 0 
        ? ` Gevonden: "${foundQuestions[0]}".` 
        : '';
      
      findings.push({
        title: 'FAQ Content: Beperkt',
        description: `Slechts ${questionHeadings} vraag-koppen gevonden.${exampleText} Voeg meer FAQ content toe om beter vindbaar te worden door AI-assistenten.`,
        priority: 'medium',
        category: 'ai-content',
        evidence: foundQuestions.length > 0 ? [`"${foundQuestions[0]}"`] : [],
        suggestion: 'Creëer een volledige FAQ sectie met minimaal 5-10 veel voorkomende klantvragen en duidelijke antwoorden.'
      });
    } else {
      findings.push({
        title: 'FAQ Content: Ontbrekend',
        description: 'Website mist vraag-antwoord content die AI-assistenten kunnen citeren. Voeg een FAQ sectie toe met vragen zoals "Wat doet [bedrijf]?" of "Hoe werkt [service]?".',
        priority: 'high',
        category: 'ai-content',
        evidence: [], // No evidence as content is missing
        suggestion: 'Start met 5 basale FAQ items: "Wat doen wij?", "Hoe werkt onze service?", "Wat zijn de kosten?", "Hoe neem ik contact op?", "Waar zijn jullie gevestigd?".'
      });
    }
  }

  private analyzeConversationalTone($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    const originalText = $('body').text(); // Keep original for evidence
    const wordCount = bodyText.split(/\s+/).length;
    
    if (wordCount < 50) {
      findings.push({
        title: 'Te weinig content voor analyse',
        description: 'Onvoldoende tekst om conversational tone te beoordelen',
        priority: 'low',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Voeg meer content toe (minimaal 100 woorden) voor een volledige tone analyse.'
      });
      return;
    }

    // Phase 1.2: Collect evidence examples
    const toneEvidence: string[] = [];

    // Detect personal pronouns (conversational indicators)
    const personalPronouns = ['je ', 'jij ', 'jouw ', 'jullie ', 'u ', 'you ', 'your ', 'we ', 'wij ', 'ons '];
    const pronounMatches = personalPronouns.reduce((count, pronoun) => {
      const matches = bodyText.match(new RegExp(pronoun, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Collect evidence of conversational language
    const sentences = originalText.split(/[.!?]/).filter(s => s.trim().length > 20);
    for (const sentence of sentences) {
      if (toneEvidence.length >= 3) break;
      const lowerSentence = sentence.toLowerCase();
      if (personalPronouns.some(pronoun => lowerSentence.includes(pronoun))) {
        toneEvidence.push(`"${sentence.trim().substring(0, 120)}..."`);  
      }
    }

    // Detect formal/corporate language
    const corporateTerms = ['klanten', 'gebruikers', 'organisatie', 'bedrijf', 'dienstverlening', 'oplossingen'];
    const corporateMatches = corporateTerms.reduce((count, term) => {
      const matches = bodyText.match(new RegExp(term, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Detect question marks (engagement indicators)
    const questionMarks = (bodyText.match(/\?/g) || []).length;

    // Calculate conversational score
    const conversationalScore = Math.min(100, 
      (pronounMatches * 10) + 
      (questionMarks * 5) - 
      (corporateMatches * 2)
    );

    if (conversationalScore >= 70) {
      findings.push({
        title: 'Conversational tone gedetecteerd',
        description: `Goede balans tussen persoonlijke en professionele taal (score: ${conversationalScore})`,
        priority: 'low',
        category: 'ai-content',
        evidence: toneEvidence.slice(0, 3),
        suggestion: 'Behoud deze persoonlijke toon - dit helpt AI-assistenten om je content natuurlijker te citeren.',
        metrics: {
          score: conversationalScore,
          benchmark: 'boven gemiddeld',
          details: {
            pronouns: pronounMatches,
            questions: questionMarks,
            corporate: corporateMatches
          }
        }
      });
    } else if (conversationalScore >= 40) {
      findings.push({
        title: 'Gematigd conversational tone',
        description: `Toon kan persoonlijker (score: ${conversationalScore})`,
        priority: 'medium',
        category: 'ai-content',
        evidence: toneEvidence.slice(0, 3),
        suggestion: 'Gebruik meer persoonlijke voornaamwoorden ("je", "we", "jouw") en stel directe vragen om conversationeler te worden.',
        metrics: {
          score: conversationalScore,
          benchmark: 'gemiddeld',
          details: {
            pronouns: pronounMatches,
            questions: questionMarks,
            corporate: corporateMatches
          }
        }
      });
    } else {
      findings.push({
        title: 'Te formele/corporate toon',
        description: `Content is te formeel voor AI-assistenten (score: ${conversationalScore})`,
        priority: 'high',
        category: 'ai-content',
        evidence: toneEvidence.length > 0 ? toneEvidence.slice(0, 3) : ['Geen conversational voorbeelden gevonden'],
        suggestion: 'Herschrijf formele zinnen naar persoonlijke taal: "Wij bieden" → "We helpen je met", "Onze organisatie" → "Ons team".',
        metrics: {
          score: conversationalScore,
          benchmark: 'onder gemiddeld',
          details: {
            pronouns: pronounMatches,
            questions: questionMarks,
            corporate: corporateMatches
          }
        }
      });
    }
  }

  private analyzeEducationalContent($: cheerio.CheerioAPI, findings: Finding[]): void {
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

    // Check for lists
    const totalListItems = $('li').length;

    const educationalScore = stepMatches + howToMatches + (totalListItems * 0.5);

    if (educationalScore >= 10) {
      findings.push({
        title: 'Sterke educationele content structuur',
        description: `${stepMatches} stappen, ${totalListItems} lijst items, ${howToMatches} how-to patterns`,
        priority: 'low',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Behoud deze duidelijke structuur - voeg indien mogelijk nummering en bullets toe voor betere AI-parsing.'
      });
    } else if (educationalScore >= 5) {
      findings.push({
        title: 'Beperkte educationele structuur',
        description: 'Content heeft enige structuur maar kan beter',
        priority: 'medium',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Voeg meer genummerde stappen en "hoe-te" secties toe voor betere AI-begrijpbaarheid.'
      });
    } else {
      findings.push({
        title: 'Ontbrekende educationele structuur',
        description: 'Content mist duidelijke structuur die AI-assistenten kunnen gebruiken',
        priority: 'high',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Structureer content met duidelijke stappen: "Stap 1:", "Vervolgens:", "Ten slotte:" voor betere AI-interpretatie.'
      });
    }
  }

  private analyzeDirectAnswers($: cheerio.CheerioAPI, findings: Finding[]): void {
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
        title: 'Uitstekende directe antwoorden',
        description: `${directAnswers} directe antwoorden en ${shortAnswers} concise verklaringen`,
        priority: 'low',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Behoud deze directe antwoordstijl - dit is ideaal voor AI-citaties.'
      });
    } else if (directAnswers >= 1 || shortAnswers >= 3) {
      findings.push({
        title: 'Beperkte directe antwoorden',
        description: `${directAnswers} directe antwoorden gevonden`,
        priority: 'medium',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Begin paragrafen met directe antwoorden: "Ja, dit kost €X" of "Nee, dit is niet mogelijk omdat...".'
      });
    } else {
      findings.push({
        title: 'Ontbrekende directe antwoorden',
        description: 'Content geeft geen duidelijke, directe antwoorden op vragen',
        priority: 'high',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Herschrijf content om directe antwoorden te geven: start alinea\'s met "Ja", "Nee", "De prijs is", "Dit betekent".'
      });
    }
  }

  private analyzeQuestionPatterns($: cheerio.CheerioAPI, findings: Finding[]): void {
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

    if (questionMarks >= 10 && questionHeadings.length >= 3) {
      findings.push({
        title: 'Goede vraag-structuur',
        description: `${questionMarks} vragen totaal, ${questionHeadings.length} vraag-koppen`,
        priority: 'low',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Uitstekend! Behoud deze interactieve vraag-structuur voor optimale AI-engagement.'
      });
    } else if (questionMarks >= 5) {
      findings.push({
        title: 'Beperkte vraag-structuur',
        description: `${questionMarks} vragen gevonden, meer zou beter zijn`,
        priority: 'medium',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Voeg meer retorische vragen toe in headings en content om engagement te verhogen.'
      });
    } else {
      findings.push({
        title: 'Weinig interactieve content',
        description: `Slechts ${questionMarks} vragen gevonden`,
        priority: 'medium',
        category: 'ai-content',
        evidence: [],
        suggestion: 'Maak content interactiever met vragen als "Wist je dat...?", "Heb je je afgevraagd...?", "Wat betekent dit voor jou?".'
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