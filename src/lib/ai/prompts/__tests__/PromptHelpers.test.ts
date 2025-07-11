/**
 * Test suite for PromptHelpers class
 */

import { describe, it, expect } from 'vitest';
import { PromptHelpers } from '../shared/PromptHelpers.js';

describe('PromptHelpers', () => {
  describe('Constants', () => {
    it('should have defined personas', () => {
      expect(PromptHelpers.PERSONAS.SEO_CONSULTANT).toBeDefined();
      expect(PromptHelpers.PERSONAS.PERSONAL_CONSULTANT).toBeDefined();
      expect(PromptHelpers.PERSONAS.ENTERPRISE_CONSULTANT).toBeDefined();
    });

    it('should have defined section headers', () => {
      expect(PromptHelpers.SECTION_HEADERS.SCAN_RESULTS).toBe('SCAN RESULTATEN');
      expect(PromptHelpers.SECTION_HEADERS.TASK).toBe('TAAK');
      expect(PromptHelpers.SECTION_HEADERS.RESPONSE_FORMAT).toBe('RESPONSE FORMAT');
    });

    it('should have defined tone guidelines', () => {
      expect(Array.isArray(PromptHelpers.TONE_GUIDELINES.PROFESSIONAL_PERSONAL)).toBe(true);
      expect(PromptHelpers.TONE_GUIDELINES.PROFESSIONAL_PERSONAL.length).toBeGreaterThan(0);
    });

    it('should have defined JSON schemas', () => {
      expect(PromptHelpers.JSON_SCHEMAS.AI_INSIGHTS).toBeDefined();
      expect(PromptHelpers.JSON_SCHEMAS.NARRATIVE_REPORT).toBeDefined();
      expect(PromptHelpers.JSON_SCHEMAS.ENTERPRISE_REPORT).toBeDefined();
    });
  });

  describe('Formatting Methods', () => {
    describe('formatDataSection', () => {
      it('should format data section with title and JSON data', () => {
        const data = { test: 'value', number: 42 };
        const result = PromptHelpers.formatDataSection('TEST DATA', data);
        
        expect(result).toContain('TEST DATA:');
        expect(result).toContain('"test": "value"');
        expect(result).toContain('"number": 42');
      });

      it('should handle string data', () => {
        const data = 'Simple string data';
        const result = PromptHelpers.formatDataSection('STRING DATA', data);
        
        expect(result).toContain('STRING DATA:');
        expect(result).toContain('Simple string data');
      });

      it('should truncate data when limit is specified', () => {
        const longData = { content: 'a'.repeat(1000) };
        const result = PromptHelpers.formatDataSection('LONG DATA', longData, 100);
        
        expect(result.length).toBeLessThan(200); // Should be truncated
        expect(result).toContain('[truncated]');
      });
    });

    describe('formatEnhancedContentSection', () => {
      it('should format enhanced content with all standard fields', () => {
        const enhancedContent = {
          authorityMarkers: [{ text: 'expert', type: 'expertise' }],
          timeSignals: [{ text: 'since 2020', confidence: 'high' }],
          qualityClaims: [{ text: 'best quality', strength: 'strong' }],
          businessSignals: [{ text: 'contact us', type: 'contact' }],
          contentQualityAssessment: { score: 85 },
          missedOpportunities: [{ title: 'Add testimonials' }]
        };

        const result = PromptHelpers.formatEnhancedContentSection(enhancedContent);
        
        expect(result).toContain('Authority Signals:');
        expect(result).toContain('Time Claims:');
        expect(result).toContain('Quality Claims:');
        expect(result).toContain('Business Signals:');
        expect(result).toContain('Content Quality:');
        expect(result).toContain('Current Missed Opportunities:');
      });
    });

    describe('formatTaskSection', () => {
      it('should format task with description and focus points', () => {
        const description = 'Analyze the website for SEO opportunities';
        const focusPoints = ['Technical SEO', 'Content Quality', 'User Experience'];
        
        const result = PromptHelpers.formatTaskSection(description, focusPoints);
        
        expect(result).toContain(description);
        expect(result).toContain('Focus op:');
        expect(result).toContain('1. Technical SEO');
        expect(result).toContain('2. Content Quality');
        expect(result).toContain('3. User Experience');
      });

      it('should handle empty focus points', () => {
        const description = 'Simple task description';
        const result = PromptHelpers.formatTaskSection(description, []);
        
        expect(result).toContain(description);
        expect(result).not.toContain('Focus op:');
      });
    });

    describe('formatToneSection', () => {
      it('should format tone guidelines as bullet points', () => {
        const guidelines = ['Professional', 'Accessible', 'Specific'];
        const result = PromptHelpers.formatToneSection(guidelines);
        
        expect(result).toContain('TONE:');
        expect(result).toContain('- Professional');
        expect(result).toContain('- Accessible');
        expect(result).toContain('- Specific');
      });
    });

    describe('formatStructureSection', () => {
      it('should format structure with numbered sections', () => {
        const sections = [
          { title: 'Introduction', description: 'Opening remarks\nContext setting', wordCount: '100-150 words' },
          { title: 'Analysis', description: 'Deep dive analysis\nKey findings' }
        ];
        
        const result = PromptHelpers.formatStructureSection(sections);
        
        expect(result).toContain('STRUCTUUR:');
        expect(result).toContain('1. **Introduction** (100-150 words)');
        expect(result).toContain('2. **Analysis**');
        expect(result).toContain('- Opening remarks');
        expect(result).toContain('- Deep dive analysis');
      });
    });

    describe('formatJSONSchema', () => {
      it('should format JSON schema correctly', () => {
        const schema = {
          field1: 'string value',
          field2: 'number value',
          field3: { nested: 'object' }
        };
        
        const result = PromptHelpers.formatJSONSchema(schema);
        
        expect(result).toContain('"field1": "string value"');
        expect(result).toContain('"field2": "number value"');
        expect(result).toContain('"field3": {');
        expect(result.startsWith('{')).toBe(true);
        expect(result.endsWith('}')).toBe(true);
      });
    });
  });

  describe('buildStructuredPrompt', () => {
    it('should build a complete structured prompt', () => {
      const config = {
        persona: 'You are a test consultant.',
        sections: [
          { title: 'DATA', content: 'Test data content', priority: 'high' as const },
          { title: 'TASK', content: 'Analyze the data', priority: 'medium' as const }
        ],
        responseFormat: {
          format: 'json' as const,
          schema: { result: 'analysis result' },
          instructions: ['Be accurate', 'Be concise']
        }
      };
      
      const result = PromptHelpers.buildStructuredPrompt(config);
      
      expect(result).toContain('You are a test consultant.');
      expect(result).toContain('DATA:');
      expect(result).toContain('Test data content');
      expect(result).toContain('TASK:');
      expect(result).toContain('Analyze the data');
      expect(result).toContain('RESPONSE FORMAT');
      expect(result).toContain('"result": "analysis result"');
    });
  });

  describe('createConsultantPrompt', () => {
    it('should create a complete consultant prompt', () => {
      const config = {
        persona: 'SEO_CONSULTANT' as const,
        dataSection: [
          { title: 'SCAN RESULTS', data: { score: 85 } },
          { title: 'CONTENT', data: { quality: 'high' } }
        ],
        task: {
          description: 'Analyze website for SEO opportunities',
          focusPoints: ['Technical SEO', 'Content Quality']
        },
        responseSchema: 'AI_INSIGHTS' as const,
        instructions: 'JSON_ONLY' as const
      };
      
      const result = PromptHelpers.createConsultantPrompt(config);
      
      expect(result).toContain(PromptHelpers.PERSONAS.SEO_CONSULTANT);
      expect(result).toContain('SCAN RESULTS:');
      expect(result).toContain('"score": 85');
      expect(result).toContain('TAAK:');
      expect(result).toContain('Analyze website for SEO opportunities');
      expect(result).toContain('Focus op:');
      expect(result).toContain('1. Technical SEO');
      expect(result).toContain('RESPONSE FORMAT');
      expect(result).toContain('missedOpportunities');
    });

    it('should handle optional parameters', () => {
      const minimalConfig = {
        persona: 'PERSONAL_CONSULTANT' as const,
        dataSection: [{ title: 'DATA', data: { test: 'value' } }],
        task: { description: 'Simple task' },
        responseSchema: 'NARRATIVE_REPORT' as const
      };
      
      const result = PromptHelpers.createConsultantPrompt(minimalConfig);
      
      expect(result).toContain(PromptHelpers.PERSONAS.PERSONAL_CONSULTANT);
      expect(result).toContain('Simple task');
      expect(result).toContain('executiveSummary');
      expect(result).not.toContain('TONE:');
      expect(result).not.toContain('STRUCTUUR:');
    });
  });

  describe('Utility Methods', () => {
    it('should return current timestamp', () => {
      const timestamp = PromptHelpers.getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should format instructions correctly', () => {
      const instructions = ['First instruction', 'Second instruction'];
      const result = PromptHelpers.formatInstructions(instructions);
      
      expect(result).toContain('BELANGRIJKE INSTRUCTIES:');
      expect(result).toContain('- First instruction');
      expect(result).toContain('- Second instruction');
    });
  });
});