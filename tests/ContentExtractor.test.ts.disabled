import { ContentExtractor } from './ContentExtractor.js';
import type { ContentSamples, TimeExpression, QualityClaim } from './ContentExtractor.js';

describe('ContentExtractor - Enhanced Pattern Detection', () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    extractor = new ContentExtractor();
  });

  describe('Time Authority Detection', () => {
    it('should detect "een eeuw lang" and normalize to 100 years', () => {
      const text = 'We doen dit al een eeuw lang heel goed en hebben veel tevreden klanten.';
      const timeSignals = extractor.extractTimeExpressions(text);
      
      expect(timeSignals).toHaveLength(1);
      expect(timeSignals[0].text).toBe('een eeuw lang');
      expect(timeSignals[0].normalizedYears).toBe(100);
      expect(timeSignals[0].confidence).toBe('high');
    });

    it('should extract and calculate years from "sinds 1924"', () => {
      const text = 'Ons familiebedrijf bestaat sinds 1924 en biedt uitstekende diensten.';
      const timeSignals = extractor.extractTimeExpressions(text);
      
      const sindsMatch = timeSignals.find(t => t.text.includes('1924'));
      expect(sindsMatch).toBeDefined();
      expect(sindsMatch!.normalizedYears).toBe(new Date().getFullYear() - 1924);
      expect(sindsMatch!.confidence).toBe('high');
    });

    it('should detect "al 25 jaar" with extracted number', () => {
      const text = 'Wij werken al 25 jaar in deze branche.';
      const timeSignals = extractor.extractTimeExpressions(text);
      
      expect(timeSignals).toHaveLength(1);
      expect(timeSignals[0].text).toBe('al 25 jaar');
      expect(timeSignals[0].normalizedYears).toBe(25);
    });

    it('should detect generation claims', () => {
      const text = 'Een familiebedrijf in de 4e generatie.';
      const timeSignals = extractor.extractTimeExpressions(text);
      
      const familyMatch = timeSignals.find(t => t.text === 'familiebedrijf');
      const generationMatch = timeSignals.find(t => t.text.includes('4e generatie'));
      
      expect(familyMatch).toBeDefined();
      expect(familyMatch!.normalizedYears).toBe(25);
      expect(generationMatch).toBeDefined();
      expect(generationMatch!.normalizedYears).toBe(100); // 4 * 25 years
    });
  });

  describe('Quality Claims Detection', () => {
    it('should detect "heel erg goed" as moderate quality claim', () => {
      const text = 'We doen dit al een eeuw lang heel goed en hebben veel tevreden klanten.';
      const qualityClaims = extractor.extractQualityClaims(text);
      
      const heelGoodMatch = qualityClaims.find(q => q.text.includes('heel') || q.text.includes('goed'));
      expect(heelGoodMatch).toBeDefined();
      expect(heelGoodMatch!.claimType).toBe('quality');
      expect(heelGoodMatch!.strength).toBe('moderate');
    });

    it('should detect satisfaction claims with percentages', () => {
      const text = 'We hebben 98% tevreden klanten en uitstekende reviews.';
      const qualityClaims = extractor.extractQualityClaims(text);
      
      const satisfactionMatch = qualityClaims.find(q => q.text.includes('98%'));
      const excellentMatch = qualityClaims.find(q => q.text === 'uitstekend');
      
      expect(satisfactionMatch).toBeDefined();
      expect(satisfactionMatch!.claimType).toBe('satisfaction');
      expect(satisfactionMatch!.strength).toBe('strong');
      
      expect(excellentMatch).toBeDefined();
      expect(excellentMatch!.strength).toBe('strong');
    });

    it('should detect comparative claims', () => {
      const text = 'Wij zijn de beste in ons vakgebied en marktleider.';
      const qualityClaims = extractor.extractQualityClaims(text);
      
      expect(qualityClaims).toHaveLength(2);
      expect(qualityClaims.some(q => q.text === 'beste')).toBe(true);
      expect(qualityClaims.some(q => q.text === 'marktleider')).toBe(true);
      expect(qualityClaims.every(q => q.strength === 'strong')).toBe(true);
    });
  });

  describe('Authority Markers Detection', () => {
    it('should detect awards and recognition', () => {
      const text = 'Winnaar van de Beste Service Award en erkend door ISO.';
      const authorityMarkers = extractor.extractAuthorityMarkers(text);
      
      const awardMatch = authorityMarkers.find(a => a.text.includes('winnaar'));
      const recognitionMatch = authorityMarkers.find(a => a.text.includes('erkend'));
      
      expect(awardMatch).toBeDefined();
      expect(awardMatch!.markerType).toBe('award');
      
      expect(recognitionMatch).toBeDefined();
      expect(recognitionMatch!.markerType).toBe('recognition');
    });

    it('should detect expertise claims', () => {
      const text = 'Als specialist in SEO met 15 jaar ervaring helpen wij bedrijven.';
      const authorityMarkers = extractor.extractAuthorityMarkers(text);
      
      const specialistMatch = authorityMarkers.find(a => a.text.includes('specialist'));
      const experienceMatch = authorityMarkers.find(a => a.text.includes('15 jaar ervaring'));
      
      expect(specialistMatch).toBeDefined();
      expect(specialistMatch!.markerType).toBe('expertise');
      
      expect(experienceMatch).toBeDefined();
      expect(experienceMatch!.markerType).toBe('expertise');
    });

    it('should detect certifications', () => {
      const text = 'Wij zijn gecertificeerd volgens ISO 9001 standaarden.';
      const authorityMarkers = extractor.extractAuthorityMarkers(text);
      
      expect(authorityMarkers).toHaveLength(2);
      expect(authorityMarkers.some(a => a.text === 'gecertificeerd')).toBe(true);
      expect(authorityMarkers.some(a => a.text.includes('ISO'))).toBe(true);
      expect(authorityMarkers.every(a => a.markerType === 'certification')).toBe(true);
    });
  });

  describe('Business Signals Detection', () => {
    it('should detect Dutch business transparency info', () => {
      const text = 'KvK: 12345678, BTW: NL123456789B01. Bel ons op 020-1234567.';
      const businessSignals = extractor.extractBusinessSignals(text);
      
      const kvkMatch = businessSignals.find(b => b.text.includes('KvK'));
      const btwMatch = businessSignals.find(b => b.text.includes('BTW'));
      const phoneMatch = businessSignals.find(b => b.text.includes('020-1234567'));
      
      expect(kvkMatch).toBeDefined();
      expect(kvkMatch!.signalType).toBe('transparency');
      
      expect(btwMatch).toBeDefined();
      expect(btwMatch!.signalType).toBe('transparency');
      
      expect(phoneMatch).toBeDefined();
      expect(phoneMatch!.signalType).toBe('contact');
    });

    it('should detect location and address info', () => {
      const text = 'Ons vestigingsadres: Hoofdstraat 123, 1234 AB Amsterdam.';
      const businessSignals = extractor.extractBusinessSignals(text);
      
      const addressMatch = businessSignals.find(b => b.text === 'vestigingsadres');
      const postalMatch = businessSignals.find(b => b.text.includes('1234 AB'));
      
      expect(addressMatch).toBeDefined();
      expect(addressMatch!.signalType).toBe('location');
      
      expect(postalMatch).toBeDefined();
      expect(postalMatch!.signalType).toBe('location');
    });
  });

  describe('Conversational Content Detection', () => {
    it('should detect FAQ patterns', () => {
      const text = 'Hoe kunnen wij je helpen? Wat is onze beste service? Waarom kiezen voor ons?';
      const samples = extractor.extractAllSamples(text);
      
      expect(samples.questionPatterns).toBeDefined();
      expect(samples.questionPatterns!.length).toBeGreaterThan(0);
      expect(samples.questionPatterns!.some(q => q.includes('Hoe kunnen'))).toBe(true);
      expect(samples.questionPatterns!.some(q => q.includes('Wat is'))).toBe(true);
    });

    it('should detect conversational signals', () => {
      const text = 'Hallo! Kunnen we je helpen? Neem contact op voor meer info.';
      const samples = extractor.extractAllSamples(text);
      
      expect(samples.conversationalSignals).toBeDefined();
      expect(samples.conversationalSignals!.length).toBeGreaterThan(0);
      expect(samples.conversationalSignals!.some(s => s.includes('Hallo'))).toBe(true);
      expect(samples.conversationalSignals!.some(s => s.includes('kunnen we je helpen'))).toBe(true);
    });

    it('should detect direct answer patterns', () => {
      const text = 'Wij zijn de beste keuze omdat we uitstekende service bieden. Onze ervaring is meer dan 20 jaar.';
      const samples = extractor.extractAllSamples(text);
      
      expect(samples.directAnswers).toBeDefined();
      expect(samples.directAnswers!.length).toBeGreaterThan(0);
      expect(samples.directAnswers!.some(a => a.includes('Wij zijn'))).toBe(true);
      expect(samples.directAnswers!.some(a => a.includes('Onze ervaring'))).toBe(true);
    });
  });

  describe('Comprehensive Content Analysis', () => {
    it('should analyze complex business content', () => {
      const complexText = `
        Welkom bij ABC Consultancy! Wij zijn al een eeuw lang actief als familiebedrijf 
        en bieden heel erg goede diensten. Sinds 1924 zijn wij de beste in ons vakgebied 
        met 98% tevreden klanten. 
        
        Hoe kunnen wij je helpen? Als specialist in business consultancy met meer dan 20 jaar 
        ervaring zijn wij gecertificeerd volgens ISO 9001. Winnaar van de Business Excellence Award.
        
        Neem contact op: KvK: 12345678, BTW: NL123456789B01
        Vestigingsadres: Hoofdstraat 123, 1234 AB Amsterdam
        Telefoon: 020-1234567
      `;
      
      const samples = extractor.extractAllSamples(complexText);
      
      // Verify comprehensive detection
      expect(samples.timeSignals.length).toBeGreaterThan(0);
      expect(samples.qualityClaims.length).toBeGreaterThan(0);
      expect(samples.authorityMarkers.length).toBeGreaterThan(0);
      expect(samples.businessSignals.length).toBeGreaterThan(0);
      expect(samples.questionPatterns!.length).toBeGreaterThan(0);
      
      // Verify specific critical detections from the plan
      expect(samples.timeSignals.some(t => t.text === 'een eeuw lang')).toBe(true);
      expect(samples.timeSignals.some(t => t.text.includes('sinds 1924'))).toBe(true);
      expect(samples.qualityClaims.some(q => q.text.includes('heel erg goed'))).toBe(true);
      expect(samples.qualityClaims.some(q => q.text.includes('98%'))).toBe(true);
      expect(samples.authorityMarkers.some(a => a.text === 'specialist')).toBe(true);
      expect(samples.businessSignals.some(b => b.signalType === 'transparency')).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty content gracefully', () => {
      const samples = extractor.extractAllSamples('');
      
      expect(samples.timeSignals).toEqual([]);
      expect(samples.qualityClaims).toEqual([]);
      expect(samples.authorityMarkers).toEqual([]);
      expect(samples.businessSignals).toEqual([]);
    });

    it('should handle HTML content properly', () => {
      const htmlContent = `
        <div>
          <h1>Welkom bij ons bedrijf</h1>
          <p>Wij bestaan al <strong>een eeuw lang</strong> en zijn <em>heel erg goed</em>.</p>
          <div>Contact: <span>020-1234567</span></div>
        </div>
      `;
      
      const samples = extractor.extractAllSamples(htmlContent);
      
      expect(samples.timeSignals.some(t => t.text === 'een eeuw lang')).toBe(true);
      expect(samples.qualityClaims.some(q => q.text.includes('heel erg goed'))).toBe(true);
      expect(samples.businessSignals.some(b => b.text.includes('020-1234567'))).toBe(true);
    });

    it('should calculate confidence levels correctly', () => {
      const text = 'Sinds 1924 bieden wij uitstekende diensten met 98% klanttevredenheid.';
      const samples = extractor.extractAllSamples(text);
      
      // High confidence items should have numbers and context
      const highConfidenceItems = [
        ...samples.timeSignals.filter(t => t.confidence === 'high'),
        ...samples.qualityClaims.filter(q => q.confidence === 'high')
      ];
      
      expect(highConfidenceItems.length).toBeGreaterThan(0);
    });
  });
});

