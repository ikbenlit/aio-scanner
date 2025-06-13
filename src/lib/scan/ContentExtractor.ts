import * as cheerio from 'cheerio';

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

/**
 * ContentExtractor - Centrale utility voor gestructureerde content sampling
 * Voor gebruik in AI-enhanced scan modules
 */
export class ContentExtractor {
  
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
   * Hoofdmethode: extraheert alle content samples
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