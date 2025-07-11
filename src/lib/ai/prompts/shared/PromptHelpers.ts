/**
 * PromptHelpers - DRY utilities for consistent prompt formatting
 * 
 * Eliminates code duplication between prompt strategies by providing
 * standardized formatting, headers, and common prompt blocks
 */

export interface PromptSection {
  title: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ResponseFormat {
  format: 'json' | 'text';
  schema?: Record<string, any>;
  instructions?: string[];
}

export class PromptHelpers {
  
  // Common consultant personas
  static readonly PERSONAS = {
    SEO_CONSULTANT: 'Je bent een AI SEO-consultant die websites analyseert voor AI-readiness en citability.',
    PERSONAL_CONSULTANT: 'Je bent een persoonlijke AI-consultant die een rapport schrijft voor de website eigenaar.',
    ENTERPRISE_CONSULTANT: 'Je bent een senior AI-consultant die een strategisch rapport schrijft voor een enterprise klant.',
    STRATEGIC_ADVISOR: 'Je bent een strategische AI-advisor die uitgebreide analyses uitvoert voor grote organisaties.'
  } as const;

  // Common section headers
  static readonly SECTION_HEADERS = {
    SCAN_RESULTS: 'SCAN RESULTATEN',
    ENHANCED_CONTENT: 'ENHANCED CONTENT ANALYSE',
    CONTEXT: 'CONTEXT',
    TASK: 'TAAK',
    RESPONSE_FORMAT: 'RESPONSE FORMAT',
    IMPORTANT_INSTRUCTIONS: 'BELANGRIJKE INSTRUCTIES',
    BUSINESS_ANALYSIS: 'BUSINESS TIER ANALYSIS',
    COMPETITIVE_CONTEXT: 'COMPETITIVE CONTEXT',
    INDUSTRY_BENCHMARK: 'INDUSTRY BENCHMARK',
    MULTI_PAGE_INSIGHTS: 'MULTI-PAGE INSIGHTS'
  } as const;

  // Common tone guidelines
  static readonly TONE_GUIDELINES = {
    PROFESSIONAL_PERSONAL: [
      'Persoonlijk ("je website", "jouw klanten")',
      'Professioneel maar toegankelijk',
      'Specifiek voor deze website, niet generiek',
      'Gebruik concrete voorbeelden uit hun content',
      'Motiverend en actionable'
    ],
    ENTERPRISE_STRATEGIC: [
      'Executive-level strategic focus (niet tactisch)',
      'Concrete ROI en business impact cijfers',
      'Actionable strategic recommendations',
      'Professional consulting tone',
      'Nederlandse taal, formeel niveau'
    ],
    TECHNICAL_ANALYTICAL: [
      'Technisch accuraat en specifiek',
      'Evidence-based recommendations',
      'Concrete implementatie instructies',
      'Focus op meetbare impact'
    ]
  } as const;

  // Common JSON response schemas
  static readonly JSON_SCHEMAS = {
    AI_INSIGHTS: {
      missedOpportunities: 'Array of missed opportunity objects',
      authorityEnhancements: 'Array of authority enhancement objects',
      citabilityImprovements: 'Array of citability improvement objects',
      implementationPriority: 'Array of priority steps',
      generatedAt: 'ISO timestamp',
      confidence: 'Number 1-100'
    },
    NARRATIVE_REPORT: {
      executiveSummary: 'Complete section text',
      detailedAnalysis: 'Complete section text',
      implementationRoadmap: 'Complete section text',
      conclusionNextSteps: 'Complete section text',
      generatedAt: 'ISO timestamp',
      wordCount: 'Total word count'
    },
    ENTERPRISE_REPORT: {
      executiveSummary: 'Strategic overview section',
      multiPageAnalysis: 'Multi-page analysis section',
      competitivePositioning: 'Competitive positioning section',
      strategicRoadmap: 'Strategic roadmap section',
      keyMetrics: 'Key metrics object'
    }
  } as const;

  /**
   * Build a structured prompt with consistent formatting
   */
  static buildStructuredPrompt(config: {
    persona: string;
    sections: PromptSection[];
    responseFormat: ResponseFormat;
  }): string {
    const { persona, sections, responseFormat } = config;
    
    let prompt = persona + '\n\n';
    
    // Add sections
    sections.forEach(section => {
      prompt += `${section.title}:\n${section.content}\n\n`;
    });
    
    // Add response format
    prompt += this.formatResponseSection(responseFormat);
    
    return prompt.trim();
  }

  /**
   * Format data section with consistent JSON formatting
   */
  static formatDataSection(title: string, data: any, limit?: number): string {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const limitedData = limit ? this.truncateContent(jsonString, limit) : jsonString;
    
    return `${title}:\n${limitedData}`;
  }

  /**
   * Format enhanced content section with standard structure
   */
  static formatEnhancedContentSection(enhancedContent: any): string {
    const sections = [
      `Authority Signals: ${JSON.stringify(enhancedContent.authorityMarkers)}`,
      `Time Claims: ${JSON.stringify(enhancedContent.timeSignals)}`,
      `Quality Claims: ${JSON.stringify(enhancedContent.qualityClaims)}`,
      `Business Signals: ${JSON.stringify(enhancedContent.businessSignals)}`,
      `Content Quality: ${JSON.stringify(enhancedContent.contentQualityAssessment)}`,
      `Current Missed Opportunities: ${JSON.stringify(enhancedContent.missedOpportunities)}`
    ];
    
    return sections.join('\n');
  }

