import * as cheerio from 'cheerio';
import { normalizeUrl } from '../utils.js';

// Enhanced Content Extraction Types
export interface ContentSamples {
  timeSignals: TimeExpression[];
  qualityClaims: QualityClaim[];
  authorityMarkers: AuthorityMarker[];
  businessSignals: BusinessSignal[];
  questionPatterns?: string[];
  conversationalSignals?: string[];
  directAnswers?: string[];
}

export interface TimeExpression {
  text: string;
  matchedPattern: string;
  context: string;
  normalizedYears?: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface QualityClaim {
  text: string;
  claimType: 'quality' | 'satisfaction' | 'performance' | 'expertise';
  strength: 'weak' | 'moderate' | 'strong';
  context: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface AuthorityMarker {
  text: string;
  markerType: 'award' | 'recognition' | 'expertise' | 'heritage' | 'certification';
  context: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface BusinessSignal {
  text: string;
  signalType: 'transparency' | 'contact' | 'credentials' | 'location';
  context: string;
  confidence: 'low' | 'medium' | 'high';
}

// Enhanced Content Structure for Phase 3.1A
export interface EnhancedContent extends ContentSamples {
  contentQualityAssessment: ContentQualityAssessment;
  missedOpportunities: MissedOpportunity[];
  aiOptimizationHints: AIOptimizationHint[];
}

export interface ContentQualityAssessment {
  temporalClaims: TemporalClaim[];
  vagueStatements: VagueStatement[];
  unsupportedClaims: UnsupportedClaim[];
  overallQualityScore: number; // 0-100
}

export interface TemporalClaim {
  text: string;
  claimType: 'freshness' | 'currency' | 'timeliness';
  riskLevel: 'low' | 'medium' | 'high';
  context: string;
  suggestion: string;
}

export interface VagueStatement {
  text: string;
  vagueType: 'qualifier' | 'superlative' | 'unspecific';
  context: string;
  suggestion: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface UnsupportedClaim {
  text: string;
  claimType: 'statistic' | 'achievement' | 'capability';
  context: string;
  evidenceNeeded: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface MissedOpportunity {
  category: 'authority' | 'specificity' | 'evidence' | 'differentiation';
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface AIOptimizationHint {
  category: 'content_structure' | 'semantic_richness' | 'user_intent' | 'authority_building';
  description: string;
  priority: 'low' | 'medium' | 'high';
  aiReadinessScore: number; // 0-100 - how well content works with AI
}

/**
 * ContentExtractor - Centrale utility voor gestructureerde content sampling
 * Voor gebruik in AI-enhanced scan modules
 */
export class ContentExtractor {
  
  public async fetchContent(url: string): Promise<string> {
    try {
      const normalizedUrl = normalizeUrl(url);
      
      // Validate URL format
      try {
        new URL(normalizedUrl);
      } catch (urlError) {
        throw new Error(`Invalid URL format: ${normalizedUrl}`);
      }

      const response = await fetch(normalizedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${normalizedUrl}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      throw new Error(`Could not retrieve content from ${url}.`);
    }
  }
  
  // Time-based authority patterns (Nederlandse focus)
  private timePatterns = [
    // Nederlandse uitdrukkingen
    { pattern: /een\s+eeuw\s+lang/gi, normalizeYears: 100, confidence: 'high' as const },
    { pattern: /decennia\s+lang/gi, normalizeYears: 30, confidence: 'medium' as const },
    { pattern: /generaties?\s+lang/gi, normalizeYears: 75, confidence: 'medium' as const },
    { pattern: /al\s+(\d+)\s+jaar/gi, normalizeYears: 0, confidence: 'high' as const }, // Extract number
    
    // Specifieke jaren
    { pattern: /sinds\s+(\d{4})/gi, normalizeYears: 0, confidence: 'high' as const }, // Calculate from year
    { pattern: /opgericht\s+in\s+(\d{4})/gi, normalizeYears: 0, confidence: 'high' as const },
    { pattern: /established\s+(\d{4})/gi, normalizeYears: 0, confidence: 'medium' as const },
    { pattern: /founded\s+in\s+(\d{4})/gi, normalizeYears: 0, confidence: 'medium' as const },
    
    // Relatieve tijd
    { pattern: /meer\s+dan\s+(\d+)\s+jaar/gi, normalizeYears: 0, confidence: 'high' as const },
    { pattern: /ruim\s+(\d+)\s+jaar/gi, normalizeYears: 0, confidence: 'high' as const },
    { pattern: /over\s+(\d+)\s+years?/gi, normalizeYears: 0, confidence: 'medium' as const },
    
    // Heritage claims
    { pattern: /familiebedrijf/gi, normalizeYears: 25, confidence: 'medium' as const },
    { pattern: /family\s+business/gi, normalizeYears: 25, confidence: 'medium' as const },
    { pattern: /(\d+)e\s+generatie/gi, normalizeYears: 0, confidence: 'high' as const }, // Extract generation
  ];

  // Quality claim patterns
  private qualityPatterns = [
    // Basis kwaliteit
    { pattern: /heel\s+erg\s+goed/gi, type: 'quality' as const, strength: 'moderate' as const },
    { pattern: /erg\s+goed/gi, type: 'quality' as const, strength: 'moderate' as const },
    { pattern: /zeer\s+goed/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /uitstekend/gi, type: 'quality' as const, strength: 'strong' as const },
    
    // Premium termen
    { pattern: /excellent/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /premium/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /top\s+kwaliteit/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /hoogwaardige?/gi, type: 'quality' as const, strength: 'moderate' as const },
    
    // Comparatieve termen
    { pattern: /beste/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /nummer\s+1/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /leading/gi, type: 'quality' as const, strength: 'strong' as const },
    { pattern: /marktleider/gi, type: 'quality' as const, strength: 'strong' as const },
    
    // Satisfaction claims
    { pattern: /(\d+)%\s+tevreden/gi, type: 'satisfaction' as const, strength: 'strong' as const },
    { pattern: /veel\s+tevreden\s+klanten/gi, type: 'satisfaction' as const, strength: 'weak' as const },
    { pattern: /zeer\s+tevreden\s+klanten/gi, type: 'satisfaction' as const, strength: 'moderate' as const },
    
    // Performance claims
    { pattern: /(\d+)%\s+succes/gi, type: 'performance' as const, strength: 'strong' as const },
    { pattern: /bewezen\s+resultaten/gi, type: 'performance' as const, strength: 'moderate' as const },
    { pattern: /gegarandeerd\s+resultaat/gi, type: 'performance' as const, strength: 'strong' as const },
  ];

  // Authority marker patterns
  private authorityPatterns = [
    // Awards
    { pattern: /winnaar\s+van/gi, type: 'award' as const },
    { pattern: /gekozen\s+tot/gi, type: 'award' as const },
    { pattern: /award\s+winner/gi, type: 'award' as const },
    { pattern: /prijs\s+gewonnen/gi, type: 'award' as const },
    
    // Recognition
    { pattern: /erkend\s+door/gi, type: 'recognition' as const },
    { pattern: /geaccrediteerd/gi, type: 'recognition' as const },
    { pattern: /featured\s+in/gi, type: 'recognition' as const },
    { pattern: /vermeld\s+in/gi, type: 'recognition' as const },
    
    // Expertise
    { pattern: /specialist\s+in/gi, type: 'expertise' as const },
    { pattern: /expert\s+op/gi, type: 'expertise' as const },
    { pattern: /authority\s+on/gi, type: 'expertise' as const },
    { pattern: /thought\s+leader/gi, type: 'expertise' as const },
    { pattern: /(\d+)\s+jaar\s+ervaring/gi, type: 'expertise' as const },
    
    // Certifications
    { pattern: /gecertificeerd/gi, type: 'certification' as const },
    { pattern: /certified/gi, type: 'certification' as const },
    { pattern: /ISO\s+\d+/gi, type: 'certification' as const },
    { pattern: /keurmerk/gi, type: 'certification' as const },
  ];

  // Business transparency patterns
  private businessPatterns = [
    // Transparantie
    { pattern: /KvK\s*:?\s*\d+/gi, type: 'transparency' as const },
    { pattern: /BTW\s*:?\s*NL\d+/gi, type: 'transparency' as const },
    { pattern: /Chamber\s+of\s+Commerce/gi, type: 'transparency' as const },
    
    // Contact info
    { pattern: /\b\d{2,4}[-\s]?\d{6,7}\b/gi, type: 'contact' as const }, // Dutch phone
    { pattern: /\+31[-\s]?\d{1,3}[-\s]?\d{6,7}/gi, type: 'contact' as const }, // International
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, type: 'contact' as const },
    
    // Physical address
    { pattern: /\d{4}\s*[A-Z]{2}\s+[A-Za-z\s]+/gi, type: 'location' as const }, // Dutch postal code
    { pattern: /vestigingsadres/gi, type: 'location' as const },
    { pattern: /bezoekadres/gi, type: 'location' as const },
    
    // Credentials
    { pattern: /lid\s+van/gi, type: 'credentials' as const },
    { pattern: /member\s+of/gi, type: 'credentials' as const },
    { pattern: /aangesloten\s+bij/gi, type: 'credentials' as const },
  ];

  // FAQ and conversational patterns
  private questionPatterns = [
    /hoe\s+\w+/gi,
    /wat\s+is/gi,
    /waarom\s+\w+/gi,
    /wanneer\s+\w+/gi,
    /waar\s+\w+/gi,
    /welke?\s+\w+/gi,
    /kun\s+je/gi,
    /kunnen\s+wij/gi,
    /\?\s*$/gm // Questions ending with ?
  ];

  // Enhanced patterns for Phase 3.1A
  private temporalClaimPatterns = [
    { pattern: /nieuwste?/gi, type: 'freshness' as const, risk: 'high' as const },
    { pattern: /meest\s+recente?/gi, type: 'freshness' as const, risk: 'high' as const },
    { pattern: /up[\s-]?to[\s-]?date/gi, type: 'currency' as const, risk: 'high' as const },
    { pattern: /actueel/gi, type: 'currency' as const, risk: 'medium' as const },
    { pattern: /moderne?/gi, type: 'currency' as const, risk: 'medium' as const },
    { pattern: /hedendaags/gi, type: 'currency' as const, risk: 'medium' as const },
    { pattern: /vandaag\s+nog/gi, type: 'timeliness' as const, risk: 'high' as const },
    { pattern: /direct\s+beschikbaar/gi, type: 'timeliness' as const, risk: 'medium' as const },
    { pattern: /onmiddellijk/gi, type: 'timeliness' as const, risk: 'medium' as const }
  ];

  private vagueStatementPatterns = [
    { pattern: /zeer\s+veel/gi, type: 'qualifier' as const, suggestion: 'Specify exact number or percentage' },
    { pattern: /veel\s+klanten/gi, type: 'qualifier' as const, suggestion: 'Provide specific customer count' },
    { pattern: /grote\s+ervaring/gi, type: 'qualifier' as const, suggestion: 'Specify years of experience' },
    { pattern: /hoogste\s+kwaliteit/gi, type: 'superlative' as const, suggestion: 'Provide evidence or certification' },
    { pattern: /beste\s+service/gi, type: 'superlative' as const, suggestion: 'Include customer testimonials or ratings' },
    { pattern: /uitstekende?\s+resultaten/gi, type: 'superlative' as const, suggestion: 'Show specific case studies or metrics' },
    { pattern: /verschillende\s+opties/gi, type: 'unspecific' as const, suggestion: 'List specific options available' },
    { pattern: /ruime\s+keuze/gi, type: 'unspecific' as const, suggestion: 'Specify number of choices' },
    { pattern: /vele\s+mogelijkheden/gi, type: 'unspecific' as const, suggestion: 'Detail specific possibilities' }
  ];

  private unsupportedClaimPatterns = [
    { pattern: /(\d+)%\s+van\s+de\s+klanten/gi, type: 'statistic' as const, evidence: 'Customer satisfaction survey data' },
    { pattern: /marktleider/gi, type: 'achievement' as const, evidence: 'Market research report or industry ranking' },
    { pattern: /nummer\s+1\s+in/gi, type: 'achievement' as const, evidence: 'Third-party ranking or certification' },
    { pattern: /gegarandeerd\s+resultaat/gi, type: 'capability' as const, evidence: 'Terms and conditions or money-back guarantee' },
    { pattern: /(\d+)%\s+succes/gi, type: 'statistic' as const, evidence: 'Success rate methodology and case studies' },
    { pattern: /bewezen\s+methode/gi, type: 'capability' as const, evidence: 'Scientific studies or peer-reviewed research' }
  ];

  private conversationalSignals = [
    /hallo/gi,
    /dag\s+\w+/gi,
    /help\w*\s+je/gi,
    /kunnen\s+we\s+helpen/gi,
    /neem\s+contact\s+op/gi,
    /bel\s+ons/gi,
    /stuur\s+een\s+bericht/gi
  ];

  /**
   * Phase 3.1A: Enhanced Content Extraction
   * Combines existing patterns with advanced quality assessment
   */
  public extractEnhancedContent(html: string): EnhancedContent {
    const $ = cheerio.load(html);
    const fullText = $.text();
    
    // Get existing content samples
    const basicSamples = this.extractAllSamples(html);
    
    // Enhanced Phase 3.1A analysis
    const contentQualityAssessment = this.assessContentQuality(fullText);
    const missedOpportunities = this.identifyMissedOpportunities(fullText, basicSamples);
    const aiOptimizationHints = this.generateAIOptimizationHints(fullText, basicSamples);
    
    return {
      ...basicSamples,
      contentQualityAssessment,
      missedOpportunities,
      aiOptimizationHints
    };
  }

  /**
   * Hoofdmethode: extraheert alle content samples (behouden voor backwards compatibility)
   */
  public extractAllSamples(html: string): ContentSamples {
    const $ = cheerio.load(html);
    const fullText = $.text();

    return {
      timeSignals: this.extractTimeExpressions(fullText),
      qualityClaims: this.extractQualityClaims(fullText),
      authorityMarkers: this.extractAuthorityMarkers(fullText),
      businessSignals: this.extractBusinessSignals(fullText),
      questionPatterns: this.extractQuestionPatterns(fullText),
      conversationalSignals: this.extractConversationalSignals(fullText),
      directAnswers: this.extractDirectAnswers(fullText)
    };
  }

  /**
   * Extract time-based authority expressions
   */
  public extractTimeExpressions(text: string): TimeExpression[] {
    const expressions: TimeExpression[] = [];
    
    for (const { pattern, normalizeYears, confidence } of this.timePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const fullMatch = match[0];
        const context = this.extractContext(text, match.index || 0, 100);
        
        let calculatedYears = normalizeYears;
        
        // Extract numbers from match for dynamic calculation
        if (match[1]) {
          const number = parseInt(match[1], 10);
          if (!isNaN(number)) {
            if (pattern.source.includes('sinds|opgericht|established|founded')) {
              calculatedYears = new Date().getFullYear() - number;
            } else if (pattern.source.includes('generatie')) {
              calculatedYears = number * 25; // 25 years per generation
            } else {
              calculatedYears = number;
            }
          }
        }
        
        expressions.push({
          text: fullMatch,
          matchedPattern: pattern.source,
          context,
          normalizedYears: calculatedYears,
          confidence
        });
      }
    }
    
    return expressions;
  }

  /**
   * Extract quality claims
   */
  public extractQualityClaims(text: string): QualityClaim[] {
    const claims: QualityClaim[] = [];
    
    for (const { pattern, type, strength } of this.qualityPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const fullMatch = match[0];
        const context = this.extractContext(text, match.index || 0, 100);
        
        claims.push({
          text: fullMatch,
          claimType: type,
          strength,
          context,
          confidence: this.calculateConfidence(fullMatch, context)
        });
      }
    }
    
    return claims;
  }

  /**
   * Extract authority markers
   */
  public extractAuthorityMarkers(text: string): AuthorityMarker[] {
    const markers: AuthorityMarker[] = [];
    
    for (const { pattern, type } of this.authorityPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const fullMatch = match[0];
        const context = this.extractContext(text, match.index || 0, 100);
        
        markers.push({
          text: fullMatch,
          markerType: type,
          context,
          confidence: this.calculateConfidence(fullMatch, context)
        });
      }
    }
    
    return markers;
  }

  /**
   * Extract business signals
   */
  public extractBusinessSignals(text: string): BusinessSignal[] {
    const signals: BusinessSignal[] = [];
    
    for (const { pattern, type } of this.businessPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const fullMatch = match[0];
        const context = this.extractContext(text, match.index || 0, 100);
        
        signals.push({
          text: fullMatch,
          signalType: type,
          context,
          confidence: this.calculateConfidence(fullMatch, context)
        });
      }
    }
    
    return signals;
  }

  /**
   * Extract question patterns for FAQ detection
   */
  public extractQuestionPatterns(text: string): string[] {
    const questions: string[] = [];
    
    for (const pattern of this.questionPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 200);
        // Find the full sentence containing the question
        const sentence = this.extractSentence(context, match[0]);
        if (sentence && !questions.includes(sentence)) {
          questions.push(sentence);
        }
      }
    }
    
    return questions;
  }

