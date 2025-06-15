// src/lib/scan/test-pattern-system.ts
import { PatternMatcher } from './PatternMatcher';
import { PatternConfigLoader } from './PatternConfigLoader';
import * as cheerio from 'cheerio';

/**
 * Test script voor het nieuwe pattern-driven systeem
 * Kan gebruikt worden om te valideren dat alles correct werkt
 */
export async function testPatternSystem() {
  console.log('🧪 Testing Pattern-Driven System...\n');

  const patternMatcher = new PatternMatcher();
  const configLoader = PatternConfigLoader.getInstance();

  // Test HTML content
  const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="description" content="Test website">
      <meta property="og:title" content="Test Page">
      <script type="application/ld+json">
        {"@type": "Organization", "name": "Test Company"}
      </script>
    </head>
    <body>
      <h1>Wat is SEO?</h1>
      <div class="faq">
        <h2>Hoe werkt SEO?</h2>
        <p>SEO helpt je website beter vindbaar te maken.</p>
      </div>
      <div class="about">
        <h2>Over ons team</h2>
        <p>Wij hebben 10 jaar ervaring in SEO.</p>
      </div>
      <footer>
        <a href="https://linkedin.com/company/test">LinkedIn</a>
        <a href="https://twitter.com/test">Twitter</a>
      </footer>
    </body>
    </html>
  `;

  const $ = cheerio.load(testHtml);

  // Test alle modules
  const moduleIds = ['TechnicalSEO', 'SchemaMarkup', 'AIContent', 'AICitation', 'Freshness', 'CrossWebFootprint'];

  for (const moduleId of moduleIds) {
    console.log(`\n📋 Testing ${moduleId} Module:`);
    console.log('─'.repeat(50));

    try {
      // Load configuration
      const config = await configLoader.loadConfig(moduleId);
      console.log(`✅ Config loaded for ${moduleId}`);

      // Match patterns
      const signals = patternMatcher.matchPatterns(testHtml, $, config);
      console.log(`🔍 Found ${signals.length} signals`);

      // Convert to findings
      const findings = patternMatcher.toFindings(signals, moduleId);
      console.log(`📊 Generated ${findings.length} findings`);

      // Calculate score
      const score = patternMatcher.calculateScore(signals, config);
      console.log(`🎯 Score: ${score}/100`);

      // Show sample findings
      if (findings.length > 0) {
        console.log('\n📝 Sample findings:');
        findings.slice(0, 3).forEach((finding, index) => {
          console.log(`  ${index + 1}. ${finding.title}`);
          console.log(`     ${finding.description}`);
          console.log(`     Priority: ${finding.priority}, Impact: ${finding.impact}`);
        });
      }

    } catch (error) {
      console.log(`❌ Error testing ${moduleId}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n🎉 Pattern system test completed!');
}

/**
 * Test individual pattern matching
 */
export async function testIndividualPatterns() {
  console.log('🔬 Testing Individual Pattern Types...\n');

  const patternMatcher = new PatternMatcher();
  const testHtml = '<div class="faq"><h2>Wat is dit?</h2></div>';
  const $ = cheerio.load(testHtml);

  // Test selector patterns
  const selectorConfig = {
    selectors: {
      faq: {
        patterns: ['[class*="faq" i]', '.nonexistent'],
        description: 'Test FAQ detection',
        impact: 'high' as const
      }
    }
  };

  const selectorSignals = patternMatcher.matchPatterns(testHtml, $, selectorConfig);
  console.log('🎯 Selector test results:', selectorSignals);

  // Test regex patterns
  const regexConfig = {
    regex: {
      questions: {
        patterns: ['\\?', 'wat\\s+is'],
        description: 'Test question detection',
        impact: 'medium' as const,
        flags: 'gi'
      }
    }
  };

  const regexSignals = patternMatcher.matchPatterns(testHtml, $, regexConfig);
  console.log('🎯 Regex test results:', regexSignals);

  console.log('\n✅ Individual pattern tests completed!');
}

// Export voor gebruik in andere bestanden
export { PatternMatcher, PatternConfigLoader }; 