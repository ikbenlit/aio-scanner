import * as cheerio from 'cheerio';
import type { ModuleResult, Finding } from '../../types/scan';
import { PatternMatcher, type PatternConfig } from '../PatternMatcher';
import { PatternConfigLoader } from '../PatternConfigLoader';
import { normalizeUrl } from '../../utils.js';

export class AIContentModule {
  private patternMatcher = new PatternMatcher();
  private configLoader = PatternConfigLoader.getInstance();

  async execute(url: string): Promise<ModuleResult> {
    try {
      // Fetch website content
              const normalizedUrl = normalizeUrl(url);
        const response = await fetch(normalizedUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Load pattern configuration
      const config = await this.configLoader.loadConfig('AIContent');
      
      const findings = await this.analyzeAIContent($, html, config);
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
        title: 'FAQ Content: Uitstekend',
        description: `${faqSectionsFound} FAQ secties en ${questionHeadings} vraag-koppen gevonden. FAQ content is ideaal voor AI-citaties en verbetert de kans dat je website wordt gebruikt als bron in AI-antwoorden.`,
        priority: 'low',
        category: 'ai-content'
      });

      if (questionsFound >= 5) {
        findings.push({
          title: 'Uitgebreide FAQ Content: Ideaal voor AI',
          description: `${questionsFound} vragen gevonden. Dit uitgebreide vraag-antwoord format is perfect voor AI-assistenten om te citeren bij gebruikersvragen.`,
          priority: 'low',
          category: 'ai-content'
        });
      }
    } else if (questionHeadings >= 1) {
      findings.push({
        title: 'FAQ Content: Beperkt',
        description: `Slechts ${questionHeadings} vraag-koppen gevonden. Voeg meer FAQ content toe om beter vindbaar te worden door AI-assistenten.`,
        priority: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        title: 'FAQ Content: Ontbrekend',
        description: 'Website mist vraag-antwoord content die AI-assistenten kunnen citeren. Voeg een FAQ sectie toe om je vindbaarheidskansen te vergroten.',
        priority: 'high',
        category: 'ai-content'
      });
    }
  }

  private analyzeConversationalTone($: cheerio.CheerioAPI, findings: Finding[]): void {
    const bodyText = $('body').text().toLowerCase();
    const wordCount = bodyText.split(/\s+/).length;
    
    if (wordCount < 50) {
      findings.push({
        title: 'Te weinig content voor analyse',
        description: 'Onvoldoende tekst om conversational tone te beoordelen',
        priority: 'low',
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
        category: 'ai-content'
      });
    } else if (conversationalScore >= 40) {
      findings.push({
        title: 'Gematigd conversational tone',
        description: `Toon kan persoonlijker (score: ${conversationalScore})`,
        priority: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        title: 'Te formele/corporate toon',
        description: `Content is te formeel voor AI-assistenten (score: ${conversationalScore})`,
        priority: 'high',
        category: 'ai-content'
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
        category: 'ai-content'
      });
    } else if (educationalScore >= 5) {
      findings.push({
        title: 'Beperkte educationele structuur',
        description: 'Content heeft enige structuur maar kan beter',
        priority: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        title: 'Ontbrekende educationele structuur',
        description: 'Content mist duidelijke structuur die AI-assistenten kunnen gebruiken',
        priority: 'high',
        category: 'ai-content'
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
        category: 'ai-content'
      });
    } else if (directAnswers >= 1 || shortAnswers >= 3) {
      findings.push({
        title: 'Beperkte directe antwoorden',
        description: `${directAnswers} directe antwoorden gevonden`,
        priority: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        title: 'Ontbrekende directe antwoorden',
        description: 'Content geeft geen duidelijke, directe antwoorden op vragen',
        priority: 'high',
        category: 'ai-content'
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
        category: 'ai-content'
      });
    } else if (questionMarks >= 5) {
      findings.push({
        title: 'Beperkte vraag-structuur',
        description: `${questionMarks} vragen gevonden, meer zou beter zijn`,
        priority: 'medium',
        category: 'ai-content'
      });
    } else {
      findings.push({
        title: 'Weinig interactieve content',
        description: `Slechts ${questionMarks} vragen gevonden`,
        priority: 'medium',
        category: 'ai-content'
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