  /**
   * Format task section with focus points
   */
  static formatTaskSection(description: string, focusPoints: string[]): string {
    let section = `${description}\n\n`;
    
    if (focusPoints.length > 0) {
      section += 'Focus op:\n';
      focusPoints.forEach((point, index) => {
        section += `${index + 1}. ${point}\n`;
      });
    }
    
    return section;
  }

  /**
   * Format tone guidelines section
   */
  static formatToneSection(guidelines: string[]): string {
    return 'TONE:\n' + guidelines.map(guideline => `- ${guideline}`).join('\n');
  }

  /**
   * Format structure section with numbered points
   */
  static formatStructureSection(sections: Array<{ title: string; description: string; wordCount?: string }>): string {
    let result = 'STRUCTUUR:\n';
    
    sections.forEach((section, index) => {
      const wordCountSuffix = section.wordCount ? ` (${section.wordCount})` : '';
      result += `${index + 1}. **${section.title}**${wordCountSuffix}\n`;
      
      if (typeof section.description === 'string') {
        const points = section.description.split('\n').filter(line => line.trim());
        points.forEach(point => {
          result += `   - ${point.trim()}\n`;
        });
      }
      result += '\n';
    });
    
    return result;
  }

  /**
   * Format response format section
   */
  static formatResponseSection(responseFormat: ResponseFormat): string {
    let section = `${this.SECTION_HEADERS.RESPONSE_FORMAT}`;
    
    if (responseFormat.format === 'json') {
      section += ' (Strict JSON):\n';
      
      if (responseFormat.schema) {
        section += this.formatJSONSchema(responseFormat.schema);
      }
    } else {
      section += ':\n';
    }
    
    if (responseFormat.instructions) {
      section += '\n' + this.formatInstructions(responseFormat.instructions);
    }
    
    return section;
  }

  /**
   * Format JSON schema for response format
   */
  static formatJSONSchema(schema: Record<string, any>): string {
    const formatValue = (value: any): string => {
      if (typeof value === 'string') {
        return `"${value}"`;
      } else if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };

    let result = '{\n';
    Object.entries(schema).forEach(([key, value]) => {
      result += `  "${key}": ${formatValue(value)},\n`;
    });
    result = result.slice(0, -2) + '\n'; // Remove last comma
    result += '}';
    
    return result;
  }

  /**
   * Format important instructions section
   */
  static formatInstructions(instructions: string[]): string {
    return `${this.SECTION_HEADERS.IMPORTANT_INSTRUCTIONS}:\n` + 
           instructions.map(instruction => `- ${instruction}`).join('\n');
  }

  /**
   * Common instruction sets
   */
  static readonly COMMON_INSTRUCTIONS = {
    JSON_ONLY: [
      'Geef ALLEEN valid JSON terug',
      'Gebruik concrete voorbeelden uit hun werkelijke content',
      'Focus op actionable insights, niet algemene SEO tips',
      'Prioriteer quick wins met hoge impact'
    ],
    DUTCH_PROFESSIONAL: [
      'Geef ALLEEN valid JSON terug',
      'Schrijf in vloeiend Nederlands',
      'Gebruik hun werkelijke content voorbeelden UIT EVIDENCE VELDEN',
      'Maak het persoonlijk en specifiek',
      'Geen algemene SEO clichés'
    ],
    ENTERPRISE_STRATEGIC: [
      'Schrijf in vloeiend Nederlands',
      'Focus op strategische impact en ROI',
      'Gebruik concrete business metrics',
      'Prioriteer executive-level insights'
    ]
  } as const;

  /**
   * Get timestamp for prompt generation
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Truncate content to approximate character limit
   */
  private static truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }
    
    return content.substring(0, maxChars - 50) + '\n...[truncated]';
  }

  /**
   * Create a standard AI consultant prompt with all common elements
   */
  static createConsultantPrompt(config: {
    persona: keyof typeof PromptHelpers.PERSONAS;
    dataSection: { title: string; data: any }[];
    task: { description: string; focusPoints?: string[] };
    tone?: keyof typeof PromptHelpers.TONE_GUIDELINES;
    structure?: Array<{ title: string; description: string; wordCount?: string }>;
    responseSchema: keyof typeof PromptHelpers.JSON_SCHEMAS;
    instructions?: keyof typeof PromptHelpers.COMMON_INSTRUCTIONS;
  }): string {
    const sections: PromptSection[] = [];
    
    // Add data sections
    config.dataSection.forEach(({ title, data }) => {
      sections.push({
        title,
        content: this.formatDataSection(title, data).replace(`${title}:\n`, ''),
        priority: 'high'
      });
    });
    
    // Add task section
    sections.push({
      title: this.SECTION_HEADERS.TASK,
      content: this.formatTaskSection(config.task.description, config.task.focusPoints || []).replace('TAAK:\n', ''),
      priority: 'high'
    });
    
    // Add tone if specified
    if (config.tone) {
      sections.push({
        title: 'TONE',
        content: this.formatToneSection(this.TONE_GUIDELINES[config.tone]).replace('TONE:\n', ''),
        priority: 'medium'
      });
    }
    
    // Add structure if specified
    if (config.structure) {
      sections.push({
        title: 'STRUCTUUR',
        content: this.formatStructureSection(config.structure).replace('STRUCTUUR:\n', ''),
        priority: 'medium'
      });
    }
    
    const responseFormat: ResponseFormat = {
      format: 'json',
      schema: this.JSON_SCHEMAS[config.responseSchema],
      instructions: config.instructions ? this.COMMON_INSTRUCTIONS[config.instructions] : undefined
    };
    
    return this.buildStructuredPrompt({
      persona: this.PERSONAS[config.persona],
      sections,
      responseFormat
    });
  }
}