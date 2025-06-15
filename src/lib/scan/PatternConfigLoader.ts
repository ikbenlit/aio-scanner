import type { PatternConfig } from './PatternMatcher';
import { readFileSync } from 'fs';
import { join } from 'path';

// Default fallback patterns voor elke module
const DEFAULT_PATTERNS: Record<string, PatternConfig> = {
  TechnicalSEO: {
    selectors: {
      robotsTxt: {
        patterns: ['meta[name="robots"]', 'link[rel="robots"]'],
        description: 'Detecteert robots meta tags',
        impact: 'medium'
      },
      metaTags: {
        patterns: ['meta[name="description"]', 'meta[property="og:description"]'],
        description: 'Controleert aanwezigheid van meta descriptions',
        impact: 'high'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 15, medium: 10, low: 5 }
    }
  },

  SchemaMarkup: {
    selectors: {
      jsonLd: {
        patterns: ['script[type="application/ld+json"]'],
        description: 'Detecteert JSON-LD structured data',
        impact: 'high'
      },
      openGraph: {
        patterns: ['meta[property^="og:"]'],
        description: 'Controleert Open Graph tags',
        impact: 'medium'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 20, medium: 10, low: 5 }
    }
  },

  AIContent: {
    selectors: {
      faq: {
        patterns: [
          '[class*="faq" i]',
          '[id*="faq" i]',
          '[class*="veelgesteld" i]',
          '[class*="questions" i]'
        ],
        description: 'Detecteert FAQ secties',
        impact: 'high'
      },
      headings: {
        patterns: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        description: 'Analyseert heading structuur',
        impact: 'medium'
      }
    },
    regex: {
      personalPronouns: {
        patterns: ['\\bje\\b', '\\bjij\\b', '\\bjouw\\b', '\\bu\\b', '\\bwe\\b', '\\bwij\\b'],
        description: 'Detecteert conversational tone via persoonlijke voornaamwoorden',
        impact: 'medium',
        flags: 'gi'
      },
      questionMarks: {
        patterns: ['\\?'],
        description: 'Telt vraagmarkeringen voor engagement',
        impact: 'low',
        flags: 'g'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 20, medium: 10, low: 5 }
    }
  },

  AICitation: {
    selectors: {
      authorBio: {
        patterns: [
          '[class*="over" i]',
          '[class*="about" i]',
          '[class*="team" i]',
          '[class*="author" i]',
          '[class*="founder" i]'
        ],
        description: 'Detecteert author/team secties',
        impact: 'high'
      }
    },
    regex: {
      expertiseSignals: {
        patterns: [
          '\\d+\\s*jaar\\s*(ervaring|experience)',
          'gecertificeerd|certified|diploma',
          'specialist|expert|authority'
        ],
        description: 'Detecteert expertise indicatoren',
        impact: 'high',
        flags: 'gi'
      },
      quoteableContent: {
        patterns: [
          '^".*"$',
          '^(het belangrijkste is|the key is)',
          '^\\d+%\\s+van'
        ],
        description: 'Identificeert quoteerbare content',
        impact: 'medium',
        flags: 'gim'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 25, medium: 15, low: 5 }
    }
  },

  Freshness: {
    selectors: {
      datePublished: {
        patterns: [
          'meta[property="article:published_time"]',
          'meta[name="date"]',
          'time[datetime]'
        ],
        description: 'Detecteert published date meta tags',
        impact: 'high'
      },
      dateModified: {
        patterns: [
          'meta[property="article:modified_time"]',
          'meta[name="last-modified"]',
          'time[itemprop="dateModified"]'
        ],
        description: 'Detecteert modified date meta tags',
        impact: 'medium'
      }
    },
    regex: {
      inlineDate: {
        patterns: [
          'laatst bijgewerkt op\\s+\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}',
          'updated:\\s+\\w+\\s+\\d{1,2},\\s+\\d{4}',
          'gepubliceerd op\\s+\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}'
        ],
        description: 'Detecteert inline datum patronen',
        impact: 'low',
        flags: 'gi'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 20, medium: 10, low: 5 }
    }
  },

  CrossWebFootprint: {
    selectors: {
      sameAs: {
        patterns: [
          'script[type="application/ld+json"]',
          'a[href*="linkedin.com"]',
          'a[href*="twitter.com"]',
          'a[href*="facebook.com"]'
        ],
        description: 'Detecteert cross-platform links',
        impact: 'high'
      },
      socialProfiles: {
        patterns: [
          '[class*="social" i] a',
          '[id*="social" i] a',
          'footer a[href*="linkedin"]',
          'footer a[href*="twitter"]'
        ],
        description: 'Detecteert social media profielen',
        impact: 'medium'
      }
    },
    regex: {
      inlineMentions: {
        patterns: [
          '(?:volg ons|follow us) op\\s+\\w+',
          '@[\\w\\.]+'
        ],
        description: 'Detecteert inline social mentions',
        impact: 'low',
        flags: 'gi'
      }
    },
    scoring: {
      baseScore: 100,
      deductions: { high: 25, medium: 15, low: 5 }
    }
  }
};

