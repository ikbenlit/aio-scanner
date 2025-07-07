import type { Finding } from '../types/scan';

export interface PatternConfig {
  selectors?: {
    [key: string]: {
      patterns: string[];
      description: string;
      impact: 'low' | 'medium' | 'high';
    };
  };
  regex?: {
    [key: string]: {
      patterns: string[];
      description: string;
      impact: 'low' | 'medium' | 'high';
      flags?: string;
    };
  };
  scoring?: {
    baseScore: number;
    deductions: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export interface DetectedSignal {
  type: 'selector' | 'regex';
  category: string;
  pattern: string;
  matches: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
  debugMeta?: {
    matchedElements?: string[];
    matchedText?: string[];
    selector?: string;
    regex?: string;
  };
}

export class PatternMatcher {
  private compiledRegex: Map<string, RegExp> = new Map();

  /**
   * Match patterns against HTML content using provided configuration
   */
  matchPatterns(html: string, $: any, config: PatternConfig): DetectedSignal[] {
    const signals: DetectedSignal[] = [];

    // Process selector patterns
    if (config.selectors) {
      for (const [category, selectorConfig] of Object.entries(config.selectors)) {
        const selectorSignals = this.matchSelectors($, category, selectorConfig);
        signals.push(...selectorSignals);
      }
    }

    // Process regex patterns
    if (config.regex) {
      for (const [category, regexConfig] of Object.entries(config.regex)) {
        const regexSignals = this.matchRegex(html, category, regexConfig);
        signals.push(...regexSignals);
      }
    }

    return signals;
  }

  /**
   * Convert detected signals to findings format
   */
  toFindings(signals: DetectedSignal[], moduleId: string): Finding[] {
    return signals.map(signal => ({
      title: this.generateFindingTitle(signal),
      description: this.generateFindingDescription(signal),
      priority: signal.impact,
      category: signal.category,
      impact: signal.impact,
      technicalDetails: signal.debugMeta ? JSON.stringify(signal.debugMeta, null, 2) : undefined
    }));
  }

  /**
   * Calculate standardized score based on detected signals
   */
  calculateScore(signals: DetectedSignal[], config: PatternConfig): number {
    const scoring = config.scoring || {
      baseScore: 100,
      deductions: { high: 15, medium: 10, low: 5 }
    };

    const totalDeduction = signals.reduce((sum, signal) => {
      return sum + scoring.deductions[signal.impact];
    }, 0);

    return Math.max(0, Math.min(100, scoring.baseScore - totalDeduction));
  }

  private matchSelectors($: any, category: string, config: any): DetectedSignal[] {
    const signals: DetectedSignal[] = [];

    for (const pattern of config.patterns) {
      try {
        const elements = $(pattern);
        const matchCount = elements.length;

        if (matchCount > 0) {
          const matchedElements: string[] = [];
          elements.each((_: number, el: any) => {
            const tagName = $(el).prop('tagName')?.toLowerCase() || 'unknown';
            const className = $(el).attr('class') || '';
            const id = $(el).attr('id') || '';
            matchedElements.push(`<${tagName}${id ? ` id="${id}"` : ''}${className ? ` class="${className}"` : ''}>`);
          });

          signals.push({
            type: 'selector',
            category,
            pattern,
            matches: matchCount,
            impact: config.impact,
            description: config.description,
            debugMeta: {
              matchedElements: matchedElements.slice(0, 5), // Limit to first 5 for readability
              selector: pattern
            }
          });
        }
      } catch (error) {
        console.warn(`Invalid selector pattern: ${pattern}`, error);
      }
    }

    return signals;
  }

  private matchRegex(html: string, category: string, config: any): DetectedSignal[] {
    const signals: DetectedSignal[] = [];

    for (const pattern of config.patterns) {
      try {
        const regex = this.getCompiledRegex(pattern, config.flags || 'gi');
        const matches = html.match(regex);
        const matchCount = matches ? matches.length : 0;

        if (matchCount > 0) {
          signals.push({
            type: 'regex',
            category,
            pattern,
            matches: matchCount,
            impact: config.impact,
            description: config.description,
            debugMeta: {
              matchedText: matches?.slice(0, 5), // Limit to first 5 matches
              regex: pattern
            }
          });
        }
      } catch (error) {
        console.warn(`Invalid regex pattern: ${pattern}`, error);
      }
    }

    return signals;
  }

  private getCompiledRegex(pattern: string, flags: string): RegExp {
    const key = `${pattern}::${flags}`;
    
    if (!this.compiledRegex.has(key)) {
      this.compiledRegex.set(key, new RegExp(pattern, flags));
    }
    
    return this.compiledRegex.get(key)!;
  }

  private generateFindingTitle(signal: DetectedSignal): string {
    const categoryTitles: Record<string, string> = {
      'contactInfo': 'Contact Informatie',
      'businessInfo': 'Bedrijfsinformatie',
      'socialProof': 'Social Proof',
      'authority': 'Authoriteit Signalen',
      'transparency': 'Transparantie',
      'schema': 'Schema Markup',
      'structured-data': 'Gestructureerde Data',
      'metadata': 'Metadata',
      'technical': 'Technische SEO',
      'content': 'Content Kwaliteit',
      'performance': 'Performance',
      'accessibility': 'Toegankelijkheid',
      'security': 'Beveiliging'
    };

    const friendlyCategory = categoryTitles[signal.category] || signal.category;
    
    // Generate more descriptive titles based on signal strength
    if (signal.matches >= 8) {
      return `${friendlyCategory}: Uitstekend (${signal.matches} elementen gevonden)`;
    } else if (signal.matches >= 5) {
      return `${friendlyCategory}: Goed (${signal.matches} elementen gevonden)`;
    } else if (signal.matches >= 3) {
      return `${friendlyCategory}: Beperkt (${signal.matches} elementen gevonden)`;
    } else {
      return `${friendlyCategory}: Ontbrekend (${signal.matches} elementen gevonden)`;
    }
  }

  private generateFindingDescription(signal: DetectedSignal): string {
    const contextExplanations: Record<string, string> = {
      'contactInfo': 'Contactinformatie helpt bezoekers en zoekmachines je bedrijf te vinden en vertrouwen op te bouwen.',
      'businessInfo': 'Duidelijke bedrijfsinformatie verbetert de geloofwaardigheid en lokale SEO.',
      'socialProof': 'Social proof zoals testimonials en reviews verhogen de conversie en vertrouwen.',
      'authority': 'Authoriteit signalen zoals certificaten en vermeldingen versterken je online reputatie.',
      'transparency': 'Transparantie over je bedrijf bouwt vertrouwen op bij bezoekers en zoekmachines.',
      'schema': 'Schema markup helpt zoekmachines je content beter te begrijpen en weer te geven.',
      'structured-data': 'Gestructureerde data verbetert hoe je site wordt weergegeven in zoekresultaten.',
      'metadata': 'Goede metadata verbetert de zichtbaarheid en klikgegevens in zoekmachines.',
      'technical': 'Technische SEO optimalisatie verbetert de prestaties en indexering van je site.',
      'content': 'Kwalitatieve content is essentieel voor gebruikerservaring en SEO rankings.',
      'performance': 'Snelle laadtijden verbeteren de gebruikerservaring en SEO rankings.',
      'accessibility': 'Toegankelijkheid zorgt ervoor dat je site bruikbaar is voor alle gebruikers.',
      'security': 'Beveiliging beschermt je site en gebruikers tegen bedreigingen.'
    };

    const baseDescription = signal.description || 'Geen beschrijving beschikbaar';
    const context = contextExplanations[signal.category] || '';
    
    return context ? `${baseDescription} ${context}` : baseDescription;
  }
} 