  /**
   * Extract conversational signals
   */
  public extractConversationalSignals(text: string): string[] {
    const signals: string[] = [];
    
    for (const pattern of this.conversationalSignals) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 150);
        const sentence = this.extractSentence(context, match[0]);
        if (sentence && !signals.includes(sentence)) {
          signals.push(sentence);
        }
      }
    }
    
    return signals;
  }

  /**
   * Extract direct answer patterns
   */
  public extractDirectAnswers(text: string): string[] {
    const answers: string[] = [];
    
    // Look for direct statements that could be answers
    const directPatterns = [
      /wij\s+zijn\s+\w+/gi,
      /we\s+bieden\s+\w+/gi,
      /onze?\s+\w+\s+is\s+\w+/gi,
      /dit\s+betekent\s+\w+/gi,
      /het\s+antwoord\s+is\s+\w+/gi
    ];
    
    for (const pattern of directPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 200);
        const sentence = this.extractSentence(context, match[0]);
        if (sentence && sentence.length > 20 && !answers.includes(sentence)) {
          answers.push(sentence);
        }
      }
    }
    
    return answers;
  }

  /**
   * Helper: extract context around a match
   */
  private extractContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length / 2);
    const end = Math.min(text.length, index + length / 2);
    return text.substring(start, end).trim();
  }

  /**
   * Helper: extract full sentence containing a match
   */
  private extractSentence(context: string, match: string): string {
    const sentences = context.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(match.toLowerCase())) {
        return sentence.trim();
      }
    }
    return match;
  }

  /**
   * Helper: calculate confidence based on context
   */
  private calculateConfidence(match: string, context: string): 'low' | 'medium' | 'high' {
    // Simple confidence calculation based on context length and specificity
    if (context.length > 150 && /\d+/.test(match)) {
      return 'high';
    } else if (context.length > 75) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Phase 3.1A: Content Quality Assessment
   */
  private assessContentQuality(text: string): ContentQualityAssessment {
    const temporalClaims = this.extractTemporalClaims(text);
    const vagueStatements = this.extractVagueStatements(text);
    const unsupportedClaims = this.extractUnsupportedClaims(text);
    
    // Calculate overall quality score
    const totalIssues = temporalClaims.length + vagueStatements.length + unsupportedClaims.length;
    const textLength = text.length;
    const issueRatio = totalIssues / (textLength / 1000); // Issues per 1000 characters
    const overallQualityScore = Math.max(0, Math.min(100, 100 - (issueRatio * 10)));
    
    return {
      temporalClaims,
      vagueStatements,
      unsupportedClaims,
      overallQualityScore: Math.round(overallQualityScore)
    };
  }

  private extractTemporalClaims(text: string): TemporalClaim[] {
    const claims: TemporalClaim[] = [];
    
    for (const { pattern, type, risk } of this.temporalClaimPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 150);
        claims.push({
          text: match[0],
          claimType: type,
          riskLevel: risk,
          context,
          suggestion: this.getTemporalClaimSuggestion(type, match[0])
        });
      }
    }
    
    return claims;
  }

  private extractVagueStatements(text: string): VagueStatement[] {
    const statements: VagueStatement[] = [];
    
    for (const { pattern, type, suggestion } of this.vagueStatementPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 150);
        statements.push({
          text: match[0],
          vagueType: type,
          context,
          suggestion,
          confidence: this.calculateConfidence(match[0], context)
        });
      }
    }
    
    return statements;
  }

  private extractUnsupportedClaims(text: string): UnsupportedClaim[] {
    const claims: UnsupportedClaim[] = [];
    
    for (const { pattern, type, evidence } of this.unsupportedClaimPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const context = this.extractContext(text, match.index || 0, 150);
        claims.push({
          text: match[0],
          claimType: type,
          context,
          evidenceNeeded: evidence,
          confidence: this.calculateConfidence(match[0], context)
        });
      }
    }
    
    return claims;
  }

  /**
   * Phase 3.1A: Missed Opportunity Identification
   */
  private identifyMissedOpportunities(text: string, samples: ContentSamples): MissedOpportunity[] {
    const opportunities: MissedOpportunity[] = [];
    
    // Authority opportunities
    if (samples.authorityMarkers.length < 2) {
      opportunities.push({
        category: 'authority',
        description: 'Limited authority signals detected. Consider adding certifications, awards, or expertise indicators.',
        impact: 'high',
        suggestion: 'Add professional certifications, industry awards, or years of experience to build credibility.',
        implementationEffort: 'medium'
      });
    }
    
    // Specificity opportunities  
    if (samples.businessSignals.filter(s => s.signalType === 'transparency').length === 0) {
      opportunities.push({
        category: 'specificity',
        description: 'No transparency signals (KvK, BTW numbers) found.',
        impact: 'medium',
        suggestion: 'Include Chamber of Commerce registration and VAT numbers for trust building.',
        implementationEffort: 'low'
      });
    }
    
    // Evidence opportunities
    const hasStatistics = /\d+%/.test(text);
    if (!hasStatistics) {
      opportunities.push({
        category: 'evidence',
        description: 'No supporting statistics or metrics found.',
        impact: 'high',
        suggestion: 'Add concrete numbers, percentages, or measurable outcomes to support claims.',
        implementationEffort: 'medium'
      });
    }
    
    // Differentiation opportunities
    const competitorMentions = /concurrent|competitor|vs\.|versus/gi.test(text);
    if (!competitorMentions && samples.qualityClaims.filter(c => c.strength === 'strong').length > 2) {
      opportunities.push({
        category: 'differentiation',
        description: 'Strong quality claims without competitive differentiation.',
        impact: 'medium',
        suggestion: 'Explain what makes you different from competitors beyond general quality claims.',
        implementationEffort: 'high'
      });
    }
    
    return opportunities;
  }

  /**
   * Phase 3.1A: AI Optimization Hints
   */
  private generateAIOptimizationHints(text: string, samples: ContentSamples): AIOptimizationHint[] {
    const hints: AIOptimizationHint[] = [];
    
    // Content structure analysis
    const questionCount = samples.questionPatterns?.length || 0;
    if (questionCount < 3) {
      hints.push({
        category: 'content_structure',
        description: 'Limited FAQ-style content detected. AI systems favor question-answer formats.',
        priority: 'high',
        aiReadinessScore: 40
      });
    }
    
    // Semantic richness
    const semanticRichness = this.calculateSemanticRichness(text);
    if (semanticRichness < 0.6) {
      hints.push({
        category: 'semantic_richness',
        description: 'Content lacks semantic variety. Use more descriptive and contextual language.',
        priority: 'medium',
        aiReadinessScore: Math.round(semanticRichness * 100)
      });
    }
    
    // User intent alignment
    const hasConversationalSignals = (samples.conversationalSignals?.length || 0) > 0;
    if (!hasConversationalSignals) {
      hints.push({
        category: 'user_intent',
        description: 'No conversational signals detected. AI prefers natural, user-focused language.',
        priority: 'medium',
        aiReadinessScore: 30
      });
    }
    
    // Authority building for AI
    const authorityScore = this.calculateAuthorityScore(samples);
    if (authorityScore < 70) {
      hints.push({
        category: 'authority_building',
        description: 'Authority signals could be stronger for AI trust algorithms.',
        priority: 'high',
        aiReadinessScore: authorityScore
      });
    }
    
    return hints;
  }

  /**
   * Helper methods for Phase 3.1A
   */
  private getTemporalClaimSuggestion(type: 'freshness' | 'currency' | 'timeliness', claim: string): string {
    switch (type) {
      case 'freshness':
        return `Replace "${claim}" with specific dates or version numbers to avoid obsolescence.`;
      case 'currency':
        return `Replace "${claim}" with last-updated dates or specific time references.`;
      case 'timeliness':
        return `Replace "${claim}" with specific delivery timeframes or availability windows.`;
      default:
        return 'Consider using more specific, time-bound language.';
    }
  }

  private calculateSemanticRichness(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const vocabularyRichness = uniqueWords.size / words.length;
    
    // Combine metrics: vocabulary diversity + word complexity
    return (vocabularyRichness * 0.7) + ((averageWordLength - 3) / 10 * 0.3);
  }

  private calculateAuthorityScore(samples: ContentSamples): number {
    let score = 0;
    
    // Time-based authority (max 30 points)
    const maxTimeScore = Math.max(...samples.timeSignals.map(t => t.normalizedYears || 0));
    score += Math.min(30, maxTimeScore / 2);
    
    // Authority markers (max 40 points)
    score += Math.min(40, samples.authorityMarkers.length * 8);
    
    // Business signals trust (max 30 points)
    score += Math.min(30, samples.businessSignals.length * 6);
    
    return Math.round(score);
  }

  /**
   * For testing: extract specific pattern type
   */
  public extractSpecificPattern(text: string, patternType: 'time' | 'quality' | 'authority' | 'business'): any[] {
    switch (patternType) {
      case 'time':
        return this.extractTimeExpressions(text);
      case 'quality':
        return this.extractQualityClaims(text);
      case 'authority':
        return this.extractAuthorityMarkers(text);
      case 'business':
        return this.extractBusinessSignals(text);
      default:
        return [];
    }
  }
}