export class PatternConfigLoader {
  private static instance: PatternConfigLoader;
  private configCache: Map<string, PatternConfig> = new Map();

  static getInstance(): PatternConfigLoader {
    if (!PatternConfigLoader.instance) {
      PatternConfigLoader.instance = new PatternConfigLoader();
    }
    return PatternConfigLoader.instance;
  }

  /**
   * Load configuration for a specific module
   * Falls back to default patterns if JSON loading fails
   */
  async loadConfig(moduleId: string): Promise<PatternConfig> {
    // Check cache first
    if (this.configCache.has(moduleId)) {
      return this.configCache.get(moduleId)!;
    }

    try {
      // Try to load from JSON file
      const config = await this.loadJsonConfig(moduleId);
      this.configCache.set(moduleId, config);
      return config;
    } catch (error) {
      console.warn(`Failed to load JSON config for ${moduleId}, using defaults:`, error);
      
      // Fallback to default patterns
      const defaultConfig = DEFAULT_PATTERNS[moduleId];
      if (!defaultConfig) {
        throw new Error(`No default configuration found for module: ${moduleId}`);
      }
      
      this.configCache.set(moduleId, defaultConfig);
      return defaultConfig;
    }
  }

  /**
   * Load configuration from JSON file
   */
  private async loadJsonConfig(moduleId: string): Promise<PatternConfig> {
    try {
      // Construct path to pattern file
      const configPath = join(process.cwd(), 'patterns', `${moduleId}.json`);
      console.log(`Loading pattern config from: ${configPath}`);
      
      // Read and parse JSON file
      const fileContent = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(fileContent);
      
      // Validate configuration structure
      if (!this.validateConfig(config)) {
        throw new Error(`Invalid configuration structure in ${configPath}`);
      }
      
      console.log(`✅ Successfully loaded pattern config for ${moduleId}`);
      return config as PatternConfig;
      
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Pattern configuration file not found: /patterns/${moduleId}.json`);
      }
      throw error;
    }
  }

  /**
   * Validate configuration structure
   */
  private validateConfig(config: any): config is PatternConfig {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Validate selectors structure
    if (config.selectors) {
      for (const [key, value] of Object.entries(config.selectors)) {
        if (!value || typeof value !== 'object') return false;
        const selectorConfig = value as any;
        if (!Array.isArray(selectorConfig.patterns) || 
            !selectorConfig.description || 
            !['low', 'medium', 'high'].includes(selectorConfig.impact)) {
          return false;
        }
      }
    }

    // Validate regex structure
    if (config.regex) {
      for (const [key, value] of Object.entries(config.regex)) {
        if (!value || typeof value !== 'object') return false;
        const regexConfig = value as any;
        if (!Array.isArray(regexConfig.patterns) || 
            !regexConfig.description || 
            !['low', 'medium', 'high'].includes(regexConfig.impact)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Clear configuration cache (useful for testing)
   */
  clearCache(): void {
    this.configCache.clear();
  }

  /**
   * Get all available default configurations
   */
  getAvailableConfigs(): string[] {
    return Object.keys(DEFAULT_PATTERNS);
  }
} 