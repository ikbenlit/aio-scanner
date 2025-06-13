import { json } from '@sveltejs/kit';
import { ContentExtractor } from '$lib/scan/ContentExtractor.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const extractor = new ContentExtractor();
    
    // Test content zoals gespecificeerd in het plan
    const testContent = `
      Welkom bij ABC Consultancy! Wij zijn al een eeuw lang actief als familiebedrijf 
      en bieden heel erg goede diensten. Sinds 1924 zijn wij de beste in ons vakgebied 
      met 98% tevreden klanten. 
      
      Hoe kunnen wij je helpen? Als specialist in business consultancy met meer dan 20 jaar 
      ervaring zijn wij gecertificeerd volgens ISO 9001. Winnaar van de Business Excellence Award.
      
      Neem contact op: KvK: 12345678, BTW: NL123456789B01
      Vestigingsadres: Hoofdstraat 123, 1234 AB Amsterdam
      Telefoon: 020-1234567
    `;

    console.log('🧪 Testing ContentExtractor with complex business content...');
    
    // Extract all samples
    const samples = extractor.extractAllSamples(testContent);
    
    // Test specific patterns
    const timeTest = extractor.extractSpecificPattern(testContent, 'time');
    const qualityTest = extractor.extractSpecificPattern(testContent, 'quality');
    const authorityTest = extractor.extractSpecificPattern(testContent, 'authority');
    const businessTest = extractor.extractSpecificPattern(testContent, 'business');
    
    // Verify critical detections from Fase 2.5 plan
    const criticalDetections = {
      eenEeuwLang: samples.timeSignals.some(t => t.text === 'een eeuw lang'),
      sinds1924: samples.timeSignals.some(t => t.text.includes('sinds 1924')),
      heelErgGoed: samples.qualityClaims.some(q => q.text.includes('heel erg goed')),
      percentage98: samples.qualityClaims.some(q => q.text.includes('98%')),
      specialist: samples.authorityMarkers.some(a => a.text === 'specialist'),
      kvkTransparency: samples.businessSignals.some(b => b.signalType === 'transparency'),
      faqDetection: samples.questionPatterns && samples.questionPatterns.length > 0
    };
    
    const testResults = {
      status: 'success',
      contentExtractorVersion: '2.5.1',
      testContent: testContent.substring(0, 200) + '...',
      samples: {
        timeSignals: {
          count: samples.timeSignals.length,
          examples: samples.timeSignals.slice(0, 3),
          detectedEenEeuwLang: criticalDetections.eenEeuwLang,
          detectedSinds1924: criticalDetections.sinds1924
        },
        qualityClaims: {
          count: samples.qualityClaims.length,
          examples: samples.qualityClaims.slice(0, 3),
          detectedHeelErgGoed: criticalDetections.heelErgGoed,
          detected98Percent: criticalDetections.percentage98
        },
        authorityMarkers: {
          count: samples.authorityMarkers.length,
          examples: samples.authorityMarkers.slice(0, 3),
          detectedSpecialist: criticalDetections.specialist
        },
        businessSignals: {
          count: samples.businessSignals.length,
          examples: samples.businessSignals.slice(0, 3),
          detectedTransparency: criticalDetections.kvkTransparency
        },
        conversationalContent: {
          questionPatterns: samples.questionPatterns?.length || 0,
          conversationalSignals: samples.conversationalSignals?.length || 0,
          directAnswers: samples.directAnswers?.length || 0,
          faqDetected: criticalDetections.faqDetection
        }
      },
      criticalDetectionResults: criticalDetections,
      readyForAiEnhancement: Object.values(criticalDetections).every(Boolean),
      phase25Status: Object.values(criticalDetections).every(Boolean) ? 
        '✅ Ready for Phase 2.5.2 - LLM Enhancement Layer' : 
        '⚠️ Some critical patterns not detected'
    };
    
    console.log('🔍 ContentExtractor Test Results:');
    console.log(`  - Time signals detected: ${samples.timeSignals.length}`);
    console.log(`  - Quality claims detected: ${samples.qualityClaims.length}`);
    console.log(`  - Authority markers detected: ${samples.authorityMarkers.length}`);
    console.log(`  - Business signals detected: ${samples.businessSignals.length}`);
    console.log(`  - Critical patterns: ${Object.values(criticalDetections).filter(Boolean).length}/${Object.keys(criticalDetections).length}`);
    
    return json(testResults);
    
  } catch (error) {
    console.error('❌ ContentExtractor test failed:', error);
    return json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      phase25Status: '❌ ContentExtractor implementation failed'
    }, { status: 500 });
  }
};

// Test specific pattern types
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { text, patternType } = await request.json();
    
    if (!text || !patternType) {
      return json({ error: 'Missing text or patternType' }, { status: 400 });
    }
    
    const extractor = new ContentExtractor();
    
    let results;
    switch (patternType) {
      case 'all':
        results = extractor.extractAllSamples(text);
        break;
      case 'time':
      case 'quality':
      case 'authority':
      case 'business':
        results = extractor.extractSpecificPattern(text, patternType);
        break;
      default:
        return json({ error: 'Invalid patternType' }, { status: 400 });
    }
    
    return json({
      status: 'success',
      patternType,
      results,
      count: Array.isArray(results) ? results.length : Object.keys(results).length
    });
    
  } catch (error) {
    return json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 