// Integration test for ready-to-use functionality
describe('ContentExtractor Integration', () => {
  it('should be ready for ScanOrchestrator integration', () => {
    const extractor = new ContentExtractor();
    const testHtml = `
      <html>
        <body>
          <h1>ABC Consultancy - Een eeuw lang excellentie</h1>
          <p>Sinds 1924 zijn wij specialist in business consultancy.</p>
          <p>Met 98% tevreden klanten en als winnaar van meerdere awards.</p>
          <footer>KvK: 12345678 | Telefoon: 020-1234567</footer>
        </body>
      </html>
    `;
    
    const samples = extractor.extractAllSamples(testHtml);
    
    // Verify the structure is ready for AI enhancement
    expect(samples).toHaveProperty('timeSignals');
    expect(samples).toHaveProperty('qualityClaims');
    expect(samples).toHaveProperty('authorityMarkers');
    expect(samples).toHaveProperty('businessSignals');
    expect(samples).toHaveProperty('questionPatterns');
    expect(samples).toHaveProperty('conversationalSignals');
    expect(samples).toHaveProperty('directAnswers');
    
    // Verify content is properly structured for LLM consumption
    expect(samples.timeSignals.every(t => t.context && t.confidence)).toBe(true);
    expect(samples.qualityClaims.every(q => q.context && q.confidence)).toBe(true);
    
    console.log('✅ ContentExtractor ready for Phase 2.5.2 - LLM Enhancement Layer');
  });
});